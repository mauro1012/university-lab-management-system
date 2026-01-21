output "rds_endpoint" {
  description = "El endpoint de la base de datos (host:puerto)"
  value       = aws_db_instance.this.endpoint
}

output "db_user" {
  description = "El nombre del usuario administrador"
  value       = var.db_user
}

output "db_password" {
  description = "La contraseña del administrador"
  value       = var.db_password
  sensitive   = true 
}