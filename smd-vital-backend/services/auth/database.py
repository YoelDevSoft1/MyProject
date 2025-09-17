"""
SMD Vital - Authentication Service Database Connection
====================================================

Configuración de conexión a la base de datos para el servicio de autenticación.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from simple_models import Base, User
from passlib.context import CryptContext
import uuid
from datetime import datetime

# Configuración de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://smdvital:smdvital_password_2024@localhost:5432/smdvital_auth")

# Crear engine
engine = create_engine(DATABASE_URL)

# Crear session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Contexto para hash de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    """Dependency para obtener sesión de base de datos"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generar hash de contraseña"""
    return pwd_context.hash(password)

def create_user(db, user_data) -> User:
    """Crear nuevo usuario en la base de datos"""
    # Verificar si el email ya existe
    existing_user = db.query(User).filter(User.email == user_data["email"]).first()
    if existing_user:
        raise ValueError("El email ya está registrado")
    
    # Crear nuevo usuario
    db_user = User(
        id=str(uuid.uuid4()),
        email=user_data["email"],
        first_name=user_data["first_name"],
        last_name=user_data["last_name"],
        phone_number=user_data.get("phone", ""),
        password_hash=get_password_hash(user_data["password"]),
        role=user_data.get("role", "patient"),
        is_active=True,
        is_verified=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

def authenticate_user(db, email: str, password: str) -> User:
    """Autenticar usuario"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    if not user.is_active:
        return None
    return user

def get_user_by_id(db, user_id: str) -> User:
    """Obtener usuario por ID"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db, email: str) -> User:
    """Obtener usuario por email"""
    return db.query(User).filter(User.email == email).first()

def user_to_schema(user: User) -> dict:
    """Convertir modelo User a diccionario para respuesta"""
    return {
        "id": str(user.id),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }

def init_roles(db):
    """Inicializar roles básicos si no existen - Simplificado"""
    # Crear tabla si no existe
    Base.metadata.create_all(bind=db.bind)
    db.commit()