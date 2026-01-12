output "alb_dns_name" {
  description = "DNS del Application Load Balancer"
  value       = module.alb.alb_dns_name
}
