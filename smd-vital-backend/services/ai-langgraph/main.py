"""
SMD VITAL AI LangGraph Service
Servicio de IA médica con LangGraph para análisis y diagnóstico
"""

import os
import json
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

# LangGraph and LangChain imports
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_community.llms import Ollama

# AI Model providers
import openai
import anthropic

# Local imports
from models.database import get_db, AIQuery, AISession, AIWorkflow
from workflows.medical_workflows import MedicalWorkflowManager
from services.ai_service import AIService
from services.image_service import ImageService
from services.monitoring_service import MonitoringService
from utils.prompt_templates import MedicalPromptTemplates
from utils.medical_knowledge import MedicalKnowledgeBase

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://smdvital:smdvital123@postgres:5432/smdvital_ai")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")

# Pydantic models
class AIQueryRequest(BaseModel):
    query: str = Field(..., description="Consulta médica del usuario")
    user_id: str = Field(..., description="ID del usuario")
    workflow: str = Field(default="diagnosis", description="Workflow de IA a utilizar")
    model: str = Field(default="gpt-4", description="Modelo de IA a utilizar")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Contexto adicional")
    session_id: Optional[str] = Field(default=None, description="ID de sesión existente")

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

# Global services
ai_service: Optional[AIService] = None
workflow_manager: Optional[MedicalWorkflowManager] = None
image_service: Optional[ImageService] = None
monitoring_service: Optional[MonitoringService] = None
prompt_templates: Optional[MedicalPromptTemplates] = None
knowledge_base: Optional[MedicalKnowledgeBase] = None

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
    global ai_service, workflow_manager, image_service, monitoring_service, prompt_templates, knowledge_base
    
    try:
        # Initialize services
        ai_service = AIService(
            openai_api_key=OPENAI_API_KEY,
            anthropic_api_key=ANTHROPIC_API_KEY,
            ollama_base_url=OLLAMA_BASE_URL
        )
        
        workflow_manager = MedicalWorkflowManager(ai_service)
        image_service = ImageService()
        monitoring_service = MonitoringService()
        prompt_templates = MedicalPromptTemplates()
        knowledge_base = MedicalKnowledgeBase()
        
        logger.info("AI LangGraph Service initialized successfully")
        yield
        
    except Exception as e:
        logger.error(f"Failed to initialize AI service: {e}")
        raise
    finally:
        logger.info("AI LangGraph Service shutting down")

