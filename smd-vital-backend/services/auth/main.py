"""
SMD Vital - Authentication Service
Microservicio de autenticación mejorado para la plataforma SMD Vital.
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
from contextlib import asynccontextmanager

# Importar el módulo de base de datos
from database_auth import db_auth, DatabaseAuthError
from user_detection_service import user_detection_service, UserType

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

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manejar eventos de inicio y cierre de la aplicación"""
    # Startup
    try:
        await db_auth.init_pool()
        logger.info("Sistema de autenticación inicializado correctamente")
    except Exception as e:
        logger.error(f"Error al inicializar el sistema de autenticación: {e}")
        raise
    
    yield
    
    # Shutdown
    await db_auth.close_pool()
    logger.info("Conexiones de base de datos cerradas")

# FastAPI app instance
app = FastAPI(
    title="SMD Vital - Authentication Service",
    description="Microservicio de autenticación para SMD Vital Bogotá",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# ===== CONFIGURACIÓN CORS =====
# CORS habilitado temporalmente para desarrollo
# En producción, Nginx se encarga de CORS
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
    
    # Para usuarios temporales de Google (desarrollo)
    if user_id.startswith("google_"):
        logger.info(f"Usuario temporal de Google: {user_id}")
        return payload  # Retornar el payload completo para usuarios temporales
    
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
        "service": "auth-service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# Metrics endpoint for Prometheus
@app.get("/metrics", tags=["Metrics"])
async def metrics():
    """Prometheus metrics endpoint"""
    from shared.metrics import get_metrics_response
    return get_metrics_response()

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "SMD Vital Authentication Service",
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
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno del servidor")
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
        
        # Realizar detección inteligente del usuario
        detection_result = user_detection_service.detect_user_type(user)
        dashboard_config = user_detection_service.get_user_dashboard_config(
            detection_result["detected_type"], 
            user.get("specialty", "")
        )
        
        # Crear tokens
        access_token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
        refresh_token = create_refresh_token({"sub": user["id"]})
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user_detection": {
                "detected_type": detection_result["detected_type"].value,
                "confidence": detection_result["confidence"],
                "suggested_interface": detection_result["suggested_interface"],
                "category": detection_result["category"].value,
                "permissions": detection_result["permissions"]
            },
            "dashboard_config": dashboard_config
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
    # Para usuarios temporales de Google (desarrollo)
    if isinstance(current_user, dict) and current_user.get("sub", "").startswith("google_"):
        return {
            "id": current_user.get("sub"),
            "email": current_user.get("email"),
            "username": current_user.get("email", "").split("@")[0],
            "role": current_user.get("role", "patient"),
            "is_active": True,
            "is_verified": True,
            "first_name": current_user.get("name", "Usuario").split(" ")[0],
            "last_name": " ".join(current_user.get("name", "Google").split(" ")[1:]) or "Google",
            "profile_picture": None,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    
    # Para usuarios normales de base de datos
    return db_auth.user_to_response(current_user)

@app.get("/me/detection", tags=["Authentication"])
@app.get("/api/me/detection", tags=["Authentication"], include_in_schema=False)
async def get_user_detection_info(current_user: dict = Depends(get_current_user)):
    """Obtener información de detección inteligente del usuario actual"""
    try:
        # Realizar detección inteligente
        detection_result = user_detection_service.detect_user_type(current_user)
        
        # Obtener configuración del dashboard
        dashboard_config = user_detection_service.get_user_dashboard_config(
            detection_result["detected_type"], 
            current_user.get("specialty", "")
        )
        
        # Preparar respuesta
        response = {
            "user_id": current_user.get("id"),
            "email": current_user.get("email"),
            "detection": {
                "detected_type": detection_result["detected_type"].value,
                "confidence": detection_result["confidence"],
                "reasons": detection_result["reasons"],
                "category": detection_result["category"].value,
                "suggested_interface": detection_result["suggested_interface"],
                "permissions": detection_result["permissions"]
            },
            "dashboard_config": dashboard_config,
            "original_role": current_user.get("role"),
            "specialty": current_user.get("specialty", ""),
            "detection_timestamp": datetime.utcnow().isoformat()
        }
        
        logger.info(f"Detección de usuario completada para {current_user.get('email')}: {detection_result['detected_type'].value}")
        return response
        
    except Exception as e:
        logger.error(f"Error en detección de usuario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al detectar tipo de usuario"
        )

@app.get("/users/{user_id}", response_model=UserResponse, tags=["Authentication"])
async def get_user_by_id(user_id: str):
    """Obtener información de un usuario por ID (para uso interno entre servicios)"""
    try:
        logger.info(f"Getting user by ID: {user_id}")
        user = await db_auth.get_user_by_id(user_id)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        return db_auth.user_to_response(user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user by ID: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )

@app.post("/refresh", response_model=Token, tags=["Authentication"])
async def refresh_token(refresh_data: dict):
    """Refrescar token de acceso"""
    try:
        refresh_token = refresh_data.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Refresh token requerido"
            )
        
        # Verificar el refresh token
        try:
            payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            if payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Tipo de token inválido"
                )
                
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token inválido"
                )
                
            # Verificar que el usuario aún existe
            user = await db_auth.get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario no encontrado"
                )
                
            # Generar nuevos tokens
            access_token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
            new_refresh_token = create_refresh_token({"sub": user["id"]})
            
            return {
                "access_token": access_token,
                "refresh_token": new_refresh_token,
                "token_type": "bearer"
            }
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expirado"
            )
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token inválido"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing token: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error interno del servidor")

@app.post("/logout", tags=["Authentication"])
async def logout_user():
    """Cerrar sesión de usuario"""
    # En una implementación real, invalidarías el token aquí
    return {"message": "Logout exitoso"}

@app.get("/google", tags=["Authentication"])
async def google_auth_get():
    """Endpoint GET para Google OAuth - información de configuración"""
    return {
        "status": "ok", 
        "message": "Google OAuth endpoint disponible",
        "methods": ["POST"],
        "description": "Use POST para autenticación con Google"
    }

@app.post("/google/verify", tags=["Authentication"])
async def google_verify_token():
    """Endpoint para verificación de tokens de Google (FedCM)"""
    return {"status": "ok", "message": "Google token verification endpoint"}

@app.post("/google", response_model=Token, tags=["Authentication"])
async def google_auth(google_data: GoogleAuthData):
    """Autenticación con Google OAuth - Versión simplificada para desarrollo"""
    try:
        logger.info(f"Google auth request received for development")
        
        # Validar datos mínimos requeridos
        if not google_data.googleId or not google_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Datos de Google incompletos. Se requiere googleId + email"
            )
        
        google_id = google_data.googleId
        email = google_data.email
        name = google_data.name or "Usuario Google"
        
        # Para desarrollo, crear un usuario temporal sin base de datos
        user_id = f"google_{google_id}"
        
        # Generar tokens JWT directamente
        access_token = create_access_token({
            "sub": user_id, 
            "email": email, 
            "role": "patient",
            "google_id": google_id,
            "name": name
        })
        refresh_token = create_refresh_token({"sub": user_id})
        
        logger.info(f"Google auth successful for {email}")
        
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
            detail=f"Error interno del servidor: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
