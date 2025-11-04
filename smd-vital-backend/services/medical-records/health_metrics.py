"""
SMD VITAL - Health Metrics Service
==================================
Sistema de métricas de salud con análisis avanzado
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging
import os
import json
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import uuid
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

# Configuración
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://smdvital:smdvital_password_2024@postgres:5432/smdvital_medical_records")
# Asegurar que use psycopg2 para SQLAlchemy síncrono
if DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI(title="SMD Vital Health Metrics Service", version="1.0.0")

allowed_origins = os.getenv("MEDICAL_RECORDS_ALLOWED_ORIGINS", "http://localhost:3001,http://localhost:3000").split(",")
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
class HealthMetricRequest(BaseModel):
    user_id: str
    metric_code: str
    value: float
    unit: Optional[str] = None
    measured_at: Optional[datetime] = None
    notes: Optional[str] = None
    source: str = "manual"

class HealthMetricResponse(BaseModel):
    metric_id: str
    status: str
    message: str

class MetricDefinitionRequest(BaseModel):
    metric_code: str
    metric_name: str
    category: str
    unit: str
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    data_type: str = "numeric"

class TimeSeriesRequest(BaseModel):
    user_id: str
    metric_code: str
    start_date: datetime
    end_date: datetime
    aggregation: str = "raw"

# Database functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_health_metric(db, metric_data: dict):
    """Crear métrica de salud en la base de datos"""
    query = text("""
        INSERT INTO health_metrics (
            user_id, metric_code, metric_data, measured_at, 
            source, notes
        ) VALUES (
            :user_id, :metric_code, :metric_data, :measured_at,
            :source, :notes
        ) RETURNING id
    """)
    
    result = db.execute(query, metric_data)
    return result.fetchone()[0]

def create_metric_definition(db, definition_data: dict):
    """Crear definición de métrica"""
    query = text("""
        INSERT INTO health_metric_definitions (
            metric_code, metric_name, category, unit,
            min_value, max_value, data_type
        ) VALUES (
            :metric_code, :metric_name, :category, :unit,
            :min_value, :max_value, :data_type
        ) RETURNING id
    """)
    
    result = db.execute(query, definition_data)
    return result.fetchone()[0]

# API Endpoints
@app.post("/record-metric", response_model=HealthMetricResponse)
async def record_health_metric(
    request: HealthMetricRequest,
    db = Depends(get_db)
):
    """Registrar nueva métrica de salud"""
    try:
        # Validar que la métrica existe
        check_query = text("""
            SELECT id FROM health_metric_definitions 
            WHERE metric_code = :metric_code AND is_active = TRUE
        """)
        
        result = db.execute(check_query, {"metric_code": request.metric_code}).fetchone()
        
        if not result:
            raise HTTPException(status_code=404, detail="Tipo de métrica no encontrado")
        
        # Preparar datos de la métrica
        metric_data_json = {
            "value": request.value,
            "unit": request.unit,
            "timestamp": (request.measured_at or datetime.utcnow()).isoformat()
        }
        
        metric_data = {
            "user_id": request.user_id,
            "metric_code": request.metric_code,
            "metric_data": json.dumps(metric_data_json),
            "measured_at": request.measured_at or datetime.utcnow(),
            "source": request.source,
            "notes": request.notes
        }
        
        # Crear métrica
        metric_id = create_health_metric(db, metric_data)
        db.commit()
        
        # Verificar alertas
        await check_health_alerts(db, request.user_id, request.metric_code, request.value)
        
        logger.info(f"Métrica registrada: {request.metric_code} para usuario {request.user_id}")
        
        return HealthMetricResponse(
            metric_id=str(metric_id),
            status="success",
            message="Métrica registrada exitosamente"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registrando métrica: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.post("/create-metric-definition")
async def create_metric_definition_endpoint(
    request: MetricDefinitionRequest,
    db = Depends(get_db)
):
    """Crear definición de nueva métrica"""
    try:
        definition_data = {
            "metric_code": request.metric_code,
            "metric_name": request.metric_name,
            "category": request.category,
            "unit": request.unit,
            "min_value": request.min_value,
            "max_value": request.max_value,
            "data_type": request.data_type
        }
        
        definition_id = create_metric_definition(db, definition_data)
        db.commit()
        
        return {
            "definition_id": str(definition_id),
            "message": "Definición de métrica creada exitosamente"
        }
        
    except Exception as e:
        logger.error(f"Error creando definición: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/timeseries")
async def get_health_timeseries(
    user_id: str,
    metric_code: str,
    start_date: datetime,
    end_date: datetime,
    aggregation: str = "raw",
    db = Depends(get_db)
):
    """Obtener serie temporal de métricas de salud"""
    try:
        if aggregation == "raw":
            query = text("""
                SELECT measured_at, metric_data->>'value' as value, source
                FROM health_metrics
                WHERE user_id = :user_id
                AND metric_code = :metric_code
                AND measured_at BETWEEN :start_date AND :end_date
                ORDER BY measured_at DESC
            """)
        else:
            query = text("""
                SELECT period_start as measured_at, avg_value as value, 'aggregated' as source
                FROM health_metric_aggregations
                WHERE user_id = :user_id
                AND metric_code = :metric_code
                AND period_type = :aggregation
                AND period_start BETWEEN :start_date AND :end_date
                ORDER BY period_start DESC
            """)
        
        results = db.execute(query, {
            "user_id": user_id,
            "metric_code": metric_code,
            "start_date": start_date,
            "end_date": end_date,
            "aggregation": aggregation
        }).fetchall()
        
        return [
            {
                "measured_at": row[0],
                "value": float(row[1]) if row[1] else None,
                "source": row[2]
            }
            for row in results
        ]
        
    except Exception as e:
        logger.error(f"Error obteniendo serie temporal: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/dashboard/{user_id}")
async def get_health_dashboard(user_id: str, db = Depends(get_db)):
    """Obtener dashboard de salud del usuario"""
    try:
        # Obtener resumen de métricas
        query = text("""
            SELECT 
                hm.metric_code,
                hmd.metric_name,
                hmd.category,
                hmd.unit,
                COUNT(*) as total_measurements,
                MIN(hm.measured_at) as first_measurement,
                MAX(hm.measured_at) as last_measurement,
                AVG((hm.metric_data->>'value')::DECIMAL) as avg_value,
                MIN((hm.metric_data->>'value')::DECIMAL) as min_value,
                MAX((hm.metric_data->>'value')::DECIMAL) as max_value
            FROM health_metrics hm
            JOIN health_metric_definitions hmd ON hm.metric_code = hmd.metric_code
            WHERE hm.user_id = :user_id
            AND hm.measured_at >= NOW() - INTERVAL '30 days'
            GROUP BY hm.metric_code, hmd.metric_name, hmd.category, hmd.unit
            ORDER BY last_measurement DESC
        """)
        
        results = db.execute(query, {"user_id": user_id}).fetchall()
        
        metrics = []
        for row in results:
            metrics.append({
                "metric_code": row[0],
                "metric_name": row[1],
                "category": row[2],
                "unit": row[3],
                "total_measurements": row[4],
                "first_measurement": row[5],
                "last_measurement": row[6],
                "avg_value": float(row[7]) if row[7] else None,
                "min_value": float(row[8]) if row[8] else None,
                "max_value": float(row[9]) if row[9] else None
            })
        
        # Obtener alertas activas
        alerts_query = text("""
            SELECT metric_code, alert_type, severity, message, created_at
            FROM health_alerts
            WHERE user_id = :user_id AND status = 'active'
            ORDER BY created_at DESC
            LIMIT 10
        """)
        
        alerts_results = db.execute(alerts_query, {"user_id": user_id}).fetchall()
        
        alerts = [
            {
                "metric_code": row[0],
                "alert_type": row[1],
                "severity": row[2],
                "message": row[3],
                "created_at": row[4]
            }
            for row in alerts_results
        ]
        
        return {
            "user_id": user_id,
            "metrics": metrics,
            "alerts": alerts,
            "summary": {
                "total_metrics": len(metrics),
                "active_alerts": len(alerts),
                "last_updated": datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo dashboard: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

async def check_health_alerts(db, user_id: str, metric_code: str, value: float):
    """Verificar alertas de salud basadas en umbrales"""
    try:
        # Obtener umbrales de la métrica
        query = text("""
            SELECT warning_threshold_low, warning_threshold_high,
                   critical_threshold_low, critical_threshold_high
            FROM health_metric_definitions
            WHERE metric_code = :metric_code
        """)
        
        result = db.execute(query, {"metric_code": metric_code}).fetchone()
        
        if not result:
            return
        
        warning_low, warning_high, critical_low, critical_high = result
        
        # Verificar umbrales críticos
        if critical_low and value < critical_low:
            await create_health_alert(
                db, user_id, metric_code, "critical", "critical",
                f"Valor críticamente bajo: {value}",
                value, critical_low
            )
        elif critical_high and value > critical_high:
            await create_health_alert(
                db, user_id, metric_code, "critical", "critical",
                f"Valor críticamente alto: {value}",
                value, critical_high
            )
        # Verificar umbrales de advertencia
        elif warning_low and value < warning_low:
            await create_health_alert(
                db, user_id, metric_code, "warning", "medium",
                f"Valor bajo: {value}",
                value, warning_low
            )
        elif warning_high and value > warning_high:
            await create_health_alert(
                db, user_id, metric_code, "warning", "medium",
                f"Valor alto: {value}",
                value, warning_high
            )
            
    except Exception as e:
        logger.error(f"Error verificando alertas: {e}")

async def create_health_alert(db, user_id: str, metric_code: str, alert_type: str, 
                            severity: str, message: str, trigger_value: float, threshold_value: float):
    """Crear alerta de salud"""
    try:
        query = text("""
            INSERT INTO health_alerts (
                user_id, metric_code, alert_type, severity, message,
                trigger_value, threshold_value, measured_at
            ) VALUES (
                :user_id, :metric_code, :alert_type, :severity, :message,
                :trigger_value, :threshold_value, NOW()
            )
        """)
        
        db.execute(query, {
            "user_id": user_id,
            "metric_code": metric_code,
            "alert_type": alert_type,
            "severity": severity,
            "message": message,
            "trigger_value": trigger_value,
            "threshold_value": threshold_value
        })
        db.commit()
        
        logger.info(f"Alerta creada: {alert_type} para {metric_code}")
        
    except Exception as e:
        logger.error(f"Error creando alerta: {e}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "health-metrics-service"}

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007)


