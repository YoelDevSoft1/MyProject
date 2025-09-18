"""
SMD VITAL - Servicio de Detección Inteligente de Usuarios
Sistema inteligente para detectar automáticamente el tipo de usuario y sus características
"""

import re
import logging
from typing import Dict, List, Optional, Tuple
from enum import Enum
from datetime import datetime

logger = logging.getLogger(__name__)

class UserType(Enum):
    """Tipos de usuario detectados por el sistema"""
    PATIENT = "patient"
    DOCTOR = "doctor"
    NURSE = "nurse"
    ADMIN = "admin"
    RECEPTIONIST = "receptionist"
    TECHNICIAN = "technician"
    PHARMACIST = "pharmacist"
    UNKNOWN = "unknown"

class UserCategory(Enum):
    """Categorías de usuario para agrupación"""
    MEDICAL_STAFF = "medical_staff"  # Doctores, enfermeros, técnicos
    ADMINISTRATIVE = "administrative"  # Admin, recepcionistas
    PATIENTS = "patients"  # Pacientes
    SUPPORT = "support"  # Farmacéuticos, técnicos especializados

class UserDetectionService:
    """Servicio para detectar inteligentemente el tipo de usuario"""
    
    def __init__(self):
        # Patrones de email para detección automática
        self.email_patterns = {
            UserType.DOCTOR: [
                r'@.*hospital\.',
                r'@.*clinica\.',
                r'@.*medical\.',
                r'@.*health\.',
                r'@.*doctor\.',
                r'@.*medicina\.',
                r'@.*salud\.',
                r'@.*hospital\.com',
                r'@.*clinica\.com',
                r'@.*medical\.com'
            ],
            UserType.NURSE: [
                r'@.*nurse\.',
                r'@.*enfermeria\.',
                r'@.*cuidados\.',
                r'@.*hospital\.',
                r'@.*clinica\.'
            ],
            UserType.ADMIN: [
                r'@.*admin\.',
                r'@.*administracion\.',
                r'@.*management\.',
                r'@.*hospital\.',
                r'@.*clinica\.'
            ],
            UserType.RECEPTIONIST: [
                r'@.*recepcion\.',
                r'@.*reception\.',
                r'@.*citas\.',
                r'@.*appointments\.',
                r'@.*hospital\.',
                r'@.*clinica\.'
            ]
        }
        
        # Palabras clave en nombres y especialidades
        self.specialty_keywords = {
            UserType.DOCTOR: [
                'doctor', 'dr.', 'dra.', 'medico', 'medicina', 'cirugia', 'pediatria',
                'cardiologia', 'neurologia', 'dermatologia', 'ginecologia', 'traumatologia',
                'oftalmologia', 'otorrinolaringologia', 'psiquiatria', 'anestesiologia',
                'radiologia', 'patologia', 'medicina interna', 'medicina general'
            ],
            UserType.NURSE: [
                'enfermero', 'enfermera', 'nurse', 'cuidados', 'enfermeria',
                'auxiliar', 'tecnico', 'asistente'
            ],
            UserType.TECHNICIAN: [
                'tecnico', 'tecnologo', 'laboratorio', 'radiologia', 'ecografia',
                'tomografia', 'resonancia', 'ultrasonido', 'patologia'
            ],
            UserType.PHARMACIST: [
                'farmaceutico', 'farmacia', 'quimico', 'farmacologia'
            ]
        }
        
        # Patrones en nombres de usuario
        self.username_patterns = {
            UserType.DOCTOR: [r'^dr\.', r'^dra\.', r'^doctor', r'^medico'],
            UserType.NURSE: [r'^nurse', r'^enfermero', r'^enfermera'],
            UserType.ADMIN: [r'^admin', r'^administrador'],
            UserType.RECEPTIONIST: [r'^recepcion', r'^reception', r'^citas']
        }

    def detect_user_type(self, user_data: Dict) -> Dict:
        """
        Detecta el tipo de usuario basándose en múltiples criterios
        
        Args:
            user_data: Datos del usuario desde la base de datos
            
        Returns:
            Dict con información de detección:
            {
                "detected_type": UserType,
                "confidence": float,  # 0.0 a 1.0
                "reasons": List[str],
                "category": UserCategory,
                "suggested_interface": str,
                "permissions": List[str]
            }
        """
        try:
            # Obtener datos básicos con manejo de None
            email = (user_data.get('email') or '').lower()
            username = (user_data.get('username') or '').lower()
            first_name = (user_data.get('first_name') or '').lower()
            last_name = (user_data.get('last_name') or '').lower()
            specialty = (user_data.get('specialty') or '').lower()
            role = (user_data.get('role') or '').lower()
            
            # Inicializar resultado
            detection_result = {
                "detected_type": UserType.UNKNOWN,
                "confidence": 0.0,
                "reasons": [],
                "category": UserCategory.PATIENTS,
                "suggested_interface": "patient",
                "permissions": []
            }
            
            # 1. Verificar rol explícito (mayor confianza)
            if role:
                role_type = self._get_type_from_role(role)
                if role_type != UserType.UNKNOWN:
                    detection_result["detected_type"] = role_type
                    detection_result["confidence"] = 1.0  # Máxima confianza para rol explícito
                    detection_result["reasons"].append(f"Rol explícito: {role}")
                    # Establecer categoría y interfaz basada en el rol
                    detection_result["category"] = self._get_category_from_type(role_type)
                    detection_result["suggested_interface"] = role_type.value
                    detection_result["permissions"] = self._get_permissions_from_type(role_type)
                    return detection_result
            
            # 2. Análisis de email
            email_type, email_confidence = self._analyze_email(email)
            if email_type != UserType.UNKNOWN:
                detection_result["detected_type"] = email_type
                detection_result["confidence"] += email_confidence * 0.3
                detection_result["reasons"].append(f"Patrón de email detectado: {email}")
            
            # 3. Análisis de especialidad
            specialty_type, specialty_confidence = self._analyze_specialty(specialty)
            if specialty_type != UserType.UNKNOWN:
                if detection_result["detected_type"] == UserType.UNKNOWN:
                    detection_result["detected_type"] = specialty_type
                detection_result["confidence"] += specialty_confidence * 0.2
                detection_result["reasons"].append(f"Especialidad detectada: {specialty}")
            
            # 4. Análisis de nombre de usuario
            username_type, username_confidence = self._analyze_username(username)
            if username_type != UserType.UNKNOWN:
                if detection_result["detected_type"] == UserType.UNKNOWN:
                    detection_result["detected_type"] = username_type
                detection_result["confidence"] += username_confidence * 0.1
                detection_result["reasons"].append(f"Patrón de username: {username}")
            
            # 5. Análisis de nombres
            name_type, name_confidence = self._analyze_names(first_name, last_name)
            if name_type != UserType.UNKNOWN:
                if detection_result["detected_type"] == UserType.UNKNOWN:
                    detection_result["detected_type"] = name_type
                detection_result["confidence"] += name_confidence * 0.1
                detection_result["reasons"].append(f"Patrón en nombres: {first_name} {last_name}")
            
            # Si no se detectó nada, usar el rol por defecto
            if detection_result["detected_type"] == UserType.UNKNOWN:
                detection_result["detected_type"] = UserType.PATIENT
                detection_result["confidence"] = 0.1
                detection_result["reasons"].append("Tipo por defecto: paciente")
            
            # Determinar categoría y configuración
            detection_result["category"] = self._get_category_from_type(detection_result["detected_type"])
            detection_result["suggested_interface"] = self._get_interface_from_type(detection_result["detected_type"])
            detection_result["permissions"] = self._get_permissions_from_type(detection_result["detected_type"])
            
            # Limitar confianza a 1.0
            detection_result["confidence"] = min(detection_result["confidence"], 1.0)
            
            logger.info(f"Detección de usuario para {email}: {detection_result}")
            return detection_result
            
        except Exception as e:
            logger.error(f"Error en detección de usuario: {e}")
            return {
                "detected_type": UserType.PATIENT,
                "confidence": 0.0,
                "reasons": [f"Error en detección: {str(e)}"],
                "category": UserCategory.PATIENTS,
                "suggested_interface": "patient",
                "permissions": []
            }

    def _get_type_from_role(self, role: str) -> UserType:
        """Convierte rol de string a UserType"""
        role_mapping = {
            'patient': UserType.PATIENT,
            'user': UserType.PATIENT,
            'doctor': UserType.DOCTOR,
            'nurse': UserType.NURSE,
            'admin': UserType.ADMIN,
            'receptionist': UserType.RECEPTIONIST,
            'technician': UserType.TECHNICIAN,
            'pharmacist': UserType.PHARMACIST
        }
        return role_mapping.get(role.lower(), UserType.UNKNOWN)

    def _analyze_email(self, email: str) -> Tuple[UserType, float]:
        """Analiza el email para detectar patrones de tipo de usuario"""
        for user_type, patterns in self.email_patterns.items():
            for pattern in patterns:
                if re.search(pattern, email, re.IGNORECASE):
                    return user_type, 0.8
        return UserType.UNKNOWN, 0.0

    def _analyze_specialty(self, specialty: str) -> Tuple[UserType, float]:
        """Analiza la especialidad para detectar tipo de usuario"""
        if not specialty:
            return UserType.UNKNOWN, 0.0
            
        for user_type, keywords in self.specialty_keywords.items():
            for keyword in keywords:
                if keyword in specialty.lower():
                    return user_type, 0.9
        return UserType.UNKNOWN, 0.0

    def _analyze_username(self, username: str) -> Tuple[UserType, float]:
        """Analiza el nombre de usuario para detectar patrones"""
        for user_type, patterns in self.username_patterns.items():
            for pattern in patterns:
                if re.search(pattern, username, re.IGNORECASE):
                    return user_type, 0.7
        return UserType.UNKNOWN, 0.0

    def _analyze_names(self, first_name: str, last_name: str) -> Tuple[UserType, float]:
        """Analiza los nombres para detectar títulos profesionales"""
        full_name = f"{first_name} {last_name}".lower()
        
        # Patrones de títulos médicos
        medical_titles = ['dr.', 'dra.', 'doctor', 'doctora', 'medico', 'medica']
        for title in medical_titles:
            if title in full_name:
                return UserType.DOCTOR, 0.6
        
        # Patrones de enfermería
        nursing_titles = ['enfermero', 'enfermera', 'nurse']
        for title in nursing_titles:
            if title in full_name:
                return UserType.NURSE, 0.6
                
        return UserType.UNKNOWN, 0.0

    def _get_category_from_type(self, user_type: UserType) -> UserCategory:
        """Obtiene la categoría basada en el tipo de usuario"""
        category_mapping = {
            UserType.DOCTOR: UserCategory.MEDICAL_STAFF,
            UserType.NURSE: UserCategory.MEDICAL_STAFF,
            UserType.TECHNICIAN: UserCategory.MEDICAL_STAFF,
            UserType.ADMIN: UserCategory.ADMINISTRATIVE,
            UserType.RECEPTIONIST: UserCategory.ADMINISTRATIVE,
            UserType.PHARMACIST: UserCategory.SUPPORT,
            UserType.PATIENT: UserCategory.PATIENTS,
            UserType.UNKNOWN: UserCategory.PATIENTS
        }
        return category_mapping.get(user_type, UserCategory.PATIENTS)

    def _get_interface_from_type(self, user_type: UserType) -> str:
        """Obtiene la interfaz sugerida basada en el tipo de usuario"""
        interface_mapping = {
            UserType.DOCTOR: "doctor",
            UserType.NURSE: "nurse", 
            UserType.ADMIN: "admin",
            UserType.RECEPTIONIST: "receptionist",
            UserType.TECHNICIAN: "technician",
            UserType.PHARMACIST: "pharmacist",
            UserType.PATIENT: "patient",
            UserType.UNKNOWN: "patient"
        }
        return interface_mapping.get(user_type, "patient")

    def _get_permissions_from_type(self, user_type: UserType) -> List[str]:
        """Obtiene los permisos basados en el tipo de usuario"""
        permissions_mapping = {
            UserType.DOCTOR: [
                "view_patients", "create_appointments", "view_medical_records",
                "create_medical_records", "prescribe_medications", "view_schedule"
            ],
            UserType.NURSE: [
                "view_patients", "view_medical_records", "update_vital_signs",
                "view_schedule", "assist_doctors"
            ],
            UserType.ADMIN: [
                "manage_users", "manage_appointments", "view_reports",
                "manage_system", "view_all_data"
            ],
            UserType.RECEPTIONIST: [
                "create_appointments", "view_appointments", "manage_patients",
                "view_schedule", "manage_calendar"
            ],
            UserType.TECHNICIAN: [
                "view_medical_records", "upload_results", "view_schedule",
                "manage_equipment"
            ],
            UserType.PHARMACIST: [
                "view_prescriptions", "manage_medications", "view_patients",
                "manage_inventory"
            ],
            UserType.PATIENT: [
                "view_own_appointments", "view_own_medical_records",
                "book_appointments", "view_prescriptions"
            ]
        }
        return permissions_mapping.get(user_type, ["view_own_data"])

    def get_user_dashboard_config(self, user_type: UserType, specialty: str = "") -> Dict:
        """Obtiene la configuración del dashboard basada en el tipo de usuario"""
        base_configs = {
            UserType.DOCTOR: {
                "title": "Panel del Doctor",
                "widgets": [
                    "appointments_today", "patient_list", "medical_records",
                    "prescriptions", "schedule", "notifications"
                ],
                "primary_color": "#2D5A87",
                "icon": "stethoscope"
            },
            UserType.NURSE: {
                "title": "Panel de Enfermería", 
                "widgets": [
                    "appointments_today", "patient_vitals", "medication_schedule",
                    "doctor_assignments", "notifications"
                ],
                "primary_color": "#4A90E2",
                "icon": "heart"
            },
            UserType.ADMIN: {
                "title": "Panel de Administración",
                "widgets": [
                    "system_stats", "user_management", "appointment_overview",
                    "revenue_reports", "system_health", "notifications"
                ],
                "primary_color": "#E74C3C",
                "icon": "settings"
            },
            UserType.RECEPTIONIST: {
                "title": "Panel de Recepción",
                "widgets": [
                    "appointments_today", "new_appointments", "patient_search",
                    "calendar", "notifications"
                ],
                "primary_color": "#F39C12",
                "icon": "calendar"
            },
            UserType.PATIENT: {
                "title": "Mi Panel de Salud",
                "widgets": [
                    "my_appointments", "my_medical_records", "my_prescriptions",
                    "book_appointment", "health_tips", "notifications"
                ],
                "primary_color": "#27AE60",
                "icon": "user"
            }
        }
        
        config = base_configs.get(user_type, base_configs[UserType.PATIENT])
        
        # Personalizar según especialidad si es doctor
        if user_type == UserType.DOCTOR and specialty:
            specialty_configs = {
                "cardiologia": {"primary_color": "#E74C3C", "icon": "heart"},
                "pediatria": {"primary_color": "#F39C12", "icon": "baby"},
                "neurologia": {"primary_color": "#9B59B6", "icon": "brain"},
                "dermatologia": {"primary_color": "#E67E22", "icon": "skin"}
            }
            
            specialty_lower = specialty.lower()
            for spec, spec_config in specialty_configs.items():
                if spec in specialty_lower:
                    config.update(spec_config)
                    break
        
        return config

# Instancia global del servicio
user_detection_service = UserDetectionService()
