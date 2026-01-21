#!/bin/bash

# Facilita V2 - Docker Startup Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   FACILITA V2 - Docker Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}No .env file found. Creating from .env.production...${NC}"
    cp .env.production .env
    echo -e "${YELLOW}Please edit .env with your production values!${NC}"
fi

# Create necessary directories
echo -e "${GREEN}Creating directories...${NC}"
mkdir -p backend/uploads/images
mkdir -p backend/uploads/documents
mkdir -p backend/backups/auto
mkdir -p backend/backups/tmp
mkdir -p backend/uploads-user/images
mkdir -p backend/uploads-user/documents
mkdir -p backend/backups-user/auto
mkdir -p backend/backups-user/tmp

# Parse command line arguments
ACTION=${1:-up}

case $ACTION in
    up)
        echo -e "${GREEN}Starting services...${NC}"
        docker compose up -d --build
        echo -e "${GREEN}Services started!${NC}"
        echo -e "${GREEN}Access the application at: http://localhost${NC}"
        ;;
    down)
        echo -e "${YELLOW}Stopping services...${NC}"
        docker compose down
        echo -e "${GREEN}Services stopped!${NC}"
        ;;
    restart)
        echo -e "${YELLOW}Restarting services...${NC}"
        docker compose down
        docker compose up -d --build
        echo -e "${GREEN}Services restarted!${NC}"
        ;;
    logs)
        docker compose logs -f ${2:-}
        ;;
    status)
        docker compose ps
        ;;
    clean)
        echo -e "${RED}WARNING: This will remove all containers, volumes, and images!${NC}"
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose down -v --rmi all
            echo -e "${GREEN}Cleanup complete!${NC}"
        fi
        ;;
    *)
        echo "Usage: $0 {up|down|restart|logs|status|clean}"
        echo ""
        echo "Commands:"
        echo "  up       - Start all services (default)"
        echo "  down     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - View logs (optionally specify service: logs backend)"
        echo "  status   - Show status of all services"
        echo "  clean    - Remove all containers, volumes, and images"
        exit 1
        ;;
esac
