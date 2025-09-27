#!/bin/bash

# Script para solucionar problemas identificados en los logs de Docker
# =================================================================

set -e

echo "🔧 Solucionando problemas de Docker identificados..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Reconstruir health-metrics-service con psycopg2
log_info "Reconstruyendo health-metrics-service con psycopg2..."
docker-compose build health-metrics-service
log_success "Health-metrics-service reconstruido"

# 2. Reconstruir flower con configuración corregida
log_info "Reconstruyendo flower con configuración RabbitMQ corregida..."
docker-compose build flower
log_success "Flower reconstruido"

# 3. Reconstruir servicios con eventos FastAPI actualizados
log_info "Reconstruyendo servicios con eventos FastAPI actualizados..."
docker-compose build medical-records-service
docker-compose build appointment-service
docker-compose build auth-service
log_success "Servicios con FastAPI actualizado reconstruidos"

# 4. Verificar que los contenedores se pueden iniciar
log_info "Verificando que los contenedores se pueden iniciar..."
docker-compose up -d postgres redis rabbitmq
sleep 10

# Verificar conexiones
log_info "Verificando conexiones de base de datos..."
docker-compose exec postgres pg_isready -U smdvital || log_warning "PostgreSQL no está listo"

log_info "Verificando conexiones de Redis..."
docker-compose exec redis redis-cli ping || log_warning "Redis no está listo"

log_info "Verificando conexiones de RabbitMQ..."
docker-compose exec rabbitmq rabbitmq-diagnostics check_port_connectivity || log_warning "RabbitMQ no está listo"

# 5. Iniciar servicios uno por uno para verificar
log_info "Iniciando servicios para verificación..."

services=("health-metrics-service" "flower" "medical-records-service" "appointment-service" "auth-service")

for service in "${services[@]}"; do
    log_info "Iniciando $service..."
    if docker-compose up -d "$service"; then
        log_success "$service iniciado correctamente"
        sleep 5
        
        # Verificar health check
        if docker-compose ps "$service" | grep -q "healthy\|Up"; then
            log_success "$service está funcionando correctamente"
        else
            log_warning "$service puede tener problemas - revisar logs"
        fi
    else
        log_error "Error iniciando $service"
    fi
done

# 6. Mostrar estado final
log_info "Estado final de los servicios:"
docker-compose ps

# 7. Mostrar logs de errores si los hay
log_info "Verificando logs de errores..."
if docker-compose logs --tail=10 | grep -i "error\|exception\|failed"; then
    log_warning "Se encontraron errores en los logs. Revisar:"
    echo "docker-compose logs [nombre-del-servicio]"
else
    log_success "No se encontraron errores críticos en los logs"
fi

echo ""
log_success "🎉 Proceso de corrección completado!"
echo ""
echo "📋 Resumen de cambios aplicados:"
echo "   ✅ Agregado psycopg2-binary a requirements.txt"
echo "   ✅ Corregidas credenciales RabbitMQ en Flower"
echo "   ✅ Actualizados eventos FastAPI a lifespan"
echo "   ✅ Mejoradas dependencias del sistema para ReportLab"
echo "   ✅ Cambiado warning de ReportLab a info"
echo ""
echo "🚀 Para iniciar todos los servicios:"
echo "   docker-compose up -d"
echo ""
echo "📊 Para monitorear los servicios:"
echo "   docker-compose logs -f"
echo ""
echo "🔍 Para verificar el estado:"
echo "   docker-compose ps"


