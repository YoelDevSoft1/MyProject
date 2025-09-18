"""
SMD VITAL - Medical Records Service
Servicio principal para manejo de consultas médicas, registros y calificaciones
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import json

from medical_record_service import MedicalRecordService, RecordType, MedicalRecord
from prescription_service import PrescriptionService, Prescription, Medication
from rating_service import RatingService, DoctorRating, RatingAggregate
from database_sqlalchemy import DatabaseManager

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar FastAPI
app = FastAPI(
    title="SMD VITAL Medical Records Service",
    description="Servicio para manejo de registros médicos, prescripciones y calificaciones",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar servicios
db_manager = None
medical_service = None
prescription_service = None
rating_service = None

# =============================================
# MODELOS PYDANTIC
# =============================================

class ConsultationData(BaseModel):
    chief_complaint: str = Field(..., description="Motivo principal de consulta")
    history_present_illness: str = Field(..., description="Historia de la enfermedad actual")
    physical_examination: Dict[str, Any] = Field(..., description="Examen físico")
    assessment: str = Field(..., description="Evaluación/Diagnóstico")
    plan: str = Field(..., description="Plan de tratamiento")
    prescriptions: List[Dict[str, Any]] = Field(default=[], description="Medicamentos recetados")
    follow_up: Optional[Dict[str, Any]] = Field(None, description="Seguimiento recomendado")

class MedicationData(BaseModel):
    name: str = Field(..., description="Nombre del medicamento")
    dosage: str = Field(..., description="Dosis")
    frequency: str = Field(..., description="Frecuencia")
    duration: str = Field(..., description="Duración del tratamiento")
    instructions: str = Field(..., description="Instrucciones especiales")
    quantity: Optional[int] = Field(None, description="Cantidad")

class PrescriptionRequest(BaseModel):
    medical_record_id: str = Field(..., description="ID del registro médico")
    medications: List[MedicationData] = Field(..., description="Lista de medicamentos")
    doctor_notes: str = Field(default="", description="Notas del doctor")

class RatingRequest(BaseModel):
    doctor_id: str = Field(..., description="ID del doctor")
    appointment_id: str = Field(..., description="ID de la cita")
    rating: int = Field(..., ge=1, le=5, description="Calificación del 1 al 5")
    comment: str = Field(default="", description="Comentario opcional")
    categories: Optional[Dict[str, int]] = Field(None, description="Calificaciones por categorías")

class MedicalRecordResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    appointment_id: str
    record_type: str
    version: int
    clinical_data: Dict[str, Any]
    created_at: datetime
    status: str

class PrescriptionResponse(BaseModel):
    id: str
    medical_record_id: str
    patient_id: str
    doctor_id: str
    prescription_data: Dict[str, Any]
    pdf_url: Optional[str]
    status: str
    expires_at: Optional[datetime]
    created_at: datetime

class RatingResponse(BaseModel):
    id: str
    doctor_id: str
    patient_id: str
    appointment_id: str
    rating: int
    comment: Optional[str]
    categories: Dict[str, int]
    created_at: datetime
    is_verified: bool

class RatingAggregateResponse(BaseModel):
    doctor_id: str
    total_ratings: int
    average_rating: float
    rating_distribution: Dict[str, int]
    category_averages: Dict[str, float]
    confidence_score: float
    last_updated: datetime

# =============================================
# DEPENDENCIAS
# =============================================

async def get_current_user():
    """
    Mock de autenticación - en producción usar JWT
    """
    return {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "role": "doctor",
        "email": "doctor@smdvital.com"
    }

# =============================================
# STARTUP Y SHUTDOWN
# =============================================

@app.on_event("startup")
async def startup_event():
    """Inicializar servicios al arrancar"""
    global db_manager, medical_service, prescription_service, rating_service
    
    try:
        # Inicializar base de datos
        db_manager = DatabaseManager()
        await db_manager.init_engine()
        
        # Inicializar servicios
        medical_service = MedicalRecordService(db_manager)
        prescription_service = PrescriptionService(db_manager)
        rating_service = RatingService(db_manager)
        
        logger.info("Medical Records Service initialized successfully")
        
    except Exception as e:
        logger.error(f"Error initializing Medical Records Service: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cerrar conexiones al apagar"""
    if db_manager:
        await db_manager.close()
    logger.info("Medical Records Service shutdown")

# =============================================
# ENDPOINTS DE REGISTROS MÉDICOS
# =============================================

