"""
SMD Vital - Authentication Service Database Models
==================================================

Modelos de base de datos para el servicio de autenticación.
Incluye usuarios, roles, permisos y sesiones.

Author: Backend Team
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid

Base = declarative_base()

# Tabla de asociación para many-to-many entre User y Role
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('role_id', UUID(as_uuid=True), ForeignKey('roles.id'), primary_key=True),
    Column('assigned_at', DateTime, default=datetime.utcnow),
    Column('assigned_by', UUID(as_uuid=True), ForeignKey('users.id'))
)

# Tabla de asociación para many-to-many entre Role y Permission
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', UUID(as_uuid=True), ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', UUID(as_uuid=True), ForeignKey('permissions.id'), primary_key=True),
    Column('assigned_at', DateTime, default=datetime.utcnow)
)


class User(Base):
    """
    Modelo de usuario principal para autenticación
    """
    __tablename__ = 'users'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=True, index=True)
    
    # Información personal básica
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=True)
    
    # Autenticación
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    # Seguridad
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    password_changed_at = Column(DateTime, default=datetime.utcnow)
    
    # Metadatos
    metadata_info = Column(JSONB, nullable=True)  # Información adicional flexible
    
    # Relaciones
    roles = relationship("Role", secondary=user_roles, back_populates="users")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, active={self.is_active})>"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def has_permission(self, permission_name):
        """Verificar si el usuario tiene un permiso específico"""
        for role in self.roles:
            for permission in role.permissions:
                if permission.name == permission_name:
                    return True
        return False

    def has_role(self, role_name):
        """Verificar si el usuario tiene un rol específico"""
        return any(role.name == role_name for role in self.roles)


class Role(Base):
    """
    Modelo de roles para control de acceso
    """
    __tablename__ = 'roles'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # Configuración
    is_system_role = Column(Boolean, default=False, nullable=False)  # Roles del sistema no editables
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Metadatos
    metadata_info = Column(JSONB, nullable=True)
    
    # Relaciones
    users = relationship("User", secondary=user_roles, back_populates="roles")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")
    
    def __repr__(self):
        return f"<Role(id={self.id}, name={self.name}, active={self.is_active})>"


class Permission(Base):
    """
    Modelo de permisos granulares
    """
    __tablename__ = 'permissions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    display_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    
    # Categorización
    category = Column(String(50), nullable=False, index=True)  # auth, users, appointments, etc.
    resource = Column(String(50), nullable=False)  # users, appointments, medical_records, etc.
    action = Column(String(20), nullable=False)  # create, read, update, delete, list
    
    # Configuración
    is_system_permission = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")
    
    def __repr__(self):
        return f"<Permission(id={self.id}, name={self.name}, category={self.category})>"


class UserSession(Base):
    """
    Modelo para gestión de sesiones de usuario
    """
    __tablename__ = 'user_sessions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    
    # Información de sesión
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    refresh_token = Column(String(255), unique=True, nullable=True, index=True)
    
    # Información del dispositivo/cliente
    device_type = Column(String(50), nullable=True)  # web, mobile, tablet
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)  # Soporta IPv6
    location = Column(JSONB, nullable=True)  # Geolocalización si está disponible
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    last_activity = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Estado
    is_active = Column(Boolean, default=True, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    revoked_reason = Column(String(100), nullable=True)
    
    # Relaciones
    user = relationship("User", back_populates="sessions")
    
    def __repr__(self):
        return f"<UserSession(id={self.id}, user_id={self.user_id}, active={self.is_active})>"

    @property
    def is_expired(self):
        """Verificar si la sesión ha expirado"""
        return datetime.utcnow() > self.expires_at

    @property
    def is_valid(self):
        """Verificar si la sesión es válida"""
        return self.is_active and not self.is_expired and self.revoked_at is None


class AuditLog(Base):
    """
    Modelo para registro de auditoría de acciones de usuario
    """
    __tablename__ = 'audit_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True, index=True)
    
    # Información de la acción
    action = Column(String(100), nullable=False, index=True)  # login, logout, create_user, etc.
    resource_type = Column(String(50), nullable=True, index=True)  # user, role, permission
    resource_id = Column(String(100), nullable=True, index=True)
    
    # Detalles
    description = Column(Text, nullable=True)
    details = Column(JSONB, nullable=True)  # Detalles específicos de la acción
    
    # Información de contexto
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    session_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Resultado
    success = Column(Boolean, nullable=False, default=True)
    error_message = Column(Text, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relaciones
    user = relationship("User", back_populates="audit_logs")
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, success={self.success})>"


class PasswordResetToken(Base):
    """
    Modelo para tokens de restablecimiento de contraseña
    """
    __tablename__ = 'password_reset_tokens'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    
    # Token
    token = Column(String(255), unique=True, nullable=False, index=True)
    token_hash = Column(String(255), nullable=False)  # Hash del token para seguridad
    
    # Configuración
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    used_at = Column(DateTime, nullable=True)
    
    # Información de contexto
    created_ip = Column(String(45), nullable=True)
    used_ip = Column(String(45), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relación
    user = relationship("User")
    
    def __repr__(self):
        return f"<PasswordResetToken(id={self.id}, user_id={self.user_id}, used={self.is_used})>"

    @property
    def is_expired(self):
        """Verificar si el token ha expirado"""
        return datetime.utcnow() > self.expires_at

    @property
    def is_valid(self):
        """Verificar si el token es válido"""
        return not self.is_used and not self.is_expired


class EmailVerificationToken(Base):
    """
    Modelo para tokens de verificación de email
    """
    __tablename__ = 'email_verification_tokens'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)  # Email a verificar
    
    # Token
    token = Column(String(255), unique=True, nullable=False, index=True)
    token_hash = Column(String(255), nullable=False)
    
    # Configuración
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    used_at = Column(DateTime, nullable=True)
    
    # Información de contexto
    created_ip = Column(String(45), nullable=True)
    used_ip = Column(String(45), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relación
    user = relationship("User")
    
    def __repr__(self):
        return f"<EmailVerificationToken(id={self.id}, email={self.email}, used={self.is_used})>"

    @property
    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired


class SystemConfiguration(Base):
    """
    Modelo para configuraciones del sistema de autenticación
    """
    __tablename__ = 'system_configurations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(JSONB, nullable=True)
    description = Column(Text, nullable=True)
    
    # Categorización
    category = Column(String(50), nullable=False, index=True)  # security, email, general
    is_sensitive = Column(Boolean, default=False, nullable=False)  # Si contiene información sensible
    
    # Control de cambios
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    
    def __repr__(self):
        return f"<SystemConfiguration(key={self.key}, category={self.category})>"

