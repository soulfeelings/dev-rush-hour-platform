.DEFAULT_GOAL := menu

menu:
	@echo "\033[1;36m═══════════════════════════════════════\033[0m"
	@echo "\033[1;36m         Rush Hour Platform            \033[0m"
	@echo "\033[1;36m═══════════════════════════════════════\033[0m"
	@echo ""
	@echo "  \033[33m1)\033[0m Web"
	@echo "  \033[33m2)\033[0m Backend"
	@echo "  \033[33m3)\033[0m Run with Docker Compose (dev)"
	@echo "  \033[33m4)\033[0m Run with Docker Compose (prod)"
	@echo "  \033[33m5)\033[0m Railway"
	@echo "  \033[33m6)\033[0m Reset Dev Environment (with seed)"
	@echo "  \033[33m7)\033[0m Rebuild Web Dependencies"
	@echo "  \033[33m8)\033[0m Git pull (web-platform)"
	@echo "  \033[33m9)\033[0m Git push (web-platform)"
	@echo "  \033[33m10)\033[0m Git push FORCE (web-platform)"
	@echo ""
	@read -p "Select option: " choice; \
	case $$choice in \
		1) $(MAKE) -C web ;; \
		2) $(MAKE) -C backend ;; \
		3) $(MAKE) up-dev ;; \
		4) $(MAKE) up ;; \
		5) $(MAKE) railway-menu ;; \
		6) $(MAKE) reset-dev ;; \
		7) $(MAKE) web-deps ;; \
		8) $(MAKE) git-pull ;; \
		9) $(MAKE) git-push ;; \
		10) $(MAKE) git-push-force ;; \
		*) echo "Invalid option" ;; \
	esac

WEB_PLATFORM_REMOTE := web-platform
WEB_PLATFORM_URL := git@github.com:Rush-Hour-Real-Estate-Brokerage/web-platform.git

.PHONY: up up-dev down down-dev rebuild rebuild-dev logs logs-dev seed-dev reset-dev railway-menu railway-reset railway-migrate railway-seed web-deps git-setup git-pull git-push git-push-force

up:
	@echo "\033[1;32mStarting services with Docker Compose (production)...\033[0m"
	@echo "\033[1;33mBackend: http://localhost:8080\033[0m"
	@echo "\033[1;33mWeb: http://localhost:5173\033[0m"
	docker compose up

up-dev:
	@echo "\033[1;32mStarting services with Docker Compose (development)...\033[0m"
	@echo "\033[1;33mBackend: http://localhost:8080\033[0m"
	@echo "\033[1;33mWeb: http://localhost:5173\033[0m"
	docker compose -f docker-compose.dev.yml up -d --build

down:
	@echo "\033[1;31mStopping services...\033[0m"
	docker compose down

down-dev:
	@echo "\033[1;31mStopping dev services...\033[0m"
	docker compose -f docker-compose.dev.yml down

rebuild:
	@echo "\033[1;33mRebuilding services...\033[0m"
	@echo "\033[1;33mBackend: http://localhost:8080\033[0m"
	@echo "\033[1;33mWeb: http://localhost:5173\033[0m"
	docker compose up -d --build

rebuild-dev:
	@echo "\033[1;33mRebuilding dev services...\033[0m"
	@echo "\033[1;33mBackend: http://localhost:8080\033[0m"
	@echo "\033[1;33mWeb: http://localhost:5173\033[0m"
	docker compose -f docker-compose.dev.yml up -d --build

logs:
	docker compose logs -f

logs-dev:
	docker compose -f docker-compose.dev.yml logs -f

web-deps:
	@echo "\033[1;33m📦 Rebuilding web dependencies...\033[0m"
	docker compose -f docker-compose.dev.yml stop web
	docker compose -f docker-compose.dev.yml rm -f web
	docker volume rm -f dev-rush-hour-platform_web_node_modules 2>/dev/null || true
	docker compose -f docker-compose.dev.yml up -d --build web
	@echo "\033[1;32m✅ Web dependencies rebuilt!\033[0m"
	@echo "  Frontend: http://localhost:5173"

seed-dev:
	@echo "\033[1;32mSeeding development database...\033[0m"
	docker exec -i rushhour-postgres-dev psql -U rushhour -d rushhour_db < backend/internal/seeds/seed.sql

