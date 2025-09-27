#!/bin/bash

# Script para corregir conexiones RabbitMQ en SMD VITAL
# ====================================================

echo "🔧 OPTIMIZANDO CONEXIONES RABBITMQ..."

# Configurar límites de conexión
docker exec smd_vital_rabbitmq rabbitmqctl set_policy -p smdvital connection-limit ".*" '{"max-connections": 100}' --apply-to all

# Configurar heartbeat
docker exec smd_vital_rabbitmq rabbitmqctl set_policy -p smdvital heartbeat ".*" '{"heartbeat": 60}' --apply-to all

# Configurar timeout de conexión
docker exec smd_vital_rabbitmq rabbitmqctl set_policy -p smdvital connection-timeout ".*" '{"connection-timeout": 30000}' --apply-to all

# Configurar límites de memoria
docker exec smd_vital_rabbitmq rabbitmqctl set_policy -p smdvital memory-limit ".*" '{"memory-limit": "512MB"}' --apply-to all

# Configurar límites de disco
docker exec smd_vital_rabbitmq rabbitmqctl set_policy -p smdvital disk-limit ".*" '{"disk-limit": "1GB"}' --apply-to all

# Configurar políticas de reconexión
docker exec smd_vital_rabbitmq rabbitmqctl set_policy -p smdvital reconnect-policy ".*" '{"reconnect-delay": 5000}' --apply-to all

echo "✅ CONFIGURACIÓN DE RABBITMQ OPTIMIZADA"
echo "📊 Políticas aplicadas:"
echo "   - Límite de conexiones: 100"
echo "   - Heartbeat: 60 segundos"
echo "   - Timeout de conexión: 30 segundos"
echo "   - Límite de memoria: 512MB"
echo "   - Límite de disco: 1GB"
echo "   - Delay de reconexión: 5 segundos"

