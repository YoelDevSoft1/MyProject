# 🌐 API Gateway - SMD Vital Backend

## 📋 **Resumen Ejecutivo**

El API Gateway de SMD Vital actúa como punto de entrada único para todos los microservicios, proporcionando:

- ✅ **Enrutamiento inteligente** hacia microservicios
- ✅ **Autenticación centralizada** con JWT
- ✅ **Rate limiting** y protección DDoS
- ✅ **Load balancing** automático
- ✅ **Monitoreo y logging** centralizado
- ✅ **CORS y seguridad** configurada

---

## 🏗️ **Arquitectura del API Gateway**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Mobile App    │    │  Third-party    │
│   React App     │    │   (iOS/Android) │    │  Integrations   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼───────────────┐
                    │        API Gateway          │
                    │      (Nginx/Traefik)       │
                    │    http://localhost:8000    │
                    └─────────────┬───────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
    ┌─────▼─────┐         ┌─────▼─────┐         ┌─────▼─────┐
    │   Auth    │         │   Users   │         │   Apps    │
    │  Service  │         │  Service  │         │  Service  │
    │   :8001   │         │   :8002   │         │   :8003   │
    └───────────┘         └───────────┘         └───────────┘
          │                      │                      │
    ┌─────▼─────┐         ┌─────▼─────┐         ┌─────▼─────┐
    │  Medical  │         │ Payments  │         │   Notif   │
    │  Records  │         │  Service  │         │  Service  │
    │   :8004   │         │   :8005   │         │   :8006   │
    └───────────┘         └───────────┘         └───────────┘
```

---

## 🛣️ **Rutas del API Gateway**

### **Puerto Base: `http://localhost:8000`**

| Ruta Base | Servicio Destino | Puerto | Descripción |
|-----------|-----------------|--------|-------------|
| `/api/auth/**` | Auth Service | 8001 | Autenticación y autorización |
| `/api/users/**` | Users Service | 8002 | Gestión de usuarios y perfiles |
| `/api/appointments/**` | Appointments Service | 8003 | Citas médicas |
| `/api/medical-records/**` | Medical Records Service | 8004 | Historiales médicos |
| `/api/payments/**` | Payments Service | 8005 | Pagos y facturación |
| `/api/notifications/**` | Notifications Service | 8006 | Notificaciones multi-canal |

---

## 🔐 **Autenticación y Seguridad**

### **Headers Requeridos**

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
X-API-Version: v1
```

### **Rutas Públicas (Sin autenticación)**

```
POST /api/auth/register     # Registro de usuarios
POST /api/auth/login        # Inicio de sesión
GET  /api/auth/health       # Health check
GET  /api/*/docs            # Documentación Swagger
GET  /api/*/health          # Health checks de servicios
```

### **Rutas Protegidas (Requieren JWT)**

- ✅ **Todas las demás rutas requieren token JWT válido**
- ✅ **El API Gateway valida tokens antes de reenviar**
- ✅ **Inyecta información del usuario en headers internos**

---

## 🚀 **Ejemplos de Uso**

### **1. Autenticación - Registro**

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@example.com",
    "password": "MiPassword123!",
    "first_name": "Juan",
    "last_name": "Pérez",
    "phone": "+573001234567",
    "role": "patient"
  }'
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "juan.perez@example.com",
  "role": "patient"
}
```

### **2. Autenticación - Login**

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@example.com",
    "password": "MiPassword123!"
  }'
```

### **3. Crear Cita Médica**

```bash
curl -X POST http://localhost:8000/api/appointments \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "service_type": "consulta_general",
    "scheduled_date": "2024-01-15T10:00:00Z",
    "address": "Carrera 15 # 93-01, Bogotá",
    "notes": "Dolor abdominal persistente",
    "emergency": false
  }'
```

### **4. Procesar Pago**

```bash
curl -X POST http://localhost:8000/api/payments \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 150000.00,
    "currency": "COP",
    "description": "Consulta médica domiciliaria",
    "payment_method_id": "payment-method-id"
  }'
```

### **5. Enviar Notificación**

```bash
curl -X POST http://localhost:8000/api/notifications/send-template \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "template_name": "appointment_confirmation",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "channels": ["email", "sms", "whatsapp"],
    "template_data": {
      "patient_name": "Juan Pérez",
      "appointment_date": "15 de Enero, 2024",
      "appointment_time": "10:00 AM",
      "doctor_name": "Dr. María González",
      "specialty": "Medicina General",
      "location": "Carrera 15 # 93-01, Bogotá"
    }
  }'
