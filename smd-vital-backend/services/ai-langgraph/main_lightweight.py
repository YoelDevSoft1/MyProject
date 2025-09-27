"""
SMD VITAL AI LangGraph Service - Lightweight Version
===================================================
Servicio de IA médica con LangGraph optimizado para Docker
"""

import os
import json
import uuid
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, AsyncGenerator
from contextlib import asynccontextmanager

# FastAPI imports
from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel, Field

# Database imports
import asyncpg
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Local imports
from workflows.lightweight_workflows import LightweightWorkflowEngine
from workflows.triage_workflow import triage_workflow
from services.free_ai_service import FreeAIService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://smdvital:smdvital_password_2024@postgres:5432/smdvital_ai")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
FREE_AI_ENABLED = os.getenv("FREE_AI_ENABLED", "true").lower() == "true"
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "phi")  # Modelo más rápido por defecto

# Pydantic models
class AIQueryRequest(BaseModel):
    query: str = Field(..., description="Consulta médica del usuario")
    user_id: str = Field(..., description="ID del usuario")
    workflow: str = Field(default="diagnosis", description="Workflow de IA a utilizar")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Contexto adicional")
    session_id: Optional[str] = Field(default=None, description="ID de sesión existente")
    model: Optional[str] = Field(default=None, description="Modelo de IA a utilizar")
    use_free_ai: bool = Field(default=True, description="Usar IA gratuita")

class AIQueryResponse(BaseModel):
    query_id: str
    response: str
    confidence: float
    processing_time: float
    model_used: str
    workflow_used: str
    timestamp: datetime

class AIStreamResponse(BaseModel):
    query_id: str
    chunk: str
    is_final: bool
    confidence: Optional[float] = None

class WorkflowConfig(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]

class ModelInfo(BaseModel):
    name: str
    provider: str
    capabilities: List[str]
    max_tokens: int
    cost_per_token: float

class TriageRequest(BaseModel):
    answers: Dict[str, Any]
    patient_id: Optional[str] = None
    timestamp: str

class TriageResponse(BaseModel):
    urgencyLevel: str
    estimatedWaitTime: str
    recommendedSpecialist: str
    immediateActions: List[str]
    riskFactors: List[str]
    confidence: float
    reasoning: str
    nextSteps: List[str]

