package main

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"

	"rush-hour-platform/backend/internal/config"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/handlers"
	"rush-hour-platform/backend/internal/repo"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

type Server struct {
	projectsHandler *handlers.ProjectsHandler
	areasHandler    *handlers.AreasHandler
	lotsHandler     *handlers.LotsHandler
	leadsHandler    *handlers.LeadsHandler
}

func NewServer(db *sql.DB) *Server {
	// Repositories
	areaRepo := repo.NewAreaRepo(db)
	projectRepo := repo.NewProjectRepo(db)
	lotRepo := repo.NewLotRepo(db)
	leadRepo := repo.NewLeadRepo(db)

	// Services
	areasService := services.NewAreasService(areaRepo)
	projectsService := services.NewProjectsService(projectRepo)
	lotsService := services.NewLotsService(lotRepo)
	leadsService := services.NewLeadsService(leadRepo)

	// Handlers
	return &Server{
		projectsHandler: handlers.NewProjectsHandler(projectsService),
		areasHandler:    handlers.NewAreasHandler(areasService),
		lotsHandler:     handlers.NewLotsHandler(lotsService),
		leadsHandler:    handlers.NewLeadsHandler(leadsService),
	}
}

// Реализация generated.ServerInterface

func (s *Server) ListAreas(c *fiber.Ctx, params generated.ListAreasParams) error {
	return s.areasHandler.ListAreas(c, params)
}

func (s *Server) GetArea(c *fiber.Ctx, slug string) error {
	return s.areasHandler.GetArea(c, slug)
}

func (s *Server) CreateLead(c *fiber.Ctx) error {
	return s.leadsHandler.CreateLead(c)
}

func (s *Server) ListLots(c *fiber.Ctx, params generated.ListLotsParams) error {
	return s.lotsHandler.ListLots(c, params)
}

func (s *Server) GetLot(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.lotsHandler.GetLot(c, id)
}

func (s *Server) ListProjects(c *fiber.Ctx, params generated.ListProjectsParams) error {
	return s.projectsHandler.ListProjects(c, params)
}

func (s *Server) GetProject(c *fiber.Ctx, slug string) error {
	return s.projectsHandler.GetProject(c, slug)
}

func main() {
	cfg := config.Load()

	// Подключение к БД
	db, err := repo.NewDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("Database connected successfully")

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

	server := NewServer(db)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Регистрируем handlers из OpenAPI (автогенерация)
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

	port := cfg.Server.Port
	log.Printf("API running on :%s", port)
	log.Printf("Swagger UI: http://localhost:%s/swagger", port)
	log.Fatal(app.Listen(":" + port))
}
