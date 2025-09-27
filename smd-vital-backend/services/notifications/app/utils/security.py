"""
SMD Vital - Security Utilities
=============================

Utilidades de seguridad para el sistema SMD Vital:
- Encriptación de datos sensibles
- Validación de tokens
- Funciones de hash seguras
"""

import os
import hashlib
import hmac
import base64
from cryptography.fernet import Fernet
from typing import Any, Dict, Optional
import json

# Clave de encriptación (en producción debería venir de variables de entorno)
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', Fernet.generate_key())
if isinstance(ENCRYPTION_KEY, str):
    ENCRYPTION_KEY = ENCRYPTION_KEY.encode()

# Inicializar Fernet con la clave
fernet = Fernet(ENCRYPTION_KEY)

def encrypt_sensitive_data(data: Any) -> str:
    """
    Encripta datos sensibles usando Fernet
    
    Args:
        data: Datos a encriptar (dict, str, etc.)
        
    Returns:
        str: Datos encriptados en base64
    """
    try:
        # Convertir datos a JSON string si es necesario
        if isinstance(data, (dict, list)):
            data_str = json.dumps(data, ensure_ascii=False)
        else:
            data_str = str(data)
        
        # Encriptar
        encrypted_data = fernet.encrypt(data_str.encode('utf-8'))
        
        # Retornar en base64 para facilitar almacenamiento
        return base64.b64encode(encrypted_data).decode('utf-8')
        
    except Exception as e:
        raise ValueError(f"Error encrypting data: {str(e)}")

def decrypt_sensitive_data(encrypted_data: str) -> Any:
    """
    Desencripta datos sensibles
    
    Args:
        encrypted_data: Datos encriptados en base64
        
    Returns:
        Any: Datos desencriptados
    """
    try:
        # Decodificar base64
        encrypted_bytes = base64.b64decode(encrypted_data.encode('utf-8'))
        
        # Desencriptar
        decrypted_data = fernet.decrypt(encrypted_bytes)
        
        # Intentar parsear como JSON, si falla retornar string
        try:
            return json.loads(decrypted_data.decode('utf-8'))
        except json.JSONDecodeError:
            return decrypted_data.decode('utf-8')
            
    except Exception as e:
        raise ValueError(f"Error decrypting data: {str(e)}")

def hash_password(password: str, salt: Optional[str] = None) -> Dict[str, str]:
    """
    Genera hash seguro de contraseña con salt
    
    Args:
        password: Contraseña a hashear
        salt: Salt opcional (se genera si no se proporciona)
        
    Returns:
        dict: {'hash': str, 'salt': str}
    """
    if salt is None:
        salt = os.urandom(32).hex()
    
    # Combinar password con salt
    salted_password = f"{password}{salt}".encode('utf-8')
    
    # Generar hash SHA-256
    password_hash = hashlib.sha256(salted_password).hexdigest()
    
    return {
        'hash': password_hash,
        'salt': salt
    }

def verify_password(password: str, password_hash: str, salt: str) -> bool:
    """
    Verifica una contraseña contra su hash
    
    Args:
        password: Contraseña a verificar
        password_hash: Hash almacenado
        salt: Salt usado para el hash
        
    Returns:
        bool: True si la contraseña es correcta
    """
    try:
        # Generar hash de la contraseña proporcionada
        salted_password = f"{password}{salt}".encode('utf-8')
        computed_hash = hashlib.sha256(salted_password).hexdigest()
        
        # Comparar usando hmac para evitar timing attacks
        return hmac.compare_digest(computed_hash, password_hash)
        
    except Exception:
        return False

def generate_secure_token(length: int = 32) -> str:
    """
    Genera un token seguro aleatorio
    
    Args:
        length: Longitud del token en bytes
        
    Returns:
        str: Token en hexadecimal
    """
    return os.urandom(length).hex()

def mask_sensitive_data(data: Dict[str, Any], sensitive_fields: list = None) -> Dict[str, Any]:
    """
    Enmascara datos sensibles en un diccionario
    
    Args:
        data: Diccionario con datos
        sensitive_fields: Lista de campos sensibles a enmascarar
        
    Returns:
        dict: Diccionario con datos sensibles enmascarados
    """
    if sensitive_fields is None:
        sensitive_fields = ['password', 'token', 'secret', 'key', 'ssn', 'credit_card']
    
    masked_data = data.copy()
    
    for key, value in masked_data.items():
        if any(field in key.lower() for field in sensitive_fields):
            if isinstance(value, str) and len(value) > 4:
                masked_data[key] = value[:2] + '*' * (len(value) - 4) + value[-2:]
            else:
                masked_data[key] = '***'
    
    return masked_data

def validate_token_format(token: str) -> bool:
    """
    Valida el formato básico de un token
    
    Args:
        token: Token a validar
        
    Returns:
        bool: True si el formato es válido
    """
    if not token or not isinstance(token, str):
        return False
    
    # Verificar longitud mínima
    if len(token) < 16:
        return False
    
    # Verificar que contenga solo caracteres válidos
    valid_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_')
    return all(c in valid_chars for c in token)

def sanitize_input(input_data: str) -> str:
    """
    Sanitiza entrada de usuario para prevenir inyecciones
    
    Args:
        input_data: String a sanitizar
        
    Returns:
        str: String sanitizado
    """
    if not isinstance(input_data, str):
        return str(input_data)
    
    # Remover caracteres peligrosos
    dangerous_chars = ['<', '>', '"', "'", '&', ';', '(', ')', '|', '`', '$']
    sanitized = input_data
    
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '')
    
    # Limitar longitud
    return sanitized[:1000]

# Funciones de utilidad para logging seguro
def safe_log_data(data: Any, max_length: int = 200) -> str:
    """
    Convierte datos a string de forma segura para logging
    
    Args:
        data: Datos a convertir
        max_length: Longitud máxima del string resultante
        
    Returns:
        str: String seguro para logging
    """
    try:
        if isinstance(data, dict):
            # Enmascarar datos sensibles
            masked_data = mask_sensitive_data(data)
            data_str = json.dumps(masked_data, ensure_ascii=False, default=str)
        else:
            data_str = str(data)
        
        # Limitar longitud
        if len(data_str) > max_length:
            data_str = data_str[:max_length] + '...'
        
        return data_str
        
    except Exception:
        return f"<Error serializing data: {type(data).__name__}>"