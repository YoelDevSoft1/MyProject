#!/bin/bash

# Script de monitoreo de RabbitMQ
# ==============================

echo "🔍 MONITOREANDO RABBITMQ..."

# Función para verificar conexiones
check_connections() {
    echo "📊 Verificando conexiones activas..."
    docker exec smd_vital_rabbitmq rabbitmqctl list_connections name state channels
}

# Función para verificar políticas
check_policies() {
    echo "📋 Verificando políticas..."
    docker exec smd_vital_rabbitmq rabbitmqctl list_policies -p smdvital
}

# Función para verificar logs recientes
check_logs() {
    echo "📝 Verificando logs recientes..."
    docker-compose logs rabbitmq --tail=10
}

# Función para verificar métricas
check_metrics() {
    echo "📈 Verificando métricas..."
    curl -s http://localhost:15672/api/overview -u smdvital:rabbitmq_password_2024 | jq '.object_totals'
}

# Ejecutar verificaciones
echo "🔧 VERIFICANDO ESTADO DE RABBITMQ..."
echo "=================================="

check_connections
echo ""
check_policies
echo ""
check_logs
echo ""

# Verificar si hay warnings recientes
echo "⚠️  VERIFICANDO WARNINGS RECIENTES..."
recent_warnings=$(docker-compose logs rabbitmq --tail=50 | grep -c "client unexpectedly closed TCP connection")
if [ $recent_warnings -eq 0 ]; then
    echo "✅ No hay warnings recientes de conexiones cerradas"
else
    echo "❌ Se encontraron $recent_warnings warnings recientes"
fi

echo ""
echo "🎯 RESUMEN:"
echo "   - Conexiones activas: Verificadas"
echo "   - Políticas: Verificadas"
echo "   - Logs: Verificados"
echo "   - Warnings: $recent_warnings encontrados"