@app.post("/medical-records", response_model=MedicalRecordResponse, tags=["Medical Records"])
async def create_medical_record(
    appointment_id: str,
    consultation_data: ConsultationData,
    current_user: dict = Depends(get_current_user)
):
    """Crear un nuevo registro médico de consulta"""
    try:
        # Obtener datos de la cita
        appointment_query = "SELECT patient_id, doctor_id FROM appointments WHERE id = %s"
        appointment = await db_manager.fetch_one(appointment_query, [appointment_id])
        
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Estructurar datos clínicos
        clinical_data = {
            "consultation": consultation_data.dict(),
            "created_by": current_user["id"],
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Crear registro médico
        record = await medical_service.create_medical_record(
            patient_id=appointment["patient_id"],
            doctor_id=appointment["doctor_id"],
            appointment_id=appointment_id,
            record_type=RecordType.CONSULTATION,
            clinical_data=clinical_data,
            created_by=current_user["id"]
        )
        
        return MedicalRecordResponse(
            id=record.id,
            patient_id=record.patient_id,
            doctor_id=record.doctor_id,
            appointment_id=record.appointment_id,
            record_type=record.record_type,
            version=record.version,
            clinical_data=record.clinical_data,
            created_at=record.created_at,
            status=record.status
        )
        
    except Exception as e:
        logger.error(f"Error creating medical record: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/medical-records/patient/{patient_id}", response_model=List[MedicalRecordResponse], tags=["Medical Records"])
async def get_patient_medical_history(
    patient_id: str,
    limit: int = Query(50, ge=1, le=100),
    record_type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Obtener historial médico de un paciente"""
    try:
        # Verificar permisos (solo el paciente o su doctor pueden ver el historial)
        if current_user["role"] not in ["doctor", "nurse", "admin"]:
            if current_user["id"] != patient_id:
                raise HTTPException(status_code=403, detail="Access denied")
        
        record_type_enum = None
        if record_type:
            try:
                record_type_enum = RecordType(record_type)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid record type")
        
        records = await medical_service.get_patient_medical_history(
            patient_id=patient_id,
            limit=limit,
            record_type=record_type_enum
        )
        
        return [
            MedicalRecordResponse(
                id=record.id,
                patient_id=record.patient_id,
                doctor_id=record.doctor_id,
                appointment_id=record.appointment_id,
                record_type=record.record_type,
                version=record.version,
                clinical_data=record.clinical_data,
                created_at=record.created_at,
                status=record.status
            )
            for record in records
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting patient medical history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/medical-records/{record_id}", response_model=MedicalRecordResponse, tags=["Medical Records"])
async def get_medical_record(
    record_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtener un registro médico específico"""
    try:
        record = await medical_service.get_medical_record(record_id)
        
        if not record:
            raise HTTPException(status_code=404, detail="Medical record not found")
        
        # Verificar permisos
        if current_user["role"] not in ["doctor", "nurse", "admin"]:
            if current_user["id"] != record.patient_id:
                raise HTTPException(status_code=403, detail="Access denied")
        
        return MedicalRecordResponse(
            id=record.id,
            patient_id=record.patient_id,
            doctor_id=record.doctor_id,
            appointment_id=record.appointment_id,
            record_type=record.record_type,
            version=record.version,
            clinical_data=record.clinical_data,
            created_at=record.created_at,
            status=record.status
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting medical record: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================
# ENDPOINTS DE PRESCRIPCIONES
# =============================================

@app.post("/prescriptions", response_model=PrescriptionResponse, tags=["Prescriptions"])
async def create_prescription(
    prescription_request: PrescriptionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Crear una nueva receta médica"""
    try:
        # Verificar que el registro médico existe y pertenece al doctor
        record = await medical_service.get_medical_record(prescription_request.medical_record_id)
        if not record:
            raise HTTPException(status_code=404, detail="Medical record not found")
        
        if record.doctor_id != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Convertir medicamentos
        medications = [
            Medication(
                name=med.name,
                dosage=med.dosage,
                frequency=med.frequency,
                duration=med.duration,
                instructions=med.instructions,
                quantity=med.quantity
            )
            for med in prescription_request.medications
        ]
        
        # Crear prescripción
        prescription = await prescription_service.create_prescription(
            medical_record_id=prescription_request.medical_record_id,
            patient_id=record.patient_id,
            doctor_id=record.doctor_id,
            medications=medications,
            doctor_notes=prescription_request.doctor_notes,
            generate_pdf=True
        )
        
        return PrescriptionResponse(
            id=prescription.id,
            medical_record_id=prescription.medical_record_id,
            patient_id=prescription.patient_id,
            doctor_id=prescription.doctor_id,
            prescription_data=prescription.prescription_data,
            pdf_url=prescription.pdf_url,
            status=prescription.status,
            expires_at=prescription.expires_at,
            created_at=prescription.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating prescription: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/prescriptions/patient/{patient_id}", response_model=List[PrescriptionResponse], tags=["Prescriptions"])
async def get_patient_prescriptions(
    patient_id: str,
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Obtener recetas de un paciente"""
    try:
        # Verificar permisos
        if current_user["role"] not in ["doctor", "nurse", "admin"]:
            if current_user["id"] != patient_id:
                raise HTTPException(status_code=403, detail="Access denied")
        
        prescriptions = await prescription_service.get_patient_prescriptions(
            patient_id=patient_id,
            status=None,  # TODO: Convertir string a enum
            limit=limit
        )
        
        return [
            PrescriptionResponse(
                id=prescription.id,
                medical_record_id=prescription.medical_record_id,
                patient_id=prescription.patient_id,
                doctor_id=prescription.doctor_id,
                prescription_data=prescription.prescription_data,
                pdf_url=prescription.pdf_url,
                status=prescription.status,
                expires_at=prescription.expires_at,
                created_at=prescription.created_at
            )
            for prescription in prescriptions
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting patient prescriptions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================
# ENDPOINTS DE CALIFICACIONES
# =============================================

@app.post("/ratings", response_model=RatingResponse, tags=["Ratings"])
async def submit_rating(
    rating_request: RatingRequest,
    current_user: dict = Depends(get_current_user)
):
    """Enviar calificación de un doctor"""
    try:
        # Verificar que el usuario es un paciente
        if current_user["role"] != "patient":
            raise HTTPException(status_code=403, detail="Only patients can submit ratings")
        
        rating = await rating_service.submit_rating(
            doctor_id=rating_request.doctor_id,
            patient_id=current_user["id"],
            appointment_id=rating_request.appointment_id,
            rating=rating_request.rating,
            comment=rating_request.comment,
            categories=rating_request.categories
        )
        
        return RatingResponse(
            id=rating.id,
            doctor_id=rating.doctor_id,
            patient_id=rating.patient_id,
            appointment_id=rating.appointment_id,
            rating=rating.rating,
            comment=rating.comment,
            categories=rating.categories,
            created_at=rating.created_at,
            is_verified=rating.is_verified
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error submitting rating: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ratings/doctor/{doctor_id}", response_model=List[RatingResponse], tags=["Ratings"])
async def get_doctor_ratings(
    doctor_id: str,
    limit: int = Query(50, ge=1, le=100),
    verified_only: bool = Query(True),
    current_user: dict = Depends(get_current_user)
):
    """Obtener calificaciones de un doctor"""
    try:
        ratings = await rating_service.get_doctor_ratings(
            doctor_id=doctor_id,
            limit=limit,
            verified_only=verified_only
        )
        
        return [
            RatingResponse(
                id=rating.id,
                doctor_id=rating.doctor_id,
                patient_id=rating.patient_id,
                appointment_id=rating.appointment_id,
                rating=rating.rating,
                comment=rating.comment,
                categories=rating.categories,
                created_at=rating.created_at,
                is_verified=rating.is_verified
            )
            for rating in ratings
        ]
        
    except Exception as e:
        logger.error(f"Error getting doctor ratings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ratings/doctor/{doctor_id}/aggregate", response_model=RatingAggregateResponse, tags=["Ratings"])
async def get_doctor_rating_aggregate(
    doctor_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtener agregaciones de calificaciones de un doctor"""
    try:
        aggregate = await rating_service.get_doctor_rating_aggregate(doctor_id)
        
        if not aggregate:
            raise HTTPException(status_code=404, detail="No ratings found for this doctor")
        
        return RatingAggregateResponse(
            doctor_id=aggregate.doctor_id,
            total_ratings=aggregate.total_ratings,
            average_rating=aggregate.average_rating,
            rating_distribution=aggregate.rating_distribution,
            category_averages=aggregate.category_averages,
            confidence_score=aggregate.confidence_score,
            last_updated=aggregate.last_updated
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting doctor rating aggregate: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ratings/top-doctors", response_model=List[Dict[str, Any]], tags=["Ratings"])
async def get_top_rated_doctors(
    specialty: Optional[str] = Query(None),
    min_ratings: int = Query(5, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Obtener doctores mejor calificados"""
    try:
        doctors = await rating_service.get_top_rated_doctors(
            specialty=specialty,
            min_ratings=min_ratings,
            limit=limit
        )
        
        return doctors
        
    except Exception as e:
        logger.error(f"Error getting top rated doctors: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================
# ENDPOINTS DE ESTADÍSTICAS
# =============================================

@app.get("/stats/ratings", response_model=Dict[str, Any], tags=["Statistics"])
async def get_rating_statistics(current_user: dict = Depends(get_current_user)):
    """Obtener estadísticas generales de calificaciones"""
    try:
        # Verificar permisos de admin
        if current_user["role"] not in ["admin", "doctor"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        stats = await rating_service.get_rating_statistics()
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting rating statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================
# HEALTH CHECK
# =============================================

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "medical-records",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)