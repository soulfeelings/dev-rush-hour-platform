package middleware

import (
	"strings"

	"rush-hour-platform/backend/internal/jwtutil"

	"github.com/gofiber/fiber/v2"
)

var entityPrefixes = map[string]string{
	"/api/admin/cities":          "cities",
	"/api/admin/areas":           "areas",
	"/api/admin/developers":      "developers",
	"/api/admin/projects":        "projects",
	"/api/admin/lots":            "lots",
	"/api/admin/badges":          "badges",
	"/api/admin/infrastructures": "infrastructures",
	"/api/admin/media":           "media",
}

var methodActions = map[string]string{
	"GET":    "view",
	"POST":   "create",
	"PUT":    "update",
	"PATCH":  "update",
	"DELETE": "delete",
}

// RequireEntityPermission checks entity:action permissions derived from path + HTTP method.
// Superadmin bypasses all checks. Unknown paths (auth/*, team/*) are passed through.
func RequireEntityPermission() fiber.Handler {
	return func(c *fiber.Ctx) error {
		claims := jwtutil.GetClaims(c)
		if claims == nil {
			return c.Next()
		}

		if claims.Role == "superadmin" {
			return c.Next()
		}

		entity := entityFromPath(c.Path())
		action := methodActions[c.Method()]

		// Unknown entity or action — skip (auth/*, team/*, etc.)
		if entity == "" || action == "" {
			return c.Next()
		}

		required := entity + ":" + action
		for _, p := range claims.Permissions {
			if p == required {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": fiber.Map{
				"code":    "forbidden",
				"message": "insufficient permissions",
			},
		})
	}
}

func entityFromPath(path string) string {
	for prefix, entity := range entityPrefixes {
		if strings.HasPrefix(path, prefix) {
			return entity
		}
	}
	return ""
}
