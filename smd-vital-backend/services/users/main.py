"""
SMD Vital - User Service
========================

Microservicio de gestión de usuarios para la plataforma SMD Vital.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging
import os

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app instance
app = FastAPI(
    title="SMD Vital - User Service",
    description="Microservicio de gestión de usuarios para SMD Vital Bogotá",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS is handled by Nginx API Gateway
# No need for CORS middleware in individual microservices

# Health Check
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "user-service",
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
        "message": "SMD Vital User Service",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/info", tags=["Info"])
async def service_info():
    """Service information"""
    return {
        "service": "user-service",
        "description": "User profile and management service",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "info": "/info"
        },
        "database": "smdvital_users",
        "port": 8002
    }

# ===== USER PROFILE APIs =====

@app.get("/profile", tags=["User Profile"])
async def get_user_profile(user_id: str = None):
    """Obtener perfil completo del usuario"""
    try:
        logger.info(f"Getting user profile for user_id: {user_id}")
        
        if not user_id:
            return {
                "success": False,
                "error": "user_id es requerido"
            }
        
        # Importar el servicio de autenticación para obtener datos del usuario
        import requests
        
        # Obtener datos del usuario desde el servicio de autenticación
        auth_service_url = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")
        
        try:
            # Hacer petición al servicio de autenticación para obtener datos del usuario
            response = requests.get(f"{auth_service_url}/users/{user_id}", timeout=10)
            
            if response.status_code == 200:
                user_data = response.json()
                logger.info(f"User data retrieved from auth service: {user_data}")
                
                # Transformar datos para el perfil
                profile_data = {
                    "id": user_data.get("id", ""),
                    "email": user_data.get("email", ""),
                    "name": f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip() or user_data.get("email", "").split("@")[0] or "Usuario",
                    "first_name": user_data.get("first_name", ""),
                    "last_name": user_data.get("last_name", ""),
                    "username": user_data.get("username", ""),
                    "role": user_data.get("role", "user"),
                    "specialty": user_data.get("specialty", ""),
                    "phone": user_data.get("phone", ""),
                    "avatar": user_data.get("profile_picture", ""),
                    "profile_picture": user_data.get("profile_picture", ""),
                    "bio": user_data.get("bio", ""),
                    "is_active": user_data.get("is_active", True),
                    "is_verified": user_data.get("is_verified", False),
                    "email_verified": user_data.get("email_verified", False),
                    "created_at": user_data.get("created_at"),
                    "updated_at": user_data.get("updated_at"),
                    "last_login": user_data.get("last_login"),
                    "profile_complete": user_data.get("profile_complete", False),
                    "notifications_enabled": user_data.get("notifications_enabled", True),
                    "email_notifications": user_data.get("email_notifications", True),
                    "sms_notifications": user_data.get("sms_notifications", False),
                    "push_notifications": user_data.get("push_notifications", True),
                    "google_id": user_data.get("google_id", "")
                }
                
                return {
                    "success": True,
                    "data": profile_data
                }
            else:
                logger.error(f"Error getting user from auth service: {response.status_code}")
                return {
                    "success": False,
                    "error": "No se pudo obtener datos del usuario desde el servicio de autenticación"
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error connecting to auth service: {e}")
            return {
                "success": False,
                "error": "Error de conexión con el servicio de autenticación"
            }
            
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        return {
            "success": False,
            "error": "Error al obtener el perfil del usuario"
        }

@app.put("/profile", tags=["User Profile"])
async def update_user_profile(profile_data: dict):
    """Actualizar perfil del usuario"""
    try:
        logger.info(f"Updating user profile: {profile_data}")
        
        # Aquí iría la lógica para actualizar el perfil
        return {
            "success": True,
            "message": "Perfil actualizado correctamente",
            "data": profile_data
        }
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        return {
            "success": False,
            "error": "Error al actualizar el perfil"
        }

@app.get("/notifications", tags=["Notifications"])
async def get_user_notifications(user_id: str = None, limit: int = 10, offset: int = 0):
    """Obtener notificaciones del usuario"""
    try:
        logger.info(f"Getting notifications for user_id: {user_id}")
        
        # Datos de ejemplo de notificaciones
        notifications = [
            {
                "id": "notif_1",
                "title": "Nueva cita programada",
                "message": "Tienes una nueva cita con el Dr. García el 20 de septiembre",
                "type": "appointment",
                "read": False,
                "created_at": "2024-09-17T10:30:00Z",
                "priority": "medium"
            },
            {
                "id": "notif_2",
                "title": "Recordatorio de medicamento",
                "message": "Es hora de tomar tu medicamento prescrito",
                "type": "medication",
                "read": True,
                "created_at": "2024-09-17T09:00:00Z",
                "priority": "high"
            },
            {
                "id": "notif_3",
                "title": "Resultados de laboratorio",
                "message": "Los resultados de tu último análisis están disponibles",
                "type": "lab_results",
                "read": False,
                "created_at": "2024-09-16T15:45:00Z",
                "priority": "low"
            }
        ]
        
        return {
            "success": True,
            "data": {
                "notifications": notifications[offset:offset+limit],
                "total": len(notifications),
                "unread_count": len([n for n in notifications if not n["read"]])
            }
        }
    except Exception as e:
        logger.error(f"Error getting notifications: {e}")
        return {
            "success": False,
            "error": "Error al obtener las notificaciones"
        }

@app.put("/notifications/settings", tags=["Notifications"])
async def update_notification_settings(settings: dict):
    """Actualizar configuración de notificaciones"""
    try:
        logger.info(f"Updating notification settings: {settings}")
        
        return {
            "success": True,
            "message": "Configuración de notificaciones actualizada",
            "data": settings
        }
    except Exception as e:
        logger.error(f"Error updating notification settings: {e}")
        return {
            "success": False,
            "error": "Error al actualizar la configuración"
        }

@app.put("/notifications/{notification_id}/read", tags=["Notifications"])
async def mark_notification_read(notification_id: str):
    """Marcar notificación como leída"""
    try:
        logger.info(f"Marking notification {notification_id} as read")
        
        return {
            "success": True,
            "message": "Notificación marcada como leída"
        }
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        return {
            "success": False,
            "error": "Error al marcar la notificación"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    )