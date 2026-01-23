# Etapa de compilación
FROM golang:1.21-alpine AS builder
WORKDIR /app

# Copiamos dependencias
COPY go.mod go.sum ./
RUN go mod download

# Copiamos el código fuente local
COPY . .

# Compilamos el binario (ajustado a tu estructura cmd/server)
RUN go build -o main ./cmd/server/main.go

# Etapa de ejecución
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]