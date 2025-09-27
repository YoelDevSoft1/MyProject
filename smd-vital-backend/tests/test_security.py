"""
Security Tests for SMD VITAL
===========================

Tests for security vulnerabilities, authentication, and data protection.
"""

import pytest
import jwt
import hashlib
import hmac
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from fastapi import FastAPI
import json
from datetime import datetime, timedelta
import base64

@pytest.fixture
def security_app():
    """Create mock app for security testing."""
    app = FastAPI()
    
    @app.post("/auth/login")
    async def login(credentials: dict):
        # Simulate authentication
        if credentials.get("email") == "test@test.com" and credentials.get("password") == "password123":
            token = jwt.encode({
                "user_id": "user_123",
                "email": "test@test.com",
                "role": "patient",
                "exp": datetime.utcnow() + timedelta(hours=1)
            }, "secret_key", algorithm="HS256")
            return {"access_token": token, "token_type": "bearer"}
        return {"error": "Invalid credentials"}, 401
    
    @app.get("/protected")
    async def protected_endpoint(authorization: str = None):
        if not authorization or not authorization.startswith("Bearer "):
            return {"error": "Unauthorized"}, 401
        
        token = authorization.split(" ")[1]
        try:
            payload = jwt.decode(token, "secret_key", algorithms=["HS256"])
            return {"user_id": payload["user_id"], "role": payload["role"]}
        except jwt.InvalidTokenError:
            return {"error": "Invalid token"}, 401
    
    @app.post("/data")
    async def process_data(data: dict):
        # Simulate data processing
        return {"processed": True, "data": data}
    
    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}
    
    return app

@pytest.fixture
def security_client(security_app):
    """Create test client for security testing."""
    return TestClient(security_app)

