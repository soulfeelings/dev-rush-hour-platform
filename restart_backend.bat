@echo off
docker compose -f docker-compose.dev.yml restart backend
echo Backend restarted
pause
