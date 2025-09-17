"""
SMD Vital - Appointment Service - SQLAlchemy Models
==================================================

Modelos de SQLAlchemy para el servicio de citas médicas.
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, Numeric, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY, ENUM
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime

Base = declarative_base()

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_number = Column(String(20), nullable=False, unique=True, index=True)
    patient_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    professional_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    assigned_by = Column(UUID(as_uuid=True), nullable=True)
    medical_service_id = Column(UUID(as_uuid=True), ForeignKey('medical_services.id'), nullable=False, index=True)
    appointment_type = Column(ENUM('CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'PROCEDURE', 'PREVENTIVE', 'SPECIALIST', 'TELEMEDICINE', name='appointmenttype'), nullable=False)
    priority = Column(ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT', 'EMERGENCY', name='priority'), nullable=False)
    scheduled_date = Column(DateTime, nullable=False, index=True)
    estimated_duration_minutes = Column(Integer, nullable=False)
    actual_start_time = Column(DateTime, nullable=True)
    actual_end_time = Column(DateTime, nullable=True)
    status = Column(ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED', name='appointmentstatus'), nullable=False, index=True)
    previous_status = Column(ENUM('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED', name='appointmentstatus'), nullable=True)
    status_changed_at = Column(DateTime, nullable=True)
    status_changed_by = Column(UUID(as_uuid=True), nullable=True)
    status_change_reason = Column(String(255), nullable=True)
    chief_complaint = Column(Text, nullable=True)
    symptoms = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    special_instructions = Column(Text, nullable=True)
    location_id = Column(UUID(as_uuid=True), ForeignKey('appointment_locations.id'), nullable=True)
    room_number = Column(String(20), nullable=True)
    is_telemedicine = Column(Boolean, nullable=False, default=False)
    telemedicine_link = Column(String(500), nullable=True)
    payment_status = Column(ENUM('PENDING', 'PAID', 'PARTIAL', 'REFUNDED', 'CANCELLED', name='paymentstatus'), nullable=False)
    estimated_cost = Column(Numeric(10, 2), nullable=True)
    final_cost = Column(Numeric(10, 2), nullable=True)
    insurance_covered = Column(Boolean, nullable=False, default=True)
    reminder_sent = Column(Boolean, nullable=False, default=False)
    confirmation_sent = Column(Boolean, nullable=False, default=False)
    follow_up_required = Column(Boolean, nullable=False, default=False)
    follow_up_date = Column(DateTime, nullable=True)
    cancellation_reason = Column(String(255), nullable=True)
    cancelled_by = Column(UUID(as_uuid=True), nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    reschedule_count = Column(Integer, nullable=False, default=0)
    original_appointment_id = Column(UUID(as_uuid=True), nullable=True)
    meta_data = Column(JSONB, nullable=True)
    external_references = Column(JSONB, nullable=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())
    created_by = Column(UUID(as_uuid=True), nullable=False)

    # Relaciones
    medical_service = relationship("MedicalService", foreign_keys=[medical_service_id], back_populates="appointments")
    location = relationship("AppointmentLocation", foreign_keys=[location_id], back_populates="appointments")

    # Índices adicionales
    __table_args__ = (
        Index('ix_appointments_patient_id', 'patient_id'),
        Index('ix_appointments_professional_id', 'professional_id'),
        Index('ix_appointments_scheduled_date', 'scheduled_date'),
        Index('ix_appointments_status', 'status'),
    )

class MedicalService(Base):
    __tablename__ = "medical_services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    code = Column(String(20), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False)
    specialty = Column(String(50), nullable=False)
    department = Column(String(50), nullable=False)
    default_duration_minutes = Column(Integer, nullable=False)
    preparation_time_minutes = Column(Integer, nullable=False)
    cleanup_time_minutes = Column(Integer, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    requires_referral = Column(Boolean, nullable=False, default=False)
    is_emergency_service = Column(Boolean, nullable=False, default=False)
    telemedicine_available = Column(Boolean, nullable=False, default=False)
    base_price = Column(Numeric(10, 2), nullable=True)
    insurance_price = Column(Numeric(10, 2), nullable=True)
    emergency_surcharge = Column(Numeric(10, 2), nullable=True)
    age_restrictions = Column(JSONB, nullable=True)
    gender_restrictions = Column(JSONB, nullable=True)
    special_requirements = Column(JSONB, nullable=True)
    instructions = Column(Text, nullable=True)
    contraindications = Column(Text, nullable=True)
    equipment_needed = Column(JSONB, nullable=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

    # Relaciones
    appointments = relationship("Appointment", back_populates="medical_service")

class AppointmentLocation(Base):
    __tablename__ = "appointment_locations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    code = Column(String(20), nullable=False, unique=True)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state_province = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=False)
    latitude = Column(Numeric(precision=10, scale=8), nullable=True)
    longitude = Column(Numeric(precision=11, scale=8), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    capacity = Column(Integer, nullable=True)
    has_parking = Column(Boolean, nullable=False, default=False)
    is_accessible = Column(Boolean, nullable=False, default=False)
    available_services = Column(ARRAY(String), nullable=True)
    equipment_available = Column(JSONB, nullable=True)
    operating_hours = Column(JSONB, nullable=True)
    holiday_schedule = Column(JSONB, nullable=True)
    description = Column(Text, nullable=True)
    special_instructions = Column(Text, nullable=True)
    parking_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=func.now())
    updated_at = Column(DateTime, nullable=True, onupdate=func.now())

    # Relaciones
    appointments = relationship("Appointment", back_populates="location")
