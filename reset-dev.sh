#!/bin/bash
echo "í·¹ Resetting development environment..."
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
echo "âœ… Done! Open: http://localhost:5173"
