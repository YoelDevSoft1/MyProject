"""
Sistema de autenticación simplificado para desarrollo
Usa SQLite en lugar de PostgreSQL para facilitar el setup
"""

import sqlite3
import bcrypt
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import os
import logging
import json

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Base de datos SQLite para desarrollo
DB_PATH = "smd_vital_dev.db"

class DatabaseAuthError(Exception):
    """Excepción personalizada para errores de base de datos"""
    pass

class DatabaseAuth:
    def __init__(self):
        self.db_path = DB_PATH
        self.init_database()
    
    def init_database(self):
        """Inicializar la base de datos SQLite"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Crear tabla de usuarios
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    first_name TEXT,
                    last_name TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    is_verified BOOLEAN DEFAULT 0,
                    is_superuser BOOLEAN DEFAULT 0,
                    role TEXT DEFAULT 'patient',
                    google_id TEXT,
                    profile_picture TEXT,
                    email_verified BOOLEAN DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("Database initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            raise DatabaseAuthError(f"Database initialization failed: {e}")
    
    async def init_pool(self):
        """Compatibilidad con la interfaz async"""
        pass
    
    async def close_pool(self):
        """Compatibilidad con la interfaz async"""
        pass
    
    def _hash_password(self, password: str) -> str:
        """Hash de contraseña con bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def _verify_password(self, password: str, hashed: str) -> bool:
        """Verificar contraseña"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    async def create_user(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Crear un nuevo usuario"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Generar ID único
            user_id = str(uuid.uuid4())
            
            # Hash de la contraseña
            password_hash = self._hash_password(user_data['password'])
            
            # Insertar usuario
            cursor.execute('''
                INSERT INTO users (
                    id, email, username, password_hash, first_name, last_name,
                    role, google_id, profile_picture, email_verified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                user_data['email'],
                user_data.get('username', user_data['email'].split('@')[0]),
                password_hash,
                user_data.get('first_name', ''),
                user_data.get('last_name', ''),
                user_data.get('role', 'patient'),
                user_data.get('google_id'),
                user_data.get('profile_picture'),
                user_data.get('email_verified', False)
            ))
            
            conn.commit()
            
            # Obtener el usuario creado
            cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return dict(user)
            return None
            
        except sqlite3.IntegrityError as e:
            logger.error(f"User creation failed - integrity error: {e}")
            raise DatabaseAuthError("Email or username already exists")
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise DatabaseAuthError(f"User creation failed: {e}")
    
    async def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Autenticar usuario"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
            user = cursor.fetchone()
            conn.close()
            
            if user and self._verify_password(password, user['password_hash']):
                return dict(user)
            return None
            
        except Exception as e:
            logger.error(f"Error authenticating user: {e}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Obtener usuario por ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return dict(user)
            return None
            
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Obtener usuario por email"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return dict(user)
            return None
            
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    async def get_user_by_google_id(self, google_id: str) -> Optional[Dict[str, Any]]:
        """Obtener usuario por Google ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM users WHERE google_id = ?', (google_id,))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                return dict(user)
            return None
            
        except Exception as e:
            logger.error(f"Error getting user by Google ID: {e}")
            return None
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Actualizar usuario"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Construir query dinámico
            set_clauses = []
            values = []
            
            for key, value in update_data.items():
                if key not in ['id', 'created_at']:  # Campos que no se pueden actualizar
                    set_clauses.append(f"{key} = ?")
                    values.append(value)
            
            if not set_clauses:
                return False
            
            values.append(user_id)
            query = f"UPDATE users SET {', '.join(set_clauses)}, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            
            cursor.execute(query, values)
            conn.commit()
            
            affected_rows = cursor.rowcount
            conn.close()
            
            return affected_rows > 0
            
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            return False
    
    def user_to_response(self, user: Dict[str, Any]) -> Dict[str, Any]:
        """Convertir usuario a formato de respuesta"""
        return {
            "id": user.get("id"),
            "email": user.get("email"),
            "username": user.get("username"),
            "role": user.get("role"),
            "is_active": bool(user.get("is_active")),
            "is_verified": bool(user.get("is_verified")),
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "profile_picture": user.get("profile_picture"),
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at")
        }

# Instancia global
db_auth = DatabaseAuth()
