variable "environment" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "bastion_ami_id" {
  type = string
}

variable "bastion_key_name" {
  type = string
}

variable "key_name" {
  type = string
}

# Estas son las que faltaban en tus errores
variable "database_url" {
  type      = string
  sensitive = true
}

variable "auth_port" {
  type    = number
  default = 3000
}

variable "resource_port" {
  type    = number
  default = 3001
}

variable "database_url" { type = string }
variable "app_port"     { type = number }
variable "environment"  { type = string }
variable "key_name"     { type = string }