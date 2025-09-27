"""
SMD Vital - Microservices Celery Tasks
======================================

Tareas de Celery optimizadas para arquitectura de microservicios con:
- Comunicación entre servicios
- Distributed tracing
- Circuit breakers
- Service discovery
- Observabilidad completa
"""

import os
import json
import time
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum
from functools import wraps

import requests
import aiohttp
from celery import current_task
from celery.exceptions import Retry, MaxRetriesExceededError
from celery.signals import task_prerun, task_postrun, task_failure
from celery.utils.log import get_task_logger
from opentelemetry import trace, metrics
from opentelemetry.trace import Status, StatusCode
from prometheus_client import Counter, Histogram, Gauge
from pybreaker import CircuitBreaker, CircuitBreakerError

from .app import celery
from .app.config import Config
from .app.utils.service_discovery import ServiceRegistry
from .app.utils.security import encrypt_sensitive_data, decrypt_sensitive_data
from .app.utils.rate_limiter import DistributedRateLimiter

# Configurar tracing y métricas
tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)

# Métricas Prometheus
task_counter = Counter('celery_tasks_total', 'Total number of Celery tasks', ['task_name', 'status'])
task_duration = Histogram('celery_task_duration_seconds', 'Task duration in seconds', ['task_name'])
active_tasks = Gauge('celery_active_tasks', 'Number of active tasks', ['task_name'])

logger = get_task_logger(__name__)

class ServiceEndpoints:
    """Endpoints de microservicios"""
    USER_SERVICE = "http://user-service:8002"
    APPOINTMENT_SERVICE = "http://appointment-service:8003"
    NOTIFICATION_SERVICE = "http://notification-service:8004"
    MEDICAL_RECORDS_SERVICE = "http://medical-records-service:8005"
    PAYMENT_SERVICE = "http://payment-service:8006"
    AUTH_SERVICE = "http://auth-service:8001"

@dataclass
class ServiceResponse:
    """Respuesta estándar de microservicio"""
    success: bool
    data: Any = None
    error: str = None
    status_code: int = 200
    service: str = None
    trace_id: str = None

class NotificationChannel(Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WHATSAPP = "whatsapp"

class ServiceClient:
    """Cliente HTTP para comunicación entre microservicios"""
    
    def __init__(self, service_name: str, base_url: str):
        self.service_name = service_name
        self.base_url = base_url
        self.session = requests.Session()
        self.circuit_breaker = CircuitBreaker(
            fail_max=5,
            reset_timeout=30
        )
        
        # Headers por defecto
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'SMD-Vital-Celery-Worker/1.0',
            'X-Service-Name': 'celery-worker'
        })
    
    @CircuitBreaker(fail_max=5, reset_timeout=30)
    def call(self, method: str, endpoint: str, data: Dict = None, 
             timeout: int = 30, **kwargs) -> ServiceResponse:
        """Llamada HTTP con circuit breaker y tracing"""
        
        url = f"{self.base_url}{endpoint}"
        trace_id = current_task.request.id if current_task else None
        
        headers = {
            'X-Trace-Id': trace_id,
            'X-Request-Id': trace_id,
            **kwargs.get('headers', {})
        }
        
        with tracer.start_as_current_span(f"{self.service_name}_api_call") as span:
            span.set_attribute("http.method", method.upper())
            span.set_attribute("http.url", url)
            span.set_attribute("service.name", self.service_name)
            
            try:
                start_time = time.time()
                
                response = self.session.request(
                    method=method,
                    url=url,
                    json=data if method.upper() in ['POST', 'PUT', 'PATCH'] else None,
                    params=data if method.upper() == 'GET' else None,
                    headers=headers,
                    timeout=timeout
                )
                
                duration = time.time() - start_time
                task_duration.labels(task_name=f"{self.service_name}_api").observe(duration)
                
                span.set_attribute("http.status_code", response.status_code)
                
                if response.status_code >= 400:
                    span.set_status(Status(StatusCode.ERROR, f"HTTP {response.status_code}"))
                    
                response_data = response.json() if response.content else {}
                
                return ServiceResponse(
                    success=response.status_code < 400,
                    data=response_data,
                    status_code=response.status_code,
                    service=self.service_name,
                    trace_id=trace_id,
                    error=response_data.get('error') if response.status_code >= 400 else None
                )
                
            except requests.RequestException as e:
                span.set_status(Status(StatusCode.ERROR, str(e)))
                logger.error(f"Service call failed: {self.service_name} - {str(e)}")
                
                return ServiceResponse(
                    success=False,
                    error=str(e),
                    service=self.service_name,
                    trace_id=trace_id
                )
            except CircuitBreakerError:
                span.set_status(Status(StatusCode.ERROR, "Circuit breaker open"))
                logger.warning(f"Circuit breaker open for {self.service_name}")
                
                return ServiceResponse(
                    success=False,
                    error=f"Service {self.service_name} temporarily unavailable",
                    service=self.service_name,
                    trace_id=trace_id
                )

