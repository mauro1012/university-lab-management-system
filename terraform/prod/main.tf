module "vpc" {
  source = "../modules/vpc"

  name       = "prod-vpc"
  cidr_block = var.vpc_cidr
}

module "alb" {
  source = "../modules/alb"

  vpc_id         = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnets
}

module "asg" {
  source = "../modules/asg"

  private_subnets  = module.vpc.private_subnets
  alb_target_group = module.alb.target_group_arn
  instance_type    = var.instance_type
}

module "bastion" {
  source = "../modules/bastion"

  public_subnet = module.vpc.public_subnets[0]
  ami_id        = var.ami_id
  key_name      = var.key_name
}
