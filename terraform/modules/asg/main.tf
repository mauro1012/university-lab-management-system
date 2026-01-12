
# Security Group - ASG


resource "aws_security_group" "asg" {
  name        = "${var.env}-${var.service_name}-asg-sg"
  description = "App instances SG"
  vpc_id      = var.vpc_id

  ingress {
    description     = "App traffic from ALB"
    from_port       = 8080
    to_port         = 8080
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

  tags = {
    Name = "${var.env}-${var.service_name}-asg-sg"
  }
}


# Launch Template


resource "aws_launch_template" "this" {
  name_prefix   = "${var.env}-${var.service_name}-lt"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [
    aws_security_group.asg.id
  ]

  block_device_mappings {
    device_name = "/dev/xvda"

    ebs {
      volume_size           = 40
      volume_type           = "gp3"
      delete_on_termination = true
    }
  }

  user_data = base64encode(<<EOF
#!/bin/bash
set -e

IMAGE="${var.docker_image}"

yum update -y
yum install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

docker pull $IMAGE
docker stop ${var.service_name} || true
docker rm ${var.service_name} || true

docker run -d \
  --name ${var.service_name} \
  -p 8080:8080 \
  --restart always \
  -e DATABASE_URL="postgresql://dummy:dummy@localhost:5432/db" \
  -e JWT_SECRET="temp-secret" \
  $IMAGE
EOF
  )

  lifecycle {
    create_before_destroy = true
  }
}


# Auto Scaling Group


resource "aws_autoscaling_group" "this" {
  name = "${var.env}-${var.service_name}-asg"

  desired_capacity = var.desired_capacity
  min_size         = var.min_size
  max_size         = var.max_size

  vpc_zone_identifier = var.private_subnets

  target_group_arns = [
    var.alb_target_group
  ]

  launch_template {
    id      = aws_launch_template.this.id
    version = "$Latest"
  }

  health_check_type         = "ELB"
  health_check_grace_period = 180

  tag {
    key                 = "Name"
    value               = "${var.env}-${var.service_name}"
    propagate_at_launch = true
  }

  lifecycle {
    ignore_changes = [desired_capacity]
  }
}
