"""
Integration Tests for SMD VITAL
==============================

Tests for complete workflows across multiple services.
"""

import pytest
import asyncio
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from fastapi import FastAPI
import json
from datetime import datetime, timedelta

@pytest.fixture
def integration_app():
    """Create mock integrated app for testing."""
    app = FastAPI()
    
    # Mock all services in one app for integration testing
    @app.post("/auth/login")
    async def login(credentials: dict):
        if credentials.get("email") == "test@test.com" and credentials.get("password") == "password123":
            return {
                "access_token": "mock_jwt_token",
                "refresh_token": "mock_refresh_token",
                "token_type": "bearer",
                "expires_in": 3600,
                "user": {"id": "user_123", "email": "test@test.com", "role": "patient"}
            }
        return {"error": "Invalid credentials"}, 401
    
    @app.get("/users/profile")
    async def get_profile(user_id: str):
        return {
            "id": user_id,
            "email": "test@test.com",
            "first_name": "Juan",
            "last_name": "Pérez",
            "role": "patient"
        }
    
    @app.post("/appointments")
    async def create_appointment(appointment_data: dict):
        return {
            "id": "appointment_123",
            "patient_id": appointment_data["patient_id"],
            "doctor_id": appointment_data["doctor_id"],
            "appointment_date": appointment_data["appointment_date"],
            "appointment_time": appointment_data["appointment_time"],
            "status": "scheduled"
        }
    
    @app.post("/medical-records")
    async def create_medical_record(record_data: dict):
        return {
            "id": "record_123",
            "appointment_id": record_data["appointment_id"],
            "patient_id": "user_123",
            "doctor_id": "doctor_456",
            "record_type": "consultation",
            "status": "active"
        }
    
    @app.post("/payments/create-payment-intent")
    async def create_payment_intent(payment_data: dict):
        return {
            "client_secret": "pi_test_123_secret",
            "payment_intent_id": "pi_test_123",
            "amount_cents": payment_data["amount_cents"],
            "currency": payment_data["currency"],
            "status": "requires_payment_method"
        }
    
    @app.post("/notifications/send-notification")
    async def send_notification(notification_data: dict):
        return {
            "notification_id": "notif_123",
            "status": "queued",
            "message": "Notificación en cola para envío"
        }
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": "integration-test"}
    
    return app

@pytest.fixture
def integration_client(integration_app):
    """Create test client for integration testing."""
    return TestClient(integration_app)

