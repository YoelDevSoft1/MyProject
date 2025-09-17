"""
SMD Vital - Appointment Service
===============================

Microservicio de gestión de citas médicas para la plataforma SMD Vital.
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging
from typing import Optional, List
import uuid

from appointment_models import (
    AppointmentCreate, 
    AppointmentUpdate, 
    AppointmentResponse, 
    AppointmentListResponse,
    AppointmentStatsResponse
)
from database_sqlalchemy import db

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

# Startup event
@app.on_event("startup")
async def startup_event():
    """Inicializar motor de base de datos"""
    await db.init_engine()
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8003,
        reload=True,
        log_level="info"
    )