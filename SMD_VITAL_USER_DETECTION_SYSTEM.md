# SMD VITAL - Sistema de Detección Inteligente de Usuarios

## 📋 Resumen Ejecutivo

El **Sistema de Detección Inteligente de Usuarios** de SMD VITAL es una solución avanzada que identifica automáticamente el tipo de usuario (doctor, enfermero, administrador, paciente, etc.) durante el proceso de login y redirige a la interfaz más apropiada para cada rol.

## 🎯 Objetivos del Sistema

- **Detección Automática**: Identificar el tipo de usuario sin intervención manual
- **Redirección Inteligente**: Dirigir a cada usuario a su interfaz optimizada
- **Experiencia Personalizada**: Adaptar la interfaz según el rol y especialidad
- **Escalabilidad**: Fácil adición de nuevos tipos de usuario
- **Confiabilidad**: Sistema robusto con fallbacks y validaciones

## 🏗️ Arquitectura del Sistema

### Backend (Python/FastAPI)

```
smd-vital-backend/services/auth/
├── user_detection_service.py    # Servicio principal de detección
├── main.py                      # Endpoints de autenticación actualizados
└── database_auth.py            # Base de datos de usuarios
```

### Frontend (React/Chakra UI)

```
horizon-ui-chakra-main/src/
├── services/
│   └── userDetectionService.js  # Servicio de detección frontend
├── components/
│   ├── IntelligentRedirect.js   # Componente de redirección
│   └── UserDetectionDashboard.js # Dashboard personalizado
├── contexts/
│   └── AuthContext.js           # Contexto actualizado
└── views/auth/signIn/
    └── index.jsx                # Login actualizado
```

## 🔍 Tipos de Usuario Soportados

| Tipo | Descripción | Criterios de Detección | Interfaz |
|------|-------------|------------------------|----------|
| **Doctor** | Médicos y especialistas | Email hospital, especialidad, título "Dr." | Panel médico especializado |
| **Enfermero** | Personal de enfermería | Email hospital, especialidad enfermería | Panel de cuidados |
| **Administrador** | Gestión del sistema | Email admin, rol explícito | Panel administrativo |
| **Recepcionista** | Atención al paciente | Email recepción, rol específico | Panel de citas |
| **Técnico** | Personal técnico médico | Especialidad laboratorio/radiología | Panel técnico |
| **Farmacéutico** | Gestión de medicamentos | Especialidad farmacología | Panel de farmacia |
| **Paciente** | Usuarios finales | Por defecto, email personal | Panel de salud personal |

## 🧠 Algoritmo de Detección

### Criterios de Detección (en orden de prioridad)

1. **Rol Explícito** (40% confianza)
   - Campo `role` en la base de datos
   - Mayor peso en la decisión final

2. **Análisis de Email** (30% confianza)
   - Patrones: `@hospital.com`, `@clinica.com`, `@medical.com`
   - Dominios específicos por tipo de usuario

3. **Especialidad Médica** (20% confianza)
   - Palabras clave: "Cardiología", "Enfermería", "Laboratorio"
   - Mapeo directo a tipos de usuario

4. **Nombre de Usuario** (10% confianza)
   - Patrones: `dr.`, `nurse`, `admin`, `recepcion`
   - Títulos profesionales en username

5. **Análisis de Nombres** (10% confianza)
   - Títulos: "Dr.", "Dra.", "Enfermero", "Enfermera"
   - Detección en first_name y last_name

### Cálculo de Confianza

```python
confidence = (
    role_confidence * 0.4 +
    email_confidence * 0.3 +
    specialty_confidence * 0.2 +
    username_confidence * 0.1 +
    name_confidence * 0.1
)
```

## 🚀 Flujo de Funcionamiento

### 1. Proceso de Login

```mermaid
graph TD
    A[Usuario inicia sesión] --> B[Autenticación exitosa]
    B --> C[Obtener datos del usuario]
    C --> D[Ejecutar detección inteligente]
    D --> E{Confianza >= 50%?}
    E -->|Sí| F[Redirección automática]
    E -->|No| G[Mostrar opciones manuales]
    F --> H[Dashboard personalizado]
    G --> I[Usuario selecciona tipo]
    I --> H
```

### 2. Detección Inteligente

```mermaid
graph TD
    A[Datos del usuario] --> B[Verificar rol explícito]
    B --> C[Analizar patrón de email]
    C --> D[Revisar especialidad]
    D --> E[Examinar username]
    E --> F[Analizar nombres]
    F --> G[Calcular confianza total]
    G --> H[Determinar tipo de usuario]
    H --> I[Generar configuración personalizada]
```

## 📊 Configuración de Dashboards

