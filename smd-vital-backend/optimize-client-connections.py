#!/usr/bin/env python3
"""
Script para optimizar conexiones de clientes RabbitMQ
====================================================
Configura parámetros de conexión para reducir warnings
"""

import os
import sys
import json
from typing import Dict, Any

def create_rabbitmq_config() -> Dict[str, Any]:
    """Crear configuración optimizada para RabbitMQ"""
    return {
        "connection_params": {
            "heartbeat": 60,
            "blocked_connection_timeout": 300,
            "socket_timeout": 30,
            "connection_attempts": 3,
            "retry_delay": 5,
            "retry_backoff": 1.2,
            "retry_backoff_max": 30
        },
        "channel_params": {
            "prefetch_count": 1,
            "prefetch_size": 0,
            "global_prefetch_count": 0
        },
        "queue_params": {
            "durable": True,
            "auto_delete": False,
            "exclusive": False,
            "arguments": {
                "x-message-ttl": 3600000,  # 1 hora
                "x-expires": 86400000,     # 24 horas
                "x-max-length": 10000
            }
        },
        "exchange_params": {
            "durable": True,
            "auto_delete": False,
            "passive": False
        }
    }

def create_celery_config() -> str:
    """Crear configuración optimizada para Celery"""
    return """
# Celery Configuration Optimized
# =============================

# Broker settings
broker_url = 'amqp://smdvital:rabbitmq_password_2024@rabbitmq:5672/smdvital'
result_backend = 'redis://:redis_password_2024@redis:6379/3'

# Connection settings
broker_connection_retry = True
broker_connection_retry_on_startup = True
broker_connection_max_retries = 10
broker_heartbeat = 60
broker_pool_limit = 10

# Task settings
task_serializer = 'json'
accept_content = ['json']
result_serializer = 'json'
timezone = 'UTC'
enable_utc = True

# Worker settings
worker_prefetch_multiplier = 1
task_acks_late = True
worker_disable_rate_limits = False

# Result backend settings
result_expires = 3600
result_persistent = True

# Monitoring
worker_send_task_events = True
task_send_sent_event = True
"""

def main():
    """Función principal"""
    print("🔧 OPTIMIZANDO CONFIGURACIÓN DE RABBITMQ...")
    
    # Crear configuración
    config = create_rabbitmq_config()
    
    # Guardar configuración
    with open('config/rabbitmq_optimized.json', 'w') as f:
        json.dump(config, f, indent=2)
    
    # Crear configuración de Celery
    celery_config = create_celery_config()
    with open('config/celery_optimized.py', 'w') as f:
        f.write(celery_config)
    
    print("✅ CONFIGURACIÓN OPTIMIZADA CREADA")
    print("📁 Archivos generados:")
    print("   - config/rabbitmq_optimized.json")
    print("   - config/celery_optimized.py")
    print("\n🔧 Parámetros optimizados:")
    print("   - Heartbeat: 60 segundos")
    print("   - Timeout de socket: 30 segundos")
    print("   - Reintentos: 3 con backoff exponencial")
    print("   - Prefetch: 1 mensaje por worker")
    print("   - TTL de mensajes: 1 hora")

if __name__ == "__main__":
    main()

