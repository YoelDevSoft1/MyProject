# Mejoras de Resiliencia Redis/RabbitMQ - SMD Vital
==================================================

## Análisis de Problemas Identificados

### 🔴 Problemas Críticos

#### 1. **Falta de Encriptación en Reposo**
- **Problema**: Datos sensibles almacenados sin encriptación en Redis
- **Riesgo**: Exposición de información médica y personal
- **Impacto**: Violación de HIPAA, GDPR y normativas de salud

#### 2. **Configuración de Seguridad Débil**
- **Problema**: Redis sin autenticación obligatoria en algunos entornos
- **Riesgo**: Acceso no autorizado a datos médicos
- **Impacto**: Brecha de seguridad crítica

#### 3. **Ausencia de Auditoría Completa**
- **Problema**: Falta logging detallado de operaciones
- **Riesgo**: Imposibilidad de rastrear accesos y cambios
- **Impacto**: No cumplimiento de regulaciones de auditoría

### 🟠 Problemas de Alta Prioridad

#### 4. **Manejo Inadecuado de Mensajes Duplicados**
- **Problema**: No hay detección automática de mensajes duplicados
- **Riesgo**: Procesamiento múltiple de transacciones médicas
- **Impacto**: Inconsistencias en registros médicos

#### 5. **Políticas de Reintentos Inconsistentes**
- **Problema**: Diferentes estrategias de reintento entre servicios
- **Riesgo**: Pérdida de mensajes críticos
- **Impacto**: Fallos en notificaciones médicas urgentes

#### 6. **Falta de Circuit Breakers Robustos**
- **Problema**: Circuit breakers básicos sin configuración avanzada
- **Riesgo**: Cascada de fallos en microservicios
- **Impacto**: Indisponibilidad del sistema médico

## 🚀 Mejoras Propuestas

### 1. **Implementación de Encriptación End-to-End**

#### Redis con Encriptación
```python
# services/shared/encryption/redis_encryption.py
import redis
from cryptography.fernet import Fernet
import json
import base64

class EncryptedRedis:
    def __init__(self, redis_client, encryption_key):
        self.redis = redis_client
        self.cipher = Fernet(encryption_key)
    
    def set(self, key, value, ttl=None):
        """Almacenar valor encriptado"""
        if isinstance(value, dict):
            value = json.dumps(value)
        
        encrypted_value = self.cipher.encrypt(value.encode())
        return self.redis.set(key, base64.b64encode(encrypted_value), ex=ttl)
    
    def get(self, key):
        """Obtener y desencriptar valor"""
        encrypted_data = self.redis.get(key)
        if not encrypted_data:
            return None
        
        try:
            encrypted_bytes = base64.b64decode(encrypted_data)
            decrypted_data = self.cipher.decrypt(encrypted_bytes)
            return json.loads(decrypted_data.decode())
        except Exception as e:
            logger.error(f"Error desencriptando clave {key}: {e}")
            return None
```

#### RabbitMQ con Encriptación de Mensajes
```python
# services/shared/encryption/message_encryption.py
from cryptography.fernet import Fernet
import json

class EncryptedMessagePublisher:
    def __init__(self, channel, encryption_key):
        self.channel = channel
        self.cipher = Fernet(encryption_key)
    
    def publish_encrypted(self, exchange, routing_key, message, **kwargs):
        """Publicar mensaje encriptado"""
        if isinstance(message, dict):
            message = json.dumps(message)
        
        encrypted_message = self.cipher.encrypt(message.encode())
        
        self.channel.basic_publish(
            exchange=exchange,
            routing_key=routing_key,
            body=encrypted_message,
            properties=pika.BasicProperties(
                content_type='application/encrypted',
                delivery_mode=2
            ),
            **kwargs
        )
```

### 2. **Sistema de Detección de Duplicados**

