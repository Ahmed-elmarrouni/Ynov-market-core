package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"

	"github.com/gothinkster/golang-gin-realworld-example-app/internal/article"
	"github.com/gothinkster/golang-gin-realworld-example-app/internal/auth"
	"github.com/gothinkster/golang-gin-realworld-example-app/pkg/cache"
	"github.com/gothinkster/golang-gin-realworld-example-app/pkg/database"
	"github.com/gothinkster/golang-gin-realworld-example-app/pkg/logger"
	"github.com/gothinkster/golang-gin-realworld-example-app/pkg/middleware"
	"github.com/joho/godotenv"
)

func main() {
	logger.Init()
	cache.Init()
	
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system environment variables")
	}

	db := database.Init()
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("failed to get sql.DB: %v", err)
	}
	defer sqlDB.Close()

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})
	
	// Disable automatic redirect for trailing slashes
	// This prevents POST body from being lost during redirects
	r.RedirectTrailingSlash = false

	v1 := r.Group("/api")
	
	usersRouter := v1.Group("/users")
	usersRouter.Use(middleware.RateLimiter(2, 5)) // Rate limit to 2 req/s with burst of 5 for logins
	auth.UsersRegister(usersRouter)
	
	v1.Use(auth.AuthMiddleware(false))
	article.ArticlesAnonymousRegister(v1.Group("/articles"))
	article.TagsAnonymousRegister(v1.Group("/tags"))
	auth.ProfileRetrieveRegister(v1.Group("/profiles"))

	v1.Use(auth.AuthMiddleware(true))
	auth.UserRegister(v1.Group("/user"))
	auth.ProfileRegister(v1.Group("/profiles"))

	article.ArticlesRegister(v1.Group("/articles"))

	testAuth := r.Group("/api/ping")

	testAuth.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// Get port from environment variable or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	if err := r.Run(":" + port); err != nil {
		log.Fatal("failed to start server:", err)
	}
}
