# 🏗️ Arquitectura de Microservicios - SMD Vital

## 📋 **Resumen Ejecutivo**

SMD Vital Backend es una plataforma de microservicios robusta y escalable diseñada para gestionar servicios médicos domiciliarios. La arquitectura está construida sobre principios de alta disponibilidad, seguridad y mantenibilidad.

---

## 🎯 **Objetivos de Arquitectura**

- ✅ **Escalabilidad**: Capacidad de crecer horizontal y verticalmente
- ✅ **Resiliencia**: Tolerancia a fallos y recuperación automática
- ✅ **Seguridad**: Protección de datos médicos sensibles (HIPAA-ready)
- ✅ **Mantenibilidad**: Código limpio y modular
- ✅ **Observabilidad**: Monitoreo, logs y métricas completas
- ✅ **Rapidez de desarrollo**: CI/CD y despliegues automatizados

---

## 🏗️ **Diagrama de Arquitectura**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              🌐 Internet / Users                                │
└─────────────────────────────┬───────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────────────────┐
│                         🔒 Nginx / SSL Termination                             │
│                         📊 Rate Limiting & CORS                                │
└─────────────────────────────┬───────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────────────────┐
│                          🌉 API Gateway (:8000)                                │
│                      🔐 JWT Validation & Routing                               │
└─────────────────────────────┬───────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
         ┌──────────▼──────────┐   ┌────▼────────────────────────┐
         │   🎯 Frontend       │   │   📱 Mobile Apps            │
         │   React SPA         │   │   iOS / Android             │
         │   :5173             │   │                             │
         └──────────┬──────────┘   └────┬────────────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────────────────┐
│                        🏗️ Microservices Layer                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ 🔐 Auth     │  │ 👥 Users    │  │ 📅 Appts    │  │ 🏥 Medical  │              │
│  │ Service     │  │ Service     │  │ Service     │  │ Records     │              │
│  │ :8001       │  │ :8002       │  │ :8003       │  │ :8004       │              │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐                                              │
│  │ 💰 Payments │  │ 📧 Notifs   │                                              │
│  │ Service     │  │ Service     │                                              │
│  │ :8005       │  │ :8006       │                                              │
│  └─────────────┘  └─────────────┘                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────────────────┐
│                        🗄️ Data & Infrastructure Layer                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ 🐘 Auth DB  │  │ 🐘 Users DB │  │ 🐘 Appts DB │  │ 🐘 Medical  │              │
│  │ PostgreSQL  │  │ PostgreSQL  │  │ PostgreSQL  │  │ Records DB  │              │
│  │ :5432       │  │ :5433       │  │ :5434       │  │ :5435       │              │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ 🐘 Payments │  │ 🐘 Notifs   │  │ 🔴 Redis    │  │ 🐰 RabbitMQ │              │
│  │ DB          │  │ DB          │  │ Cache       │  │ Message     │              │
│  │ :5436       │  │ :5437       │  │ :6379       │  │ Broker      │              │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────────────────┐
│                      📊 Observability & Monitoring                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ 📈 Prometheus│  │ 📊 Grafana  │  │ 🔍 Jaeger   │  │ 📋 ELK      │              │
│  │ Metrics     │  │ Dashboards  │  │ Tracing     │  │ Logs        │              │
│  │ :9090       │  │ :3000       │  │ :16686      │  │ :5601       │              │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 **Patrones de Arquitectura Implementados**

### 1. **🏗️ Microservices Pattern**
- **Separación por dominio de negocio**
- **Independencia de despliegue**
- **Escalabilidad granular**
- **Tecnologías heterogéneas**

### 2. **🌉 API Gateway Pattern**
- **Punto de entrada único**
- **Enrutamiento inteligente**
- **Autenticación centralizada**
- **Rate limiting y CORS**

### 3. **🗄️ Database per Service**
- **Una base de datos por microservicio**
- **Aislamiento de datos**
- **Consistencia eventual**
- **Transacciones distribuidas con SAGA**

