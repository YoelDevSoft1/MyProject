"""
SMD VITAL - Utilidades de Contraseñas Automatizadas
==================================================

Sistema automatizado de hashing y validación de contraseñas para cumplimiento HIPAA.
"""

import bcrypt
import re
from typing import Tuple, Dict, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class PasswordPolicy:
    """Política de contraseñas para cumplimiento HIPAA"""
    
    MIN_LENGTH = 8
    MAX_LENGTH = 128
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_NUMBERS = True
    REQUIRE_SPECIAL_CHARS = True
    SPECIAL_CHARS = r'[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]'
    FORBIDDEN_PATTERNS = [
        r'password',
        r'123456',
        r'qwerty',
        r'admin',
        r'user',
        r'login'
    ]

class PasswordManager:
    """Gestor automatizado de contraseñas"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hashea automáticamente una contraseña con bcrypt.
        Configuración optimizada para seguridad médica.
        """
        try:
            # Validar contraseña antes de hashear
            validation_result = PasswordManager.validate_password(password)
            if not validation_result['valid']:
                raise ValueError(f"Contraseña inválida: {validation_result['errors']}")
            
            # Configuración de bcrypt para seguridad médica
            salt = bcrypt.gensalt(rounds=14)  # Mayor seguridad que el estándar
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            return hashed.decode('utf-8')
            
        except Exception as e:
            logger.error(f"Error al hashear contraseña: {e}")
            raise ValueError("Error al procesar la contraseña")

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """
        Verifica una contraseña contra su hash.
        Incluye protección contra timing attacks.
        """
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
        except Exception as e:
            logger.error(f"Error al verificar contraseña: {e}")
            return False

    @staticmethod
    def validate_password(password: str) -> Dict[str, Any]:
        """
        Valida una contraseña según la política de seguridad.
        Retorna resultado detallado para auditoría.
        """
        errors = []
        
        # Longitud mínima
        if len(password) < PasswordPolicy.MIN_LENGTH:
            errors.append(f"Debe tener al menos {PasswordPolicy.MIN_LENGTH} caracteres")
        
        # Longitud máxima
        if len(password) > PasswordPolicy.MAX_LENGTH:
            errors.append(f"No puede exceder {PasswordPolicy.MAX_LENGTH} caracteres")
        
        # Caracteres requeridos
        if PasswordPolicy.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            errors.append("Debe contener al menos una letra mayúscula")
        
        if PasswordPolicy.REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            errors.append("Debe contener al menos una letra minúscula")
        
        if PasswordPolicy.REQUIRE_NUMBERS and not re.search(r'\d', password):
            errors.append("Debe contener al menos un número")
        
        if PasswordPolicy.REQUIRE_SPECIAL_CHARS and not re.search(PasswordPolicy.SPECIAL_CHARS, password):
            errors.append("Debe contener al menos un carácter especial")
        
        # Patrones prohibidos
        password_lower = password.lower()
        for pattern in PasswordPolicy.FORBIDDEN_PATTERNS:
            if re.search(pattern, password_lower):
                errors.append(f"No puede contener patrones comunes como '{pattern}'")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'strength': PasswordManager.calculate_strength(password)
        }

    @staticmethod
    def calculate_strength(password: str) -> str:
        """Calcula la fortaleza de la contraseña"""
        score = 0
        
        # Longitud
        if len(password) >= 8:
            score += 1
        if len(password) >= 12:
            score += 1
        if len(password) >= 16:
            score += 1
        
        # Complejidad
        if re.search(r'[A-Z]', password):
            score += 1
        if re.search(r'[a-z]', password):
            score += 1
        if re.search(r'\d', password):
            score += 1
        if re.search(PasswordPolicy.SPECIAL_CHARS, password):
            score += 1
        
        # Determinar fortaleza
        if score <= 3:
            return "Débil"
        elif score <= 5:
            return "Media"
        elif score <= 7:
            return "Fuerte"
        else:
            return "Muy Fuerte"

    @staticmethod
    def generate_secure_password(length: int = 12) -> str:
        """
        Genera una contraseña segura automáticamente.
        Útil para reset de contraseñas o usuarios temporales.
        """
        import secrets
        import string
        
        # Caracteres permitidos
        chars = string.ascii_letters + string.digits + "!@#$%^&*"
        
        # Generar contraseña que cumpla la política
        while True:
            password = ''.join(secrets.choice(chars) for _ in range(length))
            validation = PasswordManager.validate_password(password)
            if validation['valid']:
                return password

    @staticmethod
    def should_change_password(last_change: datetime, max_age_days: int = 90) -> bool:
        """
        Determina si una contraseña debe cambiarse por antigüedad.
        Cumplimiento de políticas de seguridad médica.
        """
        if not last_change:
            return True
        
        age = datetime.utcnow() - last_change
        return age.days > max_age_days

    @staticmethod
    def audit_password_change(user_id: str, change_type: str, success: bool) -> Dict[str, Any]:
        """
        Registra auditoría de cambios de contraseña.
        Requerido para cumplimiento HIPAA.
        """
        return {
            'user_id': user_id,
            'change_type': change_type,  # 'create', 'update', 'reset'
            'success': success,
            'timestamp': datetime.utcnow(),
            'ip_address': None,  # Se debe obtener del contexto de la request
            'user_agent': None   # Se debe obtener del contexto de la request
        }

# Función de conveniencia para uso directo
def auto_hash_password(password: str) -> str:
    """
    Función de conveniencia para hashing automático.
    Usar en lugar de hash_password manual.
    """
    return PasswordManager.hash_password(password)

def auto_verify_password(password: str, hashed: str) -> bool:
    """
    Función de conveniencia para verificación automática.
    Usar en lugar de verify_password manual.
    """
    return PasswordManager.verify_password(password, hashed)
