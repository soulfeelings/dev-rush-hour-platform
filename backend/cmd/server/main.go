package main

import (
	"context"
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"strings"

	"rush-hour-platform/backend/internal/config"
	"rush-hour-platform/backend/internal/delivery"
	"rush-hour-platform/backend/internal/generated"
	"rush-hour-platform/backend/internal/handlers"
	"rush-hour-platform/backend/internal/middleware"
	"rush-hour-platform/backend/internal/repo"
	"rush-hour-platform/backend/internal/services"
	"rush-hour-platform/backend/internal/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"

	openapi_types "github.com/oapi-codegen/runtime/types"
)

type Server struct {
	projectsHandler      *handlers.ProjectsHandler
	areasHandler         *handlers.AreasHandler
	citiesHandler        *handlers.CitiesHandler
	developersHandler    *handlers.DevelopersHandler
	filtersHandler       *handlers.FiltersHandler
	lotsHandler          *handlers.LotsHandler
	leadsHandler         *handlers.LeadsHandler
	adminDevelopersHandler *handlers.AdminDevelopersHandler
	adminAreasHandler      *handlers.AdminAreasHandler
	adminCitiesHandler     *handlers.AdminCitiesHandler
	adminProjectsHandler   *handlers.AdminProjectsHandler
	adminLotsHandler       *handlers.AdminLotsHandler
	adminLeadsHandler      *handlers.AdminLeadsHandler
	adminBadgesHandler     *handlers.AdminBadgesHandler
}

func NewServer(db *sql.DB) *Server {
	// Repositories
	areaRepo := repo.NewAreaRepo(db)
	cityRepo := repo.NewCityRepo(db)
	projectRepo := repo.NewProjectRepo(db)
	lotRepo := repo.NewLotRepo(db)
	leadRepo := repo.NewLeadRepo(db)
	developerRepo := repo.NewDeveloperRepo(db)
	badgeRepo := repo.NewBadgeRepo(db)

	// Services
	areasService := services.NewAreasService(areaRepo)
	citiesService := services.NewCitiesService(cityRepo)
	projectsService := services.NewProjectsService(projectRepo, lotRepo, badgeRepo)
	lotsService := services.NewLotsService(lotRepo)
	leadsService := services.NewLeadsService(leadRepo)
	developersService := services.NewDevelopersService(developerRepo)
	badgesService := services.NewBadgesService(badgeRepo)
	filtersService := services.NewFiltersService(citiesService, areasService, developersService, projectsService)

	// Handlers
	return &Server{
		projectsHandler:        handlers.NewProjectsHandler(projectsService),
		areasHandler:           handlers.NewAreasHandler(areasService),
		citiesHandler:          handlers.NewCitiesHandler(citiesService),
		developersHandler:      handlers.NewDevelopersHandler(developersService),
		filtersHandler:         handlers.NewFiltersHandler(filtersService),
		lotsHandler:            handlers.NewLotsHandler(lotsService),
		leadsHandler:           handlers.NewLeadsHandler(leadsService),
		adminDevelopersHandler: handlers.NewAdminDevelopersHandler(developersService),
		adminAreasHandler:      handlers.NewAdminAreasHandler(areasService),
		adminCitiesHandler:     handlers.NewAdminCitiesHandler(citiesService),
		adminProjectsHandler:   handlers.NewAdminProjectsHandler(projectsService),
		adminLotsHandler:       handlers.NewAdminLotsHandler(lotsService),
		adminLeadsHandler:      handlers.NewAdminLeadsHandler(leadsService),
		adminBadgesHandler:     handlers.NewAdminBadgesHandler(badgesService),
	}
}

// Реализация generated.ServerInterface

func (s *Server) ListAreas(c *fiber.Ctx, params generated.ListAreasParams) error {
	return s.areasHandler.ListAreas(c, params)
}

func (s *Server) GetArea(c *fiber.Ctx, slug string) error {
	return s.areasHandler.GetArea(c, slug)
}

func (s *Server) ListCities(c *fiber.Ctx) error {
	return s.citiesHandler.ListCities(c)
}

func (s *Server) ListDevelopers(c *fiber.Ctx) error {
	return s.developersHandler.ListDevelopers(c)
}

