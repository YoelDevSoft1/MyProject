import asyncio
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

ISO_FORMAT = "%Y-%m-%dT%H:%M:%SZ"


def _utc_now() -> str:
    return datetime.utcnow().strftime(ISO_FORMAT)


class MedicalRecordsRepository:
    """Simple repository backed by a JSON file for medical records."""

    def __init__(self, data_file: Optional[Path] = None) -> None:
        self.data_file = data_file or Path(__file__).resolve().parent / "medical_records_data.json"
        self._lock = asyncio.Lock()
        if not self.data_file.exists():
            seed = self._seed_records()
            self._write_sync(seed)

    async def list_records(
        self,
        *,
        page: int = 1,
        limit: int = 10,
        status: Optional[str] = None,
        doctor: Optional[str] = None,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        data = await self._read()
        filtered = self._apply_filters(data, status=status, doctor=doctor, search=search)

        total = len(filtered)
        limit = limit if limit and limit > 0 else total or 1
        total_pages = max(1, (total + limit - 1) // limit)
        page = max(1, min(page or 1, total_pages))
        start = (page - 1) * limit
        items = filtered[start:start + limit]

        stats = self._build_stats(data)

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "stats": stats
        }

    async def get_record(self, record_id: str) -> Optional[Dict[str, Any]]:
        data = await self._read()
        for record in data:
            if record["id"] == record_id:
                return record
        return None

    async def create_record(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            data = await self._read()
            record_number = payload.get("record_number")
            if not record_number or any(r.get("record_number") == record_number for r in data):
                record_number = self._generate_record_number(data)

            record = self._prepare_record({
                **payload,
                "id": str(uuid.uuid4()),
                "record_number": record_number,
                "created_at": _utc_now(),
                "updated_at": _utc_now()
            })

            data.insert(0, record)
            await self._write(data)
            return record

    async def update_record(self, record_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        async with self._lock:
            data = await self._read()
            for index, record in enumerate(data):
                if record["id"] == record_id:
                    updated = self._prepare_record({
                        **record,
                        **payload,
                        "record_number": record.get("record_number"),
                        "updated_at": _utc_now()
                    })
                    data[index] = updated
                    await self._write(data)
                    return updated
        return None

    async def delete_record(self, record_id: str) -> bool:
        async with self._lock:
            data = await self._read()
            initial_len = len(data)
            data = [record for record in data if record["id"] != record_id]
            deleted = len(data) != initial_len
            if deleted:
                await self._write(data)
            return deleted

    async def export_records(
        self,
        *,
        status: Optional[str] = None,
        doctor: Optional[str] = None,
        search: Optional[str] = None
    ) -> str:
        data = await self._read()
        filtered = self._apply_filters(data, status=status, doctor=doctor, search=search)
        headers = [
            "Record",
            "Paciente",
            "Doctor",
            "Diagnostico",
            "Estado",
            "Fecha cita",
            "Seguimiento",
            "Actualizado"
        ]
        rows = [
            [
                record.get("record_number") or record.get("id"),
                record.get("patient_name", ""),
                record.get("doctor_name", ""),
                record.get("diagnosis", ""),
                record.get("status", ""),
                record.get("appointment_date", ""),
                record.get("follow_up_date", ""),
                record.get("updated_at", "")
            ]
            for record in filtered
        ]
        csv_lines = [
            ",".join(self._escape_csv(value) for value in headers),
            *[",".join(self._escape_csv(value) for value in row) for row in rows]
        ]
        return "\r\n".join(csv_lines)

    async def _read(self) -> List[Dict[str, Any]]:
        return await asyncio.to_thread(self._read_sync)

    async def _write(self, data: List[Dict[str, Any]]) -> None:
        await asyncio.to_thread(self._write_sync, data)

    def _read_sync(self) -> List[Dict[str, Any]]:
        if not self.data_file.exists():
            return []
        with self.data_file.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def _write_sync(self, data: List[Dict[str, Any]]) -> None:
        self.data_file.parent.mkdir(parents=True, exist_ok=True)
        with self.data_file.open("w", encoding="utf-8") as handle:
            json.dump(data, handle, ensure_ascii=False, indent=2)

    def _apply_filters(
        self,
        records: List[Dict[str, Any]],
        *,
        status: Optional[str],
        doctor: Optional[str],
        search: Optional[str]
    ) -> List[Dict[str, Any]]:
        if not records:
            return []

        status_value = status.lower().strip() if status else None
        doctor_value = doctor.lower().strip() if doctor else None
        search_value = search.lower().strip() if search else None

        def matches(record: Dict[str, Any]) -> bool:
            if status_value and str(record.get("status", "")).lower() != status_value:
                return False

            if doctor_value:
                doctor_fields = [
                    str(record.get("doctor_name", "")),
                    str(record.get("doctor_id", ""))
                ]
                if not any(doctor_value in field.lower() for field in doctor_fields if field):
                    return False

            if search_value:
                haystacks = [
                    str(record.get("record_number", "")),
                    str(record.get("patient_name", "")),
                    str(record.get("patient_id", "")),
                    str(record.get("diagnosis", "")),
                    str(record.get("symptoms", "")),
                    str(record.get("treatment", "")),
                    str(record.get("notes", "")),
                    str(record.get("doctor_name", ""))
                ]
                if not any(search_value in field.lower() for field in haystacks if field):
                    return False

            return True

        return [record for record in records if matches(record)]

    def _build_stats(self, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not records:
            return {
                "totalRecords": 0,
                "activeRecords": 0,
                "archivedRecords": 0,
                "pendingRecords": 0,
                "followUpScheduled": 0,
                "lastUpdated": None
            }

        active = sum(1 for r in records if r.get("status") == "active")
        archived = sum(1 for r in records if r.get("status") == "archived")
        pending = sum(1 for r in records if r.get("status") == "pending")
        follow_up = sum(1 for r in records if r.get("follow_up_date"))

        updated_values = [r.get("updated_at") for r in records if r.get("updated_at")]
        last_updated = max(updated_values) if updated_values else None

        return {
            "totalRecords": len(records),
            "activeRecords": active,
            "archivedRecords": archived,
            "pendingRecords": pending,
            "followUpScheduled": follow_up,
            "lastUpdated": last_updated
        }

    def _prepare_record(self, data: Dict[str, Any]) -> Dict[str, Any]:
        result = {
            "id": data.get("id", str(uuid.uuid4())),
            "record_number": data.get("record_number"),
            "patient_id": data.get("patient_id", ""),
            "patient_name": data.get("patient_name", "Paciente SMD"),
            "doctor_id": data.get("doctor_id", ""),
            "doctor_name": data.get("doctor_name", "Staff Medico"),
            "diagnosis": data.get("diagnosis", ""),
            "symptoms": data.get("symptoms", ""),
            "treatment": data.get("treatment", ""),
            "medications": data.get("medications", ""),
            "allergies": data.get("allergies", ""),
            "notes": data.get("notes", ""),
            "status": str(data.get("status", "active")).lower(),
            "appointment_date": data.get("appointment_date", ""),
            "follow_up_date": data.get("follow_up_date", ""),
            "follow_up_notes": data.get("follow_up_notes", ""),
            "created_at": data.get("created_at", _utc_now()),
            "updated_at": data.get("updated_at", _utc_now())
        }
        return result

    def _generate_record_number(self, records: List[Dict[str, Any]]) -> str:
        counter = 0
        for record in records:
            number = record.get("record_number", "")
            if number.startswith("MR-"):
                try:
                    counter = max(counter, int(number[3:]))
                except ValueError:
                    continue
        return f"MR-{counter + 1:03d}"

    def _escape_csv(self, value: Any) -> str:
        text = "" if value is None else str(value)
        escaped = text.replace('"', '""')
        return f'"{escaped}"'

    def _seed_records(self) -> List[Dict[str, Any]]:
        now = _utc_now()
        return [
            {
                "id": str(uuid.uuid4()),
                "record_number": "MR-001",
                "patient_id": "patient-001",
                "patient_name": "Ana Gomez",
                "doctor_id": "doctor-001",
                "doctor_name": "Dra. Camila Herrera",
                "diagnosis": "Hipertension controlada",
                "symptoms": "Dolor de cabeza leve, mareo matutino",
                "treatment": "Amlodipino 5mg una vez al dia",
                "medications": "Amlodipino 5mg",
                "allergies": "Penicilina",
                "notes": "Paciente responde correctamente al tratamiento. Mantener seguimiento cada 3 meses.",
                "status": "active",
                "appointment_date": "2025-09-18",
                "follow_up_date": "2025-12-18",
                "follow_up_notes": "Realizar control de presion arterial y perfil lipidico",
                "created_at": now,
                "updated_at": now
            },
            {
                "id": str(uuid.uuid4()),
                "record_number": "MR-002",
                "patient_id": "patient-002",
                "patient_name": "Carlos Perez",
                "doctor_id": "doctor-002",
                "doctor_name": "Dr. Mateo Rodriguez",
                "diagnosis": "Diabetes Tipo 2",
                "symptoms": "Vision borrosa ocasional, cansancio",
                "treatment": "Metformina 850mg dos veces al dia",
                "medications": "Metformina 850mg",
                "allergies": "Ninguna",
                "notes": "Controlar niveles de glucosa en ayunas y posprandial. Se entrega plan nutricional.",
                "status": "pending",
                "appointment_date": "2025-09-10",
                "follow_up_date": "2025-10-10",
                "follow_up_notes": "Verificar adherencia a medicacion y revisar niveles de HbA1c",
                "created_at": now,
                "updated_at": now
            },
            {
                "id": str(uuid.uuid4()),
                "record_number": "MR-003",
                "patient_id": "patient-003",
                "patient_name": "Juliana Rodriguez",
                "doctor_id": "doctor-003",
                "doctor_name": "Dra. Laura Sanchez",
                "diagnosis": "Rehabilitacion post operatoria",
                "symptoms": "Dolor leve en rodilla derecha, inflamacion controlada",
                "treatment": "Sesiones de fisioterapia 3 veces por semana",
                "medications": "Ibuprofeno 400mg segun dolor",
                "allergies": "Mariscos",
                "notes": "Se observa buena evolucion. Reforzar ejercicios de fortalecimiento muscular en casa.",
                "status": "active",
                "appointment_date": "2025-08-28",
                "follow_up_date": "2025-09-25",
                "follow_up_notes": "Evaluar rango de movimiento y estabilidad articular",
                "created_at": now,
                "updated_at": now
            },
            {
                "id": str(uuid.uuid4()),
                "record_number": "MR-004",
                "patient_id": "patient-004",
                "patient_name": "Miguel Torres",
                "doctor_id": "doctor-002",
                "doctor_name": "Dr. Mateo Rodriguez",
                "diagnosis": "Control anual",
                "symptoms": "Sin sintomas relevantes",
                "treatment": "Recomendaciones de estilo de vida saludable",
                "medications": "N/A",
                "allergies": "Aspirina",
                "notes": "Se archiva registro. Proxima revision en un ano salvo sintomas.",
                "status": "archived",
                "appointment_date": "2024-11-05",
                "follow_up_date": "",
                "follow_up_notes": "",
                "created_at": now,
                "updated_at": now
            }
        ]


repository = MedicalRecordsRepository()
