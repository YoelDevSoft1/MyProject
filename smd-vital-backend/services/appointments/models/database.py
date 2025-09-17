"""
SMD Vital - Appointment Service Database Models
===============================================

Modelos de base de datos para el servicio de citas médicas.
Incluye citas, disponibilidad, servicios médicos y programación.

Author: Backend Team
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey, Date, Time, Numeric, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from datetime import datetime, date, time
from enum import Enum
import uuid

Base = declarative_base()


class AppointmentStatus(Enum):
    """Estado de la cita"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"
    RESCHEDULED = "rescheduled"


class AppointmentType(Enum):
    """Tipo de cita"""
    CONSULTATION = "consultation"
    FOLLOW_UP = "follow_up"
    EMERGENCY = "emergency"
    PROCEDURE = "procedure"
    PREVENTIVE = "preventive"
    SPECIALIST = "specialist"
    TELEMEDICINE = "telemedicine"


class Priority(Enum):
    """Prioridad de la cita"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"
    EMERGENCY = "emergency"


class AvailabilityStatus(Enum):
    """Estado de disponibilidad"""
    AVAILABLE = "available"
    BUSY = "busy"
    BLOCKED = "blocked"
    HOLIDAY = "holiday"
    SICK_LEAVE = "sick_leave"


class PaymentStatus(Enum):
    """Estado de pago de la cita"""
    PENDING = "pending"
    PAID = "paid"
    PARTIAL = "partial"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class Appointment(Base):
    """
    Modelo principal de citas médicas
    """
    __tablename__ = 'appointments'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_number = Column(String(20), unique=True, nullable=False, index=True)  # Número único para referencia
    
    # Participantes
    patient_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # ID del paciente (user service)
    professional_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # ID del profesional (user service)
    assigned_by = Column(UUID(as_uuid=True), nullable=True)  # Quien asignó el profesional
    
    # Información de la cita
    medical_service_id = Column(UUID(as_uuid=True), ForeignKey('medical_services.id'), nullable=False)
    appointment_type = Column(SQLEnum(AppointmentType), nullable=False)
    priority = Column(SQLEnum(Priority), default=Priority.NORMAL, nullable=False)
    
    # Programación
    scheduled_date = Column(DateTime, nullable=False, index=True)
    estimated_duration_minutes = Column(Integer, default=30, nullable=False)
    actual_start_time = Column(DateTime, nullable=True)
    actual_end_time = Column(DateTime, nullable=True)
    
    # Estado y flujo
    status = Column(SQLEnum(AppointmentStatus), default=AppointmentStatus.PENDING, nullable=False, index=True)
    previous_status = Column(SQLEnum(AppointmentStatus), nullable=True)
    status_changed_at = Column(DateTime, nullable=True)
    status_changed_by = Column(UUID(as_uuid=True), nullable=True)
    status_change_reason = Column(String(255), nullable=True)
    
    # Información clínica
    chief_complaint = Column(Text, nullable=True)  # Motivo principal de consulta
    symptoms = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    special_instructions = Column(Text, nullable=True)
    
    # Información de ubicación
    location_id = Column(UUID(as_uuid=True), ForeignKey('appointment_locations.id'), nullable=True)
    room_number = Column(String(20), nullable=True)
    is_telemedicine = Column(Boolean, default=False, nullable=False)
    telemedicine_link = Column(String(500), nullable=True)
    
    # Información de pago
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    estimated_cost = Column(Numeric(10, 2), nullable=True)
    final_cost = Column(Numeric(10, 2), nullable=True)
    insurance_covered = Column(Boolean, default=False, nullable=False)
    
    # Seguimiento
    reminder_sent = Column(Boolean, default=False, nullable=False)
    confirmation_sent = Column(Boolean, default=False, nullable=False)
    follow_up_required = Column(Boolean, default=False, nullable=False)
    follow_up_date = Column(Date, nullable=True)
    
    # Cancelación/Reprogramación
    cancellation_reason = Column(String(255), nullable=True)
    cancelled_by = Column(UUID(as_uuid=True), nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    reschedule_count = Column(Integer, default=0, nullable=False)
    original_appointment_id = Column(UUID(as_uuid=True), ForeignKey('appointments.id'), nullable=True)
    
    # Información adicional flexible
    meta_data = Column(JSONB, nullable=True)
    external_references = Column(JSONB, nullable=True)  # Referencias a sistemas externos
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    
    # Relaciones
    medical_service = relationship("MedicalService", back_populates="appointments")
    location = relationship("AppointmentLocation", back_populates="appointments")
    reschedules = relationship("AppointmentReschedule", back_populates="appointment", cascade="all, delete-orphan")
    attachments = relationship("AppointmentAttachment", back_populates="appointment", cascade="all, delete-orphan")
    # Auto-relación para citas reprogramadas
    original_appointment = relationship("Appointment", remote_side=[id])
    
    def __repr__(self):
        return f"<Appointment(id={self.id}, number={self.appointment_number}, status={self.status})>"

    @property
    def actual_duration_minutes(self):
        """Duración real de la cita en minutos"""
        if self.actual_start_time and self.actual_end_time:
            delta = self.actual_end_time - self.actual_start_time
            return int(delta.total_seconds() / 60)
        return None

    @property
    def is_overdue(self):
        """Verificar si la cita está retrasada"""
        if self.status in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED]:
            return False
        return datetime.utcnow() > self.scheduled_date


class MedicalService(Base):
    """
    Modelo para servicios médicos disponibles
    """
    __tablename__ = 'medical_services'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    code = Column(String(20), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Categorización
    category = Column(String(100), nullable=False, index=True)  # Medicina General, Especialidades, etc.
    specialty = Column(String(100), nullable=True, index=True)
    department = Column(String(100), nullable=True)
    
    # Configuración del servicio
    default_duration_minutes = Column(Integer, default=30, nullable=False)
    preparation_time_minutes = Column(Integer, default=0, nullable=False)
    cleanup_time_minutes = Column(Integer, default=0, nullable=False)
    
    # Disponibilidad
    is_active = Column(Boolean, default=True, nullable=False)
    requires_referral = Column(Boolean, default=False, nullable=False)
    is_emergency_service = Column(Boolean, default=False, nullable=False)
    telemedicine_available = Column(Boolean, default=False, nullable=False)
    
    # Precios
    base_price = Column(Numeric(10, 2), nullable=True)
    insurance_price = Column(Numeric(10, 2), nullable=True)
    emergency_surcharge = Column(Numeric(10, 2), nullable=True)
    
    # Requisitos
    age_restrictions = Column(JSONB, nullable=True)  # {"min_age": 18, "max_age": 65}
    gender_restrictions = Column(String(20), nullable=True)
    special_requirements = Column(Text, nullable=True)
    
    # Información adicional
    instructions = Column(Text, nullable=True)
    contraindications = Column(Text, nullable=True)
    equipment_needed = Column(ARRAY(String), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    appointments = relationship("Appointment", back_populates="medical_service")
    professional_services = relationship("ProfessionalService", back_populates="medical_service", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<MedicalService(id={self.id}, name={self.name}, category={self.category})>"

    @property
    def total_duration_minutes(self):
        """Duración total incluyendo preparación y limpieza"""
        return self.default_duration_minutes + self.preparation_time_minutes + self.cleanup_time_minutes


class ProfessionalService(Base):
    """
    Modelo para asociar profesionales con servicios médicos
    """
    __tablename__ = 'professional_services'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # ID del profesional (user service)
    medical_service_id = Column(UUID(as_uuid=True), ForeignKey('medical_services.id'), nullable=False)
    
    # Configuración específica del profesional
    custom_duration_minutes = Column(Integer, nullable=True)  # Duración personalizada
    custom_price = Column(Numeric(10, 2), nullable=True)  # Precio personalizado
    
    # Competencias
    proficiency_level = Column(Integer, default=1, nullable=False)  # 1-5, donde 5 es experto
    certification_required = Column(Boolean, default=False, nullable=False)
    certification_details = Column(JSONB, nullable=True)
    
    # Disponibilidad
    is_active = Column(Boolean, default=True, nullable=False)
    can_handle_emergency = Column(Boolean, default=False, nullable=False)
    max_daily_appointments = Column(Integer, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    medical_service = relationship("MedicalService", back_populates="professional_services")
    
    def __repr__(self):
        return f"<ProfessionalService(id={self.id}, professional_id={self.professional_id}, proficiency={self.proficiency_level})>"


class ProfessionalAvailability(Base):
    """
    Modelo para disponibilidad de profesionales
    """
    __tablename__ = 'professional_availability'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Período de disponibilidad
    date = Column(Date, nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    
    # Estado
    status = Column(SQLEnum(AvailabilityStatus), default=AvailabilityStatus.AVAILABLE, nullable=False)
    
    # Configuración
    is_recurring = Column(Boolean, default=False, nullable=False)  # Si se repite semanalmente
    day_of_week = Column(Integer, nullable=True)  # 0=Lunes, 6=Domingo
    
    # Información adicional
    location_id = Column(UUID(as_uuid=True), ForeignKey('appointment_locations.id'), nullable=True)
    notes = Column(Text, nullable=True)
    reason = Column(String(255), nullable=True)  # Para bloqueos/ausencias
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    
    # Relaciones
    location = relationship("AppointmentLocation")
    
    def __repr__(self):
        return f"<ProfessionalAvailability(id={self.id}, date={self.date}, status={self.status})>"


class AppointmentLocation(Base):
    """
    Modelo para ubicaciones donde se realizan las citas
    """
    __tablename__ = 'appointment_locations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    code = Column(String(20), unique=True, nullable=False, index=True)
    
    # Información de ubicación
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state_province = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), default='Colombia', nullable=False)
    
    # Coordenadas
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    
    # Información de contacto
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    
    # Configuración
    is_active = Column(Boolean, default=True, nullable=False)
    capacity = Column(Integer, nullable=True)  # Número máximo de citas simultáneas
    has_parking = Column(Boolean, default=False, nullable=False)
    is_accessible = Column(Boolean, default=True, nullable=False)  # Accesible para discapacitados
    
    # Servicios disponibles
    available_services = Column(ARRAY(String), nullable=True)
    equipment_available = Column(JSONB, nullable=True)
    
    # Horarios
    operating_hours = Column(JSONB, nullable=True)  # Horarios por día de la semana
    holiday_schedule = Column(JSONB, nullable=True)
    
    # Información adicional
    description = Column(Text, nullable=True)
    special_instructions = Column(Text, nullable=True)
    parking_instructions = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    appointments = relationship("Appointment", back_populates="location")
    
    def __repr__(self):
        return f"<AppointmentLocation(id={self.id}, name={self.name}, city={self.city})>"


class AppointmentReschedule(Base):
    """
    Modelo para registro de reprogramaciones de citas
    """
    __tablename__ = 'appointment_reschedules'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey('appointments.id'), nullable=False, index=True)
    
    # Información de la reprogramación
    original_date = Column(DateTime, nullable=False)
    new_date = Column(DateTime, nullable=False)
    reason = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Quien realizó la reprogramación
    rescheduled_by = Column(UUID(as_uuid=True), nullable=False)
    reschedule_type = Column(String(50), nullable=False)  # patient, professional, admin, system
    
    # Información adicional
    notification_sent = Column(Boolean, default=False, nullable=False)
    confirmation_required = Column(Boolean, default=False, nullable=False)
    confirmed_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    appointment = relationship("Appointment", back_populates="reschedules")
    
    def __repr__(self):
        return f"<AppointmentReschedule(id={self.id}, original={self.original_date}, new={self.new_date})>"


class AppointmentAttachment(Base):
    """
    Modelo para archivos adjuntos a las citas
    """
    __tablename__ = 'appointment_attachments'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(UUID(as_uuid=True), ForeignKey('appointments.id'), nullable=False, index=True)
    
    # Información del archivo
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    
    # Categorización
    attachment_type = Column(String(50), nullable=False)  # referral, test_result, prescription, etc.
    description = Column(String(255), nullable=True)
    
    # Seguridad
    is_encrypted = Column(Boolean, default=False, nullable=False)
    access_level = Column(String(20), default='private', nullable=False)  # private, professional, public
    
    # Timestamps
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), nullable=False)
    
    # Relaciones
    appointment = relationship("Appointment", back_populates="attachments")
    
    def __repr__(self):
        return f"<AppointmentAttachment(id={self.id}, filename={self.filename}, type={self.attachment_type})>"


class AppointmentStatistics(Base):
    """
    Modelo para estadísticas de citas (agregadas diariamente)
    """
    __tablename__ = 'appointment_statistics'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date = Column(Date, nullable=False, index=True)
    
    # Estadísticas generales
    total_appointments = Column(Integer, default=0, nullable=False)
    completed_appointments = Column(Integer, default=0, nullable=False)
    cancelled_appointments = Column(Integer, default=0, nullable=False)
    no_show_appointments = Column(Integer, default=0, nullable=False)
    rescheduled_appointments = Column(Integer, default=0, nullable=False)
    
    # Estadísticas por tipo
    emergency_appointments = Column(Integer, default=0, nullable=False)
    telemedicine_appointments = Column(Integer, default=0, nullable=False)
    walk_in_appointments = Column(Integer, default=0, nullable=False)
    
    # Métricas de tiempo
    average_wait_time_minutes = Column(Numeric(8, 2), nullable=True)
    average_duration_minutes = Column(Numeric(8, 2), nullable=True)
    utilization_rate = Column(Numeric(5, 2), nullable=True)  # Porcentaje de uso de capacidad
    
    # Información por ubicación/profesional (opcional)
    location_id = Column(UUID(as_uuid=True), ForeignKey('appointment_locations.id'), nullable=True)
    professional_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<AppointmentStatistics(id={self.id}, date={self.date}, total={self.total_appointments})>"
