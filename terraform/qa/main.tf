
# VPC

module "vpc" {
  source = "../modules/vpc"

  name       = "qa-vpc"
  cidr_block = var.vpc_cidr
}


# ALB

module "alb" {
  source = "../modules/alb"

  vpc_id         = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnets
}


# ASG

module "asg" {
  source = "../modules/asg"

  private_subnets  = module.vpc.private_subnets
  alb_target_group = module.alb.target_group_arn
  instance_type    = var.instance_type
}


# Bastion

module "bastion" {
  source = "../modules/bastion"

  environment   = var.environment
  instance_type = var.instance_type
  ami_id        = var.bastion_ami_id
  key_name      = var.bastion_key_name
  public_subnet = module.vpc.public_subnets[0]
}
