#!/bin/bash

# SMD Vital - Deployment Monitoring Script
# =======================================
# Script para monitorear el estado de un deployment

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
ENVIRONMENT=${1:-"blue"}
MONITORING_DURATION=${2:-300}  # 5 minutos por defecto
CHECK_INTERVAL=${3:-30}  # 30 segundos entre checks

# Métricas a monitorear
METRICS=(
    "error_rate"
    "response_time"
    "throughput"
    "health_check_failures"
    "service_availability"
    "cpu_usage"
    "memory_usage"
    "database_connection_failures"
    "security_events"
    "payment_failures"
)

# Umbrales de alerta
ERROR_RATE_THRESHOLD=5
RESPONSE_TIME_THRESHOLD=2000
HEALTH_CHECK_FAILURES_THRESHOLD=3
CPU_USAGE_THRESHOLD=90
MEMORY_USAGE_THRESHOLD=90
SECURITY_EVENTS_THRESHOLD=10

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

# Función para obtener métricas de Prometheus
get_metric() {
    local metric_name=$1
    local query=$2
    local default_value=${3:-0}
    
    local value=$(curl -s "http://prometheus:9090/api/v1/query" \
        --data-urlencode "query=$query" \
        | jq -r '.data.result[0].value[1]' 2>/dev/null || echo "$default_value")
    
    echo "$value"
}

# Función para verificar métrica
check_metric() {
    local metric_name=$1
    local current_value=$2
    local threshold=$3
    local unit=${4:-""}
    
    if (( $(echo "$current_value > $threshold" | bc -l) )); then
        warning "$metric_name is above threshold: $current_value$unit > $threshold$unit"
        return 1
    else
        log "$metric_name is within normal range: $current_value$unit"
        return 0
    fi
}

# Función para monitorear error rate
monitor_error_rate() {
    local error_rate=$(get_metric "error_rate" "rate(http_requests_total{status=~'5..'}[5m]) / rate(http_requests_total[5m]) * 100")
    check_metric "Error Rate" "$error_rate" "$ERROR_RATE_THRESHOLD" "%"
    return $?
}

# Función para monitorear response time
monitor_response_time() {
    local response_time=$(get_metric "response_time" "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) * 1000")
    check_metric "Response Time" "$response_time" "$RESPONSE_TIME_THRESHOLD" "ms"
    return $?
}

# Función para monitorear throughput
monitor_throughput() {
    local throughput=$(get_metric "throughput" "rate(http_requests_total[5m])")
    log "Throughput: $throughput requests/sec"
    return 0
}

# Función para monitorear health checks
monitor_health_checks() {
    local health_failures=$(get_metric "health_check_failures" "increase(health_check_failures_total[5m])")
    check_metric "Health Check Failures" "$health_failures" "$HEALTH_CHECK_FAILURES_THRESHOLD" ""
    return $?
}

# Función para monitorear disponibilidad del servicio
monitor_service_availability() {
    local availability=$(get_metric "service_availability" "avg_over_time(up[5m]) * 100")
    log "Service Availability: $availability%"
    return 0
}

# Función para monitorear CPU
monitor_cpu() {
    local cpu_usage=$(get_metric "cpu_usage" "avg(rate(container_cpu_usage_seconds_total[5m])) * 100")
    check_metric "CPU Usage" "$cpu_usage" "$CPU_USAGE_THRESHOLD" "%"
    return $?
}

# Función para monitorear memoria
monitor_memory() {
    local memory_usage=$(get_metric "memory_usage" "avg(container_memory_usage_bytes / container_spec_memory_limit_bytes) * 100")
    check_metric "Memory Usage" "$memory_usage" "$MEMORY_USAGE_THRESHOLD" "%"
    return $?
}

# Función para monitorear base de datos
monitor_database() {
    local db_failures=$(get_metric "database_connection_failures" "increase(database_connection_failures_total[5m])")
    if (( $(echo "$db_failures > 0" | bc -l) )); then
        warning "Database connection failures detected: $db_failures"
        return 1
    else
        log "Database connections are healthy"
        return 0
    fi
}

# Función para monitorear eventos de seguridad
monitor_security() {
    local security_events=$(get_metric "security_events" "rate(security_events_total[5m])")
    check_metric "Security Events" "$security_events" "$SECURITY_EVENTS_THRESHOLD" "/sec"
    return $?
}

# Función para monitorear pagos
monitor_payments() {
    local payment_failures=$(get_metric "payment_failures" "rate(payment_failures_total[5m])")
    if (( $(echo "$payment_failures > 0" | bc -l) )); then
        warning "Payment failures detected: $payment_failures"
        return 1
    else
        log "Payment processing is healthy"
        return 0
    fi
}

