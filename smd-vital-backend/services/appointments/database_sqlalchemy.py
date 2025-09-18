"""
SMD Vital - Appointment Service - SQLAlchemy Database Operations
================================================================

Operaciones de base de datos usando SQLAlchemy para el servicio de citas médicas.
"""

from sqlalchemy import create_engine, func, and_, or_, select, update, delete
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from typing import Optional, List, Dict, Any
import os
import logging
from datetime import datetime, date
import uuid

from models.sqlalchemy_models import Appointment, MedicalService, AppointmentLocation

logger = logging.getLogger(__name__)

# Configuración de la base de datos
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql+asyncpg://smdvital:smdvital_password_2024@postgres:5432/smdvital_appointments')

class AppointmentDatabase:
    def __init__(self):
        self.engine = None
        self.async_session = None
    
    async def init_engine(self):
        """Inicializar motor de base de datos"""
        if not self.engine:
            self.engine = create_async_engine(DATABASE_URL, echo=False)
            self.async_session = async_sessionmaker(
                self.engine, 
                class_=AsyncSession, 
                expire_on_commit=False
            )
    
    async def close_engine(self):
        """Cerrar motor de base de datos"""
        if self.engine:
            await self.engine.dispose()
    
    async def get_appointments(
        self, 
        skip: int = 0, 
        limit: int = 100,
        patient_id: Optional[uuid.UUID] = None,
        professional_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        appointment_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Obtener lista de citas con filtros"""
        await self.init_engine()
        
        async with self.async_session() as session:
            # Construir query base
            query = select(Appointment)
            count_query = select(func.count(Appointment.id))
            
            # Aplicar filtros
            filters = []
            if patient_id:
                filters.append(Appointment.patient_id == patient_id)
            
            if professional_id:
                filters.append(Appointment.professional_id == professional_id)
            
            if status:
                filters.append(Appointment.status == status)
            
            if appointment_type:
                filters.append(Appointment.appointment_type == appointment_type)
            
            if start_date:
                filters.append(Appointment.scheduled_date >= start_date)
            
            if end_date:
                filters.append(Appointment.scheduled_date <= end_date)
            
            if filters:
                query = query.where(and_(*filters))
                count_query = count_query.where(and_(*filters))
            
            # Contar total
            total = await session.scalar(count_query)
            
            # Aplicar paginación y ordenamiento
            query = query.order_by(Appointment.scheduled_date.desc()).offset(skip).limit(limit)
            
            appointments = await session.execute(query)
            appointments_list = appointments.scalars().all()
            
            return {
                "appointments": [self._appointment_to_dict(apt) for apt in appointments_list],
                "total": total,
                "page": (skip // limit) + 1,
                "size": limit,
                "has_next": len(appointments_list) == limit,
                "has_prev": skip > 0
            }
    
    async def get_appointment_by_id(self, appointment_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        """Obtener cita por ID"""
        await self.init_engine()
        
        async with self.async_session() as session:
            appointment = await session.get(Appointment, appointment_id)
            
            if appointment:
                return self._appointment_to_dict(appointment)
            
            return None
    
    async def create_appointment(self, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crear nueva cita"""
        await self.init_engine()
        
        async with self.async_session() as session:
            # Usar el número de cita que viene en los datos o generar uno si no existe
            appointment_number = appointment_data.get("appointment_number", f"APT-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}")
            
            # Crear objeto de cita
            appointment = Appointment(
                appointment_number=appointment_number,
                patient_id=appointment_data["patient_id"],
                professional_id=appointment_data.get("professional_id"),
                assigned_by=appointment_data.get("assigned_by"),
                medical_service_id=appointment_data["medical_service_id"],
                appointment_type=appointment_data["appointment_type"],
                priority=appointment_data.get("priority", "NORMAL"),
                scheduled_date=appointment_data["scheduled_date"],
                estimated_duration_minutes=appointment_data.get("estimated_duration_minutes", 30),
                status=appointment_data.get("status", "PENDING"),
                chief_complaint=appointment_data.get("chief_complaint"),
                symptoms=appointment_data.get("symptoms"),
                notes=appointment_data.get("notes"),
                special_instructions=appointment_data.get("special_instructions"),
                is_telemedicine=appointment_data.get("is_telemedicine", False),
                telemedicine_link=appointment_data.get("telemedicine_link"),
                payment_status=appointment_data.get("payment_status", "PENDING"),
                estimated_cost=appointment_data.get("estimated_cost"),
                insurance_covered=appointment_data.get("insurance_covered", True),
                reminder_sent=appointment_data.get("reminder_sent", False),
                confirmation_sent=appointment_data.get("confirmation_sent", False),
                follow_up_required=appointment_data.get("follow_up_required", False),
                reschedule_count=appointment_data.get("reschedule_count", 0),
                created_by=appointment_data.get("created_by", appointment_data["patient_id"])
            )
            
            session.add(appointment)
            await session.commit()
            await session.refresh(appointment)
            
            return self._appointment_to_dict(appointment)
    
    async def update_appointment(self, appointment_id: uuid.UUID, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Actualizar cita"""
        await self.init_engine()
        
        async with self.async_session() as session:
            appointment = await session.get(Appointment, appointment_id)
            
            if not appointment:
                return None
            
            # Actualizar campos
            for field, value in update_data.items():
                if hasattr(appointment, field) and value is not None:
                    setattr(appointment, field, value)
            
            appointment.updated_at = datetime.utcnow()
            
            await session.commit()
            await session.refresh(appointment)
            
            return self._appointment_to_dict(appointment)
    
    async def delete_appointment(self, appointment_id: uuid.UUID) -> bool:
        """Eliminar cita"""
        await self.init_engine()
        
        async with self.async_session() as session:
            appointment = await session.get(Appointment, appointment_id)
            
            if not appointment:
                return False
            
            await session.delete(appointment)
            await session.commit()
            
            return True
    
    async def get_appointment_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas de citas"""
        await self.init_engine()
        
        async with self.async_session() as session:
            # Estadísticas generales - consultas separadas para evitar problemas con func.case
            total_appointments = await session.scalar(select(func.count(Appointment.id)))
            
            pending_appointments = await session.scalar(
                select(func.count(Appointment.id)).where(Appointment.status == 'PENDING')
            )
            
            confirmed_appointments = await session.scalar(
                select(func.count(Appointment.id)).where(Appointment.status == 'CONFIRMED')
            )
            
            completed_appointments = await session.scalar(
                select(func.count(Appointment.id)).where(Appointment.status == 'COMPLETED')
            )
            
            cancelled_appointments = await session.scalar(
                select(func.count(Appointment.id)).where(Appointment.status == 'CANCELLED')
            )
            
            today_appointments = await session.scalar(
                select(func.count(Appointment.id)).where(func.date(Appointment.scheduled_date) == func.current_date())
            )
            
            upcoming_appointments = await session.scalar(
                select(func.count(Appointment.id)).where(Appointment.scheduled_date > func.now())
            )
            
            overdue_appointments = await session.scalar(
                select(func.count(Appointment.id)).where(
                    and_(
                        Appointment.scheduled_date < func.now(),
                        Appointment.status.in_(['PENDING', 'CONFIRMED'])
                    )
                )
            )
            
            telemedicine_appointments = await session.scalar(
                select(func.count(Appointment.id)).where(Appointment.is_telemedicine == True)
            )
            
            emergency_appointments = await session.scalar(
                select(func.count(Appointment.id)).where(Appointment.appointment_type == 'EMERGENCY')
            )
            
            return {
                'total_appointments': total_appointments or 0,
                'pending_appointments': pending_appointments or 0,
                'confirmed_appointments': confirmed_appointments or 0,
                'completed_appointments': completed_appointments or 0,
                'cancelled_appointments': cancelled_appointments or 0,
                'today_appointments': today_appointments or 0,
                'upcoming_appointments': upcoming_appointments or 0,
                'overdue_appointments': overdue_appointments or 0,
                'telemedicine_appointments': telemedicine_appointments or 0,
                'emergency_appointments': emergency_appointments or 0
            }
    
    def _appointment_to_dict(self, appointment: Appointment) -> Dict[str, Any]:
        """Convertir objeto Appointment a diccionario"""
        return {
            "id": appointment.id,
            "appointment_number": appointment.appointment_number,
            "patient_id": appointment.patient_id,
            "professional_id": appointment.professional_id,
            "assigned_by": appointment.assigned_by,
            "medical_service_id": appointment.medical_service_id,
            "appointment_type": appointment.appointment_type,
            "priority": appointment.priority,
            "scheduled_date": appointment.scheduled_date,
            "estimated_duration_minutes": appointment.estimated_duration_minutes,
            "actual_start_time": appointment.actual_start_time,
            "actual_end_time": appointment.actual_end_time,
            "status": appointment.status,
            "previous_status": appointment.previous_status,
            "status_changed_at": appointment.status_changed_at,
            "status_changed_by": appointment.status_changed_by,
            "status_change_reason": appointment.status_change_reason,
            "chief_complaint": appointment.chief_complaint,
            "symptoms": appointment.symptoms,
            "notes": appointment.notes,
            "special_instructions": appointment.special_instructions,
            "is_telemedicine": appointment.is_telemedicine,
            "telemedicine_link": appointment.telemedicine_link,
            "payment_status": appointment.payment_status,
            "estimated_cost": float(appointment.estimated_cost) if appointment.estimated_cost else None,
            "final_cost": float(appointment.final_cost) if appointment.final_cost else None,
            "insurance_covered": appointment.insurance_covered,
            "reminder_sent": appointment.reminder_sent,
            "confirmation_sent": appointment.confirmation_sent,
            "follow_up_required": appointment.follow_up_required,
            "follow_up_date": appointment.follow_up_date,
            "cancellation_reason": appointment.cancellation_reason,
            "cancelled_by": appointment.cancelled_by,
            "cancelled_at": appointment.cancelled_at,
            "reschedule_count": appointment.reschedule_count,
            "original_appointment_id": appointment.original_appointment_id,
            "created_at": appointment.created_at,
            "updated_at": appointment.updated_at,
            "created_by": appointment.created_by
        }

# Instancia global
db = AppointmentDatabase()
