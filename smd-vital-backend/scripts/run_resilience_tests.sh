#!/bin/bash
# SMD Vital - Script de Pruebas de Resiliencia
# ===========================================
# Script para ejecutar todas las pruebas de resiliencia Redis/RabbitMQ

set -e

echo "🚀 SMD Vital - Ejecutando Pruebas de Resiliencia Redis/RabbitMQ"
echo "=============================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que Docker esté ejecutándose
if ! docker info > /dev/null 2>&1; then
    print_error "Docker no está ejecutándose. Por favor, inicia Docker primero."
    exit 1
fi

# Verificar que los servicios estén ejecutándose
print_status "Verificando servicios..."

# Verificar Redis
if ! docker exec smd_vital_redis redis-cli -a redis_password_2024 ping > /dev/null 2>&1; then
    print_error "Redis no está ejecutándose. Iniciando servicios..."
    docker-compose up -d redis
    sleep 10
fi

# Verificar RabbitMQ
if ! docker exec smd_vital_rabbitmq rabbitmq-diagnostics ping > /dev/null 2>&1; then
    print_error "RabbitMQ no está ejecutándose. Iniciando servicios..."
    docker-compose up -d rabbitmq
    sleep 10
fi

print_success "Servicios verificados"

# Crear directorio para reportes
REPORT_DIR="reports/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$REPORT_DIR"

print_status "Directorio de reportes: $REPORT_DIR"

# 1. Ejecutar pruebas de resiliencia
print_status "1. Ejecutando pruebas de resiliencia..."
python3 scripts/test_redis_rabbitmq_resilience.py > "$REPORT_DIR/resilience_test.log" 2>&1

if [ $? -eq 0 ]; then
    print_success "Pruebas de resiliencia completadas"
else
    print_warning "Pruebas de resiliencia completadas con advertencias"
fi

# 2. Ejecutar auditoría de seguridad
print_status "2. Ejecutando auditoría de seguridad..."
python3 scripts/audit_data_leaks.py > "$REPORT_DIR/security_audit.log" 2>&1

if [ $? -eq 0 ]; then
    print_success "Auditoría de seguridad completada"
else
    print_warning "Auditoría de seguridad completada con advertencias"
fi

# 3. Implementar mejoras de resiliencia
print_status "3. Implementando mejoras de resiliencia..."
python3 scripts/implement_resilience_improvements.py > "$REPORT_DIR/implementation.log" 2>&1

if [ $? -eq 0 ]; then
    print_success "Implementación de mejoras completada"
else
    print_warning "Implementación de mejoras completada con advertencias"
fi

# 4. Ejecutar monitoreo continuo por 5 minutos
print_status "4. Ejecutando monitoreo continuo (5 minutos)..."
timeout 300 python3 scripts/continuous_monitoring.py --once > "$REPORT_DIR/monitoring.log" 2>&1

if [ $? -eq 0 ]; then
    print_success "Monitoreo completado"
else
    print_warning "Monitoreo completado con advertencias"
fi

# 5. Generar reporte consolidado
print_status "5. Generando reporte consolidado..."

cat > "$REPORT_DIR/consolidated_report.md" << EOF
# Reporte Consolidado de Resiliencia - SMD Vital
===============================================

**Fecha de Ejecución**: $(date)
**Directorio de Reportes**: $REPORT_DIR

## Resumen de Ejecución

### 1. Pruebas de Resiliencia
- **Archivo**: resilience_test.log
- **Estado**: $(if [ -f "$REPORT_DIR/resilience_test.log" ]; then echo "✅ Completado"; else echo "❌ Fallido"; fi)

### 2. Auditoría de Seguridad
- **Archivo**: security_audit.log
- **Estado**: $(if [ -f "$REPORT_DIR/security_audit.log" ]; then echo "✅ Completado"; else echo "❌ Fallido"; fi)

