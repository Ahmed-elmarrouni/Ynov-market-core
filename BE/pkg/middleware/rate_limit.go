package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type ClientLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var (
	mu       sync.Mutex
	limiters = make(map[string]*ClientLimiter)
)

// IP-based Rate Limiter. Provide rate of allowed requests per second, and burst factor
func RateLimiter(r rate.Limit, burst int) gin.HandlerFunc {
	// Background cleanup routine to free memory
	go func() {
		for {
			time.Sleep(time.Minute)
			mu.Lock()
			for ip, client := range limiters {
				if time.Since(client.lastSeen) > 3*time.Minute {
					delete(limiters, ip)
				}
			}
			mu.Unlock()
		}
	}()

	return func(c *gin.Context) {
		ip := c.ClientIP()

		mu.Lock()
		client, exists := limiters[ip]
		if !exists {
			client = &ClientLimiter{
				limiter: rate.NewLimiter(r, burst),
			}
			limiters[ip] = client
		}
		client.lastSeen = time.Now()
		limiter := client.limiter
		mu.Unlock()

		if !limiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many requests. Please try again later."})
			c.Abort()
			return
		}

		c.Next()
	}
}
