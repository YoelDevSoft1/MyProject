"""
SMD Vital - Authentication Service (Simplified)
Versión simplificada para desarrollo rápido con SQLite
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
import logging
import os
from typing import Optional
import jwt
from pydantic import BaseModel, EmailStr, validator

# Importar el módulo de base de datos simplificado
from database_auth_simple import db_auth, DatabaseAuthError

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuración de JWT
JWT_SECRET = os.getenv("JWT_SECRET", "smd_vital_secret_key_2024_change_in_production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 horas

# Esquemas Pydantic para validación de datos
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = "patient"

    @validator('password')
    def password_length(cls, v):
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None

class GoogleAuthData(BaseModel):
    googleId: Optional[str] = None
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    picture: Optional[str] = None
    email_verified: Optional[bool] = False
    token: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    role: str
    is_active: bool
    is_verified: bool
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_picture: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

# Configuración de OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# FastAPI app instance
app = FastAPI(
    title="SMD Vital - Authentication Service (Simplified)",
    description="Microservicio de autenticación simplificado para SMD Vital",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ===== CONFIGURACIÓN CORS =====
# CORS habilitado para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utilidades JWT
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea un token JWT de acceso"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    """Crea un token JWT de refresh"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Obtiene el usuario actual a partir del token JWT"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decodificar el token JWT
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        
        logger.info(f"Token decodificado - User ID: {user_id}")
        
        if user_id is None:
            logger.error("No se encontró 'sub' en el token JWT")
            raise credentials_exception
            
        token_data = TokenData(user_id=user_id)
        
    except jwt.ExpiredSignatureError:
        logger.error("Token JWT expirado")
        raise credentials_exception
    except jwt.PyJWTError as e:
        logger.error(f"Error al decodificar JWT: {e}")
        raise credentials_exception
    
    # Buscar usuario en la base de datos
    logger.info(f"Buscando usuario con ID: {user_id}")
    user = await db_auth.get_user_by_id(token_data.user_id)
    
    if user is None:
        logger.error(f"Usuario no encontrado en la base de datos: {user_id}")
        raise credentials_exception
    
    logger.info(f"Usuario encontrado: {user.get('email', 'N/A')} (ID: {user.get('id', 'N/A')})")
    return user

# Endpoints básicos
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "auth-service-simplified",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "SMD Vital Authentication Service (Simplified)",
        "docs": "/docs",
        "health": "/health"
    }

# ===== RUTAS DE AUTENTICACIÓN =====
@app.post("/register", response_model=Token, tags=["Authentication"])
async def register_user(user_data: UserCreate):
    """Registrar un nuevo usuario"""
    try:
        logger.info(f"Register request received for email: {user_data.email}")
        
        # Crear usuario en base de datos
        user_dict = user_data.dict()
        user = await db_auth.create_user(user_dict)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo crear el usuario"
            )
        
        # Crear tokens
        access_token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
        refresh_token = create_refresh_token({"sub": user["id"]})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except DatabaseAuthError as e:
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno del servidor")

