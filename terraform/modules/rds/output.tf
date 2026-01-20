
output "db_endpoint" {
  value = aws_db_instance.this.endpoint
}

output "db_user" {
  value = var.db_user
}

output "db_password" {
  value = var.db_password
}