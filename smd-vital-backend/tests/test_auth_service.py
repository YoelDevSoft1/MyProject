"""
Unit Tests for Authentication Service
====================================

Tests for user registration, login, password management, and token handling.
"""

import pytest
import jwt
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from fastapi import FastAPI
import json

# Mock the authentication service
@pytest.fixture
def auth_app():
    """Create mock authentication service app."""
    app = FastAPI()
    
    @app.post("/auth/register")
    async def register(user_data: dict):
        if user_data.get("email") == "existing@test.com":
            return {"error": "Email already exists"}, 409
        return {"user": user_data, "message": "User registered successfully"}, 201
    
    @app.post("/auth/login")
    async def login(credentials: dict):
        if credentials.get("email") == "test@test.com" and credentials.get("password") == "password123":
            token = jwt.encode({
                "user_id": "user_123",
                "email": "test@test.com",
                "role": "patient",
                "exp": datetime.utcnow() + timedelta(hours=1)
            }, "test_secret", algorithm="HS256")
            return {
                "access_token": token,
                "refresh_token": token,
                "token_type": "bearer",
                "expires_in": 3600,
                "user": {"id": "user_123", "email": "test@test.com", "role": "patient"}
            }, 200
        return {"error": "Invalid credentials"}, 401
    
    @app.post("/auth/refresh")
    async def refresh_token(refresh_data: dict):
        return {"access_token": "new_token", "expires_in": 3600}, 200
    
    @app.post("/auth/logout")
    async def logout():
        return {"message": "Logged out successfully"}, 200
    
    @app.post("/auth/forgot-password")
    async def forgot_password(data: dict):
        return {"message": "Password reset email sent"}, 200
    
    @app.post("/auth/reset-password")
    async def reset_password(data: dict):
        return {"message": "Password reset successfully"}, 200
    
    @app.get("/auth/verify-email/{token}")
    async def verify_email(token: str):
        return {"message": "Email verified successfully"}, 200
    
    @app.get("/users/{user_id}")
    async def get_user(user_id: str):
        return {"id": user_id, "email": "test@test.com", "role": "patient"}, 200
    
    @app.put("/users/{user_id}")
    async def update_user(user_id: str, user_data: dict):
        return {"id": user_id, **user_data, "updated_at": datetime.utcnow().isoformat()}, 200
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "service": "auth-service"}, 200
    
    return app

@pytest.fixture
def auth_client(auth_app):
    """Create test client for authentication service."""
    return TestClient(auth_app)

