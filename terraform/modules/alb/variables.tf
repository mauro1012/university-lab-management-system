variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnets" {
  description = "Public subnets for ALB"
  type        = list(string)
}
variable "env" {
  description = "Environment name"
  type = string
}

variable "service_name" {
  description = "Service Name"
  type = string
}