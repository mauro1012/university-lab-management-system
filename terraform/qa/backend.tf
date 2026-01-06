terraform {
  backend "s3" {
    bucket         = "qa-terraform-state-123456"
    key            = "qa/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks-qa"
    encrypt        = true
  }
}
