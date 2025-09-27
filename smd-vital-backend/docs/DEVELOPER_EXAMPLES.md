# 💻 **EJEMPLOS DE CÓDIGO PARA DESARROLLADORES - SMD VITAL**

## 🎯 **Guía de Implementación**

Este documento proporciona ejemplos prácticos de código para integrar con las APIs de SMD VITAL.

---

## 📋 **Índice de Contenidos**

1. [Configuración Inicial](#1-configuración-inicial)
2. [Autenticación](#2-autenticación)
3. [Gestión de Usuarios](#3-gestión-de-usuarios)
4. [Citas Médicas](#4-citas-médicas)
5. [Registros Médicos](#5-registros-médicos)
6. [Pagos](#6-pagos)
7. [Notificaciones](#7-notificaciones)
8. [Métricas de Salud](#8-métricas-de-salud)
9. [IA Médica](#9-ia-médica)
10. [Manejo de Errores](#10-manejo-de-errores)
11. [Testing](#11-testing)

---

## 1. **Configuración Inicial**

### **1.1 Variables de Entorno**

```bash
# .env
SMD_VITAL_API_BASE_URL=http://localhost
AUTH_SERVICE_URL=http://localhost:8001
USERS_SERVICE_URL=http://localhost:8002
APPOINTMENTS_SERVICE_URL=http://localhost:8003
MEDICAL_RECORDS_SERVICE_URL=http://localhost:8005
PAYMENTS_SERVICE_URL=http://localhost:8006
NOTIFICATIONS_SERVICE_URL=http://localhost:8004
HEALTH_METRICS_SERVICE_URL=http://localhost:8007
AI_LANGGRAPH_SERVICE_URL=http://localhost:8008

# Credenciales
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=notifications@smdvital.com
SMTP_PASSWORD=...
```

### **1.2 Cliente HTTP Base**

```python
# client.py
import requests
import os
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

class SMDVitalClient:
    def __init__(self, base_url: str = None):
        self.base_url = base_url or os.getenv('SMD_VITAL_API_BASE_URL', 'http://localhost')
        self.session = requests.Session()
        self.token = None
        self.token_expires = None
    
    def set_token(self, token: str, expires_in: int = 3600):
        """Configurar token de autenticación"""
        self.token = token
        self.token_expires = datetime.now() + timedelta(seconds=expires_in)
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        })
    
    def is_token_valid(self) -> bool:
        """Verificar si el token es válido"""
        if not self.token or not self.token_expires:
            return False
        return datetime.now() < self.token_expires
    
    def _make_request(self, method: str, url: str, **kwargs) -> requests.Response:
        """Realizar petición HTTP con manejo de errores"""
        if not self.is_token_valid():
            raise Exception("Token de autenticación inválido o expirado")
        
        response = self.session.request(method, url, **kwargs)
        
        if response.status_code >= 400:
            error_data = response.json() if response.content else {}
            raise Exception(f"Error {response.status_code}: {error_data.get('detail', 'Error desconocido')}")
        
        return response
```

---

## 2. **Autenticación**

### **2.1 Registro de Usuario**

```python
# auth_examples.py
from client import SMDVitalClient

def register_patient(client: SMDVitalClient):
    """Registrar nuevo paciente"""
    registration_data = {
        "email": "juan.perez@ejemplo.com",
        "password": "password123",
        "first_name": "Juan",
        "last_name": "Pérez",
        "phone": "+57 300 123 4567",
        "role": "patient"
    }
    
    response = client._make_request(
        'POST',
        f'{client.base_url}:8001/auth/register',
        json=registration_data
    )
    
    return response.json()

def login_user(client: SMDVitalClient, email: str, password: str):
    """Iniciar sesión de usuario"""
    login_data = {
        "email": email,
        "password": password
    }
    
    response = client._make_request(
        'POST',
        f'{client.base_url}:8001/auth/login',
        json=login_data
    )
    
    token_data = response.json()
    client.set_token(token_data['access_token'], token_data['expires_in'])
    
    return token_data

# Ejemplo de uso
client = SMDVitalClient()
try:
    # Registrar usuario
    user_data = register_patient(client)
    print(f"Usuario registrado: {user_data['user']['email']}")
    
    # Iniciar sesión
    token_data = login_user(client, "juan.perez@ejemplo.com", "password123")
    print(f"Token obtenido: {token_data['access_token'][:20]}...")
    
except Exception as e:
    print(f"Error: {e}")
```

### **2.2 Gestión de Tokens**

```python
# token_manager.py
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any

class TokenManager:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key
    
    def decode_token(self, token: str) -> Dict[str, Any]:
        """Decodificar token JWT"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            raise Exception("Token expirado")
        except jwt.InvalidTokenError:
            raise Exception("Token inválido")
    
    def is_token_expired(self, token: str) -> bool:
        """Verificar si el token está expirado"""
        try:
            payload = self.decode_token(token)
            exp = payload.get('exp')
            if exp:
                return datetime.utcnow().timestamp() > exp
            return True
        except:
            return True
    
    def get_user_from_token(self, token: str) -> Dict[str, Any]:
        """Obtener información del usuario del token"""
        payload = self.decode_token(token)
        return {
            'id': payload.get('user_id'),
            'email': payload.get('email'),
            'role': payload.get('role'),
            'expires_at': payload.get('exp')
        }
```

---

## 3. **Gestión de Usuarios**

### **3.1 Perfil de Usuario**

```python
# user_examples.py
from client import SMDVitalClient

def get_user_profile(client: SMDVitalClient, user_id: str):
    """Obtener perfil del usuario"""
    response = client._make_request(
        'GET',
        f'{client.base_url}:8002/profile',
        params={'user_id': user_id}
    )
    
    return response.json()

def update_user_profile(client: SMDVitalClient, user_id: str, profile_data: dict):
    """Actualizar perfil del usuario"""
    response = client._make_request(
        'PUT',
        f'{client.base_url}:8002/profile',
        params={'user_id': user_id},
        json=profile_data
    )
    
    return response.json()

def search_doctors(client: SMDVitalClient, specialty: str = None):
    """Buscar doctores por especialidad"""
    params = {}
    if specialty:
        params['specialty'] = specialty
    
    response = client._make_request(
        'GET',
        f'{client.base_url}:8002/doctors/search',
        params=params
    )
    
    return response.json()

# Ejemplo de uso
def example_user_management():
    client = SMDVitalClient()
    client.set_token("your_jwt_token_here")
    
    try:
        # Obtener perfil
        profile = get_user_profile(client, "user_123")
        print(f"Perfil: {profile['first_name']} {profile['last_name']}")
        
        # Actualizar perfil
        update_data = {
            "phone": "+57 300 987 6543",
            "address": "Calle 123 #45-67, Bogotá"
        }
        updated_profile = update_user_profile(client, "user_123", update_data)
        print("Perfil actualizado")
        
        # Buscar doctores
        doctors = search_doctors(client, "Cardiología")
        print(f"Encontrados {len(doctors)} doctores de Cardiología")
        
    except Exception as e:
        print(f"Error: {e}")
```

### **3.2 Configuración de Notificaciones**

```python
# notification_settings.py
from client import SMDVitalClient

def get_notification_settings(client: SMDVitalClient, user_id: str):
    """Obtener configuración de notificaciones"""
    response = client._make_request(
        'GET',
        f'{client.base_url}:8002/notifications/settings',
        params={'user_id': user_id}
    )
    
    return response.json()

def update_notification_settings(client: SMDVitalClient, user_id: str, settings: dict):
    """Actualizar configuración de notificaciones"""
    response = client._make_request(
        'PUT',
        f'{client.base_url}:8002/notifications/settings',
        params={'user_id': user_id},
        json=settings
    )
    
    return response.json()

# Ejemplo de configuración
def configure_user_notifications():
    client = SMDVitalClient()
    client.set_token("your_jwt_token_here")
    
    settings = {
        "email_enabled": True,
        "sms_enabled": True,
        "push_enabled": True,
        "whatsapp_enabled": False,
        "notification_types": [
            "appointment_reminder",
            "payment_confirmation",
            "lab_results"
        ]
    }
    
    try:
        result = update_notification_settings(client, "user_123", settings)
        print("Configuración de notificaciones actualizada")
    except Exception as e:
        print(f"Error: {e}")
```

---

## 4. **Citas Médicas**

### **4.1 Programar Cita**

```python
# appointment_examples.py
from client import SMDVitalClient
from datetime import datetime, timedelta

def create_appointment(client: SMDVitalClient, appointment_data: dict):
    """Crear nueva cita médica"""
    response = client._make_request(
        'POST',
        f'{client.base_url}:8003/appointments',
        json=appointment_data
    )
    
    return response.json()

def get_available_slots(client: SMDVitalClient, doctor_id: str, date: str):
    """Obtener horarios disponibles"""
    response = client._make_request(
        'GET',
        f'{client.base_url}:8003/appointments/available',
        params={
            'doctor_id': doctor_id,
            'date': date
        }
    )
    
    return response.json()

def get_patient_appointments(client: SMDVitalClient, patient_id: str):
    """Obtener citas del paciente"""
    response = client._make_request(
        'GET',
        f'{client.base_url}:8003/appointments/patient/{patient_id}'
    )
    
    return response.json()

# Ejemplo de programación de cita
def schedule_appointment_example():
    client = SMDVitalClient()
    client.set_token("your_jwt_token_here")
    
    # Obtener horarios disponibles
    available_slots = get_available_slots(client, "doctor_456", "2024-02-15")
    print(f"Horarios disponibles: {available_slots}")
    
    # Crear cita
    appointment_data = {
        "patient_id": "patient_123",
        "doctor_id": "doctor_456",
        "appointment_date": "2024-02-15",
        "appointment_time": "10:00:00",
        "duration_minutes": 30,
        "appointment_type": "consultation",
        "reason": "Consulta de seguimiento",
        "notes": "Paciente con diabetes"
    }
    
    try:
        appointment = create_appointment(client, appointment_data)
        print(f"Cita creada: {appointment['id']}")
    except Exception as e:
        print(f"Error: {e}")
```

### **4.2 Gestión de Citas**

```python
# appointment_management.py
from client import SMDVitalClient

def cancel_appointment(client: SMDVitalClient, appointment_id: str):
    """Cancelar cita médica"""
    response = client._make_request(
        'DELETE',
        f'{client.base_url}:8003/appointments/{appointment_id}'
    )
    
    return response.json()

def update_appointment(client: SMDVitalClient, appointment_id: str, update_data: dict):
    """Actualizar cita médica"""
    response = client._make_request(
        'PUT',
        f'{client.base_url}:8003/appointments/{appointment_id}',
        json=update_data
    )
    
    return response.json()

def get_appointment_details(client: SMDVitalClient, appointment_id: str):
    """Obtener detalles de la cita"""
    response = client._make_request(
        'GET',
        f'{client.base_url}:8003/appointments/{appointment_id}'
    )
    
    return response.json()

# Ejemplo de gestión de citas
def manage_appointments_example():
    client = SMDVitalClient()
    client.set_token("your_jwt_token_here")
    
    try:
        # Obtener detalles de cita
        appointment = get_appointment_details(client, "appointment_789")
        print(f"Cita: {appointment['appointment_date']} a las {appointment['appointment_time']}")
        
        # Actualizar cita
        update_data = {
            "appointment_time": "11:00:00",
            "notes": "Cambio de horario solicitado por el paciente"
        }
        updated_appointment = update_appointment(client, "appointment_789", update_data)
        print("Cita actualizada")
        
        # Cancelar cita si es necesario
        # cancel_result = cancel_appointment(client, "appointment_789")
        # print("Cita cancelada")
        
    except Exception as e:
        print(f"Error: {e}")
```

---

## 5. **Registros Médicos**

### **5.1 Crear Registro Médico**

```python
# medical_records_examples.py
from client import SMDVitalClient

def create_medical_record(client: SMDVitalClient, record_data: dict):
    """Crear registro médico"""
    response = client._make_request(
        'POST',
        f'{client.base_url}:8005/medical-records',
        json=record_data
    )
    
    return response.json()

def get_patient_medical_history(client: SMDVitalClient, patient_id: str):
    """Obtener historial médico del paciente"""
    response = client._make_request(
        'GET',
        f'{client.base_url}:8005/medical-records/patient/{patient_id}'
    )
    
    return response.json()

def record_vital_signs(client: SMDVitalClient, vital_signs_data: dict):
    """Registrar signos vitales"""
    response = client._make_request(
        'POST',
        f'{client.base_url}:8005/vital-signs',
        json=vital_signs_data
    )
    
    return response.json()

# Ejemplo de creación de registro médico
def create_medical_record_example():
    client = SMDVitalClient()
    client.set_token("your_jwt_token_here")
    
    # Datos de la consulta
    consultation_data = {
        "chief_complaint": "Dolor de cabeza",
        "history_present_illness": "Dolor desde hace 3 días, empeora con la luz",
        "physical_examination": {
            "blood_pressure": "120/80",
            "heart_rate": 72,
            "temperature": 36.5,
            "neurological_exam": "Normal"
        },
        "assessment": "Migraña tensional",
        "plan": "Ibuprofeno 400mg cada 8 horas por 5 días",
        "prescriptions": [
            {
                "name": "Ibuprofeno",
                "dosage": "400mg",
                "frequency": "Cada 8 horas",
                "duration": "5 días"
            }
        ],
        "follow_up": {
            "date": "2024-02-22",
            "reason": "Evaluar respuesta al tratamiento"
        }
    }
    
    record_data = {
        "appointment_id": "appointment_789",
        "consultation_data": consultation_data
    }
    
    try:
        record = create_medical_record(client, record_data)
        print(f"Registro médico creado: {record['id']}")
    except Exception as e:
        print(f"Error: {e}")
```

### **5.2 Signos Vitales**

```python
# vital_signs_examples.py
from client import SMDVitalClient

def record_vital_signs_example():
    client = SMDVitalClient()
    client.set_token("your_jwt_token_here")
    
    vital_signs_data = {
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
        "pain_scale": 2,
        "position": "Sentado",
        "activity_level": "Reposo",
        "notes": "Paciente en reposo, sin síntomas",
        "measurement_method": "Manual",
        "device_used": "Esfigmomanómetro digital"
    }
    
    try:
        result = record_vital_signs(client, vital_signs_data)
        print(f"Signos vitales registrados: {result['data']['id']}")
        
        # Verificar si hay valores críticos
        if result['data']['is_critical']:
            print(f"⚠️ Valores críticos detectados: {result['data']['critical_values']}")
        
    except Exception as e:
        print(f"Error: {e}")

def get_vital_signs_history(client: SMDVitalClient, patient_id: str):
    """Obtener historial de signos vitales"""
    response = client._make_request(
        'GET',
        f'{client.base_url}:8005/vital-signs/patient/{patient_id}'
    )
    
    return response.json()
```

### **5.3 Prescripciones Médicas**

```python
# prescription_examples.py
from client import SMDVitalClient

def create_prescription(client: SMDVitalClient, prescription_data: dict):
    """Crear prescripción médica"""
    response = client._make_request(
        'POST',
        f'{client.base_url}:8005/prescriptions',
        json=prescription_data
    )
    
    return response.json()

def get_patient_prescriptions(client: SMDVitalClient, patient_id: str):
    """Obtener prescripciones del paciente"""
    response = client._make_request(
        'GET',
        f'{client.base_url}:8005/prescriptions/patient/{patient_id}'
    )
    
    return response.json()

# Ejemplo de creación de prescripción
def create_prescription_example():
    client = SMDVitalClient()
    client.set_token("your_jwt_token_here")
    
    prescription_data = {
        "medical_record_id": "record_123",
        "medications": [
            {
                "name": "Ibuprofeno",
                "dosage": "400mg",
                "frequency": "Cada 8 horas",
                "duration": "5 días",
                "instructions": "Tomar con alimentos",
                "quantity": 15
            },
            {
                "name": "Paracetamol",
                "dosage": "500mg",
                "frequency": "Cada 6 horas si persiste el dolor",
                "duration": "3 días",
                "instructions": "No exceder 4 gramos por día",
                "quantity": 12
            }
        ],
        "doctor_notes": "Evitar alcohol durante el tratamiento"
    }
    
    try:
        prescription = create_prescription(client, prescription_data)
        print(f"Prescripción creada: {prescription['id']}")
        print(f"PDF disponible en: {prescription['pdf_url']}")
    except Exception as e:
        print(f"Error: {e}")
```

---

## 6. **Pagos**

### **6.1 Procesar Pago**

```python
# payment_examples.py
from client import SMDVitalClient

def create_payment_intent(client: SMDVitalClient, payment_data: dict):
    """Crear intención de pago"""
    response = client._make_request(
        'POST',
        f'{client.base_url}:8006/create-payment-intent',
        json=payment_data
    )
    
    return response.json()

def get_payment_details(client: SMDVitalClient, payment_id: str):
    """Obtener detalles del pago"""
    response = client._make_request(
        'GET',
        f'{client.base_url}:8006/payments/{payment_id}'
    )
    
    return response.json()

def create_refund(client: SMDVitalClient, refund_data: dict):
    """Crear reembolso"""
    response = client._make_request(
        'POST',
        f'{client.base_url}:8006/refunds',
        json=refund_data
    )
    
    return response.json()

# Ejemplo de procesamiento de pago
def process_payment_example():
    client = SMDVitalClient()
    client.set_token("your_jwt_token_here")
    
    payment_data = {
        "appointment_id": "appointment_789",
        "user_id": "user_123",
        "amount_cents": 50000,  # $500.00 COP
        "currency": "COP",
        "metadata": {
            "appointment_type": "consultation",
            "doctor_name": "Dr. García",
            "patient_name": "Juan Pérez"
        }
    }
    
    try:
        payment_intent = create_payment_intent(client, payment_data)
        print(f"PaymentIntent creado: {payment_intent['payment_intent_id']}")
        print(f"Client Secret: {payment_intent['client_secret']}")
        
        # En el frontend, usar el client_secret con Stripe.js
        # stripe.confirmPayment(client_secret, payment_method)
        
    except Exception as e:
        print(f"Error: {e}")
```

### **6.2 Gestión de Facturas**

```python
# invoice_examples.py
from client import SMDVitalClient

def create_invoice(client: SMDVitalClient, invoice_data: dict):
    """Crear factura"""
    response = client._make_request(
        'POST',
        f'{client.base_url}:8006/invoices',
        json=invoice_data
    )
    
    return response.json()

def get_invoices(client: SMDVitalClient, user_id: str = None):
    """Obtener facturas"""
    params = {}
    if user_id:
        params['user_id'] = user_id
    
    response = client._make_request(
        'GET',
        f'{client.base_url}:8006/invoices',
        params=params
    )
    
    return response.json()

# Ejemplo de creación de factura
def create_invoice_example():
    client = SMDVitalClient()
    client.set_token("your_jwt_token_here")
    
    invoice_data = {
        "appointment_id": "appointment_789",
        "user_id": "user_123",
        "amount_cents": 50000,
        "description": "Consulta médica general - Dr. García",
        "due_date": "2024-02-15T00:00:00Z"
    }
    
    try:
        invoice = create_invoice(client, invoice_data)
        print(f"Factura creada: {invoice['invoice_id']}")
        print(f"Estado: {invoice['status']}")
    except Exception as e:
        print(f"Error: {e}")
```

---

## 7. **Notificaciones**

### **7.1 Enviar Notificación**

```python
# notification_examples.py
from client import SMDVitalClient

def send_notification(client: SMDVitalClient, notification_data: dict):
    """Enviar notificación"""
    response = client._make_request(
        'POST',
        f'{client.base_url}:8004/send-notification',
        json=notification_data
    )
    
    return response.json()

def send_bulk_notification(client: SMDVitalClient, bulk_data: dict):
    """Enviar notificación masiva"""
    response = client._make_request(
        'POST',
        f'{client.base_url}:8004/notifications/bulk',
        json=bulk_data
    )
    
    return response.json()

def get_notifications(client: SMDVitalClient, user_id: str = None):
    """Obtener notificaciones"""
    params = {}
    if user_id:
        params['user_id'] = user_id
    
    response = client._make_request(
        'GET',
        f'{client.base_url}:8004/notifications',
        params=params
    )
    
    return response.json()

# Ejemplo de envío de notificación
def send_notification_example():
    client = SMDVitalClient()
    client.set_token("your_jwt_token_here")
    
    notification_data = {
        "user_id": "user_123",
        "event_type": "appointment_reminder",
        "channel": "email",
        "data": {
            "appointment_date": "2024-02-15",
            "appointment_time": "10:00:00",
            "doctor_name": "Dr. García",
            "patient_name": "Juan Pérez"
        },
        "priority": 1
    }
    
    try:
        result = send_notification(client, notification_data)
        print(f"Notificación enviada: {result['notification_id']}")
        print(f"Estado: {result['status']}")
    except Exception as e:
        print(f"Error: {e}")
```

### **7.2 Notificación Masiva**

```python
# bulk_notification_example.py
from client import SMDVitalClient

def send_bulk_notification_example():
    client = SMDVitalClient()
    client.set_token("your_jwt_token_here")
    
    bulk_data = {
        "user_ids": ["user_123", "user_456", "user_789"],
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
    
    try:
        results = send_bulk_notification(client, bulk_data)
        print(f"Notificaciones masivas enviadas: {len(results)}")
        for result in results:
            print(f"- {result['notification_id']}: {result['status']}")
    except Exception as e:
        print(f"Error: {e}")
```

---

## 8. **Métricas de Salud**

### **8.1 Registrar Métricas**

```python
# health_metrics_examples.py
from client import SMDVitalClient

def record_health_metric(client: SMDVitalClient, metric_data: dict):
    """Registrar métrica de salud"""
    response = client._make_request(
        'POST',
        f'{client.base_url}:8007/metrics',
        json=metric_data
    )
    
    return response.json()

def get_patient_metrics(client: SMDVitalClient, patient_id: str):
    """Obtener métricas del paciente"""
    response = client._make_request(
        'GET',
        f'{client.base_url}:8007/metrics/patient/{patient_id}'
    )
    
    return response.json()

def get_health_alerts(client: SMDVitalClient):
    """Obtener alertas de salud"""
    response = client._make_request(
        'GET',
        f'{client.base_url}:8007/metrics/alerts'
    )
    
    return response.json()

# Ejemplo de registro de métricas
def record_health_metric_example():
    client = SMDVitalClient()
    client.set_token("your_jwt_token_here")
    
    metric_data = {
        "user_id": "user_123",
        "metric_code": "blood_pressure",
        "value": 120,
        "unit": "mmHg",
        "measured_at": "2024-01-15T10:00:00Z",
        "source": "smart_blood_pressure_monitor",
        "notes": "Medición en reposo, mañana"
    }
    
    try:
        result = record_health_metric(client, metric_data)
        print(f"Métrica registrada: {result['metric_id']}")
    except Exception as e:
        print(f"Error: {e}")
```

---

## 9. **IA Médica**

### **9.1 Chat con IA**

```python
# ai_examples.py
from client import SMDVitalClient

def chat_with_ai(client: SMDVitalClient, chat_data: dict):
    """Chat con IA médica"""
    response = client._make_request(
        'POST',
        f'{client.base_url}:8008/ai/chat',
        json=chat_data
    )
    
    return response.json()

def analyze_symptoms(client: SMDVitalClient, symptoms_data: dict):
    """Analizar síntomas"""
    response = client._make_request(
        'POST',
        f'{client.base_url}:8008/ai/analyze-symptoms',
        json=symptoms_data
    )
    
    return response.json()

# Ejemplo de chat con IA
def chat_with_ai_example():
    client = SMDVitalClient()
    client.set_token("your_jwt_token_here")
    
    chat_data = {
        "user_id": "user_123",
        "message": "Tengo dolor de cabeza y fiebre desde ayer",
        "context": {
            "patient_age": 35,
            "medical_history": ["diabetes"],
            "current_medications": ["metformina"],
            "symptoms": ["dolor_cabeza", "fiebre"],
            "duration": "1 día"
        }
    }
    
    try:
        response = chat_with_ai(client, chat_data)
        print(f"Respuesta de IA: {response['response']}")
        print(f"Confianza: {response['confidence']}")
        print(f"Acciones sugeridas: {response['suggested_actions']}")
    except Exception as e:
        print(f"Error: {e}")
```

---

## 10. **Manejo de Errores**

### **10.1 Clase de Excepciones Personalizadas**

```python
# exceptions.py
class SMDVitalException(Exception):
    """Excepción base para SMD VITAL"""
    def __init__(self, message: str, status_code: int = None, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class AuthenticationError(SMDVitalException):
    """Error de autenticación"""
    def __init__(self, message: str = "Error de autenticación"):
        super().__init__(message, 401)

class ValidationError(SMDVitalException):
    """Error de validación"""
    def __init__(self, message: str = "Error de validación", details: dict = None):
        super().__init__(message, 400, details)

class MedicalDataError(SMDVitalException):
    """Error de datos médicos"""
    def __init__(self, message: str = "Error en datos médicos"):
        super().__init__(message, 422)

class PaymentError(SMDVitalException):
    """Error de pago"""
    def __init__(self, message: str = "Error en el pago"):
        super().__init__(message, 402)
```

### **10.2 Manejo de Errores en Cliente**

```python
# error_handling.py
from exceptions import SMDVitalException, AuthenticationError, ValidationError
import requests

def handle_api_error(response: requests.Response):
    """Manejar errores de API"""
    try:
        error_data = response.json()
    except:
        error_data = {"detail": "Error desconocido"}
    
    status_code = response.status_code
    
    if status_code == 401:
        raise AuthenticationError(error_data.get('detail', 'Token inválido'))
    elif status_code == 400:
        raise ValidationError(error_data.get('detail', 'Datos inválidos'), error_data)
    elif status_code == 422:
        raise MedicalDataError(error_data.get('detail', 'Datos médicos inválidos'))
    elif status_code == 402:
        raise PaymentError(error_data.get('detail', 'Error en el pago'))
    else:
        raise SMDVitalException(
            error_data.get('detail', 'Error del servidor'),
            status_code,
            error_data
        )

# Ejemplo de uso con manejo de errores
def example_with_error_handling():
    client = SMDVitalClient()
    
    try:
        # Intentar operación que puede fallar
        result = some_api_operation(client)
        print("Operación exitosa")
        
    except AuthenticationError as e:
        print(f"Error de autenticación: {e.message}")
        # Renovar token o redirigir a login
        
    except ValidationError as e:
        print(f"Error de validación: {e.message}")
        print(f"Detalles: {e.details}")
        # Mostrar errores de validación al usuario
        
    except MedicalDataError as e:
        print(f"Error en datos médicos: {e.message}")
        # Solicitar corrección de datos médicos
        
    except PaymentError as e:
        print(f"Error de pago: {e.message}")
        # Mostrar error de pago al usuario
        
    except SMDVitalException as e:
        print(f"Error del sistema: {e.message}")
        print(f"Código: {e.status_code}")
        # Manejar error genérico
        
    except Exception as e:
        print(f"Error inesperado: {e}")
        # Manejar errores no controlados
```

---

## 11. **Testing**

### **11.1 Tests Unitarios**

```python
# test_examples.py
import unittest
from unittest.mock import Mock, patch
from client import SMDVitalClient
from exceptions import AuthenticationError, ValidationError

class TestSMDVitalClient(unittest.TestCase):
    def setUp(self):
        self.client = SMDVitalClient()
        self.client.set_token("test_token")
    
    @patch('requests.Session.request')
    def test_successful_login(self, mock_request):
        """Test de login exitoso"""
        # Mock de respuesta exitosa
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "access_token": "test_token",
            "expires_in": 3600,
            "user": {"id": "user_123", "email": "test@example.com"}
        }
        mock_request.return_value = mock_response
        
        # Ejecutar test
        result = self.client._make_request('POST', 'http://test:8001/auth/login')
        
        # Verificar resultado
        self.assertEqual(result.status_code, 200)
        self.assertIn('access_token', result.json())
    
    @patch('requests.Session.request')
    def test_authentication_error(self, mock_request):
        """Test de error de autenticación"""
        # Mock de error 401
        mock_response = Mock()
        mock_response.status_code = 401
        mock_response.json.return_value = {"detail": "Token inválido"}
        mock_request.return_value = mock_response
        
        # Verificar que se lanza excepción
        with self.assertRaises(Exception) as context:
            self.client._make_request('GET', 'http://test:8002/profile')
        
        self.assertIn("Error 401", str(context.exception))
    
    @patch('requests.Session.request')
    def test_validation_error(self, mock_request):
        """Test de error de validación"""
        # Mock de error 400
        mock_response = Mock()
        mock_response.status_code = 400
        mock_response.json.return_value = {
            "detail": "Datos inválidos",
            "errors": {"email": "Email requerido"}
        }
        mock_request.return_value = mock_response
        
        # Verificar que se lanza excepción
        with self.assertRaises(Exception) as context:
            self.client._make_request('POST', 'http://test:8001/auth/register')
        
        self.assertIn("Error 400", str(context.exception))

if __name__ == '__main__':
    unittest.main()
```

### **11.2 Tests de Integración**

```python
# integration_tests.py
import unittest
from client import SMDVitalClient

class TestSMDVitalIntegration(unittest.TestCase):
    def setUp(self):
        self.client = SMDVitalClient()
        # Usar token de prueba real
        self.client.set_token("real_test_token")
    
    def test_complete_appointment_flow(self):
        """Test del flujo completo de cita médica"""
        try:
            # 1. Buscar doctores
            doctors = self.client._make_request(
                'GET',
                f'{self.client.base_url}:8002/doctors/search',
                params={'specialty': 'Cardiología'}
            )
            self.assertGreater(len(doctors.json()), 0)
            
            # 2. Programar cita
            appointment_data = {
                "patient_id": "test_patient",
                "doctor_id": doctors.json()[0]['id'],
                "appointment_date": "2024-02-15",
                "appointment_time": "10:00:00",
                "duration_minutes": 30,
                "appointment_type": "consultation",
                "reason": "Test de integración"
            }
            
            appointment = self.client._make_request(
                'POST',
                f'{self.client.base_url}:8003/appointments',
                json=appointment_data
            )
            self.assertEqual(appointment.status_code, 201)
            
            # 3. Crear registro médico
            record_data = {
                "appointment_id": appointment.json()['id'],
                "consultation_data": {
                    "chief_complaint": "Test de integración",
                    "assessment": "Paciente sano",
                    "plan": "Seguimiento en 6 meses"
                }
            }
            
            record = self.client._make_request(
                'POST',
                f'{self.client.base_url}:8005/medical-records',
                json=record_data
            )
            self.assertEqual(record.status_code, 201)
            
            # 4. Enviar notificación
            notification_data = {
                "user_id": "test_patient",
                "event_type": "appointment_completed",
                "channel": "email",
                "data": {"appointment_id": appointment.json()['id']},
                "priority": 1
            }
            
            notification = self.client._make_request(
                'POST',
                f'{self.client.base_url}:8004/send-notification',
                json=notification_data
            )
            self.assertEqual(notification.status_code, 201)
            
        except Exception as e:
            self.fail(f"Error en flujo de integración: {e}")

if __name__ == '__main__':
    unittest.main()
```

### **11.3 Tests de Carga**

```python
# load_tests.py
import asyncio
import aiohttp
import time
from concurrent.futures import ThreadPoolExecutor

async def make_request(session, url, data):
    """Realizar petición asíncrona"""
    async with session.post(url, json=data) as response:
        return await response.json()

async def load_test():
    """Test de carga para múltiples usuarios"""
    async with aiohttp.ClientSession() as session:
        # Simular 100 usuarios concurrentes
        tasks = []
        for i in range(100):
            data = {
                "user_id": f"user_{i}",
                "event_type": "load_test",
                "channel": "email",
                "data": {"test_id": i},
                "priority": 1
            }
            task = make_request(
                session,
                'http://localhost:8004/send-notification',
                data
            )
            tasks.append(task)
        
        # Ejecutar todas las peticiones
        start_time = time.time()
        results = await asyncio.gather(*tasks)
        end_time = time.time()
        
        print(f"Tiempo total: {end_time - start_time:.2f} segundos")
        print(f"Peticiones exitosas: {len([r for r in results if 'notification_id' in r])}")

# Ejecutar test de carga
if __name__ == '__main__':
    asyncio.run(load_test())
```

---

## 📚 **Recursos Adicionales**

### **Documentación de APIs**
- [Swagger UI - Authentication](http://localhost:8001/docs)
- [Swagger UI - Users](http://localhost:8002/docs)
- [Swagger UI - Appointments](http://localhost:8003/docs)
- [Swagger UI - Medical Records](http://localhost:8005/docs)
- [Swagger UI - Payments](http://localhost:8006/docs)
- [Swagger UI - Notifications](http://localhost:8004/docs)
- [Swagger UI - Health Metrics](http://localhost:8007/docs)
- [Swagger UI - AI LangGraph](http://localhost:8008/docs)

### **Herramientas de Desarrollo**
- **Postman Collection**: `docs/api/postman/SMD_Vital_API.json`
- **OpenAPI Spec**: `docs/api/openapi-spec.yaml`
- **Docker Compose**: `docker-compose.yml`

### **Monitoreo y Logs**
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001
- **Logs**: `logs/` directory

---

**📅 Última actualización**: 25 de Enero, 2024  
**👥 Mantenido por**: Equipo de Desarrollo SMD VITAL  
**📧 Contacto**: dev@smdvital.com
