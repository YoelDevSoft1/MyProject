"""
SMD Vital - Appointment Service - Models
========================================

Modelos de datos para el servicio de citas médicas.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class AppointmentType(str, Enum):
    CONSULTATION = "CONSULTATION"
    FOLLOW_UP = "FOLLOW_UP"
    EMERGENCY = "EMERGENCY"
    PROCEDURE = "PROCEDURE"
    PREVENTIVE = "PREVENTIVE"
    SPECIALIST = "SPECIALIST"
    TELEMEDICINE = "TELEMEDICINE"

class AppointmentStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"
    RESCHEDULED = "RESCHEDULED"

class Priority(str, Enum):
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"
    EMERGENCY = "EMERGENCY"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    PARTIAL = "PARTIAL"
    REFUNDED = "REFUNDED"
    CANCELLED = "CANCELLED"

class AppointmentBase(BaseModel):
    patient_id: uuid.UUID
    professional_id: Optional[uuid.UUID] = None
    medical_service_id: uuid.UUID
    appointment_type: AppointmentType
    priority: Priority = Priority.NORMAL
    scheduled_date: datetime
    estimated_duration_minutes: int = 30
    chief_complaint: Optional[str] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    special_instructions: Optional[str] = None
    is_telemedicine: bool = False
    telemedicine_link: Optional[str] = None
    insurance_covered: bool = True
    follow_up_required: bool = False
    follow_up_date: Optional[datetime] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    professional_id: Optional[uuid.UUID] = None
    appointment_type: Optional[AppointmentType] = None
    priority: Optional[Priority] = None
    scheduled_date: Optional[datetime] = None
    estimated_duration_minutes: Optional[int] = None
    status: Optional[AppointmentStatus] = None
    chief_complaint: Optional[str] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    special_instructions: Optional[str] = None
    is_telemedicine: Optional[bool] = None
    telemedicine_link: Optional[str] = None
    insurance_covered: Optional[bool] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[datetime] = None
    status_change_reason: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: uuid.UUID
    appointment_number: str
    patient_id: uuid.UUID
    professional_id: Optional[uuid.UUID] = None
    assigned_by: Optional[uuid.UUID] = None
    medical_service_id: uuid.UUID
    appointment_type: AppointmentType
    priority: Priority
    scheduled_date: datetime
    estimated_duration_minutes: int
    actual_start_time: Optional[datetime] = None
    actual_end_time: Optional[datetime] = None
    status: AppointmentStatus
    previous_status: Optional[AppointmentStatus] = None
    status_changed_at: Optional[datetime] = None
    status_changed_by: Optional[uuid.UUID] = None
    status_change_reason: Optional[str] = None
    chief_complaint: Optional[str] = None
    symptoms: Optional[str] = None
    notes: Optional[str] = None
    special_instructions: Optional[str] = None
    is_telemedicine: bool
    telemedicine_link: Optional[str] = None
    payment_status: PaymentStatus
    estimated_cost: Optional[float] = None
    final_cost: Optional[float] = None
    insurance_covered: bool
    reminder_sent: bool
    confirmation_sent: bool
    follow_up_required: bool
    follow_up_date: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    cancelled_by: Optional[uuid.UUID] = None
    cancelled_at: Optional[datetime] = None
    reschedule_count: int
    original_appointment_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: uuid.UUID

    class Config:
        from_attributes = True

class AppointmentListResponse(BaseModel):
    appointments: List[AppointmentResponse]
    total: int
    page: int
    size: int
    has_next: bool
    has_prev: bool

class AppointmentStatsResponse(BaseModel):
    total_appointments: int
    pending_appointments: int
    confirmed_appointments: int
    completed_appointments: int
    cancelled_appointments: int
    today_appointments: int
    upcoming_appointments: int
    overdue_appointments: int
    telemedicine_appointments: int
    emergency_appointments: int