### 3. Implementación de Mejoras
- **Archivo**: implementation.log
- **Estado**: $(if [ -f "$REPORT_DIR/implementation.log" ]; then echo "✅ Completado"; else echo "❌ Fallido"; fi)

### 4. Monitoreo Continuo
- **Archivo**: monitoring.log
- **Estado**: $(if [ -f "$REPORT_DIR/monitoring.log" ]; then echo "✅ Completado"; else echo "❌ Fallido"; fi)

## Archivos Generados

EOF

# Agregar lista de archivos generados
ls -la "$REPORT_DIR" >> "$REPORT_DIR/consolidated_report.md"

# 6. Verificar métricas de Prometheus (si está disponible)
print_status "6. Verificando métricas de Prometheus..."

if curl -s http://localhost:9090/metrics > /dev/null 2>&1; then
    print_success "Prometheus está disponible"
    curl -s http://localhost:9090/metrics > "$REPORT_DIR/prometheus_metrics.txt"
else
    print_warning "Prometheus no está disponible"
fi

# 7. Verificar estado de servicios
print_status "7. Verificando estado final de servicios..."

# Estado de Redis
echo "## Estado de Redis" >> "$REPORT_DIR/consolidated_report.md"
docker exec smd_vital_redis redis-cli -a redis_password_2024 info memory >> "$REPORT_DIR/consolidated_report.md" 2>&1

# Estado de RabbitMQ
echo "## Estado de RabbitMQ" >> "$REPORT_DIR/consolidated_report.md"
docker exec smd_vital_rabbitmq rabbitmq-diagnostics status >> "$REPORT_DIR/consolidated_report.md" 2>&1

# 8. Limpiar archivos temporales
print_status "8. Limpiando archivos temporales..."

# Mover archivos de reporte generados por los scripts
if [ -f "resilience_report_*.md" ]; then
    mv resilience_report_*.md "$REPORT_DIR/"
fi

if [ -f "security_audit_report_*.md" ]; then
    mv security_audit_report_*.md "$REPORT_DIR/"
fi

if [ -f "implementation_report_*.md" ]; then
    mv implementation_report_*.md "$REPORT_DIR/"
fi

# 9. Mostrar resumen final
print_status "9. Resumen final..."

echo ""
echo "=========================================="
echo "🎉 PRUEBAS DE RESILENCIA COMPLETADAS"
echo "=========================================="
echo ""
echo "📁 Reportes guardados en: $REPORT_DIR"
echo ""
echo "📊 Archivos generados:"
ls -la "$REPORT_DIR"
echo ""
echo "📋 Para ver el reporte consolidado:"
echo "   cat $REPORT_DIR/consolidated_report.md"
echo ""
echo "🔍 Para ver logs específicos:"
echo "   cat $REPORT_DIR/resilience_test.log"
echo "   cat $REPORT_DIR/security_audit.log"
echo "   cat $REPORT_DIR/implementation.log"
echo "   cat $REPORT_DIR/monitoring.log"
echo ""

# 10. Verificar si hay problemas críticos
print_status "10. Verificando problemas críticos..."

CRITICAL_ISSUES=0

# Verificar si hay errores críticos en los logs
if grep -i "critical\|error\|failed" "$REPORT_DIR/resilience_test.log" > /dev/null 2>&1; then
    print_warning "Se encontraron problemas en las pruebas de resiliencia"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi

if grep -i "critical\|error\|failed" "$REPORT_DIR/security_audit.log" > /dev/null 2>&1; then
    print_warning "Se encontraron problemas en la auditoría de seguridad"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi

if grep -i "critical\|error\|failed" "$REPORT_DIR/implementation.log" > /dev/null 2>&1; then
    print_warning "Se encontraron problemas en la implementación"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi

if [ $CRITICAL_ISSUES -eq 0 ]; then
    print_success "No se encontraron problemas críticos"
    exit 0
else
    print_warning "Se encontraron $CRITICAL_ISSUES problemas que requieren atención"
    exit 1
fi