### 4. **🔐 JWT Authentication**
- **Stateless authentication**
- **Token-based security**
- **Role-based access control (RBAC)**
- **Refresh token rotation**

### 5. **📨 Event-Driven Architecture**
- **Message queues con RabbitMQ**
- **Pub/Sub patterns**
- **Async communication**
- **Event sourcing ready**

### 6. **📊 CQRS (Command Query Responsibility Segregation)**
- **Separación de escritura y lectura**
- **Optimización de queries**
- **Escalabilidad de lecturas**
- **Materialised views**

---

## 🎯 **Microservicios Detallados**

### 1. **🔐 Authentication Service (Puerto 8001)**

**Responsabilidades:**
- ✅ Registro y login de usuarios
- ✅ Generación y validación de JWT tokens
- ✅ Gestión de roles y permisos (RBAC)
- ✅ Two-factor authentication (2FA)
- ✅ Password policies y security

**Tecnologías:**
- **Framework**: FastAPI + Uvicorn
- **Database**: PostgreSQL (smdvital_auth)
- **Authentication**: JWT + bcrypt
- **ORM**: SQLAlchemy + Alembic

**Endpoints Principales:**
```
POST /register     # Registro de usuarios
POST /login        # Inicio de sesión
POST /refresh      # Renovar tokens
GET  /me           # Usuario actual
POST /logout       # Cerrar sesión
```

### 2. **👥 Users Service (Puerto 8002)**

**Responsabilidades:**
- ✅ Gestión de perfiles de usuario
- ✅ Información médica de pacientes
- ✅ Contactos de emergencia
- ✅ Historial de actividad
- ✅ Configuraciones personales

**Tecnologías:**
- **Framework**: FastAPI + Uvicorn
- **Database**: PostgreSQL (smdvital_users)
- **Storage**: S3-compatible para avatares
- **ORM**: SQLAlchemy + Alembic

**Endpoints Principales:**
```
GET  /profile         # Perfil de usuario
PUT  /profile         # Actualizar perfil
GET  /medical-info    # Info médica
PUT  /medical-info    # Actualizar info médica
```

### 3. **📅 Appointments Service (Puerto 8003)**

**Responsabilidades:**
- ✅ Programación de citas médicas
- ✅ Gestión de disponibilidad
- ✅ Asignación de profesionales
- ✅ Estados de citas (pending, confirmed, etc.)
- ✅ Calendario y scheduling

**Tecnologías:**
- **Framework**: FastAPI + Uvicorn
- **Database**: PostgreSQL (smdvital_appointments)
- **Background Tasks**: Celery + Redis
- **ORM**: SQLAlchemy + Alembic

**Endpoints Principales:**
```
POST /appointments     # Crear cita
GET  /appointments     # Listar citas
PUT  /appointments/:id # Actualizar cita
DEL  /appointments/:id # Cancelar cita
```

### 4. **🏥 Medical Records Service (Puerto 8004)**

**Responsabilidades:**
- ✅ Historiales médicos completos
- ✅ Registros de consultas
- ✅ Prescripciones médicas
- ✅ Resultados de laboratorio
- ✅ Imágenes médicas y estudios
- ✅ Signos vitales

**Tecnologías:**
- **Framework**: FastAPI + Uvicorn
- **Database**: PostgreSQL (smdvital_medical_records)
- **File Storage**: S3 para imágenes médicas
- **Encryption**: Campos sensibles encriptados
- **ORM**: SQLAlchemy + Alembic

**Endpoints Principales:**
```
POST /medical-records    # Crear registro médico
GET  /medical-records    # Obtener registros
POST /prescriptions      # Crear receta
POST /vital-signs        # Registrar signos vitales
```

### 5. **💰 Payments Service (Puerto 8005)**

**Responsabilidades:**
- ✅ Procesamiento de pagos
- ✅ Integración con gateways (Stripe, PayU)
- ✅ Generación de facturas
- ✅ Gestión de métodos de pago
- ✅ Reembolsos y conciliación
- ✅ Reportes financieros

