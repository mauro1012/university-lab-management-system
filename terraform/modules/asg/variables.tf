variable "private_subnets" {
  description = "Private subnets for ASG"
  type        = list(string)
}

variable "alb_target_group" {
  description = "ALB target group ARN"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}
