# app/config.py
import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class Config:
    """Configuración de la aplicación usando variables de entorno."""
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://smdvital:smdvital_password_2024@postgres:5432/smdvital")
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/3")
    
    # RabbitMQ
    RABBITMQ_URL: str = os.getenv("RABBITMQ_URL", "amqp://smdvital:password@rabbitmq:5672/smdvital")
    
    # Celery
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "amqp://smdvital:password@rabbitmq:5672/smdvital")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/3")
    
    # Email
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", "587"))
    MAIL_USE_TLS: bool = os.getenv("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
    
    # SMS
    SMS_API_KEY: str = os.getenv("SMS_API_KEY", "")
    SMS_API_URL: str = os.getenv("SMS_API_URL", "")
    SMS_SENDER_ID: str = os.getenv("SMS_SENDER_ID", "SMDVITAL")
    
    # Twilio
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    
    # WhatsApp
    WHATSAPP_TOKEN: str = os.getenv("WHATSAPP_TOKEN", "")
    
    # Service URLs
    AUTH_SERVICE_URL: str = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")
    USER_SERVICE_URL: str = os.getenv("USER_SERVICE_URL", "http://user-service:8002")
    APPOINTMENT_SERVICE_URL: str = os.getenv("APPOINTMENT_SERVICE_URL", "http://appointment-service:8003")
    NOTIFICATION_SERVICE_URL: str = os.getenv("NOTIFICATION_SERVICE_URL", "http://notification-service:8004")
    MEDICAL_RECORDS_SERVICE_URL: str = os.getenv("MEDICAL_RECORDS_SERVICE_URL", "http://medical-records-service:8005")
    PAYMENT_SERVICE_URL: str = os.getenv("PAYMENT_SERVICE_URL", "http://payment-service:8006")
    
    # Observability
    JAEGER_AGENT_HOST: str = os.getenv("JAEGER_AGENT_HOST", "jaeger")
    JAEGER_AGENT_PORT: int = int(os.getenv("JAEGER_AGENT_PORT", "6831"))
    PROMETHEUS_GATEWAY: str = os.getenv("PROMETHEUS_GATEWAY", "http://prometheus:9090")
    ELASTICSEARCH_URL: str = os.getenv("ELASTICSEARCH_URL", "http://elasticsearch:9200")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "a_very_secret_key_for_development_only_12345678901234567890123456789012")
    
    # Flower
    FLOWER_BASIC_AUTH: str = os.getenv("FLOWER_BASIC_AUTH", "admin:smdvital123")
    FLOWER_URL_PREFIX: str = os.getenv("FLOWER_URL_PREFIX", "/flower")
    
    # Rate Limiting
    RATE_LIMIT_EMAIL_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_EMAIL_PER_MINUTE", "60"))
    RATE_LIMIT_SMS_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_SMS_PER_MINUTE", "20"))
    RATE_LIMIT_WHATSAPP_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_WHATSAPP_PER_MINUTE", "10"))
    
    # Retry Configuration
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))
    RETRY_DELAY: int = int(os.getenv("RETRY_DELAY", "60"))
    RETRY_BACKOFF: bool = os.getenv("RETRY_BACKOFF", "true").lower() == "true"
    
    # Circuit Breaker
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: int = int(os.getenv("CIRCUIT_BREAKER_FAILURE_THRESHOLD", "5"))
    CIRCUIT_BREAKER_RECOVERY_TIMEOUT: int = int(os.getenv("CIRCUIT_BREAKER_RECOVERY_TIMEOUT", "60"))
    
    # Compression
    ENABLE_COMPRESSION: bool = os.getenv("ENABLE_COMPRESSION", "true").lower() == "true"
    COMPRESSION_LEVEL: int = int(os.getenv("COMPRESSION_LEVEL", "6"))
    
    # Timeouts
    EMAIL_TIMEOUT: int = int(os.getenv("EMAIL_TIMEOUT", "30"))
    SMS_TIMEOUT: int = int(os.getenv("SMS_TIMEOUT", "15"))
    WHATSAPP_TIMEOUT: int = int(os.getenv("WHATSAPP_TIMEOUT", "20"))
    
    # Monitoring
    ENABLE_METRICS: bool = os.getenv("ENABLE_METRICS", "true").lower() == "true"
    ENABLE_TRACING: bool = os.getenv("ENABLE_TRACING", "true").lower() == "true"
    ENABLE_LOGGING: bool = os.getenv("ENABLE_LOGGING", "true").lower() == "true"

# Instancia global de configuración
config = Config()