@app.post("/login", response_model=Token, tags=["Authentication"])
async def login_user(login_data: UserLogin):
    """Iniciar sesión de usuario"""
    try:
        logger.info(f"Login attempt for email: {login_data.email}")
        
        # Autenticar usuario
        user = await db_auth.authenticate_user(login_data.email, login_data.password)
        if not user:
            logger.warning(f"Failed login attempt for email: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"Successful login for user: {user['email']}")
        
        # Crear tokens
        access_token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
        refresh_token = create_refresh_token({"sub": user["id"]})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno del servidor")

@app.get("/me", response_model=UserResponse, tags=["Authentication"])
@app.get("/api/me", response_model=UserResponse, tags=["Authentication"], include_in_schema=False)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    return db_auth.user_to_response(current_user)

@app.get("/me/detection", tags=["Authentication"])
@app.get("/api/me/detection", tags=["Authentication"], include_in_schema=False)
async def get_user_detection_info(current_user: dict = Depends(get_current_user)):
    """Provide a lightweight detection profile for the current user"""
    try:
        role = (current_user.get("role") or "patient").lower()
        detection_profiles = {
            "doctor": {
                "detected_type": "doctor",
                "confidence": 0.92,
                "reasons": [
                    "Account role is doctor",
                    "Recent activity includes patient chart access"
                ],
                "category": "clinical",
                "suggested_interface": "doctor",
                "permissions": [
                    "view_patients",
                    "manage_appointments",
                    "view_reports"
                ],
                "dashboard_title": "Clinical Dashboard",
                "dashboard_widgets": [
                    "appointments_today",
                    "patient_alerts",
                    "tasks"
                ],
                "primary_color": "#2D5A87",
                "icon": "stethoscope"
            },
            "nurse": {
                "detected_type": "nurse",
                "confidence": 0.9,
                "reasons": [
                    "Account role is nurse",
                    "Assigned to active care teams"
                ],
                "category": "clinical",
                "suggested_interface": "nurse",
                "permissions": [
                    "view_patients",
                    "update_vitals",
                    "manage_tasks"
                ],
                "dashboard_title": "Nursing Station",
                "dashboard_widgets": [
                    "patient_status",
                    "medication_schedule",
                    "team_messages"
                ],
                "primary_color": "#4A90E2",
                "icon": "heart"
            },
            "admin": {
                "detected_type": "admin",
                "confidence": 0.95,
                "reasons": [
                    "Account role is admin",
                    "Has system management permissions"
                ],
                "category": "administration",
                "suggested_interface": "admin",
                "permissions": [
                    "manage_users",
                    "view_reports",
                    "configure_system"
                ],
                "dashboard_title": "Administration Console",
                "dashboard_widgets": [
                    "system_health",
                    "user_activity",
                    "billing_overview"
                ],
                "primary_color": "#E67E22",
                "icon": "settings"
            },
            "receptionist": {
                "detected_type": "receptionist",
                "confidence": 0.88,
                "reasons": [
                    "Account role is receptionist",
                    "Primary tasks include appointment management"
                ],
                "category": "operations",
                "suggested_interface": "receptionist",
                "permissions": [
                    "manage_appointments",
                    "check_in_patients",
                    "update_contacts"
                ],
                "dashboard_title": "Front Desk",
                "dashboard_widgets": [
                    "today_schedule",
                    "waiting_room",
                    "quick_actions"
                ],
                "primary_color": "#F39C12",
                "icon": "calendar"
            },
            "patient": {
                "detected_type": "patient",
                "confidence": 0.85,
                "reasons": [
                    "Account role is patient"
                ],
                "category": "patients",
                "suggested_interface": "patient",
                "permissions": [
                    "view_records",
                    "schedule_appointments",
                    "manage_profile"
                ],
                "dashboard_title": "My Health",
                "dashboard_widgets": [
                    "next_appointment",
                    "care_plan",
                    "notifications"
                ],
                "primary_color": "#27AE60",
                "icon": "user"
            }
        }

        profile = detection_profiles.get(role, detection_profiles["patient"])
        response = {
            "user_id": current_user.get("id"),
            "email": current_user.get("email"),
            "detection": {
                "detected_type": profile["detected_type"],
                "confidence": profile["confidence"],
                "reasons": profile["reasons"],
                "category": profile["category"],
                "suggested_interface": profile["suggested_interface"],
                "permissions": profile["permissions"]
            },
            "dashboard_config": {
                "title": profile["dashboard_title"],
                "widgets": profile["dashboard_widgets"],
                "primary_color": profile["primary_color"],
                "icon": profile["icon"]
            },
            "original_role": role,
            "specialty": current_user.get("specialty", ""),
            "detection_timestamp": datetime.utcnow().isoformat()
        }

        logger.info("Detection profile calculated for %s: %s", current_user.get("email"), profile["detected_type"])
        return response
    except Exception as exc:
        logger.error(f"Error generating detection data: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al detectar tipo de usuario"
        )
@app.post("/logout", tags=["Authentication"])
async def logout_user():
    """Cerrar sesión de usuario"""
    return {"message": "Logout exitoso"}

@app.post("/google", response_model=Token, tags=["Authentication"])
async def google_auth(google_data: GoogleAuthData):
    """Autenticación con Google OAuth"""
    try:
        logger.info(f"Google auth request received")
        
        # Validar datos mínimos requeridos
        if not google_data.googleId or not google_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Datos de Google incompletos. Se requiere googleId + email"
            )
        
        google_id = google_data.googleId
        email = google_data.email
        name = google_data.name
        picture = google_data.picture
        given_name = google_data.given_name
        family_name = google_data.family_name
        email_verified = google_data.email_verified or True
        
        # Verificar si el usuario ya existe por Google ID
        user = await db_auth.get_user_by_google_id(google_id)
        
        if not user:
            # Si no existe por Google ID, verificar por email
            user = await db_auth.get_user_by_email(email)
            
            if user:
                # Usuario existe por email, actualizar con Google ID
                await db_auth.update_user(user["id"], {
                    "google_id": google_id,
                    "profile_picture": picture,
                    "email_verified": email_verified,
                    "first_name": given_name or name.split(" ")[0] if name else user.get("first_name", ""),
                    "last_name": family_name or " ".join(name.split(" ")[1:]) if name and len(name.split(" ")) > 1 else user.get("last_name", "")
                })
            else:
                # Crear nuevo usuario con Google
                user_data = {
                    "email": email,
                    "username": email.split("@")[0],
                    "password": "google_oauth_user",  # Contraseña dummy para usuarios de Google
                    "first_name": given_name or name.split(" ")[0] if name else "",
                    "last_name": family_name or " ".join(name.split(" ")[1:]) if name and len(name.split(" ")) > 1 else "",
                    "role": "patient",
                    "google_id": google_id,
                    "profile_picture": picture,
                    "email_verified": email_verified
                }
                
                user = await db_auth.create_user(user_data)
                if not user:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Error al crear usuario"
                    )
        
        # Generar tokens JWT
        access_token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
        refresh_token = create_refresh_token({"sub": user["id"]})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en autenticación con Google: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