# Clientes de servicios
user_client = ServiceClient("user-service", ServiceEndpoints.USER_SERVICE)
appointment_client = ServiceClient("appointment-service", ServiceEndpoints.APPOINTMENT_SERVICE)
notification_client = ServiceClient("notification-service", ServiceEndpoints.NOTIFICATION_SERVICE)
auth_client = ServiceClient("auth-service", ServiceEndpoints.AUTH_SERVICE)
payment_client = ServiceClient("payment-service", ServiceEndpoints.PAYMENT_SERVICE)
medical_records_client = ServiceClient("medical-records-service", ServiceEndpoints.MEDICAL_RECORDS_SERVICE)

def distributed_task(max_retries=3, default_retry_delay=60, rate_limit=None):
    """Decorador para tareas distribuidas con observabilidad"""
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            task_name = func.__name__
            task_id = current_task.request.id
            
            # Incrementar contador de tareas activas
            active_tasks.labels(task_name=task_name).inc()
            
            # Rate limiting distribuido
            if rate_limit:
                rate_limiter = DistributedRateLimiter(f"task:{task_name}", rate_limit)
                if not rate_limiter.allow():
                    task_counter.labels(task_name=task_name, status='rate_limited').inc()
                    raise Retry(f"Rate limit exceeded for {task_name}")
            
            with tracer.start_as_current_span(f"celery_task_{task_name}") as span:
                span.set_attribute("celery.task_name", task_name)
                span.set_attribute("celery.task_id", task_id)
                span.set_attribute("celery.retry_count", self.request.retries)
                
                start_time = time.time()
                
                try:
                    logger.info(f"Starting distributed task {task_name} [{task_id}]", extra={
                        'task_name': task_name,
                        'task_id': task_id,
                        'trace_id': task_id,
                        'retry_count': self.request.retries
                    })
                    
                    result = func(self, *args, **kwargs)
                    
                    # Métricas de éxito
                    duration = time.time() - start_time
                    task_duration.labels(task_name=task_name).observe(duration)
                    task_counter.labels(task_name=task_name, status='success').inc()
                    
                    span.set_status(Status(StatusCode.OK))
                    logger.info(f"Task {task_name} [{task_id}] completed successfully")
                    
                    return result
                
            except Exception as exc:
                duration = time.time() - start_time
                task_duration.labels(task_name=task_name).observe(duration)
                
                retry_count = self.request.retries
                is_recoverable = _is_recoverable_error(exc)
                
                span.set_status(Status(StatusCode.ERROR, str(exc)))
                span.set_attribute("error.type", type(exc).__name__)
                span.set_attribute("error.recoverable", is_recoverable)
                
                logger.error(f"Task {task_name} [{task_id}] failed: {str(exc)}", extra={
                    'task_name': task_name,
                    'task_id': task_id,
                    'error_type': type(exc).__name__,
                    'retry_count': retry_count,
                    'is_recoverable': is_recoverable
                })
                
                if is_recoverable and retry_count < max_retries:
                    task_counter.labels(task_name=task_name, status='retry').inc()
                    countdown = default_retry_delay * (2 ** retry_count)
                    raise self.retry(exc=exc, countdown=countdown, max_retries=max_retries)
                else:
                    task_counter.labels(task_name=task_name, status='failed').inc()
                    raise exc
                        
                finally:
                    # Decrementar contador de tareas activas
                    active_tasks.labels(task_name=task_name).dec()
                    
        return wrapper
    return decorator

