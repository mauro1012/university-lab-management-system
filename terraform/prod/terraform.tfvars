environment      = "prod"
vpc_cidr         = "10.10.0.0/16"
instance_type    = "t3.micro"
bastion_ami_id   = "ami-0c02fb55956c7d316"
bastion_key_name = "fisrkeys"
key_name         = "fisrkeys"

# Valores para los errores de la imagen
database_url     = "postgresql://usuario:password@endpoint-rds:5432/db_name"
auth_port        = 3000
resource_port    = 3001