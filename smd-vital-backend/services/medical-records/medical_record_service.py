"""
SMD VITAL - Medical Record Service
Servicio para manejo de registros mÃ©dicos electrÃ³nicos (EHR)
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
        appointment_id: Optional[str],
        record_type: RecordType,
        clinical_data: Dict[str, Any],
        created_by: str
    ) -> MedicalRecord:
        """Crear un nuevo registro médico en el esquema actual."""
        try:
            record_id = str(uuid.uuid4())
            record_number = f"MR-{datetime.utcnow().strftime('%Y%m%d')}-{record_id[:8].upper()}"
            now = datetime.utcnow()

            validated_data = self._validate_clinical_data(record_type, clinical_data)
            validated_data.setdefault("version", 1)

            params = {
                "id": record_id,
                "record_number": record_number,
                "patient_id": patient_id,
                "professional_id": doctor_id,
                "appointment_id": appointment_id,
                "record_type": record_type.value,
                "status": RecordStatus.ACTIVE.value,
                "record_date": now,
                "service_date": now.date(),
                "clinical_data": json.dumps(validated_data),
                "is_sensitive": False,
                "access_level": "standard",
                "created_by": created_by,
                "last_modified_by": created_by,
                "created_at": now,
                "updated_at": now
            }

            query = """
                INSERT INTO medical_records (
                    id, record_number, patient_id, professional_id, appointment_id,
                    record_type, status, record_date, service_date, clinical_data,
                    is_sensitive, access_level, created_by, last_modified_by,
                    created_at, updated_at
                ) VALUES (
                    :id, :record_number, :patient_id, :professional_id, :appointment_id,
                    :record_type, :status, :record_date, :service_date, :clinical_data,
                    :is_sensitive, :access_level, :created_by, :last_modified_by,
                    :created_at, :updated_at
                ) RETURNING *
            """

            result = await self.db.fetch_one(query, params)
            if not result:
                raise Exception("Failed to create medical record")

            await self._invalidate_patient_cache(patient_id)
            return self._build_record_from_row(result)

        except Exception as e:
            logger.error(f"Error creating medical record: {e}")
            raise

    async def get_patient_medical_history(
        self,
        patient_id: str,
        limit: int = 50,
        record_type: Optional[RecordType] = None
    ) -> List[MedicalRecord]:
        """Obtener historial médico de acuerdo al esquema actual."""
        try:
            cache_key = f"medical_history:{patient_id}:{record_type.value if record_type else 'all'}"
            if self.redis:
                cached_data = await self.redis.get(cache_key)
                if cached_data:
                    cached = json.loads(cached_data)
                    return [self.deserialize_record(item) for item in cached]

            query = """
                SELECT id, record_number, patient_id, professional_id, appointment_id,
                       record_type, status, record_date, clinical_data,
                       created_at, updated_at, created_by, last_modified_by
                FROM medical_records
                WHERE patient_id = :patient_id AND status = :status
            """
            params = {
                "patient_id": patient_id,
                "status": RecordStatus.ACTIVE.value,
                "limit": limit
            }
            if record_type:
                query += " AND record_type = :record_type"
                params["record_type"] = record_type.value
            query += " ORDER BY record_date DESC LIMIT :limit"

            rows = await self.db.fetch_all(query, params)
            records = [self._build_record_from_row(row) for row in rows]

            if self.redis:
                await self.redis.setex(
                    cache_key,
                    self.cache_ttl,
                    json.dumps([self._serialize_record(r) for r in records])
                )

            return records
        except Exception as e:
            logger.error(f"Error getting patient medical history: {e}")
            raise

    async def get_medical_record(self, record_id: str) -> Optional[MedicalRecord]:
        try:
            query = """
                SELECT id, record_number, patient_id, professional_id, appointment_id,
                       record_type, status, record_date, clinical_data,
                       created_at, updated_at, created_by, last_modified_by
                FROM medical_records
                WHERE id = :record_id AND status != :status
            """
            row = await self.db.fetch_one(query, {
                "record_id": record_id,
                "status": RecordStatus.VOIDED.value
            })
            return self._build_record_from_row(row) if row else None
        except Exception as e:
            logger.error(f"Error getting medical record {record_id}: {e}")
            raise

    async def get_patient_current_state(self, patient_id: str) -> Dict[str, Any]:
        try:
            query = """
                SELECT id AS record_id,
                       record_type,
                       clinical_data,
                       record_date,
                       ROW_NUMBER() OVER (PARTITION BY record_type ORDER BY record_date DESC) AS rn
                FROM medical_records
                WHERE patient_id = :patient_id AND status = :status
            """
            rows = await self.db.fetch_all(query, {
                "patient_id": patient_id,
                "status": RecordStatus.ACTIVE.value
            })

            latest_by_type = [row for row in rows if row["rn"] == 1]
            current_state = []
            for row in latest_by_type:
                current_state.append({
                    "record_id": row["record_id"],
                    "record_type": row["record_type"],
                    "record_date": row["record_date"].isoformat() if row["record_date"] else None,
                    "clinical_data": json.loads(row["clinical_data"]) if row["clinical_data"] else {}
                })
            last_consultation = next(
                (row["record_date"].isoformat() for row in latest_by_type if row["record_type"] == RecordType.CONSULTATION.value and row["record_date"]),
                None
            )
            return {
                "current_state": current_state,
                "last_consultation": last_consultation
            }
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
        Crear una enmienda a un registro mÃ©dico (nueva versiÃ³n)
        """
        try:
            # Obtener registro original
            original = await self.get_medical_record(record_id)
            if not original:
                raise Exception("Medical record not found")
            
            # Crear nueva versiÃ³n
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
            
            # Crear nuevo registro con versiÃ³n incrementada
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
        Validar datos clÃ­nicos segÃºn el tipo de registro
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
        Invalidar cachÃ© del paciente
        """
        if self.redis:
            pattern = f"medical_history:{patient_id}:*"
            keys = await self.redis.keys(pattern)
            if keys:
                await self.redis.delete(*keys)
    
    def _serialize_record(self, record: MedicalRecord) -> Dict[str, Any]:
        """
        Serializar registro para cachÃ©
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
        Deserializar registro desde cachÃ©
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

    def _build_record_from_row(self, row: Dict[str, Any]) -> MedicalRecord:
        if not row:
            return None
        clinical = row.get('clinical_data')
        if isinstance(clinical, str):
            clinical = json.loads(clinical)
        return MedicalRecord(
            id=row['id'],
            patient_id=row['patient_id'],
            doctor_id=row.get('professional_id') or row.get('doctor_id'),
            appointment_id=row.get('appointment_id'),
            record_type=row.get('record_type'),
            version=(clinical or {}).get('version', 1),
            clinical_data=clinical or {},
            created_at=row.get('created_at'),
            updated_at=row.get('updated_at') or row.get('created_at'),
            created_by=row.get('created_by'),
            last_modified_by=row.get('last_modified_by', row.get('created_by')),
            status=row.get('status', RecordStatus.ACTIVE.value)
        )
