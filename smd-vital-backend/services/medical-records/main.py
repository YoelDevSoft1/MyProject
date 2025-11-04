"""
SMD VITAL - Medical Records Service
Servicio principal para manejo de consultas médicas, registros y calificaciones
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import json
from enum import Enum

from medical_record_service import MedicalRecordService, RecordType, MedicalRecord
from prescription_service import PrescriptionService, Prescription, Medication
from rating_service import RatingService, DoctorRating, RatingAggregate
from database_sqlalchemy import DatabaseManager
from fastapi.responses import PlainTextResponse
from medical_records_repository import repository as medical_records_repository

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializar servicios
db_manager = None
medical_service = None
prescription_service = None
rating_service = None


def _now_iso() -> str:
    """Return current UTC time as ISO string"""
    return datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manejar eventos de inicio y cierre de la aplicación"""
    global db_manager, medical_service, prescription_service, rating_service
    
    # Startup
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
    
    yield
    
    # Shutdown
    if db_manager:
        await db_manager.close()
        logger.info("Database connections closed")

# Inicializar FastAPI
app = FastAPI(
    title="SMD VITAL Medical Records Service",
    description="Servicio para manejo de registros médicos, prescripciones y calificaciones",
    version="1.0.0",
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
# ADMIN MEDICAL RECORDS MODELS
# =============================================

class MedicalRecordStatus(str, Enum):
    active = "active"
    pending = "pending"
    archived = "archived"


class MedicalRecordAdminBase(BaseModel):
    record_number: Optional[str] = None
    patient_id: Optional[str] = None
    patient_name: str
    doctor_id: Optional[str] = None
    doctor_name: str
    diagnosis: Optional[str] = None
    symptoms: Optional[str] = None
    treatment: Optional[str] = None
    medications: Optional[str] = None
    allergies: Optional[str] = None
    notes: Optional[str] = None
    status: MedicalRecordStatus = MedicalRecordStatus.active
    appointment_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    follow_up_notes: Optional[str] = None


class MedicalRecordAdminCreate(MedicalRecordAdminBase):
    pass


class MedicalRecordAdminUpdate(BaseModel):
    patient_id: Optional[str] = None
    patient_name: Optional[str] = None
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    diagnosis: Optional[str] = None
    symptoms: Optional[str] = None
    treatment: Optional[str] = None
    medications: Optional[str] = None
    allergies: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[MedicalRecordStatus] = None
    appointment_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    follow_up_notes: Optional[str] = None


class MedicalRecordAdminItem(MedicalRecordAdminBase):
    id: str
    record_number: str
    created_at: str
    updated_at: str


class MedicalRecordAdminStats(BaseModel):
    totalRecords: int
    activeRecords: int
    archivedRecords: int
    pendingRecords: int
    followUpScheduled: int
    lastUpdated: Optional[str]


class MedicalRecordListResponse(BaseModel):
    records: List[MedicalRecordAdminItem]
    page: int
    limit: int
    total: int
    totalPages: int
    stats: MedicalRecordAdminStats

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
# STARTUP Y SHUTDOWN (manejado por lifespan)
# =============================================

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

@app.get("/prescriptions", response_model=List[PrescriptionResponse], tags=["Prescriptions"])
async def get_prescriptions(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Obtener todas las prescripciones"""
    try:
        # Datos de ejemplo - en producción se consultaría la base de datos
        prescriptions_data = [
            {
                "id": "presc_1",
                "medical_record_id": "mr_1",
                "patient_id": "patient_123",
                "doctor_id": "doctor_456",
                "prescription_data": {
                    "medications": [
                        {
                            "name": "Ibuprofeno",
                            "dosage": "400mg",
                            "frequency": "Cada 8 horas",
                            "duration": "7 días"
                        }
                    ],
                    "doctor_notes": "Tomar con alimentos"
                },
                "pdf_url": None,
                "status": "active",
                "expires_at": "2024-02-15T00:00:00Z",
                "created_at": "2024-01-15T10:00:00Z"
            },
            {
                "id": "presc_2",
                "medical_record_id": "mr_2",
                "patient_id": "patient_456",
                "doctor_id": "doctor_789",
                "prescription_data": {
                    "medications": [
                        {
                            "name": "Amoxicilina",
                            "dosage": "500mg",
                            "frequency": "Cada 12 horas",
                            "duration": "10 días"
                        }
                    ],
                    "doctor_notes": "Completar el tratamiento"
                },
                "pdf_url": None,
                "status": "active",
                "expires_at": "2024-02-20T00:00:00Z",
                "created_at": "2024-01-16T14:30:00Z"
            }
        ]
        
        return [
            PrescriptionResponse(
                id=presc["id"],
                medical_record_id=presc["medical_record_id"],
                patient_id=presc["patient_id"],
                doctor_id=presc["doctor_id"],
                prescription_data=presc["prescription_data"],
                pdf_url=presc["pdf_url"],
                status=presc["status"],
                expires_at=presc["expires_at"],
                created_at=presc["created_at"]
            )
            for presc in prescriptions_data[:limit]
        ]
        
    except Exception as e:
        logger.error(f"Error getting prescriptions: {e}")
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
# ENDPOINTS DE SIGNOS VITALES
# =============================================

@app.get("/vital-signs", response_model=List[Dict[str, Any]], tags=["Vital Signs"])
async def get_vital_signs(
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Obtener todos los registros de signos vitales"""
    try:
        # Datos de ejemplo
        vital_signs_data = [
            {
                "id": "vs_1",
                "patient_id": "patient_123",
                "measured_at": "2024-01-15T10:00:00Z",
                "systolic_bp": 120,
                "diastolic_bp": 80,
                "heart_rate": 72,
                "respiratory_rate": 16,
                "temperature_celsius": 36.5,
                "oxygen_saturation": 98,
                "height_cm": 175.0,
                "weight_kg": 70.5,
                "bmi": 23.0,
                "glucose_level": 95,
                "pain_scale": 2,
                "position": "Sentado",
                "activity_level": "Reposo",
                "notes": "Paciente en reposo, sin síntomas",
                "measurement_method": "Manual",
                "device_used": "Esfigmomanómetro digital",
                "recorded_by": "doctor-123",
                "is_critical": False,
                "critical_values": []
            },
            {
                "id": "vs_2",
                "patient_id": "patient_456",
                "measured_at": "2024-01-14T14:30:00Z",
                "systolic_bp": 118,
                "diastolic_bp": 78,
                "heart_rate": 68,
                "respiratory_rate": 14,
                "temperature_celsius": 36.2,
                "oxygen_saturation": 99,
                "height_cm": 175.0,
                "weight_kg": 70.2,
                "bmi": 22.9,
                "glucose_level": 92,
                "pain_scale": 1,
                "position": "De pie",
                "activity_level": "Activo",
                "notes": "Paciente activo, buen estado general",
                "measurement_method": "Automático",
                "device_used": "Monitor multiparámetro",
                "recorded_by": "nurse-456",
                "is_critical": False,
                "critical_values": []
            }
        ]
        
        return vital_signs_data[:limit]
        
    except Exception as e:
        logger.error(f"Error getting vital signs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/vital-signs", response_model=Dict[str, Any], tags=["Vital Signs"])
async def record_vital_signs(
    patient_id: str,
    vital_signs_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Registrar signos vitales de un paciente"""
    try:
        # Verificar permisos
        if current_user["role"] not in ["doctor", "nurse", "admin"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Validar datos de signos vitales
        required_fields = ["systolic_bp", "diastolic_bp", "heart_rate", "temperature_celsius"]
        for field in required_fields:
            if field not in vital_signs_data:
                raise HTTPException(status_code=400, detail=f"Campo requerido: {field}")
        
        # Crear registro de signos vitales
        vital_signs_record = {
            "id": str(uuid.uuid4()),
            "patient_id": patient_id,
            "medical_record_id": vital_signs_data.get("medical_record_id"),
            "measured_at": datetime.utcnow().isoformat(),
            "systolic_bp": vital_signs_data.get("systolic_bp"),
            "diastolic_bp": vital_signs_data.get("diastolic_bp"),
            "heart_rate": vital_signs_data.get("heart_rate"),
            "respiratory_rate": vital_signs_data.get("respiratory_rate"),
            "temperature_celsius": vital_signs_data.get("temperature_celsius"),
            "oxygen_saturation": vital_signs_data.get("oxygen_saturation"),
            "height_cm": vital_signs_data.get("height_cm"),
            "weight_kg": vital_signs_data.get("weight_kg"),
            "glucose_level": vital_signs_data.get("glucose_level"),
            "pain_scale": vital_signs_data.get("pain_scale"),
            "position": vital_signs_data.get("position"),
            "activity_level": vital_signs_data.get("activity_level"),
            "notes": vital_signs_data.get("notes"),
            "measurement_method": vital_signs_data.get("measurement_method"),
            "device_used": vital_signs_data.get("device_used"),
            "recorded_by": current_user["id"],
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Calcular BMI si se proporcionan altura y peso
        if vital_signs_data.get("height_cm") and vital_signs_data.get("weight_kg"):
            height_m = vital_signs_data["height_cm"] / 100
            bmi = vital_signs_data["weight_kg"] / (height_m ** 2)
            vital_signs_record["bmi"] = round(bmi, 1)
        
        # Verificar valores críticos
        critical_values = []
        if vital_signs_data.get("systolic_bp", 0) > 180 or vital_signs_data.get("systolic_bp", 0) < 90:
            critical_values.append("Presión arterial sistólica")
        if vital_signs_data.get("diastolic_bp", 0) > 110 or vital_signs_data.get("diastolic_bp", 0) < 60:
            critical_values.append("Presión arterial diastólica")
        if vital_signs_data.get("heart_rate", 0) > 100 or vital_signs_data.get("heart_rate", 0) < 60:
            critical_values.append("Frecuencia cardíaca")
        if vital_signs_data.get("temperature_celsius", 0) > 38.5 or vital_signs_data.get("temperature_celsius", 0) < 35:
            critical_values.append("Temperatura")
        
        vital_signs_record["is_critical"] = len(critical_values) > 0
        vital_signs_record["critical_values"] = critical_values
        
        return {
            "success": True,
            "message": "Signos vitales registrados exitosamente",
            "data": vital_signs_record
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error recording vital signs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================
# ADMIN HELPER FUNCTIONS
# =============================================

def map_admin_record(item: Dict[str, Any]) -> MedicalRecordAdminItem:
    """Map database record to admin response model"""
    return MedicalRecordAdminItem(
        id=item.get("id", ""),
        record_number=item.get("record_number", ""),
        patient_id=item.get("patient_id"),
        patient_name=item.get("patient_name", ""),
        doctor_id=item.get("doctor_id"),
        doctor_name=item.get("doctor_name", ""),
        diagnosis=item.get("diagnosis"),
        symptoms=item.get("symptoms"),
        treatment=item.get("treatment"),
        medications=item.get("medications"),
        allergies=item.get("allergies"),
        notes=item.get("notes"),
        status=item.get("status", MedicalRecordStatus.active),
        appointment_date=item.get("appointment_date"),
        follow_up_date=item.get("follow_up_date"),
        follow_up_notes=item.get("follow_up_notes"),
        created_at=item.get("created_at", _now_iso()),
        updated_at=item.get("updated_at", _now_iso())
    )


def map_admin_stats(stats: Dict[str, Any]) -> MedicalRecordAdminStats:
    """Map database stats to admin stats model"""
    return MedicalRecordAdminStats(
        totalRecords=stats.get("total_records", 0),
        activeRecords=stats.get("active_records", 0),
        archivedRecords=stats.get("archived_records", 0),
        pendingRecords=stats.get("pending_records", 0),
        followUpScheduled=stats.get("follow_up_scheduled", 0),
        lastUpdated=stats.get("last_updated")
    )


# =============================================
# ADMIN MEDICAL RECORDS ENDPOINTS
# =============================================

@app.get("/medical-records/admin", response_model=MedicalRecordListResponse, tags=["Medical Records Admin"])
async def admin_list_medical_records(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Page size"),
    status: Optional[MedicalRecordStatus] = Query(None, description="Filter by status"),
    doctor: Optional[str] = Query(None, description="Filter by doctor"),
    search: Optional[str] = Query(None, description="Search term"),
    current_user: dict = Depends(get_current_user)
):
    result = await medical_records_repository.list_records(
        page=page,
        limit=limit,
        status=status.value if status else None,
        doctor=doctor,
        search=search
    )
    records = [map_admin_record(item) for item in result["items"]]
    stats = map_admin_stats(result.get("stats", {}))
    return MedicalRecordListResponse(
        records=records,
        page=result.get("page", page),
        limit=result.get("limit", limit),
        total=result.get("total", len(records)),
        totalPages=result.get("total_pages", 1),
        stats=stats
    )


@app.post(
    "/medical-records/admin",
    response_model=MedicalRecordAdminItem,
    status_code=201,
    tags=["Medical Records Admin"]
)
async def admin_create_medical_record(
    payload: MedicalRecordAdminCreate,
    current_user: dict = Depends(get_current_user)
):
    record = await medical_records_repository.create_record({
        **payload.dict(),
        "created_by": current_user.get("id")
    })
    return map_admin_record(record)


@app.put("/medical-records/admin/{record_id}", response_model=MedicalRecordAdminItem, tags=["Medical Records Admin"])
async def admin_update_medical_record(
    record_id: str,
    payload: MedicalRecordAdminUpdate,
    current_user: dict = Depends(get_current_user)
):
    update_payload = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
    record = await medical_records_repository.update_record(record_id, update_payload)
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return map_admin_record(record)


@app.delete("/medical-records/admin/{record_id}", status_code=204, tags=["Medical Records Admin"])
async def admin_delete_medical_record(
    record_id: str,
    current_user: dict = Depends(get_current_user)
):
    deleted = await medical_records_repository.delete_record(record_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return Response(status_code=204)


@app.get("/medical-records/admin/export", response_class=PlainTextResponse, tags=["Medical Records Admin"])
async def admin_export_medical_records(
    status: Optional[MedicalRecordStatus] = Query(None, description="Filter by status"),
    doctor: Optional[str] = Query(None, description="Filter by doctor"),
    search: Optional[str] = Query(None, description="Search term"),
    current_user: dict = Depends(get_current_user)
):
    csv_content = await medical_records_repository.export_records(
        status=status.value if status else None,
        doctor=doctor,
        search=search
    )
    headers = {"Content-Disposition": "attachment; filename=medical_records.csv"}
    return PlainTextResponse(content=csv_content, media_type="text/csv", headers=headers)

@app.get("/vital-signs/patient/{patient_id}", response_model=List[Dict[str, Any]], tags=["Vital Signs"])
async def get_patient_vital_signs(
    patient_id: str,
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Obtener historial de signos vitales de un paciente"""
    try:
        # Verificar permisos
        if current_user["role"] not in ["doctor", "nurse", "admin"]:
            if current_user["id"] != patient_id:
                raise HTTPException(status_code=403, detail="Access denied")
        
        # Datos de ejemplo de signos vitales
        vital_signs_history = [
            {
                "id": "vs_1",
                "patient_id": patient_id,
                "measured_at": "2024-01-15T10:00:00Z",
                "systolic_bp": 120,
                "diastolic_bp": 80,
                "heart_rate": 72,
                "respiratory_rate": 16,
                "temperature_celsius": 36.5,
                "oxygen_saturation": 98,
                "height_cm": 175.0,
                "weight_kg": 70.5,
                "bmi": 23.0,
                "glucose_level": 95,
                "pain_scale": 2,
                "position": "Sentado",
                "activity_level": "Reposo",
                "notes": "Paciente en reposo, sin síntomas",
                "measurement_method": "Manual",
                "device_used": "Esfigmomanómetro digital",
                "recorded_by": "doctor-123",
                "is_critical": False,
                "critical_values": []
            },
            {
                "id": "vs_2",
                "patient_id": patient_id,
                "measured_at": "2024-01-14T14:30:00Z",
                "systolic_bp": 118,
                "diastolic_bp": 78,
                "heart_rate": 68,
                "respiratory_rate": 14,
                "temperature_celsius": 36.2,
                "oxygen_saturation": 99,
                "height_cm": 175.0,
                "weight_kg": 70.2,
                "bmi": 22.9,
                "glucose_level": 92,
                "pain_scale": 1,
                "position": "De pie",
                "activity_level": "Activo",
                "notes": "Paciente activo, buen estado general",
                "measurement_method": "Automático",
                "device_used": "Monitor multiparámetro",
                "recorded_by": "nurse-456",
                "is_critical": False,
                "critical_values": []
            }
        ]
        
        return vital_signs_history[:limit]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting patient vital signs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/vital-signs/{vital_signs_id}", response_model=Dict[str, Any], tags=["Vital Signs"])
async def get_vital_signs_details(
    vital_signs_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtener detalles de un registro específico de signos vitales"""
    try:
        # Datos de ejemplo
        vital_signs_data = {
            "id": vital_signs_id,
            "patient_id": "patient-123",
            "measured_at": "2024-01-15T10:00:00Z",
            "systolic_bp": 120,
            "diastolic_bp": 80,
            "heart_rate": 72,
            "respiratory_rate": 16,
            "temperature_celsius": 36.5,
            "oxygen_saturation": 98,
            "height_cm": 175.0,
            "weight_kg": 70.5,
            "bmi": 23.0,
            "glucose_level": 95,
            "pain_scale": 2,
            "position": "Sentado",
            "activity_level": "Reposo",
            "notes": "Paciente en reposo, sin síntomas",
            "measurement_method": "Manual",
            "device_used": "Esfigmomanómetro digital",
            "recorded_by": "doctor-123",
            "is_critical": False,
            "critical_values": []
        }
        
        return vital_signs_data
        
    except Exception as e:
        logger.error(f"Error getting vital signs details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================
# ALLERGIES ENDPOINT
# =============================================

@app.get("/allergies", response_model=List[Dict[str, Any]], tags=["Allergies"])
async def get_allergies(
    patient_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100)
):
    """Obtener lista de alergias"""
    try:
        # Datos de ejemplo - en producción se consultaría la base de datos
        allergies_data = [
            {
                "id": "allergy_1",
                "patient_id": patient_id or "patient-123",
                "allergen": "Penicilina",
                "severity": "Moderada",
                "reaction": "Erupción cutánea",
                "diagnosed_date": "2024-01-15T10:00:00Z",
                "status": "Activa",
                "notes": "Evitar todos los antibióticos de la familia de la penicilina"
            },
            {
                "id": "allergy_2",
                "patient_id": patient_id or "patient-123",
                "allergen": "Polen",
                "severity": "Leve",
                "reaction": "Estornudos, congestión nasal",
                "diagnosed_date": "2024-02-01T10:00:00Z",
                "status": "Activa",
                "notes": "Empeora en primavera"
            },
            {
                "id": "allergy_3",
                "patient_id": patient_id or "patient-123",
                "allergen": "Mariscos",
                "severity": "Severa",
                "reaction": "Anafilaxia",
                "diagnosed_date": "2023-12-10T10:00:00Z",
                "status": "Activa",
                "notes": "Requiere epinefrina de emergencia"
            }
        ]
        
        # Filtrar por patient_id si se proporciona
        if patient_id:
            allergies_data = [a for a in allergies_data if a["patient_id"] == patient_id]
        
        # Limitar resultados
        return allergies_data[:limit]
        
    except Exception as e:
        logger.error(f"Error getting allergies: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# HEALTH CHECK
# =============================================

@app.get("/medical-records", response_model=List[MedicalRecordResponse], tags=["Medical Records"])
async def get_medical_records(
    patient_id: Optional[str] = Query(None),
    doctor_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Obtener registros médicos con filtros opcionales"""
    try:
        # Por ahora, devolver datos de ejemplo hasta que se configure la base de datos
        records = [
            {
                "id": "1",
                "patient_id": patient_id or "patient-123",
                "doctor_id": doctor_id or "doctor-456",
                "appointment_id": "appointment-789",
                "record_type": "consultation",
                "version": 1,
                "clinical_data": {
                    "chief_complaint": "Dolor de cabeza",
                    "diagnosis": "Migraña",
                    "treatment": "Ibuprofeno 400mg cada 8 horas"
                },
                "created_at": "2024-01-15T10:00:00Z",
                "status": "active"
            },
            {
                "id": "2",
                "patient_id": patient_id or "patient-123",
                "doctor_id": doctor_id or "doctor-456",
                "appointment_id": "appointment-790",
                "record_type": "follow_up",
                "version": 1,
                "clinical_data": {
                    "chief_complaint": "Seguimiento de migraña",
                    "diagnosis": "Migraña controlada",
                    "treatment": "Continuar con medicación"
                },
                "created_at": "2024-01-10T14:30:00Z",
                "status": "active"
            }
        ]
        
        return [
            MedicalRecordResponse(
                id=record["id"],
                patient_id=record["patient_id"],
                doctor_id=record["doctor_id"],
                appointment_id=record["appointment_id"],
                record_type=record["record_type"],
                version=record["version"],
                clinical_data=record["clinical_data"],
                created_at=record["created_at"],
                status=record["status"]
            )
            for record in records
        ]
        
    except Exception as e:
        logger.error(f"Error getting medical records: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "medical-records",
        "timestamp": datetime.utcnow().isoformat()
    }

# =============================================
# METRICS
# =============================================

@app.get("/metrics", tags=["Metrics"])
async def metrics():
    """Prometheus metrics endpoint"""
    from shared.metrics import get_metrics_response
    return get_metrics_response()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007)




