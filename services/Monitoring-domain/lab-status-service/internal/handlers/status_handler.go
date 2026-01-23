package handlers

import (
	"lab-status-service/internal/database"
	"lab-status-service/internal/models"
	"net/http"
	"time"
	"github.com/gin-gonic/gin"
)

// Inicia la sesión y marca como BUSY con expiración automática (TTL)
func CheckIn(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Duration int `json:"duration"` // Minutos de clase
	}
	
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos o duración no especificada"})
		return
	}

	// Validamos que la duración sea positiva
	if input.Duration <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La duración debe ser mayor a 0 minutos"})
		return
	}

	// Se guarda en Redis: al expirar el tiempo, el lab vuelve a estar "AVAILABLE"
	err := database.RedisClient.Set(database.Ctx, "lab:"+id, "BUSY", time.Duration(input.Duration)*time.Minute).Err()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo conectar con el motor de estado (Redis)"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "BUSY", "message": "Laboratorio marcado como ocupado"})
}

// Consulta de disponibilidad para estudiantes (Sin Auth)
func GetPublicStatus(c *gin.Context) {
	id := c.Param("id")
	val, err := database.RedisClient.Get(database.Ctx, "lab:"+id).Result()
	
	status := "AVAILABLE"
	timeLeft := 0

	if err == nil && val == "BUSY" {
		status = "BUSY"
		// Obtenemos el tiempo restante real desde Redis
		ttl, _ := database.RedisClient.TTL(database.Ctx, "lab:"+id).Result()
		if ttl > 0 {
			timeLeft = int(ttl.Minutes())
		}
	}

	c.JSON(http.StatusOK, models.LabStatus{
		ID:       id,
		Status:   status,
		TimeLeft: timeLeft,
	})
}

// Libera el laboratorio manualmente (Check-Out)
func CheckOut(c *gin.Context) {
    id := c.Param("id")

    // Borramos la llave de Redis para que el estado vuelva a ser "AVAILABLE"
    err := database.RedisClient.Del(database.Ctx, "lab:"+id).Err()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo liberar el laboratorio en Redis"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": "AVAILABLE", "message": "Laboratorio liberado con éxito"})
}