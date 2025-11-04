"""
SMD Vital - Appointment Service
===============================

Microservicio de gestión de citas médicas para la plataforma SMD Vital.
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import logging
import os
from typing import Optional, List, Dict, Any
import uuid
from contextlib import asynccontextmanager

# Importar función de autenticación (simulada por ahora)
def get_current_user():
    """Función temporal de autenticación - en producción debería validar el JWT"""
    # Por ahora retornamos un usuario de prueba
    return {
        "id": "a87e330d-54d4-4b26-84cf-97fd75703e1d",
        "email": "yoeldevsoft@gmail.com",
        "role": "patient"
    }

from appointment_models import (
    AppointmentCreate, 
    AppointmentUpdate, 
    AppointmentResponse, 
    AppointmentListResponse,
    AppointmentStatsResponse
)
from database_sqlalchemy import db
from reservation_service import AppointmentReservationService
import redis

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Inicializar servicios
reservation_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manejar eventos de inicio y cierre de la aplicación"""
    global reservation_service
    
    # Startup
    await db.init_engine()
    
    # Inicializar Redis para reservas temporales
    redis_client = redis.Redis(
        host='redis', 
        port=6379, 
        db=0, 
        password='redis_password_2024',
        decode_responses=True
    )
    reservation_service = AppointmentReservationService(db, redis_client)
    
    logger.info("Appointment service initialized successfully")
    
    yield
    
    # Shutdown
    await db.close_engine()
    logger.info("Database engine closed")

# FastAPI app instance
app = FastAPI(
    title="SMD Vital - Appointment Service",
    description="Microservicio de gestión de citas médicas para SMD Vital Bogotá",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# ===== CONFIGURACIÓN CORS =====
# CORS habilitado para desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
)

# Health Check
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "appointment-service",
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
        "message": "SMD Vital Appointment Service",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/info", tags=["Info"])
async def service_info():
    """Service information"""
    return {
        "service": "appointment-service",
        "description": "Medical appointment scheduling and management service",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "info": "/info",
            "appointments": "/appointments",
            "stats": "/appointments/stats"
        },
        "database": "smdvital_appointments",
        "port": 8003
    }

# ===== APPOINTMENT ENDPOINTS =====

@app.get("/appointments", response_model=AppointmentListResponse, tags=["Appointments"])
async def get_appointments(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=1000, description="Número de registros a devolver"),
    patient_id: Optional[uuid.UUID] = Query(None, description="Filtrar por ID de paciente"),
    professional_id: Optional[uuid.UUID] = Query(None, description="Filtrar por ID de profesional"),
    status: Optional[str] = Query(None, description="Filtrar por estado"),
    appointment_type: Optional[str] = Query(None, description="Filtrar por tipo de cita"),
    start_date: Optional[datetime] = Query(None, description="Fecha de inicio"),
    end_date: Optional[datetime] = Query(None, description="Fecha de fin")
):
    """Obtener lista de citas médicas con filtros opcionales"""
    try:
        result = await db.get_appointments(
            skip=skip,
            limit=limit,
            patient_id=patient_id,
            professional_id=professional_id,
            status=status,
            appointment_type=appointment_type,
            start_date=start_date,
            end_date=end_date
        )
        
        appointments = [AppointmentResponse(**apt) for apt in result["appointments"]]
        
        return AppointmentListResponse(
            appointments=appointments,
            total=result["total"],
            page=result["page"],
            size=result["size"],
            has_next=result["has_next"],
            has_prev=result["has_prev"]
        )
    except Exception as e:
        logger.error(f"Error getting appointments: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/appointments/stats", response_model=AppointmentStatsResponse, tags=["Appointments"])
async def get_appointment_stats():
    """Obtener estadísticas de citas médicas"""
    try:
        stats = await db.get_appointment_stats()
        return AppointmentStatsResponse(**stats)
    except Exception as e:
        logger.error(f"Error getting appointment stats: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/appointments/availability", tags=["Availability"])
