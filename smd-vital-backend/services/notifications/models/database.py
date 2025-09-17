"""
SMD Vital - Notification Service Database Models
================================================

Modelos de base de datos para el servicio de notificaciones.
Incluye notificaciones, templates, canales y programación.

Author: Backend Team
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey, Enum as SQLEnum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from datetime import datetime
from enum import Enum
import uuid

Base = declarative_base()


class NotificationChannel(Enum):
    """Canal de notificación"""
    EMAIL = "email"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    PUSH = "push"
    IN_APP = "in_app"
    WEBHOOK = "webhook"


class NotificationStatus(Enum):
    """Estado de la notificación"""
    PENDING = "pending"
    QUEUED = "queued"
    SENDING = "sending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"
    CANCELLED = "cancelled"
    SCHEDULED = "scheduled"


class NotificationType(Enum):
    """Tipo de notificación"""
    APPOINTMENT_REMINDER = "appointment_reminder"
    APPOINTMENT_CONFIRMATION = "appointment_confirmation"
    APPOINTMENT_CANCELLATION = "appointment_cancellation"
    APPOINTMENT_RESCHEDULED = "appointment_rescheduled"
    PAYMENT_CONFIRMATION = "payment_confirmation"
    PAYMENT_FAILED = "payment_failed"
    INVOICE_CREATED = "invoice_created"
    INVOICE_OVERDUE = "invoice_overdue"
    LAB_RESULTS_READY = "lab_results_ready"
    PRESCRIPTION_READY = "prescription_ready"
    WELCOME = "welcome"
    PASSWORD_RESET = "password_reset"
    ACCOUNT_VERIFICATION = "account_verification"
    SECURITY_ALERT = "security_alert"
    SYSTEM_MAINTENANCE = "system_maintenance"
    PROMOTIONAL = "promotional"
    CUSTOM = "custom"


class Priority(Enum):
    """Prioridad de la notificación"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"
    CRITICAL = "critical"


class TemplateStatus(Enum):
    """Estado del template"""
    DRAFT = "draft"
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    ARCHIVED = "archived"


