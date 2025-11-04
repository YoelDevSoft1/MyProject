"""
SMD VITAL - Notification Service
================================
Servicio de notificaciones multicanal
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import logging
import os
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import uuid

# Configuración
DATABASE_URL = os.getenv("DATABASE_URL")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# Database
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI(title="SMD Vital Notification Service", version="1.0.0")

# ===== CONFIGURACIÓN CORS =====
# CORS habilitado para desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
class NotificationRequest(BaseModel):
    user_id: str = Field(..., description="ID del usuario")
    event_type: str = Field(..., description="Tipo de evento")
    channel: str = Field(..., description="Canal de notificación (email, sms, push)")
    data: Dict[str, Any] = Field(..., description="Datos de la notificación")
    priority: int = Field(default=1, description="Prioridad (1=alta, 2=media, 3=baja)")

class NotificationResponse(BaseModel):
    notification_id: str = Field(..., description="ID de la notificación")
    status: str = Field(..., description="Estado de la notificación")
    message: str = Field(..., description="Mensaje de respuesta")

class NotificationDetails(BaseModel):
    id: str
    user_id: str
    event_type: str
    channel: str
    subject: str
    body: str
    metadata: Optional[Dict[str, Any]] = None
    priority: int
    status: str
    created_at: str
    delivered_at: Optional[str] = None
    read_at: Optional[str] = None

class NotificationTemplate(BaseModel):
    id: str
    name: str
    event_type: str
    channel: str
    subject_template: str
    body_template: str
    variables: List[str]
    is_active: bool
    created_at: str
    updated_at: str

class TemplateRequest(BaseModel):
    name: str = Field(..., description="Nombre del template")
    event_type: str = Field(..., description="Tipo de evento")
    channel: str = Field(..., description="Canal de notificación")
    subject_template: str = Field(..., description="Template del asunto")
    body_template: str = Field(..., description="Template del cuerpo")
    variables: List[str] = Field(default=[], description="Variables del template")

class NotificationSettings(BaseModel):
    user_id: str = Field(..., description="ID del usuario")
    email_enabled: bool = Field(default=True, description="Notificaciones por email")
    sms_enabled: bool = Field(default=True, description="Notificaciones por SMS")
    push_enabled: bool = Field(default=True, description="Notificaciones push")
    whatsapp_enabled: bool = Field(default=False, description="Notificaciones por WhatsApp")
    notification_types: List[str] = Field(default=[], description="Tipos de notificación permitidos")

class BulkNotificationRequest(BaseModel):
    user_ids: List[str] = Field(..., description="Lista de IDs de usuarios")
    event_type: str = Field(..., description="Tipo de evento")
    channel: str = Field(..., description="Canal de notificación")
    data: Dict[str, Any] = Field(..., description="Datos de la notificación")
    priority: int = Field(default=1, description="Prioridad")

# Database functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_notification(db, notification_data: dict):
    """Crear notificación en la base de datos"""
    query = text("""
        INSERT INTO notifications (
            user_id, event_type, channel, subject, body, 
            metadata, priority
        ) VALUES (
            :user_id, :event_type, :channel, :subject, :body,
            :metadata, :priority
        ) RETURNING id
    """)
    
    result = db.execute(query, notification_data)
    return result.fetchone()[0]

# API Endpoints
@app.post("/send-notification", response_model=NotificationResponse)
async def send_notification(
    request: NotificationRequest,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    """Enviar notificación inmediata"""
    try:
        # Crear notificación en BD
        notification_data = {
            "user_id": request.user_id,
            "event_type": request.event_type,
            "channel": request.channel,
            "subject": f"Notificación {request.event_type}",
            "body": json.dumps(request.data),
            "metadata": json.dumps(request.data),
            "priority": request.priority
        }
        
        notification_id = create_notification(db, notification_data)
        
        # Enviar notificación en background
        background_tasks.add_task(
            process_notification,
            notification_id,
            request.channel,
            request.data
        )
        
        return NotificationResponse(
            notification_id=str(notification_id),
            status="queued",
            message="Notificación en cola para envío"
        )
        
    except Exception as e:
        logger.error(f"Error enviando notificación: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

async def process_notification(notification_id: str, channel: str, data: dict):
    """Procesar notificación en background"""
    try:
        success = False
        
        if channel == "email":
            email = data.get("email")
            if email:
                success = send_email_notification(email, data)
        
        # Actualizar estado en BD
        db = SessionLocal()
        try:
            status = "delivered" if success else "failed"
            query = text("""
                UPDATE notifications 
                SET status = :status, 
                    delivered_at = CASE WHEN :success THEN NOW() ELSE NULL END
                WHERE id = :notification_id
            """)
            
            db.execute(query, {
                "status": status,
                "success": success,
                "notification_id": notification_id
            })
            db.commit()
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Error procesando notificación {notification_id}: {e}")

def send_email_notification(email: str, data: dict):
    """Enviar email de notificación"""
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = email
        msg['Subject'] = "Notificación SMD Vital"
        
        body = f"Notificación: {json.dumps(data, indent=2)}"
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Email enviado a {email}")
        return True
        
    except Exception as e:
        logger.error(f"Error enviando email: {e}")
        return False

@app.get("/notifications", response_model=List[NotificationDetails], tags=["Notifications"])
async def get_notifications(
    user_id: Optional[str] = Query(None, description="Filtrar por ID de usuario"),
    event_type: Optional[str] = Query(None, description="Filtrar por tipo de evento"),
    channel: Optional[str] = Query(None, description="Filtrar por canal"),
    status: Optional[str] = Query(None, description="Filtrar por estado"),
    limit: int = Query(50, ge=1, le=100, description="Límite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginación")
):
    """
    Obtener notificaciones con filtros opcionales
    
    - **user_id**: Filtrar por ID de usuario
    - **event_type**: Filtrar por tipo de evento
    - **channel**: Filtrar por canal de notificación
    - **status**: Filtrar por estado
    - **limit**: Número máximo de resultados (1-100)
    - **offset**: Número de resultados a omitir
    """
    try:
        # Por ahora, devolver datos de ejemplo hasta que se configure la base de datos
        notifications_data = [
            {
                "id": "1",
                "user_id": user_id or "default",
                "event_type": "appointment_reminder",
                "channel": "email",
                "subject": "Recordatorio de cita médica",
                "body": "Tienes una cita médica programada para mañana",
                "metadata": {"appointment_id": "123"},
                "priority": 1,
                "status": "delivered",
                "created_at": "2024-01-15T10:00:00Z",
                "delivered_at": "2024-01-15T10:05:00Z",
                "read_at": None
            },
            {
                "id": "2",
                "user_id": user_id or "default",
                "event_type": "payment_confirmation",
                "channel": "sms",
                "subject": "Confirmación de pago",
                "body": "Tu pago ha sido procesado exitosamente",
                "metadata": {"payment_id": "456"},
                "priority": 2,
                "status": "delivered",
                "created_at": "2024-01-15T09:30:00Z",
                "delivered_at": "2024-01-15T09:32:00Z",
                "read_at": "2024-01-15T09:35:00Z"
            },
            {
                "id": "3",
                "user_id": user_id or "default",
                "event_type": "lab_results",
                "channel": "push",
                "subject": "Resultados de laboratorio",
                "body": "Los resultados de tu análisis están disponibles",
                "metadata": {"lab_id": "789"},
                "priority": 1,
                "status": "pending",
                "created_at": "2024-01-15T11:00:00Z",
                "delivered_at": None,
                "read_at": None
            }
        ]
        
        # Aplicar filtros
        if event_type:
            notifications_data = [n for n in notifications_data if n["event_type"] == event_type]
        if channel:
            notifications_data = [n for n in notifications_data if n["channel"] == channel]
        if status:
            notifications_data = [n for n in notifications_data if n["status"] == status]
        
        # Aplicar paginación
        paginated_notifications = notifications_data[offset:offset+limit]
        
        return [NotificationDetails(**notification) for notification in paginated_notifications]
        
    except Exception as e:
        logger.error(f"Error obteniendo notificaciones: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/notifications/{notification_id}", response_model=NotificationDetails, tags=["Notifications"])
async def get_notification_details(notification_id: str):
    """
    Obtener detalles de una notificación específica
    
    - **notification_id**: ID de la notificación
    """
    try:
        # Datos de ejemplo
        notification_data = {
            "id": notification_id,
            "user_id": "user-123",
            "event_type": "appointment_reminder",
            "channel": "email",
            "subject": "Recordatorio de cita médica",
            "body": "Tienes una cita médica programada para mañana a las 10:00 AM",
            "metadata": {"appointment_id": "123", "doctor_name": "Dr. García"},
            "priority": 1,
            "status": "delivered",
            "created_at": "2024-01-15T10:00:00Z",
            "delivered_at": "2024-01-15T10:05:00Z",
            "read_at": "2024-01-15T10:10:00Z"
        }
        
        return NotificationDetails(**notification_data)
        
    except Exception as e:
        logger.error(f"Error obteniendo detalles de notificación: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.put("/notifications/{notification_id}/read", tags=["Notifications"])
async def mark_notification_read(notification_id: str):
    """
    Marcar notificación como leída
    
    - **notification_id**: ID de la notificación
    """
    try:
        # Aquí se actualizaría el estado en la base de datos
        # Por ahora retornamos éxito
        
        return {
            "success": True,
            "message": "Notificación marcada como leída",
            "read_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error marcando notificación como leída: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.post("/notifications/bulk", response_model=List[NotificationResponse], tags=["Notifications"])
async def send_bulk_notification(
    request: BulkNotificationRequest,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    """
    Enviar notificación masiva a múltiples usuarios
    
    - **request**: Datos de la notificación masiva
    """
    try:
        responses = []
        
        for user_id in request.user_ids:
            # Crear notificación para cada usuario
            notification_data = {
                "user_id": user_id,
                "event_type": request.event_type,
                "channel": request.channel,
                "subject": f"Notificación {request.event_type}",
                "body": json.dumps(request.data),
                "metadata": json.dumps(request.data),
                "priority": request.priority
            }
            
            notification_id = create_notification(db, notification_data)
            
            # Enviar notificación en background
            background_tasks.add_task(
                process_notification,
                notification_id,
                request.channel,
                request.data
            )
            
            responses.append(NotificationResponse(
                notification_id=str(notification_id),
                status="queued",
                message="Notificación en cola para envío"
            ))
        
        return responses
        
    except Exception as e:
        logger.error(f"Error enviando notificación masiva: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/templates", response_model=List[NotificationTemplate], tags=["Templates"])
async def get_notification_templates(
    event_type: Optional[str] = Query(None, description="Filtrar por tipo de evento"),
    channel: Optional[str] = Query(None, description="Filtrar por canal"),
    limit: int = Query(50, ge=1, le=100, description="Límite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginación")
):
    """
    Obtener templates de notificaciones
    
    - **event_type**: Filtrar por tipo de evento
    - **channel**: Filtrar por canal
    - **limit**: Número máximo de resultados
    - **offset**: Número de resultados a omitir
    """
    try:
        # Datos de ejemplo
        templates_data = [
            {
                "id": "template_1",
                "name": "Recordatorio de cita",
                "event_type": "appointment_reminder",
                "channel": "email",
                "subject_template": "Recordatorio: Cita médica con {{doctor_name}}",
                "body_template": "Hola {{patient_name}}, tienes una cita médica programada para {{appointment_date}} a las {{appointment_time}}.",
                "variables": ["doctor_name", "patient_name", "appointment_date", "appointment_time"],
                "is_active": True,
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:00:00Z"
            },
            {
                "id": "template_2",
                "name": "Confirmación de pago",
                "event_type": "payment_confirmation",
                "channel": "sms",
                "subject_template": "Pago confirmado",
                "body_template": "Tu pago de ${{amount}} ha sido procesado exitosamente. Referencia: {{payment_id}}",
                "variables": ["amount", "payment_id"],
                "is_active": True,
                "created_at": "2024-01-15T09:00:00Z",
                "updated_at": "2024-01-15T09:00:00Z"
            }
        ]
        
        # Aplicar filtros
        if event_type:
            templates_data = [t for t in templates_data if t["event_type"] == event_type]
        if channel:
            templates_data = [t for t in templates_data if t["channel"] == channel]
        
        # Aplicar paginación
        paginated_templates = templates_data[offset:offset+limit]
        
        return [NotificationTemplate(**template) for template in paginated_templates]
        
    except Exception as e:
        logger.error(f"Error obteniendo templates: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.post("/templates", response_model=NotificationTemplate, tags=["Templates"])
async def create_notification_template(
    request: TemplateRequest,
    db = Depends(get_db)
):
    """
    Crear un nuevo template de notificación
    
    - **request**: Datos del template
    """
    try:
        # Crear template en base de datos
        template_data = {
            "id": str(uuid.uuid4()),
            "name": request.name,
            "event_type": request.event_type,
            "channel": request.channel,
            "subject_template": request.subject_template,
            "body_template": request.body_template,
            "variables": request.variables,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        return NotificationTemplate(**template_data)
        
    except Exception as e:
        logger.error(f"Error creando template: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/settings/{user_id}", response_model=NotificationSettings, tags=["Settings"])
async def get_notification_settings(user_id: str):
    """
    Obtener configuración de notificaciones de un usuario
    
    - **user_id**: ID del usuario
    """
    try:
        # Datos de ejemplo
        settings_data = {
            "user_id": user_id,
            "email_enabled": True,
            "sms_enabled": True,
            "push_enabled": True,
            "whatsapp_enabled": False,
            "notification_types": ["appointment_reminder", "payment_confirmation", "lab_results"]
        }
        
        return NotificationSettings(**settings_data)
        
    except Exception as e:
        logger.error(f"Error obteniendo configuración: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.put("/settings/{user_id}", response_model=NotificationSettings, tags=["Settings"])
async def update_notification_settings(
    user_id: str,
    settings: NotificationSettings,
    db = Depends(get_db)
):
    """
    Actualizar configuración de notificaciones de un usuario
    
    - **user_id**: ID del usuario
    - **settings**: Nueva configuración
    """
    try:
        # Aquí se guardaría la configuración en la base de datos
        # Por ahora retornamos la configuración actualizada
        
        return settings
        
    except Exception as e:
        logger.error(f"Error actualizando configuración: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/stats", tags=["Statistics"])
async def get_notification_statistics(
    start_date: Optional[str] = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    channel: Optional[str] = Query(None, description="Filtrar por canal")
):
    """
    Obtener estadísticas de notificaciones
    
    - **start_date**: Fecha de inicio para el rango
    - **end_date**: Fecha de fin para el rango
    - **channel**: Filtrar por canal de notificación
    """
    try:
        # Datos de ejemplo
        stats_data = {
            "total_notifications": 1250,
            "delivered": 1180,
            "pending": 45,
            "failed": 25,
            "by_channel": {
                "email": 800,
                "sms": 300,
                "push": 150
            },
            "by_event_type": {
                "appointment_reminder": 600,
                "payment_confirmation": 400,
                "lab_results": 150,
                "general": 100
            },
            "period": {
                "start_date": start_date or "2024-01-01",
                "end_date": end_date or "2024-01-31"
            }
        }
        
        return stats_data
        
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "notification-service"}

from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)