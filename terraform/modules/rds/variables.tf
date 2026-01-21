# --- Identificación ---
variable "env" {
  description = "Ambiente de despliegue (ej. qa, prod)"
  type        = string
}

# --- Configuración de Red ---
variable "vpc_id" {
  description = "ID de la VPC donde se desplegará la base de datos"
  type        = string
}

variable "private_subnets" {
  description = "Lista de IDs de las subredes privadas para el Subnet Group de RDS"
  type        = list(string)
}

# --- Seguridad (Accesos) ---
variable "asg_security_group_id" { 
  description = "ID del Security Group de los microservicios para permitirles acceso al puerto 5432"
  type        = string 
}

variable "bastion_security_group_id" {
  description = "ID del Security Group del Bastion para permitir el túnel SSH durante migraciones"
  type        = string
}

# --- Parámetros de la Base de Datos ---
variable "db_name" {
  description = "Nombre de la base de datos inicial"
  type        = string
  default     = "university_db"
}

variable "db_user" {
  description = "Nombre del usuario administrador"
  type        = string
}

variable "db_password" {
  description = "Contraseña del administrador de la base de datos"
  type        = string
  sensitive   = true # <--- CRÍTICO: Evita que la clave aparezca en los logs
}