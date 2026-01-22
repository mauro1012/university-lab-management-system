# DNS del Balanceador (Es la URL que pondrás en el Frontend)
output "alb_dns_name" {
  description = "URL principal para acceder a la API"
  value       = module.alb.dns_name
}

# IDs de la VPC y Subnets (Útil para debug)
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "private_subnets" {
  value = module.vpc.private_subnets
}

# IP del Bastion para conexión SSH
output "bastion_public_ip" {
  description = "IP para entrar al Bastion y saltar a los microservicios"
  value       = module.bastion.public_ip
}

# Status de los Target Groups (Para verificar salud en AWS)
output "auth_target_group_arn" {
  value = module.alb.auth_target_group_arn
}

output "resource_target_group_arn" {
  value = module.alb.resource_target_group_arn
}