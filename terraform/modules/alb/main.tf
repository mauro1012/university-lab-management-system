# 1. Security Group para el ALB (Uso de name_prefix)
resource "aws_security_group" "alb" {
  name_prefix = "${var.env}-alb-sg-" # AWS añadirá un sufijo aleatorio único
  description = "Public HTTP access for ALB"
  vpc_id      = var.vpc_id

  ingress {
    description      = "Allow HTTP from anywhere"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  egress {
    description      = "Allow all outbound traffic"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  # Evita errores al actualizar recursos dependientes
  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.env}-alb-sg"
  }
}

# 2. El Application Load Balancer
resource "aws_lb" "this" {
  name               = "${var.env}-alb"
  load_balancer_type = "application"
  subnets            = var.public_subnets
  security_groups    = [aws_security_group.alb.id]

  tags = {
    Name = "${var.env}-alb"
  }
}

# Target Group para Auth Service (Puerto 3000)
resource "aws_lb_target_group" "auth" {
  name     = "${var.env}-auth-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

# Target Group para Resource Service (Puerto 3001)
resource "aws_lb_target_group" "resource" {
  name     = "${var.env}-resource-tg"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

# Listener principal
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "404: Not Found - No service mapped"
      status_code  = "404"
    }
  }
}

# Reglas de ruteo
resource "aws_lb_listener_rule" "auth_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.auth.arn
  }
  condition {
    path_pattern {
      values = ["/auth/*", "/api/auth/*"]
    }
  }
}

resource "aws_lb_listener_rule" "resource_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 110
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.resource.arn
  }
  condition {
    path_pattern {
      values = ["/resource/*", "/api/resource/*", "/laboratories/*", "/assignments/*"]
    }
  }
}