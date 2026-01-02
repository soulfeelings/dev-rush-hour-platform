package main

import (
	"log"
	"os"
	"path/filepath"

	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

type Server struct {
	projectsHandler *handlers.ProjectsHandler
	unitsHandler    *handlers.UnitsHandler
}

func NewServer() *Server {
	return &Server{
		projectsHandler: handlers.NewProjectsHandler(),
		unitsHandler:    handlers.NewUnitsHandler(),
	}
}

func (s *Server) ListProjects(c *fiber.Ctx) error {
	return s.projectsHandler.ListProjects(c)
}

// Заглушки для остальных методов интерфейса
func (s *Server) ListAppointments(c *fiber.Ctx, params generated.ListAppointmentsParams) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) CreateAppointment(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) DeleteAppointment(c *fiber.Ctx, appointmentId string) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) GetAppointment(c *fiber.Ctx, appointmentId string) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) Login(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) Signup(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) ListFavorites(c *fiber.Ctx, params generated.ListFavoritesParams) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) CreateFavorite(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) DeleteFavorite(c *fiber.Ctx, favoriteId string) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) GetFavorite(c *fiber.Ctx, favoriteId string) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) CreateProject(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) DeleteProject(c *fiber.Ctx, projectId string) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) GetProject(c *fiber.Ctx, projectId string) error {
	return s.projectsHandler.GetProject(c, projectId)
}

func (s *Server) UpdateProject(c *fiber.Ctx, projectId string) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) ListUnits(c *fiber.Ctx, params generated.ListUnitsParams) error {
	return s.unitsHandler.ListUnits(c, params)
}

func (s *Server) CreateUnit(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) DeleteUnit(c *fiber.Ctx, unitId string) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) GetUnit(c *fiber.Ctx, unitId string) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) UpdateUnit(c *fiber.Ctx, unitId string) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) GetUser(c *fiber.Ctx, userId string) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) UpdateUser(c *fiber.Ctx, userId string) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func main() {
	app := fiber.New()

	// Logger middleware
	app.Use(logger.New())

	// Настраиваем CORS для разработки
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Requested-With",
		AllowCredentials: false,
		ExposeHeaders:    "Content-Length",
	}))

	server := NewServer()

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Регистрируем handlers с префиксом /api
	generated.RegisterHandlersWithOptions(app, server, generated.FiberServerOptions{
		BaseURL: "/api",
	})

	// Swagger UI
	app.Get("/swagger", func(c *fiber.Ctx) error {
		swaggerHTML := `<!DOCTYPE html>
<html>
<head>
	<title>API Documentation</title>
	<link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
</head>
<body>
	<div id="swagger-ui"></div>
	<script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
	<script>
		window.onload = function() {
			SwaggerUIBundle({
				url: "/api/openapi.yaml",
				dom_id: "#swagger-ui",
				presets: [
					SwaggerUIBundle.presets.apis,
					SwaggerUIBundle.presets.standalone
				]
			});
		};
	</script>
</body>
</html>`
		c.Set("Content-Type", "text/html")
		return c.SendString(swaggerHTML)
	})

	// OpenAPI файл
	app.Get("/api/openapi.yaml", func(c *fiber.Ctx) error {
		// Пытаемся найти файл относительно текущей директории или рабочей директории
		paths := []string{
			"api/openapi.yaml",
			"../api/openapi.yaml",
			filepath.Join(filepath.Dir(os.Args[0]), "../api/openapi.yaml"),
		}
		
		var data []byte
		var err error
		for _, path := range paths {
			data, err = os.ReadFile(path)
			if err == nil {
				break
			}
		}
		
		if err != nil {
			return c.Status(500).SendString("OpenAPI file not found: " + err.Error())
		}
		
		c.Set("Content-Type", "application/x-yaml")
		return c.Send(data)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("API running on :%s", port)
	log.Printf("Swagger UI: http://localhost:%s/swagger", port)
	log.Fatal(app.Listen(":" + port))
}
