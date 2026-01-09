variable "private_subnets" {
  type = list(string)
}

variable "alb_target_group" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "alb_security_group_id" {
  type = string
}
