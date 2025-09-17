"""
SMD Vital - User Service Database Models
========================================

Modelos de base de datos para el servicio de usuarios.
Incluye perfiles, direcciones, información médica y contactos de emergencia.

Author: Backend Team
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey, Date, Numeric, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, date
from enum import Enum
import uuid

Base = declarative_base()


class Gender(Enum):
    """Enumeración para género"""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class BloodType(Enum):
    """Enumeración para tipo de sangre"""
    A_POSITIVE = "A+"
    A_NEGATIVE = "A-"
    B_POSITIVE = "B+"
    B_NEGATIVE = "B-"
    AB_POSITIVE = "AB+"
    AB_NEGATIVE = "AB-"
    O_POSITIVE = "O+"
    O_NEGATIVE = "O-"
    UNKNOWN = "unknown"


class DocumentType(Enum):
    """Enumeración para tipos de documento"""
    CEDULA = "cedula"
    CEDULA_EXTRANJERIA = "cedula_extranjeria"
    PASSPORT = "passport"
    TARJETA_IDENTIDAD = "tarjeta_identidad"
    NIT = "nit"


class RelationshipType(Enum):
    """Enumeración para tipo de relación de contacto de emergencia"""
    SPOUSE = "spouse"
    PARENT = "parent"
    CHILD = "child"
    SIBLING = "sibling"
    FRIEND = "friend"
    RELATIVE = "relative"
    OTHER = "other"


class UserProfile(Base):
    """
    Modelo principal de perfil de usuario con información extendida
    """
    __tablename__ = 'user_profiles'

    # Identificación (sincronizada con auth service)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), unique=True, nullable=False, index=True)  # ID del auth service
    
    # Información personal detallada
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    middle_name = Column(String(100), nullable=True)
    
    # Información de contacto
    email = Column(String(255), nullable=False, index=True)
    phone_primary = Column(String(20), nullable=True)
    phone_secondary = Column(String(20), nullable=True)
    
    # Información demográfica
    date_of_birth = Column(Date, nullable=True)
    gender = Column(SQLEnum(Gender), nullable=True)
    nationality = Column(String(100), nullable=True)
    place_of_birth = Column(String(200), nullable=True)
    
    # Documentos de identificación
    document_type = Column(SQLEnum(DocumentType), nullable=True)
    document_number = Column(String(50), nullable=True, index=True)
    document_issued_date = Column(Date, nullable=True)
    document_expiry_date = Column(Date, nullable=True)
    
    # Información profesional
    occupation = Column(String(200), nullable=True)
    company = Column(String(200), nullable=True)
    emergency_contact_info = Column(JSONB, nullable=True)
    
    # Configuraciones de usuario
    preferred_language = Column(String(10), default='es', nullable=False)
    timezone = Column(String(50), default='America/Bogota', nullable=False)
    notification_preferences = Column(JSONB, nullable=True)
    privacy_settings = Column(JSONB, nullable=True)
    
    # Avatar y foto
    avatar_url = Column(String(500), nullable=True)
    profile_picture_path = Column(String(500), nullable=True)
    
    # Información adicional flexible
    additional_info = Column(JSONB, nullable=True)
    
    # Metadatos
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_date = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_activity = Column(DateTime, nullable=True)
    
    # Relaciones
    addresses = relationship("UserAddress", back_populates="user", cascade="all, delete-orphan")
    medical_info = relationship("UserMedicalInfo", back_populates="user", uselist=False, cascade="all, delete-orphan")
    emergency_contacts = relationship("EmergencyContact", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("UserPreference", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<UserProfile(id={self.id}, user_id={self.user_id}, name={self.full_name})>"

    @property
    def full_name(self):
        """Nombre completo del usuario"""
        names = [self.first_name]
        if self.middle_name:
            names.append(self.middle_name)
        names.append(self.last_name)
        return " ".join(names)

    @property
    def age(self):
        """Calcular edad basada en fecha de nacimiento"""
        if not self.date_of_birth:
            return None
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )


class UserAddress(Base):
    """
    Modelo para direcciones de usuario
    """
    __tablename__ = 'user_addresses'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user_profiles.id'), nullable=False, index=True)
    
    # Información de dirección
    label = Column(String(50), nullable=True)  # "Casa", "Trabajo", "Otro"
    address_line_1 = Column(String(255), nullable=False)
    address_line_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state_province = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), default='Colombia', nullable=False)
    
    # Coordenadas geográficas
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    
    # Configuraciones
    is_primary = Column(Boolean, default=False, nullable=False)
    is_billing_address = Column(Boolean, default=False, nullable=False)
    is_shipping_address = Column(Boolean, default=False, nullable=False)
    
    # Información adicional
    neighborhood = Column(String(100), nullable=True)
    landmark = Column(String(255), nullable=True)
    special_instructions = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    user = relationship("UserProfile", back_populates="addresses")
    
    def __repr__(self):
        return f"<UserAddress(id={self.id}, label={self.label}, city={self.city})>"

    @property
    def full_address(self):
        """Dirección completa formateada"""
        address_parts = [self.address_line_1]
        if self.address_line_2:
            address_parts.append(self.address_line_2)
        address_parts.extend([self.city, self.state_province])
        if self.postal_code:
            address_parts.append(self.postal_code)
        address_parts.append(self.country)
        return ", ".join(address_parts)


class UserMedicalInfo(Base):
    """
    Modelo para información médica básica del usuario
    """
    __tablename__ = 'user_medical_info'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user_profiles.id'), nullable=False, index=True)
    
    # Información médica básica
    blood_type = Column(SQLEnum(BloodType), nullable=True)
    height_cm = Column(Integer, nullable=True)  # Altura en centímetros
    weight_kg = Column(Numeric(5, 2), nullable=True)  # Peso en kilogramos
    
    # Seguros médicos
    insurance_company = Column(String(200), nullable=True)
    insurance_policy_number = Column(String(100), nullable=True)
    insurance_group_number = Column(String(100), nullable=True)
    insurance_expiry_date = Column(Date, nullable=True)
    
    # Información médica de emergencia
    allergies = Column(Text, nullable=True)
    chronic_conditions = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    medical_notes = Column(Text, nullable=True)
    
    # Contacto médico principal
    primary_doctor_name = Column(String(255), nullable=True)
    primary_doctor_phone = Column(String(20), nullable=True)
    primary_doctor_specialty = Column(String(100), nullable=True)
    
    # Información de donación
    organ_donor = Column(Boolean, nullable=True)
    blood_donor = Column(Boolean, nullable=True)
    
    # Información flexible adicional
    medical_conditions = Column(JSONB, nullable=True)  # Condiciones estructuradas
    vaccination_history = Column(JSONB, nullable=True)  # Historial de vacunas
    family_medical_history = Column(JSONB, nullable=True)  # Historia familiar
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_updated_by = Column(UUID(as_uuid=True), nullable=True)  # ID del profesional que actualizó
    
    # Relaciones
    user = relationship("UserProfile", back_populates="medical_info")
    
    def __repr__(self):
        return f"<UserMedicalInfo(id={self.id}, user_id={self.user_id}, blood_type={self.blood_type})>"

    @property
    def bmi(self):
        """Calcular índice de masa corporal"""
        if not self.height_cm or not self.weight_kg:
            return None
        height_m = self.height_cm / 100
        return round(float(self.weight_kg) / (height_m ** 2), 2)


class EmergencyContact(Base):
    """
    Modelo para contactos de emergencia
    """
    __tablename__ = 'emergency_contacts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user_profiles.id'), nullable=False, index=True)
    
    # Información del contacto
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    contact_relationship = Column(SQLEnum(RelationshipType), nullable=False)
    relationship_description = Column(String(100), nullable=True)  # Para "other"
    
    # Información de contacto
    phone_primary = Column(String(20), nullable=False)
    phone_secondary = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    
    # Dirección
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    
    # Configuraciones
    is_primary = Column(Boolean, default=False, nullable=False)
    priority_order = Column(Integer, default=1, nullable=False)
    
    # Notas adicionales
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    user = relationship("UserProfile", back_populates="emergency_contacts")
    
    def __repr__(self):
        return f"<EmergencyContact(id={self.id}, name={self.full_name}, relationship={self.contact_relationship})>"

    @property
    def full_name(self):
        """Nombre completo del contacto"""
        return f"{self.first_name} {self.last_name}"


class UserPreference(Base):
    """
    Modelo para preferencias personalizables del usuario
    """
    __tablename__ = 'user_preferences'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user_profiles.id'), nullable=False, index=True)
    
    # Clave y valor de la preferencia
    category = Column(String(50), nullable=False, index=True)  # notifications, ui, privacy, etc.
    key = Column(String(100), nullable=False, index=True)
    value = Column(JSONB, nullable=True)
    
    # Metadata
    description = Column(String(255), nullable=True)
    is_system_preference = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    user = relationship("UserProfile", back_populates="preferences")
    
    def __repr__(self):
        return f"<UserPreference(id={self.id}, category={self.category}, key={self.key})>"


class UserActivity(Base):
    """
    Modelo para registro de actividad del usuario
    """
    __tablename__ = 'user_activities'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # ID del auth service
    
    # Información de la actividad
    activity_type = Column(String(50), nullable=False, index=True)  # login, profile_update, etc.
    description = Column(String(255), nullable=True)
    details = Column(JSONB, nullable=True)
    
    # Información de contexto
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    location = Column(JSONB, nullable=True)
    
    # Resultado
    success = Column(Boolean, nullable=False, default=True)
    error_message = Column(Text, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def __repr__(self):
        return f"<UserActivity(id={self.id}, type={self.activity_type}, success={self.success})>"


class UserStatistics(Base):
    """
    Modelo para estadísticas agregadas del usuario
    """
    __tablename__ = 'user_statistics'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), unique=True, nullable=False, index=True)
    
    # Estadísticas de actividad
    total_logins = Column(Integer, default=0, nullable=False)
    total_profile_updates = Column(Integer, default=0, nullable=False)
    last_login_date = Column(DateTime, nullable=True)
    last_profile_update = Column(DateTime, nullable=True)
    
    # Estadísticas de salud (para pacientes)
    total_appointments = Column(Integer, default=0, nullable=False)
    completed_appointments = Column(Integer, default=0, nullable=False)
    cancelled_appointments = Column(Integer, default=0, nullable=False)
    
    # Estadísticas calculadas
    account_completion_percentage = Column(Numeric(5, 2), default=0, nullable=False)
    engagement_score = Column(Numeric(5, 2), default=0, nullable=False)
    
    # Información flexible
    custom_metrics = Column(JSONB, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<UserStatistics(id={self.id}, user_id={self.user_id}, completion={self.account_completion_percentage}%)>"
