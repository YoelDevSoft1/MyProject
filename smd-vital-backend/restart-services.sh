#!/bin/bash

# Script para reiniciar servicios SMD Vital
echo "🔄 Reiniciando servicios SMD Vital..."

# Detener todos los contenedores
echo "⏹️  Deteniendo contenedores..."
docker-compose down

# Limpiar contenedores huérfanos
echo "🧹 Limpiando contenedores huérfanos..."
docker-compose down --remove-orphans

# Reconstruir imágenes si es necesario
echo "🔨 Reconstruyendo imágenes..."
docker-compose build --no-cache

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose ps

# Probar endpoints
echo "🧪 Probando endpoints..."

# Health check nginx
echo "Testing nginx health..."
curl -f http://localhost:8000/health || echo "❌ Nginx no responde"

# Health check auth service
echo "Testing auth service health..."
curl -f http://localhost:8001/health || echo "❌ Auth service no responde"

# Health check notification service
echo "Testing notification service health..."
curl -f http://localhost:8004/health || echo "❌ Notification service no responde"

# Health check medical records service
echo "Testing medical records service health..."
curl -f http://localhost:8005/health || echo "❌ Medical records service no responde"

# Health check payment service
echo "Testing payment service health..."
curl -f http://localhost:8006/health || echo "❌ Payment service no responde"

echo "✅ Reinicio completado!"
echo "🌐 Frontend: http://localhost:3001"
echo "🔧 API Gateway: http://localhost:8000"
echo "📊 Grafana: http://localhost:3005"
echo "🔍 Jaeger: http://localhost:16686"