async def get_available_slots(
    doctor_id: uuid.UUID = Query(..., description="ID del doctor"),
    date: str = Query(..., description="Fecha en formato YYYY-MM-DD")
):
    """Obtener horarios disponibles de un doctor para una fecha específica"""
    try:
        # Convertir fecha string a datetime
        target_date = datetime.fromisoformat(date)
        
        # Obtener citas existentes para esa fecha
        existing_appointments = await db.get_appointments(
            professional_id=doctor_id,
            start_date=target_date,
            end_date=target_date.replace(hour=23, minute=59, second=59)
        )
        
        # Generar slots disponibles (ejemplo: cada 30 minutos de 8:00 a 18:00)
        available_slots = []
        start_hour = 8
        end_hour = 18
        slot_duration = 30  # minutos
        
        for hour in range(start_hour, end_hour):
            for minute in range(0, 60, slot_duration):
                slot_time = target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                
                # Verificar si el slot está disponible
                is_available = not any(
                    apt["scheduled_date"] == slot_time.isoformat() 
                    for apt in existing_appointments.get("appointments", [])
                )
                
                if is_available:
                    available_slots.append({
                        "datetime": slot_time.isoformat(),
                        "time": slot_time.strftime("%H:%M"),
                        "available": True
                    })
        
        return {
            "doctor_id": str(doctor_id),
            "date": date,
            "slots": available_slots,
            "total_slots": len(available_slots)
        }
        
    except Exception as e:
        logger.error(f"Error getting available slots: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/appointments/{appointment_id}", response_model=AppointmentResponse, tags=["Appointments"])
