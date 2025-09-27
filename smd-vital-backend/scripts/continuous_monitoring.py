#!/usr/bin/env python3
"""
SMD Vital - Monitoreo Continuo de Resiliencia
============================================

Script para monitoreo continuo de la resiliencia de Redis y RabbitMQ,
con alertas automáticas y métricas en tiempo real.
"""

import os
import sys
import time
import json
import logging
import threading
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import redis
import pika
from prometheus_client import start_http_server, Counter, Histogram, Gauge, CollectorRegistry
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ResilienceMonitor:
    """Monitor de resiliencia para Redis y RabbitMQ"""
    
    def __init__(self, config_file: str = None):
        self.config = self._load_config(config_file)
        self.redis_client = None
        self.rabbitmq_connection = None
        self.rabbitmq_channel = None
        self.monitoring_active = False
        self.metrics_registry = CollectorRegistry()
        self._setup_metrics()
        
    def _load_config(self, config_file: str) -> Dict[str, Any]:
        """Cargar configuración"""
        default_config = {
            "redis": {
                "host": "localhost",
                "port": 6379,
                "password": "redis_password_2024"
            },
            "rabbitmq": {
                "host": "localhost",
                "port": 5672,
                "username": "smdvital",
                "password": "rabbitmq_password_2024",
                "vhost": "smdvital"
            },
            "monitoring": {
                "interval": 30,
                "alert_thresholds": {
                    "redis_memory_usage": 80,
                    "rabbitmq_queue_size": 1000,
                    "connection_failures": 5,
                    "response_time": 5.0
                },
                "email_alerts": {
                    "enabled": False,
                    "smtp_server": "smtp.gmail.com",
                    "smtp_port": 587,
                    "username": "",
                    "password": "",
                    "recipients": []
                }
            }
        }
        
        if config_file and os.path.exists(config_file):
            with open(config_file, 'r') as f:
                user_config = json.load(f)
                default_config.update(user_config)
        
        return default_config
    
    def _setup_metrics(self):
        """Configurar métricas de Prometheus"""
        # Métricas de Redis
        self.redis_operations = Counter(
            'redis_operations_total',
            'Total Redis operations',
            ['operation', 'status'],
            registry=self.metrics_registry
        )
        
        self.redis_memory_usage = Gauge(
            'redis_memory_usage_bytes',
            'Redis memory usage in bytes',
            registry=self.metrics_registry
        )
        
        self.redis_connected_clients = Gauge(
            'redis_connected_clients',
            'Number of connected Redis clients',
            registry=self.metrics_registry
        )
        
        self.redis_response_time = Histogram(
            'redis_response_time_seconds',
            'Redis response time in seconds',
            ['operation'],
            registry=self.metrics_registry
        )
        
        # Métricas de RabbitMQ
        self.rabbitmq_messages = Counter(
            'rabbitmq_messages_total',
            'Total RabbitMQ messages',
            ['exchange', 'routing_key', 'status'],
            registry=self.metrics_registry
        )
        
        self.rabbitmq_queue_size = Gauge(
            'rabbitmq_queue_size',
            'RabbitMQ queue size',
            ['queue_name'],
            registry=self.metrics_registry
        )
        
        self.rabbitmq_connections = Gauge(
            'rabbitmq_connections',
            'Number of RabbitMQ connections',
            registry=self.metrics_registry
        )
        
        # Métricas de Circuit Breaker
        self.circuit_breaker_state = Gauge(
            'circuit_breaker_state',
            'Circuit breaker state',
            ['service', 'operation'],
            registry=self.metrics_registry
        )
        
        # Métricas de Alertas
        self.alerts_triggered = Counter(
            'alerts_triggered_total',
            'Total alerts triggered',
            ['alert_type', 'severity'],
            registry=self.metrics_registry
        )
    
    def connect_services(self):
        """Conectar a servicios"""
        try:
            # Redis
            self.redis_client = redis.Redis(
                host=self.config['redis']['host'],
                port=self.config['redis']['port'],
                password=self.config['redis']['password'],
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            
            # RabbitMQ
            credentials = pika.PlainCredentials(
                self.config['rabbitmq']['username'],
                self.config['rabbitmq']['password']
            )
            parameters = pika.ConnectionParameters(
                host=self.config['rabbitmq']['host'],
                port=self.config['rabbitmq']['port'],
                virtual_host=self.config['rabbitmq']['vhost'],
                credentials=credentials,
                heartbeat=60
            )
            
            self.rabbitmq_connection = pika.BlockingConnection(parameters)
            self.rabbitmq_channel = self.rabbitmq_connection.channel()
            
            logger.info("✅ Servicios conectados para monitoreo")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error conectando servicios: {e}")
            return False
    
    def monitor_redis(self):
        """Monitorear Redis"""
        try:
            start_time = time.time()
            
            # Verificar conexión
            self.redis_client.ping()
            
            # Obtener información del sistema
            info = self.redis_client.info()
            
            # Métricas de memoria
            used_memory = info.get('used_memory', 0)
            max_memory = info.get('maxmemory', 0)
            memory_usage_percent = (used_memory / max_memory * 100) if max_memory > 0 else 0
            
            self.redis_memory_usage.set(used_memory)
            self.redis_connected_clients.set(info.get('connected_clients', 0))
            
            # Verificar umbrales de alerta
            if memory_usage_percent > self.config['monitoring']['alert_thresholds']['redis_memory_usage']:
                self._trigger_alert('redis_memory_high', 'HIGH', 
                                  f"Redis memory usage: {memory_usage_percent:.1f}%")
            
            # Métricas de operaciones
            total_commands = info.get('total_commands_processed', 0)
            self.redis_operations.labels(operation='total', status='success').inc(total_commands)
            
            # Tiempo de respuesta
            response_time = time.time() - start_time
            self.redis_response_time.labels(operation='ping').observe(response_time)
            
            if response_time > self.config['monitoring']['alert_thresholds']['response_time']:
                self._trigger_alert('redis_slow_response', 'MEDIUM',
                                  f"Redis response time: {response_time:.2f}s")
            
            logger.debug(f"Redis monitoring: memory={memory_usage_percent:.1f}%, "
                        f"clients={info.get('connected_clients', 0)}, "
                        f"response_time={response_time:.3f}s")
            
        except Exception as e:
            logger.error(f"❌ Error monitoreando Redis: {e}")
            self._trigger_alert('redis_connection_error', 'CRITICAL', str(e))
    
    def monitor_rabbitmq(self):
        """Monitorear RabbitMQ"""
        try:
            # Verificar conexión
            if not self.rabbitmq_connection or self.rabbitmq_connection.is_closed:
                self._trigger_alert('rabbitmq_connection_lost', 'CRITICAL', 
                                  "RabbitMQ connection lost")
                return
            
            # Obtener información de colas
            # (Esto requeriría acceso a la API de gestión de RabbitMQ)
            # Por ahora, verificamos la conexión básica
            
            # Simular métricas de colas (en implementación real, usar API de gestión)
            test_queues = ['notifications', 'appointments', 'payments']
            for queue_name in test_queues:
                try:
                    # Declarar cola para verificar que existe
                    self.rabbitmq_channel.queue_declare(queue=queue_name, passive=True)
                    # En implementación real, obtener tamaño real de la cola
                    queue_size = 0  # Placeholder
                    self.rabbitmq_queue_size.labels(queue_name=queue_name).set(queue_size)
                    
                    if queue_size > self.config['monitoring']['alert_thresholds']['rabbitmq_queue_size']:
                        self._trigger_alert('rabbitmq_queue_large', 'MEDIUM',
                                          f"Queue {queue_name} size: {queue_size}")
                except Exception as e:
                    logger.warning(f"⚠️  Error verificando cola {queue_name}: {e}")
            
            logger.debug("RabbitMQ monitoring completed")
            
        except Exception as e:
            logger.error(f"❌ Error monitoreando RabbitMQ: {e}")
            self._trigger_alert('rabbitmq_monitoring_error', 'HIGH', str(e))
    
    def _trigger_alert(self, alert_type: str, severity: str, message: str):
        """Disparar alerta"""
        logger.warning(f"🚨 ALERTA [{severity}] {alert_type}: {message}")
        
        # Registrar métrica
        self.alerts_triggered.labels(alert_type=alert_type, severity=severity).inc()
        
        # Enviar email si está configurado
        if self.config['monitoring']['email_alerts']['enabled']:
            self._send_email_alert(alert_type, severity, message)
    
    def _send_email_alert(self, alert_type: str, severity: str, message: str):
        """Enviar alerta por email"""
        try:
            email_config = self.config['monitoring']['email_alerts']
            
            msg = MIMEMultipart()
            msg['From'] = email_config['username']
            msg['To'] = ', '.join(email_config['recipients'])
            msg['Subject'] = f"[SMD Vital] {severity} Alert: {alert_type}"
            
            body = f"""
            Alerta de Monitoreo - SMD Vital
            ================================
            
            Tipo: {alert_type}
            Severidad: {severity}
            Mensaje: {message}
            Timestamp: {datetime.utcnow().isoformat()}
            
            Por favor, revise el sistema inmediatamente.
            """
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(email_config['smtp_server'], email_config['smtp_port'])
            server.starttls()
            server.login(email_config['username'], email_config['password'])
            server.send_message(msg)
            server.quit()
            
            logger.info(f"📧 Alerta enviada por email: {alert_type}")
            
        except Exception as e:
            logger.error(f"❌ Error enviando email: {e}")
    
    def monitor_circuit_breakers(self):
        """Monitorear circuit breakers"""
        # En implementación real, esto verificaría el estado de circuit breakers
        # Por ahora, simulamos algunos estados
        
        services = ['user-service', 'appointment-service', 'notification-service']
        operations = ['api_call', 'database_query', 'external_api']
        
        for service in services:
            for operation in operations:
                # Simular estado del circuit breaker
                state = 0  # 0=closed, 1=open, 2=half_open
                self.circuit_breaker_state.labels(service=service, operation=operation).set(state)
    
    def run_monitoring_cycle(self):
        """Ejecutar ciclo de monitoreo"""
        logger.info("🔍 Ejecutando ciclo de monitoreo...")
        
        try:
            # Monitorear Redis
            self.monitor_redis()
            
            # Monitorear RabbitMQ
            self.monitor_rabbitmq()
            
            # Monitorear circuit breakers
            self.monitor_circuit_breakers()
            
            logger.info("✅ Ciclo de monitoreo completado")
            
        except Exception as e:
            logger.error(f"❌ Error en ciclo de monitoreo: {e}")
    
    def start_monitoring(self):
        """Iniciar monitoreo continuo"""
        logger.info("🚀 Iniciando monitoreo continuo...")
        
        if not self.connect_services():
            logger.error("❌ No se pudieron conectar los servicios")
            return False
        
        # Iniciar servidor de métricas
        start_http_server(8000, registry=self.metrics_registry)
        logger.info("📊 Servidor de métricas iniciado en puerto 8000")
        
        self.monitoring_active = True
        
        try:
            while self.monitoring_active:
                self.run_monitoring_cycle()
                time.sleep(self.config['monitoring']['interval'])
                
        except KeyboardInterrupt:
            logger.info("🛑 Monitoreo detenido por usuario")
        except Exception as e:
            logger.error(f"❌ Error en monitoreo: {e}")
        finally:
            self.stop_monitoring()
        
        return True
    
    def stop_monitoring(self):
        """Detener monitoreo"""
        logger.info("🛑 Deteniendo monitoreo...")
        self.monitoring_active = False
        
        # Cerrar conexiones
        if self.redis_client:
            self.redis_client.close()
        if self.rabbitmq_connection and not self.rabbitmq_connection.is_closed:
            self.rabbitmq_connection.close()
        
        logger.info("✅ Monitoreo detenido")
    
    def generate_health_report(self) -> Dict[str, Any]:
        """Generar reporte de salud del sistema"""
        try:
            # Información de Redis
            redis_info = self.redis_client.info() if self.redis_client else {}
            redis_health = {
                "connected": self.redis_client is not None,
                "memory_usage": redis_info.get('used_memory', 0),
                "connected_clients": redis_info.get('connected_clients', 0),
                "uptime": redis_info.get('uptime_in_seconds', 0)
            }
            
            # Información de RabbitMQ
            rabbitmq_health = {
                "connected": self.rabbitmq_connection is not None and not self.rabbitmq_connection.is_closed,
                "channels": 1 if self.rabbitmq_channel else 0
            }
            
            # Estado general
            overall_health = "healthy" if redis_health["connected"] and rabbitmq_health["connected"] else "unhealthy"
            
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "overall_health": overall_health,
                "redis": redis_health,
                "rabbitmq": rabbitmq_health,
                "monitoring_active": self.monitoring_active
            }
            
        except Exception as e:
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "overall_health": "error",
                "error": str(e),
                "monitoring_active": self.monitoring_active
            }

def main():
    """Función principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='SMD Vital - Monitoreo Continuo de Resiliencia')
    parser.add_argument('--config', help='Archivo de configuración JSON')
    parser.add_argument('--interval', type=int, help='Intervalo de monitoreo en segundos')
    parser.add_argument('--once', action='store_true', help='Ejecutar una sola vez')
    
    args = parser.parse_args()
    
    logger.info("🔍 SMD Vital - Monitoreo Continuo de Resiliencia")
    
    monitor = ResilienceMonitor(args.config)
    
    if args.interval:
        monitor.config['monitoring']['interval'] = args.interval
    
    if args.once:
        # Ejecutar una sola vez
        if monitor.connect_services():
            monitor.run_monitoring_cycle()
            report = monitor.generate_health_report()
            print(json.dumps(report, indent=2))
        else:
            logger.error("❌ No se pudieron conectar los servicios")
            sys.exit(1)
    else:
        # Monitoreo continuo
        try:
            monitor.start_monitoring()
        except KeyboardInterrupt:
            logger.info("🛑 Monitoreo detenido")
        except Exception as e:
            logger.error(f"❌ Error en monitoreo: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()






