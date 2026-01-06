output "bastion_id" {
  value = aws_instance.this.id
}

output "public_ip" {
  description = "Public IP of the Bastion Host"
  value       = aws_instance.this.public_ip
}
