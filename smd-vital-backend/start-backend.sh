#!/bin/bash

# SMD Vital Backend - Script de inicio rápido
# ===========================================

echo "=== SMD VITAL Backend - Inicio Rápido ==="
echo "Fecha: $(date)"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_status() {
    local message=$1
    local status=${2:-"INFO"}
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $status in
        "ERROR")
            echo -e "[${timestamp}] ${RED}ERROR${NC}: ${message}"
            ;;
        "WARNING")
            echo -e "[${timestamp}] ${YELLOW}WARNING${NC}: ${message}"
            ;;
        "SUCCESS")
            echo -e "[${timestamp}] ${GREEN}SUCCESS${NC}: ${message}"
            ;;
        *)
            echo -e "[${timestamp}] ${BLUE}INFO${NC}: ${message}"
            ;;
    esac
}

# Verificar si Docker está ejecutándose
check_docker() {
    print_status "Verificando Docker..."
    if ! docker ps > /dev/null 2>&1; then
        print_status "Docker no está ejecutándose. Por favor, inicia Docker Desktop", "ERROR"
        exit 1
    fi
    print_status "Docker está ejecutándose correctamente", "SUCCESS"
}

# Verificar si el contenedor de PostgreSQL está ejecutándose
check_postgres() {
    print_status "Verificando PostgreSQL..."
    if docker ps --filter name=smd_vital_postgres --format "{{.Names}}" | grep -q "smd_vital_postgres"; then
        print_status "PostgreSQL está ejecutándose", "SUCCESS"
        return 0
    else
        print_status "PostgreSQL no está ejecutándose", "WARNING"
        return 1
    fi
}

# Iniciar PostgreSQL
start_postgres() {
    print_status "Iniciando PostgreSQL..."
    if docker-compose -f docker-compose.simple.yml up -d postgres; then
        print_status "PostgreSQL iniciado correctamente", "SUCCESS"
        print_status "Esperando a que PostgreSQL esté listo..."
        sleep 15
        return 0
    else
        print_status "Error al iniciar PostgreSQL", "ERROR"
        return 1
    fi
}

# Verificar conectividad a la base de datos
check_database_connection() {
    print_status "Verificando conexión a la base de datos..."
    
    # Intentar conectar a PostgreSQL
    if docker exec smd_vital_postgres pg_isready -U smdvital -d smdvital > /dev/null 2>&1; then
        print_status "Conexión a la base de datos exitosa", "SUCCESS"
        return 0
    else
        print_status "No se puede conectar a la base de datos", "ERROR"
        return 1
    fi
}

# Crear bases de datos si no existen
create_databases() {
    print_status "Creando bases de datos necesarias..."
    
    databases=("smdvital_auth" "smdvital_users" "smdvital_appointments" "smdvital_medical_records" "smdvital_payments" "smdvital_notifications")
    
    for db in "${databases[@]}"; do
        if docker exec smd_vital_postgres psql -U smdvital -d postgres -c "SELECT 1 FROM pg_database WHERE datname='$db';" | grep -q "1 row"; then
            print_status "Base de datos '$db' ya existe"
        else
            if docker exec smd_vital_postgres psql -U smdvital -d postgres -c "CREATE DATABASE $db;"; then
                print_status "Base de datos '$db' creada correctamente", "SUCCESS"
            else
                print_status "Error al crear base de datos '$db'", "ERROR"
            fi
        fi
    done
}

# Iniciar servicios del backend
start_backend_services() {
    print_status "Iniciando servicios del backend..."
    
    # Iniciar Redis
    print_status "Iniciando Redis..."
    docker-compose -f docker-compose.simple.yml up -d redis
    
    # Iniciar RabbitMQ
    print_status "Iniciando RabbitMQ..."
    docker-compose -f docker-compose.simple.yml up -d rabbitmq
    
    # Esperar a que los servicios estén listos
    print_status "Esperando a que los servicios estén listos..."
    sleep 10
    
    # Iniciar servicios de autenticación
    print_status "Iniciando servicio de autenticación..."
    docker-compose -f docker-compose.simple.yml up -d auth-service
    
    # Esperar a que el servicio de autenticación esté listo
    print_status "Esperando a que el servicio de autenticación esté listo..."
    sleep 15
    
    # Iniciar otros servicios
    print_status "Iniciando servicios adicionales..."
    docker-compose -f docker-compose.simple.yml up -d user-service appointment-service medical-records-service payment-service notification-service
    
    print_status "Servicios del backend iniciados", "SUCCESS"
}

# Verificar estado de los servicios
check_services() {
    print_status "Verificando estado de los servicios..."
    
    services=("postgres" "redis" "rabbitmq" "auth-service" "user-service")
    
    for service in "${services[@]}"; do
        if docker ps --filter name=smd_vital_$service --format "{{.Names}}" | grep -q "smd_vital_$service"; then
            print_status "Servicio '$service' está ejecutándose", "SUCCESS"
        else
            print_status "Servicio '$service' no está ejecutándose", "WARNING"
        fi
    done
}

# Mostrar URLs de acceso
show_access_urls() {
    print_status "=== URLs de Acceso ==="
    echo -e "${BLUE}API Gateway:${NC} http://localhost:8000"
    echo -e "${BLUE}Auth Service:${NC} http://localhost:8001"
    echo -e "${BLUE}User Service:${NC} http://localhost:8002"
    echo -e "${BLUE}Appointment Service:${NC} http://localhost:8003"
    echo -e "${BLUE}Medical Records Service:${NC} http://localhost:8005"
    echo -e "${BLUE}Payment Service:${NC} http://localhost:8006"
    echo -e "${BLUE}Notification Service:${NC} http://localhost:8004"
    echo -e "${BLUE}RabbitMQ Management:${NC} http://localhost:15672"
    echo ""
    echo -e "${GREEN}Credenciales de RabbitMQ:${NC}"
    echo -e "Usuario: smdvital"
    echo -e "Contraseña: rabbitmq_password_2024"
    echo ""
}

# Función principal
main() {
    print_status "Iniciando SMD Vital Backend..."
    
    # Verificar Docker
    check_docker
    
    # Verificar/iniciar PostgreSQL
    if ! check_postgres; then
        if ! start_postgres; then
            print_status "No se pudo iniciar PostgreSQL. Abortando.", "ERROR"
            exit 1
        fi
    fi
    
    # Verificar conexión a la base de datos
    if ! check_database_connection; then
        print_status "Creando bases de datos..."
        create_databases
        
        if ! check_database_connection; then
            print_status "Aún hay problemas de conexión. Abortando.", "ERROR"
            exit 1
        fi
    fi
    
    # Iniciar servicios del backend
    start_backend_services
    
    # Verificar estado de los servicios
    check_services
    
    # Mostrar URLs de acceso
    show_access_urls
    
    print_status "=== Backend iniciado correctamente ===", "SUCCESS"
    print_status "Puedes ahora iniciar el frontend"
    print_status "Para detener los servicios, ejecuta: docker-compose -f docker-compose.simple.yml down"
}

# Ejecutar función principal
main "$@"

