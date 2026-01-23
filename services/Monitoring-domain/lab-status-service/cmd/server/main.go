package main

import (
	"lab-status-service/internal/database"
	"lab-status-service/internal/handlers"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Inicializar la conexión a Redis
	database.InitRedis()

	// 2. Configurar el servidor Gin
	r := gin.Default()

	// --- AGREGAR ESTO PARA EL CORS ---
    r.Use(func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*") // En producción usa tu URL de Vercel
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PATCH, DELETE")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    })

	// 3. Definir las rutas del microservicio
	// Nota: El profesor usa POST para el Check-in y el estudiante GET para consultar
	r.POST("/checkin/:id", handlers.CheckIn)
	r.POST("/checkout/:id", handlers.CheckOut)
	r.GET("/public/status/:id", handlers.GetPublicStatus)
	r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{
			"status": "UP",
			"service": "lab-status-service",	
		})
    })

	// 4. Arrancar el servidor en el puerto 8080 (interno del contenedor)
	r.Run(":8080")
}