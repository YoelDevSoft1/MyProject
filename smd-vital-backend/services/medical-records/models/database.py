"""
SMD Vital - Medical Records Service Database Models
===================================================

Modelos de base de datos para el servicio de historiales médicos.
Incluye historiales, documentos, resultados de laboratorio y archivos médicos.

Author: Backend Team
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey, Date, Numeric, Enum as SQLEnum, LargeBinary, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from datetime import datetime, date
from enum import Enum
import uuid
import os

Base = declarative_base()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://smdvital:smdvital_password_2024@localhost:5432/smdvital_medical_records")

# Create engine
engine = create_engine(DATABASE_URL, echo=False)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class RecordType(Enum):
    """Tipo de registro médico"""
    CONSULTATION = "consultation"
    PROCEDURE = "procedure"
    DIAGNOSIS = "diagnosis"
    TREATMENT_PLAN = "treatment_plan"
    PRESCRIPTION = "prescription"
    LAB_RESULT = "lab_result"
    IMAGING = "imaging"
    VACCINATION = "vaccination"
    SURGERY = "surgery"
    DISCHARGE_SUMMARY = "discharge_summary"
    EMERGENCY = "emergency"
    FOLLOW_UP = "follow_up"


class DocumentType(Enum):
    """Tipo de documento médico"""
    LAB_REPORT = "lab_report"
    IMAGING_SCAN = "imaging_scan"
    PRESCRIPTION = "prescription"
    REFERRAL = "referral"
    MEDICAL_CERTIFICATE = "medical_certificate"
    VACCINATION_CARD = "vaccination_card"
    SURGERY_REPORT = "surgery_report"
    PATHOLOGY_REPORT = "pathology_report"
    CONSENT_FORM = "consent_form"
    INSURANCE_FORM = "insurance_form"
    OTHER = "other"


class RecordStatus(Enum):
    """Estado del registro médico"""
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"
    DELETED = "deleted"


class DocumentStatus(Enum):
    """Estado del documento"""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    VERIFIED = "verified"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class LabTestStatus(Enum):
    """Estado de examen de laboratorio"""
    ORDERED = "ordered"
    COLLECTED = "collected"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    ABNORMAL = "abnormal"


class MedicalRecord(Base):
    """
    Modelo principal de registros médicos
    """
    __tablename__ = 'medical_records'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    record_number = Column(String(20), unique=True, nullable=False, index=True)
    
    # Participantes
    patient_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # ID del paciente
    professional_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # ID del profesional
    appointment_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # ID de la cita relacionada
    
    # Información del registro
    record_type = Column(SQLEnum(RecordType), nullable=False, index=True)
    status = Column(SQLEnum(RecordStatus), default=RecordStatus.ACTIVE, nullable=False)
    
    # Fechas
    record_date = Column(DateTime, nullable=False, index=True)  # Fecha del evento médico
    service_date = Column(Date, nullable=True)  # Fecha del servicio (puede ser diferente)
    
    # Contenido principal
    chief_complaint = Column(Text, nullable=True)  # Motivo principal de consulta
    history_present_illness = Column(Text, nullable=True)  # Historia de enfermedad actual
    review_of_systems = Column(Text, nullable=True)  # Revisión por sistemas
    physical_examination = Column(Text, nullable=True)  # Examen físico
    
    # Diagnósticos
    primary_diagnosis = Column(Text, nullable=True)
    secondary_diagnoses = Column(ARRAY(Text), nullable=True)
    differential_diagnoses = Column(ARRAY(Text), nullable=True)
    icd_codes = Column(ARRAY(String), nullable=True)  # Códigos ICD-10
    
    # Plan de tratamiento
    treatment_plan = Column(Text, nullable=True)
    medications_prescribed = Column(JSONB, nullable=True)
    procedures_performed = Column(JSONB, nullable=True)
    recommendations = Column(Text, nullable=True)
    
    # Seguimiento
    follow_up_instructions = Column(Text, nullable=True)
    next_appointment_recommended = Column(Date, nullable=True)
    
    # Signos vitales al momento del registro
    vital_signs = Column(JSONB, nullable=True)
    
    # Información adicional estructurada
    clinical_data = Column(JSONB, nullable=True)  # Datos clínicos estructurados
    meta_data = Column(JSONB, nullable=True)  # Metadatos adicionales
    
    # Seguridad y privacidad
    is_sensitive = Column(Boolean, default=False, nullable=False)  # Información sensible
    access_level = Column(String(20), default='standard', nullable=False)  # standard, restricted, confidential
    encryption_key_id = Column(String(100), nullable=True)  # ID de clave de encriptación
    
    # Verificación y validación
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_by = Column(UUID(as_uuid=True), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    documents = relationship("MedicalDocument", back_populates="medical_record", cascade="all, delete-orphan")
    lab_results = relationship("LabResult", back_populates="medical_record", cascade="all, delete-orphan")
    vital_signs_records = relationship("VitalSigns", back_populates="medical_record", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="medical_record", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<MedicalRecord(id={self.id}, number={self.record_number}, type={self.record_type})>"


class MedicalDocument(Base):
    """
    Modelo para documentos médicos y archivos
    """
    __tablename__ = 'medical_documents'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medical_record_id = Column(UUID(as_uuid=True), ForeignKey('medical_records.id'), nullable=False, index=True)
    
    # Información del documento
    document_type = Column(SQLEnum(DocumentType), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Información del archivo
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_hash = Column(String(64), nullable=True)  # SHA-256 hash para integridad
    
    # Estado y procesamiento
    status = Column(SQLEnum(DocumentStatus), default=DocumentStatus.UPLOADED, nullable=False)
    processing_status = Column(String(50), nullable=True)
    
    # Metadatos del documento
    page_count = Column(Integer, nullable=True)
    word_count = Column(Integer, nullable=True)
    extracted_text = Column(Text, nullable=True)  # Texto extraído del documento
    ocr_confidence = Column(Numeric(5, 2), nullable=True)  # Confianza del OCR (0-100)
    
    # Seguridad
    is_encrypted = Column(Boolean, default=True, nullable=False)
    encryption_key_id = Column(String(100), nullable=True)
    is_phi = Column(Boolean, default=True, nullable=False)  # Protected Health Information
    
    # Información de contexto
    document_date = Column(Date, nullable=True)  # Fecha del documento original
    author = Column(String(255), nullable=True)  # Autor del documento
    institution = Column(String(255), nullable=True)  # Institución emisora
    external_id = Column(String(100), nullable=True)  # ID en sistema externo
    
    # Control de acceso
    access_level = Column(String(20), default='standard', nullable=False)
    viewable_by_patient = Column(Boolean, default=True, nullable=False)
    sharing_permissions = Column(JSONB, nullable=True)
    
    # Análisis y etiquetas
    tags = Column(ARRAY(String), nullable=True)
    keywords = Column(ARRAY(String), nullable=True)
    clinical_categories = Column(ARRAY(String), nullable=True)
    
    # Timestamps
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), nullable=False)
    last_accessed = Column(DateTime, nullable=True)
    access_count = Column(Integer, default=0, nullable=False)
    
    # Relaciones
    medical_record = relationship("MedicalRecord", back_populates="documents")
    
    def __repr__(self):
        return f"<MedicalDocument(id={self.id}, title={self.title}, type={self.document_type})>"


class LabResult(Base):
    """
    Modelo para resultados de laboratorio
    """
    __tablename__ = 'lab_results'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medical_record_id = Column(UUID(as_uuid=True), ForeignKey('medical_records.id'), nullable=True, index=True)
    patient_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Información del laboratorio
    lab_order_number = Column(String(50), nullable=True, index=True)
    external_lab_id = Column(String(100), nullable=True)
    lab_name = Column(String(255), nullable=False)
    
    # Información del test
    test_name = Column(String(255), nullable=False)
    test_code = Column(String(50), nullable=True, index=True)
    test_category = Column(String(100), nullable=False, index=True)
    specimen_type = Column(String(100), nullable=True)  # sangre, orina, etc.
    
    # Fechas importantes
    ordered_date = Column(DateTime, nullable=False)
    collected_date = Column(DateTime, nullable=True)
    reported_date = Column(DateTime, nullable=False)
    verified_date = Column(DateTime, nullable=True)
    
    # Estado del test
    status = Column(SQLEnum(LabTestStatus), nullable=False, index=True)
    
    # Resultados
    result_value = Column(String(100), nullable=True)
    result_unit = Column(String(50), nullable=True)
    reference_range = Column(String(100), nullable=True)
    is_abnormal = Column(Boolean, nullable=True)
    abnormal_flag = Column(String(10), nullable=True)  # H, L, HH, LL, etc.
    
    # Interpretación
    interpretation = Column(Text, nullable=True)
    clinical_significance = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    
    # Información del profesional
    ordering_professional = Column(UUID(as_uuid=True), nullable=False)
    reviewing_professional = Column(UUID(as_uuid=True), nullable=True)
    
    # Datos estructurados
    result_data = Column(JSONB, nullable=True)  # Para resultados complejos
    quality_control = Column(JSONB, nullable=True)
    
    # Información adicional
    notes = Column(Text, nullable=True)
    technical_notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    medical_record = relationship("MedicalRecord", back_populates="lab_results")
    
    def __repr__(self):
        return f"<LabResult(id={self.id}, test={self.test_name}, status={self.status})>"


class VitalSigns(Base):
    """
    Modelo para signos vitales
    """
    __tablename__ = 'vital_signs'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medical_record_id = Column(UUID(as_uuid=True), ForeignKey('medical_records.id'), nullable=True, index=True)
    patient_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Fecha y hora de la medición
    measured_at = Column(DateTime, nullable=False, index=True)
    
    # Signos vitales básicos
    systolic_bp = Column(Integer, nullable=True)  # Presión arterial sistólica (mmHg)
    diastolic_bp = Column(Integer, nullable=True)  # Presión arterial diastólica (mmHg)
    heart_rate = Column(Integer, nullable=True)  # Frecuencia cardíaca (bpm)
    respiratory_rate = Column(Integer, nullable=True)  # Frecuencia respiratoria (rpm)
    temperature_celsius = Column(Numeric(4, 1), nullable=True)  # Temperatura (°C)
    oxygen_saturation = Column(Integer, nullable=True)  # Saturación de oxígeno (%)
    
    # Medidas físicas
    height_cm = Column(Numeric(5, 1), nullable=True)  # Altura (cm)
    weight_kg = Column(Numeric(5, 1), nullable=True)  # Peso (kg)
    bmi = Column(Numeric(4, 1), nullable=True)  # Índice de masa corporal
    
    # Medidas adicionales
    glucose_level = Column(Integer, nullable=True)  # Glucosa (mg/dL)
    pain_scale = Column(Integer, nullable=True)  # Escala de dolor (0-10)
    
    # Información contextual
    position = Column(String(50), nullable=True)  # Posición del paciente
    activity_level = Column(String(50), nullable=True)  # Nivel de actividad
    notes = Column(Text, nullable=True)
    
    # Información del dispositivo/método
    measurement_method = Column(String(100), nullable=True)
    device_used = Column(String(255), nullable=True)
    device_calibration_date = Column(Date, nullable=True)
    
    # Alertas y banderas
    is_critical = Column(Boolean, default=False, nullable=False)
    critical_values = Column(ARRAY(String), nullable=True)
    alerts_triggered = Column(JSONB, nullable=True)
    
    # Información del profesional
    measured_by = Column(UUID(as_uuid=True), nullable=False)
    verified_by = Column(UUID(as_uuid=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    medical_record = relationship("MedicalRecord", back_populates="vital_signs_records")
    
    def __repr__(self):
        return f"<VitalSigns(id={self.id}, patient_id={self.patient_id}, measured_at={self.measured_at})>"

    @property
    def blood_pressure(self):
        """Retorna la presión arterial como string"""
        if self.systolic_bp and self.diastolic_bp:
            return f"{self.systolic_bp}/{self.diastolic_bp}"
        return None

    @property
    def calculated_bmi(self):
        """Calcula BMI si no está almacenado"""
        if self.bmi:
            return float(self.bmi)
        if self.height_cm and self.weight_kg:
            height_m = float(self.height_cm) / 100
            return round(float(self.weight_kg) / (height_m ** 2), 1)
        return None


class Prescription(Base):
    """
    Modelo para prescripciones médicas
    """
    __tablename__ = 'prescriptions'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medical_record_id = Column(UUID(as_uuid=True), ForeignKey('medical_records.id'), nullable=True, index=True)
    patient_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    prescription_number = Column(String(20), unique=True, nullable=False, index=True)
    
    # Información del medicamento
    medication_name = Column(String(255), nullable=False)
    generic_name = Column(String(255), nullable=True)
    medication_code = Column(String(50), nullable=True)  # Código del medicamento
    strength = Column(String(50), nullable=True)  # Concentración
    dosage_form = Column(String(50), nullable=True)  # Forma farmacéutica
    
    # Instrucciones de dosificación
    dosage = Column(String(255), nullable=False)  # Dosis
    frequency = Column(String(100), nullable=False)  # Frecuencia
    duration = Column(String(100), nullable=True)  # Duración del tratamiento
    quantity = Column(String(50), nullable=True)  # Cantidad prescrita
    refills = Column(Integer, default=0, nullable=False)  # Número de repeticiones
    
    # Instrucciones detalladas
    administration_route = Column(String(50), nullable=True)  # Vía de administración
    special_instructions = Column(Text, nullable=True)
    food_instructions = Column(String(255), nullable=True)
    warnings = Column(Text, nullable=True)
    
    # Fechas
    prescribed_date = Column(DateTime, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    
    # Estado
    is_active = Column(Boolean, default=True, nullable=False)
    is_controlled_substance = Column(Boolean, default=False, nullable=False)
    requires_monitoring = Column(Boolean, default=False, nullable=False)
    
    # Información del prescriptor
    prescribing_professional = Column(UUID(as_uuid=True), nullable=False)
    professional_license = Column(String(50), nullable=True)
    
    # Información de farmacia
    pharmacy_instructions = Column(Text, nullable=True)
    substitution_allowed = Column(Boolean, default=True, nullable=False)
    
    # Seguimiento
    adherence_notes = Column(Text, nullable=True)
    side_effects = Column(Text, nullable=True)
    effectiveness_notes = Column(Text, nullable=True)
    
    # Información adicional
    indication = Column(String(255), nullable=True)  # Indicación
    contraindications = Column(Text, nullable=True)
    drug_interactions = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    medical_record = relationship("MedicalRecord", back_populates="prescriptions")
    
    def __repr__(self):
        return f"<Prescription(id={self.id}, medication={self.medication_name}, number={self.prescription_number})>"


class MedicalHistory(Base):
    """
    Modelo para historial médico agregado del paciente
    """
    __tablename__ = 'medical_histories'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), unique=True, nullable=False, index=True)
    
    # Historia familiar
    family_history = Column(JSONB, nullable=True)  # Historia familiar estructurada
    genetic_conditions = Column(ARRAY(String), nullable=True)
    
    # Historia social
    smoking_status = Column(String(50), nullable=True)  # never, former, current
    alcohol_use = Column(String(50), nullable=True)
    drug_use = Column(String(50), nullable=True)
    occupation_history = Column(JSONB, nullable=True)
    travel_history = Column(JSONB, nullable=True)
    
    # Alergias y reacciones adversas
    known_allergies = Column(JSONB, nullable=True)  # Alergias estructuradas
    drug_allergies = Column(JSONB, nullable=True)
    environmental_allergies = Column(JSONB, nullable=True)
    food_allergies = Column(JSONB, nullable=True)
    
    # Condiciones crónicas
    chronic_conditions = Column(JSONB, nullable=True)
    past_surgeries = Column(JSONB, nullable=True)
    past_hospitalizations = Column(JSONB, nullable=True)
    
    # Historia reproductiva (si aplica)
    reproductive_history = Column(JSONB, nullable=True)
    pregnancy_history = Column(JSONB, nullable=True)
    
    # Historial de vacunación
    vaccination_history = Column(JSONB, nullable=True)
    immunization_status = Column(JSONB, nullable=True)
    
    # Resumen de problemas activos
    active_problems = Column(JSONB, nullable=True)
    resolved_problems = Column(JSONB, nullable=True)
    
    # Medicamentos actuales
    current_medications = Column(JSONB, nullable=True)
    medication_allergies = Column(JSONB, nullable=True)
    
    # Datos de emergencia
    emergency_information = Column(JSONB, nullable=True)
    advance_directives = Column(JSONB, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_review_date = Column(Date, nullable=True)
    last_reviewed_by = Column(UUID(as_uuid=True), nullable=True)
    
    def __repr__(self):
        return f"<MedicalHistory(id={self.id}, patient_id={self.patient_id})>"


class AuditLog(Base):
    """
    Modelo para auditoría de acceso a registros médicos
    """
    __tablename__ = 'medical_records_audit'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Información del usuario
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_role = Column(String(50), nullable=False)
    
    # Información del recurso accedido
    resource_type = Column(String(50), nullable=False, index=True)  # medical_record, document, lab_result
    resource_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    patient_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Acción realizada
    action = Column(String(50), nullable=False, index=True)  # view, create, update, delete, download
    action_details = Column(JSONB, nullable=True)
    
    # Resultado
    success = Column(Boolean, nullable=False, default=True)
    error_message = Column(Text, nullable=True)
    
    # Información de contexto
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    session_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Información adicional
    reason = Column(String(255), nullable=True)  # Motivo del acceso
    duration_seconds = Column(Integer, nullable=True)  # Duración del acceso
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, resource_type={self.resource_type})>"
