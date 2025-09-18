"""
SMD VITAL - Tests para el Servicio de Detección de Usuarios
Pruebas unitarias para validar la funcionalidad de detección inteligente
"""

import pytest
import sys
import os

# Agregar el directorio del servicio auth al path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services', 'auth'))

from user_detection_service import UserDetectionService, UserType, UserCategory

class TestUserDetectionService:
    """Pruebas para el servicio de detección de usuarios"""
    
    def setup_method(self):
        """Configuración inicial para cada prueba"""
        self.detection_service = UserDetectionService()
    
    def test_doctor_detection_by_email(self):
        """Prueba detección de doctor por patrón de email"""
        user_data = {
            'email': 'dr.garcia@hospital.com',
            'username': 'drgarcia',
            'first_name': 'Carlos',
            'last_name': 'García',
            'role': 'doctor',
            'specialty': 'Cardiología'
        }
        
        result = self.detection_service.detect_user_type(user_data)
        
        assert result['detected_type'] == UserType.DOCTOR
        assert result['confidence'] > 0.5
        assert 'hospital.com' in result['reasons'][0]
        assert result['category'] == UserCategory.MEDICAL_STAFF
    
    def test_nurse_detection_by_specialty(self):
        """Prueba detección de enfermero por especialidad"""
        user_data = {
            'email': 'maria.lopez@clinica.com',
            'username': 'marialopez',
            'first_name': 'María',
            'last_name': 'López',
            'role': 'nurse',
            'specialty': 'Enfermería General'
        }
        
        result = self.detection_service.detect_user_type(user_data)
        
        assert result['detected_type'] == UserType.NURSE
        assert result['confidence'] > 0.5
        assert 'Enfermería' in result['reasons'][0]
        assert result['category'] == UserCategory.MEDICAL_STAFF
    
    def test_admin_detection_by_role(self):
        """Prueba detección de administrador por rol explícito"""
        user_data = {
            'email': 'admin@hospital.com',
            'username': 'admin',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin'
        }
        
        result = self.detection_service.detect_user_type(user_data)
        
        assert result['detected_type'] == UserType.ADMIN
        assert result['confidence'] > 0.4
        assert 'admin' in result['reasons'][0]
        assert result['category'] == UserCategory.ADMINISTRATIVE
    
    def test_patient_detection_default(self):
        """Prueba detección de paciente por defecto"""
        user_data = {
            'email': 'juan.perez@gmail.com',
            'username': 'juanperez',
            'first_name': 'Juan',
            'last_name': 'Pérez',
            'role': 'patient'
        }
        
        result = self.detection_service.detect_user_type(user_data)
        
        assert result['detected_type'] == UserType.PATIENT
        assert result['category'] == UserCategory.PATIENTS
    
    def test_doctor_detection_by_username(self):
        """Prueba detección de doctor por patrón de username"""
        user_data = {
            'email': 'dr.smith@example.com',
            'username': 'dr.smith',
            'first_name': 'John',
            'last_name': 'Smith',
            'role': 'doctor'
        }
        
        result = self.detection_service.detect_user_type(user_data)
        
        assert result['detected_type'] == UserType.DOCTOR
        assert result['confidence'] > 0.3
        assert 'dr.' in result['reasons'][0]
    
    def test_technician_detection_by_specialty(self):
        """Prueba detección de técnico por especialidad"""
        user_data = {
            'email': 'tecnico@hospital.com',
            'username': 'tecnico_lab',
            'first_name': 'Ana',
            'last_name': 'Martínez',
            'role': 'technician',
            'specialty': 'Laboratorio Clínico'
        }
        
        result = self.detection_service.detect_user_type(user_data)
        
        assert result['detected_type'] == UserType.TECHNICIAN
        assert result['confidence'] > 0.5
        assert 'Laboratorio' in result['reasons'][0]
        assert result['category'] == UserCategory.MEDICAL_STAFF
    
    def test_pharmacist_detection_by_specialty(self):
        """Prueba detección de farmacéutico por especialidad"""
        user_data = {
            'email': 'farmacia@hospital.com',
            'username': 'farmacia_user',
            'first_name': 'Luis',
            'last_name': 'Rodríguez',
            'role': 'pharmacist',
            'specialty': 'Farmacología Clínica'
        }
        
        result = self.detection_service.detect_user_type(user_data)
        
        assert result['detected_type'] == UserType.PHARMACIST
        assert result['confidence'] > 0.5
        assert 'Farmacología' in result['reasons'][0]
        assert result['category'] == UserCategory.SUPPORT
    
    def test_receptionist_detection_by_email(self):
        """Prueba detección de recepcionista por patrón de email"""
        user_data = {
            'email': 'recepcion@clinica.com',
            'username': 'recepcion',
            'first_name': 'Sofia',
            'last_name': 'González',
            'role': 'receptionist'
        }
        
        result = self.detection_service.detect_user_type(user_data)
        
        assert result['detected_type'] == UserType.RECEPTIONIST
        assert result['confidence'] > 0.5
        assert 'recepcion' in result['reasons'][0]
        assert result['category'] == UserCategory.ADMINISTRATIVE
    
    def test_high_confidence_detection(self):
        """Prueba detección con alta confianza"""
        user_data = {
            'email': 'dr.cardiologia@hospital.com',
            'username': 'dr.cardiologia',
            'first_name': 'Dr. Carlos',
            'last_name': 'Médico',
            'role': 'doctor',
            'specialty': 'Cardiología'
        }
        
        result = self.detection_service.detect_user_type(user_data)
        
        assert result['detected_type'] == UserType.DOCTOR
        assert result['confidence'] > 0.8
        assert len(result['reasons']) > 1  # Múltiples criterios coinciden
    
    def test_dashboard_config_doctor(self):
        """Prueba configuración de dashboard para doctor"""
        config = self.detection_service.get_user_dashboard_config(UserType.DOCTOR, 'Cardiología')
        
        assert config['title'] == 'Panel del Doctor'
        assert 'appointments_today' in config['widgets']
        assert 'patient_list' in config['widgets']
        assert config['primary_color'] == '#2D5A87'
        assert config['icon'] == 'stethoscope'
    
    def test_dashboard_config_nurse(self):
        """Prueba configuración de dashboard para enfermero"""
        config = self.detection_service.get_user_dashboard_config(UserType.NURSE)
        
        assert config['title'] == 'Panel de Enfermería'
        assert 'appointments_today' in config['widgets']
        assert 'patient_vitals' in config['widgets']
        assert config['primary_color'] == '#4A90E2'
        assert config['icon'] == 'heart'
    
    def test_dashboard_config_patient(self):
        """Prueba configuración de dashboard para paciente"""
        config = self.detection_service.get_user_dashboard_config(UserType.PATIENT)
        
        assert config['title'] == 'Mi Panel de Salud'
        assert 'my_appointments' in config['widgets']
        assert 'my_medical_records' in config['widgets']
        assert config['primary_color'] == '#27AE60'
        assert config['icon'] == 'user'
    
    def test_permissions_doctor(self):
        """Prueba permisos para doctor"""
        user_data = {'role': 'doctor'}
        result = self.detection_service.detect_user_type(user_data)
        permissions = result['permissions']
        
        assert 'view_patients' in permissions
        assert 'create_appointments' in permissions
        assert 'prescribe_medications' in permissions
        assert 'view_medical_records' in permissions
    
    def test_permissions_patient(self):
        """Prueba permisos para paciente"""
        user_data = {'role': 'patient'}
        result = self.detection_service.detect_user_type(user_data)
        permissions = result['permissions']
        
        assert 'view_own_appointments' in permissions
        assert 'view_own_medical_records' in permissions
        assert 'book_appointments' in permissions
        assert 'prescribe_medications' not in permissions
    
    def test_error_handling(self):
        """Prueba manejo de errores con datos inválidos"""
        # Datos vacíos
        result = self.detection_service.detect_user_type({})
        
        assert result['detected_type'] == UserType.PATIENT
        assert result['confidence'] == 0.1
        assert 'Tipo por defecto: paciente' in result['reasons']
    
    def test_specialty_specific_config(self):
        """Prueba configuración específica por especialidad"""
        # Cardiología
        config_cardio = self.detection_service.get_user_dashboard_config(UserType.DOCTOR, 'Cardiología')
        assert config_cardio['primary_color'] == '#E74C3C'
        assert config_cardio['icon'] == 'heart'
        
        # Pediatría
        config_ped = self.detection_service.get_user_dashboard_config(UserType.DOCTOR, 'Pediatría')
        assert config_ped['primary_color'] == '#F39C12'
        assert config_ped['icon'] == 'baby'

if __name__ == '__main__':
    pytest.main([__file__])
