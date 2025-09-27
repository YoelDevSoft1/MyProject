# 🌐 **INSTRUCCIONES COMPLETAS PARA SOLUCIONAR CORS EN EL BACKEND**

## **📋 RESUMEN DE CAMBIOS NECESARIOS**

Para completar la solución de CORS, necesitas implementar estos cambios en tu backend FastAPI:

### **🚨 PROBLEMAS IDENTIFICADOS**
1. **Headers duplicados** - `Access-Control-Allow-Origin` aparece múltiples veces
2. **Configuración inconsistente** - Algunos endpoints permiten CORS, otros no
3. **Métodos no permitidos** - OPTIONS requests no están manejados correctamente
4. **Credenciales inconsistentes** - `Access-Control-Allow-Credentials` mal configurado

---

## **🔧 PASO 1: CONFIGURACIÓN CORS EN FASTAPI**

### **Archivo: `main.py` o donde inicialices FastAPI**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="SMD VITAL API",
    description="API del Sistema Médico Digital VITAL",
    version="1.0.0"
)

# ========== CONFIGURACIÓN CORS COMPLETA ==========

# Orígenes permitidos para CORS
ALLOWED_ORIGINS = [
    "http://localhost:3000",      # React dev server (por defecto)
    "http://localhost:3001",      # React dev server (tu configuración)
    "http://127.0.0.1:3000",      # Alternativa localhost
    "http://127.0.0.1:3001",      # Alternativa localhost
    "https://tu-dominio.com",     # Producción (reemplazar con tu dominio)
    "https://www.tu-dominio.com", # Producción con www
]

# En desarrollo, permitir todos los orígenes
if os.getenv("ENVIRONMENT") == "development":
    ALLOWED_ORIGINS = ["*"]

# Configurar middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=[
        "GET", 
        "POST", 
        "PUT", 
        "DELETE", 
        "OPTIONS", 
        "HEAD", 
        "PATCH"
    ],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRF-Token",
        "X-Custom-Header"
    ],
    expose_headers=[
        "Content-Length",
        "Content-Range",
        "X-Total-Count"
    ]
)

# ========== MIDDLEWARE ADICIONAL PARA CORS ==========

@app.middleware("http")
async def cors_handler(request, call_next):
    """
    Middleware adicional para manejar casos especiales de CORS
    """
    # Manejar preflight requests (OPTIONS)
    if request.method == "OPTIONS":
        response = Response()
        response.headers["Access-Control-Allow-Origin"] = request.headers.get("Origin", "*")
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "86400"  # 24 horas
        return response
    
    # Procesar request normal
    response = await call_next(request)
    
    # Asegurar headers CORS en todas las respuestas
    origin = request.headers.get("Origin")
    if origin and origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
    elif ALLOWED_ORIGINS == ["*"]:
        response.headers["Access-Control-Allow-Origin"] = "*"
    
    response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response
```

---

## **🔧 PASO 2: CONFIGURACIÓN DE VARIABLES DE ENTORNO**

### **Archivo: `.env`**

```bash
# Configuración CORS
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3001,http://localhost:3000,http://127.0.0.1:3001
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE=86400

# URLs del frontend
FRONTEND_URL=http://localhost:3001
FRONTEND_URL_ALT=http://localhost:3000

# Configuración del servidor
HOST=0.0.0.0
PORT=8000
RELOAD=true

# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/smd_vital

