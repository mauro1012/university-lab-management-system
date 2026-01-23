output "alb_dns_name" {
  description = "DNS del Load Balancer para configurar en el Frontend"
  value       = aws_lb.this.dns_name
}

output "auth_target_group_arn" {
  description = "ARN del Target Group para el servicio de Auth"
  value       = aws_lb_target_group.auth.arn
}

output "resource_target_group_arn" {
  description = "ARN del Target Group para el servicio de Inventario/Resource"
  value       = aws_lb_target_group.resource.arn
}

output "security_group_id" {
  description = "ID del Security Group del ALB"
  value       = aws_security_group.alb.id
}

output "lab_status_target_group_arn" {
  value = aws_lb_target_group.lab_status.arn
}