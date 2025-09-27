"""
SMD VITAL - AI Service (Simplified)
==================================
Servicio de IA médica simplificado sin LangGraph
"""

import os
import json
import uuid
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import asyncpg
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# AI imports
import openai
import anthropic

# Configuración
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://smdvital:smdvital_password_2024@postgres:5432/smdvital_ai")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Modelos Pydantic
class AIQueryRequest(BaseModel):
    query_type: str = Field(..., description="Tipo de consulta: diagnosis, medication, imaging, monitoring, documentation, prediction")
    query_text: str = Field(..., description="Texto de la consulta")
    query_data: Optional[Dict[str, Any]] = Field(None, description="Datos adicionales")
    session_id: Optional[str] = Field(None, description="ID de sesión")
    user_id: str = Field(..., description="ID del usuario")
    context: Optional[Dict[str, Any]] = Field(None, description="Contexto adicional")

class AIQueryResponse(BaseModel):
    query_id: str
    response_text: str
    confidence_score: Optional[float] = None
    response_data: Optional[Dict[str, Any]] = None
    model_used: str
    processing_time_ms: int
    status: str

# Estado global para WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_sessions: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.user_sessions[user_id] = websocket

    def disconnect(self, websocket: WebSocket, user_id: str):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id in self.user_sessions:
            del self.user_sessions[user_id]

    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.user_sessions:
            await self.user_sessions[user_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Inicialización de servicios
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Iniciando SMD VITAL AI Service...")
    
    # Configurar APIs de IA
    if os.getenv("OPENAI_API_KEY"):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        print("✅ OpenAI configurado")
    
    if os.getenv("ANTHROPIC_API_KEY"):
        print("✅ Anthropic configurado")
    
    print("✅ Servicio de IA inicializado correctamente")
    
    yield
    
    # Shutdown
    print("🛑 Cerrando SMD VITAL AI Service...")

# Crear aplicación FastAPI
app = FastAPI(
    title="SMD VITAL AI Service",
    description="Servicio de IA médica simplificado",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints principales
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "SMD VITAL AI Service",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.post("/ai/query", response_model=AIQueryResponse)
async def process_ai_query(
    request: AIQueryRequest,
    background_tasks: BackgroundTasks
):
    """Procesar consulta de IA"""
    try:
        # Generar ID de consulta
        query_id = str(uuid.uuid4())
        session_id = request.session_id or str(uuid.uuid4())
        
        # Procesar con IA
        start_time = datetime.utcnow()
        
        # Seleccionar modelo basado en el tipo de consulta
        model = "gpt-3.5-turbo"  # Modelo por defecto
        
        # Generar respuesta usando OpenAI
        if os.getenv("OPENAI_API_KEY"):
            try:
                response = await generate_openai_response(request.query_text, request.query_type, model)
                response_text = response
                confidence_score = 0.85
            except Exception as e:
                response_text = f"Error procesando con OpenAI: {str(e)}"
                confidence_score = 0.0
        else:
            response_text = "Servicio de IA no configurado. Por favor, configure las claves de API."
            confidence_score = 0.0
        
        end_time = datetime.utcnow()
        processing_time = int((end_time - start_time).total_seconds() * 1000)
        
        # Crear respuesta
        response = AIQueryResponse(
            query_id=query_id,
            response_text=response_text,
            confidence_score=confidence_score,
            response_data={"query_type": request.query_type},
            model_used=model,
            processing_time_ms=processing_time,
            status="completed"
        )
        
        return response
        
    except Exception as e:
        print(f"Error procesando consulta de IA: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando consulta: {str(e)}")

async def generate_openai_response(query_text: str, query_type: str, model: str) -> str:
    """Generar respuesta usando OpenAI"""
    try:
        # Construir prompt médico
        medical_prompt = build_medical_prompt(query_text, query_type)
        
        # Llamar a OpenAI
        client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "Eres un asistente médico especializado de SMD VITAL. Proporciona respuestas precisas, basadas en evidencia y siempre con la advertencia de consultar con un profesional médico."},
                {"role": "user", "content": medical_prompt}
            ],
            max_tokens=1000,
            temperature=0.1
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"Error generando respuesta: {str(e)}"

