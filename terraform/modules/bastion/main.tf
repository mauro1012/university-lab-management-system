resource "aws_instance" "this" {
  ami           = var.ami_id
  instance_type = "t3.micro"
  subnet_id     = var.public_subnet
  key_name      = aws_key_pair.this.key_name

  tags = {
    Name = "qa-bastion"
  }
}
