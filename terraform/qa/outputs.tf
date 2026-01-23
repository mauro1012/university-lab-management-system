# URL Completa para que los microservicios se conecten internamente
output "rds_url" {
  value     = "postgresql://${var.db_user}:${var.db_password}@${module.database.rds_endpoint}/${var.db_name}"
  sensitive = true
}

# DNS del Balanceador (Para entrar a App)
output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

# IP Pública del Bastion (Para que el Workflow cree el túnel SSH)
output "bastion_public_ip" {
  value = module.bastion.public_ip 
}

# Host de la Base de Datos (Limpiamos el puerto para el túnel SSH)
output "rds_endpoint" {
  value = split(":", module.database.rds_endpoint)[0]
}

# DNS del Balanceador para el Microservicio de Go
output "go_api_endpoint" {
  value = "http://${module.alb.alb_dns_name}:8081"
  description = "Endpoint público para el microservicio de Go"
}