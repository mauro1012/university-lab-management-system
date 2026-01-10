
# VPC

module "vpc" {
  source = "../modules/vpc"
  name       = "qa-vpc"
  cidr_block = var.vpc_cidr
}

module "nat" {
  source = "./modules/nat"

  name                    = "project"
  vpc_id                  = module.vpc.vpc_id
  public_subnet_id         = module.vpc.public_subnets[0]
  private_route_table_id   = module.vpc.private_route_table_id
}


# ALB

module "alb" {
  source = "../modules/alb"
  vpc_id         = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnets
}


# Bastion

module "bastion" {
  source = "../modules/bastion"

  vpc_id        = module.vpc.vpc_id
  public_subnet = module.vpc.public_subnets[0]

  ami_id        = var.bastion_ami_id
  instance_type = var.instance_type
  key_name      = var.bastion_key_name
}

# ASG

module "asg" {
  source = "../modules/asg"

  vpc_id                   = module.vpc.vpc_id
  private_subnets           = module.vpc.private_subnets

  alb_target_group          = module.alb.target_group_arn
  alb_security_group_id     = module.alb.security_group_id
  bastion_security_group_id = module.bastion.security_group_id

  instance_type = var.instance_type
  key_name      = var.key_name
}




