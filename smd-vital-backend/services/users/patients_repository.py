import asyncio
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from enum import Enum
ISO_FORMAT = "%Y-%m-%dT%H:%M:%SZ"


def _utc_now() -> str:
    """Return current UTC time in ISO format with Z suffix."""
    return datetime.utcnow().strftime(ISO_FORMAT)


class PatientRepository:
    """File based repository for patient data."""

    def __init__(self, data_file: Optional[Path] = None) -> None:
        self.data_file = data_file or Path(__file__).resolve().parent / "patients_data.json"
        self._lock = asyncio.Lock()
        if not self.data_file.exists():
            seed = self._seed_patients()
            self._write_sync(seed)

    async def list_patients(
        self,
        *,
        search: Optional[str] = None,
        status: Optional[str] = None,
        gender: Optional[str] = None,
        page: int = 1,
        limit: int = 10,
    ) -> Dict[str, Any]:
        data = await self._read()
        filtered = self._apply_filters(data, search=search, status=status, gender=gender)

        total = len(filtered)
        total_pages = max(1, (total + limit - 1) // limit) if limit > 0 else 1
        page = max(1, page)

        if limit > 0:
            start = (page - 1) * limit
            end = start + limit
            items = filtered[start:end]
        else:
            items = filtered

        stats = self._build_stats(filtered)

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "stats": stats,
        }

    async def get_patient(self, patient_id: str) -> Optional[Dict[str, Any]]:
        data = await self._read()
        for patient in data:
            if patient["id"] == patient_id or patient.get("patient_id") == patient_id:
                return patient
        return None

    async def create_patient(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        async with self._lock:
            data = await self._read()
            patient_id = payload.get("patient_id")
            if not patient_id or any(p.get("patient_id") == patient_id for p in data):
                patient_id = self._generate_patient_id(data)

            new_patient = self._prepare_patient(
                {
                    **payload,
                    "id": str(uuid.uuid4()),
                    "patient_id": patient_id,
                    "created_at": _utc_now(),
                    "updated_at": _utc_now(),
                }
            )

            data.insert(0, new_patient)
            await self._write(data)
            return new_patient

    async def update_patient(self, patient_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        async with self._lock:
            data = await self._read()
            for index, patient in enumerate(data):
                if patient["id"] == patient_id or patient.get("patient_id") == patient_id:
                    updated = self._prepare_patient(
                        {
                            **patient,
                            **payload,
                            "updated_at": _utc_now(),
                        }
                    )
                    data[index] = updated
                    await self._write(data)
                    return updated
        return None

    async def delete_patient(self, patient_id: str) -> bool:
        async with self._lock:
            data = await self._read()
            initial_len = len(data)
            data = [p for p in data if p["id"] != patient_id and p.get("patient_id") != patient_id]
            deleted = len(data) != initial_len
            if deleted:
                await self._write(data)
            return deleted

    async def export_patients(
        self,
        *,
        search: Optional[str] = None,
        status: Optional[str] = None,
        gender: Optional[str] = None,
    ) -> str:
        data = await self._read()
        filtered = self._apply_filters(data, search=search, status=status, gender=gender)
        headers = [
            "ID",
            "Patient",
            "Age",
            "Gender",
            "Email",
            "Phone",
            "Status",
            "LastVisit",
            "NextAppointment",
        ]
        rows = [
            [
                patient.get("patient_id") or patient.get("id"),
                patient.get("name", ""),
                patient.get("age") or "",
                patient.get("gender", ""),
                patient.get("email", ""),
                patient.get("phone", ""),
                patient.get("status", ""),
                patient.get("last_visit", ""),
                patient.get("next_appointment", ""),
            ]
            for patient in filtered
        ]
        csv_lines = [
            ",".join(self._escape_csv(value) for value in headers),
            *[",".join(self._escape_csv(value) for value in row) for row in rows],
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
        patients: List[Dict[str, Any]],
        *,
        search: Optional[str],
        status: Optional[str],
        gender: Optional[str],
    ) -> List[Dict[str, Any]]:
        if not patients:
            return []

        search_term = search.lower().strip() if search else None
        status_term = status.lower().strip() if status else None
        gender_term = gender.lower().strip() if gender else None

        def matches(patient: Dict[str, Any]) -> bool:
            if search_term:
                haystacks = [
                    str(patient.get("name", "")),
                    str(patient.get("patient_id", "")),
                    str(patient.get("email", "")),
                    str(patient.get("phone", "")),
                    str(patient.get("insurance", "")),
                ]
                if not any(search_term in value.lower() for value in haystacks if value):
                    return False

            if status_term and str(patient.get("status", "")).lower() != status_term:
                return False

            if gender_term and str(patient.get("gender", "")).lower() != gender_term:
                return False

            return True

        return [patient for patient in patients if matches(patient)]

    def _build_stats(self, patients: List[Dict[str, Any]]) -> Dict[str, Any]:
        total = len(patients)
        active = sum(1 for p in patients if p.get("status") == "active")
        inactive = sum(1 for p in patients if p.get("status") == "inactive")
        pending = sum(1 for p in patients if p.get("status") == "pending")
        ages = [p.get("age") for p in patients if isinstance(p.get("age"), int) and p.get("age") > 0]
        average = round(sum(ages) / len(ages)) if ages else 0

        return {
            "total_patients": total,
            "active_patients": active,
            "inactive_patients": inactive,
            "pending_patients": pending,
            "average_age": average,
        }

    def _prepare_patient(self, data: Dict[str, Any]) -> Dict[str, Any]:
        status_value = data.get("status") or "active"
        if isinstance(status_value, Enum):
            status_value = status_value.value

        gender_value = data.get("gender") or "female"
        if isinstance(gender_value, Enum):
            gender_value = gender_value.value

        blood_value = data.get("blood_type") or data.get("bloodType") or "O+"
        if isinstance(blood_value, Enum):
            blood_value = blood_value.value

        result = {
            "id": data.get("id", str(uuid.uuid4())),
            "patient_id": data.get("patient_id") or self._generate_patient_id([]),
            "name": data.get("name", "Unnamed Patient"),
            "age": self._safe_int(data.get("age")),
            "gender": str(gender_value).lower(),
            "phone": data.get("phone", ""),
            "email": data.get("email", ""),
            "address": data.get("address", ""),
            "blood_type": blood_value,
            "emergency_contact": data.get("emergency_contact") or data.get("emergencyContact") or "",
            "insurance": data.get("insurance", ""),
            "allergies": data.get("allergies", ""),
            "status": str(status_value).lower(),
            "last_visit": data.get("last_visit") or data.get("lastVisit") or "",
            "next_appointment": data.get("next_appointment") or data.get("nextAppointment") or "",
            "created_at": data.get("created_at") or data.get("createdAt") or _utc_now(),
            "updated_at": data.get("updated_at") or data.get("updatedAt") or _utc_now(),
        }
        return result

    def _generate_patient_id(self, patients: List[Dict[str, Any]]) -> str:
        sequence = 0
        for patient in patients:
            code = patient.get("patient_id") or ""
            if code.startswith("PAT-"):
                try:
                    sequence = max(sequence, int(code[4:]))
                except ValueError:
                    continue
        return f"PAT-{sequence + 1:03d}"

    def _escape_csv(self, value: Any) -> str:
        text = "" if value is None else str(value)
        escaped = text.replace("\"", "\"\"")
        return f'"{escaped}"'

    def _safe_int(self, value: Any) -> Optional[int]:
        try:
            return int(value) if value is not None else None
        except (TypeError, ValueError):
            return None

    def _seed_patients(self) -> List[Dict[str, Any]]:
        now = _utc_now()
        return [
            {
                "id": str(uuid.uuid4()),
                "patient_id": "PAT-001",
                "name": "Ana Gomez",
                "age": 32,
                "gender": "female",
                "phone": "+57 300 123 4567",
                "email": "ana.gomez@smdvital.com",
                "address": "Cra 15 #45-32, Bogota",
                "blood_type": "O+",
                "emergency_contact": "Luis Gomez - +57 310 765 4321",
                "insurance": "Salud Total",
                "allergies": "Penicilina",
                "status": "active",
                "last_visit": "2025-09-20",
                "next_appointment": "2025-10-10",
                "created_at": now,
                "updated_at": now,
            },
            {
                "id": str(uuid.uuid4()),
                "patient_id": "PAT-002",
                "name": "Carlos Perez",
                "age": 45,
                "gender": "male",
                "phone": "+57 301 987 6543",
                "email": "carlos.perez@smdvital.com",
                "address": "Av 9 #120-05, Bogota",
                "blood_type": "A+",
                "emergency_contact": "Maria Perez - +57 315 123 9876",
                "insurance": "Sura",
                "allergies": "None",
                "status": "active",
                "last_visit": "2025-09-18",
                "next_appointment": "2025-10-05",
                "created_at": now,
                "updated_at": now,
            },
            {
                "id": str(uuid.uuid4()),
                "patient_id": "PAT-003",
                "name": "Juliana Rodriguez",
                "age": 28,
                "gender": "female",
                "phone": "+57 310 222 3344",
                "email": "juliana.rodriguez@smdvital.com",
                "address": "Calle 100 #15-25, Bogota",
                "blood_type": "B-",
                "emergency_contact": "Andres Rodriguez - +57 300 555 6677",
                "insurance": "Compensar",
                "allergies": "Seafood",
                "status": "pending",
                "last_visit": "2025-08-30",
                "next_appointment": "2025-10-25",
                "created_at": now,
                "updated_at": now,
            },
            {
                "id": str(uuid.uuid4()),
                "patient_id": "PAT-004",
                "name": "Miguel Torres",
                "age": 52,
                "gender": "male",
                "phone": "+57 320 444 5566",
                "email": "miguel.torres@smdvital.com",
                "address": "Cl 26 #68C-61, Bogota",
                "blood_type": "AB+",
                "emergency_contact": "Laura Torres - +57 315 444 5566",
                "insurance": "Nueva EPS",
                "allergies": "Aspirina",
                "status": "inactive",
                "last_visit": "2025-07-15",
                "next_appointment": "",
                "created_at": now,
                "updated_at": now,
            },
            {
                "id": str(uuid.uuid4()),
                "patient_id": "PAT-005",
                "name": "Valentina Prieto",
                "age": 36,
                "gender": "female",
                "phone": "+57 313 888 1122",
                "email": "valentina.prieto@smdvital.com",
                "address": "Av Suba #105-15, Bogota",
                "blood_type": "A-",
                "emergency_contact": "Sebastian Prieto - +57 312 555 4455",
                "insurance": "Sanitas",
                "allergies": "Gluten",
                "status": "active",
                "last_visit": "2025-09-28",
                "next_appointment": "2025-11-15",
                "created_at": now,
                "updated_at": now,
            },
        ]


repository = PatientRepository()


