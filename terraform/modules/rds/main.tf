# Grupo de subnets donde vivirá la DB (Subnets privadas)
resource "aws_db_subnet_group" "this" {
  name       = "${var.env}-rds1-subnet-group"
  subnet_ids = var.private_subnets

  tags = { Name = "${var.env}-rds-sng" }
}

# Security Group para la base de datos
resource "aws_security_group" "rds_sg" {
  name        = "${var.env}-rds-sg"
  description = "Permitir trafico desde las instancias de la App"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.asg_security_group_id] # Solo entra tráfico del ASG
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.bastion_security_group_id] # <--- Esta es la clave
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Instancia de Base de Datos RDS
resource "aws_db_instance" "this" {
  identifier           = "${var.env}-university-db"
  engine               = "postgres"
  engine_version       = "15.10"
  instance_class       = "db.t3.micro" # Capa gratuita / Económica
  allocated_storage    = 20
  db_name              = var.db_name
  username             = var.db_user
  password             = var.db_password
  
  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  
  publicly_accessible  = false # Seguridad: solo accesible internamente
  skip_final_snapshot  = true
  multi_az             = false # Para QA no necesitamos alta disponibilidad (ahorro de costos)

  tags = { Name = "${var.env}-database" }
}