# Global services
workflow_engine: Optional[LightweightWorkflowEngine] = None
free_ai_service: Optional[FreeAIService] = None

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(message)
            except:
                self.disconnect(user_id)

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup"""
    global workflow_engine, free_ai_service
    
    try:
        # Initialize free AI service
        if FREE_AI_ENABLED:
            free_ai_service = FreeAIService(OLLAMA_BASE_URL)
            logger.info("✅ Servicio de IA gratuito inicializado con Ollama")
        else:
            logger.warning("⚠️ FREE_AI_ENABLED deshabilitado")
            free_ai_service = None
        
        # Initialize workflow engine
        if OPENAI_API_KEY:
            workflow_engine = LightweightWorkflowEngine(OPENAI_API_KEY)
            logger.info("✅ Workflow engine inicializado con OpenAI")
        else:
            logger.warning("⚠️ OPENAI_API_KEY no configurado - usando solo IA gratuita")
            workflow_engine = None
        
        logger.info("🚀 SMD VITAL AI LangGraph Service (Lightweight) iniciado")
        yield
        
    except Exception as e:
        logger.error(f"❌ Error inicializando servicio: {e}")
        raise
    finally:
        logger.info("🛑 SMD VITAL AI LangGraph Service cerrando")

# Create FastAPI app
app = FastAPI(
    title="SMD VITAL AI LangGraph Service (Lightweight)",
    description="Servicio de IA médica con LangGraph optimizado",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-langgraph-lightweight",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "workflows_available": len(workflow_engine.get_available_workflows()) if workflow_engine else 0
    }

# Metrics endpoint
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# AI Query endpoints
@app.post("/ai/query", response_model=AIQueryResponse)
async def process_ai_query(
    request: AIQueryRequest,
    background_tasks: BackgroundTasks
):
    """Process AI query using lightweight LangGraph workflows or free AI"""
    try:
        start_time = datetime.utcnow()
        query_id = str(uuid.uuid4())
        
        # Choose AI service based on request
        if request.use_free_ai and free_ai_service:
            # Use free AI service
            model = request.model or DEFAULT_MODEL
            context_str = json.dumps(request.context) if request.context else ""
            
            result = await free_ai_service.generate_response(
                prompt=request.query,
                model=model,
                context=context_str
            )
            
            if result.get("success", False):
                return AIQueryResponse(
                    query_id=query_id,
                    response=result["response"],
                    confidence=0.8,  # Default confidence for free models
                    processing_time=(datetime.utcnow() - start_time).total_seconds(),
                    model_used=result["model_used"],
                    workflow_used=request.workflow,
                    timestamp=start_time
                )
            else:
                raise HTTPException(status_code=500, detail=result.get("error", "Error con IA gratuita"))
        
        elif workflow_engine:
            # Use OpenAI workflow engine
            result = await workflow_engine.execute_workflow(
                workflow_name=request.workflow,
                query=request.query,
                user_id=request.user_id,
                context=request.context or {}
            )
            
            return AIQueryResponse(
                query_id=query_id,
                response=result["response"],
                confidence=result.get("confidence", 0.0),
                processing_time=(datetime.utcnow() - start_time).total_seconds(),
                model_used="gpt-3.5-turbo",
                workflow_used=request.workflow,
                timestamp=start_time
            )
        else:
            raise HTTPException(status_code=503, detail="No AI service available")
        
    except Exception as e:
        logger.error(f"Error processing AI query: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.post("/ai/query/stream")
async def stream_ai_query(request: AIQueryRequest):
    """Stream AI query response using Server-Sent Events"""
    try:
        if not workflow_engine:
            raise HTTPException(status_code=503, detail="Workflow engine not initialized")
        
        async def generate_stream():
            query_id = str(uuid.uuid4())
            try:
                # Stream workflow execution
                async for chunk in workflow_engine.stream_workflow(
                    workflow_name=request.workflow,
                    query=request.query,
                    user_id=request.user_id,
                    context=request.context or {}
                ):
                    yield {
                        "event": "chunk",
                        "data": json.dumps({
                            "query_id": query_id,
                            "chunk": chunk.get("chunk", ""),
                            "is_final": chunk.get("is_final", False),
                            "confidence": chunk.get("confidence"),
                            "step": chunk.get("step", "")
                        })
                    }
                    
            except Exception as e:
                logger.error(f"Error in stream generation: {e}")
                yield {
                    "event": "error",
                    "data": json.dumps({"error": str(e)})
                }
        
        return EventSourceResponse(generate_stream())
        
    except Exception as e:
        logger.error(f"Error setting up stream: {e}")
        raise HTTPException(status_code=500, detail=f"Error setting up stream: {str(e)}")

# WebSocket endpoint
@app.websocket("/ai/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time AI interactions"""
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "query":
                # Process query in background
                asyncio.create_task(process_websocket_query(user_id, message))
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)

async def process_websocket_query(user_id: str, message: Dict):
    """Process WebSocket query"""
    try:
        query = message.get("query", "")
        workflow = message.get("workflow", "diagnosis")
        
        if not workflow_engine:
            await manager.send_personal_message(
                json.dumps({"error": "Workflow engine not available"}), 
                user_id
            )
            return
        
        # Stream response back to WebSocket
        async for chunk in workflow_engine.stream_workflow(
            workflow_name=workflow,
            query=query,
            user_id=user_id,
            context={}
        ):
            await manager.send_personal_message(
                json.dumps({
                    "type": "chunk",
                    "chunk": chunk.get("chunk", ""),
                    "is_final": chunk.get("is_final", False),
                    "confidence": chunk.get("confidence"),
                    "step": chunk.get("step", "")
                }),
                user_id
            )
            
    except Exception as e:
        logger.error(f"Error processing WebSocket query: {e}")
        await manager.send_personal_message(
            json.dumps({"error": str(e)}),
            user_id
        )

