#!/bin/bash

# SMD Vital Backend - Development Startup Script
# ==============================================

set -e

echo "🚀 Starting SMD Vital Backend Development Environment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed. Please install it and try again.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from example...${NC}"
    cp env.example .env
    echo -e "${GREEN}✅ .env file created. Please review and update the configuration.${NC}"
fi

# Function to check if service is healthy
check_service_health() {
    local service_name=$1
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}🔍 Checking ${service_name} health...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service_name | grep -q "healthy\|Up"; then
            echo -e "${GREEN}✅ ${service_name} is healthy${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Waiting for ${service_name} (attempt $attempt/$max_attempts)...${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ ${service_name} failed to start properly${NC}"
    return 1
}

# Stop any existing containers
echo -e "${BLUE}🧹 Cleaning up existing containers...${NC}"
docker-compose down --remove-orphans

# Pull latest images
echo -e "${BLUE}📥 Pulling latest images...${NC}"
docker-compose pull

# Build services
echo -e "${BLUE}🔨 Building services...${NC}"
docker-compose build

# Start infrastructure services first
echo -e "${BLUE}🗄️  Starting infrastructure services...${NC}"
docker-compose up -d postgres redis rabbitmq

# Wait for infrastructure services to be ready
echo -e "${BLUE}⏳ Waiting for infrastructure services...${NC}"
sleep 10

check_service_health postgres
check_service_health redis
check_service_health rabbitmq

# Run database migrations
echo -e "${BLUE}📊 Running database migrations...${NC}"
docker-compose exec -T postgres psql -U smdvital -d smdvital -f /docker-entrypoint-initdb.d/init-databases.sql || true

# Start application services
echo -e "${BLUE}🚀 Starting application services...${NC}"
docker-compose up -d auth-service user-service appointment-service notification-service medical-records-service payment-service

# Wait for application services
echo -e "${BLUE}⏳ Waiting for application services...${NC}"
sleep 15

# Start monitoring services
echo -e "${BLUE}📊 Starting monitoring services...${NC}"
docker-compose up -d prometheus grafana jaeger

# Start API Gateway
echo -e "${BLUE}🌐 Starting API Gateway...${NC}"
docker-compose up -d nginx

# Start background workers
echo -e "${BLUE}⚙️  Starting background workers...${NC}"
docker-compose up -d celery-worker celery-beat flower

# Display service status
echo -e "\n${GREEN}🎉 SMD Vital Backend is starting up!${NC}"
echo -e "=================================="
echo -e "\n📋 Service Status:"
docker-compose ps

echo -e "\n🌐 Available Services:"
echo -e "  • ${BLUE}API Gateway:${NC}           http://localhost:8000"
echo -e "  • ${BLUE}Auth Service:${NC}          http://localhost:8001"
echo -e "  • ${BLUE}User Service:${NC}          http://localhost:8002"
echo -e "  • ${BLUE}Appointment Service:${NC}   http://localhost:8003"
echo -e "  • ${BLUE}Notification Service:${NC}  http://localhost:8004"
echo -e "  • ${BLUE}Medical Records:${NC}       http://localhost:8005"
echo -e "  • ${BLUE}Payment Service:${NC}       http://localhost:8006"

echo -e "\n📊 Monitoring & Management:"
echo -e "  • ${BLUE}Swagger Documentation:${NC} http://localhost:8000/docs"
echo -e "  • ${BLUE}RabbitMQ Management:${NC}   http://localhost:15672 (user: smdvital, pass: rabbitmq_password_2024)"
echo -e "  • ${BLUE}Prometheus:${NC}            http://localhost:9090"
echo -e "  • ${BLUE}Grafana:${NC}               http://localhost:3000 (admin/grafana_admin_2024)"
echo -e "  • ${BLUE}Jaeger Tracing:${NC}        http://localhost:16686"
echo -e "  • ${BLUE}Flower (Celery):${NC}       http://localhost:5555"

echo -e "\n📚 Useful Commands:"
echo -e "  • ${YELLOW}View logs:${NC}             docker-compose logs -f [service_name]"
echo -e "  • ${YELLOW}Stop all services:${NC}     docker-compose down"
echo -e "  • ${YELLOW}Restart service:${NC}       docker-compose restart [service_name]"
echo -e "  • ${YELLOW}Enter container:${NC}       docker-compose exec [service_name] bash"
echo -e "  • ${YELLOW}Run tests:${NC}             docker-compose exec [service_name] pytest"

echo -e "\n${GREEN}✨ Development environment is ready!${NC}"
echo -e "   Check the services above and start developing! 🚀"

# Optional: Show real-time logs
read -p "Do you want to see real-time logs? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}📜 Showing real-time logs (Ctrl+C to exit)...${NC}"
    docker-compose logs -f
fi
