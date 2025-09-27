#!/usr/bin/env python3
"""
SMD Vital - Test de Resiliencia Redis y RabbitMQ
===============================================

Script para simular fallos, mensajes duplicados y verificar
políticas de reintentos en la integración Redis/RabbitMQ.
"""

import os
import sys
import time
import json
import random
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import redis
import pika
from pika.exchange_type import ExchangeType
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class TestResult:
    """Resultado de una prueba de resiliencia"""
    test_name: str
    success: bool
    duration: float
    error: Optional[str] = None
    metrics: Dict[str, Any] = None

class ResilienceTester:
    """Tester de resiliencia para Redis y RabbitMQ"""
    
    def __init__(self):
        self.redis_client = None
        self.rabbitmq_connection = None
        self.rabbitmq_channel = None
        self.test_results: List[TestResult] = []
        
    def connect_services(self):
        """Conectar a Redis y RabbitMQ"""
        try:
            # Redis
            self.redis_client = redis.Redis(
                host='localhost',
                port=6379,
                password='redis_password_2024',
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30
            )
            
            # RabbitMQ
            credentials = pika.PlainCredentials('smdvital', 'rabbitmq_password_2024')
            parameters = pika.ConnectionParameters(
                host='localhost',
                port=5672,
                virtual_host='smdvital',
                credentials=credentials,
                heartbeat=60,
                blocked_connection_timeout=300
            )
            
            self.rabbitmq_connection = pika.BlockingConnection(parameters)
            self.rabbitmq_channel = self.rabbitmq_connection.channel()
            
            logger.info("✅ Servicios conectados exitosamente")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error conectando servicios: {e}")
            return False
    
    def test_redis_connection_failure(self) -> TestResult:
        """Simular fallo de conexión Redis"""
        test_name = "Redis Connection Failure"
        start_time = time.time()
        
        try:
            # Simular desconexión
            if self.redis_client:
                self.redis_client.connection_pool.disconnect()
            
            # Intentar operaciones con Redis desconectado
            test_operations = [
                lambda: self.redis_client.set("test_key", "test_value"),
                lambda: self.redis_client.get("test_key"),
                lambda: self.redis_client.delete("test_key")
            ]
            
            failures = 0
            for operation in test_operations:
                try:
                    operation()
                except redis.ConnectionError:
                    failures += 1
            
            # Reconectar
            self.redis_client = redis.Redis(
                host='localhost',
                port=6379,
                password='redis_password_2024',
                decode_responses=True
            )
            
            # Verificar que funciona después de reconectar
            self.redis_client.set("recovery_test", "success")
            recovery_success = self.redis_client.get("recovery_test") == "success"
            
            duration = time.time() - start_time
            
            return TestResult(
                test_name=test_name,
                success=failures > 0 and recovery_success,
                duration=duration,
                metrics={
                    "connection_failures": failures,
                    "recovery_success": recovery_success,
                    "total_operations": len(test_operations)
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name=test_name,
                success=False,
                duration=time.time() - start_time,
                error=str(e)
            )
    
    def test_rabbitmq_connection_failure(self) -> TestResult:
        """Simular fallo de conexión RabbitMQ"""
        test_name = "RabbitMQ Connection Failure"
        start_time = time.time()
        
        try:
            # Simular desconexión
            if self.rabbitmq_connection and not self.rabbitmq_connection.is_closed:
                self.rabbitmq_connection.close()
            
            # Intentar operaciones con RabbitMQ desconectado
            test_operations = [
                lambda: self.rabbitmq_channel.basic_publish(
                    exchange='test_exchange',
                    routing_key='test_key',
                    body='test_message'
                ),
                lambda: self.rabbitmq_channel.queue_declare(queue='test_queue'),
                lambda: self.rabbitmq_channel.queue_delete(queue='test_queue')
            ]
            
            failures = 0
            for operation in test_operations:
                try:
                    operation()
                except (pika.exceptions.AMQPConnectionError, pika.exceptions.StreamLostError):
                    failures += 1
            
            # Reconectar
            credentials = pika.PlainCredentials('smdvital', 'rabbitmq_password_2024')
            parameters = pika.ConnectionParameters(
                host='localhost',
                port=5672,
                virtual_host='smdvital',
                credentials=credentials
            )
            
            self.rabbitmq_connection = pika.BlockingConnection(parameters)
            self.rabbitmq_channel = self.rabbitmq_connection.channel()
            
            # Verificar que funciona después de reconectar
            self.rabbitmq_channel.queue_declare(queue='recovery_test')
            self.rabbitmq_channel.queue_delete(queue='recovery_test')
            recovery_success = True
            
            duration = time.time() - start_time
            
            return TestResult(
                test_name=test_name,
                success=failures > 0 and recovery_success,
                duration=duration,
                metrics={
                    "connection_failures": failures,
                    "recovery_success": recovery_success,
                    "total_operations": len(test_operations)
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name=test_name,
                success=False,
                duration=time.time() - start_time,
                error=str(e)
            )
    
    def test_duplicate_messages(self) -> TestResult:
        """Simular mensajes duplicados en RabbitMQ"""
        test_name = "Duplicate Messages Handling"
        start_time = time.time()
        
        try:
            # Crear exchange y queue para testing
            exchange_name = "test_duplicate_exchange"
            queue_name = "test_duplicate_queue"
            
            self.rabbitmq_channel.exchange_declare(
                exchange=exchange_name,
                exchange_type=ExchangeType.direct,
                durable=True
            )
            
            self.rabbitmq_channel.queue_declare(queue=queue_name, durable=True)
            self.rabbitmq_channel.queue_bind(
                exchange=exchange_name,
                queue=queue_name,
                routing_key="test"
            )
            
            # Enviar mensajes duplicados
            message_id = f"msg_{int(time.time())}"
            duplicate_messages = []
            
            for i in range(5):  # Enviar 5 mensajes "duplicados"
                message = {
                    "id": message_id,  # Mismo ID
                    "content": f"Duplicate message {i}",
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                self.rabbitmq_channel.basic_publish(
                    exchange=exchange_name,
                    routing_key="test",
                    body=json.dumps(message),
                    properties=pika.BasicProperties(
                        message_id=message_id,
                        delivery_mode=2,  # Persistente
                        timestamp=int(time.time())
                    )
                )
                duplicate_messages.append(message)
            
            # Consumir mensajes y detectar duplicados
            received_messages = []
            message_ids = set()
            duplicates_detected = 0
            
            def callback(ch, method, properties, body):
                nonlocal duplicates_detected
                message = json.loads(body)
                received_messages.append(message)
                
                if properties.message_id in message_ids:
                    duplicates_detected += 1
                    logger.warning(f"⚠️  Mensaje duplicado detectado: {properties.message_id}")
                else:
                    message_ids.add(properties.message_id)
                
                ch.basic_ack(delivery_tag=method.delivery_tag)
            
            self.rabbitmq_channel.basic_consume(
                queue=queue_name,
                on_message_callback=callback
            )
            
            # Consumir por un tiempo limitado
            timeout = 5
            start_consume = time.time()
            
            while time.time() - start_consume < timeout:
                self.rabbitmq_connection.process_data_events(time_limit=0.1)
                if len(received_messages) >= len(duplicate_messages):
                    break
            
            # Limpiar
            self.rabbitmq_channel.queue_delete(queue=queue_name)
            self.rabbitmq_channel.exchange_delete(exchange=exchange_name)
            
            duration = time.time() - start_time
            
            return TestResult(
                test_name=test_name,
                success=duplicates_detected > 0,
                duration=duration,
                metrics={
                    "messages_sent": len(duplicate_messages),
                    "messages_received": len(received_messages),
                    "duplicates_detected": duplicates_detected,
                    "unique_message_ids": len(message_ids)
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name=test_name,
                success=False,
                duration=time.time() - start_time,
                error=str(e)
            )
    
    def test_redis_memory_pressure(self) -> TestResult:
        """Simular presión de memoria en Redis"""
        test_name = "Redis Memory Pressure"
        start_time = time.time()
        
        try:
            # Obtener información de memoria actual
            info_before = self.redis_client.info('memory')
            used_memory_before = info_before['used_memory']
            
            # Generar datos grandes para llenar memoria
            large_data = "x" * 1024 * 1024  # 1MB por clave
            keys_created = 0
            memory_errors = 0
            
            try:
                for i in range(100):  # Intentar crear 100 claves de 1MB
                    key = f"memory_test_{i}"
                    self.redis_client.set(key, large_data)
                    keys_created += 1
                    
            except redis.ResponseError as e:
                if "OOM" in str(e):
                    memory_errors += 1
                    logger.warning(f"⚠️  Redis OOM error: {e}")
            
            # Verificar política de evicción
            info_after = self.redis_client.info('memory')
            used_memory_after = info_after['used_memory']
            
            # Limpiar datos de prueba
            for i in range(keys_created):
                self.redis_client.delete(f"memory_test_{i}")
            
            duration = time.time() - start_time
            
            return TestResult(
                test_name=test_name,
                success=memory_errors > 0 or (used_memory_after > used_memory_before),
                duration=duration,
                metrics={
                    "keys_created": keys_created,
                    "memory_errors": memory_errors,
                    "memory_before": used_memory_before,
                    "memory_after": used_memory_after,
                    "memory_increase": used_memory_after - used_memory_before
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name=test_name,
                success=False,
                duration=time.time() - start_time,
                error=str(e)
            )
    
    def test_rabbitmq_queue_overflow(self) -> TestResult:
        """Simular desbordamiento de cola en RabbitMQ"""
        test_name = "RabbitMQ Queue Overflow"
        start_time = time.time()
        
        try:
            # Crear cola con límite pequeño
            queue_name = "test_overflow_queue"
            
            # Declarar cola con límite de mensajes
            self.rabbitmq_channel.queue_declare(
                queue=queue_name,
                durable=True,
                arguments={
                    'x-max-length': 10,  # Máximo 10 mensajes
                    'x-overflow': 'reject-publish'  # Rechazar mensajes cuando esté llena
                }
            )
            
            # Intentar enviar más mensajes de los permitidos
            messages_sent = 0
            rejected_messages = 0
            
            for i in range(15):  # Intentar enviar 15 mensajes a una cola de 10
                try:
                    message = {
                        "id": f"overflow_msg_{i}",
                        "content": f"Message {i}",
                        "timestamp": datetime.utcnow().isoformat()
                    }
                    
                    self.rabbitmq_channel.basic_publish(
                        exchange='',
                        routing_key=queue_name,
                        body=json.dumps(message),
                        properties=pika.BasicProperties(delivery_mode=2)
                    )
                    messages_sent += 1
                    
                except pika.exceptions.UnroutableError:
                    rejected_messages += 1
                    logger.warning(f"⚠️  Mensaje rechazado por desbordamiento: {i}")
            
            # Verificar estado de la cola
            queue_info = self.rabbitmq_channel.queue_declare(queue=queue_name, passive=True)
            queue_length = queue_info.method.message_count
            
            # Limpiar
            self.rabbitmq_channel.queue_delete(queue=queue_name)
            
            duration = time.time() - start_time
            
            return TestResult(
                test_name=test_name,
                success=rejected_messages > 0,
                duration=duration,
                metrics={
                    "messages_sent": messages_sent,
                    "rejected_messages": rejected_messages,
                    "queue_length": queue_length,
                    "queue_limit": 10
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name=test_name,
                success=False,
                duration=time.time() - start_time,
                error=str(e)
            )
    
    def test_concurrent_operations(self) -> TestResult:
        """Simular operaciones concurrentes en Redis y RabbitMQ"""
        test_name = "Concurrent Operations"
        start_time = time.time()
        
        try:
            def redis_operations():
                """Operaciones concurrentes en Redis"""
                results = []
                for i in range(50):
                    try:
                        key = f"concurrent_test_{i}"
                        self.redis_client.set(key, f"value_{i}")
                        value = self.redis_client.get(key)
                        self.redis_client.delete(key)
                        results.append(True)
                    except Exception as e:
                        results.append(False)
                return results
            
            def rabbitmq_operations():
                """Operaciones concurrentes en RabbitMQ"""
                results = []
                for i in range(50):
                    try:
                        queue_name = f"concurrent_queue_{i}"
                        self.rabbitmq_channel.queue_declare(queue=queue_name)
                        self.rabbitmq_channel.queue_delete(queue=queue_name)
                        results.append(True)
                    except Exception as e:
                        results.append(False)
                return results
            
            # Ejecutar operaciones concurrentes
            with ThreadPoolExecutor(max_workers=10) as executor:
                redis_future = executor.submit(redis_operations)
                rabbitmq_future = executor.submit(rabbitmq_operations)
                
                redis_results = redis_future.result()
                rabbitmq_results = rabbitmq_future.result()
            
            redis_success_rate = sum(redis_results) / len(redis_results)
            rabbitmq_success_rate = sum(rabbitmq_results) / len(rabbitmq_results)
            
            duration = time.time() - start_time
            
            return TestResult(
                test_name=test_name,
                success=redis_success_rate > 0.9 and rabbitmq_success_rate > 0.9,
                duration=duration,
                metrics={
                    "redis_success_rate": redis_success_rate,
                    "rabbitmq_success_rate": rabbitmq_success_rate,
                    "total_operations": len(redis_results) + len(rabbitmq_results)
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name=test_name,
                success=False,
                duration=time.time() - start_time,
                error=str(e)
            )
    
    def test_retry_policies(self) -> TestResult:
        """Probar políticas de reintentos"""
        test_name = "Retry Policies"
        start_time = time.time()
        
        try:
            # Simular fallos temporales
            retry_attempts = []
            max_retries = 3
            base_delay = 1
            
            for attempt in range(max_retries + 1):
                try:
                    # Simular operación que puede fallar
                    if attempt < 2:  # Fallar las primeras 2 veces
                        raise redis.ConnectionError("Simulated connection error")
                    else:
                        # Éxito en el tercer intento
                        self.redis_client.ping()
                        retry_attempts.append({
                            "attempt": attempt + 1,
                            "success": True,
                            "delay": base_delay * (2 ** attempt)
                        })
                        break
                        
                except redis.ConnectionError as e:
                    retry_attempts.append({
                        "attempt": attempt + 1,
                        "success": False,
                        "delay": base_delay * (2 ** attempt),
                        "error": str(e)
                    })
                    
                    if attempt < max_retries:
                        time.sleep(base_delay * (2 ** attempt))
            
            success = any(attempt["success"] for attempt in retry_attempts)
            duration = time.time() - start_time
            
            return TestResult(
                test_name=test_name,
                success=success,
                duration=duration,
                metrics={
                    "retry_attempts": retry_attempts,
                    "total_attempts": len(retry_attempts),
                    "successful_attempt": next(
                        (i for i, attempt in enumerate(retry_attempts) if attempt["success"]), None
                    )
                }
            )
            
        except Exception as e:
            return TestResult(
                test_name=test_name,
                success=False,
                duration=time.time() - start_time,
                error=str(e)
            )
    
    def run_all_tests(self) -> List[TestResult]:
        """Ejecutar todas las pruebas de resiliencia"""
        logger.info("🚀 Iniciando pruebas de resiliencia Redis/RabbitMQ...")
        
        if not self.connect_services():
            logger.error("❌ No se pudieron conectar los servicios")
            return []
        
        tests = [
            self.test_redis_connection_failure,
            self.test_rabbitmq_connection_failure,
            self.test_duplicate_messages,
            self.test_redis_memory_pressure,
            self.test_rabbitmq_queue_overflow,
            self.test_concurrent_operations,
            self.test_retry_policies
        ]
        
        for test_func in tests:
            try:
                logger.info(f"🧪 Ejecutando: {test_func.__name__}")
                result = test_func()
                self.test_results.append(result)
                
                status = "✅" if result.success else "❌"
                logger.info(f"{status} {result.test_name} - {result.duration:.2f}s")
                
                if result.error:
                    logger.error(f"   Error: {result.error}")
                
                if result.metrics:
                    logger.info(f"   Métricas: {result.metrics}")
                    
            except Exception as e:
                logger.error(f"❌ Error ejecutando {test_func.__name__}: {e}")
        
        return self.test_results
    
    def generate_report(self) -> str:
        """Generar reporte de resultados"""
        if not self.test_results:
            return "No hay resultados para reportar"
        
        total_tests = len(self.test_results)
        successful_tests = sum(1 for result in self.test_results if result.success)
        failed_tests = total_tests - successful_tests
        
        report = f"""
# Reporte de Resiliencia Redis/RabbitMQ
=====================================

## Resumen General
- Total de pruebas: {total_tests}
- Exitosas: {successful_tests} ({successful_tests/total_tests*100:.1f}%)
- Fallidas: {failed_tests} ({failed_tests/total_tests*100:.1f}%)

## Detalles por Prueba
"""
        
        for result in self.test_results:
            status = "✅ PASS" if result.success else "❌ FAIL"
            report += f"""
### {result.test_name}
- Estado: {status}
- Duración: {result.duration:.2f}s
"""
            if result.error:
                report += f"- Error: {result.error}\n"
            
            if result.metrics:
                report += "- Métricas:\n"
                for key, value in result.metrics.items():
                    report += f"  - {key}: {value}\n"
        
        return report

def main():
    """Función principal"""
    logger.info("🔧 SMD Vital - Test de Resiliencia Redis/RabbitMQ")
    
    tester = ResilienceTester()
    results = tester.run_all_tests()
    
    # Generar reporte
    report = tester.generate_report()
    print(report)
    
    # Guardar reporte
    report_file = f"resilience_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    logger.info(f"📄 Reporte guardado en: {report_file}")
    
    # Cerrar conexiones
    if tester.redis_client:
        tester.redis_client.close()
    if tester.rabbitmq_connection and not tester.rabbitmq_connection.is_closed:
        tester.rabbitmq_connection.close()

if __name__ == "__main__":
    main()







