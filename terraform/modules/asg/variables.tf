variable "vpc_id" {
  type = string
}

variable "private_subnets" {
  type = list(string)
}

variable "instance_type" {
  type = string
}

variable "alb_target_group" {
  type = string
}

variable "alb_security_group_id" {
  type = string
}

variable "bastion_security_group_id" {
  type = string
}

variable "key_name" {
  type = string
}

