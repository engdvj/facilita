@echo off
setlocal enabledelayedexpansion

:: Facilita V2 - Docker Startup Script (Windows)

cd /d "%~dp0"

echo ========================================
echo    FACILITA V2 - Docker Deployment
echo ========================================

:: Check if .env exists
if not exist .env (
    echo No .env file found. Creating from .env.production...
    copy .env.production .env
    echo Please edit .env with your production values!
)

:: Create necessary directories
echo Creating directories...
if not exist "backend\uploads\images" mkdir "backend\uploads\images"
if not exist "backend\uploads\documents" mkdir "backend\uploads\documents"
if not exist "backend\backups\auto" mkdir "backend\backups\auto"
if not exist "backend\backups\tmp" mkdir "backend\backups\tmp"
if not exist "backend\uploads-user\images" mkdir "backend\uploads-user\images"
if not exist "backend\uploads-user\documents" mkdir "backend\uploads-user\documents"
if not exist "backend\backups-user\auto" mkdir "backend\backups-user\auto"
if not exist "backend\backups-user\tmp" mkdir "backend\backups-user\tmp"

:: Parse command line arguments
set ACTION=%1
if "%ACTION%"=="" set ACTION=up

if "%ACTION%"=="up" goto :up
if "%ACTION%"=="down" goto :down
if "%ACTION%"=="restart" goto :restart
if "%ACTION%"=="logs" goto :logs
if "%ACTION%"=="status" goto :status
if "%ACTION%"=="clean" goto :clean
goto :usage

:up
echo Starting services...
docker compose up -d --build
echo.
echo Services started!
echo Access the application at: http://localhost
goto :end

:down
echo Stopping services...
docker compose down
echo Services stopped!
goto :end

:restart
echo Restarting services...
docker compose down
docker compose up -d --build
echo Services restarted!
goto :end

:logs
if "%2"=="" (
    docker compose logs -f
) else (
    docker compose logs -f %2
)
goto :end

:status
docker compose ps
goto :end

:clean
echo WARNING: This will remove all containers, volumes, and images!
set /p CONFIRM=Are you sure? (y/N):
if /i "%CONFIRM%"=="y" (
    docker compose down -v --rmi all
    echo Cleanup complete!
)
goto :end

:usage
echo Usage: %~nx0 {up^|down^|restart^|logs^|status^|clean}
echo.
echo Commands:
echo   up       - Start all services (default)
echo   down     - Stop all services
echo   restart  - Restart all services
echo   logs     - View logs (optionally specify service: logs backend)
echo   status   - Show status of all services
echo   clean    - Remove all containers, volumes, and images
goto :end

:end
endlocal
