# --- Variables Generales ---
variable "environment" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

# --- Variables de Cómputo ---
variable "instance_type" {
  type = string
}

variable "key_name" {
  type = string
}

variable "bastion_key_name" {
  type = string
}

variable "bastion_ami_id" {
  type = string
}

# --- Variables de Base de Datos (Faltaban estas) ---
variable "db_name" {
  type        = string
  description = "Nombre de la base de datos en RDS"
}

variable "db_user" {
  type        = string
  description = "Usuario administrador de la base de datos"
}

variable "db_password" {
  type        = string
  sensitive   = true # Para que no se muestre la clave en texto plano en la consola
}

# --- Variables de Imágenes Docker 
variable "docker_image_auth" {
  type        = string
  description = "URL de la imagen de Docker para Auth"
}

variable "docker_image_resource" {
  type        = string
  description = "URL de la imagen de Docker para Resource"
}

variable "docker_image_status" {
  type        = string
  description = "URL de la imagen de Docker para el microservicio de Go (Lab Status)"
}