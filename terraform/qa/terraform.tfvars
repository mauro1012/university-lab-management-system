# --- Identificación de Ambiente ---
environment = "qa"

# --- Configuración de Red ---
vpc_cidr = "10.0.0.0/16"

# --- Configuración de Instancias EC2 ---
instance_type    = "t3.micro"
key_name         = "fisrkeys"
bastion_key_name = "fisrkeys"
bastion_ami_id   = "ami-0c02fb55956c7d316" # Amazon Linux 2023 en us-east-1

# --- Variables de Microservicios (Nuevas) ---
# Esto ayuda a que el main.tf de QA sepa qué imágenes y puertos usar
docker_image_auth     = "mauro28102023/auth-service:qa"
docker_image_resource = "mauro28102023/resource-service:qa"

# --- Configuración de Base de Datos RDS ---
db_name     = "university_db"
db_user     = "dbadmin"
db_password = "UnivLab_2026_Secure" 