#### Implementación de Idempotencia
```python
# services/shared/idempotency/duplicate_detector.py
import redis
import hashlib
import json
from datetime import timedelta

class DuplicateDetector:
    def __init__(self, redis_client, ttl_seconds=3600):
        self.redis = redis_client
        self.ttl = ttl_seconds
    
    def generate_message_id(self, message_data, source_service):
        """Generar ID único basado en contenido y servicio"""
        content_hash = hashlib.sha256(
            json.dumps(message_data, sort_keys=True).encode()
        ).hexdigest()
        return f"{source_service}:{content_hash}"
    
    def is_duplicate(self, message_id):
        """Verificar si el mensaje es duplicado"""
        key = f"duplicate_check:{message_id}"
        exists = self.redis.exists(key)
        
        if not exists:
            # Marcar como procesado
            self.redis.setex(key, self.ttl, "processed")
            return False
        
        return True
    
    def mark_as_processed(self, message_id):
        """Marcar mensaje como procesado"""
        key = f"duplicate_check:{message_id}"
        self.redis.setex(key, self.ttl, "processed")
```

### 3. **Políticas de Reintentos Avanzadas**

#### Retry Strategy con Backoff Exponencial
```python
# services/shared/resilience/retry_strategy.py
import time
import random
from typing import Callable, Any
from enum import Enum

class RetryStrategy(Enum):
    FIXED = "fixed"
    EXPONENTIAL = "exponential"
    LINEAR = "linear"
    RANDOM = "random"

class AdvancedRetry:
    def __init__(self, max_retries=3, base_delay=1, max_delay=60, 
                 strategy=RetryStrategy.EXPONENTIAL, jitter=True):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.strategy = strategy
        self.jitter = jitter
    
    def calculate_delay(self, attempt):
        """Calcular delay basado en estrategia"""
        if self.strategy == RetryStrategy.FIXED:
            delay = self.base_delay
        elif self.strategy == RetryStrategy.EXPONENTIAL:
            delay = self.base_delay * (2 ** attempt)
        elif self.strategy == RetryStrategy.LINEAR:
            delay = self.base_delay * (attempt + 1)
        elif self.strategy == RetryStrategy.RANDOM:
            delay = random.uniform(0, self.base_delay * (2 ** attempt))
        else:
            delay = self.base_delay
        
        # Aplicar jitter para evitar thundering herd
        if self.jitter:
            jitter_factor = random.uniform(0.5, 1.5)
            delay *= jitter_factor
        
        return min(delay, self.max_delay)
    
    def execute_with_retry(self, func: Callable, *args, **kwargs) -> Any:
        """Ejecutar función con reintentos"""
        last_exception = None
        
        for attempt in range(self.max_retries + 1):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                
                if attempt < self.max_retries:
                    delay = self.calculate_delay(attempt)
                    logger.warning(f"Intento {attempt + 1} falló, reintentando en {delay:.2f}s")
                    time.sleep(delay)
                else:
                    logger.error(f"Todos los reintentos fallaron: {e}")
                    raise last_exception
        
        raise last_exception
```

### 4. **Circuit Breaker Avanzado**

#### Circuit Breaker con Métricas
```python
# services/shared/resilience/advanced_circuit_breaker.py
import time
from enum import Enum
from typing import Callable, Any
import threading

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class AdvancedCircuitBreaker:
    def __init__(self, failure_threshold=5, recovery_timeout=60, 
                 success_threshold=3, timeout=30):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold
        self.timeout = timeout
        
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
        self.lock = threading.Lock()
    
    def call(self, func: Callable, *args, **kwargs) -> Any:
        """Ejecutar función a través del circuit breaker"""
        with self.lock:
            if self.state == CircuitState.OPEN:
                if self._should_attempt_reset():
                    self.state = CircuitState.HALF_OPEN
                    self.success_count = 0
                else:
                    raise Exception("Circuit breaker is OPEN")
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e
    
    def _should_attempt_reset(self):
        """Verificar si se debe intentar reset"""
        return (time.time() - self.last_failure_time) > self.recovery_timeout
    
    def _on_success(self):
        """Manejar éxito"""
        with self.lock:
            if self.state == CircuitState.HALF_OPEN:
                self.success_count += 1
                if self.success_count >= self.success_threshold:
                    self.state = CircuitState.CLOSED
                    self.failure_count = 0
            elif self.state == CircuitState.CLOSED:
                self.failure_count = max(0, self.failure_count - 1)
    
    def _on_failure(self):
        """Manejar fallo"""
        with self.lock:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN
```

### 5. **Sistema de Auditoría Completo**

