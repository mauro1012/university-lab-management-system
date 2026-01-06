variable "vpc_cidr" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "ami_id" {
  type = string
}

variable "key_name" {
  type = string
}

variable "bastion_key_name" {
  description = "SSH key for bastion"
  type        = string
}
