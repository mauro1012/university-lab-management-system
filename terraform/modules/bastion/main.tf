resource "aws_security_group" "bastion" {
  name        = "bastion-group"
  description = "SSH access to bastion"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH from anywhere (QA)"
    from_port   = 22
    to_port     = 22
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
    Name = "bastion-group"
  }
}

resource "aws_security_group" "asg" {
  name        = "qa-asg-sg"
  description = "App instances SG"
  vpc_id      = var.vpc_id

  # App traffic from ALB
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [var.alb_sg_id]
  }

  # SSH only from Bastion
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [var.bastion_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "qa-asg-sg"
  }
}
