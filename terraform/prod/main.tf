# VPC: La red base para todos los servicios
module "vpc" {
  source     = "../modules/vpc"
  name       = "prod-vpc"
  cidr_block = var.vpc_cidr
}

# NAT: Para que los servicios privados salgan a internet (descarga de paquetes, etc.)
module "nat" {
  source = "../modules/nat"

  name                   = "prod"
  vpc_id                 = module.vpc.vpc_id
  public_subnet_id       = module.vpc.public_subnets[0]
  private_route_table_id = module.vpc.private_route_table_id
}

# ALB (Load Balancer): El cerebro que reparte el tráfico
# IMPORTANTE: Este módulo debe manejar las reglas de /auth y /resource
module "alb" {
  source = "../modules/alb"

  env             = "prod"
  service_name    = "main-alb"
  vpc_id          = module.vpc.vpc_id
  public_subnets  = module.vpc.public_subnets
}

# Bastion: Para acceso seguro vía SSH a las instancias privadas
module "bastion" {
  source = "../modules/bastion"

  env           = "prod"
  vpc_id        = module.vpc.vpc_id
  public_subnet = module.vpc.public_subnets[0]

  ami_id         = var.bastion_ami_id
  instance_type = var.instance_type
  key_name       = var.bastion_key_name
}

# --- MICROSERVICIO 1: AUTH SERVICE ---
module "asg_auth_service" {
  source = "../modules/asg"

  env          = "prod"
  service_name = "auth-service"
  docker_image = "mauro28102023/auth-service:prod" # Tu imagen de Auth

  desired_capacity = 2
  min_size         = 1
  max_size         = 3

  instance_type = "t3.micro"
  key_name       = "prod-key"

  vpc_id                    = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets
  alb_security_group_id     = module.alb.security_group_id
  
  # Usamos el Target Group de Auth definido en el módulo ALB
  alb_target_group          = module.alb.auth_target_group_arn 
  bastion_security_group_id = module.bastion.security_group_id
}

# --- MICROSERVICIO 2: RESOURCE SERVICE ---
module "asg_resource_service" {
  source = "../modules/asg"

  env          = "prod"
  service_name = "resource-service"
  docker_image = "mauro28102023/resource-service:prod" # Tu imagen de Resources

  desired_capacity = 2
  min_size         = 1
  max_size         = 3

  instance_type = "t3.micro"
  key_name       = "prod-key"

  vpc_id                    = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets
  alb_security_group_id     = module.alb.security_group_id
  
  # Usamos el Target Group de Resources definido en el módulo ALB
  alb_target_group          = module.alb.resource_target_group_arn 
  bastion_security_group_id = module.bastion.security_group_id
}