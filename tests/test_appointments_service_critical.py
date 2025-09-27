"""
Tests Críticos para Appointments Service
========================================

Casos de prueba faltantes más críticos para el servicio de citas médicas.
"""

import pytest
import uuid
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from fastapi import FastAPI
import json

@pytest.fixture
def appointments_app():
    """Create mock appointments service app."""
    app = FastAPI()
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": "appointment-service"}
    
    @app.post("/appointments")
    async def create_appointment(appointment_data: dict):
        # Simular validaciones básicas
        if not appointment_data.get("patient_id"):
            return {"error": "Patient ID required"}, 400
        
        if not appointment_data.get("doctor_id"):
            return {"error": "Doctor ID required"}, 400
        
        if not appointment_data.get("appointment_date"):
            return {"error": "Appointment date required"}, 400
        
        # Simular conflicto de horario
        if appointment_data.get("appointment_date") == "2024-02-15T10:00:00":
            return {"error": "Time slot not available"}, 409
        
        # Simular cita en el pasado
        appointment_date = datetime.fromisoformat(appointment_data.get("appointment_date", ""))
        if appointment_date < datetime.now():
            return {"error": "Cannot schedule appointment in the past"}, 400
        
        return {
            "id": str(uuid.uuid4()),
            "patient_id": appointment_data["patient_id"],
            "doctor_id": appointment_data["doctor_id"],
            "appointment_date": appointment_data["appointment_date"],
            "status": "scheduled",
            "created_at": datetime.utcnow().isoformat()
        }
    
    @app.get("/appointments")
    async def get_appointments(
        patient_id: str = None,
        doctor_id: str = None,
        status: str = None,
        limit: int = 10,
        offset: int = 0
    ):
        # Simular datos de citas
        appointments = [
            {
                "id": "apt_1",
                "patient_id": patient_id or "patient_123",
                "doctor_id": doctor_id or "doctor_456",
                "appointment_date": "2024-02-16T10:00:00",
                "status": status or "scheduled"
            },
            {
                "id": "apt_2",
                "patient_id": patient_id or "patient_123",
                "doctor_id": doctor_id or "doctor_456",
                "appointment_date": "2024-02-17T14:00:00",
                "status": status or "scheduled"
            }
        ]
        
        return {
            "appointments": appointments[offset:offset+limit],
            "total": len(appointments),
            "page": offset // limit + 1,
            "size": limit
        }
    
    @app.get("/appointments/availability")
    async def get_available_slots(
        doctor_id: str,
        date: str
    ):
        # Simular slots disponibles
        slots = [
            {"time": "09:00", "available": True},
            {"time": "09:30", "available": True},
            {"time": "10:00", "available": False},  # Ocupado
            {"time": "10:30", "available": True},
            {"time": "11:00", "available": True}
        ]
        
        return {
            "doctor_id": doctor_id,
            "date": date,
            "slots": slots,
            "total_slots": len(slots)
        }
    
    @app.post("/appointments/reserve")
    async def create_temporary_reservation(reservation_data: dict):
        # Simular reserva temporal
        if not reservation_data.get("doctor_id"):
            return {"error": "Doctor ID required"}, 400
        
        if not reservation_data.get("slot_datetime"):
            return {"error": "Slot datetime required"}, 400
        
        return {
            "reservation_id": str(uuid.uuid4()),
            "doctor_id": reservation_data["doctor_id"],
            "slot_datetime": reservation_data["slot_datetime"],
            "expires_at": (datetime.utcnow() + timedelta(minutes=15)).isoformat(),
            "status": "reserved"
        }
    
    @app.post("/appointments/confirm")
    async def confirm_reservation(confirmation_data: dict):
        # Simular confirmación de reserva
        if not confirmation_data.get("reservation_id"):
            return {"error": "Reservation ID required"}, 400
        
        return {
            "appointment_id": str(uuid.uuid4()),
            "reservation_id": confirmation_data["reservation_id"],
            "status": "confirmed",
            "created_at": datetime.utcnow().isoformat()
        }
    
    return app

@pytest.fixture
def appointments_client(appointments_app):
    """Create test client for appointments service."""
    return TestClient(appointments_app)

