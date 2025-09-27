"""
Global Test Configuration for SMD VITAL
=======================================

Shared fixtures and configuration for all tests.
"""

import pytest
import asyncio
import os
import tempfile
from typing import Dict, Any, Generator
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import redis
from datetime import datetime, timedelta
import jwt
import json

# Test Configuration
TEST_DATABASE_URL = "sqlite:///./test.db"
TEST_REDIS_URL = "redis://localhost:6379/1"
TEST_JWT_SECRET = "test_secret_key_for_smd_vital_2024"

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
def test_database():
    """Create test database."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    return engine

@pytest.fixture(scope="function")
def db_session(test_database):
    """Create database session for tests."""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_database)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture(scope="function")
def redis_client():
    """Create Redis client for tests."""
    client = redis.Redis.from_url(TEST_REDIS_URL, decode_responses=True)
    client.flushdb()  # Clear test database
    yield client
    client.flushdb()

@pytest.fixture
def mock_jwt_token():
    """Create mock JWT token for testing."""
    payload = {
        "user_id": "test_user_123",
        "email": "test@smdvital.com",
        "role": "patient",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")
    return token

@pytest.fixture
def mock_doctor_token():
    """Create mock JWT token for doctor."""
    payload = {
        "user_id": "test_doctor_456",
        "email": "doctor@smdvital.com",
        "role": "doctor",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")
    return token

@pytest.fixture
def mock_admin_token():
    """Create mock JWT token for admin."""
    payload = {
        "user_id": "test_admin_789",
        "email": "admin@smdvital.com",
        "role": "admin",
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    token = jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")
    return token

@pytest.fixture
def sample_patient_data():
    """Sample patient data for testing."""
    return {
        "id": "patient_123",
        "email": "patient@smdvital.com",
        "first_name": "Juan",
        "last_name": "Pérez",
        "phone": "+57 300 123 4567",
        "role": "patient",
        "is_active": True,
        "is_verified": True
    }

@pytest.fixture
def sample_doctor_data():
    """Sample doctor data for testing."""
    return {
        "id": "doctor_456",
        "email": "doctor@smdvital.com",
        "first_name": "María",
        "last_name": "García",
        "phone": "+57 300 234 5678",
        "role": "doctor",
        "specialty": "Cardiología",
        "is_active": True,
        "is_verified": True
    }

@pytest.fixture
def sample_appointment_data():
    """Sample appointment data for testing."""
    return {
        "patient_id": "patient_123",
        "doctor_id": "doctor_456",
        "appointment_date": "2024-02-15",
        "appointment_time": "10:00:00",
        "duration_minutes": 30,
        "appointment_type": "consultation",
        "reason": "Consulta de seguimiento",
        "notes": "Paciente con diabetes"
    }

@pytest.fixture
def sample_medical_record_data():
    """Sample medical record data for testing."""
    return {
        "appointment_id": "appointment_789",
        "consultation_data": {
            "chief_complaint": "Dolor de cabeza",
            "history_present_illness": "Dolor desde hace 3 días",
            "physical_examination": {
                "blood_pressure": "120/80",
                "heart_rate": 72,
                "temperature": 36.5
            },
            "assessment": "Migraña tensional",
            "plan": "Ibuprofeno 400mg cada 8 horas"
        }
    }

@pytest.fixture
def sample_vital_signs_data():
    """Sample vital signs data for testing."""
    return {
        "patient_id": "patient_123",
        "systolic_bp": 120,
        "diastolic_bp": 80,
        "heart_rate": 72,
        "respiratory_rate": 16,
        "temperature_celsius": 36.5,
        "oxygen_saturation": 98,
        "height_cm": 175.0,
        "weight_kg": 70.5,
        "glucose_level": 95,
        "pain_scale": 2
    }

@pytest.fixture
def sample_payment_data():
    """Sample payment data for testing."""
    return {
        "appointment_id": "appointment_789",
        "user_id": "user_123",
        "amount_cents": 50000,
        "currency": "COP",
        "metadata": {
            "appointment_type": "consultation",
            "doctor_name": "Dr. García"
        }
    }

@pytest.fixture
def sample_notification_data():
    """Sample notification data for testing."""
    return {
        "user_id": "user_123",
        "event_type": "appointment_reminder",
        "channel": "email",
        "data": {
            "appointment_date": "2024-02-15",
            "appointment_time": "10:00:00",
            "doctor_name": "Dr. García"
        },
        "priority": 1
    }

@pytest.fixture
def mock_stripe():
    """Mock Stripe for payment testing."""
    with patch('stripe.PaymentIntent.create') as mock_create, \
         patch('stripe.Refund.create') as mock_refund, \
         patch('stripe.Invoice.create') as mock_invoice:
        
        mock_create.return_value = Mock(
            id="pi_test_123",
            client_secret="pi_test_123_secret",
            status="requires_payment_method"
        )
        
        mock_refund.return_value = Mock(
            id="re_test_123",
            status="succeeded"
        )
        
        mock_invoice.return_value = Mock(
            id="in_test_123",
            status="draft"
        )
        
        yield {
            'create': mock_create,
            'refund': mock_refund,
            'invoice': mock_invoice
        }

@pytest.fixture
def mock_smtp():
    """Mock SMTP for email testing."""
    with patch('smtplib.SMTP') as mock_smtp:
        mock_server = Mock()
        mock_smtp.return_value.__enter__.return_value = mock_server
        yield mock_server

@pytest.fixture
def mock_requests():
    """Mock requests for external API calls."""
    with patch('requests.get') as mock_get, \
         patch('requests.post') as mock_post, \
         patch('requests.put') as mock_put, \
         patch('requests.delete') as mock_delete:
        
        yield {
            'get': mock_get,
            'post': mock_post,
            'put': mock_put,
            'delete': mock_delete
        }

@pytest.fixture
def test_environment():
    """Set test environment variables."""
    test_env = {
        'DATABASE_URL': TEST_DATABASE_URL,
        'REDIS_URL': TEST_REDIS_URL,
        'JWT_SECRET_KEY': TEST_JWT_SECRET,
        'STRIPE_SECRET_KEY': 'sk_test_123',
        'STRIPE_WEBHOOK_SECRET': 'whsec_test_123',
        'SMTP_HOST': 'localhost',
        'SMTP_PORT': '587',
        'SMTP_USERNAME': 'test@smdvital.com',
        'SMTP_PASSWORD': 'test_password'
    }
    
    with patch.dict(os.environ, test_env):
        yield test_env

@pytest.fixture
def mock_ai_response():
    """Mock AI service response."""
    return {
        "response": "Basado en sus síntomas, le recomiendo consultar con un médico.",
        "confidence": 0.85,
        "suggested_actions": [
            "Consultar con médico general",
            "Tomar temperatura regularmente"
        ],
        "disclaimer": "Esta información no reemplaza la consulta médica profesional."
    }

# Test Data Generators
@pytest.fixture
def generate_patients(count: int = 10):
    """Generate multiple patient records for testing."""
    patients = []
    for i in range(count):
        patients.append({
            "id": f"patient_{i}",
            "email": f"patient{i}@smdvital.com",
            "first_name": f"Patient{i}",
            "last_name": "Test",
            "phone": f"+57 300 {i:03d} 4567",
            "role": "patient"
        })
    return patients

@pytest.fixture
def generate_doctors(count: int = 5):
    """Generate multiple doctor records for testing."""
    specialties = ["Cardiología", "Neurología", "Pediatría", "Ginecología", "Dermatología"]
    doctors = []
    for i in range(count):
        doctors.append({
            "id": f"doctor_{i}",
            "email": f"doctor{i}@smdvital.com",
            "first_name": f"Doctor{i}",
            "last_name": "Test",
            "phone": f"+57 300 {i:03d} 5678",
            "role": "doctor",
            "specialty": specialties[i % len(specialties)]
        })
    return doctors

# Performance Testing Fixtures
@pytest.fixture
def performance_metrics():
    """Collect performance metrics during tests."""
    metrics = {
        'response_times': [],
        'memory_usage': [],
        'cpu_usage': []
    }
    yield metrics

# Security Testing Fixtures
@pytest.fixture
def security_test_data():
    """Data for security testing."""
    return {
        'sql_injection': [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "'; INSERT INTO users VALUES ('hacker', 'password'); --"
        ],
        'xss_payloads': [
            "<script>alert('XSS')</script>",
            "javascript:alert('XSS')",
            "<img src=x onerror=alert('XSS')>"
        ],
        'path_traversal': [
            "../../../etc/passwd",
            "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
            "/etc/passwd"
        ]
    }

# Markers for test categorization
pytestmark = [
    pytest.mark.unit,
]
