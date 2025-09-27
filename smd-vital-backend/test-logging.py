#!/usr/bin/env python3
"""
Script para enviar logs de prueba a Logstash.
Esto te permitirá ver logs en Kibana inmediatamente.
"""

import json
import time
import socket
import random
from datetime import datetime

def send_log_to_logstash(log_data):
    """Envía un log a Logstash via TCP."""
    try:
        # Conectar a Logstash
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect(('localhost', 5000))
        
        # Enviar el log como JSON
        log_json = json.dumps(log_data) + '\n'
        sock.send(log_json.encode('utf-8'))
        sock.close()
        
        print(f"✅ Log enviado: {log_data['message']}")
    except Exception as e:
        print(f"❌ Error enviando log: {e}")

def generate_sample_logs():
    """Genera logs de muestra para diferentes servicios."""
    
    services = [
        "auth-service",
        "user-service", 
        "appointment-service",
        "notification-service",
        "medical-records-service",
        "payment-service"
    ]
    
    events = [
        "user_login",
        "user_logout", 
        "appointment_created",
        "appointment_cancelled",
        "payment_processed",
        "notification_sent",
        "medical_record_created",
        "user_registration"
    ]
    
    error_types = [
        "database_connection_error",
        "invalid_credentials",
        "payment_failed",
        "notification_delivery_failed",
        "appointment_conflict"
    ]
    
    print("🚀 Generando logs de muestra para SMD Vital...")
    print("📊 Los logs aparecerán en Kibana en unos segundos...")
    print("🔗 Accede a: http://localhost:5601")
    print("-" * 50)
    
    for i in range(50):  # Generar 50 logs de muestra
        service = random.choice(services)
        event = random.choice(events)
        user_id = f"user_{random.randint(1000, 9999)}"
        
        # Log de request HTTP
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "service": service,
            "level": "INFO",
            "type": "http_request",
            "message": f"GET /api/{event}",
            "method": "GET",
            "path": f"/api/{event}",
            "user_id": user_id,
            "status_code": random.choice([200, 200, 200, 201, 400, 500]),  # Más 200s
            "duration_ms": round(random.uniform(50, 500), 2),
            "ip_address": f"192.168.1.{random.randint(1, 254)}",
            "request_id": f"req_{random.randint(10000, 99999)}"
        }
        
        send_log_to_logstash(log_data)
        
        # 20% de probabilidad de generar un error
        if random.random() < 0.2:
            error_type = random.choice(error_types)
            error_log = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "service": service,
                "level": "ERROR",
                "type": "error",
                "message": f"Error: {error_type}",
                "user_id": user_id,
                "error_type": error_type,
                "request_id": f"req_{random.randint(10000, 99999)}"
            }
            send_log_to_logstash(error_log)
        
        # 30% de probabilidad de generar evento de negocio
        if random.random() < 0.3:
            business_log = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "service": service,
                "level": "INFO",
                "type": "business_event",
                "message": f"Business event: {event}",
                "event_type": event,
                "user_id": user_id,
                "data": {
                    "appointment_id": f"apt_{random.randint(1000, 9999)}" if "appointment" in event else None,
                    "amount": random.randint(100, 5000) if "payment" in event else None,
                    "notification_type": "email" if "notification" in event else None
                }
            }
            send_log_to_logstash(business_log)
        
        time.sleep(0.5)  # Pausa entre logs
    
    print("-" * 50)
    print("✅ Generación de logs completada!")
    print("📊 Ve a Kibana para ver los logs:")
    print("   1. Accede a http://localhost:5601")
    print("   2. Ve a 'Discover' en el menú")
    print("   3. Selecciona el índice 'smd-vital-logs-*'")
    print("   4. ¡Explora tus logs!")

if __name__ == "__main__":
    generate_sample_logs()