```

---

## 📊 **Monitoreo y Health Checks**

### **Health Check General**

```bash
curl http://localhost:8000/health
```

**Respuesta:**
```json
{
  "status": "healthy",
  "services": {
    "auth": "healthy",
    "users": "healthy", 
    "appointments": "healthy",
    "medical-records": "healthy",
    "payments": "healthy",
    "notifications": "healthy"
  },
  "timestamp": "2024-01-15T10:00:00Z",
  "uptime": "2h 30m 15s"
}
```

### **Health Check por Servicio**

```bash
curl http://localhost:8000/api/auth/health
curl http://localhost:8000/api/users/health
curl http://localhost:8000/api/appointments/health
curl http://localhost:8000/api/medical-records/health
curl http://localhost:8000/api/payments/health
curl http://localhost:8000/api/notifications/health
```

---

## ⚡ **Rate Limiting**

### **Límites por Endpoint**

| Endpoint Type | Límite | Ventana | Descripción |
|---------------|--------|---------|-------------|
| **Auth** | 10 req/min | 1 minuto | Login/Register |
| **General** | 100 req/min | 1 minuto | APIs generales |
| **Pagos** | 20 req/min | 1 minuto | Transacciones |
| **Notificaciones** | 50 req/min | 1 minuto | Envío de notificaciones |

### **Headers de Rate Limiting**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642258800
X-RateLimit-Window: 60
```

---

## 🔧 **Configuración**

### **Variables de Entorno**

```bash
# API Gateway
GATEWAY_PORT=8000
GATEWAY_HOST=0.0.0.0

# Servicios Backend
AUTH_SERVICE_URL=http://localhost:8001
USERS_SERVICE_URL=http://localhost:8002
APPOINTMENTS_SERVICE_URL=http://localhost:8003
MEDICAL_RECORDS_SERVICE_URL=http://localhost:8004
PAYMENTS_SERVICE_URL=http://localhost:8005
NOTIFICATIONS_SERVICE_URL=http://localhost:8006

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_DEFAULT=100
RATE_LIMIT_WINDOW=60

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=*

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

---

## 🐳 **Docker Compose**

```yaml
# API Gateway Service
api-gateway:
  image: nginx:alpine
  ports:
    - "8000:80"
  volumes:
    - ./gateway/nginx.conf:/etc/nginx/nginx.conf
    - ./gateway/conf.d:/etc/nginx/conf.d
  depends_on:
    - auth-service
    - users-service
    - appointments-service
    - medical-records-service
    - payments-service
    - notifications-service
  networks:
    - smd-network
  environment:
    - NGINX_HOST=localhost
    - NGINX_PORT=80
```

---

## 📈 **Métricas y Logging**

### **Métricas Disponibles**

- 📊 **Requests por segundo (RPS)**
- 📊 **Latencia promedio por endpoint**
- 📊 **Códigos de estado HTTP**
- 📊 **Errores por servicio**
- 📊 **Uso de rate limiting**
- 📊 **Throughput por usuario**

### **Logs Estructurados**

```json
{
  "timestamp": "2024-01-15T10:00:00Z",
  "level": "INFO",
  "service": "api-gateway",
  "method": "POST",
  "path": "/api/appointments",
  "status_code": 201,
  "response_time": 145,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "request_id": "req-abc123",
  "upstream_service": "appointments-service",
  "upstream_response_time": 89
}
```

---

## 🔗 **Enlaces Útiles**

- 📖 **[Documentación OpenAPI Completa](./openapi-spec.yaml)**
- 🧪 **[Colección de Postman](./postman/SMD_Vital_API.json)**
- 📊 **[Dashboard de Métricas](http://localhost:3000/d/smd-vital)**
- 📋 **[Logs Centralizados](http://localhost:5601)**
- 🏥 **[Frontend React](http://localhost:5173)**

---

## 🎯 **Próximos Pasos**

1. ✅ **Implementar API Gateway con Nginx/Traefik**
2. ✅ **Configurar SSL/TLS para HTTPS**
3. ✅ **Integrar con Kong/Ambassador para features avanzadas**
4. ✅ **Implementar circuit breakers**
5. ✅ **Configurar métricas con Prometheus**
6. ✅ **Integrar tracing distribuido con Jaeger**

---

**🏥 SMD Vital Backend Team**  
*Servicios médicos domiciliarios de calidad en Bogotá*
