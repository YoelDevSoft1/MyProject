"""
SMD VITAL - AI Medical Service with LangGraph
============================================
Servicio de IA médica usando LangGraph para workflows complejos de diagnóstico,
recomendación de medicamentos, análisis de imágenes y monitoreo de signos vitales.
"""

import os
import json
import asyncio
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import uuid

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# LangGraph imports
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_community.llms import Ollama

# Local imports
from schemas.ai_schemas import *
from models.ai_models import *
from workflows.diagnosis_workflow import DiagnosisWorkflow
from workflows.medication_workflow import MedicationWorkflow
from workflows.imaging_workflow import ImagingWorkflow
from workflows.monitoring_workflow import MonitoringWorkflow
from utils.ai_utils import AIUtils
from database.ai_database import AIDatabase

app = FastAPI(
    title="SMD VITAL AI Medical Service",
    description="Servicio de IA médica con LangGraph para workflows complejos",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
ai_db = AIDatabase()
ai_utils = AIUtils()

# Initialize workflows
diagnosis_workflow = DiagnosisWorkflow()
medication_workflow = MedicationWorkflow()
imaging_workflow = ImagingWorkflow()
monitoring_workflow = MonitoringWorkflow()

# Pydantic models for API
class AIQueryRequest(BaseModel):
    query: str = Field(..., description="Consulta médica del usuario")
    tool_type: str = Field(..., description="Tipo de herramienta de IA")
    patient_id: Optional[str] = Field(None, description="ID del paciente")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Contexto adicional")
    user_id: str = Field(..., description="ID del usuario que hace la consulta")

class AIQueryResponse(BaseModel):
    query_id: str
    response: str
    confidence: float
    tool_used: str
    processing_time: float
    timestamp: datetime
    suggestions: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

class WorkflowStatus(BaseModel):
    workflow_id: str
    status: str
    current_step: str
    progress: float
    estimated_completion: Optional[datetime] = None

# Dependency to get current user
async def get_current_user(user_id: str = "default_user"):
    return user_id

@app.on_event("startup")
async def startup_event():
    """Initialize AI service on startup"""
    await ai_db.initialize()
    print("🤖 SMD VITAL AI Medical Service initialized with LangGraph")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "SMD VITAL AI Medical Service",
        "timestamp": datetime.utcnow(),
        "langgraph_version": "0.0.20"
    }

@app.get("/ai/tools")
async def get_ai_tools():
    """Get available AI tools and their status"""
    tools = [
        {
            "id": "diagnosis",
            "name": "Asistente de Diagnóstico SMD VITAL",
            "description": "Analiza síntomas y sugiere posibles diagnósticos usando LangGraph",
            "status": "active",
            "capabilities": [
                "Análisis de síntomas",
                "Diferencial diagnóstico",
                "Recomendaciones de exámenes",
                "Nivel de urgencia"
            ],
            "workflow_steps": 5
        },
        {
            "id": "medication",
            "name": "Recomendador de Medicamentos SMD VITAL",
            "description": "Sugiere medicamentos basados en síntomas y alergias usando LangGraph",
            "status": "active",
            "capabilities": [
                "Recomendación de medicamentos",
                "Verificación de alergias",
                "Interacciones medicamentosas",
                "Dosificación personalizada"
            ],
            "workflow_steps": 4
        },
        {
            "id": "imaging",
            "name": "Analizador de Imágenes SMD VITAL",
            "description": "Analiza radiografías, tomografías y resonancias usando LangGraph",
            "status": "active",
            "capabilities": [
                "Análisis de radiografías",
                "Detección de anomalías",
                "Comparación temporal",
                "Recomendaciones de seguimiento"
            ],
            "workflow_steps": 6
        },
        {
            "id": "monitoring",
            "name": "Monitor de Signos Vitales SMD VITAL",
            "description": "Monitorea y analiza signos vitales en tiempo real usando LangGraph",
            "status": "active",
            "capabilities": [
                "Análisis de signos vitales",
                "Detección de alertas",
                "Tendencias temporales",
                "Predicción de riesgos"
            ],
            "workflow_steps": 3
        }
    ]
    return {"tools": tools, "total": len(tools)}

