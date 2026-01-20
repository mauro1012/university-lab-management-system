# URL Completa para que Prisma se conecte (Usada en el Workflow)
output "rds_url" {
  value     = "postgresql://${var.db_user}:${var.db_password}@${module.database.db_endpoint}/university_db"
  sensitive = true 
}

# DNS del Balanceador (Para entrar a tu App desde el navegador)
output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

# IP Pública del Bastion (Para que el Workflow cree el túnel SSH)
output "bastion_public_ip" {
  value = module.bastion.public_ip 
}

# Host de la Base de Datos (Para el túnel SSH)
output "rds_endpoint" {
  value = module.database.db_endpoint
}