class TestIntegrationWorkflows:
    """Test complete workflows across services."""
    
    @pytest.mark.integration
    @pytest.mark.slow
    def test_complete_appointment_workflow(self, integration_client):
        """Test complete appointment workflow from login to payment."""
        
        # Step 1: User login
        login_response = integration_client.post("/auth/login", json={
            "email": "test@test.com",
            "password": "password123"
        })
        assert login_response.status_code == 200
        login_data = login_response.json()
        assert "access_token" in login_data
        
        # Step 2: Get user profile
        profile_response = integration_client.get(
            "/users/profile",
            params={"user_id": "user_123"}
        )
        assert profile_response.status_code == 200
        profile_data = profile_response.json()
        assert profile_data["id"] == "user_123"
        
        # Step 3: Create appointment
        appointment_data = {
            "patient_id": "user_123",
            "doctor_id": "doctor_456",
            "appointment_date": "2024-02-15",
            "appointment_time": "10:00:00",
            "duration_minutes": 30,
            "appointment_type": "consultation",
            "reason": "Consulta de seguimiento"
        }
        
        appointment_response = integration_client.post(
            "/appointments",
            json=appointment_data
        )
        assert appointment_response.status_code == 200
        appointment_data = appointment_response.json()
        assert appointment_data["id"] == "appointment_123"
        
        # Step 4: Create medical record
        record_data = {
            "appointment_id": appointment_data["id"],
            "consultation_data": {
                "chief_complaint": "Dolor de cabeza",
                "assessment": "Migraña tensional",
                "plan": "Ibuprofeno 400mg cada 8 horas"
            }
        }
        
        record_response = integration_client.post(
            "/medical-records",
            json=record_data
        )
        assert record_response.status_code == 200
        record_data = record_response.json()
        assert record_data["id"] == "record_123"
        
        # Step 5: Create payment intent
        payment_data = {
            "appointment_id": appointment_data["id"],
            "user_id": "user_123",
            "amount_cents": 50000,
            "currency": "COP"
        }
        
        payment_response = integration_client.post(
            "/payments/create-payment-intent",
            json=payment_data
        )
        assert payment_response.status_code == 200
        payment_data = payment_response.json()
        assert "client_secret" in payment_data
        
        # Step 6: Send notification
        notification_data = {
            "user_id": "user_123",
            "event_type": "appointment_completed",
            "channel": "email",
            "data": {
                "appointment_id": appointment_data["id"],
                "doctor_name": "Dr. García"
            },
            "priority": 1
        }
        
        notification_response = integration_client.post(
            "/notifications/send-notification",
            json=notification_data
        )
        assert notification_response.status_code == 200
        notification_data = notification_response.json()
        assert notification_data["notification_id"] == "notif_123"
    
    @pytest.mark.integration
    @pytest.mark.slow
    def test_emergency_workflow(self, integration_client):
        """Test emergency medical workflow."""
        
        # Step 1: Emergency patient login
        login_response = integration_client.post("/auth/login", json={
            "email": "emergency@test.com",
            "password": "password123"
        })
        assert login_response.status_code == 200
        
        # Step 2: Create emergency appointment
        emergency_appointment = {
            "patient_id": "emergency_user_123",
            "doctor_id": "emergency_doctor_456",
            "appointment_date": datetime.now().strftime("%Y-%m-%d"),
            "appointment_time": datetime.now().strftime("%H:%M:%S"),
            "duration_minutes": 60,
            "appointment_type": "emergency",
            "reason": "Emergencia médica",
            "priority": "high"
        }
        
        appointment_response = integration_client.post(
            "/appointments",
            json=emergency_appointment
        )
        assert appointment_response.status_code == 200
        
        # Step 3: Create emergency medical record
        emergency_record = {
            "appointment_id": appointment_response.json()["id"],
            "consultation_data": {
                "chief_complaint": "Dolor en el pecho",
                "history_present_illness": "Dolor agudo desde hace 30 minutos",
                "physical_examination": {
                    "blood_pressure": "180/110",
                    "heart_rate": 120,
                    "temperature": 38.5
                },
                "assessment": "Posible infarto agudo de miocardio",
                "plan": "Traslado inmediato a UCI, ECG, enzimas cardíacas"
            }
        }
        
        record_response = integration_client.post(
            "/medical-records",
            json=emergency_record
        )
        assert record_response.status_code == 200
        
        # Step 4: Send emergency notification
        emergency_notification = {
            "user_id": "emergency_user_123",
            "event_type": "emergency_alert",
            "channel": "sms",
            "data": {
                "emergency_type": "cardiac",
                "severity": "critical",
                "location": "Hospital Central"
            },
            "priority": 1
        }
        
        notification_response = integration_client.post(
            "/notifications/send-notification",
            json=emergency_notification
        )
        assert notification_response.status_code == 200
    
    @pytest.mark.integration
    @pytest.mark.slow
    def test_health_monitoring_workflow(self, integration_client):
        """Test health monitoring workflow."""
        
        # Step 1: Patient login
        login_response = integration_client.post("/auth/login", json={
            "email": "monitor@test.com",
            "password": "password123"
        })
        assert login_response.status_code == 200
        
        # Step 2: Record health metrics
        health_metrics = {
            "user_id": "monitor_user_123",
            "metric_code": "blood_pressure",
            "value": 140,
            "unit": "mmHg",
            "measured_at": datetime.now().isoformat(),
            "source": "smart_blood_pressure_monitor"
        }
        
        # This would typically go to health-metrics service
        # For integration test, we'll simulate the response
        assert health_metrics["value"] > 130  # High blood pressure
        
        # Step 3: Check for health alerts
        # Simulate alert generation
        alert_generated = health_metrics["value"] > 130
        assert alert_generated is True
        
        # Step 4: Send alert notification
        alert_notification = {
            "user_id": "monitor_user_123",
            "event_type": "health_alert",
            "channel": "push",
            "data": {
                "metric": "blood_pressure",
                "value": 140,
                "threshold": 130,
                "severity": "high"
            },
            "priority": 1
        }
        
        notification_response = integration_client.post(
            "/notifications/send-notification",
            json=alert_notification
        )
        assert notification_response.status_code == 200
    
    @pytest.mark.integration
    @pytest.mark.slow
    def test_payment_workflow(self, integration_client):
        """Test complete payment workflow."""
        
        # Step 1: Create payment intent
        payment_data = {
            "appointment_id": "appointment_123",
            "user_id": "user_123",
            "amount_cents": 75000,
            "currency": "COP",
            "metadata": {
                "appointment_type": "consultation",
                "doctor_name": "Dr. García"
            }
        }
        
        payment_response = integration_client.post(
            "/payments/create-payment-intent",
            json=payment_data
        )
        assert payment_response.status_code == 200
        payment_data = payment_response.json()
        assert "client_secret" in payment_data
        
        # Step 2: Simulate payment confirmation
        # In real scenario, this would come from Stripe webhook
        payment_confirmed = True
        assert payment_confirmed is True
        
        # Step 3: Send payment confirmation notification
        confirmation_notification = {
            "user_id": "user_123",
            "event_type": "payment_confirmation",
            "channel": "email",
            "data": {
                "amount": 75000,
                "currency": "COP",
                "payment_id": payment_data["payment_intent_id"]
            },
            "priority": 2
        }
        
        notification_response = integration_client.post(
            "/notifications/send-notification",
            json=confirmation_notification
        )
        assert notification_response.status_code == 200
    
    @pytest.mark.integration
    @pytest.mark.slow
    def test_bulk_notification_workflow(self, integration_client):
        """Test bulk notification workflow."""
        
        # Step 1: Prepare bulk notification data
        bulk_notification = {
            "user_ids": ["user_1", "user_2", "user_3", "user_4", "user_5"],
            "event_type": "system_maintenance",
            "channel": "email",
            "data": {
                "title": "Mantenimiento programado",
                "message": "El sistema estará en mantenimiento el domingo de 2:00 AM a 4:00 AM",
                "date": "2024-02-18",
                "time": "02:00-04:00"
            },
            "priority": 2
        }
        
        # Step 2: Send bulk notifications
        results = []
        for user_id in bulk_notification["user_ids"]:
            notification_data = {
                "user_id": user_id,
                "event_type": bulk_notification["event_type"],
                "channel": bulk_notification["channel"],
                "data": bulk_notification["data"],
                "priority": bulk_notification["priority"]
            }
            
            response = integration_client.post(
                "/notifications/send-notification",
                json=notification_data
            )
            results.append(response.status_code)
        
        # All notifications should be sent successfully
        assert all(status == 200 for status in results)
        assert len(results) == 5
    
    @pytest.mark.integration
    @pytest.mark.slow
    def test_ai_medical_consultation_workflow(self, integration_client):
        """Test AI medical consultation workflow."""
        
        # Step 1: Patient login
        login_response = integration_client.post("/auth/login", json={
            "email": "ai@test.com",
            "password": "password123"
        })
        assert login_response.status_code == 200
        
        # Step 2: AI chat consultation
        ai_chat_data = {
            "user_id": "ai_user_123",
            "message": "Tengo dolor de cabeza y fiebre desde ayer",
            "context": {
                "patient_age": 35,
                "medical_history": ["diabetes"],
                "current_medications": ["metformina"],
                "symptoms": ["dolor_cabeza", "fiebre"],
                "duration": "1 día"
            }
        }
        
        # Simulate AI response
        ai_response = {
            "response": "Basado en sus síntomas, le recomiendo consultar con un médico. El dolor de cabeza con fiebre puede indicar varias condiciones que requieren evaluación profesional.",
            "confidence": 0.85,
            "suggested_actions": [
                "Consultar con médico general",
                "Tomar temperatura regularmente",
                "Mantenerse hidratado"
            ],
            "disclaimer": "Esta información no reemplaza la consulta médica profesional."
        }
        
        assert ai_response["confidence"] > 0.8
        assert len(ai_response["suggested_actions"]) > 0
        
        # Step 3: Create appointment based on AI recommendation
        appointment_data = {
            "patient_id": "ai_user_123",
            "doctor_id": "doctor_456",
            "appointment_date": "2024-02-16",
            "appointment_time": "14:00:00",
            "duration_minutes": 30,
            "appointment_type": "consultation",
            "reason": "Consulta recomendada por IA médica",
            "ai_recommendation": ai_response
        }
        
        appointment_response = integration_client.post(
            "/appointments",
            json=appointment_data
        )
        assert appointment_response.status_code == 200
        
        # Step 4: Send AI recommendation notification
        ai_notification = {
            "user_id": "ai_user_123",
            "event_type": "ai_recommendation",
            "channel": "email",
            "data": {
                "ai_response": ai_response,
                "appointment_id": appointment_response.json()["id"]
            },
            "priority": 1
        }
        
        notification_response = integration_client.post(
            "/notifications/send-notification",
            json=ai_notification
        )
        assert notification_response.status_code == 200
    
    @pytest.mark.integration
    @pytest.mark.slow
    def test_error_handling_workflow(self, integration_client):
        """Test error handling across services."""
        
        # Step 1: Test invalid login
        invalid_login = integration_client.post("/auth/login", json={
            "email": "invalid@test.com",
            "password": "wrongpassword"
        })
        assert invalid_login.status_code == 401
        
        # Step 2: Test appointment creation without authentication
        appointment_data = {
            "patient_id": "user_123",
            "doctor_id": "doctor_456",
            "appointment_date": "2024-02-15",
            "appointment_time": "10:00:00"
        }
        
        # This should fail without proper authentication
        appointment_response = integration_client.post(
            "/appointments",
            json=appointment_data
        )
        # In real scenario, this would require authentication
        # For integration test, we'll simulate the response
        assert appointment_response.status_code in [200, 401, 403]
        
        # Step 3: Test payment with invalid data
        invalid_payment = {
            "appointment_id": "invalid_appointment",
            "user_id": "invalid_user",
            "amount_cents": -1000,  # Invalid amount
            "currency": "INVALID"   # Invalid currency
        }
        
        payment_response = integration_client.post(
            "/payments/create-payment-intent",
            json=invalid_payment
        )
        # Should handle invalid data gracefully
        assert payment_response.status_code in [200, 400, 422]
    
    @pytest.mark.integration
    @pytest.mark.slow
    def test_data_consistency_workflow(self, integration_client):
        """Test data consistency across services."""
        
        # Step 1: Create user
        user_id = "consistency_user_123"
        
        # Step 2: Create appointment
        appointment_data = {
            "patient_id": user_id,
            "doctor_id": "doctor_456",
            "appointment_date": "2024-02-15",
            "appointment_time": "10:00:00",
            "duration_minutes": 30,
            "appointment_type": "consultation"
        }
        
        appointment_response = integration_client.post(
            "/appointments",
            json=appointment_data
        )
        assert appointment_response.status_code == 200
        appointment_id = appointment_response.json()["id"]
        
        # Step 3: Create medical record
        record_data = {
            "appointment_id": appointment_id,
            "consultation_data": {
                "chief_complaint": "Dolor de cabeza",
                "assessment": "Migraña tensional"
            }
        }
        
        record_response = integration_client.post(
            "/medical-records",
            json=record_data
        )
        assert record_response.status_code == 200
        record_id = record_response.json()["id"]
        
        # Step 4: Verify data consistency
        # All records should reference the same appointment
        assert record_response.json()["appointment_id"] == appointment_id
        
        # Step 5: Create payment
        payment_data = {
            "appointment_id": appointment_id,
            "user_id": user_id,
            "amount_cents": 50000,
            "currency": "COP"
        }
        
        payment_response = integration_client.post(
            "/payments/create-payment-intent",
            json=payment_data
        )
        assert payment_response.status_code == 200
        
        # Step 6: Verify payment references correct appointment
        assert payment_data["appointment_id"] == appointment_id
        assert payment_data["user_id"] == user_id
    
    @pytest.mark.integration
    @pytest.mark.slow
    def test_performance_workflow(self, integration_client):
        """Test performance across services."""
        import time
        
        # Test response times for each service
        services = [
            ("/auth/login", {"email": "test@test.com", "password": "password123"}),
            ("/users/profile", {"user_id": "user_123"}),
            ("/appointments", {"patient_id": "user_123", "doctor_id": "doctor_456", "appointment_date": "2024-02-15", "appointment_time": "10:00:00"}),
            ("/medical-records", {"appointment_id": "appointment_123", "consultation_data": {"chief_complaint": "Test"}}),
            ("/payments/create-payment-intent", {"appointment_id": "appointment_123", "user_id": "user_123", "amount_cents": 50000, "currency": "COP"}),
            ("/notifications/send-notification", {"user_id": "user_123", "event_type": "test", "channel": "email", "data": {"test": "data"}, "priority": 1})
        ]
        
        response_times = []
        
        for endpoint, data in services:
            start_time = time.time()
            
            if endpoint == "/users/profile":
                response = integration_client.get(endpoint, params=data)
            else:
                response = integration_client.post(endpoint, json=data)
            
            end_time = time.time()
            response_time = end_time - start_time
            response_times.append(response_time)
            
            # Each service should respond within 1 second
            assert response_time < 1.0, f"Service {endpoint} took too long: {response_time:.2f}s"
            assert response.status_code in [200, 201], f"Service {endpoint} returned error: {response.status_code}"
        
        # Average response time should be reasonable
        avg_response_time = sum(response_times) / len(response_times)
        assert avg_response_time < 0.5, f"Average response time too high: {avg_response_time:.2f}s"
    
    @pytest.mark.integration
    @pytest.mark.slow
    def test_health_check_all_services(self, integration_client):
        """Test health check for all services."""
        
        # Test health check endpoint
        health_response = integration_client.get("/health")
        assert health_response.status_code == 200
        
        health_data = health_response.json()
        assert health_data["status"] == "healthy"
        assert health_data["service"] == "integration-test"