class TestAppointmentsServiceCritical:
    """Test cases críticos para Appointments Service."""
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_create_appointment_success(self, appointments_client):
        """Test successful appointment creation."""
        appointment_data = {
            "patient_id": "patient_123",
            "doctor_id": "doctor_456",
            "appointment_date": "2024-02-16T10:00:00",
            "appointment_type": "consultation",
            "reason": "Consulta de seguimiento"
        }
        
        response = appointments_client.post("/appointments", json=appointment_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["patient_id"] == appointment_data["patient_id"]
        assert data["doctor_id"] == appointment_data["doctor_id"]
        assert data["appointment_date"] == appointment_data["appointment_date"]
        assert data["status"] == "scheduled"
        assert "created_at" in data
        
        # Verificar que el ID es un UUID válido
        try:
            uuid.UUID(data["id"])
        except ValueError:
            pytest.fail("Appointment ID is not a valid UUID")
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_create_appointment_missing_required_fields(self, appointments_client):
        """Test appointment creation with missing required fields."""
        # Test missing patient_id
        appointment_data = {
            "doctor_id": "doctor_456",
            "appointment_date": "2024-02-16T10:00:00"
        }
        
        response = appointments_client.post("/appointments", json=appointment_data)
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert "Patient ID required" in data["error"]
        
        # Test missing doctor_id
        appointment_data = {
            "patient_id": "patient_123",
            "appointment_date": "2024-02-16T10:00:00"
        }
        
        response = appointments_client.post("/appointments", json=appointment_data)
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert "Doctor ID required" in data["error"]
        
        # Test missing appointment_date
        appointment_data = {
            "patient_id": "patient_123",
            "doctor_id": "doctor_456"
        }
        
        response = appointments_client.post("/appointments", json=appointment_data)
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert "Appointment date required" in data["error"]
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_create_appointment_time_conflict(self, appointments_client):
        """Test appointment creation with time conflict."""
        appointment_data = {
            "patient_id": "patient_123",
            "doctor_id": "doctor_456",
            "appointment_date": "2024-02-15T10:00:00",  # Slot ocupado
            "appointment_type": "consultation"
        }
        
        response = appointments_client.post("/appointments", json=appointment_data)
        
        assert response.status_code == 409
        data = response.json()
        assert "error" in data
        assert "Time slot not available" in data["error"]
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_create_appointment_past_date(self, appointments_client):
        """Test appointment creation with past date."""
        past_date = (datetime.now() - timedelta(days=1)).isoformat()
        
        appointment_data = {
            "patient_id": "patient_123",
            "doctor_id": "doctor_456",
            "appointment_date": past_date,
            "appointment_type": "consultation"
        }
        
        response = appointments_client.post("/appointments", json=appointment_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert "Cannot schedule appointment in the past" in data["error"]
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_get_appointments_success(self, appointments_client):
        """Test successful appointment retrieval."""
        response = appointments_client.get("/appointments")
        
        assert response.status_code == 200
        data = response.json()
        assert "appointments" in data
        assert "total" in data
        assert "page" in data
        assert "size" in data
        assert isinstance(data["appointments"], list)
        assert data["total"] >= 0
        assert data["page"] >= 1
        assert data["size"] >= 1
        
        # Verificar estructura de cada cita
        if data["appointments"]:
            appointment = data["appointments"][0]
            required_fields = ["id", "patient_id", "doctor_id", "appointment_date", "status"]
            for field in required_fields:
                assert field in appointment, f"Missing required field: {field}"
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_get_appointments_with_filters(self, appointments_client):
        """Test appointment retrieval with filters."""
        # Test with patient_id filter
        response = appointments_client.get("/appointments?patient_id=patient_123")
        assert response.status_code == 200
        
        # Test with doctor_id filter
        response = appointments_client.get("/appointments?doctor_id=doctor_456")
        assert response.status_code == 200
        
        # Test with status filter
        response = appointments_client.get("/appointments?status=scheduled")
        assert response.status_code == 200
        
        # Test with pagination
        response = appointments_client.get("/appointments?limit=5&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert data["size"] <= 5
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_get_available_slots_success(self, appointments_client):
        """Test successful availability check."""
        response = appointments_client.get("/appointments/availability?doctor_id=doctor_456&date=2024-02-16")
        
        assert response.status_code == 200
        data = response.json()
        assert "doctor_id" in data
        assert "date" in data
        assert "slots" in data
        assert "total_slots" in data
        assert isinstance(data["slots"], list)
        assert data["total_slots"] >= 0
        
        # Verificar estructura de slots
        if data["slots"]:
            slot = data["slots"][0]
            assert "time" in slot
            assert "available" in slot
            assert isinstance(slot["available"], bool)
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_get_available_slots_missing_parameters(self, appointments_client):
        """Test availability check with missing parameters."""
        # Test missing doctor_id
        response = appointments_client.get("/appointments/availability?date=2024-02-16")
        assert response.status_code == 422  # Validation error
        
        # Test missing date
        response = appointments_client.get("/appointments/availability?doctor_id=doctor_456")
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_create_temporary_reservation_success(self, appointments_client):
        """Test successful temporary reservation creation."""
        reservation_data = {
            "doctor_id": "doctor_456",
            "slot_datetime": "2024-02-16T10:00:00",
            "appointment_type": "consultation"
        }
        
        response = appointments_client.post("/appointments/reserve", json=reservation_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "reservation_id" in data
        assert data["doctor_id"] == reservation_data["doctor_id"]
        assert data["slot_datetime"] == reservation_data["slot_datetime"]
        assert data["status"] == "reserved"
        assert "expires_at" in data
        
        # Verificar que el reservation_id es un UUID válido
        try:
            uuid.UUID(data["reservation_id"])
        except ValueError:
            pytest.fail("Reservation ID is not a valid UUID")
        
        # Verificar que expires_at es una fecha futura
        expires_at = datetime.fromisoformat(data["expires_at"])
        assert expires_at > datetime.utcnow()
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_create_temporary_reservation_missing_fields(self, appointments_client):
        """Test temporary reservation with missing fields."""
        # Test missing doctor_id
        reservation_data = {
            "slot_datetime": "2024-02-16T10:00:00"
        }
        
        response = appointments_client.post("/appointments/reserve", json=reservation_data)
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert "Doctor ID required" in data["error"]
        
        # Test missing slot_datetime
        reservation_data = {
            "doctor_id": "doctor_456"
        }
        
        response = appointments_client.post("/appointments/reserve", json=reservation_data)
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert "Slot datetime required" in data["error"]
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_confirm_reservation_success(self, appointments_client):
        """Test successful reservation confirmation."""
        # Primero crear una reserva
        reservation_data = {
            "doctor_id": "doctor_456",
            "slot_datetime": "2024-02-16T10:00:00"
        }
        
        reservation_response = appointments_client.post("/appointments/reserve", json=reservation_data)
        assert reservation_response.status_code == 200
        reservation_id = reservation_response.json()["reservation_id"]
        
        # Confirmar la reserva
        confirmation_data = {
            "reservation_id": reservation_id,
            "patient_data": {
                "name": "Juan Pérez",
                "phone": "+57 300 123 4567"
            }
        }
        
        response = appointments_client.post("/appointments/confirm", json=confirmation_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "appointment_id" in data
        assert data["reservation_id"] == reservation_id
        assert data["status"] == "confirmed"
        assert "created_at" in data
        
        # Verificar que el appointment_id es un UUID válido
        try:
            uuid.UUID(data["appointment_id"])
        except ValueError:
            pytest.fail("Appointment ID is not a valid UUID")
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_confirm_reservation_missing_reservation_id(self, appointments_client):
        """Test reservation confirmation with missing reservation ID."""
        confirmation_data = {
            "patient_data": {
                "name": "Juan Pérez",
                "phone": "+57 300 123 4567"
            }
        }
        
        response = appointments_client.post("/appointments/confirm", json=confirmation_data)
        
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert "Reservation ID required" in data["error"]
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_appointment_data_validation(self, appointments_client):
        """Test appointment data validation."""
        # Test invalid date format
        appointment_data = {
            "patient_id": "patient_123",
            "doctor_id": "doctor_456",
            "appointment_date": "invalid-date-format"
        }
        
        response = appointments_client.post("/appointments", json=appointment_data)
        # Should handle invalid date format gracefully
        assert response.status_code in [400, 422]
        
        # Test empty strings
        appointment_data = {
            "patient_id": "",
            "doctor_id": "doctor_456",
            "appointment_date": "2024-02-16T10:00:00"
        }
        
        response = appointments_client.post("/appointments", json=appointment_data)
        assert response.status_code in [400, 422]
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_appointment_pagination(self, appointments_client):
        """Test appointment pagination."""
        # Test first page
        response = appointments_client.get("/appointments?limit=1&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert data["size"] <= 1
        assert data["page"] == 1
        
        # Test second page
        response = appointments_client.get("/appointments?limit=1&offset=1")
        assert response.status_code == 200
        data = response.json()
        assert data["size"] <= 1
        assert data["page"] == 2
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_health_check(self, appointments_client):
        """Test health check endpoint."""
        response = appointments_client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "appointment-service"
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_concurrent_appointment_creation(self, appointments_client):
        """Test concurrent appointment creation."""
        import threading
        import time
        
        results = []
        
        def create_appointment(thread_id):
            appointment_data = {
                "patient_id": f"patient_{thread_id}",
                "doctor_id": "doctor_456",
                "appointment_date": "2024-02-16T10:00:00",
                "appointment_type": "consultation"
            }
            response = appointments_client.post("/appointments", json=appointment_data)
            results.append(response.status_code)
        
        # Crear múltiples hilos
        threads = []
        for i in range(3):
            thread = threading.Thread(target=create_appointment, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Esperar a que terminen
        for thread in threads:
            thread.join()
        
        # Verificar que todas las respuestas son válidas
        assert len(results) == 3
        for status_code in results:
            assert status_code in [200, 201, 409, 500]  # Códigos válidos
    
    @pytest.mark.critical
    @pytest.mark.appointments
    def test_appointment_response_structure(self, appointments_client):
        """Test appointment response structure consistency."""
        appointment_data = {
            "patient_id": "patient_123",
            "doctor_id": "doctor_456",
            "appointment_date": "2024-02-16T10:00:00",
            "appointment_type": "consultation"
        }
        
        response = appointments_client.post("/appointments", json=appointment_data)
        assert response.status_code == 200
        
        data = response.json()
        
        # Verificar estructura completa
        required_fields = ["id", "patient_id", "doctor_id", "appointment_date", "status", "created_at"]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Verificar tipos de datos
        assert isinstance(data["id"], str)
        assert isinstance(data["patient_id"], str)
        assert isinstance(data["doctor_id"], str)
        assert isinstance(data["appointment_date"], str)
        assert isinstance(data["status"], str)
        assert isinstance(data["created_at"], str)
        
        # Verificar que las fechas son válidas
        try:
            datetime.fromisoformat(data["appointment_date"])
            datetime.fromisoformat(data["created_at"])
        except ValueError:
            pytest.fail("Invalid date format in response")



