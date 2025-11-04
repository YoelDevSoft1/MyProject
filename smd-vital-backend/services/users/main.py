"""
SMD Vital - User Service
========================

Microservicio de gestión de usuarios para la plataforma SMD Vital.
"""

from fastapi import FastAPI, HTTPException, Depends, status, Query, Response
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from enum import Enum
import logging
import os
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
import requests
from patients_repository import repository as patient_repository

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
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ===== CONFIGURACIÓN CORS =====
# CORS habilitado para desarrollo local
# En producción, Nginx maneja CORS, pero en desarrollo necesitamos CORS directo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

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

@app.get("/users", tags=["Users"])
async def get_users():
    """
    Obtener lista de usuarios (endpoint básico para compatibilidad)
    """
    try:
        logger.info("Getting users list")
        
        # Por ahora retornamos una respuesta básica
        # En el futuro se puede implementar paginación y filtros
        return {
            "users": [],
            "total": 0,
            "message": "Users endpoint available - implement user listing logic here"
        }
        
    except Exception as e:
        logger.error(f"Error getting users: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno del servidor: {str(e)}"
        )

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
@app.get("/professionals", response_model=List[Doctor], tags=["Doctors"])
@app.get("/api/professionals", response_model=List[Doctor], tags=["Doctors"])  # Alias para compatibilidad
async def list_professionals(
    specialty: Optional[str] = None,
    is_active: bool = True,
    limit: int = 50
):
    """
    Listar todos los profesionales médicos (alias de doctors/search)
    
    - **specialty**: Especialidad médica para filtrar
    - **is_active**: Filtrar solo profesionales activos
    - **limit**: Número de resultados (máximo 100)
    """
    # Reutilizar la lógica de búsqueda de doctores
    return await search_doctors(specialty=specialty, is_active=is_active, limit=limit, offset=0)


@app.get("/doctors/search", response_model=List[Doctor], tags=["Doctors"])
@app.get("/api/doctors/search", response_model=List[Doctor], tags=["Doctors"])  # Alias para compatibilidad
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
@app.get("/api/doctors/{doctor_id}", response_model=Doctor, tags=["Doctors"])  # Alias para compatibilidad
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






class PatientStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    pending = "pending"


class PatientBase(BaseModel):
    patient_id: Optional[str] = Field(None, alias="patientId")
    name: str = Field(..., min_length=1)
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = Field("female")
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    blood_type: Optional[str] = Field(None, alias="bloodType")
    emergency_contact: Optional[str] = Field(None, alias="emergencyContact")
    insurance: Optional[str] = None
    allergies: Optional[str] = None
    status: Optional[PatientStatus] = Field(PatientStatus.active)
    last_visit: Optional[str] = Field(None, alias="lastVisit")
    next_appointment: Optional[str] = Field(None, alias="nextAppointment")

    class Config:
        allow_population_by_field_name = True
        anystr_strip_whitespace = True


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    age: Optional[int] = Field(None, ge=0, le=120)
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    blood_type: Optional[str] = Field(None, alias="bloodType")
    emergency_contact: Optional[str] = Field(None, alias="emergencyContact")
    insurance: Optional[str] = None
    allergies: Optional[str] = None
    status: Optional[PatientStatus] = None
    last_visit: Optional[str] = Field(None, alias="lastVisit")
    next_appointment: Optional[str] = Field(None, alias="nextAppointment")

    class Config:
        allow_population_by_field_name = True
        anystr_strip_whitespace = True


class PatientStats(BaseModel):
    total_patients: int = Field(..., alias="totalPatients")
    active_patients: int = Field(..., alias="activePatients")
    inactive_patients: int = Field(..., alias="inactivePatients")
    pending_patients: int = Field(..., alias="pendingPatients")
    average_age: int = Field(..., alias="averageAge")

    class Config:
        allow_population_by_field_name = True


class PatientResponse(PatientBase):
    id: str
    created_at: Optional[str] = Field(None, alias="createdAt")
    updated_at: Optional[str] = Field(None, alias="updatedAt")

    class Config:
        allow_population_by_field_name = True


