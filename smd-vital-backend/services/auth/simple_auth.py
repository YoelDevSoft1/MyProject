"""
Sistema de autenticación simplificado que funciona
"""

import json
import hashlib
import uuid
from datetime import datetime

# Simulación de base de datos en memoria
USERS_DB = {}

def create_user(user_data):
    """Crear usuario en memoria"""
    user_id = str(uuid.uuid4())
    
    # Verificar si el email ya existe
    for user in USERS_DB.values():
        if user["email"] == user_data["email"]:
            raise ValueError("El email ya está registrado")
    
    # Crear usuario
    user = {
        "id": user_id,
        "email": user_data["email"],
        "first_name": user_data["first_name"],
        "last_name": user_data["last_name"],
        "phone": user_data.get("phone", ""),
        "password": user_data["password"],  # En producción, hashear
        "role": user_data.get("role", "patient"),
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    USERS_DB[user_id] = user
    return user

def authenticate_user(email, password):
    """Autenticar usuario"""
    for user in USERS_DB.values():
        if user["email"] == email and user["password"] == password and user["is_active"]:
            return user
    return None

def get_user_by_email(email):
    """Obtener usuario por email"""
    for user in USERS_DB.values():
        if user["email"] == email:
            return user
    return None

def user_to_response(user):
    """Convertir usuario a respuesta"""
    return {
        "id": user["id"],
        "email": user["email"],
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "role": user["role"],
        "is_active": user["is_active"],
        "created_at": user["created_at"],
        "updated_at": user["updated_at"]
    }
