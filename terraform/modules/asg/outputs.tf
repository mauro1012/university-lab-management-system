output "asg_name" {
  value = aws_autoscaling_group.this.name
}

output "asg_security_group_id" {
  description = "El ID del Security Group de las instancias para que la DB le abra paso"
  value       = aws_security_group.asg.id
}
