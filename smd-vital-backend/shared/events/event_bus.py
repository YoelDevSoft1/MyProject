"""
SMD VITAL - Event Bus Implementation
====================================
Patrón Publisher-Subscriber con RabbitMQ para desacoplamiento de servicios
"""

import json
import logging
from typing import Dict, Any, Callable, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import pika
from pika.exchange_type import ExchangeType
import uuid

logger = logging.getLogger(__name__)

class EventType(Enum):
    # Appointment Events
    APPOINTMENT_CREATED = "appointment.created"
    APPOINTMENT_CONFIRMED = "appointment.confirmed"
    APPOINTMENT_CANCELED = "appointment.canceled"
    APPOINTMENT_RESCHEDULED = "appointment.rescheduled"
    
    # Payment Events
    PAYMENT_INITIATED = "payment.initiated"
    PAYMENT_SUCCEEDED = "payment.succeeded"
    PAYMENT_FAILED = "payment.failed"
    PAYMENT_REFUNDED = "payment.refunded"
    
    # Medical Records Events
    RECORD_CREATED = "medical_record.created"
    RECORD_UPDATED = "medical_record.updated"
    PRESCRIPTION_READY = "prescription.ready"
    
    # User Events
    USER_REGISTERED = "user.registered"
    USER_PROFILE_UPDATED = "user.profile.updated"
    
    # Health Metrics Events
    HEALTH_METRIC_RECORDED = "health_metric.recorded"
    HEALTH_ALERT_TRIGGERED = "health_alert.triggered"

@dataclass
class Event:
    """Estructura estándar para eventos del sistema"""
    id: str
    type: EventType
    data: Dict[str, Any]
    metadata: Dict[str, Any]
    timestamp: datetime
    source_service: str
    correlation_id: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type.value,
            "data": self.data,
            "metadata": self.metadata,
            "timestamp": self.timestamp.isoformat(),
            "source_service": self.source_service,
            "correlation_id": self.correlation_id
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Event':
        return cls(
            id=data["id"],
            type=EventType(data["type"]),
            data=data["data"],
            metadata=data["metadata"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
            source_service=data["source_service"],
            correlation_id=data.get("correlation_id")
        )

class EventBus:
    """Event Bus centralizado para comunicación entre microservicios"""
    
    def __init__(self, rabbitmq_url: str, service_name: str):
        self.rabbitmq_url = rabbitmq_url
        self.service_name = service_name
        self.connection = None
        self.channel = None
        self.exchange_name = "smd_vital_events"
        self._subscribers: Dict[EventType, list] = {}
        
    def connect(self):
        """Establece conexión con RabbitMQ"""
        try:
            self.connection = pika.BlockingConnection(
                pika.URLParameters(self.rabbitmq_url)
            )
            self.channel = self.connection.channel()
            
            # Declarar exchange para eventos
            self.channel.exchange_declare(
                exchange=self.exchange_name,
                exchange_type=ExchangeType.topic,
                durable=True
            )
            
            logger.info(f"EventBus conectado para servicio: {self.service_name}")
            
        except Exception as e:
            logger.error(f"Error conectando EventBus: {e}")
            raise
    
    def publish(self, event: Event) -> bool:
        """Publica un evento en el bus"""
        try:
            if not self.channel or self.channel.is_closed:
                self.connect()
            
            # Serializar evento
            message = json.dumps(event.to_dict())
            
            # Publicar con routing key basado en el tipo de evento
            routing_key = f"{event.type.value}"
            
            self.channel.basic_publish(
                exchange=self.exchange_name,
                routing_key=routing_key,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Hacer mensaje persistente
                    message_id=event.id,
                    correlation_id=event.correlation_id,
                    timestamp=int(event.timestamp.timestamp()),
                    headers={
                        "source_service": event.source_service,
                        "event_type": event.type.value
                    }
                )
            )
            
            logger.info(f"Evento publicado: {event.type.value} - {event.id}")
            return True
            
        except Exception as e:
            logger.error(f"Error publicando evento {event.type.value}: {e}")
            return False
    
    def subscribe(self, event_type: EventType, handler: Callable[[Event], None]):
        """Suscribe un handler a un tipo de evento"""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        
        self._subscribers[event_type].append(handler)
        logger.info(f"Handler suscrito a {event_type.value}")
    
    def _setup_consumer(self, event_type: EventType):
        """Configura consumer para un tipo de evento específico"""
        if not self.channel or self.channel.is_closed:
            self.connect()
        
        # Crear queue específico para el servicio y tipo de evento
        queue_name = f"{self.service_name}.{event_type.value}"
        
        self.channel.queue_declare(queue=queue_name, durable=True)
        
        # Bind queue al exchange
        self.channel.queue_bind(
            exchange=self.exchange_name,
            queue=queue_name,
            routing_key=event_type.value
        )
        
        def callback(ch, method, properties, body):
            try:
                # Deserializar evento
                event_data = json.loads(body)
                event = Event.from_dict(event_data)
                
                # Procesar con todos los handlers suscritos
                if event_type in self._subscribers:
                    for handler in self._subscribers[event_type]:
                        try:
                            handler(event)
                        except Exception as e:
                            logger.error(f"Error en handler para {event_type.value}: {e}")
                
                # Acknowledgment
                ch.basic_ack(delivery_tag=method.delivery_tag)
                
            except Exception as e:
                logger.error(f"Error procesando evento {event_type.value}: {e}")
                # Rechazar mensaje y enviar a DLQ
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        
        # Configurar consumer
        self.channel.basic_consume(
            queue=queue_name,
            on_message_callback=callback
        )
    
    def start_consuming(self, event_types: list[EventType]):
        """Inicia el consumo de eventos para los tipos especificados"""
        try:
            for event_type in event_types:
                self._setup_consumer(event_type)
            
            logger.info(f"Iniciando consumo de eventos: {[et.value for et in event_types]}")
            self.channel.start_consuming()
            
        except KeyboardInterrupt:
            logger.info("Deteniendo consumo de eventos...")
            self.channel.stop_consuming()
        except Exception as e:
            logger.error(f"Error en consumo de eventos: {e}")
            raise
    
    def close(self):
        """Cierra conexiones"""
        if self.channel and not self.channel.is_closed:
            self.channel.close()
        if self.connection and not self.connection.is_closed:
            self.connection.close()

# Factory para crear eventos
class EventFactory:
    @staticmethod
    def create_event(
        event_type: EventType,
        data: Dict[str, Any],
        source_service: str,
        correlation_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Event:
        return Event(
            id=str(uuid.uuid4()),
            type=event_type,
            data=data,
            metadata=metadata or {},
            timestamp=datetime.utcnow(),
            source_service=source_service,
            correlation_id=correlation_id
        )

# Ejemplo de uso en servicios
class NotificationEventHandler:
    """Handler específico para eventos de notificaciones"""
    
    def __init__(self, notification_service):
        self.notification_service = notification_service
    
    def handle_appointment_created(self, event: Event):
        """Maneja evento de cita creada"""
        appointment_data = event.data
        user_id = appointment_data.get("user_id")
        
        # Crear notificación de confirmación
        self.notification_service.send_notification(
            user_id=user_id,
            event_type="appointment_created",
            channel="email",
            data=appointment_data
        )
    
    def handle_payment_succeeded(self, event: Event):
        """Maneja evento de pago exitoso"""
        payment_data = event.data
        user_id = payment_data.get("user_id")
        
        # Crear notificación de confirmación de pago
        self.notification_service.send_notification(
            user_id=user_id,
            event_type="payment_confirmation",
            channel="email",
            data=payment_data
        )


