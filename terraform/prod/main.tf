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

