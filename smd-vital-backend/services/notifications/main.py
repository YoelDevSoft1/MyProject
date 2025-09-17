"""
SMD Vital - Notification Service
=================================

Microservicio de gestión de notificaciones multi-canal para la plataforma SMD Vital.
"""

from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import json
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from models.database import get_db, Notification, NotificationTemplate, NotificationEvent, NotificationPreference
from models import NotificationCreate, NotificationResponse, NotificationTemplateCreate, NotificationEventCreate, NotificationPreferenceCreate
from security import verify_token, get_current_user

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app instance
app = FastAPI(
    title="SMD Vital - Notification Service",
    description="Microservicio de gestión de notificaciones multi-canal (Email, SMS, Push, WhatsApp) para SMD Vital Bogotá",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS is handled by Nginx API Gateway
# No need for CORS middleware in individual microservices

security = HTTPBearer()

# Notification Templates
TEMPLATES = {
    "appointment_confirmation": {
        "subject": "Confirmación de Cita Médica - SMD Vital",
        "body_email": """
        <h2>Confirmación de Cita Médica</h2>
        <p>Estimado/a {patient_name},</p>
        <p>Su cita médica ha sido confirmada para:</p>
        <ul>
            <li><strong>Fecha:</strong> {appointment_date}</li>
            <li><strong>Hora:</strong> {appointment_time}</li>
            <li><strong>Doctor:</strong> {doctor_name}</li>
            <li><strong>Especialidad:</strong> {specialty}</li>
            <li><strong>Dirección:</strong> {location}</li>
        </ul>
        <p>Por favor llegue 15 minutos antes de su cita.</p>
        <p>¡Esperamos verle pronto!</p>
        """,
        "body_sms": "Cita confirmada: {appointment_date} {appointment_time} con Dr. {doctor_name}. Llegue 15 min antes. SMD Vital",
        "body_whatsapp": "🏥 *Cita Confirmada - SMD Vital*\n\n📅 {appointment_date}\n🕐 {appointment_time}\n👨‍⚕️ Dr. {doctor_name}\n📍 {location}\n\n⏰ Llegue 15 minutos antes"
    },
    "appointment_reminder": {
        "subject": "Recordatorio de Cita Médica - SMD Vital",
        "body_email": """
        <h2>Recordatorio de Cita Médica</h2>
        <p>Estimado/a {patient_name},</p>
        <p>Le recordamos que tiene una cita médica programada para:</p>
        <ul>
            <li><strong>Fecha:</strong> {appointment_date}</li>
            <li><strong>Hora:</strong> {appointment_time}</li>
            <li><strong>Doctor:</strong> {doctor_name}</li>
        </ul>
        <p>No olvide traer su documento de identidad y seguro médico.</p>
        """,
        "body_sms": "Recordatorio: Cita mañana {appointment_time} con Dr. {doctor_name}. No olvide documentos. SMD Vital",
        "body_whatsapp": "🔔 *Recordatorio de Cita*\n\n📅 Mañana {appointment_date}\n🕐 {appointment_time}\n👨‍⚕️ Dr. {doctor_name}\n\n📄 Traiga documentos"
    },
    "prescription_ready": {
        "subject": "Receta Médica Lista - SMD Vital",
        "body_email": """
        <h2>Receta Médica Lista</h2>
        <p>Estimado/a {patient_name},</p>
        <p>Su receta médica está lista y puede recogerla en nuestras instalaciones.</p>
        <p><strong>Medicamentos prescritos:</strong> {medications}</p>
        <p>Horario de atención: Lunes a Viernes 8:00 AM - 6:00 PM</p>
        """,
        "body_sms": "Receta lista para recoger. Medicamentos: {medications}. SMD Vital",
        "body_whatsapp": "💊 *Receta Lista*\n\n{medications}\n\n🕐 Horario: L-V 8AM-6PM"
    },
    "payment_confirmation": {
        "subject": "Confirmación de Pago - SMD Vital",
        "body_email": """
        <h2>Confirmación de Pago</h2>
        <p>Estimado/a {patient_name},</p>
        <p>Hemos recibido su pago exitosamente:</p>
        <ul>
            <li><strong>Monto:</strong> ${amount} {currency}</li>
            <li><strong>Concepto:</strong> {description}</li>
            <li><strong>Fecha:</strong> {payment_date}</li>
            <li><strong>Referencia:</strong> {transaction_id}</li>
        </ul>
        <p>Gracias por confiar en SMD Vital.</p>
        """,
        "body_sms": "Pago confirmado: ${amount} {currency} - Ref: {transaction_id}. SMD Vital",
        "body_whatsapp": "✅ *Pago Confirmado*\n\n💰 ${amount} {currency}\n📋 {description}\n🆔 {transaction_id}"
    }
}

# Notification Endpoints
@app.post("/notifications", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED, tags=["Notifications"])
async def create_notification(
    notification_data: NotificationCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Crear y enviar una nueva notificación"""
    try:
        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=notification_data.user_id,
            type=notification_data.type,
            title=notification_data.title,
            message=notification_data.message,
            channels=notification_data.channels,
            priority=notification_data.priority,
            template_data=notification_data.template_data,
            scheduled_for=notification_data.scheduled_for,
            status="pending",
            created_by=current_user["user_id"],
            created_at=datetime.utcnow()
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        # Enviar notificación en background
        if notification.scheduled_for is None or notification.scheduled_for <= datetime.utcnow():
            background_tasks.add_task(process_notification, notification.id, db)
        
        logger.info(f"Notification created: {notification.id} for user: {notification.user_id}")
        return notification
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating notification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al crear notificación: {str(e)}")

@app.get("/notifications/user/{user_id}", response_model=List[NotificationResponse], tags=["Notifications"])
async def get_user_notifications(
    user_id: str,
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener notificaciones de un usuario"""
    try:
        # Verificar permisos
        if current_user.get("user_id") != user_id and current_user.get("role") not in ["admin"]:
            raise HTTPException(status_code=403, detail="No tiene permisos para ver estas notificaciones")
        
        query = db.query(Notification).filter(Notification.user_id == user_id)
        
        if status:
            query = query.filter(Notification.status == status)
        
        notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
        return notifications
        
    except Exception as e:
        logger.error(f"Error getting user notifications: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener notificaciones: {str(e)}")

@app.put("/notifications/{notification_id}/mark-read", tags=["Notifications"])
async def mark_notification_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Marcar notificación como leída"""
    try:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        
        if not notification:
            raise HTTPException(status_code=404, detail="Notificación no encontrada")
        
        # Verificar permisos
        if current_user.get("user_id") != notification.user_id and current_user.get("role") not in ["admin"]:
            raise HTTPException(status_code=403, detail="No tiene permisos para modificar esta notificación")
        
        notification.status = "read"
        notification.read_at = datetime.utcnow()
        
        db.commit()
        
        logger.info(f"Notification marked as read: {notification_id}")
        return {"message": "Notificación marcada como leída"}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error marking notification as read: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al marcar notificación: {str(e)}")

# Template-based notifications
@app.post("/notifications/send-template", tags=["Templates"])
async def send_template_notification(
    template_name: str,
    user_id: str,
    template_data: Dict[str, Any],
    channels: List[str],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Enviar notificación usando plantilla predefinida"""
    try:
        if template_name not in TEMPLATES:
            raise HTTPException(status_code=404, detail="Plantilla no encontrada")
        
        template = TEMPLATES[template_name]
        
        # Crear notificación basada en plantilla
        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            type=template_name,
            title=template["subject"],
            message=template.get("body_email", ""),
            channels=channels,
            priority="normal",
            template_data=template_data,
            status="pending",
            created_by=current_user["user_id"],
            created_at=datetime.utcnow()
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        # Procesar envío en background
        background_tasks.add_task(process_template_notification, notification.id, template_name, template_data, db)
        
        logger.info(f"Template notification created: {notification.id} using template: {template_name}")
        return {"message": "Notificación de plantilla enviada", "notification_id": notification.id}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error sending template notification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al enviar notificación de plantilla: {str(e)}")

# User Preferences
@app.post("/preferences", tags=["Preferences"])
async def set_user_preferences(
    preferences_data: NotificationPreferenceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Configurar preferencias de notificación del usuario"""
    try:
        # Solo el propio usuario puede configurar sus preferencias
        if current_user.get("user_id") != preferences_data.user_id and current_user.get("role") not in ["admin"]:
            raise HTTPException(status_code=403, detail="No puede configurar preferencias de otros usuarios")
        
        # Buscar preferencias existentes
        existing_pref = db.query(UserPreference).filter(UserPreference.user_id == preferences_data.user_id).first()
        
        if existing_pref:
            # Actualizar preferencias existentes
            existing_pref.email_enabled = preferences_data.email_enabled
            existing_pref.sms_enabled = preferences_data.sms_enabled
            existing_pref.push_enabled = preferences_data.push_enabled
            existing_pref.whatsapp_enabled = preferences_data.whatsapp_enabled
            existing_pref.notification_types = preferences_data.notification_types
            existing_pref.updated_at = datetime.utcnow()
        else:
            # Crear nuevas preferencias
            preference = UserPreference(
                id=str(uuid.uuid4()),
                user_id=preferences_data.user_id,
                email_enabled=preferences_data.email_enabled,
                sms_enabled=preferences_data.sms_enabled,
                push_enabled=preferences_data.push_enabled,
                whatsapp_enabled=preferences_data.whatsapp_enabled,
                notification_types=preferences_data.notification_types,
                created_at=datetime.utcnow()
            )
            db.add(preference)
        
        db.commit()
        
        logger.info(f"User preferences updated for user: {preferences_data.user_id}")
        return {"message": "Preferencias de notificación actualizadas"}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating user preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al actualizar preferencias: {str(e)}")

@app.get("/preferences/{user_id}", tags=["Preferences"])
async def get_user_preferences(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener preferencias de notificación del usuario"""
    try:
        # Verificar permisos
        if current_user.get("user_id") != user_id and current_user.get("role") not in ["admin"]:
            raise HTTPException(status_code=403, detail="No tiene permisos para ver estas preferencias")
        
        preferences = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
        
        if not preferences:
            # Retornar preferencias por defecto
            return {
                "user_id": user_id,
                "email_enabled": True,
                "sms_enabled": True,
                "push_enabled": True,
                "whatsapp_enabled": True,
                "notification_types": ["appointment_confirmation", "appointment_reminder", "prescription_ready", "payment_confirmation"]
            }
        
        return preferences
        
    except Exception as e:
        logger.error(f"Error getting user preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener preferencias: {str(e)}")

# Notification Statistics
@app.get("/stats", tags=["Statistics"])
async def get_notification_stats(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener estadísticas de notificaciones"""
    try:
        if current_user.get("role") not in ["admin"]:
            raise HTTPException(status_code=403, detail="Solo administradores pueden ver estadísticas")
        
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()
        
        # Estadísticas básicas
        total_notifications = db.query(Notification).filter(
            and_(Notification.created_at >= start_date, Notification.created_at <= end_date)
        ).count()
        
        sent_notifications = db.query(Notification).filter(
            and_(
                Notification.created_at >= start_date,
                Notification.created_at <= end_date,
                Notification.status == "sent"
            )
        ).count()
        
        failed_notifications = db.query(Notification).filter(
            and_(
                Notification.created_at >= start_date,
                Notification.created_at <= end_date,
                Notification.status == "failed"
            )
        ).count()
        
        # Por tipo
        notifications_by_type = {}
        types = db.query(Notification.type).filter(
            and_(Notification.created_at >= start_date, Notification.created_at <= end_date)
        ).distinct().all()
        
        for type_row in types:
            count = db.query(Notification).filter(
                and_(
                    Notification.created_at >= start_date,
                    Notification.created_at <= end_date,
                    Notification.type == type_row[0]
                )
            ).count()
            notifications_by_type[type_row[0]] = count
        
        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "summary": {
                "total_notifications": total_notifications,
                "sent_notifications": sent_notifications,
                "failed_notifications": failed_notifications,
                "success_rate": (sent_notifications / total_notifications * 100) if total_notifications > 0 else 0
            },
            "by_type": notifications_by_type
        }
        
    except Exception as e:
        logger.error(f"Error getting notification stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener estadísticas: {str(e)}")

# Background task functions
async def process_notification(notification_id: str, db: Session):
    """Procesar envío de notificación"""
    try:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            return
        
        # Simular envío de notificación
        success = True
        
        for channel in notification.channels:
            try:
                if channel == "email":
                    success &= await send_email_notification(notification)
                elif channel == "sms":
                    success &= await send_sms_notification(notification)
                elif channel == "push":
                    success &= await send_push_notification(notification)
                elif channel == "whatsapp":
                    success &= await send_whatsapp_notification(notification)
            except Exception as e:
                logger.error(f"Error sending {channel} notification: {str(e)}")
                success = False
        
        # Actualizar estado
        notification.status = "sent" if success else "failed"
        notification.sent_at = datetime.utcnow() if success else None
        
        db.commit()
        
    except Exception as e:
        logger.error(f"Error processing notification {notification_id}: {str(e)}")

async def process_template_notification(notification_id: str, template_name: str, template_data: Dict[str, Any], db: Session):
    """Procesar notificación de plantilla"""
    try:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            return
        
        template = TEMPLATES[template_name]
        
        # Personalizar mensaje por canal
        for channel in notification.channels:
            try:
                if channel == "email":
                    content = template["body_email"].format(**template_data)
                    success = await send_email_notification(notification, content)
                elif channel == "sms":
                    content = template["body_sms"].format(**template_data)
                    success = await send_sms_notification(notification, content)
                elif channel == "whatsapp":
                    content = template["body_whatsapp"].format(**template_data)
                    success = await send_whatsapp_notification(notification, content)
                    
                # Log envío
                log = NotificationLog(
                    id=str(uuid.uuid4()),
                    notification_id=notification_id,
                    channel=channel,
                    status="sent" if success else "failed",
                    sent_at=datetime.utcnow()
                )
                db.add(log)
                
            except Exception as e:
                logger.error(f"Error sending template {channel} notification: {str(e)}")
        
        notification.status = "sent"
        notification.sent_at = datetime.utcnow()
        db.commit()
        
    except Exception as e:
        logger.error(f"Error processing template notification {notification_id}: {str(e)}")

# Mock notification functions (en producción se integrarían con servicios reales)
async def send_email_notification(notification, content=None):
    """Simular envío de email"""
    logger.info(f"Sending email notification to user: {notification.user_id}")
    return True

async def send_sms_notification(notification, content=None):
    """Simular envío de SMS"""
    logger.info(f"Sending SMS notification to user: {notification.user_id}")
    return True

async def send_push_notification(notification, content=None):
    """Simular envío de push notification"""
    logger.info(f"Sending push notification to user: {notification.user_id}")
    return True

async def send_whatsapp_notification(notification, content=None):
    """Simular envío de WhatsApp"""
    logger.info(f"Sending WhatsApp notification to user: {notification.user_id}")
    return True

# Health Check
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "notification-service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# Metrics endpoint for Prometheus
@app.get("/metrics", tags=["Metrics"])
async def metrics():
    """Prometheus metrics endpoint"""
    from shared.metrics import get_metrics_response
    return get_metrics_response()

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "SMD Vital Notification Service",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/info", tags=["Info"])
async def service_info():
    """Service information"""
    return {
        "service": "notification-service",
        "description": "Multi-channel notification and communication service",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "info": "/info"
        },
        "database": "smdvital_notifications",
        "port": 8006
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8006,
        reload=True,
        log_level="info"
    )