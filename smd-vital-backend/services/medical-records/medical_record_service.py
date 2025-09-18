"""
SMD VITAL - Medical Record Service
Servicio para manejo de registros médicos electrónicos (EHR)
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import json
import logging

logger = logging.getLogger(__name__)

class RecordType(Enum):
    CONSULTATION = "consultation"
    PRESCRIPTION = "prescription"
    LAB_RESULT = "lab_result"
    DIAGNOSIS = "diagnosis"
    FOLLOW_UP = "follow_up"

class RecordStatus(Enum):
    ACTIVE = "active"
    AMENDED = "amended"
    VOIDED = "voided"

@dataclass
class MedicalRecord:
    id: str
    patient_id: str
    doctor_id: str
    appointment_id: str
    record_type: str
    version: int
    clinical_data: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    created_by: str
    last_modified_by: str
    status: str

@dataclass
class ConsultationData:
    chief_complaint: str
    history_present_illness: str
    physical_examination: Dict[str, Any]
    assessment: str
    plan: str
    prescriptions: List[Dict[str, Any]]
    follow_up: Optional[Dict[str, Any]] = None

class MedicalRecordService:
    def __init__(self, db, redis_client=None):
        self.db = db
        self.redis = redis_client
        self.cache_ttl = 3600  # 1 hora
    
    async def create_medical_record(
        self, 
        patient_id: str,
        doctor_id: str,
        appointment_id: str,
        record_type: RecordType,
        clinical_data: Dict[str, Any],
        created_by: str
    ) -> MedicalRecord:
        """
        Crear un nuevo registro médico inmutable
        """
        try:
            record_id = str(uuid.uuid4())
            now = datetime.utcnow()
            
            # Validar datos clínicos según el tipo de registro
            validated_data = self._validate_clinical_data(record_type, clinical_data)
            
            # Crear registro en la base de datos
            query = """
                INSERT INTO medical_records (
                    id, patient_id, doctor_id, appointment_id, record_type,
                    version, clinical_data, created_at, updated_at,
                    created_by, last_modified_by, status
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                ) RETURNING *
            """
            
            values = (
                record_id, patient_id, doctor_id, appointment_id,
                record_type.value, 1, json.dumps(validated_data),
                now, now, created_by, created_by, RecordStatus.ACTIVE.value
            )
            
            result = await self.db.fetch_one(query, values)
            
            if result:
                # Invalidar caché del paciente
                await self._invalidate_patient_cache(patient_id)
                
                # Crear objeto MedicalRecord
                record = MedicalRecord(
                    id=result['id'],
                    patient_id=result['patient_id'],
                    doctor_id=result['doctor_id'],
                    appointment_id=result['appointment_id'],
                    record_type=result['record_type'],
                    version=result['version'],
                    clinical_data=json.loads(result['clinical_data']),
                    created_at=result['created_at'],
                    updated_at=result['updated_at'],
                    created_by=result['created_by'],
                    last_modified_by=result['last_modified_by'],
                    status=result['status']
                )
                
                logger.info(f"Medical record created: {record_id} for patient {patient_id}")
                return record
            else:
                raise Exception("Failed to create medical record")
                
        except Exception as e:
            logger.error(f"Error creating medical record: {e}")
            raise
    
    async def get_patient_medical_history(
        self, 
        patient_id: str, 
        limit: int = 50,
        record_type: Optional[RecordType] = None
    ) -> List[MedicalRecord]:
        """
        Obtener historial médico de un paciente
        """
        try:
            # Intentar obtener desde caché
            cache_key = f"medical_history:{patient_id}:{record_type.value if record_type else 'all'}"
            if self.redis:
                cached_data = await self.redis.get(cache_key)
                if cached_data:
                    return json.loads(cached_data)
            
            # Construir query
            base_query = """
                SELECT * FROM medical_records 
                WHERE patient_id = %s AND status = 'active'
            """
            params = [patient_id]
            
            if record_type:
                base_query += " AND record_type = %s"
                params.append(record_type.value)
            
            base_query += " ORDER BY created_at DESC LIMIT %s"
            params.append(limit)
            
            results = await self.db.fetch_all(base_query, params)
            
            records = []
            for result in results:
                record = MedicalRecord(
                    id=result['id'],
                    patient_id=result['patient_id'],
                    doctor_id=result['doctor_id'],
                    appointment_id=result['appointment_id'],
                    record_type=result['record_type'],
                    version=result['version'],
                    clinical_data=json.loads(result['clinical_data']),
                    created_at=result['created_at'],
                    updated_at=result['updated_at'],
                    created_by=result['created_by'],
                    last_modified_by=result['last_modified_by'],
                    status=result['status']
                )
                records.append(record)
            
            # Cachear resultado
            if self.redis:
                await self.redis.setex(
                    cache_key, 
                    self.cache_ttl, 
                    json.dumps([self._serialize_record(r) for r in records])
                )
            
            return records
            
        except Exception as e:
            logger.error(f"Error getting medical history: {e}")
            raise
    
    async def get_medical_record(self, record_id: str) -> Optional[MedicalRecord]:
        """
        Obtener un registro médico específico
        """
        try:
            query = "SELECT * FROM medical_records WHERE id = %s AND status = 'active'"
            result = await self.db.fetch_one(query, [record_id])
            
            if result:
                return MedicalRecord(
                    id=result['id'],
                    patient_id=result['patient_id'],
                    doctor_id=result['doctor_id'],
                    appointment_id=result['appointment_id'],
                    record_type=result['record_type'],
                    version=result['version'],
                    clinical_data=json.loads(result['clinical_data']),
                    created_at=result['created_at'],
                    updated_at=result['updated_at'],
                    created_by=result['created_by'],
                    last_modified_by=result['last_modified_by'],
                    status=result['status']
                )
            return None
            
        except Exception as e:
            logger.error(f"Error getting medical record: {e}")
            raise
    
    async def get_patient_current_state(self, patient_id: str) -> Dict[str, Any]:
        """
        Obtener estado médico actual del paciente (desde vista materializada)
        """
        try:
            query = """
                SELECT current_medical_state, last_consultation_date 
                FROM patient_current_state 
                WHERE patient_id = %s
            """
            result = await self.db.fetch_one(query, [patient_id])
            
            if result:
                return {
                    'current_state': result['current_medical_state'],
                    'last_consultation': result['last_consultation_date']
                }
            return {'current_state': [], 'last_consultation': None}
            
        except Exception as e:
            logger.error(f"Error getting patient current state: {e}")
            raise
    
    async def amend_medical_record(
        self, 
        record_id: str, 
        amended_data: Dict[str, Any],
        amended_by: str,
        reason: str
    ) -> MedicalRecord:
        """
        Crear una enmienda a un registro médico (nueva versión)
        """
        try:
            # Obtener registro original
            original = await self.get_medical_record(record_id)
            if not original:
                raise Exception("Medical record not found")
            
            # Crear nueva versión
            new_version = original.version + 1
            amended_clinical_data = {
                **original.clinical_data,
                **amended_data,
                'amendment_info': {
                    'reason': reason,
                    'amended_by': amended_by,
                    'amended_at': datetime.utcnow().isoformat(),
                    'original_version': original.version
                }
            }
            
            # Crear nuevo registro con versión incrementada
            new_record = await self.create_medical_record(
                patient_id=original.patient_id,
                doctor_id=original.doctor_id,
                appointment_id=original.appointment_id,
                record_type=RecordType(original.record_type),
                clinical_data=amended_clinical_data,
                created_by=amended_by
            )
            
            # Marcar registro original como enmendado
            await self.db.execute(
                "UPDATE medical_records SET status = 'amended' WHERE id = %s",
                [record_id]
            )
            
            logger.info(f"Medical record amended: {record_id} -> {new_record.id}")
            return new_record
            
        except Exception as e:
            logger.error(f"Error amending medical record: {e}")
            raise
    
    def _validate_clinical_data(self, record_type: RecordType, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validar datos clínicos según el tipo de registro
        """
        if record_type == RecordType.CONSULTATION:
            required_fields = ['chief_complaint', 'history_present_illness', 'assessment', 'plan']
            for field in required_fields:
                if field not in data:
                    raise ValueError(f"Missing required field for consultation: {field}")
        
        elif record_type == RecordType.PRESCRIPTION:
            if 'medications' not in data:
                raise ValueError("Prescription must include medications")
            
            for med in data['medications']:
                if 'name' not in med or 'dosage' not in med:
                    raise ValueError("Each medication must have name and dosage")
        
        return data
    
    async def _invalidate_patient_cache(self, patient_id: str):
        """
        Invalidar caché del paciente
        """
        if self.redis:
            pattern = f"medical_history:{patient_id}:*"
            keys = await self.redis.keys(pattern)
            if keys:
                await self.redis.delete(*keys)
    
    def _serialize_record(self, record: MedicalRecord) -> Dict[str, Any]:
        """
        Serializar registro para caché
        """
        return {
            'id': record.id,
            'patient_id': record.patient_id,
            'doctor_id': record.doctor_id,
            'appointment_id': record.appointment_id,
            'record_type': record.record_type,
            'version': record.version,
            'clinical_data': record.clinical_data,
            'created_at': record.created_at.isoformat(),
            'updated_at': record.updated_at.isoformat(),
            'created_by': record.created_by,
            'last_modified_by': record.last_modified_by,
            'status': record.status
        }
    
    def deserialize_record(self, data: Dict[str, Any]) -> MedicalRecord:
        """
        Deserializar registro desde caché
        """
        return MedicalRecord(
            id=data['id'],
            patient_id=data['patient_id'],
            doctor_id=data['doctor_id'],
            appointment_id=data['appointment_id'],
            record_type=data['record_type'],
            version=data['version'],
            clinical_data=data['clinical_data'],
            created_at=datetime.fromisoformat(data['created_at']),
            updated_at=datetime.fromisoformat(data['updated_at']),
            created_by=data['created_by'],
            last_modified_by=data['last_modified_by'],
            status=data['status']
        )
