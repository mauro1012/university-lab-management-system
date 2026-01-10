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