@celery.task(bind=True, name='app.tasks.send_email_notification')
@distributed_task(max_retries=3, default_retry_delay=60, rate_limit="100/hour")
def send_email_notification(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
    """Enviar notificación por email usando notification-service"""
    
    notification_id = notification_data.get('id', 'unknown')
    
    try:
        # Validar usuario existe
        user_response = user_client.call('GET', f"/users/{notification_data.get('user_id')}")
        if not user_response.success:
            logger.error(f"User not found for notification {notification_id}")
            return {'status': 'failed', 'error': 'User not found'}
        
        user_data = user_response.data
        
        # Preparar datos de email
        email_payload = {
            'recipient': user_data.get('email'),
            'subject': notification_data.get('subject'),
            'content': notification_data.get('content'),
            'template': notification_data.get('template'),
            'channel': 'email'
        }
        
        # Enviar a través del notification-service
        response = notification_client.call('POST', '/notifications/send', email_payload)
        
        if response.success:
            logger.info(f"Email notification sent successfully: {notification_id}")
            return {
                'status': 'success',
                'notification_id': notification_id,
                'channel': 'email',
                'service_response': response.data,
                'sent_at': datetime.utcnow().isoformat()
            }
        else:
            logger.error(f"Failed to send email notification: {response.error}")
            raise Exception(f"Notification service error: {response.error}")
        
    except Exception as exc:
        logger.error(f"Error in email notification task: {str(exc)}")
        raise exc

@celery.task(bind=True, name='app.tasks.send_appointment_reminders')
@distributed_task(max_retries=2, default_retry_delay=300)
def send_appointment_reminders(self) -> Dict[str, Any]:
    """Enviar recordatorios de citas usando appointment-service"""
    
    try:
        logger.info("Starting appointment reminders processing")
        
        # Obtener citas para recordatorios desde appointment-service
        tomorrow = (datetime.utcnow() + timedelta(days=1)).date().isoformat()
        
        appointments_response = appointment_client.call(
            'GET', 
            '/appointments/reminders',
            {'date': tomorrow, 'status': 'confirmed'}
        )
        
        if not appointments_response.success:
            logger.error(f"Failed to get appointments: {appointments_response.error}")
            raise Exception(f"Appointment service error: {appointments_response.error}")
        
        appointments = appointments_response.data.get('appointments', [])
        logger.info(f"Found {len(appointments)} appointments for reminders")
        
        reminders_sent = 0
        errors = []
        
        for appointment in appointments:
            try:
                # Obtener datos del usuario
                user_response = user_client.call('GET', f"/users/{appointment['user_id']}")
                if not user_response.success:
                    errors.append(f"User not found for appointment {appointment['id']}")
                    continue
                
                user_data = user_response.data
                
                # Crear datos de recordatorio
                reminder_data = {
                    'id': f"appointment_reminder_{appointment['id']}",
                    'user_id': appointment['user_id'],
                    'subject': 'Recordatorio de Cita - SMD Vital',
                    'content': f"Recordatorio: Tiene una cita programada para {appointment['scheduled_date']} a las {appointment['scheduled_time']}",
                    'template': 'appointment_reminder',
                    'channels': ['email', 'sms'] if user_data.get('phone') else ['email'],
                    'appointment_id': appointment['id']
                }
                
                # Enviar recordatorio
                send_email_notification.delay(reminder_data)
                
                # Marcar como enviado en appointment-service
                appointment_client.call(
                    'PUT', 
                    f"/appointments/{appointment['id']}/reminder-sent"
                )
                
                reminders_sent += 1
                
            except Exception as e:
                error_msg = f"Error processing reminder for appointment {appointment['id']}: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)
                continue
        
        result = {
            'status': 'success',
            'reminders_sent': reminders_sent,
            'total_appointments': len(appointments),
            'errors': errors,
            'processed_at': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Appointment reminders completed: {reminders_sent} sent, {len(errors)} errors")
        return result
            
    except Exception as exc:
        logger.error(f"Critical error in appointment reminders: {str(exc)}")
        return {
            'status': 'error',
            'error': str(exc),
            'reminders_sent': 0,
            'processed_at': datetime.utcnow().isoformat()
        }

@celery.task(bind=True, name='app.tasks.process_payment_notification')
@distributed_task(max_retries=3, default_retry_delay=120)
def process_payment_notification(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
    """Procesar notificación de pago usando payment-service"""
    
    payment_id = payment_data.get('payment_id')
    
    try:
        logger.info(f"Processing payment notification for payment {payment_id}")
        
        # Obtener detalles del pago
        payment_response = payment_client.call('GET', f"/payments/{payment_id}")
        if not payment_response.success:
            raise Exception(f"Payment not found: {payment_id}")
        
        payment = payment_response.data
        
        # Obtener datos del usuario
        user_response = user_client.call('GET', f"/users/{payment['user_id']}")
        if not user_response.success:
            raise Exception(f"User not found: {payment['user_id']}")
        
        user_data = user_response.data
        
        # Crear notificación de pago
        notification_data = {
            'id': f"payment_notification_{payment_id}",
            'user_id': payment['user_id'],
            'subject': f"Confirmación de Pago - ${payment['amount']}",
            'content': f"Su pago de ${payment['amount']} ha sido procesado exitosamente.",
            'template': 'payment_confirmation',
            'channels': ['email'],
            'payment_id': payment_id
        }
        
        # Enviar notificación
        notification_response = notification_client.call(
            'POST', 
            '/notifications/send',
            notification_data
        )
        
        if notification_response.success:
            # Actualizar estado en payment-service
            payment_client.call(
                'PUT',
                f"/payments/{payment_id}/notification-sent"
            )
            
            return {
                'status': 'success',
                'payment_id': payment_id,
                'notification_sent': True,
                'processed_at': datetime.utcnow().isoformat()
            }
        else:
            raise Exception(f"Failed to send notification: {notification_response.error}")
            
    except Exception as exc:
        logger.error(f"Error processing payment notification: {str(exc)}")
        raise exc

@celery.task(bind=True, name='app.tasks.sync_medical_records')
@distributed_task(max_retries=2, default_retry_delay=180)
def sync_medical_records(self, sync_data: Dict[str, Any]) -> Dict[str, Any]:
    """Sincronizar registros médicos entre servicios"""
    
    try:
        user_id = sync_data.get('user_id')
        logger.info(f"Syncing medical records for user {user_id}")
        
        # Obtener registros médicos
        records_response = medical_records_client.call(
            'GET', 
            f"/medical-records/user/{user_id}"
        )
        
        if not records_response.success:
            raise Exception(f"Failed to get medical records: {records_response.error}")
        
        records = records_response.data.get('records', [])
        
        # Sincronizar con otros servicios que lo necesiten
        sync_results = []
        
        # Ejemplo: actualizar información en user-service
        user_update_response = user_client.call(
            'PUT',
            f"/users/{user_id}/medical-summary",
            {'medical_records_count': len(records)}
        )
        sync_results.append(user_update_response.success)
        
        return {
            'status': 'success',
            'user_id': user_id,
            'records_synced': len(records),
            'services_updated': sum(sync_results),
            'synced_at': datetime.utcnow().isoformat()
        }
        
    except Exception as exc:
        logger.error(f"Error syncing medical records: {str(exc)}")
        raise exc

def _is_recoverable_error(exc: Exception) -> bool:
    """Determina si un error es recuperable en microservicios"""
    recoverable_errors = (
        requests.ConnectionError,
        requests.Timeout,
        requests.RequestException,
        CircuitBreakerError,
        ConnectionError,
        TimeoutError
    )
    
    non_recoverable_errors = (
        ValueError,
        TypeError,
        KeyError,
        AttributeError
    )
    
    if isinstance(exc, non_recoverable_errors):
        return False
    
    # Errores HTTP específicos que no deberían reintentarse
    if hasattr(exc, 'response') and exc.response is not None:
        status_code = exc.response.status_code
        if status_code in [400, 401, 403, 404, 422]:  # Client errors
            return False
    
    return isinstance(exc, recoverable_errors) or "service" in str(exc).lower()

# Configuración mejorada para microservicios
celery.conf.update(
    # Serialización y formato
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Tracking y monitoreo
    task_track_started=True,
    task_send_sent_event=True,
    task_acks_late=True,  # Importante para garantías de entrega
    
    # Performance
    worker_prefetch_multiplier=1,  # Crítico en microservicios
    task_compression='gzip',
    result_compression='gzip',
    
    # Timeouts
    task_time_limit=300,  # 5 minutos
    task_soft_time_limit=240,  # 4 minutos
    
    # Routing para microservicios
    task_routes={
        'app.tasks.send_email_notification': {'queue': 'notifications'},
        'app.tasks.send_appointment_reminders': {'queue': 'appointments'},
        'app.tasks.process_payment_notification': {'queue': 'payments'},
        'app.tasks.sync_medical_records': {'queue': 'sync'},
    },
    
    # Configuración de colas
    task_default_queue='celery',
    task_default_exchange='celery',
    task_default_exchange_type='direct',
    task_default_routing_key='celery',
)

# Health check para el worker
@celery.task(name='app.tasks.health_check')
def health_check() -> Dict[str, Any]:
    """Health check para monitoreo"""
    try:
        # Verificar conectividad con servicios críticos
        services_status = {}
        
        for service_name, client in [
            ('user-service', user_client),
            ('notification-service', notification_client),
            ('appointment-service', appointment_client)
        ]:
            try:
                response = client.call('GET', '/health', timeout=5)
                services_status[service_name] = response.success
            except Exception:
                services_status[service_name] = False
        
        return {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'services': services_status,
            'worker_id': current_task.request.id
        }
        
    except Exception as exc:
        return {
            'status': 'unhealthy',
            'error': str(exc),
            'timestamp': datetime.utcnow().isoformat()
        }