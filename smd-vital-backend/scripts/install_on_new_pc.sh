#!/bin/bash
# SMD Vital - Script de Instalación en Nueva PC
# ==============================================

echo "🚀 Instalando SMD Vital en nueva PC..."
echo "📅 Fecha: $(date)"

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo "📥 Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose no está instalado"
    exit 1
fi

echo "✅ Docker encontrado: $(docker --version)"
echo "✅ Docker Compose encontrado: $(docker-compose --version)"

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    cp env.example .env
    echo "✅ Archivo .env creado desde env.example"
else
    echo "✅ Archivo .env ya existe"
fi

# Verificar que existe el backup
if [ ! -f "smdvital_complete_backup_20250927_000353.sql" ]; then
    echo "❌ Error: No se encontró el archivo de backup"
    echo "📁 Asegúrate de que el archivo 'smdvital_complete_backup_20250927_000353.sql' esté en este directorio"
    exit 1
fi

echo "✅ Archivo de backup encontrado"

# Iniciar solo PostgreSQL primero
echo "🐘 Iniciando PostgreSQL..."
docker-compose up -d postgres

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 30

# Verificar que PostgreSQL está funcionando
echo "🔍 Verificando PostgreSQL..."
for i in {1..10}; do
    if docker exec smd_vital_postgres pg_isready -U smdvital; then
        echo "✅ PostgreSQL está listo"
        break
    else
        echo "⏳ Esperando... ($i/10)"
        sleep 10
    fi
done

# Restaurar la base de datos
echo "📦 Restaurando base de datos..."
docker exec -i smd_vital_postgres psql -U smdvital < smdvital_complete_backup_20250927_000353.sql

if [ $? -eq 0 ]; then
    echo "✅ Base de datos restaurada exitosamente"
else
    echo "❌ Error al restaurar la base de datos"
    exit 1
fi

# Iniciar todos los servicios
echo "🚀 Iniciando todos los servicios..."
docker-compose up -d

# Esperar a que todos los servicios estén listos
echo "⏳ Esperando a que todos los servicios estén listos..."
sleep 60

# Verificar servicios
echo "🔍 Verificando servicios..."
docker-compose ps

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📊 Servicios disponibles:"
echo "  - API Gateway: http://localhost:8000"
echo "  - PostgreSQL: localhost:5432 (smdvital/smdvital_password_2024)"
echo "  - Grafana: http://localhost:3005 (admin/smdvital_grafana_2024)"
echo "  - RabbitMQ: http://localhost:15672 (smdvital/rabbitmq_password_2024)"
echo ""
echo "🔧 Para verificar el estado:"
echo "  docker-compose ps"
echo "  docker-compose logs [servicio]"
