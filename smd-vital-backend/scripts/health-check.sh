#!/bin/bash

# SMD Vital - Health Check Script
# ===============================
# Script para verificar la salud de los servicios

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
ENVIRONMENT=${1:-"blue"}
TIMEOUT=${2:-30}
MAX_RETRIES=${3:-3}

# URLs de los servicios
AUTH_SERVICE_URL="http://smd-vital-${ENVIRONMENT}:8001"
USER_SERVICE_URL="http://smd-vital-${ENVIRONMENT}:8002"
APPOINTMENT_SERVICE_URL="http://smd-vital-${ENVIRONMENT}:8003"
NOTIFICATION_SERVICE_URL="http://smd-vital-${ENVIRONMENT}:8004"
MEDICAL_SERVICE_URL="http://smd-vital-${ENVIRONMENT}:8005"
PAYMENT_SERVICE_URL="http://smd-vital-${ENVIRONMENT}:8006"

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Función para verificar endpoint
check_endpoint() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    log "Checking $service_name at $url..."
    
    for i in $(seq 1 $MAX_RETRIES); do
        if response=$(curl -s -w "%{http_code}" -o /dev/null --max-time $TIMEOUT "$url/health" 2>/dev/null); then
            if [ "$response" = "$expected_status" ]; then
                success "$service_name is healthy (HTTP $response)"
                return 0
            else
                warning "$service_name returned HTTP $response (expected $expected_status)"
            fi
        else
            warning "$service_name connection failed (attempt $i/$MAX_RETRIES)"
        fi
        
        if [ $i -lt $MAX_RETRIES ]; then
            sleep 5
        fi
    done
    
    error "$service_name health check failed after $MAX_RETRIES attempts"
    return 1
}

# Función para verificar base de datos
check_database() {
    log "Checking database connectivity..."
    
    # Verificar PostgreSQL
    if kubectl exec -it deployment/smd-vital-${ENVIRONMENT} -- pg_isready -h postgres -p 5432; then
        success "PostgreSQL is ready"
    else
        error "PostgreSQL is not ready"
        return 1
    fi
    
    # Verificar Redis
    if kubectl exec -it deployment/smd-vital-${ENVIRONMENT} -- redis-cli -h redis ping; then
        success "Redis is ready"
    else
        error "Redis is not ready"
        return 1
    fi
    
    # Verificar RabbitMQ
    if kubectl exec -it deployment/smd-vital-${ENVIRONMENT} -- rabbitmq-diagnostics -q ping; then
        success "RabbitMQ is ready"
    else
        error "RabbitMQ is not ready"
        return 1
    fi
}

# Función para verificar métricas
check_metrics() {
    log "Checking metrics endpoints..."
    
    # Verificar Prometheus
    if curl -s --max-time $TIMEOUT "http://prometheus:9090/-/healthy" > /dev/null; then
        success "Prometheus is healthy"
    else
        error "Prometheus is not healthy"
        return 1
    fi
    
    # Verificar Grafana
    if curl -s --max-time $TIMEOUT "http://grafana:3000/api/health" > /dev/null; then
        success "Grafana is healthy"
    else
        error "Grafana is not healthy"
        return 1
    fi
}

# Función para verificar logs
check_logs() {
    log "Checking application logs..."
    
    # Verificar que no hay errores críticos en los logs
    local error_count=$(kubectl logs deployment/smd-vital-${ENVIRONMENT} --since=5m | grep -c "ERROR" || true)
    
    if [ $error_count -eq 0 ]; then
        success "No critical errors in logs"
    else
        warning "$error_count errors found in logs (last 5 minutes)"
    fi
}

# Función para verificar recursos
check_resources() {
    log "Checking resource usage..."
    
    # Verificar CPU y memoria
    local cpu_usage=$(kubectl top pods -l version=${ENVIRONMENT} --no-headers | awk '{print $2}' | sed 's/%//' | head -1)
    local memory_usage=$(kubectl top pods -l version=${ENVIRONMENT} --no-headers | awk '{print $3}' | sed 's/Mi//' | head -1)
    
    if [ -n "$cpu_usage" ] && [ "$cpu_usage" -lt 80 ]; then
        success "CPU usage is normal ($cpu_usage%)"
    else
        warning "CPU usage is high ($cpu_usage%)"
    fi
    
    if [ -n "$memory_usage" ] && [ "$memory_usage" -lt 1000 ]; then
        success "Memory usage is normal (${memory_usage}Mi)"
    else
        warning "Memory usage is high (${memory_usage}Mi)"
    fi
}

# Función para verificar seguridad
check_security() {
    log "Checking security endpoints..."
    
    # Verificar que los endpoints de seguridad están funcionando
    local security_endpoints=(
        "$AUTH_SERVICE_URL/auth/health"
        "$AUTH_SERVICE_URL/auth/status"
    )
    
    for endpoint in "${security_endpoints[@]}"; do
        if curl -s --max-time $TIMEOUT "$endpoint" > /dev/null; then
            success "Security endpoint $endpoint is accessible"
        else
            error "Security endpoint $endpoint is not accessible"
            return 1
        fi
    done
}

# Función para verificar funcionalidad end-to-end
check_e2e() {
    log "Running end-to-end functionality tests..."
    
    # Test de autenticación
    local auth_test=$(curl -s -X POST "$AUTH_SERVICE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"test@smdvital.com","password":"test123"}' \
        --max-time $TIMEOUT || echo "failed")
    
    if [ "$auth_test" != "failed" ]; then
        success "Authentication endpoint is functional"
    else
        error "Authentication endpoint is not functional"
        return 1
    fi
    
    # Test de creación de cita
    local appointment_test=$(curl -s -X POST "$APPOINTMENT_SERVICE_URL/appointments" \
        -H "Content-Type: application/json" \
        -d '{"patient_id":"test","doctor_id":"test","datetime":"2024-01-01T10:00:00Z"}' \
        --max-time $TIMEOUT || echo "failed")
    
    if [ "$appointment_test" != "failed" ]; then
        success "Appointment creation endpoint is functional"
    else
        error "Appointment creation endpoint is not functional"
        return 1
    fi
}

# Función principal
main() {
    log "🏥 Starting health check for $ENVIRONMENT environment..."
    
    local failed_checks=0
    
    # Verificar servicios principales
    check_endpoint "Auth Service" "$AUTH_SERVICE_URL" || ((failed_checks++))
    check_endpoint "User Service" "$USER_SERVICE_URL" || ((failed_checks++))
    check_endpoint "Appointment Service" "$APPOINTMENT_SERVICE_URL" || ((failed_checks++))
    check_endpoint "Notification Service" "$NOTIFICATION_SERVICE_URL" || ((failed_checks++))
    check_endpoint "Medical Service" "$MEDICAL_SERVICE_URL" || ((failed_checks++))
    check_endpoint "Payment Service" "$PAYMENT_SERVICE_URL" || ((failed_checks++))
    
    # Verificar infraestructura
    check_database || ((failed_checks++))
    check_metrics || ((failed_checks++))
    
    # Verificar logs y recursos
    check_logs
    check_resources
    
    # Verificar seguridad
    check_security || ((failed_checks++))
    
    # Verificar funcionalidad end-to-end
    check_e2e || ((failed_checks++))
    
    # Resumen
    echo ""
    log "📊 Health Check Summary"
    log "======================"
    
    if [ $failed_checks -eq 0 ]; then
        success "All health checks passed! ✅"
        exit 0
    else
        error "$failed_checks health checks failed! ❌"
        exit 1
    fi
}

# Ejecutar función principal
main "$@"