# Workflow management endpoints
@app.get("/ai/workflows")
async def get_workflows():
    """Get available AI workflows"""
    if not workflow_engine:
        raise HTTPException(status_code=503, detail="Workflow engine not initialized")
    
    workflows = workflow_engine.get_available_workflows()
    return {"workflows": workflows}

@app.get("/ai/models")
async def get_models():
    """Get available AI models"""
    models = []
    
    # Add free AI models
    if free_ai_service:
        free_models = await free_ai_service.list_models()
        if "available_models" in free_models:
            for model_name in free_models["available_models"]:
                model_info = free_models.get("model_info", {}).get(model_name, {})
                models.append({
                    "name": model_name,
                    "provider": "ollama",
                    "type": "text",
                    "max_tokens": 4000,
                    "free": True,
                    "description": model_info.get("description", ""),
                    "memory_required": model_info.get("memory_required", "4GB"),
                    "best_for": model_info.get("best_for", "")
                })
    
    # Add OpenAI models
    if OPENAI_API_KEY:
        models.extend([
            {"name": "gpt-3.5-turbo", "provider": "openai", "type": "text", "max_tokens": 4000, "free": False},
            {"name": "gpt-4", "provider": "openai", "type": "text", "max_tokens": 8000, "free": False}
        ])
    
    return {"models": models, "free_ai_enabled": FREE_AI_ENABLED}

# Free AI specific endpoints
@app.get("/ai/free/models")
async def get_free_models():
    """Get available free AI models"""
    if not free_ai_service:
        raise HTTPException(status_code=503, detail="Free AI service not available")
    
    return await free_ai_service.list_models()

@app.post("/ai/free/install/{model_name}")
async def install_free_model(model_name: str):
    """Install a free AI model"""
    if not free_ai_service:
        raise HTTPException(status_code=503, detail="Free AI service not available")
    
    result = await free_ai_service.install_model(model_name)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@app.get("/ai/free/status")
async def get_free_ai_status():
    """Get free AI service status"""
    if not free_ai_service:
        raise HTTPException(status_code=503, detail="Free AI service not available")
    
    return await free_ai_service.health_check()

@app.post("/ai/free/query")
async def query_free_ai(request: AIQueryRequest):
    """Query free AI directly"""
    if not free_ai_service:
        raise HTTPException(status_code=503, detail="Free AI service not available")
    
    model = request.model or DEFAULT_MODEL
    context_str = json.dumps(request.context) if request.context else ""
    
    result = await free_ai_service.generate_response(
        prompt=request.query,
        model=model,
        context=context_str
    )
    
    if not result.get("success", False):
        raise HTTPException(status_code=500, detail=result.get("error", "Error generando respuesta"))
    
    return result

@app.post("/ai/free/stream")
async def stream_free_ai(request: AIQueryRequest):
    """Stream free AI response"""
    if not free_ai_service:
        raise HTTPException(status_code=503, detail="Free AI service not available")
    
    model = request.model or DEFAULT_MODEL
    context_str = json.dumps(request.context) if request.context else ""
    
    async def generate_stream():
        query_id = str(uuid.uuid4())
        try:
            async for chunk in free_ai_service.stream_response(
                prompt=request.query,
                model=model,
                context=context_str
            ):
                yield {
                    "event": "chunk",
                    "data": json.dumps({
                        "query_id": query_id,
                        "chunk": chunk,
                        "is_final": False,
                        "model_used": model
                    })
                }
            
            # Send final chunk
            yield {
                "event": "chunk", 
                "data": json.dumps({
                    "query_id": query_id,
                    "chunk": "",
                    "is_final": True,
                    "model_used": model
                })
            }
            
        except Exception as e:
            logger.error(f"Error in free AI stream: {e}")
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }
    
    return EventSourceResponse(generate_stream())