@app.post("/ai/query", response_model=AIQueryResponse)
async def process_ai_query(
    request: AIQueryRequest,
    background_tasks: BackgroundTasks,
    current_user: str = Depends(get_current_user)
):
    """Process AI query using LangGraph workflows"""
    start_time = datetime.utcnow()
    query_id = str(uuid.uuid4())
    
    try:
        # Validate tool type
        valid_tools = ["diagnosis", "medication", "imaging", "monitoring"]
        if request.tool_type not in valid_tools:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid tool type. Must be one of: {valid_tools}"
            )
        
        # Process query based on tool type
        if request.tool_type == "diagnosis":
            result = await diagnosis_workflow.process_query(
                query=request.query,
                context=request.context,
                patient_id=request.patient_id
            )
        elif request.tool_type == "medication":
            result = await medication_workflow.process_query(
                query=request.query,
                context=request.context,
                patient_id=request.patient_id
            )
        elif request.tool_type == "imaging":
            result = await imaging_workflow.process_query(
                query=request.query,
                context=request.context,
                patient_id=request.patient_id
            )
        elif request.tool_type == "monitoring":
            result = await monitoring_workflow.process_query(
                query=request.query,
                context=request.context,
                patient_id=request.patient_id
            )
        
        # Calculate processing time
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Save query to database
        background_tasks.add_task(
            ai_db.save_query,
            query_id=query_id,
            user_id=current_user,
            tool_type=request.tool_type,
            query=request.query,
            response=result["response"],
            confidence=result["confidence"],
            processing_time=processing_time
        )
        
        return AIQueryResponse(
            query_id=query_id,
            response=result["response"],
            confidence=result["confidence"],
            tool_used=request.tool_type,
            processing_time=processing_time,
            timestamp=datetime.utcnow(),
            suggestions=result.get("suggestions", []),
            warnings=result.get("warnings", [])
        )
        
    except Exception as e:
        print(f"Error processing AI query: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing AI query: {str(e)}"
        )

@app.get("/ai/queries/history")
async def get_query_history(
    user_id: str = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0
):
    """Get AI query history for user"""
    try:
        queries = await ai_db.get_query_history(
            user_id=user_id,
            limit=limit,
            offset=offset
        )
        return {"queries": queries, "total": len(queries)}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving query history: {str(e)}"
        )

@app.get("/ai/workflows/{workflow_id}/status")
async def get_workflow_status(workflow_id: str):
    """Get status of a specific workflow"""
    try:
        status = await ai_db.get_workflow_status(workflow_id)
        if not status:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return status
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving workflow status: {str(e)}"
        )

@app.post("/ai/workflows/{workflow_type}/start")
async def start_workflow(
    workflow_type: str,
    request: AIQueryRequest,
    current_user: str = Depends(get_current_user)
):
    """Start a new workflow"""
    try:
        workflow_id = str(uuid.uuid4())
        
        # Start workflow based on type
        if workflow_type == "diagnosis":
            await diagnosis_workflow.start_workflow(
                workflow_id=workflow_id,
                query=request.query,
                context=request.context,
                patient_id=request.patient_id
            )
        elif workflow_type == "medication":
            await medication_workflow.start_workflow(
                workflow_id=workflow_id,
                query=request.query,
                context=request.context,
                patient_id=request.patient_id
            )
        elif workflow_type == "imaging":
            await imaging_workflow.start_workflow(
                workflow_id=workflow_id,
                query=request.query,
                context=request.context,
                patient_id=request.patient_id
            )
        elif workflow_type == "monitoring":
            await monitoring_workflow.start_workflow(
                workflow_id=workflow_id,
                query=request.query,
                context=request.context,
                patient_id=request.patient_id
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid workflow type: {workflow_type}"
            )
        
        return {
            "workflow_id": workflow_id,
            "status": "started",
            "message": f"Workflow {workflow_type} started successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error starting workflow: {str(e)}"
        )

@app.get("/ai/analytics")
async def get_ai_analytics():
    """Get AI service analytics"""
    try:
        analytics = await ai_db.get_analytics()
        return analytics
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving analytics: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8008,
        reload=True,
        log_level="info"
    )