#### Auditoría de Acceso
```python
# services/shared/audit/access_auditor.py
import json
import time
from datetime import datetime
from typing import Dict, Any

class AccessAuditor:
    def __init__(self, redis_client, audit_queue):
        self.redis = redis_client
        self.audit_queue = audit_queue
    
    def log_access(self, user_id: str, resource: str, action: str, 
                   success: bool, metadata: Dict[str, Any] = None):
        """Registrar acceso a recurso"""
        audit_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "resource": resource,
            "action": action,
            "success": success,
            "metadata": metadata or {},
            "session_id": self._get_session_id(user_id)
        }
        
        # Almacenar en Redis con TTL
        audit_key = f"audit:{user_id}:{int(time.time())}"
        self.redis.setex(audit_key, 86400 * 30, json.dumps(audit_entry))  # 30 días
        
        # Enviar a cola de auditoría
        self.audit_queue.publish_audit_event(audit_entry)
    
    def log_data_access(self, user_id: str, data_type: str, 
                       record_id: str, action: str):
        """Registrar acceso a datos médicos"""
        self.log_access(
            user_id=user_id,
            resource=f"medical_data:{data_type}",
            action=action,
            success=True,
            metadata={
                "record_id": record_id,
                "data_type": data_type,
                "sensitive": True
            }
        )
```

### 6. **Configuración de Redis Mejorada**

#### redis.conf optimizado
```conf
# Redis Configuration for SMD Vital - Production
# =============================================

# Security
requirepass your_very_strong_password_here
protected-mode yes
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""

# Memory Management
maxmemory 2gb
maxmemory-policy allkeys-lru
maxmemory-samples 10

# Persistence
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes

# Append Only File
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Logging
loglevel notice
logfile "/var/log/redis/redis.log"

# Slow Log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Client Management
timeout 300
tcp-keepalive 300
maxclients 10000

# Advanced
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
set-max-intset-entries 512
zset-max-ziplist-entries 128
zset-max-ziplist-value 64

# Security
# Deshabilitar comandos peligrosos
rename-command CONFIG ""
rename-command SHUTDOWN ""
```

### 7. **Configuración de RabbitMQ Mejorada**

#### rabbitmq.conf optimizado
```conf
# RabbitMQ Configuration for SMD Vital - Production
# ==================================================

# Network
listeners.tcp.default = 5672
management.tcp.port = 15672

# Memory Management
vm_memory_high_watermark.relative = 0.6
vm_memory_high_watermark_paging_ratio = 0.5
disk_free_limit.absolute = 2GB

# Connection Limits
num_acceptors.tcp = 10
handshake_timeout = 10000
heartbeat = 60
frame_max = 131072
channel_max = 2047

# Queue Management
queue_master_locator = min-masters
queue_index_embed_msgs_below = 4096
msg_store_file_size_limit = 16777216

# Security
default_user = smdvital
default_pass = your_strong_password_here
default_vhost = smdvital

# Policies
default_policies.ha-mode = all
default_policies.ha-sync-mode = automatic
default_policies.ha-sync-batch-size = 1

# Message TTL
default_policies.message-ttl = 3600000

# Queue TTL
default_policies.expires = 3600000

# Dead Letter Exchange
default_policies.dead-letter-exchange = dlx
default_policies.dead-letter-routing-key = dlq

# Logging
log.console = true
log.console.level = info
log.file = true
log.file.level = info
log.file.rotation.date = $D0
log.file.rotation.size = 0

# Performance
tcp_listen_options.backlog = 128
tcp_listen_options.nodelay = true
tcp_listen_options.keepalive = true
```

### 8. **Monitoreo y Alertas**

