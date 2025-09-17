"""
SMD Vital - Payment Service Security
====================================

Funciones de seguridad y autenticación para el servicio de pagos.

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
    Verifica el token JWT y retorna la información del usuario
    """
    try:
        # Decodificar el token JWT
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )
        
        # Verificar que el token no haya expirado
        if payload.get("exp") and payload.get("exp") < jwt.datetime.utcnow().timestamp():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado"
            )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.JWTError:
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
    Obtiene la información del usuario actual desde el token
    """
    try:
        user_id = token_data.get("user_id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: falta user_id"
            )
        
        # Opcional: Verificar con el servicio de autenticación
        # response = requests.get(
        #     f"{AUTH_SERVICE_URL}/users/{user_id}",
        #     headers={"Authorization": f"Bearer {token_data}"}
        # )
        # 
        # if response.status_code != 200:
        #     raise HTTPException(
        #         status_code=status.HTTP_401_UNAUTHORIZED,
        #         detail="Usuario no encontrado"
        #     )
        
        return {
            "user_id": user_id,
            "email": token_data.get("email"),
            "role": token_data.get("role"),
            "permissions": token_data.get("permissions", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo usuario actual: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )


def require_permission(permission: str):
    """
    Decorator para requerir un permiso específico
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Obtener el usuario actual del contexto
            # Esto requeriría modificar la función para incluir el usuario
            return func(*args, **kwargs)
        return wrapper
    return decorator


def is_admin(user: Dict = Depends(get_current_user)) -> bool:
    """
    Verifica si el usuario actual es administrador
    """
    return user.get("role") == "admin"


def is_doctor(user: Dict = Depends(get_current_user)) -> bool:
    """
    Verifica si el usuario actual es doctor
    """
    return user.get("role") == "doctor"


def is_patient(user: Dict = Depends(get_current_user)) -> bool:
    """
    Verifica si el usuario actual es paciente
    """
    return user.get("role") == "patient"
