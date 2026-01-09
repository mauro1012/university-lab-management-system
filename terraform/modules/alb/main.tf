resource "aws_security_group" "alb" {
  name        = "qa-alb-sg"
  description = "Security group for QA ALB"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "qa-alb-sg"
    Environment = "qa"
  }
}

resource "aws_lb" "this" {
  name               = "qa-app-alb"
  load_balancer_type = "application"
  internal           = false

  subnets         = var.public_subnets
  security_groups = [aws_security_group.alb.id]

  tags = {
    Name        = "qa-app-alb"
    Environment = "qa"
  }
}

resource "aws_lb_target_group" "this" {
  name     = "qa-base-service-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Name        = "qa-base-service-tg"
    Environment = "qa"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
}
