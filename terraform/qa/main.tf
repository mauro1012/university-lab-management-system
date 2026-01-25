# 1. Red y Conectividad Base
module "vpc" {
  source     = "../modules/vpc"
  name       = "qa-vpc"
  cidr_block = var.vpc_cidr
}

module "nat" {
  source                 = "../modules/nat"
  name                   = "qa"
  vpc_id                 = module.vpc.vpc_id
  public_subnet_id       = module.vpc.public_subnets[0]
  private_route_table_id = module.vpc.private_route_table_id
}

# 2. Infraestructura de Acceso y Balanceo
module "bastion" {
  source        = "../modules/bastion"
  env           = var.environment
  vpc_id        = module.vpc.vpc_id
  public_subnet = module.vpc.public_subnets[0]
  ami_id        = var.bastion_ami_id
  instance_type = var.instance_type
  key_name      = var.bastion_key_name
}

module "alb" {
  source         = "../modules/alb"
  env            = var.environment
  service_name   = "university-lab"
  vpc_id         = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnets
}

# 4. Microservicios (ASG)
module "asg_auth" {
  source       = "../modules/asg"
  env          = var.environment
  service_name = "auth-service"
  docker_image = var.docker_image_auth
  app_port     = 3000
  
  # Credenciales de Docker Hub (PASO CRÍTICO)
  docker_username = var.docker_username
  docker_password = var.docker_password
  
  database_url = "postgresql://${var.db_user}:${var.db_password}@${module.database.rds_endpoint}/${var.db_name}"
  
  instance_type    = var.instance_type
  key_name         = var.key_name
  desired_capacity = 1
  min_size         = 1
  max_size         = 2

  vpc_id                    = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets
  alb_security_group_id     = module.alb.security_group_id
  alb_target_group          = module.alb.auth_target_group_arn 
  bastion_security_group_id = module.bastion.security_group_id
}

module "asg_resource" {
  source       = "../modules/asg"
  env          = var.environment
  service_name = "resource-service"
  docker_image = var.docker_image_resource
  app_port     = 3001
  
  # Credenciales de Docker Hub (PASO CRÍTICO)
  docker_username = var.docker_username
  docker_password = var.docker_password
  
  database_url = "postgresql://${var.db_user}:${var.db_password}@${module.database.rds_endpoint}/${var.db_name}"

  instance_type    = var.instance_type
  key_name         = var.key_name
  desired_capacity = 1
  min_size         = 1
  max_size         = 2

  vpc_id                    = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets
  alb_security_group_id     = module.alb.security_group_id
  alb_target_group          = module.alb.resource_target_group_arn 
  bastion_security_group_id = module.bastion.security_group_id
}

module "asg_lab_status" {
  source       = "../modules/asg"
  env          = var.environment
  service_name = "lab-status-service"
  docker_image = var.docker_image_status 
  app_port     = 8081
  
  # Credenciales de Docker Hub (PASO CRÍTICO)
  docker_username = var.docker_username
  docker_password = var.docker_password
  
  database_url = "" 

  instance_type    = var.instance_type
  key_name         = var.key_name
  desired_capacity = 1
  min_size         = 1
  max_size         = 2

  vpc_id                    = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets
  alb_security_group_id     = module.alb.security_group_id
  alb_target_group          = module.alb.lab_status_target_group_arn 
  bastion_security_group_id = module.bastion.security_group_id
}

# 3. Base de Datos Centralizada (RDS)
module "database" {
  source                    = "../modules/rds"
  env                       = var.environment
  vpc_id                    = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets
  
  asg_security_group_ids    = [
    module.asg_auth.asg_security_group_id,
    module.asg_resource.asg_security_group_id
  ]

  bastion_security_group_id = module.bastion.security_group_id

  db_name     = var.db_name
  db_user     = var.db_user
  db_password = var.db_password
}