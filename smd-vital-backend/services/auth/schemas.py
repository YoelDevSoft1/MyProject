"""
SMD Vital - Authentication Models
=================================

Modelos Pydantic para el servicio de autenticación.
Define los esquemas de datos para requests y responses.
"""

from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, Literal
from datetime import datetime
from enum import Enum
import re

class UserRole(str, Enum):
    """Roles disponibles en el sistema"""
    PATIENT = "patient"
    DOCTOR = "doctor"
    NURSE = "nurse"
    ADMIN = "admin"

class UserCreate(BaseModel):
    """Esquema para crear un nuevo usuario"""
    email: EmailStr = Field(..., description="Email válido del usuario")
    password: str = Field(..., min_length=8, description="Contraseña (mínimo 8 caracteres)")
    first_name: str = Field(..., min_length=2, max_length=50, description="Nombre")
    last_name: str = Field(..., min_length=2, max_length=50, description="Apellido")
    phone: str = Field(..., description="Número de teléfono")
    role: UserRole = Field(default=UserRole.PATIENT, description="Rol del usuario")
    
    @validator('password')
    def validate_password(cls, v):
        """Validar fortaleza de la contraseña"""
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
        
        if not re.search(r'\d', v):
            raise ValueError('La contraseña debe contener al menos un número')
        
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        """Validar formato de teléfono colombiano"""
        # Remover espacios y caracteres especiales
        phone_clean = re.sub(r'[^\d+]', '', v)
        
        # Patrones válidos para Colombia
        patterns = [
            r'^\+57[0-9]{10}$',  # +573001234567
            r'^57[0-9]{10}$',    # 573001234567
            r'^3[0-9]{9}$',      # 3001234567
            r'^[0-9]{10}$'       # 3001234567
        ]
        
        if not any(re.match(pattern, phone_clean) for pattern in patterns):
            raise ValueError('Formato de teléfono inválido para Colombia')
        
        return phone_clean
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "juan.perez@example.com",
                "password": "MiPassword123!",
                "first_name": "Juan",
                "last_name": "Pérez",
                "phone": "+573001234567",
                "role": "patient"
            }
        }

class UserLogin(BaseModel):
    """Esquema para inicio de sesión"""
    email: EmailStr = Field(..., description="Email del usuario")
    password: str = Field(..., description="Contraseña")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "juan.perez@example.com",
                "password": "MiPassword123!"
            }
        }

class TokenResponse(BaseModel):
    """Respuesta con tokens de autenticación"""
    access_token: str = Field(..., description="Token de acceso JWT")
    refresh_token: str = Field(..., description="Token de renovación")
    token_type: str = Field(default="bearer", description="Tipo de token")
    expires_in: int = Field(default=3600, description="Expiración en segundos")
    user_id: str = Field(..., description="ID del usuario")
    email: str = Field(..., description="Email del usuario")
    role: UserRole = Field(..., description="Rol del usuario")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                "token_type": "bearer",
                "expires_in": 3600,
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "email": "juan.perez@example.com",
                "role": "patient"
            }
        }

class TokenData(BaseModel):
    """Datos contenidos en el token JWT"""
    sub: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[UserRole] = None
    exp: Optional[datetime] = None
    iat: Optional[datetime] = None
    type: Optional[str] = "access"

class User(BaseModel):
    """Modelo completo del usuario"""
    id: str = Field(..., description="ID único del usuario")
    email: str = Field(..., description="Email del usuario")
    first_name: str = Field(..., description="Nombre")
    last_name: str = Field(..., description="Apellido")
    phone: str = Field(..., description="Teléfono")
    role: UserRole = Field(..., description="Rol del usuario")
    is_active: bool = Field(default=True, description="Estado activo")
    email_verified: bool = Field(default=False, description="Email verificado")
    two_factor_enabled: bool = Field(default=False, description="2FA habilitado")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: Optional[datetime] = Field(None, description="Última actualización")
    last_login: Optional[datetime] = Field(None, description="Último login")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "email": "juan.perez@example.com",
                "first_name": "Juan",
                "last_name": "Pérez",
                "phone": "+573001234567",
                "role": "patient",
                "is_active": True,
                "email_verified": True,
                "two_factor_enabled": False,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z",
                "last_login": "2024-01-15T10:30:00Z"
            }
        }

class PasswordReset(BaseModel):
    """Esquema para solicitud de reset de contraseña"""
    email: EmailStr = Field(..., description="Email del usuario")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "juan.perez@example.com"
            }
        }

class PasswordResetConfirm(BaseModel):
    """Esquema para confirmar reset de contraseña"""
    token: str = Field(..., description="Token de reset")
    new_password: str = Field(..., min_length=8, description="Nueva contraseña")
    
    @validator('new_password')
    def validate_password(cls, v):
        """Validar fortaleza de la nueva contraseña"""
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
        
        if not re.search(r'\d', v):
            raise ValueError('La contraseña debe contener al menos un número')
        
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "token": "abc123def456",
                "new_password": "NuevaPassword123!"
            }
        }

class ChangePassword(BaseModel):
    """Esquema para cambio de contraseña"""
    current_password: str = Field(..., description="Contraseña actual")
    new_password: str = Field(..., min_length=8, description="Nueva contraseña")
    
    @validator('new_password')
    def validate_password(cls, v):
        """Validar fortaleza de la nueva contraseña"""
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        
        if not re.search(r'[A-Z]', v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        
        if not re.search(r'[a-z]', v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
        
        if not re.search(r'\d', v):
            raise ValueError('La contraseña debe contener al menos un número')
        
        return v

class TwoFactorAuth(BaseModel):
    """Esquema para configuración de 2FA"""
    enabled: bool = Field(..., description="Habilitar/deshabilitar 2FA")
    
    class Config:
        json_schema_extra = {
            "example": {
                "enabled": True
            }
        }

class TwoFactorVerify(BaseModel):
    """Esquema para verificación de código 2FA"""
    email: EmailStr = Field(..., description="Email del usuario")
    code: str = Field(..., min_length=6, max_length=6, description="Código de 6 dígitos")
    
    @validator('code')
    def validate_code(cls, v):
        """Validar formato del código 2FA"""
        if not v.isdigit():
            raise ValueError('El código debe contener solo números')
        
        if len(v) != 6:
            raise ValueError('El código debe tener exactamente 6 dígitos')
        
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "juan.perez@example.com",
                "code": "123456"
            }
        }
class EmailVerification(BaseModel):
    """Esquema para verificación de email"""
    token: str = Field(..., description="Token de verificación")
    
    class Config:
        json_schema_extra = {
            "example": {
                "token": "abc123def456ghi789"
            }
        }

class UserProfile(BaseModel):
    """Perfil público del usuario"""
    id: str
    first_name: str
    last_name: str
    role: UserRole
    email_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ApiResponse(BaseModel):
    """Respuesta estándar de la API"""
    success: bool = Field(..., description="Indica si la operación fue exitosa")
    message: str = Field(..., description="Mensaje descriptivo")
    data: Optional[dict] = Field(None, description="Datos de respuesta")
    errors: Optional[list] = Field(None, description="Lista de errores")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Operación exitosa",
                "data": {},
                "errors": None
            }
        }

