"""
SMD Vital - Medical Records Service
===================================

Microservicio de gestión de registros médicos para la plataforma SMD Vital.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
import uuid
from datetime import datetime, date
import logging

from models.database import get_db, MedicalRecord, MedicalHistory, Prescription, LabResult, VitalSigns
from models import MedicalRecordCreate, MedicalRecordResponse, MedicalHistoryCreate, PrescriptionCreate, LabResultCreate, VitalSignsCreate
from security import verify_token, get_current_user

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app instance
app = FastAPI(
    title="SMD Vital - Medical Records Service",
    description="Microservicio de gestión de registros médicos, historiales, recetas y resultados de laboratorio",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS is handled by Nginx API Gateway
# No need for CORS middleware in individual microservices

security = HTTPBearer()

# Medical Records Endpoints
@app.post("/medical-records", response_model=MedicalRecordResponse, status_code=status.HTTP_201_CREATED, tags=["Medical Records"])
async def create_medical_record(
    record_data: MedicalRecordCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Crear un nuevo registro médico"""
    try:
        # Verificar permisos (solo doctores y admins pueden crear registros)
        if current_user.get("role") not in ["doctor", "admin"]:
            raise HTTPException(status_code=403, detail="No tiene permisos para crear registros médicos")
        
        record = MedicalRecord(
            id=str(uuid.uuid4()),
            patient_id=record_data.patient_id,
            doctor_id=current_user["user_id"],
            appointment_id=record_data.appointment_id,
            chief_complaint=record_data.chief_complaint,
            present_illness=record_data.present_illness,
            physical_examination=record_data.physical_examination,
            assessment=record_data.assessment,
            plan=record_data.plan,
            created_at=datetime.utcnow()
        )
        
        db.add(record)
        db.commit()
        db.refresh(record)
        
        logger.info(f"Medical record created: {record.id} for patient: {record.patient_id}")
        return record
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating medical record: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al crear registro médico: {str(e)}")