def build_medical_prompt(query_text: str, query_type: str) -> str:
    """Construir prompt médico especializado"""
    base_prompt = f"""
    Eres un asistente médico especializado de SMD VITAL. 
    Proporciona respuestas precisas, basadas en evidencia y siempre con la advertencia de consultar con un profesional médico.
    
    Tipo de consulta: {query_type}
    Consulta: {query_text}
    """
    
    # Agregar instrucciones específicas por tipo
    if query_type == "diagnosis":
        base_prompt += """
        
        Para diagnóstico:
        - Analiza los síntomas presentados
        - Proporciona diagnóstico diferencial
        - Incluye nivel de confianza
        - Recomienda exámenes adicionales
        - Indica cuándo buscar atención urgente
        """
    elif query_type == "medication":
        base_prompt += """
        
        Para medicamentos:
        - Recomienda medicamentos apropiados
        - Verifica interacciones medicamentosas
        - Calcula dosificaciones
        - Considera alergias y contraindicaciones
        - Incluye efectos secundarios
        """
    elif query_type == "imaging":
        base_prompt += """
        
        Para análisis de imágenes:
        - Describe hallazgos observados
        - Proporciona interpretación clínica
        - Sugiere diagnósticos diferenciales
        - Recomienda estudios adicionales
        - Indica urgencia de hallazgos
        """
    
    base_prompt += """
    
    IMPORTANTE: 
    - Esta es una herramienta de apoyo, no reemplaza la consulta médica
    - Siempre recomienda consultar con un profesional médico
    - En casos de emergencia, dirigir al servicio de urgencias
    - Mantén confidencialidad y profesionalismo
    """
    
    return base_prompt

@app.get("/ai/workflows")
async def list_workflows():
    """Listar workflows disponibles"""
    workflows = [
        "diagnosis_workflow",
        "medication_workflow", 
        "imaging_workflow",
        "monitoring_workflow",
        "documentation_workflow",
        "prediction_workflow"
    ]
    return {"workflows": workflows}

@app.get("/ai/models")
async def list_models():
    """Listar modelos de IA disponibles"""
    models = []
    
    if os.getenv("OPENAI_API_KEY"):
        models.extend([
            {"name": "gpt-3.5-turbo", "provider": "openai", "type": "text"},
            {"name": "gpt-4", "provider": "openai", "type": "text"},
            {"name": "gpt-4-vision", "provider": "openai", "type": "multimodal"}
        ])
    
    if os.getenv("ANTHROPIC_API_KEY"):
        models.extend([
            {"name": "claude-3-sonnet", "provider": "anthropic", "type": "text"},
            {"name": "claude-3-haiku", "provider": "anthropic", "type": "text"}
        ])
    
    if not models:
        models = [{"name": "demo-model", "provider": "demo", "type": "text"}]
    
    return {"models": models}

@app.websocket("/ai/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket para consultas de IA en tiempo real"""
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Procesar mensaje
            if message.get("type") == "query":
                # Procesar consulta
                query_request = AIQueryRequest(**message.get("data", {}))
                
                # Generar respuesta
                if os.getenv("OPENAI_API_KEY"):
                    response_text = await generate_openai_response(
                        query_request.query_text, 
                        query_request.query_type, 
                        "gpt-3.5-turbo"
                    )
                else:
                    response_text = "Servicio de IA no configurado"
                
                await websocket.send_text(json.dumps({
                    "type": "response",
                    "content": response_text,
                    "metadata": {"query_type": query_request.query_type}
                }))
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

if __name__ == "__main__":
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=8008,
        reload=True,
        log_level="info"
    )


