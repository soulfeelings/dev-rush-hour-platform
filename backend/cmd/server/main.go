package main

import (
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"strings"

	"rush-hour-platform/backend/internal/config"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/handlers"
	"rush-hour-platform/backend/internal/middleware"
	"rush-hour-platform/backend/internal/repo"
	"rush-hour-platform/backend/internal/services"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	openapi_types "github.com/oapi-codegen/runtime/types"
)

type Server struct {
	projectsHandler      *handlers.ProjectsHandler
	areasHandler         *handlers.AreasHandler
	lotsHandler          *handlers.LotsHandler
	leadsHandler         *handlers.LeadsHandler
	adminDevelopersHandler *handlers.AdminDevelopersHandler
	adminAreasHandler      *handlers.AdminAreasHandler
	adminProjectsHandler   *handlers.AdminProjectsHandler
	adminLotsHandler       *handlers.AdminLotsHandler
	adminLeadsHandler      *handlers.AdminLeadsHandler
}

func NewServer(db *sql.DB) *Server {
	// Repositories
	areaRepo := repo.NewAreaRepo(db)
	projectRepo := repo.NewProjectRepo(db)
	lotRepo := repo.NewLotRepo(db)
	leadRepo := repo.NewLeadRepo(db)
	developerRepo := repo.NewDeveloperRepo(db)

	// Services
	areasService := services.NewAreasService(areaRepo)
	projectsService := services.NewProjectsService(projectRepo, lotRepo)
	lotsService := services.NewLotsService(lotRepo)
	leadsService := services.NewLeadsService(leadRepo)
	developersService := services.NewDevelopersService(developerRepo)

	// Handlers
	return &Server{
		projectsHandler:        handlers.NewProjectsHandler(projectsService),
		areasHandler:           handlers.NewAreasHandler(areasService),
		lotsHandler:            handlers.NewLotsHandler(lotsService),
		leadsHandler:           handlers.NewLeadsHandler(leadsService),
		adminDevelopersHandler: handlers.NewAdminDevelopersHandler(developersService),
		adminAreasHandler:      handlers.NewAdminAreasHandler(areasService),
		adminProjectsHandler:   handlers.NewAdminProjectsHandler(projectsService),
		adminLotsHandler:       handlers.NewAdminLotsHandler(lotsService),
		adminLeadsHandler:      handlers.NewAdminLeadsHandler(leadsService),
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

func (s *Server) GetProject(c *fiber.Ctx, slug string, params generated.GetProjectParams) error {
	return s.projectsHandler.GetProject(c, slug, params)
}

// Admin methods

func (s *Server) AdminListDevelopers(c *fiber.Ctx) error {
	return s.adminDevelopersHandler.ListDevelopers(c)
}

func (s *Server) AdminCreateDeveloper(c *fiber.Ctx) error {
	return s.adminDevelopersHandler.CreateDeveloper(c)
}

func (s *Server) AdminUpdateDeveloper(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminDevelopersHandler.UpdateDeveloper(c, id)
}

func (s *Server) AdminGetDeveloper(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminDevelopersHandler.GetDeveloper(c, id)
}

func (s *Server) AdminSoftDeleteDeveloper(c *fiber.Ctx, id openapi_types.UUID) error {
    return s.adminDevelopersHandler.SoftDeleteDeveloper(c, id)
}

func (s *Server) AdminListAreas(c *fiber.Ctx) error {
	return s.adminAreasHandler.ListAreas(c)
}

func (s *Server) AdminCreateArea(c *fiber.Ctx) error {
	return s.adminAreasHandler.CreateArea(c)
}

func (s *Server) AdminUpdateArea(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminAreasHandler.UpdateArea(c, id)
}

func (s *Server) AdminGetArea(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminAreasHandler.GetArea(c, id)
}

func (s *Server) AdminSoftDeleteArea(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminAreasHandler.SoftDeleteArea(c, id)
}

func (s *Server) AdminListProjects(c *fiber.Ctx) error {
	return s.adminProjectsHandler.ListProjects(c)
}

func (s *Server) AdminCreateProject(c *fiber.Ctx) error {
	return s.adminProjectsHandler.CreateProject(c)
}

func (s *Server) AdminUpdateProject(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminProjectsHandler.UpdateProject(c, id)
}

func (s *Server) AdminGetProject(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminProjectsHandler.GetProject(c, id)
}

func (s *Server) AdminSoftDeleteProject(c *fiber.Ctx, id openapi_types.UUID) error {
    return s.adminProjectsHandler.SoftDeleteProject(c, id)
}

func (s *Server) AdminListLots(c *fiber.Ctx) error {
	return s.adminLotsHandler.ListLots(c)
}

func (s *Server) AdminCreateLot(c *fiber.Ctx) error {
	return s.adminLotsHandler.CreateLot(c)
}


func (s *Server) AdminUpdateLot(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminLotsHandler.UpdateLot(c, id)
}

func (s *Server) AdminListLeads(c *fiber.Ctx, params generated.AdminListLeadsParams) error {
	return s.adminLeadsHandler.ListLeads(c, params)
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
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Requested-With,X-Admin-Key",
		AllowCredentials: false,
		ExposeHeaders:    "Content-Length",
	}))

	server := NewServer(db)

	// Media handler
	mediaHandler := handlers.NewMediaHandler(cfg.Media.UploadDir, cfg.Media.PublicURL)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Media upload endpoint (admin only)
	app.Post("/api/admin/media/upload", middleware.AdminAuth(cfg), func(c *fiber.Ctx) error {
		return mediaHandler.Upload(c)
	})

	// Serve uploaded media files
	app.Get("/api/media/:filename", func(c *fiber.Ctx) error {
		return mediaHandler.ServeFile(c)
	})

	// Apply admin auth middleware to all routes (it checks path internally)
	app.Use(middleware.AdminAuth(cfg))

	// Apply rate limiting middleware (it checks path internally)
	app.Use(middleware.LeadsRateLimitMiddleware())

	// Register all routes (public + admin)
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

		// Заменяем хардкодный URL на текущий хост из запроса
		protocol := c.Protocol()
		host := c.Hostname()
		currentServerURL := protocol + "://" + host + "/api"
		content := strings.ReplaceAll(string(data), "http://localhost:8080/api", currentServerURL)

		c.Set("Content-Type", "application/x-yaml")
		return c.SendString(content)
	})

	port := cfg.Server.Port
	log.Printf("API running on :%s", port)
	log.Printf("Swagger UI: http://localhost:%s/swagger", port)
	log.Fatal(app.Listen(":" + port))
}