### Doctor
- **Color**: Azul médico (#2D5A87)
- **Widgets**: Citas del día, Lista de pacientes, Expedientes médicos
- **Especialidades**: Cardiología (rojo), Pediatría (naranja), Neurología (púrpura)

### Enfermero
- **Color**: Azul enfermería (#4A90E2)
- **Widgets**: Citas del día, Signos vitales, Asignaciones médicas
- **Funciones**: Asistencia a doctores, Monitoreo de pacientes

### Administrador
- **Color**: Rojo administrativo (#E74C3C)
- **Widgets**: Estadísticas del sistema, Gestión de usuarios, Reportes
- **Funciones**: Control total del sistema

### Paciente
- **Color**: Verde salud (#27AE60)
- **Widgets**: Mis citas, Mi historial, Mis recetas
- **Funciones**: Autogestión de salud

## 🔧 API Endpoints

### Backend

#### `POST /api/auth/login`
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "token_type": "bearer",
  "user_detection": {
    "detected_type": "doctor",
    "confidence": 0.85,
    "suggested_interface": "doctor",
    "category": "medical_staff",
    "permissions": ["view_patients", "create_appointments"]
  },
  "dashboard_config": {
    "title": "Panel del Doctor",
    "widgets": ["appointments_today", "patient_list"],
    "primary_color": "#2D5A87",
    "icon": "stethoscope"
  }
}
```

#### `GET /api/auth/me/detection`
```json
{
  "user_id": "uuid",
  "email": "dr.garcia@hospital.com",
  "detection": {
    "detected_type": "doctor",
    "confidence": 0.85,
    "reasons": ["Rol explícito: doctor", "Patrón de email detectado: hospital.com"],
    "category": "medical_staff",
    "suggested_interface": "doctor",
    "permissions": ["view_patients", "create_appointments"]
  },
  "dashboard_config": { ... },
  "original_role": "doctor",
  "specialty": "Cardiología",
  "detection_timestamp": "2024-01-15T10:30:00Z"
}
```

## 🧪 Pruebas

### Pruebas Unitarias

```bash
# Ejecutar pruebas del backend
cd smd-vital-backend
python -m pytest tests/test_user_detection.py -v
```

### Casos de Prueba Principales

1. **Detección de Doctor**
   - Email: `dr.garcia@hospital.com`
   - Especialidad: `Cardiología`
   - Resultado esperado: Tipo `doctor`, confianza > 80%

2. **Detección de Enfermero**
   - Email: `maria@clinica.com`
   - Especialidad: `Enfermería General`
   - Resultado esperado: Tipo `nurse`, confianza > 70%

3. **Detección de Paciente**
   - Email: `juan@gmail.com`
   - Rol: `patient`
   - Resultado esperado: Tipo `patient`, confianza > 50%

## 🎨 Personalización por Especialidad

### Doctores Especializados

| Especialidad | Color | Icono | Widgets Adicionales |
|--------------|-------|-------|-------------------|
| Cardiología | #E74C3C | Corazón | ECG Monitor, Tendencias cardíacas |
| Pediatría | #F39C12 | Bebé | Gráficos de crecimiento, Vacunas |
| Neurología | #9B59B6 | Cerebro | Evaluaciones neurológicas, Imágenes |
| Dermatología | #E67E22 | Piel | Galería de imágenes, Tratamientos |

## 🔒 Seguridad y Permisos

### Matriz de Permisos

| Tipo | Ver Pacientes | Crear Citas | Ver Expedientes | Prescribir | Administrar |
|------|---------------|-------------|-----------------|------------|-------------|
| Doctor | ✅ | ✅ | ✅ | ✅ | ❌ |
| Enfermero | ✅ | ❌ | ✅ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Paciente | ❌ | ✅ | Solo propios | ❌ | ❌ |

## 📈 Métricas y Monitoreo

### KPIs del Sistema

- **Precisión de Detección**: % de usuarios redirigidos correctamente
- **Tiempo de Detección**: Latencia promedio del proceso
- **Satisfacción del Usuario**: Feedback sobre la interfaz asignada
- **Uso de Fallback**: % de usuarios que requieren selección manual

### Logs y Auditoría

```python
# Ejemplo de log de detección
{
  "timestamp": "2024-01-15T10:30:00Z",
  "user_id": "uuid",
  "email": "dr.garcia@hospital.com",
  "detected_type": "doctor",
  "confidence": 0.85,
  "reasons": ["Rol explícito: doctor", "Patrón de email: hospital.com"],
  "processing_time_ms": 45
}
```

## 🚀 Despliegue y Configuración

### Variables de Entorno

```bash
# Backend
JWT_SECRET=your_secret_key
DATABASE_URL=postgresql://user:pass@host:port/db
LOG_LEVEL=INFO

# Frontend
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENABLE_USER_DETECTION=true
```

### Docker Compose

```yaml
services:
  auth-service:
    build: ./services/auth
    environment:
      - ENABLE_USER_DETECTION=true
    ports:
      - "8001:8000"
```

## 🔮 Roadmap y Mejoras Futuras

### Fase 1 (Actual)
- ✅ Detección básica por rol y email
- ✅ Redirección automática
- ✅ Dashboards personalizados

### Fase 2 (Próxima)
- 🔄 Machine Learning para mejorar precisión
- 🔄 Análisis de comportamiento del usuario
- 🔄 Detección por patrones de uso

### Fase 3 (Futuro)
- 📋 Integración con sistemas externos
- 📋 Detección multi-rol
- 📋 Personalización avanzada por especialidad

## 🛠️ Mantenimiento

### Agregar Nuevo Tipo de Usuario

1. **Backend**: Actualizar `UserType` enum y patrones de detección
2. **Frontend**: Agregar configuración de interfaz
3. **Pruebas**: Crear casos de prueba específicos
4. **Documentación**: Actualizar esta guía

### Monitoreo de Rendimiento

```python
# Métricas a monitorear
- Tiempo de respuesta de detección
- Precisión por tipo de usuario
- Errores de detección
- Uso de recursos del sistema
```

## 📞 Soporte y Contacto

Para soporte técnico o consultas sobre el sistema de detección:

- **Email**: dev@smdvital.com
- **Documentación**: [docs.smdvital.com](https://docs.smdvital.com)
- **Issues**: [GitHub Issues](https://github.com/smdvital/issues)

---

**SMD VITAL** - Sistema de Detección Inteligente de Usuarios v1.0  
*Desarrollado con ❤️ para mejorar la experiencia del personal médico*
