# SMD Vital - Guía de Observabilidad
=====================================

## 🔍 Jaeger - Distributed Tracing

### ¿Qué es?
Jaeger te permite rastrear una petición a través de todos los microservicios para ver exactamente dónde está y cuánto tiempo tarda.

### URLs de Acceso:
- **Jaeger UI:** http://localhost:16686
- **Jaeger Collector:** http://localhost:14268

### Cómo implementar en tus microservicios:

#### 1. Instalar dependencias:
```bash
pip install opentelemetry-api
pip install opentelemetry-sdk
pip install opentelemetry-instrumentation-fastapi
pip install opentelemetry-instrumentation-sqlalchemy
pip install opentelemetry-instrumentation-requests
pip install opentelemetry-exporter-jaeger
```

#### 2. Configurar tracing en main.py:
```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor

# Configurar Jaeger
jaeger_exporter = JaegerExporter(
    agent_host_name="jaeger",
    agent_port=14268,
)

trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

span_processor = BatchSpanProcessor(jaeger_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

# Instrumentar FastAPI
FastAPIInstrumentor.instrument_app(app)

# Instrumentar SQLAlchemy
SQLAlchemyInstrumentor().instrument()

# Instrumentar requests
RequestsInstrumentor().instrument()
```

#### 3. Crear spans personalizados:
```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    with tracer.start_as_current_span("get_user_operation") as span:
        span.set_attribute("user.id", user_id)
        span.set_attribute("operation.name", "get_user")
        
        # Tu lógica aquí
        user = await get_user_from_db(user_id)
        
        span.set_attribute("user.found", user is not None)
        return user
```

## 📊 Kibana - Log Analysis

### ¿Qué es?
Kibana te permite analizar y visualizar los logs de todos tus microservicios de forma centralizada.

### URLs de Acceso:
- **Kibana UI:** http://localhost:5601
- **Elasticsearch:** http://localhost:9200

### Cómo implementar logging estructurado:

#### 1. Configurar logging en tus microservicios:
```python
import logging
import json
from datetime import datetime

class StructuredLogger:
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.logger = logging.getLogger(service_name)
        
    def log_request(self, method: str, path: str, user_id: str = None, 
                   status_code: int = None, duration_ms: float = None):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "service": self.service_name,
            "level": "INFO",
            "type": "request",
            "method": method,
            "path": path,
            "user_id": user_id,
            "status_code": status_code,
            "duration_ms": duration_ms
        }
        self.logger.info(json.dumps(log_data))
    
    def log_error(self, error: str, user_id: str = None, 
                 request_id: str = None, stack_trace: str = None):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "service": self.service_name,
            "level": "ERROR",
            "type": "error",
            "error": error,
            "user_id": user_id,
            "request_id": request_id,
            "stack_trace": stack_trace
        }
        self.logger.error(json.dumps(log_data))
    
    def log_business_event(self, event_type: str, user_id: str, 
                          data: dict = None):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "service": self.service_name,
            "level": "INFO",
            "type": "business_event",
            "event_type": event_type,
            "user_id": user_id,
            "data": data or {}
        }
        self.logger.info(json.dumps(log_data))

# Uso en tu microservicio
logger = StructuredLogger("auth-service")

@app.post("/login")
async def login(credentials: LoginRequest):
    logger.log_request("POST", "/login")
    
    try:
        user = await authenticate_user(credentials)
        logger.log_business_event("user_login", user.id)
        return {"access_token": create_token(user)}
    except Exception as e:
        logger.log_error(str(e), request_id=request_id)
        raise
```

#### 2. Configurar Logstash para enviar logs a Elasticsearch:
```yaml
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "auth-service" {
    json {
      source => "message"
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "smd-vital-logs-%{+YYYY.MM.dd}"
  }
}
```

## 🎯 Casos de Uso Prácticos

### 1. Debugging de Problemas:
- **Jaeger:** Rastrea una petición que falla para ver exactamente dónde
- **Kibana:** Busca logs de error por usuario o timestamp

### 2. Optimización de Performance:
- **Jaeger:** Identifica cuellos de botella en el flujo de datos
- **Kibana:** Analiza patrones de uso y tiempos de respuesta

### 3. Monitoreo de Negocio:
- **Kibana:** Dashboard de métricas de negocio (logins, citas, pagos)
- **Jaeger:** Rastrea el flujo completo de una cita médica

### 4. Alertas y Monitoreo:
- **Kibana:** Configura alertas cuando hay muchos errores
- **Jaeger:** Monitorea la latencia de operaciones críticas

## 📈 Dashboards Recomendados

### Kibana Dashboards:
1. **Error Rate Dashboard:** Errores por servicio y tiempo
2. **User Activity Dashboard:** Actividad de usuarios por hora/día
3. **Performance Dashboard:** Tiempos de respuesta por endpoint
4. **Business Metrics Dashboard:** Citas, pagos, usuarios activos

### Jaeger Queries:
1. **Slow Operations:** `duration > 5s`
2. **Error Traces:** `error=true`
3. **Service Dependencies:** Ver cómo se conectan los servicios
4. **User Journey:** Rastrear el flujo completo de un usuario

## 🚀 Próximos Pasos

1. **Implementa logging estructurado** en tus microservicios
2. **Agrega tracing** a operaciones críticas
3. **Crea dashboards** en Kibana para métricas importantes
4. **Configura alertas** para problemas críticos
5. **Monitorea el flujo de negocio** con Jaeger

## 🔧 Configuración Rápida

### Para empezar ahora mismo:
1. Ve a http://localhost:16686 (Jaeger)
2. Ve a http://localhost:5601 (Kibana)
3. Explora las interfaces
4. Implementa logging básico en un microservicio
5. Ve los logs aparecer en Kibana en tiempo real


















