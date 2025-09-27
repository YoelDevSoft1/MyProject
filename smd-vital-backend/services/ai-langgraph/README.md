# SMD VITAL - AI LangGraph Service

## Descripción
Microservicio de inteligencia artificial médica usando LangGraph con modelos públicos. Proporciona capacidades avanzadas de IA para diagnóstico, recomendación de medicamentos, análisis de imágenes médicas, monitoreo de signos vitales, documentación médica y predicción de riesgos.

## Características

### 🤖 Modelos de IA Soportados
- **OpenAI**: GPT-4, GPT-3.5-turbo, GPT-4-vision
- **Anthropic**: Claude-3-sonnet, Claude-3-haiku
- **Ollama**: Llama2, CodeLlama, Mistral (modelos locales)

### 🔄 Workflows de LangGraph
1. **Diagnóstico Médico** (`diagnosis_workflow`)
   - Análisis de síntomas
   - Diagnóstico diferencial
   - Cálculo de confianza
   - Validación médica

2. **Recomendación de Medicamentos** (`medication_workflow`)
   - Análisis de condición
   - Verificación de interacciones
   - Cálculo de dosificación
   - Verificación de alergias

3. **Análisis de Imágenes** (`imaging_workflow`)
   - Preprocesamiento de imágenes
   - Extracción de características
   - Clasificación médica

4. **Monitoreo de Signos Vitales** (`monitoring_workflow`)
   - Análisis de signos vitales
   - Análisis de tendencias
   - Generación de alertas

5. **Documentación Médica** (`documentation_workflow`)
   - Análisis de contenido
   - Generación de estructura
   - Aplicación de terminología médica

6. **Predicción de Riesgos** (`prediction_workflow`)
   - Evaluación de factores de riesgo
   - Modelos de predicción
   - Cálculo de probabilidades

### 🚀 Funcionalidades Avanzadas
- **Streaming en Tiempo Real**: Respuestas de IA con streaming
- **WebSocket**: Consultas en tiempo real
- **Base de Conocimiento Médico**: Validación y recomendaciones
- **Plantillas de Prompts**: Prompts médicos especializados
- **Análisis de Imágenes**: Procesamiento de imágenes médicas
- **Monitoreo de Signos Vitales**: Análisis avanzado de datos vitales

## Arquitectura

### Estructura del Servicio
```
ai-langgraph/
├── main.py                 # Aplicación principal FastAPI
├── workflows/              # Workflows de LangGraph
│   └── medical_workflows.py
├── services/               # Servicios de IA
│   ├── ai_service.py
│   ├── image_service.py
│   └── monitoring_service.py
├── models/                 # Modelos de base de datos
│   └── database.py
├── utils/                  # Utilidades
│   ├── prompt_templates.py
│   └── medical_knowledge.py
├── schemas/                # Esquemas de base de datos
│   └── ai_schemas.sql
├── requirements.txt        # Dependencias Python
├── Dockerfile             # Imagen Docker
└── README.md              # Documentación
```

### Base de Datos
- **ai_queries**: Consultas de IA
- **ai_responses**: Respuestas de IA
- **ai_workflows**: Configuración de workflows
- **ai_sessions**: Sesiones de IA
- **ai_models**: Modelos de IA disponibles
- **ai_usage_metrics**: Métricas de uso
- **ai_prompt_templates**: Plantillas de prompts

## Instalación

### Requisitos
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker (opcional)

### Instalación Local
```bash
# Clonar el repositorio
cd smd-vital-backend/services/ai-langgraph

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves de API

# Ejecutar el servicio
python main.py
```

### Instalación con Docker
```bash
# Desde el directorio raíz del proyecto
docker-compose up ai-langgraph
```

## Uso

### Endpoints Principales

#### 1. Procesar Consulta de IA
```http
POST /ai/query
Content-Type: application/json
Authorization: Bearer <token>

{
  "query_type": "diagnosis",
  "query_text": "Paciente con dolor de cabeza y fiebre",
  "user_id": "user_123",
  "context": {
    "age": 35,
    "gender": "female",
    "medical_history": "Hipertensión"
  }
}
```

