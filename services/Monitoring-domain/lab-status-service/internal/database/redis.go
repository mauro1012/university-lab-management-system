package database

import (
	"context"
	"os" // Nueva importación para leer variables de entorno
	"github.com/go-redis/redis/v8"
)

var Ctx = context.Background()
var RedisClient *redis.Client

func InitRedis() {
	// Intentamos leer la dirección desde el docker-compose
	// Si no existe, usamos "lab-redis:6379" como respaldo
	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		addr = "lab-redis:6379"
	}

	RedisClient = redis.NewClient(&redis.Options{
		Addr: addr, 
		DB:   0,
	})
}