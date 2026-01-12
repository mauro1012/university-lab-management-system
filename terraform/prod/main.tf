
# VPC


module "vpc" {
  source     = "../modules/vpc"
  name       = "prod-vpc"
  cidr_block = var.vpc_cidr
}


# NAT


module "nat" {
  source = "../modules/nat"

  name                  = "prod"
  vpc_id                = module.vpc.vpc_id
  public_subnet_id       = module.vpc.public_subnets[0]
  private_route_table_id = module.vpc.private_route_table_id
}


# ALB


module "alb" {
  source = "../modules/alb"

  env             = "prod"
  service_name    = "base-service"
  vpc_id          = module.vpc.vpc_id
  public_subnets  = module.vpc.public_subnets
}



# Bastion


module "bastion" {
  source = "../modules/bastion"

  env           = "prod"
  vpc_id        = module.vpc.vpc_id
  public_subnet = module.vpc.public_subnets[0]

  ami_id        = var.bastion_ami_id
  instance_type = var.instance_type
  key_name      = var.bastion_key_name
}



# ASG - BASE SERVICE


module "asg_base_service" {
  source = "../modules/asg"

  env          = "prod"
  service_name = "base-service"
  docker_image = "mauro28102023/base-service:prod"

  desired_capacity = 3
  min_size         = 2
  max_size         = 5

  instance_type = "t3.micro"
  key_name      = "prod-key"

  vpc_id                   = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets
  alb_security_group_id     = module.alb.security_group_id
  alb_target_group          = module.alb.target_group_arn
  bastion_security_group_id = module.bastion.security_group_id
}
