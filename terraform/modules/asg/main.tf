resource "aws_security_group" "asg" {
  name   = "qa-asg-sg"
  vpc_id = var.vpc_id

  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [var.alb_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


resource "aws_launch_template" "this" {
  name_prefix   = "qa-base-service-"
  instance_type = var.instance_type
  image_id      = data.aws_ami.amazon_linux.id

  vpc_security_group_ids = [
    aws_security_group.asg.id
  ]

  user_data = base64encode(<<EOF
#!/bin/bash
set -e

IMAGE="mauro28102023/base-service:qa"

yum update -y
yum install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

docker pull $IMAGE
docker stop base-service || true
docker rm base-service || true

docker run -d \
  --name base-service \
  -p 8080:8080 \
  --restart always \
  $IMAGE
EOF
  )

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_autoscaling_group" "this" {
  name = "qa-base-service-asg"

  desired_capacity = 2
  min_size         = 1
  max_size         = 3

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
    value               = "qa-base-service"
    propagate_at_launch = true
  }

  lifecycle {
    ignore_changes = [desired_capacity]
  }
}
