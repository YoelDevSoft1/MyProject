# 🏥 SMD Vital - Backend Microservices

<div align="center">

![SMD Vital Logo](https://img.shields.io/badge/SMD%20Vital-Backend-blue?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-20.10+-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**🏠 Servicios Médicos Domiciliarios de Calidad en Bogotá**

*Plataforma de microservicios robusta, escalable y segura para la gestión integral de servicios médicos domiciliarios*

</div>

---

## 📋 **Resumen Ejecutivo**

SMD Vital Backend es una **arquitectura de microservicios completa** diseñada para revolucionar los servicios médicos domiciliarios en Bogotá. Construida con las mejores prácticas de desarrollo, seguridad y escalabilidad.

### 🎯 **Características Principales**

- ✅ **6 Microservicios** especializados por dominio
- ✅ **Arquitectura escalable** y resiliente
- ✅ **Seguridad HIPAA-ready** para datos médicos
- ✅ **API Gateway** centralizado con autenticación JWT
- ✅ **Base de datos independiente** por servicio
- ✅ **Observabilidad completa** (logs, métricas, tracing)
- ✅ **Documentación OpenAPI** exhaustiva
- ✅ **Deployment con Docker** y Kubernetes-ready

---

## 🏗️ **Arquitectura de Microservicios**

```
┌─────────────────────────────────────────────────────────────────┐
│                    🌐 API Gateway (:8000)                      │
│                   🔐 JWT Auth & Routing                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
┌───▼────┐    ┌──────▼──────┐    ┌─────▼─────┐
│ 🔐 Auth│    │ 👥 Users    │    │ 📅 Appts  │
│  :8001 │    │    :8002    │    │   :8003   │
└────────┘    └─────────────┘    └───────────┘
    │                 │                 │
┌───▼────┐    ┌──────▼──────┐    ┌─────▼─────┐
│🏥 Med  │    │ 💰 Payments │    │ 📧 Notifs │
│Records │    │    :8005    │    │   :8006   │
│  :8004 │    └─────────────┘    └───────────┘
└────────┘
```

### 🎯 **Microservicios Implementados**

| Servicio | Puerto | Responsabilidad | Tecnología |
|----------|--------|-----------------|------------|
| **🔐 Auth Service** | 8001 | Autenticación, JWT, RBAC | FastAPI + PostgreSQL |
| **👥 Users Service** | 8002 | Perfiles, info médica | FastAPI + PostgreSQL |
| **📅 Appointments Service** | 8003 | Citas médicas, scheduling | FastAPI + PostgreSQL |
| **🏥 Medical Records** | 8004 | Historiales, recetas, signos vitales | FastAPI + PostgreSQL |
| **💰 Payments Service** | 8005 | Pagos, facturación, reembolsos | FastAPI + PostgreSQL |
| **📧 Notifications** | 8006 | Email, SMS, WhatsApp, Push | FastAPI + PostgreSQL |

---

## ⚡ **Quick Start**

### 📋 **Prerrequisitos**

- **Docker & Docker Compose** (v20.10+)
- **Python** 3.11+ (para desarrollo local)
- **Node.js** 18+ (para frontend)
- **Git** para clonado del repositorio

### 🚀 **Instalación Rápida**

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/smd-vital-backend.git
cd smd-vital-backend

# 2. Configurar variables de entorno
cp env.example .env
# Editar .env con tus configuraciones

# 3. Levantar toda la infraestructura
docker-compose up --build -d

# 4. Configurar bases de datos y migraciones
python scripts/setup-databases.py

# 5. ¡Listo! Servicios ejecutándose en:
# - API Gateway: http://localhost:8000
# - Swagger Docs: http://localhost:8000/docs
```

### 🔧 **Configuración de Desarrollo**

```bash
# Instalar dependencias de desarrollo
pip install -r requirements-dev.txt

# Ejecutar servicios individualmente
cd services/auth && uvicorn main:app --reload --port 8001
cd services/users && uvicorn main:app --reload --port 8002
# ... etc para cada servicio
```

---

## 📖 **Documentación Completa**

### 🎯 **Enlaces Rápidos**

- 📖 **[Documentación de Arquitectura](./docs/ARCHITECTURE.md)** - Diseño completo del sistema
- 🌉 **[API Gateway](./docs/api/API_GATEWAY.md)** - Enrutamiento y autenticación
- 📋 **[OpenAPI Specification](./docs/api/openapi-spec.yaml)** - Especificación completa de APIs
- 🧪 **[Colección Postman](./docs/api/postman/SMD_Vital_API.json)** - Testing de endpoints
- 🗄️ **[Esquema de Base de Datos](./docs/database/SCHEMA.md)** - Diseño de datos
- 🔐 **[Guías de Seguridad](./docs/security/SECURITY.md)** - Políticas y mejores prácticas

### 📊 **Documentación Interactiva**

Una vez que los servicios estén ejecutándose, accede a:

- **API Gateway Docs**: http://localhost:8000/docs
- **Auth Service**: http://localhost:8001/docs
- **Users Service**: http://localhost:8002/docs
- **Appointments Service**: http://localhost:8003/docs
- **Medical Records**: http://localhost:8004/docs
- **Payments Service**: http://localhost:8005/docs
- **Notifications Service**: http://localhost:8006/docs

---

## 🔐 **Autenticación y Uso**

### 1. **Registro de Usuario**

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@smdvital.com",
    "password": "SecurePass123!",
    "first_name": "Dr. María",
    "last_name": "González",
    "phone": "+573001234567",
    "role": "doctor"
  }'
```

### 2. **Iniciar Sesión**

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@smdvital.com",
    "password": "SecurePass123!"
  }'
