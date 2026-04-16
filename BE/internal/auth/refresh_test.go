package auth

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gothinkster/golang-gin-realworld-example-app/pkg/common"
	"github.com/stretchr/testify/assert"
)

func TestGenToken_DualArchitecture(t *testing.T) {
	assert := assert.New(t)

	// Test user ID
	userID := uint(42)

	// Call the new dual-token generator
	accessToken, refreshToken, err := common.GenToken(userID)

	assert.NoError(err, "Should not fail to generate dual tokens")
	assert.NotEmpty(accessToken, "Access token should not be empty")
	assert.NotEmpty(refreshToken, "Refresh token should not be empty")
	assert.NotEqual(accessToken, refreshToken, "Access and Refresh tokens should be distinctly generated")

	// Verify Access Token claims
	accessParsed, err := jwt.Parse(accessToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(common.JWTSecret), nil
	})
	assert.NoError(err, "Access token must be verifiable")
	accessClaims := accessParsed.Claims.(jwt.MapClaims)
	
	// Ensure JTI exists for Redis blacklist tracking
	assert.NotEmpty(accessClaims["jti"], "Access token must have a JTI (JWT ID) for blacklisting")
	assert.Equal(float64(userID), accessClaims["id"], "Access token must inject correct ID")
	
	// Verify Time limits
	expAccess := int64(accessClaims["exp"].(float64))
	ttlAccess := time.Until(time.Unix(expAccess, 0))
	assert.True(ttlAccess > 14*time.Minute && ttlAccess <= 15*time.Minute, "Access token should last 15 minutes")

	// Verify Refresh Token claims
	refreshParsed, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(common.JWTSecret), nil
	})
	assert.NoError(err, "Refresh token must be verifiable")
	refreshClaims := refreshParsed.Claims.(jwt.MapClaims)
	
	// Ensure distinction
	assert.Equal("refresh", refreshClaims["typ"], "Refresh token must be marked as 'refresh' type")
	assert.Equal(float64(userID), refreshClaims["id"], "Refresh token must carry correct ID")
	
	expRefresh := int64(refreshClaims["exp"].(float64))
	ttlRefresh := time.Until(time.Unix(expRefresh, 0))
	assert.True(ttlRefresh > 6*24*time.Hour && ttlRefresh <= 7*24*time.Hour, "Refresh token should last exactly 7 Days")
}