# Función para enviar alerta
send_alert() {
    local metric_name=$1
    local value=$2
    local threshold=$3
    local unit=$4
    
    local message="🚨 SMD Vital Alert: $metric_name exceeded threshold"
    local details="Current: $value$unit, Threshold: $threshold$unit"
    
    # Enviar a Slack
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-type: application/json' \
            --data "{
                \"text\": \"$message\",
                \"attachments\": [{
                    \"color\": \"danger\",
                    \"fields\": [{
                        \"title\": \"Metric\",
                        \"value\": \"$metric_name\",
                        \"short\": true
                    }, {
                        \"title\": \"Current Value\",
                        \"value\": \"$value$unit\",
                        \"short\": true
                    }, {
                        \"title\": \"Threshold\",
                        \"value\": \"$threshold$unit\",
                        \"short\": true
                    }, {
                        \"title\": \"Environment\",
                        \"value\": \"$ENVIRONMENT\",
                        \"short\": true
                    }]
                }]
            }" > /dev/null 2>&1
    fi
    
    # Enviar a PagerDuty
    if [ -n "$PAGERDUTY_INTEGRATION_KEY" ]; then
        curl -X POST "https://events.pagerduty.com/v2/enqueue" \
            -H 'Content-type: application/json' \
            -H "Authorization: Token token=$PAGERDUTY_INTEGRATION_KEY" \
            --data "{
                \"routing_key\": \"$PAGERDUTY_INTEGRATION_KEY\",
                \"event_action\": \"trigger\",
                \"payload\": {
                    \"summary\": \"$message\",
                    \"source\": \"SMD Vital Monitoring\",
                    \"severity\": \"critical\",
                    \"custom_details\": {
                        \"metric\": \"$metric_name\",
                        \"value\": \"$value$unit\",
                        \"threshold\": \"$threshold$unit\",
                        \"environment\": \"$ENVIRONMENT\"
                    }
                }
            }" > /dev/null 2>&1
    fi
}

# Función para monitorear todas las métricas
monitor_all_metrics() {
    local failed_checks=0
    local critical_failures=0
    
    log "📊 Monitoring $ENVIRONMENT environment for $MONITORING_DURATION seconds..."
    
    # Monitorear error rate
    if ! monitor_error_rate; then
        ((failed_checks++))
        ((critical_failures++))
        send_alert "Error Rate" "$(get_metric "error_rate" "rate(http_requests_total{status=~'5..'}[5m]) / rate(http_requests_total[5m]) * 100")" "$ERROR_RATE_THRESHOLD" "%"
    fi
    
    # Monitorear response time
    if ! monitor_response_time; then
        ((failed_checks++))
        ((critical_failures++))
        send_alert "Response Time" "$(get_metric "response_time" "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) * 1000")" "$RESPONSE_TIME_THRESHOLD" "ms"
    fi
    
    # Monitorear throughput
    monitor_throughput
    
    # Monitorear health checks
    if ! monitor_health_checks; then
        ((failed_checks++))
        ((critical_failures++))
        send_alert "Health Check Failures" "$(get_metric "health_check_failures" "increase(health_check_failures_total[5m])")" "$HEALTH_CHECK_FAILURES_THRESHOLD" ""
    fi
    
    # Monitorear disponibilidad del servicio
    monitor_service_availability
    
    # Monitorear CPU
    if ! monitor_cpu; then
        ((failed_checks++))
        send_alert "CPU Usage" "$(get_metric "cpu_usage" "avg(rate(container_cpu_usage_seconds_total[5m])) * 100")" "$CPU_USAGE_THRESHOLD" "%"
    fi
    
    # Monitorear memoria
    if ! monitor_memory; then
        ((failed_checks++))
        send_alert "Memory Usage" "$(get_metric "memory_usage" "avg(container_memory_usage_bytes / container_spec_memory_limit_bytes) * 100")" "$MEMORY_USAGE_THRESHOLD" "%"
    fi
    
    # Monitorear base de datos
    if ! monitor_database; then
        ((failed_checks++))
        ((critical_failures++))
    fi
    
    # Monitorear eventos de seguridad
    if ! monitor_security; then
        ((failed_checks++))
        ((critical_failures++))
        send_alert "Security Events" "$(get_metric "security_events" "rate(security_events_total[5m])")" "$SECURITY_EVENTS_THRESHOLD" "/sec"
    fi
    
    # Monitorear pagos
    if ! monitor_payments; then
        ((failed_checks++))
        ((critical_failures++))
    fi
    
    # Resumen
    echo ""
    log "📊 Monitoring Summary"
    log "===================="
    log "Failed checks: $failed_checks"
    log "Critical failures: $critical_failures"
    
    if [ $critical_failures -gt 0 ]; then
        error "Critical failures detected - rollback recommended"
        return 1
    elif [ $failed_checks -gt 0 ]; then
        warning "Some checks failed - investigate but no rollback needed"
        return 0
    else
        success "All metrics are within normal ranges"
        return 0
    fi
}

# Función principal
main() {
    log "🚀 Starting deployment monitoring for $ENVIRONMENT environment..."
    
    local start_time=$(date +%s)
    local end_time=$((start_time + MONITORING_DURATION))
    
    while [ $(date +%s) -lt $end_time ]; do
        log "🔍 Running monitoring check..."
        
        if ! monitor_all_metrics; then
            error "Monitoring check failed - deployment may need attention"
            exit 1
        fi
        
        local remaining_time=$((end_time - $(date +%s)))
        if [ $remaining_time -gt 0 ]; then
            log "⏳ Waiting $CHECK_INTERVAL seconds before next check (${remaining_time}s remaining)..."
            sleep $CHECK_INTERVAL
        fi
    done
    
    success "✅ Monitoring completed successfully - deployment is healthy"
}

# Ejecutar función principal
main "$@"



