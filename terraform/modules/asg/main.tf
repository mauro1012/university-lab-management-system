# 1. Security Group del ASG
resource "aws_security_group" "asg" {
  name_prefix = "${var.env}-${var.service_name}-asg-sg-"
  description = "Security group for ${var.service_name}"
  vpc_id      = var.vpc_id

  ingress {
    description     = "App traffic from ALB"
    from_port       = var.app_port
    to_port         = var.app_port
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  ingress {
    description     = "SSH only from Bastion"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [var.bastion_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = { Name = "${var.env}-${var.service_name}-asg-sg" }
}

# 2. Launch Template con Disco de 20GB y Login de Docker
resource "aws_launch_template" "this" {
  name_prefix   = "${var.env}-${var.service_name}-lt-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [aws_security_group.asg.id]

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = 20
      volume_type           = "gp3"
      delete_on_termination = true
    }
  }

  user_data = base64encode(<<EOF
#!/bin/bash
# Redirigir salida a log para debug
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
set -e

# Variables inyectadas por Terraform
IMAGE="${var.docker_image}"
PORT="${var.app_port}"
DB_URL="${var.database_url}"
SERVICE="${var.service_name}"
DOCKER_USER="${var.docker_username}"
DOCKER_PASS="${var.docker_password}"

echo "Iniciando despliegue para $SERVICE..."

# Instalación de Docker
yum update -y
yum install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# Autenticación en Docker Hub
echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

# Instalación de Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Crear carpeta de la app y entrar en ella
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

if [ "$SERVICE" == "lab-status-service" ]; then
  echo "Generando docker-compose.yml para $SERVICE..."
  cat <<EOC > docker-compose.yml
version: '3.8'
services:
  lab-redis:
    image: redis:7-alpine
    container_name: lab-redis
    restart: always
    networks:
      - lab-network

  lab-status-service:
    image: $IMAGE
    container_name: lab-status-service
    restart: always
    ports:
      - "$PORT:8080"
    environment:
      - REDIS_ADDR=lab-redis:6379
      - PORT=8080
    depends_on:
      - lab-redis
    networks:
      - lab-network

networks:
  lab-network:
    driver: bridge
EOC
  /usr/local/bin/docker-compose up -d
else
  echo "Iniciando contenedor simple para $SERVICE..."
  # Pull y ejecución para Auth y Resource
  docker pull $IMAGE
  docker stop $SERVICE || true
  docker rm $SERVICE || true
  
  docker run -d \
    --name $SERVICE \
    -p $PORT:$PORT \
    --restart always \
    -e PORT=$PORT \
    -e DATABASE_URL="$DB_URL" \
    -e JWT_SECRET="temp-secret" \
    $IMAGE
fi
EOF
  )

  lifecycle { create_before_destroy = true }
}

# 3. Auto Scaling Group
resource "aws_autoscaling_group" "this" {
  name                      = "${var.env}-${var.service_name}-asg"
  desired_capacity          = var.desired_capacity
  min_size                  = var.min_size
  max_size                  = var.max_size
  vpc_zone_identifier       = var.private_subnets
  target_group_arns         = [var.alb_target_group]
  health_check_type         = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.this.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.env}-${var.service_name}"
    propagate_at_launch = true
  }
}