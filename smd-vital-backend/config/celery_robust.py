# Celery Robust Configuration - SOLUCIÓN DEFINITIVA
# ===================================================
# Configuración optimizada para eliminar warnings de RabbitMQ

from celery import Celery
import os

# Configuración robusta de Celery
app = Celery('smd-vital')

# ===========================================
# CONFIGURACIÓN DE BROKER - RABBITMQ
# ===========================================
app.conf.update(
    # Broker configuration
    broker_url=os.getenv('CELERY_BROKER_URL', 'amqp://smdvital:rabbitmq_password_2024@rabbitmq:5672/smdvital'),
    result_backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://:redis_password_2024@redis:6379/3'),
    
    # ===========================================
    # CONFIGURACIÓN DE CONEXIONES - CRÍTICA
    # ===========================================
    # Configuración de heartbeat más agresiva
    broker_heartbeat=60,  # 60 segundos
    broker_pool_limit=20,  # Más conexiones en pool
    
    # Timeouts optimizados
    broker_connection_timeout=30,
    broker_connection_retry=True,
    broker_connection_retry_on_startup=True,
    broker_connection_max_retries=10,
    
    # ===========================================
    # CONFIGURACIÓN DE TAREAS
    # ===========================================
    # Configuración de tareas
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # ===========================================
    # CONFIGURACIÓN DE WORKERS
    # ===========================================
    # Configuración de workers
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    worker_disable_rate_limits=True,
    
    # ===========================================
    # CONFIGURACIÓN DE RESULTADOS
    # ===========================================
    # Configuración de resultados
    result_expires=3600,  # 1 hora
    result_cache_max=10000,
    
    # ===========================================
    # CONFIGURACIÓN DE MONITOREO
    # ===========================================
    # Configuración de monitoreo
    worker_send_task_events=True,
    task_send_sent_event=True,
    
    # ===========================================
    # CONFIGURACIÓN DE RETRY
    # ===========================================
    # Configuración de reintentos
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_ignore_result=False,
    
    # ===========================================
    # CONFIGURACIÓN DE CONEXIONES PERSISTENTES
    # ===========================================
    # Configuración de conexiones persistentes
    broker_connection_retry_delay=5,
    broker_connection_retry_max_delay=60,
    
    # ===========================================
    # CONFIGURACIÓN DE LOGGING
    # ===========================================
    # Configuración de logging
    worker_log_format='[%(asctime)s: %(levelname)s/%(processName)s] %(message)s',
    worker_task_log_format='[%(asctime)s: %(levelname)s/%(processName)s][%(task_name)s(%(task_id)s)] %(message)s',
)

# ===========================================
# CONFIGURACIÓN DE RUTAS DE TAREAS
# ===========================================
app.autodiscover_tasks(['services.notifications'])

# ===========================================
# CONFIGURACIÓN DE BEAT SCHEDULE
# ===========================================
app.conf.beat_schedule = {
    'health-check': {
        'task': 'services.notifications.tasks.health_check',
        'schedule': 30.0,  # Cada 30 segundos
    },
    'cleanup-expired-sessions': {
        'task': 'services.notifications.tasks.cleanup_expired_sessions',
        'schedule': 300.0,  # Cada 5 minutos
    },
}

# ===========================================
# CONFIGURACIÓN DE SIGNALS
# ===========================================
@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

if __name__ == '__main__':
    app.start()
