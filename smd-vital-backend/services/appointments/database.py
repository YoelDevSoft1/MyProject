"""
SMD Vital - Appointment Service - Database Operations
====================================================

Operaciones de base de datos para el servicio de citas médicas.
"""

import asyncpg
import uuid
from datetime import datetime, date
from typing import Optional, List, Dict, Any
import os
import logging

logger = logging.getLogger(__name__)

# Configuración de la base de datos
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql+asyncpg://smdvital:smdvital_password_2024@postgres:5432/smdvital_appointments')

class AppointmentDatabase:
    def __init__(self):
        self.pool = None
    
    async def init_pool(self):
        """Inicializar pool de conexiones"""
        if not self.pool:
            # Extraer información de conexión de la URL
            parts = DATABASE_URL.replace('postgresql+asyncpg://', '').split('@')
            user_pass = parts[0].split(':')
            host_db = parts[1].split('/')
            host_port = host_db[0].split(':')
            
            user = user_pass[0]
            password = user_pass[1]
            host = host_port[0]
            port = int(host_port[1]) if len(host_port) > 1 else 5432
            database = host_db[1]
            
            self.pool = await asyncpg.create_pool(
                user=user,
                password=password,
                host=host,
                port=port,
                database=database,
                min_size=1,
                max_size=10
            )
    
    async def close_pool(self):
        """Cerrar pool de conexiones"""
        if self.pool:
            await self.pool.close()
    
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
        await self.init_pool()
        
        async with self.pool.acquire() as conn:
            # Construir query base
            where_conditions = []
            params = []
            param_count = 0
            
            if patient_id:
                param_count += 1
                where_conditions.append(f"patient_id = ${param_count}")
                params.append(patient_id)
            
            if professional_id:
                param_count += 1
                where_conditions.append(f"professional_id = ${param_count}")
                params.append(professional_id)
            
            if status:
                param_count += 1
                where_conditions.append(f"status = ${param_count}")
                params.append(status)
            
            if appointment_type:
                param_count += 1
                where_conditions.append(f"appointment_type = ${param_count}")
                params.append(appointment_type)
            
            if start_date:
                param_count += 1
                where_conditions.append(f"scheduled_date >= ${param_count}")
                params.append(start_date)
            
            if end_date:
                param_count += 1
                where_conditions.append(f"scheduled_date <= ${param_count}")
                params.append(end_date)
            
            where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
            
            # Query para obtener citas
            query = f"""
                SELECT * FROM appointments 
                WHERE {where_clause}
                ORDER BY scheduled_date DESC
                LIMIT ${param_count + 1} OFFSET ${param_count + 2}
            """
            params.extend([limit, skip])
            
            appointments = await conn.fetch(query, *params)
            
            # Query para contar total
            count_query = f"""
                SELECT COUNT(*) FROM appointments 
                WHERE {where_clause}
            """
            total = await conn.fetchval(count_query, *params[:-2])
            
            return {
                "appointments": [dict(appointment) for appointment in appointments],
                "total": total,
                "page": (skip // limit) + 1,
                "size": limit,
                "has_next": len(appointments) == limit,
                "has_prev": skip > 0
            }
    
    async def get_appointment_by_id(self, appointment_id: uuid.UUID) -> Optional[Dict[str, Any]]:
        """Obtener cita por ID"""
        await self.init_pool()
        
        async with self.pool.acquire() as conn:
            appointment = await conn.fetchrow(
                "SELECT * FROM appointments WHERE id = $1", 
                appointment_id
            )
            
            if appointment:
                return dict(appointment)
            
            return None
    
    async def create_appointment(self, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crear nueva cita"""
        await self.init_pool()
        
        appointment_id = uuid.uuid4()
        
        async with self.pool.acquire() as conn:
            # Generar número de cita
            appointment_number = f"APT-{datetime.now().strftime('%Y%m%d')}-{str(appointment_id)[:8].upper()}"
            
            # Insertar cita
            await conn.execute("""
                INSERT INTO appointments (
                    id, appointment_number, patient_id, professional_id, assigned_by,
                    medical_service_id, appointment_type, priority, scheduled_date,
                    estimated_duration_minutes, status, chief_complaint, symptoms,
                    notes, special_instructions, is_telemedicine, telemedicine_link,
                    payment_status, estimated_cost, insurance_covered, reminder_sent,
                    confirmation_sent, follow_up_required, reschedule_count,
                    created_at, updated_at, created_by
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
                )
            """, 
                appointment_id,
                appointment_number,
                appointment_data["patient_id"],
                appointment_data.get("professional_id"),
                appointment_data.get("assigned_by"),
                appointment_data["medical_service_id"],
                appointment_data["appointment_type"],
                appointment_data.get("priority", "NORMAL"),
                appointment_data["scheduled_date"],
                appointment_data.get("estimated_duration_minutes", 30),
                appointment_data.get("status", "PENDING"),
                appointment_data.get("chief_complaint"),
                appointment_data.get("symptoms"),
                appointment_data.get("notes"),
                appointment_data.get("special_instructions"),
                appointment_data.get("is_telemedicine", False),
                appointment_data.get("telemedicine_link"),
                appointment_data.get("payment_status", "PENDING"),
                appointment_data.get("estimated_cost"),
                appointment_data.get("insurance_covered", True),
                appointment_data.get("reminder_sent", False),
                appointment_data.get("confirmation_sent", False),
                appointment_data.get("follow_up_required", False),
                appointment_data.get("reschedule_count", 0),
                datetime.utcnow(),
                datetime.utcnow(),
                appointment_data.get("created_by", appointment_data["patient_id"])
            )
            
            # Obtener la cita creada
            appointment = await conn.fetchrow(
                "SELECT * FROM appointments WHERE id = $1", 
                appointment_id
            )
            
            return dict(appointment)
    
    async def update_appointment(self, appointment_id: uuid.UUID, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Actualizar cita"""
        await self.init_pool()
        
        async with self.pool.acquire() as conn:
            # Construir query de actualización
            set_clauses = []
            params = []
            param_count = 0
            
            for field, value in update_data.items():
                if value is not None:
                    param_count += 1
                    set_clauses.append(f"{field} = ${param_count}")
                    params.append(value)
            
            if not set_clauses:
                return None
            
            param_count += 1
            set_clauses.append(f"updated_at = ${param_count}")
            params.append(datetime.utcnow())
            
            param_count += 1
            params.append(appointment_id)
            
            query = f"""
                UPDATE appointments 
                SET {', '.join(set_clauses)}
                WHERE id = ${param_count}
                RETURNING *
            """
            
            appointment = await conn.fetchrow(query, *params)
            
            if appointment:
                return dict(appointment)
            
            return None
    
    async def delete_appointment(self, appointment_id: uuid.UUID) -> bool:
        """Eliminar cita"""
        await self.init_pool()
        
        async with self.pool.acquire() as conn:
            result = await conn.execute(
                "DELETE FROM appointments WHERE id = $1", 
                appointment_id
            )
            
            return result == "DELETE 1"
    
    async def get_appointment_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas de citas"""
        await self.init_pool()
        
        async with self.pool.acquire() as conn:
            # Estadísticas generales
            stats = await conn.fetchrow("""
                SELECT 
                    COUNT(*) as total_appointments,
                    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_appointments,
                    COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_appointments,
                    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_appointments,
                    COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_appointments,
                    COUNT(CASE WHEN DATE(scheduled_date) = CURRENT_DATE THEN 1 END) as today_appointments,
                    COUNT(CASE WHEN scheduled_date > NOW() THEN 1 END) as upcoming_appointments,
                    COUNT(CASE WHEN scheduled_date < NOW() AND status IN ('PENDING', 'CONFIRMED') THEN 1 END) as overdue_appointments,
                    COUNT(CASE WHEN is_telemedicine = true THEN 1 END) as telemedicine_appointments,
                    COUNT(CASE WHEN appointment_type = 'EMERGENCY' THEN 1 END) as emergency_appointments
                FROM appointments
            """)
            
            return dict(stats)

# Instancia global
db = AppointmentDatabase()

