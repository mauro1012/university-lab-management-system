variable "vpc_cidr" {
  type        = string
  description = "CIDR block for prod VPC"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type"
}

variable "ami_id" {
  type        = string
  description = "AMI for bastion host"
}

variable "key_name" {
  type        = string
  description = "SSH key name for bastion"
}
