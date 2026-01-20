# --- Variables de Identificación ---
variable "env" {
  description = "Ambiente de despliegue (qa, prod)"
  type        = string
}

variable "service_name" {
  description = "Nombre del microservicio (auth-service, resource-service)"
  type        = string
}

# --- Variables de Aplicación (Nuevas y Necesarias) ---
variable "docker_image" {
  description = "Imagen de Docker Hub a desplegar"
  type        = string
}

variable "app_port" {
  description = "Puerto en el que corre la aplicación (3000 o 3001)"
  type        = number
}

variable "database_url" {
  description = "URL de conexión a la base de datos PostgreSQL"
  type        = string
}

variable "jwt_secret" {
  description = "Secreto para la validación de tokens JWT"
  type        = string
  default     = "temp-secret-key-123"
}

# --- Variables de Infraestructura EC2 ---
variable "instance_type" {
  description = "Tipo de instancia EC2 (ej: t3.micro)"
  type        = string
}

variable "key_name" {
  description = "Nombre de la llave SSH para acceder a la instancia"
  type        = string
}

# --- Variables de Auto Scaling ---
variable "desired_capacity" {
  type = number
}

variable "min_size" {
  type = number
}

variable "max_size" {
  type = number
}

# --- Variables de Red y Seguridad ---
variable "vpc_id" {
  description = "ID de la VPC"
  type        = string
}

variable "private_subnets" {
  description = "Lista de subnets privadas para el ASG"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security Group del Load Balancer para permitir tráfico"
  type        = string
}

variable "alb_target_group" {
  description = "ARN del Target Group del ALB"
  type        = string
}

variable "bastion_security_group_id" {
  description = "Security Group del Bastion para permitir SSH"
  type        = string
}