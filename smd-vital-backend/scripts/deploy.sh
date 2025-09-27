#!/bin/bash

# =============================================
# SMD VITAL - Deployment Script
# =============================================
# Script para desplegar toda la infraestructura

set -e

echo "🚀 Iniciando despliegue de SMD VITAL..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar dependencias
log "Verificando dependencias..."

if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado"
fi

success "Dependencias verificadas"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    log "Creando archivo .env..."
    cat > .env << EOF
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Twilio Configuration (opcional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Grafana Configuration
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=smdvital_grafana_2024
GRAFANA_SECRET_KEY=smdvital_grafana_secret_key_2024
EOF
    warning "Archivo .env creado. Por favor configura las variables de entorno."
fi

# Crear directorios necesarios
log "Creando directorios..."
mkdir -p logs
mkdir -p ssl
mkdir -p services/payments/schemas
mkdir -p services/notifications/schemas
mkdir -p services/medical-records/schemas

# Copiar esquemas de base de datos
log "Copiando esquemas de base de datos..."
cp services/payments/schemas/payment_schemas.sql services/payments/schemas/ 2>/dev/null || true
cp services/notifications/schemas/notification_schemas.sql services/notifications/schemas/ 2>/dev/null || true
cp services/medical-records/schemas/health_metrics_schemas.sql services/medical-records/schemas/ 2>/dev/null || true

# Construir imágenes Docker
log "Construyendo imágenes Docker..."
docker-compose build --no-cache

# Detener contenedores existentes
log "Deteniendo contenedores existentes..."
docker-compose down -v

# Iniciar servicios
log "Iniciando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
log "Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
log "Verificando estado de los servicios..."

services=(
    "postgres:5432"
    "redis:6379"
    "rabbitmq:5672"
    "auth-service:8001"
    "user-service:8002"
    "appointment-service:8003"
    "notification-service:8004"
    "medical-records-service:8005"
    "payment-service:8006"
    "health-metrics-service:8007"
)

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    
    if docker-compose ps | grep -q "$name.*Up"; then
        success "$name está ejecutándose"
    else
        error "$name no está ejecutándose"
    fi
done

# Ejecutar migraciones de base de datos
log "Ejecutando migraciones de base de datos..."
docker-compose exec postgres psql -U smdvital -d smdvital -f /docker-entrypoint-initdb.d/init-databases.sql

# Verificar endpoints de salud
log "Verificando endpoints de salud..."

endpoints=(
    "http://localhost:8001/health"
    "http://localhost:8002/health"
    "http://localhost:8003/health"
    "http://localhost:8004/health"
    "http://localhost:8005/health"
    "http://localhost:8006/health"
    "http://localhost:8007/health"
)

for endpoint in "${endpoints[@]}"; do
    if curl -s "$endpoint" | grep -q "healthy"; then
        success "Endpoint $endpoint está respondiendo"
    else
        warning "Endpoint $endpoint no está respondiendo correctamente"
    fi
done

# Mostrar información de acceso
log "Información de acceso:"
echo ""
echo "🌐 Servicios Web:"
echo "   - API Gateway: http://localhost:8000"
echo "   - Auth Service: http://localhost:8001"
echo "   - User Service: http://localhost:8002"
echo "   - Appointment Service: http://localhost:8003"
echo "   - Notification Service: http://localhost:8004"
echo "   - Medical Records Service: http://localhost:8005"
echo "   - Payment Service: http://localhost:8006"
echo "   - Health Metrics Service: http://localhost:8007"
echo ""
echo "📊 Monitoreo:"
echo "   - Grafana: http://localhost:3005 (admin/smdvital_grafana_2024)"
echo "   - Prometheus: http://localhost:9090"
echo "   - Jaeger: http://localhost:16686"
echo "   - Kibana: http://localhost:5601"
echo "   - Flower (Celery): http://localhost:5555"
echo ""
echo "🗄️ Bases de Datos:"
echo "   - PostgreSQL: localhost:5432 (smdvital/smdvital_password_2024)"
echo "   - Redis: localhost:6379 (password: redis_password_2024)"
echo "   - RabbitMQ Management: http://localhost:15672 (smdvital/rabbitmq_password_2024)"
echo ""

# Mostrar logs
log "Para ver los logs de todos los servicios:"
echo "   docker-compose logs -f"
echo ""
log "Para ver logs de un servicio específico:"
echo "   docker-compose logs -f [nombre-del-servicio]"
echo ""

success "¡Despliegue completado exitosamente! 🎉"

# Verificar si hay errores en los logs
log "Verificando logs por errores..."
if docker-compose logs --tail=50 | grep -i error; then
    warning "Se encontraron errores en los logs. Revisa la salida anterior."
else
    success "No se encontraron errores críticos en los logs."
fi

echo ""
echo "🚀 SMD VITAL está listo para usar!"
echo "   Para detener todos los servicios: docker-compose down"
echo "   Para reiniciar: docker-compose restart"
echo "   Para ver estado: docker-compose ps"


