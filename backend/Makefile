.DEFAULT_GOAL := menu

menu:
	@echo "\033[1;32m═══════════════════════════════════════\033[0m"
	@echo "\033[1;32m              Backend                  \033[0m"
	@echo "\033[1;32m═══════════════════════════════════════\033[0m"
	@echo ""
	@echo "  \033[33m1)\033[0m Generate API from OpenAPI"
	@echo "  \033[33m2)\033[0m Run server"
	@echo "  \033[33m3)\033[0m Open Swagger UI"
	@echo "  \033[33m0)\033[0m Back"
	@echo ""
	@read -p "Select option: " choice; \
	case $$choice in \
		1) $(MAKE) generate ;; \
		2) $(MAKE) dev ;; \
		3) $(MAKE) swagger ;; \
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
	@if command -v air >/dev/null 2>&1; then \
		air; \
	else \
		~/go/bin/air; \
	fi

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

.PHONY: generate dev swagger

