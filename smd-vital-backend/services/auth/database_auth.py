"""
Sistema de autenticación con base de datos PostgreSQL usando asyncpg y bcrypt
Versión mejorada con manejo de errores, logging y mejores prácticas
"""

import asyncpg
import bcrypt
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
import os
import logging
from password_utils import PasswordManager, auto_hash_password, auto_verify_password

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuración de la base de datos
DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql+asyncpg://smdvital:smdvital_password_2024@postgres:5432/smdvital_users'
)

# Roles predefinidos
ROLE_PATIENT = "patient"
ROLE_USER = "user"
ROLE_ADMIN = "admin"
ROLE_DOCTOR = "doctor"

class DatabaseAuthError(Exception):
    """Excepción personalizada para errores de base de datos"""
    pass

def record_to_dict(record: asyncpg.Record) -> Dict[str, Any]:
    """Convierte asyncpg.Record a dict, manejando fechas y UUIDs."""
    if not record:
        return {}
    
    d = dict(record)
    for key in ['created_at', 'updated_at', 'last_login', 'date_of_birth']:
        if d.get(key) and isinstance(d[key], datetime):
            d[key] = d[key].isoformat()
    
    # Convertir UUIDs a strings
    for key, value in d.items():
        if hasattr(value, '__class__') and 'UUID' in str(value.__class__):
            d[key] = str(value)
    
    return d