# Medical-specific endpoints
@app.post("/ai/medical/diagnosis")
async def get_medical_diagnosis(request: AIQueryRequest):
    """Get medical diagnosis using AI"""
    request.workflow = "diagnosis"
    return await process_ai_query(request, BackgroundTasks())

@app.post("/ai/medical/medication")
async def get_medication_recommendation(request: AIQueryRequest):
    """Get medication recommendation using AI"""
    request.workflow = "medication"
    return await process_ai_query(request, BackgroundTasks())

@app.post("/ai/medical/imaging")
async def analyze_medical_image(request: AIQueryRequest):
    """Analyze medical image using AI"""
    request.workflow = "imaging"
    return await process_ai_query(request, BackgroundTasks())

@app.post("/ai/medical/monitoring")
async def analyze_vital_signs(request: AIQueryRequest):
    """Analyze vital signs using AI"""
    request.workflow = "monitoring"
    return await process_ai_query(request, BackgroundTasks())

@app.post("/ai/medical/documentation")
async def generate_medical_documentation(request: AIQueryRequest):
    """Generate medical documentation using AI"""
    request.workflow = "documentation"
    return await process_ai_query(request, BackgroundTasks())

@app.post("/ai/medical/prediction")
async def predict_health_risks(request: AIQueryRequest):
    """Predict health risks using AI"""
    request.workflow = "prediction"
    return await process_ai_query(request, BackgroundTasks())

# Triage endpoints
@app.post("/ai/triage/analyze", response_model=TriageResponse)
async def analyze_triage(request: TriageRequest):
    """Analyze triage using LangGraph workflow"""
    try:
        # Use the triage workflow
        result = await triage_workflow.analyze_triage(request.answers)
        
        return TriageResponse(
            urgencyLevel=result["urgencyLevel"],
            estimatedWaitTime=result["estimatedWaitTime"],
            recommendedSpecialist=result["recommendedSpecialist"],
            immediateActions=result["immediateActions"],
            riskFactors=result["riskFactors"],
            confidence=result["confidence"],
            reasoning=result["reasoning"],
            nextSteps=result["nextSteps"]
        )
        
    except Exception as e:
        logger.error(f"Error analyzing triage: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing triage: {str(e)}")

@app.get("/ai/triage/questions")
async def get_triage_questions():
    """Get triage questions for frontend"""
    questions = [
        {
            "id": "chest_pain",
            "question": "¿Tienes dolor en el pecho?",
            "type": "yes_no",
            "required": True,
            "category": "symptoms"
        },
        {
            "id": "chest_pain_severity",
            "question": "En una escala del 1 al 10, ¿qué tan intenso es el dolor en el pecho?",
            "type": "scale",
            "scale": {"min": 1, "max": 10, "labels": ["Muy leve", "Insoportable"]},
            "required": False,
            "category": "pain"
        },
        {
            "id": "shortness_breath",
            "question": "¿Tienes dificultad para respirar?",
            "type": "yes_no",
            "required": True,
            "category": "symptoms"
        },
        {
            "id": "fever",
            "question": "¿Tienes fiebre?",
            "type": "yes_no",
            "required": True,
            "category": "symptoms"
        },
        {
            "id": "fever_temperature",
            "question": "¿Cuál es tu temperatura corporal?",
            "type": "multiple_choice",
            "options": ["Menos de 37°C", "37-38°C", "38-39°C", "39-40°C", "Más de 40°C"],
            "required": False,
            "category": "vitals"
        },
        {
            "id": "consciousness",
            "question": "¿Estás consciente y alerta?",
            "type": "yes_no",
            "required": True,
            "category": "vitals"
        },
        {
            "id": "bleeding",
            "question": "¿Tienes sangrado activo?",
            "type": "yes_no",
            "required": True,
            "category": "symptoms"
        },
        {
            "id": "age_group",
            "question": "¿En qué rango de edad te encuentras?",
            "type": "multiple_choice",
            "options": ["0-12 años", "13-17 años", "18-65 años", "65+ años"],
            "required": True,
            "category": "history"
        }
    ]
    
    return {"questions": questions}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)
