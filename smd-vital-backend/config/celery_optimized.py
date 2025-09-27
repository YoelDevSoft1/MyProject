# Celery Configuration - Optimized for RabbitMQ
# =============================================

import os

# Broker settings with connection pooling
broker_url = 'amqp://smdvital:rabbitmq_password_2024@rabbitmq:5672/smdvital'
result_backend = 'redis://:redis_password_2024@redis:6379/3'

# Connection settings - OPTIMIZED
broker_connection_retry = True
broker_connection_retry_on_startup = True
broker_connection_max_retries = 10
broker_heartbeat = 60
broker_pool_limit = 10
broker_connection_timeout = 30
broker_connection_retry_delay = 5

# Task settings
task_serializer = 'json'
accept_content = ['json']
result_serializer = 'json'
timezone = 'UTC'
enable_utc = True

# Worker settings - OPTIMIZED FOR STABILITY
worker_prefetch_multiplier = 1
task_acks_late = True
worker_disable_rate_limits = False
worker_max_tasks_per_child = 1000
worker_max_memory_per_child = 200000  # 200MB

# Result backend settings
result_expires = 3600
result_persistent = True

# Monitoring
worker_send_task_events = True
task_send_sent_event = True

# Connection pooling
broker_transport_options = {
    'visibility_timeout': 3600,
    'fanout_prefix': True,
    'fanout_patterns': True,
    'priority_steps': list(range(10)),
    'sep': ':',
    'queue_order_strategy': 'priority',
    'max_retries': 3,
    'retry_delay': 1.0,
    'retry_delay_max': 10.0,
    'retry_jitter': True,
}

# RabbitMQ specific optimizations
broker_transport_options.update({
    'confirm_publish': True,
    'publish_retry': True,
    'publish_retry_policy': {
        'max_retries': 3,
        'interval_start': 0,
        'interval_step': 0.2,
        'interval_max': 0.2,
    },
    'heartbeat': 60,
    'blocked_connection_timeout': 300,
    'socket_timeout': 30,
    'connection_attempts': 3,
    'retry_delay': 5,
    'retry_backoff': 1.2,
    'retry_backoff_max': 30,
})