class DatabaseAuth:
    _pool: Optional[asyncpg.pool.Pool] = None

    @classmethod
    async def get_pool(cls):
        """Obtiene o crea el pool de conexiones."""
        if cls._pool is None:
            await cls.init_pool()
        return cls._pool

    async def init_pool(self):
        """Inicializa el pool de conexiones si no existe."""
        if self._pool is None:
            try:
                # Parsear DATABASE_URL
                url = DATABASE_URL.replace('postgresql+asyncpg://', '')
                if '@' not in url:
                    raise DatabaseAuthError("Formato de DATABASE_URL inválido")
                
                user_pass, host_db = url.split('@')
                user, password = user_pass.split(':')
                host_port, database = host_db.split('/')
                host_port_split = host_port.split(':')
                host = host_port_split[0]
                port = int(host_port_split[1]) if len(host_port_split) > 1 else 5432

                self._pool = await asyncpg.create_pool(
                    user=user,
                    password=password,
                    host=host,
                    port=port,
                    database=database,
                    min_size=1,
                    max_size=10,
                    timeout=30
                )
                logger.info("Pool de conexiones a la base de datos inicializado correctamente")
            except Exception as e:
                logger.error(f"Error al inicializar el pool de conexiones: {e}")
                raise DatabaseAuthError(f"No se pudo conectar a la base de datos: {e}")

    async def close_pool(self):
        """Cierra el pool de conexiones."""
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("Pool de conexiones cerrado")

    @staticmethod
    def hash_password(password: str) -> str:
        """Hashea la contraseña usando el sistema automatizado."""
        try:
            return auto_hash_password(password)
        except Exception as e:
            logger.error(f"Error al hashear contraseña: {e}")
            raise DatabaseAuthError("Error al procesar la contraseña")

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verifica la contraseña usando el sistema automatizado."""
        try:
            return auto_verify_password(password, hashed)
        except Exception as e:
            logger.error(f"Error al verificar contraseña: {e}")
            return False

    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crea un usuario nuevo.
        user_data debe contener al menos 'email'.
        """
        try:
            await self.init_pool()
            user_id = str(uuid.uuid4())
            now = datetime.utcnow()

            async with self._pool.acquire() as conn:
                # Verificar si email ya existe
                existing = await conn.fetchrow(
                    "SELECT id FROM users WHERE email = $1", 
                    user_data["email"].lower()
                )
                if existing:
                    raise ValueError("El email ya está registrado")

                # Preparar datos para inserción
                email = user_data["email"].lower()
                username = user_data.get("username", email.split("@")[0])
                role = user_data.get("role", ROLE_PATIENT)
                
                if "password" in user_data:
                    # Registro normal con contraseña
                    password_hash = self.hash_password(user_data["password"])
                    
                    await conn.execute("""
                        INSERT INTO users (id, email, username, password_hash, role, 
                        is_active, is_verified, created_at, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    """, user_id, email, username, password_hash, role, 
                    True, False, now, now)
                else:
                    # Registro con Google OAuth
                    await conn.execute("""
                        INSERT INTO users (id, email, username, role, is_active, 
                        is_verified, google_id, profile_picture, email_verified, 
                        first_name, last_name, created_at, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    """, user_id, email, username, role, True, True,
                    user_data.get("google_id"), user_data.get("profile_picture"),
                    user_data.get("email_verified", True),
                    user_data.get("first_name", ""), user_data.get("last_name", ""),
                    now, now)

                user = await conn.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
                return record_to_dict(user)
                
        except ValueError:
            raise  # Re-lanzar errores de validación
        except Exception as e:
            logger.error(f"Error al crear usuario: {e}")
            raise DatabaseAuthError("Error al crear el usuario en la base de datos")

    async def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Autentica usuario con email y contraseña.
        Retorna dict con datos del usuario o None si falla.
        """
        try:
            await self.init_pool()
            now = datetime.utcnow()

            async with self._pool.acquire() as conn:
                user = await conn.fetchrow("""
                    SELECT * FROM users 
                    WHERE email = $1 AND is_active = true
                """, email.lower())

                if not user:
                    return None

                if not user['password_hash']:
                    # Usuario sin contraseña (ej. Google OAuth)
                    return None

                if not self.verify_password(password, user['password_hash']):
                    return None

                # Actualizar último login
                await conn.execute(
                    "UPDATE users SET last_login = $1 WHERE id = $2",
                    now, user['id']
                )
                return record_to_dict(user)
                
        except Exception as e:
            logger.error(f"Error en autenticación: {e}")
            return None

    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Obtiene usuario por email."""
        try:
            await self.init_pool()
            async with self._pool.acquire() as conn:
                user = await conn.fetchrow(
                    "SELECT * FROM users WHERE email = $1", 
                    email.lower()
                )
                return record_to_dict(user) if user else None
        except Exception as e:
            logger.error(f"Error al obtener usuario por email: {e}")
            return None

    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene usuario por ID."""
        try:
            await self.init_pool()
            async with self._pool.acquire() as conn:
                user = await conn.fetchrow(
                    "SELECT * FROM users WHERE id = $1", 
                    user_id
                )
                return record_to_dict(user) if user else None
        except Exception as e:
            logger.error(f"Error al obtener usuario por ID: {e}")
            return None

    async def get_user_by_google_id(self, google_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene usuario por Google ID."""
        try:
            await self.init_pool()
            async with self._pool.acquire() as conn:
                user = await conn.fetchrow(
                    "SELECT * FROM users WHERE google_id = $1", 
                    google_id
                )
                return record_to_dict(user) if user else None
        except Exception as e:
            logger.error(f"Error al obtener usuario por Google ID: {e}")
            return None

    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Actualiza los datos de un usuario."""
        try:
            await self.init_pool()
            now = datetime.utcnow()
            
            # Preparar campos y valores para la actualización
            set_clauses = []
            values = []
            index = 1
            
            for key, value in update_data.items():
                if key == "password":
                    set_clauses.append(f"password_hash = ${index}")
                    values.append(self.hash_password(value))
                    index += 1
                elif key in ["first_name", "last_name", "username", "profile_picture", "role"]:
                    set_clauses.append(f"{key} = ${index}")
                    values.append(value)
                    index += 1
            
            if not set_clauses:
                return False  # No hay nada que actualizar
                
            set_clauses.append("updated_at = $" + str(index))
            values.append(now)
            index += 1
            
            values.append(user_id)  # Para la condición WHERE
            
            query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ${index}"
            
            async with self._pool.acquire() as conn:
                result = await conn.execute(query, *values)
                return "UPDATE" in result
                
        except Exception as e:
            logger.error(f"Error al actualizar usuario: {e}")
            return False

    async def delete_user(self, user_id: str) -> bool:
        """Elimina un usuario (desactiva en lugar de borrar)."""
        try:
            await self.init_pool()
            async with self._pool.acquire() as conn:
                result = await conn.execute(
                    "UPDATE users SET is_active = false, updated_at = $1 WHERE id = $2",
                    datetime.now(timezone.utc), user_id
                )
                return "UPDATE" in result
        except Exception as e:
            logger.error(f"Error al eliminar usuario: {e}")
            return False

    def user_to_response(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Convierte usuario a formato de respuesta simplificado."""
        if not user:
            logger.error("user_to_response recibió datos vacíos")
            return {}
            
        logger.info(f"Transformando usuario: {user.get('id', 'N/A')} - {user.get('email', 'N/A')}")
        
        # Construir nombre completo para facilitar el frontend
        first_name = user.get("first_name") or ""
        last_name = user.get("last_name") or ""
        full_name = f"{first_name} {last_name}".strip() if first_name or last_name else ""
        
        # Si no hay nombre completo, usar email como fallback
        if not full_name and user.get("email"):
            full_name = user.get("email").split("@")[0]
        
        # Si aún no hay nombre, usar username
        if not full_name and user.get("username"):
            full_name = user.get("username")
        
        # Último fallback
        if not full_name:
            full_name = "Usuario"
        
        response = {
            "id": user.get("id") or "",
            "email": user.get("email") or "",
            "username": user.get("username") or "",
            "role": user.get("role") or ROLE_USER,
            "is_active": user.get("is_active", False),
            "is_verified": user.get("is_verified", False),
            "google_id": user.get("google_id") or "",
            "profile_picture": user.get("profile_picture") or "",
            "email_verified": user.get("email_verified", False),
            "first_name": first_name,
            "last_name": last_name,
            "name": full_name,  # Campo adicional para facilitar el frontend
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at"),
            "last_login": user.get("last_login")
        }
        
        logger.info(f"Usuario transformado: {response}")
        return response

# Instancia global para usar en la app
db_auth = DatabaseAuth()