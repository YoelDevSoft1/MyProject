"""
SMD Vital - Appointment Service
===============================

Microservicio de gestión de citas médicas para la plataforma SMD Vital.
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import logging
from typing import Optional, List
import uuid

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

# FastAPI app instance
app = FastAPI(
    title="SMD Vital - Appointment Service",
    description="Microservicio de gestión de citas médicas para SMD Vital Bogotá",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS is handled by Nginx API Gateway
# No need for CORS middleware in individual microservices

# Inicializar servicios
reservation_service = None

# Startup event
@app.on_event("startup")
async def startup_event():
    """Inicializar motor de base de datos y servicios"""
    await db.init_engine()
    
    # Inicializar Redis para reservas temporales
    global reservation_service
    redis_client = redis.Redis(
        host='redis', 
        port=6379, 
        db=0, 
        password='redis_password_2024',
        decode_responses=True
    )
    reservation_service = AppointmentReservationService(db, redis_client)
    
    logger.info("Appointment service initialized successfully")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cerrar motor de base de datos"""
    await db.close_engine()
    logger.info("Database engine closed")

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
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        
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
        if not reservation_service:
            raise HTTPException(status_code=500, detail="Servicio de reservas no disponible")
        
        # Usar el patient_id del usuario autenticado
        patient_id = current_user.get("id")
        if not patient_id:
            raise HTTPException(status_code=400, detail="ID de paciente no encontrado")
        
        result = await reservation_service.confirm_reservation(
            reservation_id=confirmation_data.get("reservation_id"),
            patient_data=confirmation_data.get("patient_data", {})
        )
        
        if not result["success"]:
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8003,
        reload=True,
        log_level="info"
    )