"""
Ejemplo de cómo usar el logging estructurado en el servicio de autenticación.
Este archivo muestra cómo integrar el logging en tus endpoints.
"""

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
import time
import uuid
from typing import Optional
from logging_config import logger

app = FastAPI(title="SMD Vital Auth Service")

# Middleware para logging automático de requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware que loggea automáticamente todas las peticiones."""
    start_time = time.time()
    request_id = str(uuid.uuid4())
    
    # Obtener IP del cliente
    client_ip = request.client.host
    if "x-forwarded-for" in request.headers:
        client_ip = request.headers["x-forwarded-for"].split(",")[0]
    
    # Procesar la petición
    response = await call_next(request)
    
    # Calcular duración
    duration_ms = (time.time() - start_time) * 1000
    
    # Log de la petición
    logger.log_request(
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_ms=duration_ms,
        request_id=request_id,
        ip_address=client_ip
    )
    
    return response

# Ejemplo de endpoint de login
@app.post("/login")
async def login(credentials: dict, request: Request):
    """Endpoint de login con logging estructurado."""
    request_id = str(uuid.uuid4())
    client_ip = request.client.host
    
    try:
        # Log del intento de login
        logger.log_auth_event(
            event_type="login_attempt",
            user_id=credentials.get("email"),
            success=False  # Inicialmente false, se cambia si es exitoso
        )
        
        # Simular validación de credenciales
        email = credentials.get("email")
        password = credentials.get("password")
        
        if not email or not password:
            logger.log_auth_event(
                event_type="login_failed",
                user_id=email,
                success=False,
                reason="missing_credentials"
            )
            raise HTTPException(status_code=400, detail="Email y contraseña requeridos")
        
        # Simular verificación de credenciales
        if email == "admin@smdvital.com" and password == "admin123":
            # Login exitoso
            logger.log_auth_event(
                event_type="login_success",
                user_id=email,
                success=True
            )
            
            logger.log_business_event(
                event_type="user_login",
                user_id=email,
                data={
                    "login_time": time.time(),
                    "ip_address": client_ip,
                    "user_agent": request.headers.get("user-agent")
                }
            )
            
            return {
                "access_token": "fake_jwt_token",
                "token_type": "bearer",
                "user_id": email
            }
        else:
            # Credenciales inválidas
            logger.log_auth_event(
                event_type="login_failed",
                user_id=email,
                success=False,
                reason="invalid_credentials"
            )
            
            # Log de seguridad para intentos de login fallidos
            logger.log_security_event(
                event_type="failed_login_attempt",
                user_id=email,
                ip_address=client_ip,
                user_agent=request.headers.get("user-agent"),
                severity="low"
            )
            
            raise HTTPException(status_code=401, detail="Credenciales inválidas")
            
    except HTTPException:
        raise
    except Exception as e:
        # Log de error inesperado
        logger.error(
            f"Error inesperado en login: {str(e)}",
            type="unexpected_error",
            user_id=credentials.get("email"),
            request_id=request_id,
            error_type=type(e).__name__
        )
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# Ejemplo de endpoint de registro
@app.post("/register")
async def register(user_data: dict, request: Request):
    """Endpoint de registro con logging estructurado."""
    request_id = str(uuid.uuid4())
    
    try:
        email = user_data.get("email")
        
        # Log del intento de registro
        logger.log_business_event(
            event_type="user_registration_attempt",
            user_id=email,
            data={
                "registration_data": {
                    "email": email,
                    "name": user_data.get("name"),
                    "phone": user_data.get("phone")
                }
            }
        )
        
        # Simular validación de datos
        if not email:
            logger.log_business_event(
                event_type="user_registration_failed",
                user_id=email,
                data={"reason": "missing_email"}
            )
            raise HTTPException(status_code=400, detail="Email requerido")
        
        # Simular creación de usuario
        logger.log_database_operation(
            operation="INSERT",
            table="users",
            duration_ms=45.2,
            rows_affected=1
        )
        
        # Log de registro exitoso
        logger.log_business_event(
            event_type="user_registration_success",
            user_id=email,
            data={
                "registration_time": time.time(),
                "ip_address": request.client.host
            }
        )
        
        return {
            "message": "Usuario registrado exitosamente",
            "user_id": email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error en registro: {str(e)}",
            type="registration_error",
            user_id=user_data.get("email"),
            request_id=request_id
        )
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# Ejemplo de endpoint de logout
@app.post("/logout")
async def logout(user_id: str, request: Request):
    """Endpoint de logout con logging estructurado."""
    try:
        # Log del logout
        logger.log_auth_event(
            event_type="logout",
            user_id=user_id,
            success=True
        )
        
        logger.log_business_event(
            event_type="user_logout",
            user_id=user_id,
            data={
                "logout_time": time.time(),
                "ip_address": request.client.host
            }
        )
        
        return {"message": "Logout exitoso"}
        
    except Exception as e:
        logger.error(
            f"Error en logout: {str(e)}",
            type="logout_error",
            user_id=user_id
        )
        raise HTTPException(status_code=500, detail="Error interno del servidor")

# Endpoint de health check con logging
@app.get("/health")
async def health_check():
    """Health check con logging."""
    logger.info(
        "Health check realizado",
        type="health_check",
        status="healthy"
    )
    return {"status": "healthy", "service": "auth-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)