async def get_appointment(appointment_id: uuid.UUID):
    """Obtener cita médica por ID"""
    try:
        appointment = await db.get_appointment_by_id(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Cita no encontrada")
        
        return AppointmentResponse(**appointment)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting appointment {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.post("/appointments", response_model=AppointmentResponse, tags=["Appointments"])
async def create_appointment(appointment: AppointmentCreate):
    """Crear nueva cita médica"""
    try:
        appointment_data = appointment.dict()
        created_appointment = await db.create_appointment(appointment_data)
        
        return AppointmentResponse(**created_appointment)
    except Exception as e:
        logger.error(f"Error creating appointment: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.put("/appointments/{appointment_id}", response_model=AppointmentResponse, tags=["Appointments"])
async def update_appointment(appointment_id: uuid.UUID, appointment_update: AppointmentUpdate):
    """Actualizar cita médica"""
    try:
        update_data = appointment_update.dict(exclude_unset=True)
        updated_appointment = await db.update_appointment(appointment_id, update_data)
        
        if not updated_appointment:
            raise HTTPException(status_code=404, detail="Cita no encontrada")
        
        return AppointmentResponse(**updated_appointment)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating appointment {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.delete("/appointments/{appointment_id}", tags=["Appointments"])
async def delete_appointment(appointment_id: uuid.UUID):
    """Eliminar cita médica"""
    try:
        success = await db.delete_appointment(appointment_id)
        if not success:
            raise HTTPException(status_code=404, detail="Cita no encontrada")
        
        return {"message": "Cita eliminada exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting appointment {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# ===== RESERVATION ENDPOINTS =====

@app.post("/appointments/reserve", tags=["Reservations"])
async def create_temporary_reservation(reservation_data: dict, current_user: dict = Depends(get_current_user)):
    """Crear reserva temporal de horario"""
    try:
        if not reservation_service:
            raise HTTPException(status_code=500, detail="Servicio de reservas no disponible")
        
        # Usar el patient_id del usuario autenticado
        patient_id = current_user.get("id")
        if not patient_id:
            raise HTTPException(status_code=400, detail="ID de paciente no encontrado")
        
        result = await reservation_service.create_temporary_reservation(
            doctor_id=reservation_data.get("doctor_id"),
            slot_datetime=datetime.fromisoformat(reservation_data.get("slot_datetime")),
            patient_id=patient_id,  # Usar el ID del usuario autenticado
            medical_service_id=reservation_data.get("medical_service_id"),
            appointment_type=reservation_data.get("appointment_type", "CONSULTATION")
        )
        
        logger.info(f"🔍 [CreateReservation] Resultado del servicio: {result}")
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        logger.info(f"🔍 [CreateReservation] Retornando: {result}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating temporary reservation: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.post("/appointments/confirm", tags=["Reservations"])
async def confirm_reservation(confirmation_data: dict, current_user: dict = Depends(get_current_user)):
    """Confirmar reserva temporal y crear cita definitiva"""
    try:
        logger.info(f"🔍 [ConfirmReservation] Datos recibidos: {confirmation_data}")
        logger.info(f"🔍 [ConfirmReservation] Usuario actual: {current_user}")
        
        if not reservation_service:
            raise HTTPException(status_code=500, detail="Servicio de reservas no disponible")
        
        # Usar el patient_id del usuario autenticado
        patient_id = current_user.get("id")
        if not patient_id:
            logger.error("❌ [ConfirmReservation] ID de paciente no encontrado en current_user")
            raise HTTPException(status_code=400, detail="ID de paciente no encontrado")
        
        reservation_id = confirmation_data.get("reservation_id")
        patient_data = confirmation_data.get("patient_data", {})
        
        logger.info(f"🔍 [ConfirmReservation] Reservation ID: {reservation_id}")
        logger.info(f"🔍 [ConfirmReservation] Patient data: {patient_data}")
        
        result = await reservation_service.confirm_reservation(
            reservation_id=reservation_id,
            patient_data=patient_data
        )
        
        logger.info(f"🔍 [ConfirmReservation] Resultado: {result}")
        
        if not result["success"]:
            logger.error(f"❌ [ConfirmReservation] Error en confirmación: {result['error']}")
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error confirming reservation: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.delete("/appointments/reserve/{reservation_id}", tags=["Reservations"])
async def cancel_reservation(reservation_id: str):
    """Cancelar reserva temporal"""
    try:
        if not reservation_service:
            raise HTTPException(status_code=500, detail="Servicio de reservas no disponible")
        
        result = await reservation_service.cancel_reservation(reservation_id)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling reservation: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/appointments/reserve/{reservation_id}/status", tags=["Reservations"])
async def get_reservation_status(reservation_id: str):
    """Obtener estado de una reserva temporal"""
    try:
        if not reservation_service:
            raise HTTPException(status_code=500, detail="Servicio de reservas no disponible")
        
        result = await reservation_service.get_reservation_status(reservation_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting reservation status: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.post("/appointments/validate-slot", tags=["Availability"])
async def validate_slot_availability(validation_data: dict):
    """Validar disponibilidad de un slot específico"""
    try:
        doctor_id = validation_data.get("doctor_id")
        slot_datetime = datetime.fromisoformat(validation_data.get("slot_datetime"))
        
        # Verificar si hay citas en ese horario
        existing_appointments = await db.get_appointments(
            professional_id=doctor_id,
            start_date=slot_datetime,
            end_date=slot_datetime
        )
        
        is_available = len(existing_appointments.get("appointments", [])) == 0
        
        return {
            "available": is_available,
            "doctor_id": doctor_id,
            "slot_datetime": slot_datetime.isoformat(),
            "message": "Slot disponible" if is_available else "Slot no disponible"
        }
        
    except Exception as e:
        logger.error(f"Error validating slot availability: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/medical-services", response_model=List[Dict[str, Any]], tags=["Medical Services"])
async def get_medical_services(
    category: Optional[str] = None,
    specialty: Optional[str] = None,
    is_active: bool = True,
    limit: int = 50
):
    """Obtener lista de servicios médicos disponibles"""
    try:
        # Datos de ejemplo - en producción se consultaría la base de datos
        medical_services_data = [
            {
                "id": "ms_1",
                "name": "Consulta General",
                "code": "CONS_GEN",
                "description": "Consulta médica general de medicina interna",
                "category": "Medicina General",
                "specialty": "Medicina Interna",
                "department": "Consultorios Externos",
                "default_duration_minutes": 30,
                "preparation_time_minutes": 5,
                "cleanup_time_minutes": 5,
                "is_active": True,
                "requires_referral": False,
                "is_emergency_service": False,
                "telemedicine_available": True,
                "base_price": 50000.00,
                "insurance_price": 25000.00,
                "emergency_surcharge": 10000.00,
                "age_restrictions": None,
                "gender_restrictions": None,
                "special_requirements": None,
                "instructions": "Ayuno de 8 horas recomendado",
                "contraindications": "Pacientes con alergias conocidas",
                "equipment_needed": ["Estetoscopio", "Tensiómetro", "Termómetro"],
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:00:00Z"
            },
            {
                "id": "ms_2",
                "name": "Consulta Cardiológica",
                "code": "CONS_CARD",
                "description": "Consulta especializada en cardiología",
                "category": "Especialidades",
                "specialty": "Cardiología",
                "department": "Cardiología",
                "default_duration_minutes": 45,
                "preparation_time_minutes": 10,
                "cleanup_time_minutes": 10,
                "is_active": True,
                "requires_referral": True,
                "is_emergency_service": False,
                "telemedicine_available": False,
                "base_price": 80000.00,
                "insurance_price": 40000.00,
                "emergency_surcharge": 15000.00,
                "age_restrictions": {"min_age": 18},
                "gender_restrictions": None,
                "special_requirements": "Electrocardiograma previo",
                "instructions": "Ayuno de 12 horas, no tomar medicamentos cardíacos",
                "contraindications": "Pacientes con marcapasos",
                "equipment_needed": ["Electrocardiógrafo", "Estetoscopio", "Tensiómetro"],
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:00:00Z"
            },
            {
                "id": "ms_3",
                "name": "Consulta Pediátrica",
                "code": "CONS_PED",
                "description": "Consulta médica especializada en pediatría",
                "category": "Especialidades",
                "specialty": "Pediatría",
                "department": "Pediatría",
                "default_duration_minutes": 40,
                "preparation_time_minutes": 5,
                "cleanup_time_minutes": 5,
                "is_active": True,
                "requires_referral": False,
                "is_emergency_service": False,
                "telemedicine_available": True,
                "base_price": 60000.00,
                "insurance_price": 30000.00,
                "emergency_surcharge": 12000.00,
                "age_restrictions": {"max_age": 18},
                "gender_restrictions": None,
                "special_requirements": "Acompañante mayor de edad",
                "instructions": "Traer carné de vacunación",
                "contraindications": "Pacientes con fiebre alta",
                "equipment_needed": ["Estetoscopio pediátrico", "Termómetro", "Balanza"],
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:00:00Z"
            },
            {
                "id": "ms_4",
                "name": "Emergencia Médica",
                "code": "EMERG_MED",
                "description": "Atención médica de emergencia 24/7",
                "category": "Emergencias",
                "specialty": "Medicina de Emergencias",
                "department": "Urgencias",
                "default_duration_minutes": 60,
                "preparation_time_minutes": 0,
                "cleanup_time_minutes": 5,
                "is_active": True,
                "requires_referral": False,
                "is_emergency_service": True,
                "telemedicine_available": False,
                "base_price": 120000.00,
                "insurance_price": 60000.00,
                "emergency_surcharge": 0.00,
                "age_restrictions": None,
                "gender_restrictions": None,
                "special_requirements": None,
                "instructions": "Atención inmediata sin cita previa",
                "contraindications": None,
                "equipment_needed": ["Monitor cardíaco", "Desfibrilador", "Oxígeno"],
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:00:00Z"
            }
        ]
        
        # Filtrar por parámetros
        filtered_services = medical_services_data
        
        if category:
            filtered_services = [s for s in filtered_services if s["category"].lower() == category.lower()]
        
        if specialty:
            filtered_services = [s for s in filtered_services if s["specialty"] and s["specialty"].lower() == specialty.lower()]
        
        if is_active:
            filtered_services = [s for s in filtered_services if s["is_active"]]
        
        # Limitar resultados
        return filtered_services[:limit]
        
    except Exception as e:
        logger.error(f"Error getting medical services: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8003,
        reload=True,
        log_level="info"
    )