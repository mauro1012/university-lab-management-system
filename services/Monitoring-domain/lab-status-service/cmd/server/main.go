package main

import (
	"context"
	"lab-status-service/internal/database"
	"lab-status-service/internal/handlers"
	"net/http"

	"github.com/gin-gonic/gin"
)

var ctx = context.Background()

// --- FUNCIÓN PARA LA VISTA PÚBLICA ---
func GetAllLabsStatus(c *gin.Context) {
	// 1. Usamos database.RedisClient y database.Ctx que son los nombres en tu redis.go
	iter := database.RedisClient.Scan(database.Ctx, 0, "lab:*", 0).Iterator()

	type LabStatus struct {
		ID      string `json:"id"`
		Minutes int64  `json:"minutes"`
	}

	statuses := []LabStatus{}

	for iter.Next(database.Ctx) {
		key := iter.Val()
		// Usamos database.RedisClient y database.Ctx 
		duration, err := database.RedisClient.TTL(database.Ctx, key).Result()
		if err != nil {
			continue
		}

		// Extraemos el ID después de "lab:"
		id := key[4:]

		statuses = append(statuses, LabStatus{
			ID:      id,
			Minutes: int64(duration.Minutes()),
		})
	}

	if err := iter.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error consultando Redis"})
		return
	}

	c.JSON(http.StatusOK, statuses)
}

func main() {
	// 1. Inicializar la conexión a Redis
	database.InitRedis()

	// 2. Configurar el servidor Gin
	r := gin.Default()

	// --- AGREGAR ESTO PARA EL CORS ---
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*") 
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PATCH, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 3. Definir las rutas del microservicio
	r.POST("/checkin/:id", handlers.CheckIn)
	r.POST("/checkout/:id", handlers.CheckOut)
	r.GET("/public/status/:id", handlers.GetPublicStatus)

	// --- NUEVA RUTA PUBLIC PAGES ---
	r.GET("/public/status/all", GetAllLabsStatus)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "UP",
			"service": "lab-status-service",
		})
	})

	// 4. Arrancar el servidor en el puerto 8080
	r.Run(":8080")
}