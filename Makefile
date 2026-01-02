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
	@echo ""
	@read -p "Select option: " choice; \
	case $$choice in \
		1) $(MAKE) -C web ;; \
		2) $(MAKE) -C backend ;; \
		3) $(MAKE) up-dev ;; \
		4) $(MAKE) up ;; \
		*) echo "Invalid option" ;; \
	esac

.PHONY: up up-dev down down-dev rebuild rebuild-dev logs logs-dev

up:
	@echo "\033[1;32mStarting services with Docker Compose (production)...\033[0m"
	@echo "\033[1;33mBackend: http://localhost:8080\033[0m"
	@echo "\033[1;33mWeb: http://localhost:5173\033[0m"
	docker compose up

up-dev:
	@echo "\033[1;32mStarting services with Docker Compose (development)...\033[0m"
	@echo "\033[1;33mBackend: http://localhost:8080\033[0m"
	@echo "\033[1;33mWeb: http://localhost:5173\033[0m"
	docker compose -f docker-compose.dev.yml up --build

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