class PatientListResponse(BaseModel):
    patients: List[PatientResponse]
    page: int
    limit: int
    total: int
    total_pages: int = Field(..., alias="totalPages")
    stats: PatientStats

    
def map_patient_record(data: Dict[str, Any]) -> PatientResponse:
    status_value = str(data.get("status", "active")).lower()
    try:
        status_enum = PatientStatus(status_value)
    except ValueError:
        status_enum = PatientStatus.active
    
    # Handle timestamp fields - check multiple possible field names from database
    created_at = (
        data.get("created_at") or 
        data.get("createdAt") or 
        data.get("created") or 
        datetime.utcnow().isoformat() + "Z"
    )
    updated_at = (
        data.get("updated_at") or 
        data.get("updatedAt") or 
        data.get("updated") or 
        datetime.utcnow().isoformat() + "Z"
    )

    return PatientResponse(
        id=data.get("id", ""),
        patient_id=data.get("patient_id"),
        name=data.get("name", ""),
        age=data.get("age"),
        gender=data.get("gender", ""),
        phone=data.get("phone", ""),
        email=data.get("email", ""),
        address=data.get("address", ""),
        blood_type=data.get("blood_type"),
        emergency_contact=data.get("emergency_contact"),
        insurance=data.get("insurance"),
        allergies=data.get("allergies"),
        status=status_enum,
        last_visit=data.get("last_visit"),
        next_appointment=data.get("next_appointment"),
        created_at=created_at,
        updated_at=updated_at,
    )


def map_patient_stats(data: Dict[str, Any]) -> PatientStats:
    return PatientStats.model_validate({
        "totalPatients": data.get("total_patients", 0),
        "activePatients": data.get("active_patients", 0),
        "inactivePatients": data.get("inactive_patients", 0),
        "pendingPatients": data.get("pending_patients", 0),
        "averageAge": data.get("average_age", 0),
    })

class Config:
        allow_population_by_field_name = True


# ===== PATIENT MANAGEMENT APIs =====

