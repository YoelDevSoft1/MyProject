#!/bin/bash

# SMD VITAL - Script de Corrección de Docker Compose
# ==================================================

echo "🔧 Iniciando corrección de Docker Compose..."

# Detener todos los contenedores
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

# Limpiar contenedores huérfanos
echo "🧹 Limpiando contenedores huérfanos..."
docker container prune -f

# Limpiar imágenes no utilizadas
echo "🗑️ Limpiando imágenes no utilizadas..."
docker image prune -f

# Limpiar volúmenes no utilizados
echo "💾 Limpiando volúmenes no utilizados..."
docker volume prune -f

# Reconstruir imágenes
echo "🔨 Reconstruyendo imágenes..."
docker-compose build --no-cache

# Iniciar servicios con el archivo corregido
echo "🚀 Iniciando servicios con configuración corregida..."
docker-compose -f docker-compose.fix.yml up -d

# Mostrar estado de los servicios
echo "📊 Estado de los servicios:"
docker-compose -f docker-compose.fix.yml ps

echo "✅ Corrección completada!"
echo "🌐 Servicios disponibles en:"
echo "   - Auth Service: http://localhost:8001"
echo "   - User Service: http://localhost:8002"
echo "   - Appointments: http://localhost:8003"
echo "   - Notifications: http://localhost:8004"
echo "   - Medical Records: http://localhost:8005"
echo "   - Payments: http://localhost:8006"
echo "   - RabbitMQ Management: http://localhost:15672"
echo "   - Redis: localhost:6379"
echo "   - PostgreSQL: localhost:5432"
