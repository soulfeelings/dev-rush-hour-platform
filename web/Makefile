.DEFAULT_GOAL := menu

menu:
	@echo "\033[1;35m═══════════════════════════════════════\033[0m"
	@echo "\033[1;35m                Web                    \033[0m"
	@echo "\033[1;35m═══════════════════════════════════════\033[0m"
	@echo ""
	@echo "  \033[33m1)\033[0m Run dev server"
	@echo "  \033[33m2)\033[0m Build"
	@echo "  \033[33m3)\033[0m Generate TypeScript client from OpenAPI"
	@echo "  \033[33m4)\033[0m Type check"
	@echo "  \033[33m5)\033[0m Lint"
	@echo "  \033[33m6)\033[0m Lint and fix"
	@echo "  \033[33m7)\033[0m Run Storybook"
	@echo "  \033[33m8)\033[0m Preview build"
	@echo "  \033[33m0)\033[0m Back"
	@echo ""
	@read -p "Select option: " choice; \
	case $$choice in \
		1) $(MAKE) dev ;; \
		2) $(MAKE) build ;; \
		3) $(MAKE) generate ;; \
		4) $(MAKE) type-check ;; \
		5) $(MAKE) lint ;; \
		6) $(MAKE) lint-fix ;; \
		7) $(MAKE) storybook ;; \
		8) $(MAKE) preview ;; \
		0) $(MAKE) -C .. ;; \
		*) echo "Invalid option" ;; \
	esac

generate:
	pnpm dlx openapi-typescript ../backend/api/openapi.yaml -o src/api.ts

dev:
	pnpm dev

build:
	pnpm build

lint:
	pnpm lint

lint-fix:
	pnpm lint:fix

type-check:
	pnpm type-check

storybook:
	pnpm storybook

preview:
	pnpm preview