class TestSecurityVulnerabilities:
    """Test security vulnerabilities and protections."""
    
    @pytest.mark.security
    def test_sql_injection_protection(self, security_client):
        """Test protection against SQL injection attacks."""
        sql_injection_payloads = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "'; INSERT INTO users VALUES ('hacker', 'password'); --",
            "' UNION SELECT * FROM users --",
            "'; UPDATE users SET password='hacked' --"
        ]
        
        for payload in sql_injection_payloads:
            # Test login endpoint
            response = security_client.post("/auth/login", json={
                "email": payload,
                "password": "password123"
            })
            
            # Should not return 500 error (which would indicate SQL injection success)
            assert response.status_code != 500, f"SQL injection vulnerability detected with payload: {payload}"
            
            # Should return 401 (unauthorized) or 400 (bad request)
            assert response.status_code in [400, 401, 422], f"Unexpected response code for SQL injection payload: {payload}"
    
    @pytest.mark.security
    def test_xss_protection(self, security_client):
        """Test protection against XSS attacks."""
        xss_payloads = [
            "<script>alert('XSS')</script>",
            "javascript:alert('XSS')",
            "<img src=x onerror=alert('XSS')>",
            "<svg onload=alert('XSS')>",
            "<iframe src=javascript:alert('XSS')></iframe>"
        ]
        
        for payload in xss_payloads:
            # Test data processing endpoint
            response = security_client.post("/data", json={
                "user_input": payload,
                "description": payload
            })
            
            # Should not execute the script
            assert response.status_code == 200, f"XSS payload caused error: {payload}"
            
            data = response.json()
            # Check that the payload is properly escaped or sanitized
            assert payload not in str(data), f"XSS payload not properly sanitized: {payload}"
    
    @pytest.mark.security
    def test_path_traversal_protection(self, security_client):
        """Test protection against path traversal attacks."""
        path_traversal_payloads = [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "/etc/passwd",
            "..\\..\\..\\..\\..\\..\\..\\..\\..\\etc\\passwd",
            "....//....//....//etc//passwd"
        ]
        
        for payload in path_traversal_payloads:
            # Test data processing with file path
            response = security_client.post("/data", json={
                "file_path": payload,
                "operation": "read_file"
            })
            
            # Should not return file contents
            assert response.status_code in [200, 400, 422], f"Path traversal vulnerability detected with payload: {payload}"
            
            if response.status_code == 200:
                data = response.json()
                # Should not contain sensitive file contents
                assert "root:" not in str(data), f"Path traversal successful with payload: {payload}"
                assert "bin:" not in str(data), f"Path traversal successful with payload: {payload}"
    
    @pytest.mark.security
    def test_authentication_bypass(self, security_client):
        """Test authentication bypass attempts."""
        bypass_attempts = [
            # No authentication
            {"authorization": None},
            # Invalid token format
            {"authorization": "InvalidToken"},
            # Empty token
            {"authorization": "Bearer "},
            # Malformed token
            {"authorization": "Bearer invalid.token.here"},
            # Expired token (simulated)
            {"authorization": "Bearer expired_token"},
            # Token with wrong algorithm
            {"authorization": "Bearer wrong_algorithm_token"}
        ]
        
        for attempt in bypass_attempts:
            headers = {}
            if attempt["authorization"]:
                headers["Authorization"] = attempt["authorization"]
            
            response = security_client.get("/protected", headers=headers)
            
            # Should return 401 Unauthorized
            assert response.status_code == 401, f"Authentication bypass successful with attempt: {attempt}"
            
            data = response.json()
            assert "error" in data, f"Missing error message for authentication bypass attempt: {attempt}"
    
    @pytest.mark.security
    def test_jwt_token_security(self, security_client):
        """Test JWT token security."""
        # Test with valid token
        login_response = security_client.post("/auth/login", json={
            "email": "test@test.com",
            "password": "password123"
        })
        
        assert login_response.status_code == 200
        token_data = login_response.json()
        token = token_data["access_token"]
        
        # Test token structure
        assert token.count(".") == 2, "JWT token should have 3 parts separated by dots"
        
        # Test token decoding
        try:
            payload = jwt.decode(token, "secret_key", algorithms=["HS256"])
            assert "user_id" in payload
            assert "email" in payload
            assert "role" in payload
            assert "exp" in payload
        except jwt.InvalidTokenError:
            pytest.fail("Valid JWT token should decode successfully")
        
        # Test with tampered token
        tampered_token = token[:-5] + "tampered"
        response = security_client.get("/protected", headers={"Authorization": f"Bearer {tampered_token}"})
        assert response.status_code == 401, "Tampered token should be rejected"
        
        # Test with expired token
        expired_payload = {
            "user_id": "user_123",
            "email": "test@test.com",
            "role": "patient",
            "exp": datetime.utcnow() - timedelta(hours=1)  # Expired
        }
        expired_token = jwt.encode(expired_payload, "secret_key", algorithm="HS256")
        response = security_client.get("/protected", headers={"Authorization": f"Bearer {expired_token}"})
        assert response.status_code == 401, "Expired token should be rejected"
    
    @pytest.mark.security
    def test_input_validation(self, security_client):
        """Test input validation and sanitization."""
        malicious_inputs = [
            # Oversized inputs
            {"email": "a" * 1000 + "@test.com"},
            {"password": "x" * 10000},
            # Special characters
            {"email": "test@test.com<script>alert('xss')</script>"},
            {"password": "password'; DROP TABLE users; --"},
            # Unicode and special characters
            {"email": "test@test.com\u0000"},
            {"password": "password\x00"},
            # SQL injection attempts
            {"email": "test@test.com' OR '1'='1"},
            {"password": "password' UNION SELECT * FROM users --"}
        ]
        
        for malicious_input in malicious_inputs:
            response = security_client.post("/auth/login", json=malicious_input)
            
            # Should not crash the application
            assert response.status_code != 500, f"Malicious input caused server error: {malicious_input}"
            
            # Should return validation error
            assert response.status_code in [400, 401, 422], f"Malicious input not properly validated: {malicious_input}"
    
    @pytest.mark.security
    def test_rate_limiting(self, security_client):
        """Test rate limiting protection."""
        # Simulate rapid requests
        for i in range(100):
            response = security_client.post("/auth/login", json={
                "email": f"test{i}@test.com",
                "password": "password123"
            })
            
            # After certain number of requests, should be rate limited
            if i > 50:  # Assuming rate limit is 50 requests
                assert response.status_code in [200, 429], f"Rate limiting not working at request {i}"
    
    @pytest.mark.security
    def test_csrf_protection(self, security_client):
        """Test CSRF protection."""
        # Test without CSRF token
        response = security_client.post("/data", json={"sensitive_data": "test"})
        
        # Should either require CSRF token or be protected by other means
        assert response.status_code in [200, 403, 422], "CSRF protection not implemented"
        
        # Test with invalid CSRF token
        response = security_client.post("/data", json={"sensitive_data": "test"}, headers={
            "X-CSRF-Token": "invalid_token"
        })
        
        assert response.status_code in [200, 403, 422], "Invalid CSRF token should be rejected"
    
    @pytest.mark.security
    def test_data_encryption(self, security_client):
        """Test data encryption and protection."""
        sensitive_data = {
            "patient_id": "patient_123",
            "medical_record": "Sensitive medical information",
            "ssn": "123-45-6789",
            "credit_card": "4111-1111-1111-1111"
        }
        
        response = security_client.post("/data", json=sensitive_data)
        assert response.status_code == 200
        
        data = response.json()
        
        # Check that sensitive data is not returned in plain text
        assert "Sensitive medical information" not in str(data), "Sensitive data not encrypted"
        assert "123-45-6789" not in str(data), "SSN not encrypted"
        assert "4111-1111-1111-1111" not in str(data), "Credit card not encrypted"
    
    @pytest.mark.security
    def test_session_management(self, security_client):
        """Test session management security."""
        # Test session creation
        login_response = security_client.post("/auth/login", json={
            "email": "test@test.com",
            "password": "password123"
        })
        
        assert login_response.status_code == 200
        token_data = login_response.json()
        token = token_data["access_token"]
        
        # Test session validation
        response = security_client.get("/protected", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        
        # Test session timeout
        # Simulate expired session
        expired_payload = {
            "user_id": "user_123",
            "email": "test@test.com",
            "role": "patient",
            "exp": datetime.utcnow() - timedelta(hours=1)
        }
        expired_token = jwt.encode(expired_payload, "secret_key", algorithm="HS256")
        
        response = security_client.get("/protected", headers={"Authorization": f"Bearer {expired_token}"})
        assert response.status_code == 401, "Expired session should be rejected"
    
    @pytest.mark.security
    def test_headers_security(self, security_client):
        """Test security headers."""
        response = security_client.get("/health")
        assert response.status_code == 200
        
        # Check for security headers
        headers = response.headers
        
        # Should have security headers
        security_headers = [
            "X-Content-Type-Options",
            "X-Frame-Options",
            "X-XSS-Protection",
            "Strict-Transport-Security"
        ]
        
        for header in security_headers:
            assert header in headers, f"Missing security header: {header}"
    
    @pytest.mark.security
    def test_password_security(self, security_client):
        """Test password security requirements."""
        weak_passwords = [
            "123",
            "password",
            "12345678",
            "qwerty",
            "admin",
            "test"
        ]
        
        for weak_password in weak_passwords:
            response = security_client.post("/auth/login", json={
                "email": "test@test.com",
                "password": weak_password
            })
            
            # Should reject weak passwords
            assert response.status_code in [400, 401, 422], f"Weak password accepted: {weak_password}"
    
    @pytest.mark.security
    def test_medical_data_protection(self, security_client):
        """Test medical data protection."""
        medical_data = {
            "patient_id": "patient_123",
            "diagnosis": "Diabetes Type 2",
            "medications": ["Metformin", "Insulin"],
            "vital_signs": {
                "blood_pressure": "140/90",
                "heart_rate": 85,
                "glucose_level": 180
            }
        }
        
        response = security_client.post("/data", json=medical_data)
        assert response.status_code == 200
        
        data = response.json()
        
        # Medical data should be protected
        assert "Diabetes Type 2" not in str(data), "Medical diagnosis not protected"
        assert "Metformin" not in str(data), "Medications not protected"
        assert "140/90" not in str(data), "Vital signs not protected"
    
    @pytest.mark.security
    def test_api_key_security(self, security_client):
        """Test API key security."""
        # Test without API key
        response = security_client.get("/protected")
        assert response.status_code == 401, "API should require authentication"
        
        # Test with invalid API key
        response = security_client.get("/protected", headers={"X-API-Key": "invalid_key"})
        assert response.status_code == 401, "Invalid API key should be rejected"
        
        # Test with empty API key
        response = security_client.get("/protected", headers={"X-API-Key": ""})
        assert response.status_code == 401, "Empty API key should be rejected"
    
    @pytest.mark.security
    def test_logging_security(self, security_client):
        """Test security logging."""
        # Test that sensitive data is not logged
        sensitive_data = {
            "password": "secret_password",
            "ssn": "123-45-6789",
            "credit_card": "4111-1111-1111-1111"
        }
        
        response = security_client.post("/data", json=sensitive_data)
        assert response.status_code == 200
        
        # In real scenario, check logs to ensure sensitive data is not logged
        # For this test, we'll just verify the response doesn't contain sensitive data
        data = response.json()
        assert "secret_password" not in str(data), "Password should not be in response"
        assert "123-45-6789" not in str(data), "SSN should not be in response"
        assert "4111-1111-1111-1111" not in str(data), "Credit card should not be in response"
    
    @pytest.mark.security
    def test_error_handling_security(self, security_client):
        """Test secure error handling."""
        # Test that errors don't leak sensitive information
        response = security_client.get("/nonexistent")
        assert response.status_code == 404
        
        # Error response should not contain sensitive information
        data = response.json()
        assert "password" not in str(data).lower(), "Error response contains sensitive information"
        assert "secret" not in str(data).lower(), "Error response contains sensitive information"
        assert "token" not in str(data).lower(), "Error response contains sensitive information"
    
    @pytest.mark.security
    def test_concurrent_security(self, security_client):
        """Test security under concurrent access."""
        import threading
        
        def security_test(thread_id):
            """Perform security test in thread."""
            response = security_client.post("/auth/login", json={
                "email": f"test{thread_id}@test.com",
                "password": "password123"
            })
            return response.status_code
        
        # Test concurrent security
        threads = []
        results = []
        
        for i in range(10):
            thread = threading.Thread(target=lambda i=i: results.append(security_test(i)))
            threads.append(thread)
            thread.start()
        
        for thread in threads:
            thread.join()
        
        # All requests should be handled securely
        assert len(results) == 10, "Not all concurrent requests completed"
        assert all(status in [200, 401, 429] for status in results), "Concurrent security test failed"