# Create FastAPI app
app = FastAPI(
    title="SMD VITAL AI LangGraph Service",
    description="Servicio de IA médica con LangGraph para análisis y diagnóstico",
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
        "service": "ai-langgraph",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

# AI Query endpoints
@app.post("/ai/query", response_model=AIQueryResponse)
async def process_ai_query(
    request: AIQueryRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Process AI query using LangGraph workflows"""
    try:
        if not ai_service or not workflow_manager:
            raise HTTPException(status_code=503, detail="AI service not initialized")
        
        start_time = datetime.utcnow()
        
        # Get or create session
        session_id = request.session_id
        if not session_id:
            session = AISession(
                user_id=request.user_id,
                created_at=start_time
            )
            db.add(session)
            await db.commit()
            await db.refresh(session)
            session_id = str(session.id)
        
        # Process query with workflow
        result = await workflow_manager.execute_workflow(
            workflow_name=request.workflow,
            query=request.query,
            user_id=request.user_id,
            context=request.context or {},
            model=request.model
        )
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Save query to database
        query_record = AIQuery(
            session_id=session_id,
            query_text=request.query,
            response_text=result["response"],
            confidence_score=result.get("confidence", 0.0),
            processing_time=processing_time,
            model_used=request.model,
            workflow_used=request.workflow,
            created_at=start_time
        )
        db.add(query_record)
        await db.commit()
        await db.refresh(query_record)
        
        return AIQueryResponse(
            query_id=str(query_record.id),
            response=result["response"],
            confidence=result.get("confidence", 0.0),
            processing_time=processing_time,
            model_used=request.model,
            workflow_used=request.workflow,
            timestamp=start_time
        )
        
    except Exception as e:
        logger.error(f"Error processing AI query: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.post("/ai/query/stream")
async def stream_ai_query(
    request: AIQueryRequest,
    db: AsyncSession = Depends(get_db)
):
    """Stream AI query response using Server-Sent Events"""
    try:
        if not ai_service or not workflow_manager:
            raise HTTPException(status_code=503, detail="AI service not initialized")
        
        async def generate_stream():
            query_id = None
            try:
                # Get or create session
                session_id = request.session_id
                if not session_id:
                    session = AISession(
                        user_id=request.user_id,
                        created_at=datetime.utcnow()
                    )
                    db.add(session)
                    await db.commit()
                    await db.refresh(session)
                    session_id = str(session.id)
                
                # Stream workflow execution
                async for chunk in workflow_manager.stream_workflow(
                    workflow_name=request.workflow,
                    query=request.query,
                    user_id=request.user_id,
                    context=request.context or {},
                    model=request.model
                ):
                    if chunk.get("query_id"):
                        query_id = chunk["query_id"]
                    
                    yield {
                        "event": "chunk",
                        "data": json.dumps({
                            "query_id": query_id,
                            "chunk": chunk.get("chunk", ""),
                            "is_final": chunk.get("is_final", False),
                            "confidence": chunk.get("confidence")
                        })
                    }
                
                # Save final query to database
                if query_id:
                    query_record = AIQuery(
                        session_id=session_id,
                        query_text=request.query,
                        response_text=chunk.get("response", ""),
                        confidence_score=chunk.get("confidence", 0.0),
                        processing_time=chunk.get("processing_time", 0.0),
                        model_used=request.model,
                        workflow_used=request.workflow,
                        created_at=datetime.utcnow()
                    )
                    db.add(query_record)
                    await db.commit()
                    
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
        model = message.get("model", "gpt-4")
        
        if not ai_service or not workflow_manager:
            await manager.send_personal_message(
                json.dumps({"error": "AI service not available"}), 
                user_id
            )
            return
        
        # Stream response back to WebSocket
        async for chunk in workflow_manager.stream_workflow(
            workflow_name=workflow,
            query=query,
            user_id=user_id,
            context={},
            model=model
        ):
            await manager.send_personal_message(
                json.dumps({
                    "type": "chunk",
                    "chunk": chunk.get("chunk", ""),
                    "is_final": chunk.get("is_final", False),
                    "confidence": chunk.get("confidence")
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
    if not workflow_manager:
        raise HTTPException(status_code=503, detail="Workflow manager not initialized")
    
    workflows = await workflow_manager.get_available_workflows()
    return {"workflows": workflows}

@app.get("/ai/models")
async def get_models():
    """Get available AI models"""
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service not initialized")
    
    models = await ai_service.get_available_models()
    return {"models": models}

@app.post("/ai/workflows/{workflow_name}/execute")
async def execute_workflow(
    workflow_name: str,
    config: WorkflowConfig,
    db: AsyncSession = Depends(get_db)
):
    """Execute a specific workflow with configuration"""
    try:
        if not workflow_manager:
            raise HTTPException(status_code=503, detail="Workflow manager not initialized")
        
        result = await workflow_manager.execute_workflow(
            workflow_name=workflow_name,
            query=config.parameters.get("query", ""),
            user_id=config.parameters.get("user_id", ""),
            context=config.parameters.get("context", {}),
            model=config.parameters.get("model", "gpt-4")
        )
        
        return {"result": result}
        
    except Exception as e:
        logger.error(f"Error executing workflow {workflow_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Error executing workflow: {str(e)}")

# Medical-specific endpoints
@app.post("/ai/medical/diagnosis")
async def get_medical_diagnosis(
    request: AIQueryRequest,
    db: AsyncSession = Depends(get_db)
):
    """Get medical diagnosis using AI"""
    request.workflow = "diagnosis"
    return await process_ai_query(request, BackgroundTasks(), db)

@app.post("/ai/medical/medication")
async def get_medication_recommendation(
    request: AIQueryRequest,
    db: AsyncSession = Depends(get_db)
):
    """Get medication recommendation using AI"""
    request.workflow = "medication"
    return await process_ai_query(request, BackgroundTasks(), db)

@app.post("/ai/medical/imaging")
async def analyze_medical_image(
    request: AIQueryRequest,
    db: AsyncSession = Depends(get_db)
):
    """Analyze medical image using AI"""
    request.workflow = "imaging"
    return await process_ai_query(request, BackgroundTasks(), db)

@app.post("/ai/medical/monitoring")
async def analyze_vital_signs(
    request: AIQueryRequest,
    db: AsyncSession = Depends(get_db)
):
    """Analyze vital signs using AI"""
    request.workflow = "monitoring"
    return await process_ai_query(request, BackgroundTasks(), db)

@app.post("/ai/medical/documentation")
async def generate_medical_documentation(
    request: AIQueryRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate medical documentation using AI"""
    request.workflow = "documentation"
    return await process_ai_query(request, BackgroundTasks(), db)

@app.post("/ai/medical/prediction")
async def predict_health_risks(
    request: AIQueryRequest,
    db: AsyncSession = Depends(get_db)
):
    """Predict health risks using AI"""
    request.workflow = "prediction"
    return await process_ai_query(request, BackgroundTasks(), db)

# Session management
@app.get("/ai/sessions/{user_id}")
async def get_user_sessions(
    user_id: str,
    limit: int = 10,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Get user AI sessions"""
    try:
        result = await db.execute(
            text("""
                SELECT s.id, s.created_at, s.updated_at,
                       COUNT(q.id) as query_count,
                       AVG(q.confidence_score) as avg_confidence
                FROM ai_sessions s
                LEFT JOIN ai_queries q ON s.id = q.session_id
                WHERE s.user_id = :user_id
                GROUP BY s.id, s.created_at, s.updated_at
                ORDER BY s.created_at DESC
                LIMIT :limit OFFSET :offset
            """),
            {"user_id": user_id, "limit": limit, "offset": offset}
        )
        
        sessions = []
        for row in result:
            sessions.append({
                "id": str(row.id),
                "created_at": row.created_at.isoformat(),
                "updated_at": row.updated_at.isoformat() if row.updated_at else None,
                "query_count": row.query_count,
                "avg_confidence": float(row.avg_confidence) if row.avg_confidence else 0.0
            })
        
        return {"sessions": sessions}
        
    except Exception as e:
        logger.error(f"Error getting user sessions: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting sessions: {str(e)}")

@app.get("/ai/queries/{query_id}")
async def get_query_result(
    query_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get specific query result"""
    try:
        result = await db.execute(
            text("""
                SELECT q.*, s.user_id
                FROM ai_queries q
                JOIN ai_sessions s ON q.session_id = s.id
                WHERE q.id = :query_id
            """),
            {"query_id": query_id}
        )
        
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Query not found")
        
        return {
            "id": str(row.id),
            "query_text": row.query_text,
            "response_text": row.response_text,
            "confidence_score": float(row.confidence_score),
            "processing_time": float(row.processing_time),
            "model_used": row.model_used,
            "workflow_used": row.workflow_used,
            "created_at": row.created_at.isoformat(),
            "user_id": row.user_id
        }
        
    except Exception as e:
        logger.error(f"Error getting query result: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting query: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)