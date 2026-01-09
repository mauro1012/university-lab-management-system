#!/bin/bash
set -e

IMAGE="docker.io/mauro28102023/base-service:qa"

yum update -y
yum install -y docker

systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

docker pull $IMAGE
docker stop base-service || true
docker rm base-service || true

docker run -d \
  --name base-service \
  -p 8080:8080 \
  --restart always \
  $IMAGE
