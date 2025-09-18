package middleware

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORS returns a CORS middleware
func CORS() gin.HandlerFunc {
	config := cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:3002",
			"http://localhost:3003",
			"http://127.0.0.1:3000",
			"http://15.165.105.250:3000",
			"http://13.209.84.93:3000",
			"https://monsta.ai",
			"https://www.monsta.ai",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"PATCH",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
			"X-Requested-With",
			"X-API-Key",
		},
		ExposeHeaders: []string{
			"Content-Length",
			"Content-Type",
			"X-Request-Id",
		},
		AllowCredentials: true,
		MaxAge:          12 * time.Hour,
	}

	return cors.New(config)
}