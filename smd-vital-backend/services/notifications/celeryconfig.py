"""
SMD Vital - Notification Service - Celery Configuration
======================================================

Configuración de Celery para el procesamiento de tareas en background.
"""

import os
from datetime import timedelta

# Configuración básica de Celery
broker_url = os.getenv('RABBITMQ_URL', 'amqp://smdvital:rabbitmq_password_2024@localhost:5672/smdvital')
result_backend = os.getenv('REDIS_URL', 'redis://:redis_password_2024@localhost:6379/3')

# Configuración de serialización
task_serializer = 'json'
accept_content = ['json']
result_serializer = 'json'

# Configuración de timezone
timezone = 'America/Bogota'
enable_utc = True

# Configuración de tareas
task_track_started = True
task_time_limit = 30 * 60  # 30 minutos
task_soft_time_limit = 25 * 60  # 25 minutos
worker_prefetch_multiplier = 1

# Configuración de resultados
result_expires = 3600  # 1 hora

# Configuración de colas
task_routes = {
    'tasks.send_email_notification': {'queue': 'email'},
    'tasks.send_sms_notification': {'queue': 'sms'},
    'tasks.send_push_notification': {'queue': 'push'},
    'tasks.send_whatsapp_notification': {'queue': 'whatsapp'},
    'tasks.process_notification': {'queue': 'notifications'},
}

# Configuración de beat (tareas programadas)
beat_schedule = {
    'send-appointment-reminders': {
        'task': 'tasks.send_appointment_reminders',
        'schedule': timedelta(hours=1),  # Cada hora
    },
    'cleanup-old-notifications': {
        'task': 'tasks.cleanup_old_notifications',
        'schedule': timedelta(days=1),  # Diariamente
    },
}

# Configuración de scheduler
beat_scheduler = 'celery.beat:PersistentScheduler'
beat_schedule_filename = '/app/celerybeat-schedule'
beat_schedule_db = '/app/celerybeat-schedule'

# Configuración adicional para evitar django_celery_beat
beat_scheduler_cls = 'celery.beat:PersistentScheduler'

# Configuración de logging
worker_log_format = '[%(asctime)s: %(levelname)s/%(processName)s] %(message)s'
worker_task_log_format = '[%(asctime)s: %(levelname)s/%(processName)s][%(task_name)s(%(task_id)s)] %(message)s'