func (s *Server) GetFilterOptions(c *fiber.Ctx) error {
	return s.filtersHandler.GetFilterOptions(c)
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

func (s *Server) AdminListDeletedDevelopers(c *fiber.Ctx) error {
    return s.adminDevelopersHandler.ListDeletedDevelopers(c)
}

func (s *Server) AdminRestoreDeveloper(c *fiber.Ctx, id openapi_types.UUID) error {
    return s.adminDevelopersHandler.RestoreDeveloper(c, id)
}

func (s *Server) AdminHardDeleteDeveloper(c *fiber.Ctx, id openapi_types.UUID) error {
    return s.adminDevelopersHandler.HardDeleteDeveloper(c, id)
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

func (s *Server) AdminListDeletedAreas(c *fiber.Ctx) error {
	return s.adminAreasHandler.ListDeletedAreas(c)
}

func (s *Server) AdminRestoreArea(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminAreasHandler.RestoreArea(c, id)
}

func (s *Server) AdminHardDeleteArea(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminAreasHandler.HardDeleteArea(c, id)
}

func (s *Server) AdminListCities(c *fiber.Ctx) error {
	return s.adminCitiesHandler.ListCities(c)
}

func (s *Server) AdminCreateCity(c *fiber.Ctx) error {
	return s.adminCitiesHandler.CreateCity(c)
}

func (s *Server) AdminUpdateCity(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminCitiesHandler.UpdateCity(c, id)
}

func (s *Server) AdminGetCity(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminCitiesHandler.GetCity(c, id)
}

func (s *Server) AdminSoftDeleteCity(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminCitiesHandler.SoftDeleteCity(c, id)
}

func (s *Server) AdminListDeletedCities(c *fiber.Ctx) error {
	return s.adminCitiesHandler.ListDeletedCities(c)
}

func (s *Server) AdminRestoreCity(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminCitiesHandler.RestoreCity(c, id)
}

func (s *Server) AdminHardDeleteCity(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminCitiesHandler.HardDeleteCity(c, id)
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

func (s *Server) AdminListDeletedProjects(c *fiber.Ctx) error {
	return s.adminProjectsHandler.ListDeletedProjects(c)
}

func (s *Server) AdminRestoreProject(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminProjectsHandler.RestoreProject(c, id)
}

func (s *Server) AdminHardDeleteProject(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminProjectsHandler.HardDeleteProject(c, id)
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

func (s *Server) AdminGetLot(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminLotsHandler.GetLot(c, id)
}

func (s *Server) AdminSoftDeleteLot(c *fiber.Ctx, id openapi_types.UUID) error {
    return s.adminLotsHandler.SoftDeleteLot(c, id)
}

func (s *Server) AdminListDeletedLots(c *fiber.Ctx) error {
	return s.adminLotsHandler.ListDeletedLots(c)
}

func (s *Server) AdminRestoreLot(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminLotsHandler.RestoreLot(c, id)
}

func (s *Server) AdminHardDeleteLot(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminLotsHandler.HardDeleteLot(c, id)
}

func (s *Server) AdminListLeads(c *fiber.Ctx, params generated.AdminListLeadsParams) error {
	return s.adminLeadsHandler.ListLeads(c, params)
}

func (s *Server) AdminUpdateLead(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminLeadsHandler.UpdateLead(c, id)
}

func (s *Server) AdminGetLead(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminLeadsHandler.GetLead(c, id)
}

func (s *Server) AdminSoftDeleteLead(c *fiber.Ctx, id openapi_types.UUID) error {
    return s.adminLeadsHandler.SoftDeleteLead(c, id)
}

func (s *Server) AdminListBadges(c *fiber.Ctx) error {
	return s.adminBadgesHandler.ListBadges(c)
}

func (s *Server) AdminCreateBadge(c *fiber.Ctx) error {
	return s.adminBadgesHandler.CreateBadge(c)
}

func (s *Server) AdminUpdateBadge(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminBadgesHandler.UpdateBadge(c, id)
}

func (s *Server) AdminGetBadge(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminBadgesHandler.GetBadge(c, id)
}

func (s *Server) AdminSoftDeleteBadge(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminBadgesHandler.SoftDeleteBadge(c, id)
}

func (s *Server) AdminListDeletedBadges(c *fiber.Ctx) error {
	return s.adminBadgesHandler.ListDeletedBadges(c)
}

func (s *Server) AdminRestoreBadge(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminBadgesHandler.RestoreBadge(c, id)
}

func (s *Server) AdminHardDeleteBadge(c *fiber.Ctx, id openapi_types.UUID) error {
	return s.adminBadgesHandler.HardDeleteBadge(c, id)
}

// Infrastructure stub implementations (not yet implemented)
func (s *Server) AdminListInfrastructures(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) AdminCreateInfrastructure(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) AdminGetInfrastructure(c *fiber.Ctx, id openapi_types.UUID) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) AdminUpdateInfrastructure(c *fiber.Ctx, id openapi_types.UUID) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) AdminSoftDeleteInfrastructure(c *fiber.Ctx, id openapi_types.UUID) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) AdminListDeletedInfrastructures(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) AdminRestoreInfrastructure(c *fiber.Ctx, id openapi_types.UUID) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

func (s *Server) AdminHardDeleteInfrastructure(c *fiber.Ctx, id openapi_types.UUID) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{"error": "not implemented"})
}

