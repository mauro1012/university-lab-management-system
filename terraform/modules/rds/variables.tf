variable "env" { type = string }
variable "vpc_id" { type = string }
variable "private_subnets" { type = list(string) }
variable "asg_security_group_id" { 
  description = "SG de las apps para permitirles entrar a la DB"
  type = string 
}
variable "db_name" { type = string }
variable "db_user" { type = string }
variable "db_password" { type = string }