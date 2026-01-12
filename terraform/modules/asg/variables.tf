variable "env" {}
variable "service_name" {}
variable "docker_image" {}

variable "desired_capacity" {}
variable "min_size" {}
variable "max_size" {}

variable "instance_type" {}
variable "key_name" {}

variable "vpc_id" {}
variable "private_subnets" {}

variable "alb_security_group_id" {}
variable "alb_target_group" {}
variable "bastion_security_group_id" {}
