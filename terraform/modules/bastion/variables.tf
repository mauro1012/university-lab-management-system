variable "environment" {
  type        = string
  description = "Environment name (qa, prod)"
}

variable "instance_type" {
  type        = string
  description = "Instance type for bastion"
}

variable "ami_id" {
  type        = string
  description = "AMI for bastion host"
}

variable "key_name" {
  type        = string
  description = "SSH key pair name"
}

variable "public_subnet" {
  type        = string
  description = "Public subnet ID"
}