@app.get("/patients", response_model=PatientListResponse, tags=["Patients"])
async def list_patients(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Page size"),
    search: Optional[str] = Query(None, description="Search term"),
    status: Optional[PatientStatus] = Query(None, description="Filter by status"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
):
    result = await patient_repository.list_patients(
        search=search,
        status=status.value if status else None,
        gender=gender.lower().strip() if gender else None,
        page=page,
        limit=limit,
    )

    patients = [map_patient_record(item) for item in result["items"]]
    stats = map_patient_stats(result["stats"])

    return PatientListResponse.model_validate({
        "patients": patients,
        "page": result["page"],
        "limit": result["limit"],
        "total": result["total"],
        "totalPages": result["total_pages"],
        "stats": stats,
    })


@app.get("/patients/{patient_id}", response_model=PatientResponse, tags=["Patients"])
async def get_patient_detail(patient_id: str):
    patient = await patient_repository.get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return map_patient_record(patient)


@app.post(
    "/patients",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Patients"],
)
async def create_patient(payload: PatientCreate):
    data = await patient_repository.create_patient(payload.dict(by_alias=False, exclude_unset=True))
    return map_patient_record(data)


@app.put("/patients/{patient_id}", response_model=PatientResponse, tags=["Patients"])
async def update_patient(patient_id: str, payload: PatientUpdate):
    updated = await patient_repository.update_patient(
        patient_id,
        payload.dict(by_alias=False, exclude_unset=True),
    )
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return map_patient_record(updated)


@app.delete("/patients/{patient_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Patients"])
async def delete_patient(patient_id: str):
    deleted = await patient_repository.delete_patient(patient_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get(
    "/patients/export",
    response_class=PlainTextResponse,
    tags=["Patients"],
)
async def export_patients(
    search: Optional[str] = Query(None, description="Search term"),
    status: Optional[PatientStatus] = Query(None, description="Filter by status"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
):
    csv_content = await patient_repository.export_patients(
        search=search,
        status=status.value if status else None,
        gender=gender.lower().strip() if gender else None,
    )
    headers = {
        "Content-Disposition": "attachment; filename=patients.csv",
    }
    return PlainTextResponse(content=csv_content, media_type="text/csv", headers=headers)

# =============================================
# ADMIN ENDPOINTS
# =============================================

@app.get("/admin/users", response_model=List[Dict[str, Any]], tags=["Admin"])
async def get_admin_users(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None)
):
    """Obtener lista de usuarios para administración"""
    try:
        # Datos de ejemplo - en producción se consultaría la base de datos
        users_data = [
            {
                "id": "user_1",
                "email": "admin@smdvital.com",
                "name": "Administrador",
                "role": "admin",
                "status": "active",
                "created_at": "2024-01-15T10:00:00Z",
                "last_login": "2024-01-20T14:30:00Z"
            },
            {
                "id": "user_2",
                "email": "doctor@smdvital.com",
                "name": "Dr. Juan Pérez",
                "role": "doctor",
                "status": "active",
                "created_at": "2024-01-16T09:00:00Z",
                "last_login": "2024-01-20T16:45:00Z"
            },
            {
                "id": "user_3",
                "email": "patient@smdvital.com",
                "name": "María García",
                "role": "patient",
                "status": "active",
                "created_at": "2024-01-17T11:30:00Z",
                "last_login": "2024-01-19T10:15:00Z"
            }
        ]
        
        # Aplicar filtros
        if search:
            users_data = [u for u in users_data if search.lower() in u["name"].lower() or search.lower() in u["email"].lower()]
        
        if role:
            users_data = [u for u in users_data if u["role"] == role]
        
        # Aplicar paginación
        start = offset
        end = offset + limit
        paginated_users = users_data[start:end]
        
        return paginated_users
        
    except Exception as e:
        logger.error(f"Error getting admin users: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/roles", response_model=List[Dict[str, Any]], tags=["Admin"])
async def get_admin_roles():
    """Obtener lista de roles del sistema"""
    try:
        roles_data = [
            {
                "id": "admin",
                "name": "Administrador",
                "description": "Acceso completo al sistema",
                "permissions": ["read", "write", "delete", "admin"],
                "user_count": 1
            },
            {
                "id": "doctor",
                "name": "Doctor",
                "description": "Acceso a pacientes y citas médicas",
                "permissions": ["read", "write"],
                "user_count": 15
            },
            {
                "id": "patient",
                "name": "Paciente",
                "description": "Acceso a su información personal",
                "permissions": ["read"],
                "user_count": 150
            },
            {
                "id": "nurse",
                "name": "Enfermera",
                "description": "Acceso a pacientes y citas",
                "permissions": ["read", "write"],
                "user_count": 8
            }
        ]
        
        return roles_data
        
    except Exception as e:
        logger.error(f"Error getting admin roles: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/system-stats", response_model=Dict[str, Any], tags=["Admin"])
async def get_system_stats():
    """Obtener estadísticas del sistema"""
    try:
        stats_data = {
            "users": {
                "total": 174,
                "active": 168,
                "inactive": 6,
                "by_role": {
                    "admin": 1,
                    "doctor": 15,
                    "patient": 150,
                    "nurse": 8
                }
            },
            "appointments": {
                "total": 1250,
                "today": 25,
                "this_week": 180,
                "this_month": 750
            },
            "medical_records": {
                "total": 3200,
                "this_month": 450
            },
            "system": {
                "uptime": "15 days, 8 hours",
                "version": "1.0.0",
                "last_backup": "2024-01-20T02:00:00Z"
            }
        }
        
        return stats_data
        
    except Exception as e:
        logger.error(f"Error getting system stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/audit-logs", response_model=List[Dict[str, Any]], tags=["Admin"])
async def get_audit_logs(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None)
):
    """Obtener logs de auditoría del sistema"""
    try:
        # Datos de ejemplo - en producción se consultaría la base de datos
        logs_data = [
            {
                "id": "log_1",
                "user_id": "user_1",
                "user_name": "Administrador",
                "action": "login",
                "resource": "auth",
                "ip_address": "192.168.1.100",
                "timestamp": "2024-01-20T14:30:00Z",
                "status": "success"
            },
            {
                "id": "log_2",
                "user_id": "user_2",
                "user_name": "Dr. Juan Pérez",
                "action": "create",
                "resource": "appointment",
                "ip_address": "192.168.1.101",
                "timestamp": "2024-01-20T14:25:00Z",
                "status": "success"
            },
            {
                "id": "log_3",
                "user_id": "user_3",
                "user_name": "María García",
                "action": "update",
                "resource": "profile",
                "ip_address": "192.168.1.102",
                "timestamp": "2024-01-20T14:20:00Z",
                "status": "success"
            }
        ]
        
        # Aplicar filtros
        if user_id:
            logs_data = [l for l in logs_data if l["user_id"] == user_id]
        
        if action:
            logs_data = [l for l in logs_data if l["action"] == action]
        
        # Aplicar paginación
        start = offset
        end = offset + limit
        paginated_logs = logs_data[start:end]
        
        return paginated_logs
        
    except Exception as e:
        logger.error(f"Error getting audit logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================
# ANALYTICS ENDPOINTS
# =============================================

@app.get("/analytics/medical-kpis", response_model=Dict[str, Any], tags=["Analytics"])
async def get_medical_kpis(
    period: str = Query("month", description="Period: day, week, month, year"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Obtener KPIs médicos para analytics"""
    try:
        kpis_data = {
            "period": period,
            "date_range": {
                "start": start_date or "2024-01-01",
                "end": end_date or "2024-01-31"
            },
            "patient_metrics": {
                "total_patients": 1250,
                "new_patients": 45,
                "active_patients": 1180,
                "patient_satisfaction": 4.7
            },
            "appointment_metrics": {
                "total_appointments": 3200,
                "completed_appointments": 3100,
                "cancelled_appointments": 85,
                "no_show_rate": 0.05,
                "average_duration": 30
            },
            "medical_metrics": {
                "total_consultations": 2800,
                "diagnoses_made": 2100,
                "prescriptions_issued": 1800,
                "follow_up_rate": 0.85
            },
            "revenue_metrics": {
                "total_revenue": 125000,
                "average_consultation_fee": 45,
                "collection_rate": 0.95,
                "outstanding_amount": 6250
            },
            "performance_metrics": {
                "average_wait_time": 15,
                "doctor_utilization": 0.78,
                "room_occupancy": 0.82,
                "patient_flow_efficiency": 0.88
            }
        }
        
        return kpis_data
        
    except Exception as e:
        logger.error(f"Error getting medical KPIs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/data-tables/medical-data", response_model=List[Dict[str, Any]], tags=["Data Tables"])
async def get_medical_data(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None)
):
    """Obtener datos médicos para tablas de datos"""
    try:
        # Datos de ejemplo - en producción se consultaría la base de datos
        medical_data = [
            {
                "id": "record_1",
                "patient_id": "patient_123",
                "patient_name": "María García",
                "doctor_id": "doctor_456",
                "doctor_name": "Dr. Juan Pérez",
                "category": "consultation",
                "diagnosis": "Hipertensión arterial",
                "treatment": "Medicación antihipertensiva",
                "date": "2024-01-20T10:30:00Z",
                "status": "completed",
                "priority": "medium",
                "notes": "Paciente estable, seguir tratamiento"
            },
            {
                "id": "record_2",
                "patient_id": "patient_124",
                "patient_name": "Carlos López",
                "doctor_id": "doctor_457",
                "doctor_name": "Dr. Ana Martínez",
                "category": "follow_up",
                "diagnosis": "Diabetes tipo 2",
                "treatment": "Control de glucosa",
                "date": "2024-01-19T14:15:00Z",
                "status": "scheduled",
                "priority": "high",
                "notes": "Revisar niveles de glucosa"
            },
            {
                "id": "record_3",
                "patient_id": "patient_125",
                "patient_name": "Laura Rodríguez",
                "doctor_id": "doctor_458",
                "doctor_name": "Dr. Miguel Torres",
                "category": "emergency",
                "diagnosis": "Fractura de brazo",
                "treatment": "Inmovilización y analgésicos",
                "date": "2024-01-18T16:45:00Z",
                "status": "completed",
                "priority": "urgent",
                "notes": "Fractura simple, recuperación esperada en 6 semanas"
            }
        ]
        
        # Aplicar filtros
        if search:
            medical_data = [r for r in medical_data if 
                          search.lower() in r["patient_name"].lower() or 
                          search.lower() in r["doctor_name"].lower() or
                          search.lower() in r["diagnosis"].lower()]
        
        if category:
            medical_data = [r for r in medical_data if r["category"] == category]
        
        # Aplicar paginación
        start = offset
        end = offset + limit
        paginated_data = medical_data[start:end]
        
        return paginated_data
        
    except Exception as e:
        logger.error(f"Error getting medical data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/config", response_model=Dict[str, Any], tags=["Dashboard"])
async def get_dashboard_config(
    user_id: Optional[str] = Query(None),
    role: Optional[str] = Query(None)
):
    """Obtener configuración del dashboard"""
    try:
        config_data = {
            "user_id": user_id or "default",
            "role": role or "user",
            "widgets": {
                "enabled": [
                    "patient_overview",
                    "appointment_calendar",
                    "revenue_chart",
                    "medical_kpis",
                    "recent_activities",
                    "system_alerts"
                ],
                "layout": {
                    "columns": 3,
                    "rows": 4,
                    "grid": [
                        {"widget": "patient_overview", "position": {"x": 0, "y": 0, "w": 1, "h": 2}},
                        {"widget": "appointment_calendar", "position": {"x": 1, "y": 0, "w": 2, "h": 2}},
                        {"widget": "revenue_chart", "position": {"x": 0, "y": 2, "w": 2, "h": 2}},
                        {"widget": "medical_kpis", "position": {"x": 2, "y": 2, "w": 1, "h": 2}}
                    ]
                }
            },
            "preferences": {
                "theme": "light",
                "language": "es",
                "timezone": "America/Mexico_City",
                "date_format": "DD/MM/YYYY",
                "time_format": "24h"
            },
            "permissions": {
                "can_edit_widgets": True,
                "can_export_data": True,
                "can_view_analytics": True,
                "can_manage_users": role == "admin"
            },
            "notifications": {
                "email_enabled": True,
                "push_enabled": True,
                "sms_enabled": False,
                "frequency": "immediate"
            }
        }
        
        return config_data
        
    except Exception as e:
        logger.error(f"Error getting dashboard config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================
# PROFILE ENDPOINTS
# =============================================

@app.get("/profile/medical", response_model=Dict[str, Any], tags=["Profile"])
async def get_profile_medical(
    user_id: str = Query("default-user", description="User ID")
):
    """Obtener información médica del perfil del usuario"""
    try:
        medical_data = {
            "user_id": user_id,
            "medical_info": {
                "blood_type": "O+",
                "allergies": ["Penicilina", "Polen"],
                "chronic_conditions": ["Hipertensión"],
                "medications": ["Losartán 50mg", "Metformina 500mg"],
                "emergency_contact": {
                    "name": "María García",
                    "relationship": "Esposa",
                    "phone": "+52-555-123-4567"
                },
                "insurance": {
                    "provider": "Seguro Popular",
                    "policy_number": "SP-2024-001234",
                    "expiry_date": "2024-12-31"
                }
            },
            "last_updated": "2024-01-20T10:30:00Z"
        }
        
        return medical_data
        
    except Exception as e:
        logger.error(f"Error getting profile medical: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/profile/activity-history", response_model=List[Dict[str, Any]], tags=["Profile"])
async def get_activity_history(
    user_id: str = Query("default-user", description="User ID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Obtener historial de actividad del usuario"""
    try:
        activity_data = [
            {
                "id": "activity_1",
                "user_id": user_id,
                "action": "login",
                "description": "Inicio de sesión exitoso",
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "timestamp": "2024-01-20T14:30:00Z",
                "status": "success"
            },
            {
                "id": "activity_2",
                "user_id": user_id,
                "action": "profile_update",
                "description": "Actualización de perfil médico",
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "timestamp": "2024-01-19T16:45:00Z",
                "status": "success"
            },
            {
                "id": "activity_3",
                "user_id": user_id,
                "action": "appointment_booking",
                "description": "Reserva de cita médica",
                "ip_address": "192.168.1.101",
                "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
                "timestamp": "2024-01-18T09:15:00Z",
                "status": "success"
            }
        ]
        
        # Aplicar paginación
        start = offset
        end = offset + limit
        paginated_activity = activity_data[start:end]
        
        return paginated_activity
        
    except Exception as e:
        logger.error(f"Error getting activity history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/profile/security-logs", response_model=List[Dict[str, Any]], tags=["Profile"])
async def get_security_logs(
    user_id: str = Query("default-user", description="User ID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Obtener logs de seguridad del usuario"""
    try:
        security_data = [
            {
                "id": "security_1",
                "user_id": user_id,
                "event_type": "login_success",
                "description": "Inicio de sesión exitoso",
                "ip_address": "192.168.1.100",
                "location": "Ciudad de México, México",
                "timestamp": "2024-01-20T14:30:00Z",
                "risk_level": "low"
            },
            {
                "id": "security_2",
                "user_id": user_id,
                "event_type": "password_change",
                "description": "Cambio de contraseña",
                "ip_address": "192.168.1.100",
                "location": "Ciudad de México, México",
                "timestamp": "2024-01-15T10:20:00Z",
                "risk_level": "medium"
            },
            {
                "id": "security_3",
                "user_id": user_id,
                "event_type": "failed_login",
                "description": "Intento de inicio de sesión fallido",
                "ip_address": "192.168.1.200",
                "location": "Guadalajara, México",
                "timestamp": "2024-01-10T08:45:00Z",
                "risk_level": "high"
            }
        ]
        
        # Aplicar paginación
        start = offset
        end = offset + limit
        paginated_security = security_data[start:end]
        
        return paginated_security
        
    except Exception as e:
        logger.error(f"Error getting security logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/profile/preferences", response_model=Dict[str, Any], tags=["Profile"])
async def get_profile_preferences(
    user_id: str = Query("default-user", description="User ID")
):
    """Obtener preferencias del perfil del usuario"""
    try:
        preferences_data = {
            "user_id": user_id,
            "general": {
                "language": "es",
                "timezone": "America/Mexico_City",
                "date_format": "DD/MM/YYYY",
                "time_format": "24h",
                "theme": "light"
            },
            "notifications": {
                "email": True,
                "push": True,
                "sms": False,
                "appointment_reminders": True,
                "medication_reminders": True,
                "health_tips": True,
                "marketing": False
            },
            "privacy": {
                "profile_visibility": "private",
                "share_medical_data": False,
                "allow_analytics": True,
                "data_retention": "5_years"
            },
            "accessibility": {
                "high_contrast": False,
                "large_text": False,
                "screen_reader": False,
                "keyboard_navigation": True
            }
        }
        
        return preferences_data
        
    except Exception as e:
        logger.error(f"Error getting profile preferences: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/profile/notifications", response_model=List[Dict[str, Any]], tags=["Profile"])
async def get_profile_notifications(
    user_id: str = Query("default-user", description="User ID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Obtener notificaciones del perfil del usuario"""
    try:
        notifications_data = [
            {
                "id": "notif_1",
                "user_id": user_id,
                "type": "appointment_reminder",
                "title": "Recordatorio de cita",
                "message": "Tienes una cita médica mañana a las 10:00 AM",
                "timestamp": "2024-01-20T18:00:00Z",
                "read": False,
                "priority": "medium"
            },
            {
                "id": "notif_2",
                "user_id": user_id,
                "type": "medication_reminder",
                "title": "Recordatorio de medicamento",
                "message": "Es hora de tomar tu medicamento para la hipertensión",
                "timestamp": "2024-01-20T08:00:00Z",
                "read": True,
                "priority": "high"
            },
            {
                "id": "notif_3",
                "user_id": user_id,
                "type": "system_update",
                "title": "Actualización del sistema",
                "message": "Nuevas funciones disponibles en tu perfil médico",
                "timestamp": "2024-01-19T14:30:00Z",
                "read": False,
                "priority": "low"
            }
        ]
        
        # Aplicar paginación
        start = offset
        end = offset + limit
        paginated_notifications = notifications_data[start:end]
        
        return paginated_notifications
        
    except Exception as e:
        logger.error(f"Error getting profile notifications: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/profile/permissions", response_model=Dict[str, Any], tags=["Profile"])
async def get_profile_permissions(
    user_id: str = Query("default-user", description="User ID")
):
    """Obtener permisos del perfil del usuario"""
    try:
        permissions_data = {
            "user_id": user_id,
            "role": "patient",
            "permissions": {
                "medical_records": {
                    "view_own": True,
                    "edit_own": True,
                    "view_others": False,
                    "edit_others": False
                },
                "appointments": {
                    "book": True,
                    "cancel": True,
                    "reschedule": True,
                    "view_others": False
                },
                "notifications": {
                    "receive": True,
                    "configure": True,
                    "send": False
                },
                "profile": {
                    "view_own": True,
                    "edit_own": True,
                    "view_others": False,
                    "edit_others": False
                },
                "analytics": {
                    "view_own": True,
                    "view_system": False,
                    "export": True
                }
            },
            "restrictions": [
                "No puede acceder a datos de otros pacientes",
                "No puede modificar configuraciones del sistema",
                "No puede exportar datos de otros usuarios"
            ],
            "last_updated": "2024-01-15T10:00:00Z"
        }
        
        return permissions_data
        
    except Exception as e:
        logger.error(f"Error getting profile permissions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/profile/devices", response_model=List[Dict[str, Any]], tags=["Profile"])
async def get_profile_devices(
    user_id: str = Query("default-user", description="User ID")
):
    """Obtener dispositivos asociados al perfil del usuario"""
    try:
        devices_data = [
            {
                "id": "device_1",
                "user_id": user_id,
                "device_name": "iPhone 13 Pro",
                "device_type": "mobile",
                "os": "iOS 15.0",
                "browser": "Safari",
                "last_seen": "2024-01-20T14:30:00Z",
                "location": "Ciudad de México, México",
                "is_active": True,
                "trusted": True
            },
            {
                "id": "device_2",
                "user_id": user_id,
                "device_name": "MacBook Pro",
                "device_type": "desktop",
                "os": "macOS 12.0",
                "browser": "Chrome",
                "last_seen": "2024-01-19T16:45:00Z",
                "location": "Ciudad de México, México",
                "is_active": True,
                "trusted": True
            },
            {
                "id": "device_3",
                "user_id": user_id,
                "device_name": "Android Phone",
                "device_type": "mobile",
                "os": "Android 11",
                "browser": "Chrome Mobile",
                "last_seen": "2024-01-10T08:20:00Z",
                "location": "Guadalajara, México",
                "is_active": False,
                "trusted": False
            }
        ]
        
        return devices_data
        
    except Exception as e:
        logger.error(f"Error getting profile devices: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/profile/sessions", response_model=List[Dict[str, Any]], tags=["Profile"])
async def get_profile_sessions(
    user_id: str = Query("default-user", description="User ID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Obtener sesiones activas del perfil del usuario"""
    try:
        sessions_data = [
            {
                "id": "session_1",
                "user_id": user_id,
                "device_name": "iPhone 13 Pro",
                "ip_address": "192.168.1.100",
                "location": "Ciudad de México, México",
                "login_time": "2024-01-20T14:30:00Z",
                "last_activity": "2024-01-20T16:45:00Z",
                "is_active": True,
                "expires_at": "2024-01-21T14:30:00Z"
            },
            {
                "id": "session_2",
                "user_id": user_id,
                "device_name": "MacBook Pro",
                "ip_address": "192.168.1.101",
                "location": "Ciudad de México, México",
                "login_time": "2024-01-19T09:15:00Z",
                "last_activity": "2024-01-19T17:30:00Z",
                "is_active": False,
                "expires_at": "2024-01-20T09:15:00Z"
            }
        ]
        
        # Aplicar paginación
        start = offset
        end = offset + limit
        paginated_sessions = sessions_data[start:end]
        
        return paginated_sessions
        
    except Exception as e:
        logger.error(f"Error getting profile sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

