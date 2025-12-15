.DEFAULT_GOAL := menu

menu:
	@echo "\033[1;35m═══════════════════════════════════════\033[0m"
	@echo "\033[1;35m                Web                    \033[0m"
	@echo "\033[1;35m═══════════════════════════════════════\033[0m"
	@echo ""
	@echo "  \033[33m1)\033[0m Generate TypeScript client from OpenAPI"
	@echo "  \033[33m2)\033[0m Run dev server"
	@echo "  \033[33m3)\033[0m Build"
	@echo "  \033[33m0)\033[0m Back"
	@echo ""
	@read -p "Select option: " choice; \
	case $$choice in \
		1) $(MAKE) generate ;; \
		2) $(MAKE) dev ;; \
		3) $(MAKE) build ;; \
		0) $(MAKE) -C .. ;; \
		*) echo "Invalid option" ;; \
	esac

generate:
	pnpm dlx openapi-typescript ../backend/api/openapi.yaml -o src/api.ts

dev:
	pnpm dev

build:
	pnpm build

