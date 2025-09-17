"""
SMD Vital - Notification Service - Celery Configuration
======================================================

Configuración de Celery para el procesamiento de tareas en background
del servicio de notificaciones.
"""

from celery import Celery
import os
from datetime import timedelta

# Configuración de Celery
celery = Celery('app')
celery.config_from_object('celeryconfig')

# Configuración explícita del scheduler para evitar django_celery_beat
celery.conf.beat_scheduler = 'celery.beat:PersistentScheduler'
celery.conf.beat_schedule_filename = '/app/celerybeat-schedule'

# Importar tareas
from tasks import *

if __name__ == '__main__':
    celery.start()
