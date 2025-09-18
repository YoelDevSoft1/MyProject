# app/models.py
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any
import json

class NotificationStatus(Enum):
    """Estados de notificación."""
    PENDING = "pending"
    PROCESSING = "processing"
    SENT = "sent"
    FAILED = "failed"
    RETRYING = "retrying"
    CANCELLED = "cancelled"

class NotificationChannel(Enum):
    """Canales de notificación."""
    EMAIL = "email"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    PUSH = "push"
    IN_APP = "in_app"

@dataclass
class NotificationData:
    """Datos de una notificación."""
    id: str
    user_id: str
    channel: NotificationChannel
    subject: Optional[str] = None
    message: str = ""
    template_id: Optional[str] = None
    template_data: Optional[Dict[str, Any]] = None
    priority: int = 1  # 1=low, 2=medium, 3=high, 4=urgent
    scheduled_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class NotificationResult:
    """Resultado de una notificación."""
    notification_id: str
    status: NotificationStatus
    channel: NotificationChannel
    sent_at: Optional[datetime] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    external_id: Optional[str] = None  # ID del proveedor externo
    cost: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class NotificationLog:
    """Log de una notificación."""
    id: str
    notification_id: str
    status: NotificationStatus
    message: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

class Notification:
    """Modelo de notificación para la base de datos."""
    
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.user_id = kwargs.get('user_id')
        self.channel = kwargs.get('channel')
        self.subject = kwargs.get('subject')
        self.message = kwargs.get('message')
        self.template_id = kwargs.get('template_id')
        self.template_data = kwargs.get('template_data', {})
        self.priority = kwargs.get('priority', 1)
        self.status = kwargs.get('status', NotificationStatus.PENDING)
        self.scheduled_at = kwargs.get('scheduled_at')
        self.expires_at = kwargs.get('expires_at')
        self.created_at = kwargs.get('created_at', datetime.utcnow())
        self.updated_at = kwargs.get('updated_at', datetime.utcnow())
        self.retry_count = kwargs.get('retry_count', 0)
        self.max_retries = kwargs.get('max_retries', 3)
        self.external_id = kwargs.get('external_id')
        self.cost = kwargs.get('cost')
        self.metadata = kwargs.get('metadata', {})

    def to_dict(self) -> Dict[str, Any]:
        """Convierte la notificación a diccionario."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'channel': self.channel.value if isinstance(self.channel, NotificationChannel) else self.channel,
            'subject': self.subject,
            'message': self.message,
            'template_id': self.template_id,
            'template_data': self.template_data,
            'priority': self.priority,
            'status': self.status.value if isinstance(self.status, NotificationStatus) else self.status,
            'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'retry_count': self.retry_count,
            'max_retries': self.max_retries,
            'external_id': self.external_id,
            'cost': self.cost,
            'metadata': self.metadata
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Notification':
        """Crea una notificación desde un diccionario."""
        # Convertir strings a enums si es necesario
        if isinstance(data.get('channel'), str):
            data['channel'] = NotificationChannel(data['channel'])
        if isinstance(data.get('status'), str):
            data['status'] = NotificationStatus(data['status'])
        
        # Convertir strings de fecha a datetime si es necesario
        if isinstance(data.get('scheduled_at'), str):
            data['scheduled_at'] = datetime.fromisoformat(data['scheduled_at'])
        if isinstance(data.get('expires_at'), str):
            data['expires_at'] = datetime.fromisoformat(data['expires_at'])
        if isinstance(data.get('created_at'), str):
            data['created_at'] = datetime.fromisoformat(data['created_at'])
        if isinstance(data.get('updated_at'), str):
            data['updated_at'] = datetime.fromisoformat(data['updated_at'])
        
        return cls(**data)

class NotificationLogEntry:
    """Modelo de log de notificación para la base de datos."""
    
    def __init__(self, **kwargs):
        self.id = kwargs.get('id')
        self.notification_id = kwargs.get('notification_id')
        self.status = kwargs.get('status')
        self.message = kwargs.get('message')
        self.timestamp = kwargs.get('timestamp', datetime.utcnow())
        self.metadata = kwargs.get('metadata', {})

    def to_dict(self) -> Dict[str, Any]:
        """Convierte el log a diccionario."""
        return {
            'id': self.id,
            'notification_id': self.notification_id,
            'status': self.status.value if isinstance(self.status, NotificationStatus) else self.status,
            'message': self.message,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'metadata': self.metadata
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'NotificationLogEntry':
        """Crea un log desde un diccionario."""
        # Convertir string a enum si es necesario
        if isinstance(data.get('status'), str):
            data['status'] = NotificationStatus(data['status'])
        
        # Convertir string de fecha a datetime si es necesario
        if isinstance(data.get('timestamp'), str):
            data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        
        return cls(**data)
