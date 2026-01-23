# 1. Security Group para el ALB
resource "aws_security_group" "alb" {
  name_prefix = "${var.env}-alb-sg-"
  description = "Public HTTP access for ALB"
  vpc_id      = var.vpc_id

  ingress {
    description = "Allow HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow Go Microservice"
    from_port   = 8081
    to_port     = 8081
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

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

# 3. Target Group para Auth Service (Puerto 3000)
resource "aws_lb_target_group" "auth" {
  name     = "${var.env}-auth-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    # Cambiado para coincidir con app.setGlobalPrefix('auth')
    path                = "/auth/health" 
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

# 4. Target Group para Resource Service (Puerto 3001)
resource "aws_lb_target_group" "resource" {
  name     = "${var.env}-resource-tg"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    # Cambiado para coincidir con app.setGlobalPrefix('resource')
    path                = "/resource/health" 
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

# 5.Target Group para Lab Status (Go)
resource "aws_lb_target_group" "lab_status" {
  name     = "${var.env}-lab-status-tg"
  port     = 8081
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/health" # Asegúrate de que tu Go tenga esta ruta o usa "/"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
  }
}


# 6. Listener principal
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

# Nuevo Listener específico para el puerto 8081
resource "aws_lb_listener" "go_microservice" {
  load_balancer_arn = aws_lb.this.arn
  port              = 8081
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.lab_status.arn
  }
}

# 6. Regla de ruteo para Auth
resource "aws_lb_listener_rule" "auth_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.auth.arn
  }
  condition {
    path_pattern {
      values = ["/auth/*"]
    }
  }
}

# 7. Regla de ruteo para Resource
resource "aws_lb_listener_rule" "resource_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 110
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.resource.arn
  }
  condition {
    path_pattern {
      # Mantenemos las rutas consistentes con el prefijo /resource/
      values = ["/resource/*", "/laboratories/*", "/assignments/*"]
    }
  }
}