#### Métricas de Resiliencia
```python
# services/shared/monitoring/resilience_metrics.py
from prometheus_client import Counter, Histogram, Gauge
import time

class ResilienceMetrics:
    def __init__(self):
        # Métricas de Redis
        self.redis_operations = Counter(
            'redis_operations_total',
            'Total Redis operations',
            ['operation', 'status']
        )
        
        self.redis_latency = Histogram(
            'redis_operation_duration_seconds',
            'Redis operation duration',
            ['operation']
        )
        
        # Métricas de RabbitMQ
        self.rabbitmq_messages = Counter(
            'rabbitmq_messages_total',
            'Total RabbitMQ messages',
            ['exchange', 'routing_key', 'status']
        )
        
        self.rabbitmq_queue_size = Gauge(
            'rabbitmq_queue_size',
            'RabbitMQ queue size',
            ['queue_name']
        )
        
        # Métricas de Circuit Breaker
        self.circuit_breaker_state = Gauge(
            'circuit_breaker_state',
            'Circuit breaker state',
            ['service', 'operation']
        )
        
        # Métricas de Reintentos
        self.retry_attempts = Counter(
            'retry_attempts_total',
            'Total retry attempts',
            ['service', 'operation', 'reason']
        )
    
    def record_redis_operation(self, operation, success, duration):
        """Registrar operación Redis"""
        status = 'success' if success else 'failure'
        self.redis_operations.labels(operation=operation, status=status).inc()
        self.redis_latency.labels(operation=operation).observe(duration)
    
    def record_rabbitmq_message(self, exchange, routing_key, success):
        """Registrar mensaje RabbitMQ"""
        status = 'success' if success else 'failure'
        self.rabbitmq_messages.labels(
            exchange=exchange,
            routing_key=routing_key,
            status=status
        ).inc()
    
    def update_circuit_breaker_state(self, service, operation, state):
        """Actualizar estado del circuit breaker"""
        state_value = {'closed': 0, 'open': 1, 'half_open': 2}[state]
        self.circuit_breaker_state.labels(
            service=service,
            operation=operation
        ).set(state_value)
```

## 📋 Plan de Implementación

### Fase 1: Seguridad Crítica (Semana 1-2)
1. ✅ Implementar encriptación en Redis
2. ✅ Configurar autenticación obligatoria
3. ✅ Implementar logging de auditoría básico

### Fase 2: Resiliencia (Semana 3-4)
1. ✅ Implementar detección de duplicados
2. ✅ Mejorar políticas de reintentos
3. ✅ Implementar circuit breakers avanzados

### Fase 3: Monitoreo (Semana 5-6)
1. ✅ Implementar métricas de resiliencia
2. ✅ Configurar alertas automáticas
3. ✅ Crear dashboards de monitoreo

### Fase 4: Optimización (Semana 7-8)
1. ✅ Optimizar configuraciones
2. ✅ Implementar pruebas de carga
3. ✅ Documentar procedimientos

## 🧪 Scripts de Prueba

### Ejecutar Pruebas de Resiliencia
```bash
# Ejecutar pruebas de fallos
python scripts/test_redis_rabbitmq_resilience.py

# Ejecutar auditoría de seguridad
python scripts/audit_data_leaks.py
```

### Monitoreo Continuo
```bash
# Verificar estado de servicios
docker-compose ps

# Verificar logs
docker-compose logs redis
docker-compose logs rabbitmq

# Verificar métricas
curl http://localhost:9090/metrics
```

## 📊 Métricas de Éxito

### Indicadores de Resiliencia
- **Disponibilidad**: > 99.9%
- **Tiempo de Recuperación**: < 30 segundos
- **Detección de Duplicados**: > 99.5%
- **Éxito de Reintentos**: > 95%

### Indicadores de Seguridad
- **Datos Encriptados**: 100%
- **Accesos Auditados**: 100%
- **Vulnerabilidades Críticas**: 0
- **Cumplimiento Normativo**: 100%

## 🔧 Comandos de Mantenimiento

### Backup de Redis
```bash
# Backup automático
redis-cli --rdb /backup/redis-$(date +%Y%m%d).rdb

# Restaurar backup
redis-cli --pipe < /backup/redis-20241201.rdb
```

### Limpieza de RabbitMQ
```bash
# Limpiar colas vacías
rabbitmqctl purge_queue queue_name

# Verificar estado
rabbitmqctl status
```

### Monitoreo de Recursos
```bash
# Uso de memoria Redis
redis-cli info memory

# Estadísticas RabbitMQ
rabbitmqctl list_queues name messages

# Métricas del sistema
docker stats
```

## 📚 Referencias

- [Redis Security](https://redis.io/docs/management/security/)
- [RabbitMQ Security](https://www.rabbitmq.com/security.html)
- [HIPAA Compliance](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [GDPR Compliance](https://gdpr.eu/compliance/)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Retry Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/retry)






