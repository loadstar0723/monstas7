package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// RateLimiter stores rate limit data
type RateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
}

// visitor tracks request count per IP
type visitor struct {
	count    int
	lastSeen time.Time
}

var limiter = &RateLimiter{
	visitors: make(map[string]*visitor),
}

// cleanupVisitors removes old entries
func (rl *RateLimiter) cleanupVisitors() {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	for ip, v := range rl.visitors {
		if time.Since(v.lastSeen) > time.Minute {
			delete(rl.visitors, ip)
		}
	}
}

// getVisitor retrieves or creates a visitor
func (rl *RateLimiter) getVisitor(ip string) *visitor {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	v, exists := rl.visitors[ip]
	if !exists {
		rl.visitors[ip] = &visitor{
			count:    0,
			lastSeen: time.Now(),
		}
		return rl.visitors[ip]
	}

	// Reset counter if minute has passed
	if time.Since(v.lastSeen) > time.Minute {
		v.count = 0
		v.lastSeen = time.Now()
	}

	return v
}

// RateLimit middleware limits requests per IP
func RateLimit() gin.HandlerFunc {
	// Cleanup old visitors periodically
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()

		for range ticker.C {
			limiter.cleanupVisitors()
		}
	}()

	return func(c *gin.Context) {
		ip := c.ClientIP()
		v := limiter.getVisitor(ip)

		// Check rate limit (60 requests per minute)
		if v.count >= 60 {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded",
				"retry_after": 60 - int(time.Since(v.lastSeen).Seconds()),
			})
			c.Abort()
			return
		}

		// Increment counter
		limiter.mu.Lock()
		v.count++
		limiter.mu.Unlock()

		c.Next()
	}
}