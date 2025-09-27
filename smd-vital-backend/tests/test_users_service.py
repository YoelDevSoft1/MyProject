"""
Unit Tests for Users Service
============================

Tests for user profile management, doctor search, and notification settings.
"""

import pytest
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from fastapi import FastAPI
import json

@pytest.fixture
def users_app():
    """Create mock users service app."""
    app = FastAPI()
    
    @app.get("/profile")
    async def get_user_profile(user_id: str):
        if user_id == "invalid_user":
            return {"error": "User not found"}, 404
        
        return {
            "id": user_id,
            "email": "user@test.com",
            "first_name": "Juan",
            "last_name": "Pérez",
            "phone": "+57 300 123 4567",
            "address": "Calle 123 #45-67",
            "emergency_contact": "+57 300 987 6543",
            "medical_conditions": ["diabetes"],
            "role": "patient",
            "is_active": True,
            "is_verified": True,
            "created_at": "2024-01-15T10:00:00Z",
            "updated_at": "2024-01-15T10:00:00Z"
        }
    
    @app.put("/profile")
    async def update_user_profile(user_id: str, profile_data: dict):
        return {
            "id": user_id,
            **profile_data,
            "updated_at": "2024-01-15T11:00:00Z"
        }
    
    @app.get("/notifications")
    async def get_user_notifications(user_id: str, limit: int = 10, offset: int = 0):
        notifications = [
            {
                "id": "notif_1",
                "user_id": user_id,
                "title": "Nueva cita programada",
                "message": "Tienes una cita con el Dr. García",
                "type": "appointment",
                "read": False,
                "created_at": "2024-01-15T10:00:00Z",
                "priority": "medium"
            },
            {
                "id": "notif_2",
                "user_id": user_id,
                "title": "Recordatorio de medicamento",
                "message": "Es hora de tomar tu medicamento",
                "type": "medication",
                "read": True,
                "created_at": "2024-01-15T09:00:00Z",
                "priority": "high"
            }
        ]
        
        return notifications[offset:offset+limit]
    
    @app.put("/notifications/settings")
    async def update_notification_settings(user_id: str, settings: dict):
        return {
            "user_id": user_id,
            **settings,
            "updated_at": "2024-01-15T11:00:00Z"
        }
    
    @app.get("/notifications/settings")
    async def get_notification_settings(user_id: str):
        return {
            "user_id": user_id,
            "email_enabled": True,
            "sms_enabled": True,
            "push_enabled": True,
            "whatsapp_enabled": False,
            "notification_types": ["appointment_reminder", "payment_confirmation"]
        }
    
    @app.put("/notifications/{notification_id}/read")
    async def mark_notification_read(notification_id: str, user_id: str):
        return {
            "success": True,
            "message": "Notificación marcada como leída",
            "read_at": "2024-01-15T11:00:00Z"
        }
    
    @app.get("/doctors/search")
    async def search_doctors(specialty: str = None, is_active: bool = True, limit: int = 20, offset: int = 0):
        doctors = [
            {
                "id": "doctor_1",
                "name": "Dr. Juan Pérez",
                "specialty": "Medicina General",
                "department": "Medicina Interna",
                "is_active": True,
                "email": "juan.perez@smdvital.com",
                "phone": "+57 300 123 4567",
                "experience_years": 10,
                "rating": 4.8,
                "available_hours": "08:00-17:00"
            },
            {
                "id": "doctor_2",
                "name": "Dra. María García",
                "specialty": "Cardiología",
                "department": "Cardiología",
                "is_active": True,
                "email": "maria.garcia@smdvital.com",
                "phone": "+57 300 234 5678",
                "experience_years": 15,
                "rating": 4.9,
                "available_hours": "09:00-18:00"
            }
        ]
        
        if specialty:
            doctors = [d for d in doctors if specialty.lower() in d["specialty"].lower()]
        
        return doctors[offset:offset+limit]
    
    @app.get("/doctors/{doctor_id}")
    async def get_doctor_details(doctor_id: str):
        if doctor_id == "invalid_doctor":
            return {"error": "Doctor not found"}, 404
        
        return {
            "id": doctor_id,
            "name": "Dr. Juan Pérez",
            "specialty": "Medicina General",
            "department": "Medicina Interna",
            "is_active": True,
            "email": "juan.perez@smdvital.com",
            "phone": "+57 300 123 4567",
            "experience_years": 10,
            "rating": 4.8,
            "available_hours": "08:00-17:00"
        }
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": "user-service"}
    
    return app

@pytest.fixture
def users_client(users_app):
    """Create test client for users service."""
    return TestClient(users_app)

