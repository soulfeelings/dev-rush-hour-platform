package jwtutil

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

const CookieName = "rh_admin_jwt"
const TTL = 15 * time.Minute

const claimsKey = "admin_claims"

type Claims struct {
	jwt.RegisteredClaims
	Role        string   `json:"role"`
	Permissions []string `json:"permissions"`
}

func Sign(secret, email, role string, permissions []string) (string, error) {
	if permissions == nil {
		permissions = []string{}
	}
	claims := Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   email,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(TTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
		Role:        role,
		Permissions: permissions,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func Verify(secret, tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	return claims, nil
}

func SetClaims(c *fiber.Ctx, claims *Claims) {
	c.Locals(claimsKey, claims)
}

func GetClaims(c *fiber.Ctx) *Claims {
	claims, _ := c.Locals(claimsKey).(*Claims)
	return claims
}
