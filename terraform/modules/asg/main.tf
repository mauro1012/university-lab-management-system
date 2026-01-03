data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_launch_template" "this" {
  name_prefix   = "app-lt-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type
}

resource "aws_autoscaling_group" "this" {
  desired_capacity = 1
  min_size         = 1
  max_size         = 2

  vpc_zone_identifier = var.private_subnets
  target_group_arns  = [var.alb_target_group]

  launch_template {
    id      = aws_launch_template.this.id
    version = "$Latest"
  }
}
