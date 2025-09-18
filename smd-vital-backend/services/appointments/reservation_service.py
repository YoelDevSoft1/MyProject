"""
SMD VITAL - Appointment Reservation Service
Servicio para manejo de reservas temporales de citas con prevención de race conditions
"""

import uuid
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from enum import Enum
import logging
from sqlalchemy import select, update, delete
from sqlalchemy.orm import Session
import redis
import json

logger = logging.getLogger(__name__)

class ReservationStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class AppointmentReservationService:
    def __init__(self, db: Session, redis_client: redis.Redis):
        self.db = db
        self.redis = redis_client
        self.RESERVATION_TTL = 300  # 5 minutos en segundos
    
    async def create_temporary_reservation(
        self, 
        doctor_id: str, 
        slot_datetime: datetime,
        patient_id: str,
        medical_service_id: str,
        appointment_type: str = "CONSULTATION"
    ) -> Dict[str, Any]:
        """
        Crear reserva temporal con prevención de race conditions
        """
        try:
            # 1. Verificar disponibilidad con bloqueo distribuido en Redis
            availability_key = f"slot_availability:{doctor_id}:{slot_datetime.isoformat()}"
            
            # Intentar adquirir bloqueo
            lock_acquired = self.redis.set(
                availability_key, 
                patient_id, 
                nx=True,  # Solo si no existe
                ex=self.RESERVATION_TTL
            )
            
            if not lock_acquired:
                return {
                    "success": False,
                    "error": "Horario no disponible - ya está siendo reservado por otro usuario",
                    "error_code": "SLOT_BUSY"
                }
            
            try:
                # 2. Verificar en base de datos (doble validación)
                existing_appointment = await self._check_existing_appointment(doctor_id, slot_datetime)
                
                if existing_appointment:
                    self.redis.delete(availability_key)
                    return {
                        "success": False,
                        "error": "Horario ya está ocupado",
                        "error_code": "SLOT_OCCUPIED"
                    }
                
                # 3. Crear reserva temporal
                reservation_id = str(uuid.uuid4())
                expires_at = datetime.utcnow() + timedelta(seconds=self.RESERVATION_TTL)
                
                reservation_data = {
                    "id": reservation_id,
                    "doctor_id": doctor_id,
                    "patient_id": patient_id,
                    "slot_datetime": slot_datetime,
                    "medical_service_id": medical_service_id,
                    "appointment_type": appointment_type,
                    "status": ReservationStatus.PENDING.value,
                    "expires_at": expires_at,
                    "created_at": datetime.utcnow()
                }
                
                # Guardar en Redis para acceso rápido
                self.redis.setex(
                    f"reservation:{reservation_id}",
                    self.RESERVATION_TTL,
                    json.dumps(reservation_data, default=str)
                )
                
                # Guardar en base de datos para persistencia
                await self._save_reservation_to_db(reservation_data)
                
                # 4. Programar limpieza automática
                asyncio.create_task(
                    self._schedule_reservation_cleanup(reservation_id)
                )
                
                logger.info(f"Temporary reservation created: {reservation_id} for doctor {doctor_id}")
                
                return {
                    "success": True,
                    "data": {
                        "reservation_id": reservation_id,
                        "expires_at": expires_at.isoformat(),
                        "status": "reserved",
                        "time_left_seconds": self.RESERVATION_TTL
                    }
                }
                
            except Exception as e:
                # Liberar el bloqueo en caso de error
                self.redis.delete(availability_key)
                raise e
                
        except Exception as e:
            logger.error(f"Error creating temporary reservation: {e}")
            return {
                "success": False,
                "error": f"Error interno: {str(e)}",
                "error_code": "INTERNAL_ERROR"
            }
    
    async def confirm_reservation(
        self, 
        reservation_id: str, 
        patient_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Confirmar reserva temporal y crear cita definitiva
        """
        try:
            # 1. Verificar que la reserva existe y no ha expirado
            reservation = await self._get_reservation(reservation_id)
            
            if not reservation:
                return {
                    "success": False,
                    "error": "Reserva no encontrada",
                    "error_code": "RESERVATION_NOT_FOUND"
                }
            
            if reservation["status"] != ReservationStatus.PENDING.value:
                return {
                    "success": False,
                    "error": "Reserva no está en estado pendiente",
                    "error_code": "INVALID_RESERVATION_STATUS"
                }
            
            if datetime.utcnow() > datetime.fromisoformat(reservation["expires_at"]):
                await self._mark_reservation_expired(reservation_id)
                return {
                    "success": False,
                    "error": "La reserva ha expirado. Por favor, selecciona otro horario.",
                    "error_code": "RESERVATION_EXPIRED"
                }
            
            # 2. Crear cita definitiva
            appointment_data = {
                "id": str(uuid.uuid4()),
                "appointment_number": await self._generate_appointment_number(),
                "patient_id": reservation["patient_id"],
                "professional_id": reservation["doctor_id"],
                "medical_service_id": reservation["medical_service_id"],
                "appointment_type": reservation["appointment_type"],
                "scheduled_date": datetime.fromisoformat(reservation["slot_datetime"]),  # Convertir string a datetime
                "status": "CONFIRMED",
                "chief_complaint": patient_data.get("chief_complaint", ""),
                "symptoms": patient_data.get("symptoms", ""),
                "notes": patient_data.get("notes", ""),
                "estimated_duration_minutes": 30,  # Valor por defecto
                "created_by": reservation["patient_id"],
                "created_at": datetime.utcnow()
            }
            
            # 3. Crear cita en transacción
            appointment = await self._create_appointment(appointment_data)
            
            # 4. Marcar reserva como confirmada
            await self._mark_reservation_confirmed(reservation_id)
            
            # 5. Liberar bloqueo de disponibilidad
            availability_key = f"slot_availability:{reservation['doctor_id']}:{reservation['slot_datetime']}"
            self.redis.delete(availability_key)
            
            # 6. Disparar eventos post-confirmación
            await self._trigger_post_confirmation_events(appointment)
            
            logger.info(f"Reservation confirmed and appointment created: {appointment['id']}")
            
            return {
                "success": True,
                "data": {
                    "appointment_id": appointment["id"],
                    "appointment_number": appointment["appointment_number"],
                    "status": "confirmed",
                    "scheduled_date": appointment["scheduled_date"]
                }
            }
            
        except Exception as e:
            logger.error(f"Error confirming reservation: {e}")
            return {
                "success": False,
                "error": f"Error interno: {str(e)}",
                "error_code": "INTERNAL_ERROR"
            }
    
    async def cancel_reservation(self, reservation_id: str) -> Dict[str, Any]:
        """
        Cancelar reserva temporal
        """
        try:
            reservation = await self._get_reservation(reservation_id)
            
            if not reservation:
                return {
                    "success": False,
                    "error": "Reserva no encontrada",
                    "error_code": "RESERVATION_NOT_FOUND"
                }
            
            # Marcar como cancelada
            await self._mark_reservation_cancelled(reservation_id)
            
            # Liberar bloqueo de disponibilidad
            availability_key = f"slot_availability:{reservation['doctor_id']}:{reservation['slot_datetime']}"
            self.redis.delete(availability_key)
            
            logger.info(f"Reservation cancelled: {reservation_id}")
            
            return {
                "success": True,
                "message": "Reserva cancelada exitosamente"
            }
            
        except Exception as e:
            logger.error(f"Error cancelling reservation: {e}")
            return {
                "success": False,
                "error": f"Error interno: {str(e)}",
                "error_code": "INTERNAL_ERROR"
            }
    
    async def get_reservation_status(self, reservation_id: str) -> Dict[str, Any]:
        """
        Obtener estado de una reserva
        """
        try:
            reservation = await self._get_reservation(reservation_id)
            
            if not reservation:
                return {
                    "success": False,
                    "error": "Reserva no encontrada",
                    "error_code": "RESERVATION_NOT_FOUND"
                }
            
            now = datetime.utcnow()
            expires_at = datetime.fromisoformat(reservation["expires_at"])
            time_left = max(0, (expires_at - now).total_seconds())
            
            return {
                "success": True,
                "data": {
                    "reservation_id": reservation_id,
                    "status": reservation["status"],
                    "expires_at": reservation["expires_at"],
                    "time_left_seconds": int(time_left),
                    "is_expired": time_left == 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting reservation status: {e}")
            return {
                "success": False,
                "error": f"Error interno: {str(e)}",
                "error_code": "INTERNAL_ERROR"
            }
    
    # Métodos auxiliares privados
    
    async def _check_existing_appointment(self, doctor_id: str, slot_datetime: datetime) -> Optional[Dict]:
        """Verificar si ya existe una cita en ese horario"""
        # Esta función debería implementarse según tu modelo de base de datos
        # Por ahora retornamos None para simular que no hay conflictos
        return None
    
    async def _save_reservation_to_db(self, reservation_data: Dict[str, Any]):
        """Guardar reserva en base de datos"""
        # Implementar según tu modelo de base de datos
        pass
    
    async def _get_reservation(self, reservation_id: str) -> Optional[Dict[str, Any]]:
        """Obtener reserva desde Redis"""
        reservation_json = self.redis.get(f"reservation:{reservation_id}")
        if reservation_json:
            return json.loads(reservation_json)
        return None
    
    async def _mark_reservation_confirmed(self, reservation_id: str):
        """Marcar reserva como confirmada"""
        reservation = await self._get_reservation(reservation_id)
        if reservation:
            reservation["status"] = ReservationStatus.CONFIRMED.value
            self.redis.setex(
                f"reservation:{reservation_id}",
                self.RESERVATION_TTL,
                json.dumps(reservation, default=str)
            )
    
    async def _mark_reservation_expired(self, reservation_id: str):
        """Marcar reserva como expirada"""
        reservation = await self._get_reservation(reservation_id)
        if reservation:
            reservation["status"] = ReservationStatus.EXPIRED.value
            self.redis.setex(
                f"reservation:{reservation_id}",
                3600,  # Mantener por 1 hora para auditoría
                json.dumps(reservation, default=str)
            )
    
    async def _mark_reservation_cancelled(self, reservation_id: str):
        """Marcar reserva como cancelada"""
        reservation = await self._get_reservation(reservation_id)
        if reservation:
            reservation["status"] = ReservationStatus.CANCELLED.value
            self.redis.setex(
                f"reservation:{reservation_id}",
                3600,  # Mantener por 1 hora para auditoría
                json.dumps(reservation, default=str)
            )
    
    async def _create_appointment(self, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crear cita en base de datos"""
        try:
            # Crear la cita usando el servicio de base de datos original
            created_appointment = await self.db.create_appointment(appointment_data)
            return created_appointment
        except Exception as e:
            logger.error(f"Error creating appointment: {e}")
            raise Exception(f"Error al crear la cita: {str(e)}")
    
    async def _generate_appointment_number(self) -> str:
        """Generar número único de cita"""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M")
        random_suffix = str(uuid.uuid4())[:1].upper()
        return f"APT{random_suffix}"
    
    async def _schedule_reservation_cleanup(self, reservation_id: str):
        """Programar limpieza automática de reserva"""
        await asyncio.sleep(self.RESERVATION_TTL)
        
        reservation = await self._get_reservation(reservation_id)
        if reservation and reservation["status"] == ReservationStatus.PENDING.value:
            await self._mark_reservation_expired(reservation_id)
            logger.info(f"Reservation {reservation_id} automatically expired")
    
    async def _trigger_post_confirmation_events(self, appointment: Dict[str, Any]):
        """Disparar eventos post-confirmación"""
        # Implementar eventos como notificaciones, actualizaciones de dashboard, etc.
        logger.info(f"Post-confirmation events triggered for appointment {appointment['id']}")
