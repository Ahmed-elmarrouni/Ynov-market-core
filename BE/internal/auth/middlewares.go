package auth

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gothinkster/golang-gin-realworld-example-app/pkg/cache"
	"github.com/gothinkster/golang-gin-realworld-example-app/pkg/common"
	"github.com/gothinkster/golang-gin-realworld-example-app/pkg/database"
)

// Extract token from Authorization header or query parameter
func extractToken(c *gin.Context) string {
	// Check Authorization header first
	bearerToken := c.GetHeader("Authorization")
	if len(bearerToken) > 6 && strings.ToUpper(bearerToken[0:6]) == "TOKEN " {
		return bearerToken[6:]
	}

	// Check query parameter
	token := c.Query("access_token")
	if token != "" {
		return token
	}

	return ""
}

// A helper to write user_id and user_model to the context
func UpdateContextUserModel(c *gin.Context, my_user_id uint) {
	var myUserModel UserModel
	if my_user_id != 0 {
		db := database.GetDB()
		db.First(&myUserModel, my_user_id)
	}
	c.Set("my_user_id", my_user_id)
	c.Set("my_user_model", myUserModel)
}

func AuthMiddleware(auto401 bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		UpdateContextUserModel(c, 0)
		tokenString := extractToken(c)

		if tokenString == "" {
			if auto401 {
				c.AbortWithStatus(http.StatusUnauthorized)
			}
			return
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(common.JWTSecret), nil
		})

		if err != nil {
			if auto401 {
				c.AbortWithStatus(http.StatusUnauthorized)
			}
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Blacklist verification
			if jti, ok := claims["jti"].(string); ok {
				// SAFEGUARD: Only check Redis if the client is actually connected
				if cache.Client != nil {
					val, err := cache.Client.Get(cache.Ctx, "blacklist:"+jti).Result()
					if err == nil && val == "true" {
						if auto401 {
							c.AbortWithStatusJSON(http.StatusUnauthorized, common.NewError("auth", nil))
						} else {
							c.Abort()
						}
						return
					}
				}
			}

			my_user_id := uint(claims["id"].(float64))
			UpdateContextUserModel(c, my_user_id)
		}
	}
}