**Tecnologías:**
- **Framework**: FastAPI + Uvicorn
- **Database**: PostgreSQL (smdvital_payments)
- **Payment Gateways**: Stripe, PayU, PSE
- **Encryption**: PCI DSS compliance
- **ORM**: SQLAlchemy + Alembic

**Endpoints Principales:**
```
POST /payments           # Procesar pago
POST /invoices           # Crear factura
GET  /payment-methods    # Métodos de pago
POST /refunds            # Solicitar reembolso
```

### 6. **📧 Notifications Service (Puerto 8006)**

**Responsabilidades:**
- ✅ Notificaciones multi-canal
- ✅ Templates personalizables
- ✅ Email, SMS, WhatsApp, Push
- ✅ Preferencias de usuario
- ✅ Scheduled notifications
- ✅ Analytics y métricas

**Tecnologías:**
- **Framework**: FastAPI + Uvicorn
- **Database**: PostgreSQL (smdvital_notifications)
- **Email**: SendGrid / Amazon SES
- **SMS**: Twilio / AWS SNS
- **WhatsApp**: WhatsApp Business API
- **Push**: Firebase Cloud Messaging
- **Queue**: RabbitMQ para async processing

**Endpoints Principales:**
```
POST /notifications           # Crear notificación
POST /send-template          # Enviar con template
GET  /preferences            # Preferencias de usuario
GET  /stats                  # Estadísticas
```

---

## 🗄️ **Arquitectura de Datos**

### **Database Design Pattern: Database per Service**

Cada microservicio tiene su propia base de datos PostgreSQL para garantizar:
- **Isolación de datos**
- **Independencia tecnológica**
- **Escalabilidad granular**
- **Resiliencia ante fallos**

### **Bases de Datos:**

| Servicio | Base de Datos | Puerto | Tablas Principales |
|----------|---------------|--------|--------------------|
| Auth | `smdvital_auth` | 5432 | users, roles, permissions, user_roles |
| Users | `smdvital_users` | 5433 | user_profiles, medical_info, emergency_contacts |
| Appointments | `smdvital_appointments` | 5434 | appointments, schedules, availability |
| Medical Records | `smdvital_medical_records` | 5435 | medical_records, prescriptions, vital_signs, lab_results |
| Payments | `smdvital_payments` | 5436 | payments, invoices, payment_methods, transactions |
| Notifications | `smdvital_notifications` | 5437 | notifications, templates, user_preferences, logs |

### **Shared Infrastructure:**

| Componente | Propósito | Puerto |
|------------|-----------|--------|
| **Redis** | Cache + Sessions + Rate Limiting | 6379 |
| **RabbitMQ** | Message Queue + Pub/Sub | 5672 |

---

## 🔐 **Seguridad**

### **Authentication & Authorization:**
- ✅ **JWT tokens** con algoritmo HS256
- ✅ **Role-based Access Control (RBAC)**
- ✅ **Token expiration** y refresh automático
- ✅ **Password hashing** con bcrypt
- ✅ **Two-factor authentication (2FA)**

### **Data Protection:**
- ✅ **Encryption at rest** para datos sensibles
- ✅ **TLS 1.3** para communications
- ✅ **Input validation** con Pydantic
- ✅ **SQL injection** protection
- ✅ **GDPR compliance** ready

### **Infrastructure Security:**
- ✅ **Network isolation** con Docker networks
- ✅ **Secret management** con environment variables
- ✅ **Rate limiting** por IP y usuario
- ✅ **CORS** configurado
- ✅ **Security headers** (HSTS, CSP, etc.)

---

## 📊 **Observabilidad**

### **Logging:**
- ✅ **Structured JSON logs**
- ✅ **Centralized con ELK Stack**
- ✅ **Request tracing** con correlation IDs
- ✅ **Error tracking** con stack traces
- ✅ **Audit logs** para compliance

### **Metrics:**
- ✅ **Prometheus** para métricas
- ✅ **Grafana** dashboards
- ✅ **Business metrics** (citas, pagos, etc.)
- ✅ **Infrastructure metrics** (CPU, memoria, etc.)
- ✅ **SLA monitoring** (uptime, latency)

