package middleware

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// CORS returns a CORS middleware
func CORS() gin.HandlerFunc {
	config := cors.Config{
		AllowOriginFunc: func(origin string) bool {
			// 개발 환경에서 모든 localhost와 127.0.0.1 포트 허용
			return true // 개발 중에는 모든 origin 허용 (프로덕션에서는 제한 필요)
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