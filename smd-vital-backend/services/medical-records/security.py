"""
SMD Vital - Medical Records Service Security
============================================

Funciones de seguridad y autenticación para el servicio de registros médicos.

Author: Backend Team
"""

import jwt
import os
import requests
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super_secret_jwt_key_for_smd_vital_2024")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# Auth Service URL
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")

security = HTTPBearer()


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """
    Verificar token JWT y extraer información del usuario
    
    Args:
        credentials: Credenciales HTTP Bearer
        
    Returns:
        Dict con información del usuario
        
    Raises:
        HTTPException: Si el token es inválido
    """
    try:
        token = credentials.credentials
        
        # Decodificar token JWT
        payload = jwt.decode(
            token, 
            JWT_SECRET_KEY, 
            algorithms=[JWT_ALGORITHM]
        )
        
        # Verificar que el token no haya expirado
        if payload.get("exp") and payload.get("exp") < jwt.utils.time.time():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado"
            )
        
        # Extraer información del usuario
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: user_id no encontrado"
            )
        
        return {
            "user_id": user_id,
            "email": payload.get("email"),
            "role": payload.get("role", "patient"),
            "permissions": payload.get("permissions", [])
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    except Exception as e:
        logger.error(f"Error verificando token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error de autenticación"
        )


def get_current_user(token_data: Dict = Depends(verify_token)) -> Dict:
    """
    Obtener información del usuario actual
    
    Args:
        token_data: Datos del token verificado
        
    Returns:
        Dict con información del usuario actual
    """
    return token_data


def verify_permission(required_permission: str):
    """
    Decorator para verificar permisos específicos
    
    Args:
        required_permission: Permiso requerido
        
    Returns:
        Decorator function
    """
    def permission_checker(current_user: Dict = Depends(get_current_user)) -> Dict:
        user_permissions = current_user.get("permissions", [])
        user_role = current_user.get("role", "patient")
        
        # Los administradores tienen todos los permisos
        if user_role == "admin":
            return current_user
            
        # Verificar si el usuario tiene el permiso requerido
        if required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permiso requerido: {required_permission}"
            )
        
        return current_user
    
    return permission_checker


def verify_role(required_roles: list):
    """
    Decorator para verificar roles específicos
    
    Args:
        required_roles: Lista de roles permitidos
        
    Returns:
        Decorator function
    """
    def role_checker(current_user: Dict = Depends(get_current_user)) -> Dict:
        user_role = current_user.get("role", "patient")
        
        if user_role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Rol requerido: {', '.join(required_roles)}"
            )
        
        return current_user
    
    return role_checker


async def validate_user_access(user_id: str, resource_user_id: str, user_role: str) -> bool:
    """
    Validar si un usuario puede acceder a un recurso
    
    Args:
        user_id: ID del usuario que solicita acceso
        resource_user_id: ID del usuario propietario del recurso
        user_role: Rol del usuario
        
    Returns:
        bool: True si tiene acceso, False en caso contrario
    """
    # Los administradores y doctores pueden acceder a todos los recursos
    if user_role in ["admin", "doctor"]:
        return True
    
    # Los pacientes solo pueden acceder a sus propios recursos
    if user_role == "patient" and user_id == resource_user_id:
        return True
    
    return False
