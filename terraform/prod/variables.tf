variable "environment" {
  description = "Environment name (prod)"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "instance_type" {
  description = "Default EC2 instance type"
  type        = string
}