@app.get("/medical-records/patient/{patient_id}", response_model=List[MedicalRecordResponse], tags=["Medical Records"])
async def get_patient_medical_records(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener todos los registros médicos de un paciente"""
    try:
        # Verificar permisos (paciente puede ver sus propios registros, doctores y admins pueden ver todos)
        if current_user.get("role") not in ["doctor", "admin"] and current_user.get("user_id") != patient_id:
            raise HTTPException(status_code=403, detail="No tiene permisos para acceder a estos registros")
        
        records = db.query(MedicalRecord).filter(MedicalRecord.patient_id == patient_id).order_by(MedicalRecord.created_at.desc()).all()
        return records
        
    except Exception as e:
        logger.error(f"Error getting patient medical records: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener registros médicos: {str(e)}")

@app.get("/medical-records/{record_id}", response_model=MedicalRecordResponse, tags=["Medical Records"])
async def get_medical_record(
    record_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener un registro médico específico"""
    try:
        record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
        
        if not record:
            raise HTTPException(status_code=404, detail="Registro médico no encontrado")
        
        # Verificar permisos
        if current_user.get("role") not in ["doctor", "admin"] and current_user.get("user_id") != record.patient_id:
            raise HTTPException(status_code=403, detail="No tiene permisos para acceder a este registro")
        
        return record
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting medical record: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener registro médico: {str(e)}")

# Medical History Endpoints
@app.post("/medical-history", status_code=status.HTTP_201_CREATED, tags=["Medical History"])
async def create_medical_history(
    history_data: MedicalHistoryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Crear entrada en historial médico"""
    try:
        if current_user.get("role") not in ["doctor", "admin"]:
            raise HTTPException(status_code=403, detail="No tiene permisos para crear historial médico")
        
        history = MedicalHistory(
            id=str(uuid.uuid4()),
            patient_id=history_data.patient_id,
            doctor_id=current_user["user_id"],
            condition=history_data.condition,
            diagnosis_date=history_data.diagnosis_date,
            status=history_data.status,
            notes=history_data.notes,
            created_at=datetime.utcnow()
        )
        
        db.add(history)
        db.commit()
        db.refresh(history)
        
        logger.info(f"Medical history created: {history.id} for patient: {history.patient_id}")
        return {"message": "Historial médico creado exitosamente", "id": history.id}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating medical history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al crear historial médico: {str(e)}")

# Prescriptions Endpoints
@app.post("/prescriptions", status_code=status.HTTP_201_CREATED, tags=["Prescriptions"])
async def create_prescription(
    prescription_data: PrescriptionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Crear una nueva receta médica"""
    try:
        if current_user.get("role") not in ["doctor", "admin"]:
            raise HTTPException(status_code=403, detail="Solo doctores pueden crear recetas")
        
        prescription = Prescription(
            id=str(uuid.uuid4()),
            patient_id=prescription_data.patient_id,
            doctor_id=current_user["user_id"],
            medication_name=prescription_data.medication_name,
            dosage=prescription_data.dosage,
            frequency=prescription_data.frequency,
            duration=prescription_data.duration,
            instructions=prescription_data.instructions,
            status="active",
            created_at=datetime.utcnow()
        )
        
        db.add(prescription)
        db.commit()
        db.refresh(prescription)
        
        logger.info(f"Prescription created: {prescription.id} for patient: {prescription.patient_id}")
        return {"message": "Receta creada exitosamente", "id": prescription.id}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating prescription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al crear receta: {str(e)}")

@app.get("/prescriptions/patient/{patient_id}", tags=["Prescriptions"])
async def get_patient_prescriptions(
    patient_id: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener recetas de un paciente"""
    try:
        # Verificar permisos
        if current_user.get("role") not in ["doctor", "admin"] and current_user.get("user_id") != patient_id:
            raise HTTPException(status_code=403, detail="No tiene permisos para acceder a estas recetas")
        
        query = db.query(Prescription).filter(Prescription.patient_id == patient_id)
        
        if status:
            query = query.filter(Prescription.status == status)
        
        prescriptions = query.order_by(Prescription.created_at.desc()).all()
        return prescriptions
        
    except Exception as e:
        logger.error(f"Error getting patient prescriptions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener recetas: {str(e)}")

# Lab Results Endpoints
@app.post("/lab-results", status_code=status.HTTP_201_CREATED, tags=["Lab Results"])
async def create_lab_result(
    lab_data: LabResultCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Registrar resultado de laboratorio"""
    try:
        if current_user.get("role") not in ["doctor", "lab_technician", "admin"]:
            raise HTTPException(status_code=403, detail="No tiene permisos para registrar resultados de laboratorio")
        
        lab_result = LabResult(
            id=str(uuid.uuid4()),
            patient_id=lab_data.patient_id,
            test_name=lab_data.test_name,
            test_type=lab_data.test_type,
            result_value=lab_data.result_value,
            reference_range=lab_data.reference_range,
            units=lab_data.units,
            status=lab_data.status,
            notes=lab_data.notes,
            performed_by=current_user["user_id"],
            performed_at=datetime.utcnow()
        )
        
        db.add(lab_result)
        db.commit()
        db.refresh(lab_result)
        
        logger.info(f"Lab result created: {lab_result.id} for patient: {lab_result.patient_id}")
        return {"message": "Resultado de laboratorio registrado exitosamente", "id": lab_result.id}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating lab result: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al registrar resultado de laboratorio: {str(e)}")

# Vital Signs Endpoints
@app.post("/vital-signs", status_code=status.HTTP_201_CREATED, tags=["Vital Signs"])
async def record_vital_signs(
    vital_data: VitalSignsCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Registrar signos vitales"""
    try:
        if current_user.get("role") not in ["doctor", "nurse", "admin"]:
            raise HTTPException(status_code=403, detail="No tiene permisos para registrar signos vitales")
        
        vital_signs = VitalSigns(
            id=str(uuid.uuid4()),
            patient_id=vital_data.patient_id,
            appointment_id=vital_data.appointment_id,
            blood_pressure_systolic=vital_data.blood_pressure_systolic,
            blood_pressure_diastolic=vital_data.blood_pressure_diastolic,
            heart_rate=vital_data.heart_rate,
            temperature=vital_data.temperature,
            respiratory_rate=vital_data.respiratory_rate,
            oxygen_saturation=vital_data.oxygen_saturation,
            weight=vital_data.weight,
            height=vital_data.height,
            recorded_by=current_user["user_id"],
            recorded_at=datetime.utcnow()
        )
        
        db.add(vital_signs)
        db.commit()
        db.refresh(vital_signs)
        
        logger.info(f"Vital signs recorded: {vital_signs.id} for patient: {vital_signs.patient_id}")
        return {"message": "Signos vitales registrados exitosamente", "id": vital_signs.id}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error recording vital signs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al registrar signos vitales: {str(e)}")

@app.get("/vital-signs/patient/{patient_id}", tags=["Vital Signs"])
async def get_patient_vital_signs(
    patient_id: str,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener signos vitales de un paciente"""
    try:
        # Verificar permisos
        if current_user.get("role") not in ["doctor", "nurse", "admin"] and current_user.get("user_id") != patient_id:
            raise HTTPException(status_code=403, detail="No tiene permisos para acceder a estos signos vitales")
        
        vital_signs = db.query(VitalSigns).filter(
            VitalSigns.patient_id == patient_id
        ).order_by(VitalSigns.recorded_at.desc()).limit(limit).all()
        
        return vital_signs
        
    except Exception as e:
        logger.error(f"Error getting patient vital signs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener signos vitales: {str(e)}")

# Health Check
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "medical-records-service",
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
        "message": "SMD Vital Medical Records Service",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/info", tags=["Info"])
async def service_info():
    """Service information"""
    return {
        "service": "medical-records-service",
        "description": "Medical records and health data management service",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "info": "/info"
        },
        "database": "smdvital_medical_records",
        "port": 8005
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8005,
        reload=True,
        log_level="info"
    )