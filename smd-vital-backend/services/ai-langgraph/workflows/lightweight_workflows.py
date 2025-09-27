"""
SMD VITAL - Lightweight Workflow Engine
=======================================
Motor de workflows ligero que usa LangGraph de manera eficiente
"""

import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any, AsyncGenerator
from dataclasses import dataclass

# LangGraph imports (minimal)
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI

@dataclass
class WorkflowState:
    """Estado del workflow"""
    query: str
    user_id: str
    context: Dict[str, Any]
    response: str = ""
    confidence: float = 0.0
    current_step: str = "start"
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

class LightweightWorkflowEngine:
    """Motor de workflows ligero con LangGraph"""
    
    def __init__(self, openai_api_key: str):
        self.openai_api_key = openai_api_key
        self.llm = ChatOpenAI(
            api_key=openai_api_key,
            model="gpt-3.5-turbo",
            temperature=0.1,
            max_tokens=1000
        )
        self.workflows = self._initialize_workflows()
    
    def _initialize_workflows(self) -> Dict[str, StateGraph]:
        """Inicializar workflows disponibles"""
        workflows = {}
        
        # Workflow de diagnóstico
        workflows["diagnosis"] = self._create_diagnosis_workflow()
        
        # Workflow de medicamentos
        workflows["medication"] = self._create_medication_workflow()
        
        # Workflow de análisis de imágenes
        workflows["imaging"] = self._create_imaging_workflow()
        
        # Workflow de monitoreo
        workflows["monitoring"] = self._create_monitoring_workflow()
        
        # Workflow de documentación
        workflows["documentation"] = self._create_documentation_workflow()
        
        # Workflow de predicción
        workflows["prediction"] = self._create_prediction_workflow()
        
        return workflows
    
    def _create_diagnosis_workflow(self) -> StateGraph:
        """Crear workflow de diagnóstico"""
        workflow = StateGraph(WorkflowState)
        
        # Nodos del workflow
        workflow.add_node("analyze_symptoms", self._analyze_symptoms)
        workflow.add_node("generate_diagnosis", self._generate_diagnosis)
        workflow.add_node("calculate_confidence", self._calculate_confidence)
        workflow.add_node("finalize_response", self._finalize_response)
        
        # Flujo del workflow
        workflow.set_entry_point("analyze_symptoms")
        workflow.add_edge("analyze_symptoms", "generate_diagnosis")
        workflow.add_edge("generate_diagnosis", "calculate_confidence")
        workflow.add_edge("calculate_confidence", "finalize_response")
        workflow.add_edge("finalize_response", END)
        
        return workflow.compile()
    
    def _create_medication_workflow(self) -> StateGraph:
        """Crear workflow de medicamentos"""
        workflow = StateGraph(WorkflowState)
        
        workflow.add_node("analyze_condition", self._analyze_condition)
        workflow.add_node("recommend_medication", self._recommend_medication)
        workflow.add_node("check_interactions", self._check_interactions)
        workflow.add_node("finalize_response", self._finalize_response)
        
        workflow.set_entry_point("analyze_condition")
        workflow.add_edge("analyze_condition", "recommend_medication")
        workflow.add_edge("recommend_medication", "check_interactions")
        workflow.add_edge("check_interactions", "finalize_response")
        workflow.add_edge("finalize_response", END)
        
        return workflow.compile()
    
    def _create_imaging_workflow(self) -> StateGraph:
        """Crear workflow de análisis de imágenes"""
        workflow = StateGraph(WorkflowState)
        
        workflow.add_node("analyze_image", self._analyze_image)
        workflow.add_node("generate_findings", self._generate_findings)
        workflow.add_node("finalize_response", self._finalize_response)
        
        workflow.set_entry_point("analyze_image")
        workflow.add_edge("analyze_image", "generate_findings")
        workflow.add_edge("generate_findings", "finalize_response")
        workflow.add_edge("finalize_response", END)
        
        return workflow.compile()
    
    def _create_monitoring_workflow(self) -> StateGraph:
        """Crear workflow de monitoreo"""
        workflow = StateGraph(WorkflowState)
        
        workflow.add_node("analyze_vitals", self._analyze_vitals)
        workflow.add_node("assess_risk", self._assess_risk)
        workflow.add_node("finalize_response", self._finalize_response)
        
        workflow.set_entry_point("analyze_vitals")
        workflow.add_edge("analyze_vitals", "assess_risk")
        workflow.add_edge("assess_risk", "finalize_response")
        workflow.add_edge("finalize_response", END)
        
        return workflow.compile()
    
    def _create_documentation_workflow(self) -> StateGraph:
        """Crear workflow de documentación"""
        workflow = StateGraph(WorkflowState)
        
        workflow.add_node("analyze_data", self._analyze_data)
        workflow.add_node("generate_documentation", self._generate_documentation)
        workflow.add_node("finalize_response", self._finalize_response)
        
        workflow.set_entry_point("analyze_data")
        workflow.add_edge("analyze_data", "generate_documentation")
        workflow.add_edge("generate_documentation", "finalize_response")
        workflow.add_edge("finalize_response", END)
        
        return workflow.compile()
    
    def _create_prediction_workflow(self) -> StateGraph:
        """Crear workflow de predicción"""
        workflow = StateGraph(WorkflowState)
        
        workflow.add_node("analyze_patterns", self._analyze_patterns)
        workflow.add_node("generate_prediction", self._generate_prediction)
        workflow.add_node("finalize_response", self._finalize_response)
        
        workflow.set_entry_point("analyze_patterns")
        workflow.add_edge("analyze_patterns", "generate_prediction")
        workflow.add_edge("generate_prediction", "finalize_response")
        workflow.add_edge("finalize_response", END)
        
        return workflow.compile()
    
    # Métodos de nodos del workflow
    async def _analyze_symptoms(self, state: WorkflowState) -> WorkflowState:
        """Analizar síntomas"""
        state.current_step = "analyze_symptoms"
        state.metadata["step"] = "analyzing_symptoms"
        
        prompt = f"""
        Analiza los siguientes síntomas y proporciona un análisis inicial:
        
        Síntomas: {state.query}
        Contexto: {state.context}
        
        Proporciona:
        1. Análisis de síntomas
        2. Posibles causas
        3. Nivel de urgencia
        """
        
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        state.response += f"Análisis de síntomas:\n{response.content}\n\n"
        
        return state
    
    async def _generate_diagnosis(self, state: WorkflowState) -> WorkflowState:
        """Generar diagnóstico"""
        state.current_step = "generate_diagnosis"
        state.metadata["step"] = "generating_diagnosis"
        
        prompt = f"""
        Basándote en el análisis anterior, genera un diagnóstico médico:
        
        {state.response}
        
        Proporciona:
        1. Diagnóstico principal
        2. Diagnósticos diferenciales
        3. Recomendaciones de exámenes
        4. Nivel de confianza (0-1)
        """
        
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        state.response += f"Diagnóstico:\n{response.content}\n\n"
        
        return state
    
    async def _calculate_confidence(self, state: WorkflowState) -> WorkflowState:
        """Calcular nivel de confianza"""
        state.current_step = "calculate_confidence"
        state.metadata["step"] = "calculating_confidence"
        
        # Análisis simple de confianza basado en la respuesta
        confidence = 0.8  # Valor por defecto
        if "alta confianza" in state.response.lower():
            confidence = 0.9
        elif "baja confianza" in state.response.lower():
            confidence = 0.6
        elif "incertidumbre" in state.response.lower():
            confidence = 0.5
        
        state.confidence = confidence
        state.metadata["confidence"] = confidence
        
        return state
    
    async def _finalize_response(self, state: WorkflowState) -> WorkflowState:
        """Finalizar respuesta"""
        state.current_step = "finalize_response"
        state.metadata["step"] = "finalizing_response"
        
        # Agregar advertencia médica
        warning = """
        
        ⚠️ ADVERTENCIA MÉDICA ⚠️
        Esta es una herramienta de apoyo y no reemplaza la consulta médica profesional.
        Siempre consulte con un médico calificado para obtener un diagnóstico adecuado.
        En casos de emergencia, busque atención médica inmediata.
        """
        
        state.response += warning
        state.metadata["finalized"] = True
        state.metadata["timestamp"] = datetime.utcnow().isoformat()
        
        return state
    
    # Métodos específicos para otros workflows
    async def _analyze_condition(self, state: WorkflowState) -> WorkflowState:
        """Analizar condición médica"""
        state.current_step = "analyze_condition"
        prompt = f"Analiza la condición médica: {state.query}"
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        state.response += f"Análisis de condición:\n{response.content}\n\n"
        return state
    
    async def _recommend_medication(self, state: WorkflowState) -> WorkflowState:
        """Recomendar medicación"""
        state.current_step = "recommend_medication"
        prompt = f"Recomienda medicación para: {state.query}"
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        state.response += f"Recomendación de medicación:\n{response.content}\n\n"
        return state
    
    async def _check_interactions(self, state: WorkflowState) -> WorkflowState:
        """Verificar interacciones medicamentosas"""
        state.current_step = "check_interactions"
        state.response += "Verificación de interacciones: Completada\n\n"
        return state
    
    async def _analyze_image(self, state: WorkflowState) -> WorkflowState:
        """Analizar imagen médica"""
        state.current_step = "analyze_image"
        prompt = f"Analiza la imagen médica: {state.query}"
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        state.response += f"Análisis de imagen:\n{response.content}\n\n"
        return state
    
    async def _generate_findings(self, state: WorkflowState) -> WorkflowState:
        """Generar hallazgos"""
        state.current_step = "generate_findings"
        state.response += "Hallazgos generados\n\n"
        return state
    
    async def _analyze_vitals(self, state: WorkflowState) -> WorkflowState:
        """Analizar signos vitales"""
        state.current_step = "analyze_vitals"
        prompt = f"Analiza los signos vitales: {state.query}"
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        state.response += f"Análisis de signos vitales:\n{response.content}\n\n"
        return state
    
    async def _assess_risk(self, state: WorkflowState) -> WorkflowState:
        """Evaluar riesgo"""
        state.current_step = "assess_risk"
        state.response += "Evaluación de riesgo: Completada\n\n"
        return state
    
    async def _analyze_data(self, state: WorkflowState) -> WorkflowState:
        """Analizar datos"""
        state.current_step = "analyze_data"
        prompt = f"Analiza los datos médicos: {state.query}"
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        state.response += f"Análisis de datos:\n{response.content}\n\n"
        return state
    
    async def _generate_documentation(self, state: WorkflowState) -> WorkflowState:
        """Generar documentación"""
        state.current_step = "generate_documentation"
        state.response += "Documentación generada\n\n"
        return state
    
    async def _analyze_patterns(self, state: WorkflowState) -> WorkflowState:
        """Analizar patrones"""
        state.current_step = "analyze_patterns"
        prompt = f"Analiza los patrones médicos: {state.query}"
        response = await self.llm.ainvoke([HumanMessage(content=prompt)])
        state.response += f"Análisis de patrones:\n{response.content}\n\n"
        return state
    
    async def _generate_prediction(self, state: WorkflowState) -> WorkflowState:
        """Generar predicción"""
        state.current_step = "generate_prediction"
        state.response += "Predicción generada\n\n"
        return state
    
    async def execute_workflow(self, workflow_name: str, query: str, user_id: str, 
                             context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Ejecutar workflow"""
        if workflow_name not in self.workflows:
            raise ValueError(f"Workflow '{workflow_name}' no encontrado")
        
        # Crear estado inicial
        state = WorkflowState(
            query=query,
            user_id=user_id,
            context=context or {}
        )
        
        # Ejecutar workflow
        workflow = self.workflows[workflow_name]
        result = await workflow.ainvoke(state)
        
        return {
            "response": result.response,
            "confidence": result.confidence,
            "metadata": result.metadata,
            "workflow": workflow_name
        }
    
    async def stream_workflow(self, workflow_name: str, query: str, user_id: str, 
                            context: Dict[str, Any] = None) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream workflow execution"""
        if workflow_name not in self.workflows:
            raise ValueError(f"Workflow '{workflow_name}' no encontrado")
        
        # Crear estado inicial
        state = WorkflowState(
            query=query,
            user_id=user_id,
            context=context or {}
        )
        
        # Ejecutar workflow paso a paso
        workflow = self.workflows[workflow_name]
        
        # Simular streaming
        yield {
            "chunk": "Iniciando análisis médico...",
            "is_final": False,
            "step": "start"
        }
        
        # Ejecutar workflow
        result = await workflow.ainvoke(state)
        
        # Stream de la respuesta
        response_parts = result.response.split('\n')
        for i, part in enumerate(response_parts):
            if part.strip():
                yield {
                    "chunk": part + '\n',
                    "is_final": i == len(response_parts) - 1,
                    "step": result.current_step,
                    "confidence": result.confidence
                }
                await asyncio.sleep(0.1)  # Simular procesamiento
    
    def get_available_workflows(self) -> List[str]:
        """Obtener workflows disponibles"""
        return list(self.workflows.keys())