reset-dev:
	@echo "\033[1;31m🔄 Resetting dev environment (removes DB data)...\033[0m"
	@echo "\033[1;33mThis will delete the database and reload seed data\033[0m"
	@read -p "Are you sure? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		docker compose -f docker-compose.dev.yml down -v; \
		echo "\033[1;32mStarting fresh environment...\033[0m"; \
		docker compose -f docker-compose.dev.yml up -d --build; \
		echo "\033[1;32m✅ Done! Services:\033[0m"; \
		echo "  Frontend: http://localhost:5173"; \
		echo "  Backend API: http://localhost:8080"; \
		echo "  Adminer (DB): http://localhost:8081"; \
	else \
		echo "\033[1;33mReset cancelled\033[0m"; \
	fi

railway-menu:
	@echo "\033[1;36m═══════════════════════════════════════\033[0m"
	@echo "\033[1;36m              Railway                  \033[0m"
	@echo "\033[1;36m═══════════════════════════════════════\033[0m"
	@echo ""
	@echo "  \033[33m1)\033[0m Reset DB (clean + migrate + seed)"
	@echo "  \033[33m2)\033[0m Migrate database"
	@echo "  \033[33m3)\033[0m Seed database"
	@echo "  \033[33m0)\033[0m Back"
	@echo ""
	@read -p "Select option: " choice; \
	case $$choice in \
		1) $(MAKE) railway-reset ;; \
		2) $(MAKE) railway-migrate ;; \
		3) $(MAKE) railway-seed ;; \
		0) $(MAKE) menu ;; \
		*) echo "Invalid option" ;; \
	esac

railway-reset:
	@bash scripts/railway-db-reset.sh

railway-migrate:
	@echo "\033[1;32mRailway Database Migration\033[0m"
	@read -p "DB_HOST (e.g., your-project.proxy.rlwy.net): " db_host; \
	read -p "DB_PORT (e.g., 12345): " db_port; \
	read -p "DB_USER (e.g., postgres): " db_user; \
	read -p "DB_PASSWORD: " db_password; \
	read -p "DB_NAME (e.g., railway): " db_name; \
	echo "\033[1;33mRunning migrations...\033[0m"; \
	cd backend && \
	DB_HOST=$$db_host \
	DB_PORT=$$db_port \
	DB_USER=$$db_user \
	DB_PASSWORD=$$db_password \
	DB_NAME=$$db_name \
	DB_SSLMODE=require \
	go run cmd/migrate/main.go -direction=up

railway-seed:
	@echo "\033[1;32mRailway Database Seed\033[0m"
	@read -p "DB_HOST (e.g., your-project.proxy.rlwy.net): " db_host; \
	read -p "DB_PORT (e.g., 12345): " db_port; \
	read -p "DB_USER (e.g., postgres): " db_user; \
	read -p "DB_PASSWORD: " db_password; \
	read -p "DB_NAME (e.g., railway): " db_name; \
	echo "\033[1;33mSeeding database...\033[0m"; \
	db_url="postgresql://$$db_user:$$db_password@$$db_host:$$db_port/$$db_name?sslmode=require"; \
	cd backend && psql "$$db_url" -f internal/seeds/seed.sql

git-setup:
	@if ! git remote get-url $(WEB_PLATFORM_REMOTE) 2>/dev/null; then \
		git remote add $(WEB_PLATFORM_REMOTE) $(WEB_PLATFORM_URL); \
		echo "\033[1;32mAdded remote $(WEB_PLATFORM_REMOTE)\033[0m"; \
	else \
		echo "\033[1;33mRemote $(WEB_PLATFORM_REMOTE) already exists\033[0m"; \
	fi

git-pull: git-setup
	@echo "\033[1;32mPulling from $(WEB_PLATFORM_REMOTE)...\033[0m"
	git pull $(WEB_PLATFORM_REMOTE) $$(git branch --show-current) --no-edit

git-push: git-setup
	@echo "\033[1;32mPushing to $(WEB_PLATFORM_REMOTE)...\033[0m"
	git push $(WEB_PLATFORM_REMOTE) $(shell git branch --show-current)

git-push-force: git-setup
	@echo "\033[1;31mForce-pushing to $(WEB_PLATFORM_REMOTE)...\033[0m"
	git push --force-with-lease $(WEB_PLATFORM_REMOTE) $(shell git branch --show-current)