# JWT
SECRET_KEY=tu-clave-secreta-muy-segura-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Logging
LOG_LEVEL=INFO
```

---

## **🔧 PASO 3: ENDPOINTS ESPECÍFICOS CON CORS**

### **Health Check Endpoint**

```python
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Health check endpoint - debe ser accesible sin autenticación
    """
    return JSONResponse(
        content={
            "status": "healthy",
            "message": "SMD Vital Backend is running",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat()
        },
        headers={
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": "*"  # Permitir desde cualquier origen para health check
        }
    )

@router.get("/system/info")
async def system_info():
    """
    Información básica del sistema
    """
    return JSONResponse(
        content={
            "name": "SMD VITAL API",
            "version": "1.0.0",
            "environment": os.getenv("ENVIRONMENT", "production"),
            "cors_enabled": True,
            "endpoints": {
                "docs": "/docs",
                "health": "/health",
                "auth": "/auth",
                "appointments": "/appointments"
            }
        }
    )
```

---

## **🔧 PASO 4: AUTENTICACIÓN CON CORS**

### **Auth Endpoints**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

@router.post("/login")
async def login(credentials: UserCredentials):
    """
    Login endpoint con soporte CORS completo
    """
    try:
        # Tu lógica de autenticación aquí
        user = authenticate_user(credentials.email, credentials.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        # Generar token JWT
        access_token = create_access_token(data={"sub": user.email})
        
        return JSONResponse(
            content={
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name
                }
            },
            headers={
                "Access-Control-Allow-Credentials": "true"
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en login: {str(e)}"
        )

@router.get("/verify")
async def verify_token(token: str = Depends(security)):
    """
    Verificar token JWT
    """
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        return JSONResponse(
            content={"valid": True, "email": email},
            headers={"Access-Control-Allow-Credentials": "true"}
        )
    
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
```

---

## **🔧 PASO 5: ENDPOINTS PROTEGIDOS**

### **Appointments Endpoint**

```python
from fastapi import APIRouter, Depends, Query
from typing import Optional, List

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.get("/")
async def get_appointments(
    limit: Optional[int] = Query(50, le=1000),
    offset: Optional[int] = Query(0, ge=0),
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtener citas con paginación y filtros
    """
    try:
        # Tu lógica para obtener citas
        appointments = get_user_appointments(
            user_id=current_user["id"],
            limit=limit,
            offset=offset,
            status=status
        )
        
        return JSONResponse(
            content={
                "appointments": appointments,
                "total": len(appointments),
                "limit": limit,
                "offset": offset
            },
            headers={
                "Access-Control-Allow-Credentials": "true",
                "X-Total-Count": str(len(appointments))
            }
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener citas: {str(e)}"
        )