// initMediaService initializes the media service with appropriate storage and delivery
func initMediaService(ctx context.Context, cfg *config.Config, db *sql.DB) (*services.MediaService, error) {
	mediaRepo := repo.NewMediaRepo(db)

	var mediaStorage storage.MediaStorage
	var mediaDelivery delivery.MediaDelivery

	switch cfg.Media.Driver {
	case "s3":
		log.Println("Initializing S3 storage...")

		// Initialize S3 storage
		s3Storage, err := storage.NewS3Storage(ctx, storage.S3Config{
			Bucket:          cfg.S3.Bucket,
			Region:          cfg.S3.Region,
			Endpoint:        cfg.S3.Endpoint,
			AccessKeyID:     cfg.S3.AccessKeyID,
			SecretAccessKey: cfg.S3.SecretAccessKey,
			ForcePathStyle:  cfg.S3.ForcePathStyle,
		})
		if err != nil {
			return nil, err
		}
		mediaStorage = s3Storage

		// Initialize S3 presign delivery
		s3Delivery, err := delivery.NewS3PresignDelivery(ctx, delivery.S3PresignConfig{
			Bucket:          cfg.S3.Bucket,
			Region:          cfg.S3.Region,
			Endpoint:        cfg.S3.Endpoint,
			AccessKeyID:     cfg.S3.AccessKeyID,
			SecretAccessKey: cfg.S3.SecretAccessKey,
			ForcePathStyle:  cfg.S3.ForcePathStyle,
		})
		if err != nil {
			return nil, err
		}
		mediaDelivery = s3Delivery

		log.Printf("S3 storage initialized: bucket=%s, region=%s", cfg.S3.Bucket, cfg.S3.Region)

	default: // "local"
		log.Println("Initializing local storage...")

		// Initialize local storage
		localStorage, err := storage.NewLocalStorage(cfg.Media.UploadDir, cfg.Media.PublicURL)
		if err != nil {
			return nil, err
		}
		mediaStorage = localStorage

		// Initialize local delivery
		mediaDelivery = delivery.NewLocalDelivery(cfg.Media.PublicURL)

		log.Printf("Local storage initialized: dir=%s, url=%s", cfg.Media.UploadDir, cfg.Media.PublicURL)
	}

	return services.NewMediaService(mediaRepo, mediaStorage, mediaDelivery, cfg.Media.SignedTTLSeconds), nil
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

	// Initialize media service
	ctx := context.Background()
	mediaService, err := initMediaService(ctx, cfg, db)
	if err != nil {
		log.Fatalf("Failed to initialize media service: %v", err)
	}
	log.Printf("Media service initialized (driver: %s)", cfg.Media.Driver)

	app := fiber.New()

	// Logger middleware
	app.Use(middleware.RequestLogger())

	// Настраиваем CORS для разработки
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Requested-With,X-Admin-Key",
		AllowCredentials: false,
		ExposeHeaders:    "Content-Length",
	}))

	server := NewServer(db)

	// Legacy media handler (for serving local files)
	legacyMediaHandler := handlers.NewMediaHandler(cfg.Media.UploadDir, cfg.Media.PublicURL)

	// New media v2 handler with S3 support
	mediaV2Handler := handlers.NewMediaV2Handler(mediaService, cfg.Media.UploadDir, cfg.Media.PublicURL)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// === Media V2 API Routes ===

	// Admin media endpoints (require authentication)
	adminMedia := app.Group("/api/admin/media", middleware.AdminAuth(cfg))
	adminMedia.Post("/init", mediaV2Handler.InitUpload)         // Init presigned upload
	adminMedia.Post("/complete", mediaV2Handler.CompleteUpload) // Complete upload
	adminMedia.Delete("/:id", mediaV2Handler.Delete)            // Delete media
	adminMedia.Get("/", mediaV2Handler.List)                    // List media
	adminMedia.Post("/upload", mediaV2Handler.Upload)           // Legacy multipart upload

	// Public media endpoints (no authentication required)
	app.Get("/api/media/:id/url", mediaV2Handler.GetURL) // Get signed URL for single media
	app.Post("/api/media/urls", mediaV2Handler.GetURLs)  // Get signed URLs for batch

	// Legacy: Serve uploaded media files directly (for local storage backward compatibility)
	app.Get("/api/media/:filename", func(c *fiber.Ctx) error {
		return legacyMediaHandler.ServeFile(c)
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
	log.Printf("Media driver: %s", cfg.Media.Driver)
	log.Fatal(app.Listen(":" + port))
}