class TestAuthenticationService:
    """Test cases for Authentication Service."""
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_user_registration_success(self, auth_client):
        """Test successful user registration."""
        user_data = {
            "email": "newuser@test.com",
            "password": "password123",
            "first_name": "Juan",
            "last_name": "Pérez",
            "phone": "+57 300 123 4567",
            "role": "patient"
        }
        
        response = auth_client.post("/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert "user" in data
        assert data["user"]["email"] == user_data["email"]
        assert "message" in data
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_user_registration_duplicate_email(self, auth_client):
        """Test registration with duplicate email."""
        user_data = {
            "email": "existing@test.com",
            "password": "password123",
            "first_name": "Juan",
            "last_name": "Pérez",
            "role": "patient"
        }
        
        response = auth_client.post("/auth/register", json=user_data)
        
        assert response.status_code == 409
        data = response.json()
        assert "error" in data
        assert "already exists" in data["error"]
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_user_login_success(self, auth_client):
        """Test successful user login."""
        credentials = {
            "email": "test@test.com",
            "password": "password123"
        }
        
        response = auth_client.post("/auth/login", json=credentials)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "user" in data
        assert data["user"]["email"] == credentials["email"]
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == 3600
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_user_login_invalid_credentials(self, auth_client):
        """Test login with invalid credentials."""
        credentials = {
            "email": "test@test.com",
            "password": "wrongpassword"
        }
        
        response = auth_client.post("/auth/login", json=credentials)
        
        assert response.status_code == 401
        data = response.json()
        assert "error" in data
        assert "Invalid credentials" in data["error"]
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_token_refresh(self, auth_client):
        """Test token refresh."""
        refresh_data = {"refresh_token": "valid_refresh_token"}
        
        response = auth_client.post("/auth/refresh", json=refresh_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "expires_in" in data
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_user_logout(self, auth_client):
        """Test user logout."""
        response = auth_client.post("/auth/logout")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Logged out" in data["message"]
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_forgot_password(self, auth_client):
        """Test forgot password functionality."""
        data = {"email": "test@test.com"}
        
        response = auth_client.post("/auth/forgot-password", json=data)
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "reset email sent" in data["message"]
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_reset_password(self, auth_client):
        """Test password reset."""
        data = {
            "token": "valid_reset_token",
            "new_password": "newpassword123"
        }
        
        response = auth_client.post("/auth/reset-password", json=data)
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "reset successfully" in data["message"]
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_email_verification(self, auth_client):
        """Test email verification."""
        token = "valid_verification_token"
        
        response = auth_client.get(f"/auth/verify-email/{token}")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "verified successfully" in data["message"]
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_get_user(self, auth_client):
        """Test get user by ID."""
        user_id = "user_123"
        
        response = auth_client.get(f"/users/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert "email" in data
        assert "role" in data
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_update_user(self, auth_client):
        """Test update user."""
        user_id = "user_123"
        update_data = {
            "first_name": "Juan Carlos",
            "phone": "+57 300 987 6543"
        }
        
        response = auth_client.put(f"/users/{user_id}", json=update_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["first_name"] == update_data["first_name"]
        assert data["phone"] == update_data["phone"]
        assert "updated_at" in data
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_health_check(self, auth_client):
        """Test health check endpoint."""
        response = auth_client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "auth-service"
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_jwt_token_validation(self, auth_client):
        """Test JWT token validation."""
        # Test with valid token
        credentials = {
            "email": "test@test.com",
            "password": "password123"
        }
        
        response = auth_client.post("/auth/login", json=credentials)
        assert response.status_code == 200
        
        data = response.json()
        token = data["access_token"]
        
        # Decode and validate token
        decoded = jwt.decode(token, "test_secret", algorithms=["HS256"])
        assert decoded["user_id"] == "user_123"
        assert decoded["email"] == "test@test.com"
        assert decoded["role"] == "patient"
        assert decoded["exp"] > datetime.utcnow().timestamp()
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_registration_validation(self, auth_client):
        """Test registration data validation."""
        # Test missing required fields
        incomplete_data = {
            "email": "test@test.com"
            # Missing password, first_name, etc.
        }
        
        response = auth_client.post("/auth/register", json=incomplete_data)
        # Should return validation error
        assert response.status_code in [400, 422]
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_password_strength_validation(self, auth_client):
        """Test password strength validation."""
        weak_password_data = {
            "email": "test@test.com",
            "password": "123",  # Too weak
            "first_name": "Juan",
            "last_name": "Pérez",
            "role": "patient"
        }
        
        response = auth_client.post("/auth/register", json=weak_password_data)
        # Should return validation error for weak password
        assert response.status_code in [400, 422]
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_email_format_validation(self, auth_client):
        """Test email format validation."""
        invalid_email_data = {
            "email": "invalid-email-format",
            "password": "password123",
            "first_name": "Juan",
            "last_name": "Pérez",
            "role": "patient"
        }
        
        response = auth_client.post("/auth/register", json=invalid_email_data)
        # Should return validation error for invalid email
        assert response.status_code in [400, 422]
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_role_validation(self, auth_client):
        """Test role validation."""
        invalid_role_data = {
            "email": "test@test.com",
            "password": "password123",
            "first_name": "Juan",
            "last_name": "Pérez",
            "role": "invalid_role"
        }
        
        response = auth_client.post("/auth/register", json=invalid_role_data)
        # Should return validation error for invalid role
        assert response.status_code in [400, 422]
    
    @pytest.mark.unit
    @pytest.mark.auth
    def test_concurrent_registration(self, auth_client):
        """Test concurrent user registration."""
        import threading
        import time
        
        results = []
        
        def register_user(email_suffix):
            user_data = {
                "email": f"concurrent{email_suffix}@test.com",
                "password": "password123",
                "first_name": "User",
                "last_name": "Test",
                "role": "patient"
            }
            response = auth_client.post("/auth/register", json=user_data)
            results.append(response.status_code)
        
        # Start multiple threads
        threads = []
        for i in range(5):
            thread = threading.Thread(target=register_user, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # All registrations should succeed
        assert all(status == 201 for status in results)
        assert len(results) == 5