@router.post("/")
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Crear nueva cita
    """
    try:
        new_appointment = create_user_appointment(
            user_id=current_user["id"],
            appointment_data=appointment_data
        )
        
        return JSONResponse(
            content=new_appointment,
            status_code=201,
            headers={"Access-Control-Allow-Credentials": "true"}
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear cita: {str(e)}"
        )
```

---

## **🔧 PASO 6: CONFIGURACIÓN DE NGINX (SI USAS PROXY)**

### **Archivo: `nginx.conf`**

```nginx
server {
    listen 80;
    server_name localhost;

    # Configuración CORS para el backend
    location /api/ {
        proxy_pass http://backend:8000/;
        
        # Headers CORS
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Credentials true always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH" always;
        add_header Access-Control-Allow-Headers "Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With" always;
        
        # Manejar preflight requests
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin $http_origin;
            add_header Access-Control-Allow-Credentials true;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH";
            add_header Access-Control-Allow-Headers "Accept, Accept-Language, Content-Language, Content-Type, Authorization, X-Requested-With";
            add_header Access-Control-Max-Age 86400;
            return 204;
        }
        
        # Headers de proxy
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## **🔧 PASO 7: DOCKER COMPOSE (SI USAS DOCKER)**

### **Archivo: `docker-compose.yml`**

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=development
      - CORS_ORIGINS=http://localhost:3001,http://localhost:3000
      - DATABASE_URL=postgresql://postgres:password@db:5432/smd_vital
    volumes:
      - ./:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=smd_vital
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## **🔧 PASO 8: TESTING DE CORS**

### **Script de prueba: `test_cors.py`**

```python
import requests
import json

def test_cors_endpoints():
    """
    Probar endpoints con CORS
    """
    base_url = "http://localhost:8000"
    frontend_origin = "http://localhost:3001"
    
    # Headers para simular request del frontend
    headers = {
        "Origin": frontend_origin,
        "Content-Type": "application/json"
    }
    
    print("🧪 Probando CORS...")
    
    # 1. Probar health check
    print("\n1. Health Check:")
    response = requests.get(f"{base_url}/health", headers=headers)
    print(f"   Status: {response.status_code}")
    print(f"   CORS Headers: {response.headers.get('Access-Control-Allow-Origin')}")
    
    # 2. Probar preflight (OPTIONS)
    print("\n2. Preflight Request:")
    response = requests.options(f"{base_url}/appointments", headers=headers)
    print(f"   Status: {response.status_code}")
    print(f"   Allow-Origin: {response.headers.get('Access-Control-Allow-Origin')}")
    print(f"   Allow-Methods: {response.headers.get('Access-Control-Allow-Methods')}")
    
    # 3. Probar login
    print("\n3. Login:")
    login_data = {
        "email": "test@example.com",
        "password": "testpassword"
    }
    response = requests.post(f"{base_url}/auth/login", 
                           headers=headers, 
                           json=login_data)
    print(f"   Status: {response.status_code}")
    print(f"   CORS Headers: {response.headers.get('Access-Control-Allow-Origin')}")

if __name__ == "__main__":
    test_cors_endpoints()
```

---

## **🚀 PASO 9: COMANDOS PARA EJECUTAR**

### **Instalar dependencias:**
```bash
pip install fastapi uvicorn python-jose[cryptography] passlib[bcrypt] python-multipart
```

### **Ejecutar el servidor:**
```bash
# Desarrollo
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Producción
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### **Probar CORS:**
```bash
python test_cors.py
```

---

## **🔍 VERIFICACIÓN FINAL**

### **Checklist de CORS:**

- [ ] ✅ Middleware CORS configurado en FastAPI
- [ ] ✅ Orígenes permitidos incluyen `http://localhost:3001`
- [ ] ✅ `allow_credentials=True` configurado
- [ ] ✅ Métodos HTTP permitidos incluyen OPTIONS
- [ ] ✅ Headers necesarios están permitidos
- [ ] ✅ Preflight requests (OPTIONS) manejados correctamente
- [ ] ✅ Health check accesible sin autenticación
- [ ] ✅ Endpoints protegidos requieren token JWT
- [ ] ✅ No hay headers CORS duplicados
- [ ] ✅ Variables de entorno configuradas

### **URLs de prueba:**
- Health Check: http://localhost:8000/health
- Documentación: http://localhost:8000/docs
- Login: http://localhost:8000/auth/login
- Citas: http://localhost:8000/appointments

---

## **🆘 SOLUCIÓN DE PROBLEMAS COMUNES**

### **Error: "Multiple Access-Control-Allow-Origin"**
- **Causa:** Headers CORS duplicados
- **Solución:** Asegurar que solo el middleware de FastAPI maneje CORS

### **Error: "CORS policy blocks request"**
- **Causa:** Origen no permitido
- **Solución:** Agregar `http://localhost:3001` a `ALLOWED_ORIGINS`

### **Error: "Credentials not allowed"**
- **Causa:** `allow_credentials=False`
- **Solución:** Configurar `allow_credentials=True`

### **Error: "Method OPTIONS not allowed"**
- **Causa:** Preflight requests no manejados
- **Solución:** Agregar middleware para OPTIONS

---

## **📞 CONTACTO Y SOPORTE**

Una vez implementados estos cambios:

1. **Reinicia el servidor backend**
2. **Ejecuta el diagnóstico CORS** en el frontend
3. **Verifica que todos los endpoints respondan correctamente**
4. **Prueba el login y las funcionalidades principales**

El frontend ya está completamente preparado para trabajar con esta configuración CORS. ¡Una vez implementados estos cambios, todos los problemas de CORS deberían estar resueltos! 🎉
