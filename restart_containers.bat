@echo off
echo Stopping containers...
docker compose -f docker-compose.dev.yml down

echo Starting containers...
docker compose -f docker-compose.dev.yml up -d --build

echo Containers restarted
pause