### **Tracing:**
- ✅ **Distributed tracing** con Jaeger
- ✅ **Request flow** visualization
- ✅ **Performance bottlenecks** identification
- ✅ **Cross-service** dependencies

---

## 🚀 **Escalabilidad**

### **Horizontal Scaling:**
- ✅ **Stateless services** ready for load balancing
- ✅ **Database read replicas**
- ✅ **Container orchestration** con Kubernetes
- ✅ **Auto-scaling** basado en métricas

### **Vertical Scaling:**
- ✅ **Resource optimization** por servicio
- ✅ **Memory profiling** y optimization
- ✅ **Database indexing** strategy
- ✅ **Query optimization**

### **Caching Strategy:**
- ✅ **Redis** para session storage
- ✅ **Application-level** caching
- ✅ **Database query** caching
- ✅ **CDN** para assets estáticos

---

## 🔄 **Resilience Patterns**

### **Circuit Breaker:**
- ✅ **Automatic failover** entre servicios
- ✅ **Graceful degradation**
- ✅ **Health checks** automáticos
- ✅ **Recovery mechanisms**

### **Retry & Timeout:**
- ✅ **Exponential backoff**
- ✅ **Max retry limits**
- ✅ **Timeout configurations**
- ✅ **Dead letter queues**

### **Data Consistency:**
- ✅ **SAGA pattern** para transacciones distribuidas
- ✅ **Event sourcing** ready
- ✅ **Compensating transactions**
- ✅ **Eventual consistency** strategy

---

## 📦 **Deployment & DevOps**

### **Containerization:**
- ✅ **Docker** para todos los servicios
- ✅ **Multi-stage builds** optimization
- ✅ **Security scanning** de imágenes
- ✅ **Registry** privado ready

### **Orchestration:**
- ✅ **Docker Compose** para desarrollo
- ✅ **Kubernetes** ready para producción
- ✅ **Helm charts** para deployments
- ✅ **Service mesh** (Istio) ready

### **CI/CD:**
- ✅ **GitHub Actions** workflows
- ✅ **Automated testing** pipeline
- ✅ **Security scanning**
- ✅ **Blue-green deployments**

---

## 🎯 **Roadmap Técnico**

### **Fase 1: Core Services (✅ COMPLETADO)**
- ✅ Implementación de 6 microservicios
- ✅ Base de datos y migraciones
- ✅ Authentication con JWT
- ✅ API Gateway básico

### **Fase 2: Production Ready (🔄 EN PROGRESO)**
- 🔄 Kubernetes deployment
- 🔄 SSL/TLS certificates
- 🔄 Production monitoring
- 🔄 Load testing

### **Fase 3: Advanced Features (📋 PLANEADO)**
- 📋 Event sourcing implementation
- 📋 CQRS pattern
- 📋 GraphQL API layer
- 📋 Real-time features con WebSockets

### **Fase 4: AI & Analytics (🔮 FUTURO)**
- 🔮 ML para predicción de citas
- 🔮 Analytics avanzados
- 🔮 Chatbot integration
- 🔮 IoT device integration

---

## 🔗 **Enlaces de Documentación**

- 📖 **[OpenAPI Specification](./api/openapi-spec.yaml)**
- 🌉 **[API Gateway Documentation](./api/API_GATEWAY.md)**
- 🧪 **[Postman Collection](./api/postman/SMD_Vital_API.json)**
- 🗄️ **[Database Schema](./database/SCHEMA.md)**
- 🔐 **[Security Guidelines](./security/SECURITY.md)**
- 📊 **[Monitoring Setup](./monitoring/SETUP.md)**

---

**🏥 SMD Vital Backend Team**  
*Construyendo el futuro de los servicios médicos domiciliarios*

---

> **Nota**: Esta arquitectura está diseñada para ser **HIPAA-compliant** y seguir las mejores prácticas de seguridad para aplicaciones médicas. Todos los componentes pueden ser auditados y cumplen con regulaciones de protección de datos médicos.