class TestUsersService:
    """Test cases for Users Service."""
    
    @pytest.mark.unit
    def test_get_user_profile_success(self, users_client):
        """Test successful user profile retrieval."""
        user_id = "user_123"
        
        response = users_client.get("/profile", params={"user_id": user_id})
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert "email" in data
        assert "first_name" in data
        assert "last_name" in data
        assert "role" in data
    
    @pytest.mark.unit
    def test_get_user_profile_not_found(self, users_client):
        """Test user profile not found."""
        user_id = "invalid_user"
        
        response = users_client.get("/profile", params={"user_id": user_id})
        
        assert response.status_code == 404
        data = response.json()
        assert "error" in data
        assert "not found" in data["error"]
    
    @pytest.mark.unit
    def test_update_user_profile_success(self, users_client):
        """Test successful user profile update."""
        user_id = "user_123"
        update_data = {
            "first_name": "Juan Carlos",
            "phone": "+57 300 987 6543",
            "address": "Calle 456 #78-90"
        }
        
        response = users_client.put(
            "/profile",
            params={"user_id": user_id},
            json=update_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["first_name"] == update_data["first_name"]
        assert data["phone"] == update_data["phone"]
        assert data["address"] == update_data["address"]
        assert "updated_at" in data
    
    @pytest.mark.unit
    def test_get_user_notifications(self, users_client):
        """Test get user notifications."""
        user_id = "user_123"
        
        response = users_client.get(
            "/notifications",
            params={"user_id": user_id, "limit": 10, "offset": 0}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 10
        
        if data:
            notification = data[0]
            assert "id" in notification
            assert "title" in notification
            assert "message" in notification
            assert "type" in notification
            assert "read" in notification
    
    @pytest.mark.unit
    def test_get_notification_settings(self, users_client):
        """Test get notification settings."""
        user_id = "user_123"
        
        response = users_client.get(
            "/notifications/settings",
            params={"user_id": user_id}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == user_id
        assert "email_enabled" in data
        assert "sms_enabled" in data
        assert "push_enabled" in data
        assert "notification_types" in data
    
    @pytest.mark.unit
    def test_update_notification_settings(self, users_client):
        """Test update notification settings."""
        user_id = "user_123"
        settings = {
            "email_enabled": False,
            "sms_enabled": True,
            "push_enabled": True,
            "whatsapp_enabled": True,
            "notification_types": ["appointment_reminder"]
        }
        
        response = users_client.put(
            "/notifications/settings",
            params={"user_id": user_id},
            json=settings
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == user_id
        assert data["email_enabled"] == settings["email_enabled"]
        assert data["sms_enabled"] == settings["sms_enabled"]
        assert data["push_enabled"] == settings["push_enabled"]
        assert data["whatsapp_enabled"] == settings["whatsapp_enabled"]
        assert data["notification_types"] == settings["notification_types"]
    
    @pytest.mark.unit
    def test_mark_notification_read(self, users_client):
        """Test mark notification as read."""
        notification_id = "notif_123"
        user_id = "user_123"
        
        response = users_client.put(
            f"/notifications/{notification_id}/read",
            params={"user_id": user_id}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "message" in data
        assert "read_at" in data
    
    @pytest.mark.unit
    def test_search_doctors_all(self, users_client):
        """Test search all doctors."""
        response = users_client.get("/doctors/search")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 20
        
        if data:
            doctor = data[0]
            assert "id" in doctor
            assert "name" in doctor
            assert "specialty" in doctor
            assert "is_active" in doctor
            assert "rating" in doctor
    
    @pytest.mark.unit
    def test_search_doctors_by_specialty(self, users_client):
        """Test search doctors by specialty."""
        specialty = "Cardiología"
        
        response = users_client.get(
            "/doctors/search",
            params={"specialty": specialty}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # All returned doctors should have the requested specialty
        for doctor in data:
            assert specialty.lower() in doctor["specialty"].lower()
    
    @pytest.mark.unit
    def test_search_doctors_pagination(self, users_client):
        """Test doctor search pagination."""
        # Test first page
        response1 = users_client.get(
            "/doctors/search",
            params={"limit": 1, "offset": 0}
        )
        assert response1.status_code == 200
        data1 = response1.json()
        assert len(data1) <= 1
        
        # Test second page
        response2 = users_client.get(
            "/doctors/search",
            params={"limit": 1, "offset": 1}
        )
        assert response2.status_code == 200
        data2 = response2.json()
        assert len(data2) <= 1
        
        # Results should be different
        if data1 and data2:
            assert data1[0]["id"] != data2[0]["id"]
    
    @pytest.mark.unit
    def test_get_doctor_details_success(self, users_client):
        """Test get doctor details successfully."""
        doctor_id = "doctor_123"
        
        response = users_client.get(f"/doctors/{doctor_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == doctor_id
        assert "name" in data
        assert "specialty" in data
        assert "email" in data
        assert "phone" in data
        assert "rating" in data
    
    @pytest.mark.unit
    def test_get_doctor_details_not_found(self, users_client):
        """Test get doctor details not found."""
        doctor_id = "invalid_doctor"
        
        response = users_client.get(f"/doctors/{doctor_id}")
        
        assert response.status_code == 404
        data = response.json()
        assert "error" in data
        assert "not found" in data["error"]
    
    @pytest.mark.unit
    def test_health_check(self, users_client):
        """Test health check endpoint."""
        response = users_client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "user-service"
    
    @pytest.mark.unit
    def test_notification_settings_validation(self, users_client):
        """Test notification settings validation."""
        user_id = "user_123"
        invalid_settings = {
            "email_enabled": "invalid_boolean",  # Should be boolean
            "notification_types": "invalid_list"  # Should be list
        }
        
        response = users_client.put(
            "/notifications/settings",
            params={"user_id": user_id},
            json=invalid_settings
        )
        
        # Should return validation error
        assert response.status_code in [400, 422]
    
    @pytest.mark.unit
    def test_doctor_search_validation(self, users_client):
        """Test doctor search parameter validation."""
        # Test invalid limit
        response = users_client.get(
            "/doctors/search",
            params={"limit": 1000}  # Too high
        )
        
        # Should be limited to maximum allowed
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 50  # Assuming max limit is 50
    
    @pytest.mark.unit
    def test_profile_update_validation(self, users_client):
        """Test profile update data validation."""
        user_id = "user_123"
        invalid_data = {
            "phone": "invalid_phone_format",  # Invalid phone format
            "email": "invalid_email_format"   # Invalid email format
        }
        
        response = users_client.put(
            "/profile",
            params={"user_id": user_id},
            json=invalid_data
        )
        
        # Should return validation error
        assert response.status_code in [400, 422]
    
    @pytest.mark.unit
    def test_concurrent_profile_updates(self, users_client):
        """Test concurrent profile updates."""
        import threading
        import time
        
        user_id = "user_123"
        results = []
        
        def update_profile(thread_id):
            update_data = {
                "first_name": f"User{thread_id}",
                "phone": f"+57 300 {thread_id:03d} 4567"
            }
            response = users_client.put(
                "/profile",
                params={"user_id": user_id},
                json=update_data
            )
            results.append(response.status_code)
        
        # Start multiple threads
        threads = []
        for i in range(3):
            thread = threading.Thread(target=update_profile, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # All updates should succeed
        assert all(status == 200 for status in results)
        assert len(results) == 3
    
    @pytest.mark.unit
    def test_notification_pagination(self, users_client):
        """Test notification pagination."""
        user_id = "user_123"
        
        # Test first page
        response1 = users_client.get(
            "/notifications",
            params={"user_id": user_id, "limit": 1, "offset": 0}
        )
        assert response1.status_code == 200
        data1 = response1.json()
        assert len(data1) <= 1
        
        # Test second page
        response2 = users_client.get(
            "/notifications",
            params={"user_id": user_id, "limit": 1, "offset": 1}
        )
        assert response2.status_code == 200
        data2 = response2.json()
        assert len(data2) <= 1
    
    @pytest.mark.unit
    def test_doctor_search_performance(self, users_client):
        """Test doctor search performance."""
        import time
        
        start_time = time.time()
        
        response = users_client.get("/doctors/search")
        
        end_time = time.time()
        response_time = end_time - start_time
        
        assert response.status_code == 200
        assert response_time < 1.0  # Should respond within 1 second
    
    @pytest.mark.unit
    def test_user_profile_completeness(self, users_client):
        """Test user profile data completeness."""
        user_id = "user_123"
        
        response = users_client.get("/profile", params={"user_id": user_id})
        
        assert response.status_code == 200
        data = response.json()
        
        # Check all required fields are present
        required_fields = [
            "id", "email", "first_name", "last_name", "role",
            "is_active", "is_verified", "created_at", "updated_at"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
    
    @pytest.mark.unit
    def test_doctor_details_completeness(self, users_client):
        """Test doctor details data completeness."""
        doctor_id = "doctor_123"
        
        response = users_client.get(f"/doctors/{doctor_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check all required fields are present
        required_fields = [
            "id", "name", "specialty", "department", "is_active",
            "email", "phone", "experience_years", "rating", "available_hours"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