```

### 3. **Usar Token JWT**

```bash
# Copiar access_token de la respuesta anterior
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Usar en todas las requests autenticadas
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 **Casos de Uso Principales**

### 👨‍⚕️ **Flujo del Doctor**

```bash
# 1. Crear registro médico después de consulta
curl -X POST http://localhost:8000/api/medical-records \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "patient-uuid",
    "appointment_id": "appointment-uuid",
    "chief_complaint": "Dolor abdominal intenso",
    "assessment": "Gastritis aguda",
    "plan": "Omeprazol 20mg cada 12 horas"
  }'

# 2. Crear receta médica
curl -X POST http://localhost:8000/api/prescriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "patient-uuid",
    "medication_name": "Omeprazol",
    "dosage": "20mg",
    "frequency": "Cada 12 horas",
    "duration": "7 días"
  }'
```

### 👤 **Flujo del Paciente**

```bash
# 1. Crear cita médica
curl -X POST http://localhost:8000/api/appointments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_type": "consulta_general",
    "scheduled_date": "2024-01-15T10:00:00Z",
    "address": "Carrera 15 # 93-01, Bogotá",
    "notes": "Dolor abdominal persistente"
  }'

# 2. Procesar pago
curl -X POST http://localhost:8000/api/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "patient-uuid",
    "amount": 150000.00,
    "currency": "COP",
    "description": "Consulta médica domiciliaria"
  }'
```

---

## 🛠️ **Stack Tecnológico**

### **Backend Framework**
- **FastAPI** - Framework web moderno y rápido para Python
- **Uvicorn** - Servidor ASGI de alto rendimiento
- **Pydantic** - Validación de datos y serialización

### **Base de Datos**
- **PostgreSQL 15** - Base de datos relacional principal
- **SQLAlchemy** - ORM Python avanzado
- **Alembic** - Migraciones de base de datos

### **Infraestructura**
- **Redis** - Cache y storage de sesiones
- **RabbitMQ** - Message broker para comunicación asíncrona
- **Docker & Docker Compose** - Containerización

### **Seguridad**
- **JWT** - JSON Web Tokens para autenticación
- **bcrypt** - Hashing seguro de contraseñas
- **RBAC** - Control de acceso basado en roles

### **Observabilidad**
- **Prometheus** - Métricas y monitoreo
- **Grafana** - Dashboards y visualización
- **Jaeger** - Distributed tracing
- **ELK Stack** - Logs centralizados

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
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### **Métricas Disponibles**

- 📈 **Performance**: Latencia, throughput, errores
- 📊 **Business**: Citas creadas, pagos procesados, usuarios activos
- 🔧 **Infrastructure**: CPU, memoria, disk I/O
- 🔐 **Security**: Intentos de login, tokens expirados

---

## 🧪 **Testing**

### **Ejecutar Tests**

```bash
# Tests unitarios
pytest tests/unit/

# Tests de integración
pytest tests/integration/

# Tests end-to-end
pytest tests/e2e/

# Coverage report
pytest --cov=services --cov-report=html
```

### **Testing con Postman**

1. **Importar colección**: `docs/api/postman/SMD_Vital_API.json`
2. **Configurar variables de entorno**:
   - `baseUrl`: http://localhost:8000
   - `authToken`: (se configura automáticamente después del login)
3. **Ejecutar tests automatizados**

---

## 🚀 **Deployment**

### **Desarrollo Local**

```bash
# Levantar todos los servicios
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f

# Parar servicios
docker-compose down
```

### **Producción con Kubernetes**