#### 2. Streaming de Consulta
```http
POST /ai/query/stream
Content-Type: application/json
Authorization: Bearer <token>

{
  "query_type": "diagnosis",
  "query_text": "Análisis de síntomas",
  "user_id": "user_123"
}
```

#### 3. WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8008/ai/ws/user_123');
ws.send(JSON.stringify({
  type: 'query',
  data: {
    query_type: 'diagnosis',
    query_text: 'Consulta médica',
    user_id: 'user_123'
  }
}));
```

### Ejemplos de Uso

#### Diagnóstico Médico
```javascript
const response = await apiService.getMedicalDiagnosis(
  "Paciente con dolor torácico y dificultad respiratoria",
  {
    age: 45,
    gender: "male",
    medical_history: "Hipertensión, diabetes"
  },
  token
);
```

#### Análisis de Imágenes
```javascript
const response = await apiService.analyzeMedicalImage(
  imageData,
  "chest_xray",
  token
);
```

#### Monitoreo de Signos Vitales
```javascript
const response = await apiService.analyzeVitalSigns(
  {
    heart_rate: 85,
    blood_pressure_systolic: 140,
    blood_pressure_diastolic: 90,
    temperature: 37.2,
    respiratory_rate: 18,
    oxygen_saturation: 98
  },
  token
);
```

## Configuración

### Variables de Entorno
```bash
# Base de datos
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/db

# Redis
REDIS_URL=redis://host:port/db

# APIs de IA
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Ollama (opcional)
OLLAMA_BASE_URL=http://localhost:11434
```

### Configuración de Modelos
Los modelos se configuran automáticamente al iniciar el servicio. Para agregar nuevos modelos, edita el archivo `services/ai_service.py`.

## Monitoreo

### Métricas Disponibles
- Número de consultas procesadas
- Tiempo de procesamiento promedio
- Tasa de éxito de consultas
- Uso de modelos de IA
- Métricas de confianza

### Health Check
```http
GET /health
```

## Desarrollo

### Estructura de Workflows
Los workflows de LangGraph se definen en `workflows/medical_workflows.py`. Cada workflow incluye:
- Nodos de procesamiento
- Flujo de datos
- Validaciones
- Generación de respuestas

### Agregar Nuevo Workflow
1. Definir el workflow en `medical_workflows.py`
2. Agregar nodos de procesamiento
3. Configurar el flujo de datos
4. Registrar en `MedicalWorkflowManager`

### Testing
```bash
# Ejecutar tests
pytest tests/

# Tests con cobertura
pytest --cov=src tests/
```

## Seguridad

### Consideraciones de Seguridad
- Autenticación JWT requerida
- Validación de entrada en todos los endpoints
- Rate limiting implementado
- Logs de auditoría para consultas médicas
- Cifrado de datos sensibles

### Cumplimiento Médico
- Disclaimers médicos en todas las respuestas
- Recomendación de consulta médica profesional
- No reemplaza diagnóstico médico
- Cumplimiento con regulaciones de salud

## Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión a Base de Datos
```bash
# Verificar que PostgreSQL esté ejecutándose
docker ps | grep postgres

# Verificar variables de entorno
echo $DATABASE_URL
```

#### 2. Error de API de IA
```bash
# Verificar claves de API
echo $OPENAI_API_KEY

# Verificar conectividad
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

#### 3. Error de Redis
```bash
# Verificar que Redis esté ejecutándose
docker ps | grep redis

# Verificar conectividad
redis-cli ping
```

## Contribución

### Guías de Contribución
1. Fork del repositorio
2. Crear rama de feature
3. Implementar cambios
4. Agregar tests
5. Crear pull request

### Estándares de Código
- PEP 8 para Python
- Type hints obligatorios
- Documentación en funciones
- Tests unitarios para nuevas funcionalidades

## Licencia
Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## Soporte
Para soporte técnico, contactar al equipo de desarrollo de SMD VITAL.


