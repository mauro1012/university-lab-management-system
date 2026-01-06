output "alb_dns_name" {
  value = module.alb.alb_dns_name
}

output "ecr_repository" {
  value = module.ecr.repository_url
}