```bash
# Aplicar manifiestos
kubectl apply -f k8s/

# Verificar deployment
kubectl get pods -n smd-vital

# Acceder a servicios
kubectl port-forward svc/api-gateway 8000:80
```

### **CI/CD con GitHub Actions**

El proyecto incluye workflows automatizados para:
- ✅ **Testing** automático en cada PR
- ✅ **Security scanning** de dependencias
- ✅ **Docker build** y push a registry
- ✅ **Deployment** automático a staging/production

---

## 🔐 **Seguridad**

### **Características de Seguridad**

- ✅ **HTTPS/TLS 1.3** en todas las comunicaciones
- ✅ **JWT tokens** con expiración y refresh automático
- ✅ **Password hashing** con bcrypt y salt
- ✅ **Input validation** con Pydantic
- ✅ **SQL injection** protection
- ✅ **CORS** configurado correctamente
- ✅ **Rate limiting** por IP y usuario
- ✅ **Security headers** (HSTS, CSP, etc.)

### **Compliance**

- 🏥 **HIPAA-ready** - Cumple estándares para datos médicos
- 🔒 **GDPR-compliant** - Protección de datos personales
- 📋 **SOC 2** ready - Controles de seguridad enterprise
- 🛡️ **PCI DSS** considerations - Para procesamiento de pagos

---

## 📈 **Roadmap**

### **Fase 1: Core MVP (✅ COMPLETADO)**
- ✅ 6 microservicios funcionando
- ✅ Authentication con JWT
- ✅ Base de datos y migraciones
- ✅ Dockerización completa
- ✅ Documentación API

### **Fase 2: Production Ready (🔄 EN PROGRESO)**
- 🔄 Kubernetes deployment
- 🔄 SSL/TLS certificates
- 🔄 Load balancing con Nginx
- 🔄 Monitoring con Prometheus/Grafana
- 🔄 CI/CD pipelines

### **Fase 3: Advanced Features (📋 PLANEADO)**
- 📋 Real-time notifications con WebSockets
- 📋 Event sourcing y CQRS
- 📋 GraphQL API layer
- 📋 Advanced analytics y reporting
- 📋 Mobile API optimizations

### **Fase 4: AI & Innovation (🔮 FUTURO)**
- 🔮 ML para predicción de demanda
- 🔮 Chatbot para atención al cliente
- 🔮 IoT integration (dispositivos médicos)
- 🔮 Telemedicine video calls
- 🔮 Blockchain para auditoría

---

## 🤝 **Contribución**

### **Cómo Contribuir**

1. **Fork** el repositorio
2. **Crear branch** para tu feature: `git checkout -b feature/amazing-feature`
3. **Commit** tus cambios: `git commit -m 'Add amazing feature'`
4. **Push** al branch: `git push origin feature/amazing-feature`
5. **Crear Pull Request**

### **Estándares de Código**

- ✅ **PEP 8** para estilo de Python
- ✅ **Type hints** en todas las funciones
- ✅ **Docstrings** para documentación
- ✅ **Tests** para nuevas funcionalidades
- ✅ **Security review** para cambios sensibles

---

## 📞 **Contacto y Soporte**

### **Equipo de Desarrollo**

- **Backend Lead**: [Tu Nombre] - backend@smdvital.com
- **DevOps Engineer**: [Nombre] - devops@smdvital.com
- **Security Engineer**: [Nombre] - security@smdvital.com

### **Enlaces Útiles**

- 🌐 **Website**: https://smdvitalbogota.com
- 📧 **Email**: dev@smdvitalbogota.com
- 📱 **WhatsApp**: +57 300 123 4567
- 🐛 **Issues**: [GitHub Issues](https://github.com/tu-usuario/smd-vital-backend/issues)

---

## 📄 **Licencia**

Este proyecto está licenciado bajo la **MIT License** - ver el archivo [LICENSE](LICENSE) para detalles.

---

## 🙏 **Agradecimientos**

- **FastAPI Team** - Por el excelente framework
- **PostgreSQL Community** - Por la robusta base de datos
- **Docker Team** - Por simplificar el deployment
- **Open Source Community** - Por las increíbles herramientas

---

<div align="center">

**🏥 Construido con ❤️ para SMD Vital Bogotá**

*Revolucionando los servicios médicos domiciliarios con tecnología de vanguardia*

[![Made with FastAPI](https://img.shields.io/badge/Made%20with-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Powered by PostgreSQL](https://img.shields.io/badge/Powered%20by-PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org/)
[![Deployed with Docker](https://img.shields.io/badge/Deployed%20with-Docker-2496ED?style=for-the-badge&logo=docker)](https://docker.com/)

</div>