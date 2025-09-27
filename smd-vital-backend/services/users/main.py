"""
SMD Vital - User Service
========================

Microservicio de gestión de usuarios para la plataforma SMD Vital.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging
import os
from typing import Optional, List
from pydantic import BaseModel, EmailStr
import requests

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic Models
class UserProfile(BaseModel):
    id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_conditions: Optional[List[str]] = None
    role: str = "patient"
    is_active: bool = True
    is_verified: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    medical_conditions: Optional[List[str]] = None

class NotificationSettings(BaseModel):
    email_enabled: bool = True
    sms_enabled: bool = True
    push_enabled: bool = True
    whatsapp_enabled: bool = False
    notification_types: Optional[List[str]] = None

class Doctor(BaseModel):
    id: str
    name: str
    specialty: str
    department: str
    is_active: bool
    email: str
    phone: str
    experience_years: int
    rating: float
    available_hours: str

class Notification(BaseModel):
    id: str
    title: str
    message: str
    type: str
    read: bool
    created_at: str
    priority: str

# FastAPI app instance
app = FastAPI(
    title="SMD Vital - User Service",
    description="Microservicio de gestión de usuarios para SMD Vital Bogotá",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ===== CONFIGURACIÓN CORS =====
# CORS deshabilitado en el servicio - Nginx se encarga de CORS
# Esto evita headers duplicados que causan errores CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3001"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

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

@app.get("/profile", response_model=UserProfile, tags=["User Profile"])
async def get_user_profile(user_id: str = None):
    """
    Obtener perfil completo del usuario
    
    - **user_id**: ID del usuario (requerido)
    """
    try:
        logger.info(f"Getting user profile for user_id: {user_id}")
        
        if not user_id:
            raise HTTPException(
                status_code=400, 
                detail="user_id es requerido"
            )
        
        # Obtener datos del usuario desde el servicio de autenticación
        auth_service_url = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")
        
        try:
            # Hacer petición al servicio de autenticación para obtener datos del usuario
            response = requests.get(f"{auth_service_url}/users/{user_id}", timeout=10)
            
            if response.status_code == 200:
                user_data = response.json()
                logger.info(f"User data retrieved from auth service: {user_data}")
                
                # Transformar datos para el perfil
                profile_data = UserProfile(
                    id=user_data.get("id", ""),
                    email=user_data.get("email", ""),
                    first_name=user_data.get("first_name", ""),
                    last_name=user_data.get("last_name", ""),
                    phone=user_data.get("phone", ""),
                    address=user_data.get("address", ""),
                    emergency_contact=user_data.get("emergency_contact", ""),
                    medical_conditions=user_data.get("medical_conditions", []),
                    role=user_data.get("role", "patient"),
                    is_active=user_data.get("is_active", True),
                    is_verified=user_data.get("is_verified", False),
                    created_at=user_data.get("created_at"),
                    updated_at=user_data.get("updated_at")
                )
                
                return profile_data
            else:
                logger.error(f"Error getting user from auth service: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail="No se pudo obtener datos del usuario desde el servicio de autenticación"
                )
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error connecting to auth service: {e}")
            raise HTTPException(
                status_code=503,
                detail="Error de conexión con el servicio de autenticación"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

@app.put("/profile", response_model=UserProfile, tags=["User Profile"])
async def update_user_profile(
    user_id: str,
    profile_update: UserProfileUpdate
):
    """
    Actualizar perfil del usuario
    
    - **user_id**: ID del usuario (requerido)
    - **profile_update**: Datos a actualizar
    """
    try:
        logger.info(f"Updating user profile for user_id: {user_id}")
        
        if not user_id:
            raise HTTPException(
                status_code=400,
                detail="user_id es requerido"
            )
        
        # Obtener datos actuales del usuario
        auth_service_url = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")
        
        try:
            # Obtener datos actuales
            get_response = requests.get(f"{auth_service_url}/users/{user_id}", timeout=10)
            
            if get_response.status_code == 200:
                current_data = get_response.json()
                
                # Actualizar solo los campos proporcionados
                update_data = profile_update.dict(exclude_unset=True)
                updated_data = {**current_data, **update_data}
                
                # Enviar actualización al servicio de autenticación
                update_response = requests.put(
                    f"{auth_service_url}/users/{user_id}",
                    json=updated_data,
                    timeout=10
                )
                
                if update_response.status_code == 200:
                    updated_user = update_response.json()
                    
                    # Retornar perfil actualizado
                    profile_data = UserProfile(
                        id=updated_user.get("id", ""),
                        email=updated_user.get("email", ""),
                        first_name=updated_user.get("first_name", ""),
                        last_name=updated_user.get("last_name", ""),
                        phone=updated_user.get("phone", ""),
                        address=updated_user.get("address", ""),
                        emergency_contact=updated_user.get("emergency_contact", ""),
                        medical_conditions=updated_user.get("medical_conditions", []),
                        role=updated_user.get("role", "patient"),
                        is_active=updated_user.get("is_active", True),
                        is_verified=updated_user.get("is_verified", False),
                        created_at=updated_user.get("created_at"),
                        updated_at=updated_user.get("updated_at")
                    )
                    
                    return profile_data
                else:
                    raise HTTPException(
                        status_code=update_response.status_code,
                        detail="Error al actualizar el perfil en el servicio de autenticación"
                    )
            else:
                raise HTTPException(
                    status_code=get_response.status_code,
                    detail="No se pudo obtener los datos actuales del usuario"
                )
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error connecting to auth service: {e}")
            raise HTTPException(
                status_code=503,
                detail="Error de conexión con el servicio de autenticación"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

@app.get("/notifications", response_model=List[Notification], tags=["Notifications"])
async def get_user_notifications(
    user_id: str,
    limit: int = 10, 
    offset: int = 0,
    status: Optional[str] = None
):
    """
    Obtener notificaciones del usuario
    
    - **user_id**: ID del usuario (requerido)
    - **limit**: Número de notificaciones a obtener (máximo 100)
    - **offset**: Número de notificaciones a omitir
    - **status**: Filtrar por estado (pending, sent, read, failed)
    """
    try:
        logger.info(f"Getting notifications for user_id: {user_id}")
        
        if not user_id:
            raise HTTPException(
                status_code=400,
                detail="user_id es requerido"
            )
        
        if limit > 100:
            limit = 100
        
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
        
        # Filtrar por estado si se proporciona
        if status:
            notifications = [n for n in notifications if n.get("status") == status]
        
        # Aplicar paginación
        paginated_notifications = notifications[offset:offset+limit]
        
        return paginated_notifications
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting notifications: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

@app.put("/notifications/settings", response_model=NotificationSettings, tags=["Notifications"])
async def update_notification_settings(
    user_id: str,
    settings: NotificationSettings
):
    """
    Actualizar configuración de notificaciones del usuario
    
    - **user_id**: ID del usuario (requerido)
    - **settings**: Configuración de notificaciones
    """
    try:
        logger.info(f"Updating notification settings for user_id: {user_id}")
        
        if not user_id:
            raise HTTPException(
                status_code=400,
                detail="user_id es requerido"
            )
        
        # Aquí se guardaría la configuración en la base de datos
        # Por ahora retornamos la configuración actualizada
        
        return settings
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating notification settings: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

@app.get("/notifications/settings", response_model=NotificationSettings, tags=["Notifications"])
async def get_notification_settings(user_id: str):
    """
    Obtener configuración de notificaciones del usuario
    
    - **user_id**: ID del usuario (requerido)
    """
    try:
        logger.info(f"Getting notification settings for user_id: {user_id}")
        
        if not user_id:
            raise HTTPException(
                status_code=400,
                detail="user_id es requerido"
            )
        
        # Retornar configuración por defecto
        return NotificationSettings()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting notification settings: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

@app.put("/notifications/{notification_id}/read", tags=["Notifications"])
async def mark_notification_read(
    notification_id: str,
    user_id: str
):
    """
    Marcar notificación como leída
    
    - **notification_id**: ID de la notificación
    - **user_id**: ID del usuario (requerido)
    """
    try:
        logger.info(f"Marking notification {notification_id} as read for user {user_id}")
        
        if not user_id:
            raise HTTPException(
                status_code=400,
                detail="user_id es requerido"
            )
        
        # Aquí se actualizaría el estado en la base de datos
        # Por ahora retornamos éxito
        
        return {
            "success": True,
            "message": "Notificación marcada como leída"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

# Doctors endpoints
@app.get("/doctors/search", response_model=List[Doctor], tags=["Doctors"])
async def search_doctors(
    specialty: Optional[str] = None,
    is_active: bool = True,
    limit: int = 20,
    offset: int = 0
):
    """
    Buscar doctores disponibles
    
    - **specialty**: Especialidad médica para filtrar
    - **is_active**: Filtrar solo doctores activos
    - **limit**: Número de resultados (máximo 50)
    - **offset**: Número de resultados a omitir
    """
    try:
        logger.info(f"Searching doctors with specialty: {specialty}, active: {is_active}")
        
        if limit > 50:
            limit = 50
        
        # Datos mock de doctores para demostración
        doctors_data = [
            {
                "id": "1",
                "name": "Dr. Juan Pérez",
                "specialty": "Medicina General",
                "department": "Medicina Interna",
                "is_active": True,
                "email": "juan.perez@smdvital.com",
                "phone": "+57 300 123 4567",
                "experience_years": 10,
                "rating": 4.8,
                "available_hours": "08:00-17:00"
            },
            {
                "id": "2", 
                "name": "Dra. María García",
                "specialty": "Cardiología",
                "department": "Cardiología",
                "is_active": True,
                "email": "maria.garcia@smdvital.com",
                "phone": "+57 300 234 5678",
                "experience_years": 15,
                "rating": 4.9,
                "available_hours": "09:00-18:00"
            },
            {
                "id": "3",
                "name": "Dr. Carlos López",
                "specialty": "Pediatría", 
                "department": "Pediatría",
                "is_active": True,
                "email": "carlos.lopez@smdvital.com",
                "phone": "+57 300 345 6789",
                "experience_years": 8,
                "rating": 4.7,
                "available_hours": "08:30-16:30"
            },
            {
                "id": "4",
                "name": "Dra. Ana Rodríguez",
                "specialty": "Ginecología",
                "department": "Ginecología",
                "is_active": True,
                "email": "ana.rodriguez@smdvital.com",
                "phone": "+57 300 456 7890",
                "experience_years": 12,
                "rating": 4.8,
                "available_hours": "09:00-17:00"
            },
            {
                "id": "5",
                "name": "Dr. Luis Martínez",
                "specialty": "Neurología",
                "department": "Neurología", 
                "is_active": True,
                "email": "luis.martinez@smdvital.com",
                "phone": "+57 300 567 8901",
                "experience_years": 20,
                "rating": 4.9,
                "available_hours": "08:00-16:00"
            },
            {
                "id": "6",
                "name": "Dra. Carmen Silva",
                "specialty": "Dermatología",
                "department": "Dermatología",
                "is_active": True,
                "email": "carmen.silva@smdvital.com",
                "phone": "+57 300 678 9012",
                "experience_years": 7,
                "rating": 4.6,
                "available_hours": "10:00-18:00"
            }
        ]
        
        # Filtrar por especialidad si se proporciona
        if specialty:
            doctors_data = [d for d in doctors_data if specialty.lower() in d["specialty"].lower()]
        
        # Filtrar por estado activo
        if is_active is not None:
            doctors_data = [d for d in doctors_data if d["is_active"] == is_active]
        
        # Aplicar paginación
        paginated_doctors = doctors_data[offset:offset+limit]
        
        # Convertir a modelos Pydantic
        doctors = [Doctor(**doctor) for doctor in paginated_doctors]
        
        return doctors
        
    except Exception as e:
        logger.error(f"Error searching doctors: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

@app.get("/doctors/{doctor_id}", response_model=Doctor, tags=["Doctors"])
async def get_doctor_details(doctor_id: str):
    """
    Obtener detalles de un doctor específico
    
    - **doctor_id**: ID del doctor
    """
    try:
        logger.info(f"Getting doctor details for doctor_id: {doctor_id}")
        
        if not doctor_id:
            raise HTTPException(
                status_code=400,
                detail="doctor_id es requerido"
            )
        
        # Datos mock - en producción se consultaría la base de datos
        doctor_data = {
            "id": doctor_id,
            "name": "Dr. Juan Pérez",
            "specialty": "Medicina General",
            "department": "Medicina Interna",
            "is_active": True,
            "email": "juan.perez@smdvital.com",
            "phone": "+57 300 123 4567",
            "experience_years": 10,
            "rating": 4.8,
            "available_hours": "08:00-17:00"
        }
        
        return Doctor(**doctor_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting doctor details: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    )