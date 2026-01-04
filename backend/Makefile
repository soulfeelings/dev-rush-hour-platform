.DEFAULT_GOAL := menu

menu:
	@echo "\033[1;32m═══════════════════════════════════════\033[0m"
	@echo "\033[1;32m              Backend                  \033[0m"
	@echo "\033[1;32m═══════════════════════════════════════\033[0m"
	@echo ""
	@echo "  \033[33m1)\033[0m Generate API from OpenAPI"
	@echo "  \033[33m2)\033[0m Run server (local)"
	@echo "  \033[33m3)\033[0m Open Swagger UI"
	@echo "  \033[33m4)\033[0m Migrate up"
	@echo "  \033[33m5)\033[0m Migrate down"
	@echo "  \033[33m6)\033[0m Start Postgres only"
	@echo "  \033[33m0)\033[0m Back"
	@echo ""
	@read -p "Select option: " choice; \
	case $$choice in \
		1) $(MAKE) generate ;; \
		2) $(MAKE) dev ;; \
		3) $(MAKE) swagger ;; \
		4) $(MAKE) migrate-up ;; \
		5) $(MAKE) migrate-down ;; \
		6) $(MAKE) postgres-up ;; \
		0) $(MAKE) -C .. ;; \
		*) echo "Invalid option" ;; \
	esac

generate:
	@if command -v oapi-codegen >/dev/null 2>&1; then \
		oapi-codegen -package generated -generate "types,fiber" -o internal/generated/api.gen.go api/openapi.yaml; \
	else \
		~/go/bin/oapi-codegen -package generated -generate "types,fiber" -o internal/generated/api.gen.go api/openapi.yaml; \
	fi

dev:
	@echo "\033[1;32mStarting server locally (make sure Postgres is running)...\033[0m"
	@if command -v air >/dev/null 2>&1; then \
		DB_HOST=localhost DB_PORT=5432 DB_USER=rushhour DB_PASSWORD=rushhour_dev DB_NAME=rushhour_db DB_SSLMODE=disable air; \
	else \
		DB_HOST=localhost DB_PORT=5432 DB_USER=rushhour DB_PASSWORD=rushhour_dev DB_NAME=rushhour_db DB_SSLMODE=disable ~/go/bin/air; \
	fi

postgres-up:
	@echo "\033[1;32mStarting Postgres via docker-compose...\033[0m"
	@cd .. && docker-compose -f docker-compose.dev.yml up -d postgres
	@echo "\033[1;32mWaiting for Postgres to be ready...\033[0m"
	@sleep 3
	@echo "\033[1;32mPostgres is ready on localhost:5432\033[0m"

swagger:
	@echo "\033[1;32mOpening Swagger UI in browser...\033[0m"
	@if command -v open >/dev/null 2>&1; then \
		open http://localhost:8080/swagger; \
	elif command -v xdg-open >/dev/null 2>&1; then \
		xdg-open http://localhost:8080/swagger; \
	elif command -v start >/dev/null 2>&1; then \
		start http://localhost:8080/swagger; \
	else \
		echo "Please open http://localhost:8080/swagger in your browser"; \
	fi

migrate-up:
	@echo "\033[1;32mRunning migrations up via docker-compose...\033[0m"
	@cd .. && docker-compose -f docker-compose.dev.yml run --rm migrate

migrate-down:
	@echo "\033[1;32mRunning migrations down...\033[0m"
	@cd .. && docker-compose -f docker-compose.dev.yml run --rm migrate sh -c "go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest && migrate -path internal/migrations -database 'postgres://rushhour:rushhour_dev@postgres:5432/rushhour_db?sslmode=disable' down"

migrate-create:
	@read -p "Migration name: " name; \
	cd .. && docker-compose -f docker-compose.dev.yml run --rm migrate sh -c "go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest && migrate create -ext sql -dir internal/migrations -seq $$name"

.PHONY: generate dev swagger migrate-up migrate-down migrate-create postgres-up