class Notification(Base):
    """
    Modelo principal de notificaciones
    """
    __tablename__ = 'notifications'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notification_id = Column(String(50), unique=True, nullable=False, index=True)  # ID externo único
    
    # Destinatario
    recipient_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # Usuario destinatario
    recipient_email = Column(String(255), nullable=True)
    recipient_phone = Column(String(20), nullable=True)
    recipient_device_token = Column(String(500), nullable=True)  # Para push notifications
    
    # Remitente
    sender_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Usuario remitente (opcional)
    sender_name = Column(String(255), nullable=True)
    sender_email = Column(String(255), nullable=True)
    
    # Configuración de la notificación
    channel = Column(SQLEnum(NotificationChannel), nullable=False, index=True)
    notification_type = Column(SQLEnum(NotificationType), nullable=False, index=True)
    priority = Column(SQLEnum(Priority), default=Priority.NORMAL, nullable=False)
    
    # Contenido
    subject = Column(String(500), nullable=True)  # Para email, título para push
    content = Column(Text, nullable=False)  # Contenido principal
    html_content = Column(Text, nullable=True)  # Contenido HTML para email
    
    # Template
    template_id = Column(UUID(as_uuid=True), ForeignKey('notification_templates.id'), nullable=True, index=True)
    template_data = Column(JSONB, nullable=True)  # Variables para el template
    
    # Estado y seguimiento
    status = Column(SQLEnum(NotificationStatus), default=NotificationStatus.PENDING, nullable=False, index=True)
    delivery_status = Column(String(50), nullable=True)  # Estado detallado del proveedor
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)
    
    # Programación
    scheduled_at = Column(DateTime, nullable=True, index=True)  # Para notificaciones programadas
    send_after = Column(DateTime, nullable=True)  # No enviar antes de esta fecha
    expires_at = Column(DateTime, nullable=True)  # Expira si no se envía antes
    
    # Fechas de seguimiento
    queued_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    failed_at = Column(DateTime, nullable=True)
    
    # Información del proveedor externo
    external_id = Column(String(100), nullable=True, index=True)  # ID del proveedor (SendGrid, Twilio, etc.)
    external_status = Column(String(50), nullable=True)
    external_response = Column(JSONB, nullable=True)
    
    # Información contextual
    context = Column(JSONB, nullable=True)  # Contexto adicional (appointment_id, payment_id, etc.)
    tags = Column(ARRAY(String), nullable=True)  # Etiquetas para clasificación
    campaign_id = Column(String(100), nullable=True, index=True)  # ID de campaña
    
    # Configuraciones especiales
    is_bulk = Column(Boolean, default=False, nullable=False)  # Es parte de envío masivo
    track_opens = Column(Boolean, default=True, nullable=False)  # Rastrear aperturas
    track_clicks = Column(Boolean, default=True, nullable=False)  # Rastrear clics
    
    # Información de dispositivo/cliente
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    device_info = Column(JSONB, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    template = relationship("NotificationTemplate", back_populates="notifications")
    events = relationship("NotificationEvent", back_populates="notification", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Notification(id={self.id}, type={self.notification_type}, status={self.status})>"

    @property
    def is_expired(self):
        """Verificar si la notificación ha expirado"""
        return self.expires_at and datetime.utcnow() > self.expires_at

    @property
    def should_retry(self):
        """Verificar si se debe reintentar el envío"""
        return (self.status == NotificationStatus.FAILED and 
                self.retry_count < self.max_retries and 
                not self.is_expired)


class NotificationTemplate(Base):
    """
    Modelo para templates de notificaciones
    """
    __tablename__ = 'notification_templates'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    
    # Configuración
    channel = Column(SQLEnum(NotificationChannel), nullable=False, index=True)
    notification_type = Column(SQLEnum(NotificationType), nullable=False, index=True)
    language = Column(String(10), default='es', nullable=False)
    
    # Contenido del template
    subject_template = Column(String(500), nullable=True)  # Para email/push
    content_template = Column(Text, nullable=False)  # Contenido principal
    html_template = Column(Text, nullable=True)  # Template HTML para email
    
    # Variables del template
    variables = Column(JSONB, nullable=True)  # Definición de variables disponibles
    sample_data = Column(JSONB, nullable=True)  # Datos de ejemplo para preview
    
    # Configuración del template
    status = Column(SQLEnum(TemplateStatus), default=TemplateStatus.DRAFT, nullable=False)
    is_system_template = Column(Boolean, default=False, nullable=False)  # Template del sistema
    version = Column(String(10), default='1.0', nullable=False)
    
    # Información adicional
    description = Column(Text, nullable=True)
    usage_notes = Column(Text, nullable=True)
    category = Column(String(50), nullable=True, index=True)
    
    # Configuraciones de envío
    default_priority = Column(SQLEnum(Priority), default=Priority.NORMAL, nullable=False)
    track_opens = Column(Boolean, default=True, nullable=False)
    track_clicks = Column(Boolean, default=True, nullable=False)
    
    # Metadatos
    meta_data = Column(JSONB, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    
    # Relaciones
    notifications = relationship("Notification", back_populates="template")
    
    def __repr__(self):
        return f"<NotificationTemplate(id={self.id}, name={self.name}, type={self.notification_type})>"


class NotificationEvent(Base):
    """
    Modelo para eventos de notificaciones (aperturas, clics, etc.)
    """
    __tablename__ = 'notification_events'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notification_id = Column(UUID(as_uuid=True), ForeignKey('notifications.id'), nullable=False, index=True)
    
    # Información del evento
    event_type = Column(String(50), nullable=False, index=True)  # open, click, bounce, spam, etc.
    event_data = Column(JSONB, nullable=True)  # Datos específicos del evento
    
    # Información del usuario
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    device_info = Column(JSONB, nullable=True)
    location_info = Column(JSONB, nullable=True)
    
    # Información del proveedor
    external_event_id = Column(String(100), nullable=True)
    provider_data = Column(JSONB, nullable=True)
    
    # Timestamp
    event_timestamp = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    notification = relationship("Notification", back_populates="events")
    
    def __repr__(self):
        return f"<NotificationEvent(id={self.id}, type={self.event_type}, timestamp={self.event_timestamp})>"


class NotificationPreference(Base):
    """
    Modelo para preferencias de notificación de usuarios
    """
    __tablename__ = 'notification_preferences'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Configuración por tipo de notificación
    notification_type = Column(SQLEnum(NotificationType), nullable=False, index=True)
    
    # Configuración por canal
    email_enabled = Column(Boolean, default=True, nullable=False)
    sms_enabled = Column(Boolean, default=True, nullable=False)
    whatsapp_enabled = Column(Boolean, default=False, nullable=False)
    push_enabled = Column(Boolean, default=True, nullable=False)
    in_app_enabled = Column(Boolean, default=True, nullable=False)
    
    # Configuraciones especiales
    quiet_hours_start = Column(String(5), nullable=True)  # HH:MM
    quiet_hours_end = Column(String(5), nullable=True)  # HH:MM
    timezone = Column(String(50), default='America/Bogota', nullable=False)
    
    # Frecuencia
    frequency = Column(String(20), default='immediate', nullable=False)  # immediate, hourly, daily, weekly
    max_per_day = Column(Integer, nullable=True)  # Máximo por día
    
    # Configuraciones adicionales
    language = Column(String(10), default='es', nullable=False)
    priority_threshold = Column(SQLEnum(Priority), default=Priority.LOW, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<NotificationPreference(id={self.id}, user_id={self.user_id}, type={self.notification_type})>"


class NotificationQueue(Base):
    """
    Modelo para cola de notificaciones
    """
    __tablename__ = 'notification_queue'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notification_id = Column(UUID(as_uuid=True), ForeignKey('notifications.id'), nullable=False, index=True)
    
    # Configuración de la cola
    queue_name = Column(String(50), nullable=False, index=True)  # high_priority, normal, bulk, etc.
    priority_score = Column(Integer, default=0, nullable=False, index=True)
    
    # Estado en la cola
    status = Column(String(20), default='queued', nullable=False, index=True)  # queued, processing, completed, failed
    
    # Programación
    scheduled_for = Column(DateTime, nullable=False, index=True)
    attempts = Column(Integer, default=0, nullable=False)
    max_attempts = Column(Integer, default=3, nullable=False)
    
    # Información de procesamiento
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    worker_id = Column(String(100), nullable=True)
    
    # Error handling
    last_error = Column(Text, nullable=True)
    error_count = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    notification = relationship("Notification")
    
    def __repr__(self):
        return f"<NotificationQueue(id={self.id}, queue={self.queue_name}, status={self.status})>"


class NotificationCampaign(Base):
    """
    Modelo para campañas de notificaciones masivas
    """
    __tablename__ = 'notification_campaigns'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    campaign_id = Column(String(100), unique=True, nullable=False, index=True)
    
    # Configuración de la campaña
    channel = Column(SQLEnum(NotificationChannel), nullable=False)
    notification_type = Column(SQLEnum(NotificationType), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey('notification_templates.id'), nullable=True)
    
    # Audiencia
    target_audience = Column(JSONB, nullable=True)  # Criterios de selección
    recipient_count = Column(Integer, default=0, nullable=False)
    
    # Programación
    scheduled_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Estado
    status = Column(String(20), default='draft', nullable=False, index=True)  # draft, scheduled, running, completed, cancelled
    
    # Estadísticas
    sent_count = Column(Integer, default=0, nullable=False)
    delivered_count = Column(Integer, default=0, nullable=False)
    failed_count = Column(Integer, default=0, nullable=False)
    open_count = Column(Integer, default=0, nullable=False)
    click_count = Column(Integer, default=0, nullable=False)
    
    # Configuración adicional
    description = Column(Text, nullable=True)
    meta_data = Column(JSONB, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    
    # Relaciones
    template = relationship("NotificationTemplate")
    
    def __repr__(self):
        return f"<NotificationCampaign(id={self.id}, name={self.name}, status={self.status})>"


class NotificationStatistics(Base):
    """
    Modelo para estadísticas de notificaciones (agregadas diariamente)
    """
    __tablename__ = 'notification_statistics'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    
    # Estadísticas por canal
    email_sent = Column(Integer, default=0, nullable=False)
    email_delivered = Column(Integer, default=0, nullable=False)
    email_opened = Column(Integer, default=0, nullable=False)
    email_clicked = Column(Integer, default=0, nullable=False)
    email_failed = Column(Integer, default=0, nullable=False)
    
    sms_sent = Column(Integer, default=0, nullable=False)
    sms_delivered = Column(Integer, default=0, nullable=False)
    sms_failed = Column(Integer, default=0, nullable=False)
    
    whatsapp_sent = Column(Integer, default=0, nullable=False)
    whatsapp_delivered = Column(Integer, default=0, nullable=False)
    whatsapp_read = Column(Integer, default=0, nullable=False)
    whatsapp_failed = Column(Integer, default=0, nullable=False)
    
    push_sent = Column(Integer, default=0, nullable=False)
    push_delivered = Column(Integer, default=0, nullable=False)
    push_opened = Column(Integer, default=0, nullable=False)
    push_failed = Column(Integer, default=0, nullable=False)
    
    # Estadísticas generales
    total_sent = Column(Integer, default=0, nullable=False)
    total_delivered = Column(Integer, default=0, nullable=False)
    total_failed = Column(Integer, default=0, nullable=False)
    
    # Métricas de rendimiento
    delivery_rate = Column(String(10), nullable=True)  # Porcentaje como string
    open_rate = Column(String(10), nullable=True)
    click_rate = Column(String(10), nullable=True)
    
    # Información adicional
    channel = Column(SQLEnum(NotificationChannel), nullable=True, index=True)  # Para estadísticas específicas
    notification_type = Column(SQLEnum(NotificationType), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<NotificationStatistics(id={self.id}, date={self.date}, total_sent={self.total_sent})>"


class WebhookEndpoint(Base):
    """
    Modelo para endpoints de webhooks
    """
    __tablename__ = 'webhook_endpoints'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    
    # Configuración
    is_active = Column(Boolean, default=True, nullable=False)
    events = Column(ARRAY(String), nullable=False)  # Eventos que escucha
    
    # Seguridad
    secret_key = Column(String(255), nullable=True)  # Para verificación de firma
    headers = Column(JSONB, nullable=True)  # Headers adicionales
    
    # Configuración de reintento
    max_retries = Column(Integer, default=3, nullable=False)
    timeout_seconds = Column(Integer, default=30, nullable=False)
    
    # Estadísticas
    total_calls = Column(Integer, default=0, nullable=False)
    successful_calls = Column(Integer, default=0, nullable=False)
    failed_calls = Column(Integer, default=0, nullable=False)
    last_called = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    
    def __repr__(self):
        return f"<WebhookEndpoint(id={self.id}, name={self.name}, url={self.url})>"


# Database Configuration
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://smdvital:smdvital_password_2024@localhost:5432/smdvital_notifications")

# Create engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency to get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
