"""
SMD VITAL - Triage Workflow con LangGraph
=========================================
Flujo de trabajo inteligente para clasificación de urgencia médica
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass

# LangGraph imports
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI

@dataclass
class TriageState:
    """Estado del triage"""
    answers: Dict[str, Any]
    urgency_score: int = 0
    risk_factors: List[str] = None
    immediate_actions: List[str] = None
    recommended_specialist: str = "Medicina General"
    reasoning: str = ""
    confidence: float = 0.0
    current_step: str = "start"
    
    def __post_init__(self):
        if self.risk_factors is None:
            self.risk_factors = []
        if self.immediate_actions is None:
            self.immediate_actions = []

class TriageWorkflow:
    """Workflow de triage inteligente"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.1,
            max_tokens=1000
        )
        self.workflow = self._build_workflow()
    
    def _build_workflow(self) -> StateGraph:
        """Construir el workflow de triage"""
        workflow = StateGraph(TriageState)
        
        # Agregar nodos
        workflow.add_node("analyze_critical_symptoms", self._analyze_critical_symptoms)
        workflow.add_node("evaluate_vital_signs", self._evaluate_vital_signs)
        workflow.add_node("assess_risk_factors", self._assess_risk_factors)
        workflow.add_node("calculate_urgency", self._calculate_urgency)
        workflow.add_node("generate_recommendations", self._generate_recommendations)
        workflow.add_node("finalize_triage", self._finalize_triage)
        
        # Definir flujo
        workflow.set_entry_point("analyze_critical_symptoms")
        workflow.add_edge("analyze_critical_symptoms", "evaluate_vital_signs")
        workflow.add_edge("evaluate_vital_signs", "assess_risk_factors")
        workflow.add_edge("assess_risk_factors", "calculate_urgency")
        workflow.add_edge("calculate_urgency", "generate_recommendations")
        workflow.add_edge("generate_recommendations", "finalize_triage")
        workflow.add_edge("finalize_triage", END)
        
        return workflow.compile()
    
    async def _analyze_critical_symptoms(self, state: TriageState) -> TriageState:
        """Analizar síntomas críticos"""
        state.current_step = "analyze_critical_symptoms"
        
        critical_symptoms = [
            'chest_pain', 'shortness_breath', 'consciousness', 
            'bleeding', 'severe_headache', 'abdominal_pain'
        ]
        
        for symptom in critical_symptoms:
            if state.answers.get(symptom) == True:
                state.urgency_score += self._get_symptom_weight(symptom)
                state.risk_factors.append(self._get_symptom_description(symptom))
        
        # Analizar severidad del dolor
        if state.answers.get('chest_pain_severity', 0) >= 8:
            state.urgency_score += 2
            state.risk_factors.append("Dolor en el pecho severo")
        
        return state
    
    async def _evaluate_vital_signs(self, state: TriageState) -> TriageState:
        """Evaluar signos vitales"""
        state.current_step = "evaluate_vital_signs"
        
        # Evaluar fiebre
        if state.answers.get('fever') == True:
            state.urgency_score += 1
            temp = state.answers.get('fever_temperature', '')
            if 'Más de 40°C' in temp:
                state.urgency_score += 2
                state.risk_factors.append("Fiebre alta (>40°C)")
            elif '39-40°C' in temp:
                state.urgency_score += 1
                state.risk_factors.append("Fiebre moderada (39-40°C)")
        
        # Evaluar edad
        age_group = state.answers.get('age_group', '')
        if age_group in ['0-12 años', '65+ años']:
            state.urgency_score += 1
            state.risk_factors.append("Grupo de edad de riesgo")
        
        return state
    
    async def _assess_risk_factors(self, state: TriageState) -> TriageState:
        """Evaluar factores de riesgo adicionales"""
        state.current_step = "assess_risk_factors"
        
        # Trauma reciente
        if state.answers.get('recent_trauma') == True:
            state.urgency_score += 2
            state.risk_factors.append("Trauma reciente")
        
        # Duración del dolor
        pain_duration = state.answers.get('pain_duration', '')
        if pain_duration == 'Menos de 1 hora' and state.urgency_score > 0:
            state.urgency_score += 1
            state.risk_factors.append("Dolor de inicio súbito")
        
        # Embarazo
        if state.answers.get('pregnancy') == True:
            state.urgency_score += 1
            state.risk_factors.append("Embarazo")
        
        return state
    
    async def _calculate_urgency(self, state: TriageState) -> TriageState:
        """Calcular nivel de urgencia"""
        state.current_step = "calculate_urgency"
        
        if state.urgency_score >= 8:
            state.urgency_level = "critical"
            state.estimated_wait_time = "Inmediato (0-15 min)"
            state.confidence = 0.95
        elif state.urgency_score >= 5:
            state.urgency_level = "high"
            state.estimated_wait_time = "Urgente (15-60 min)"
            state.confidence = 0.85
        elif state.urgency_score >= 3:
            state.urgency_level = "medium"
            state.estimated_wait_time = "Prioritario (1-4 horas)"
            state.confidence = 0.75
        else:
            state.urgency_level = "low"
            state.estimated_wait_time = "Rutinario (4-24 horas)"
            state.confidence = 0.65
        
        return state
    
    async def _generate_recommendations(self, state: TriageState) -> TriageState:
        """Generar recomendaciones"""
        state.current_step = "generate_recommendations"
        
        # Determinar especialista recomendado
        if 'chest_pain' in state.risk_factors or 'Dolor en el pecho' in state.risk_factors:
            state.recommended_specialist = "Cardiología"
        elif 'shortness_breath' in state.risk_factors or 'Dificultad respiratoria' in state.risk_factors:
            state.recommended_specialist = "Neumología"
        elif 'consciousness' in state.risk_factors or 'Alteración del estado de conciencia' in state.risk_factors:
            state.recommended_specialist = "Neurología"
        elif 'abdominal_pain' in state.risk_factors or 'Dolor abdominal' in state.risk_factors:
            state.recommended_specialist = "Gastroenterología"
        elif state.answers.get('pregnancy') == True:
            state.recommended_specialist = "Ginecología"
        else:
            state.recommended_specialist = "Medicina General"
        
        # Generar acciones inmediatas
        state.immediate_actions = self._get_immediate_actions(state.urgency_level, state.risk_factors)
        
        return state
    
    async def _finalize_triage(self, state: TriageState) -> TriageState:
        """Finalizar triage y generar razonamiento"""
        state.current_step = "finalize_triage"
        
        # Generar razonamiento con IA
        reasoning_prompt = f"""
        Analiza el siguiente caso de triage y genera un razonamiento médico profesional:
        
        Respuestas del paciente: {json.dumps(state.answers, indent=2)}
        Factores de riesgo identificados: {', '.join(state.risk_factors)}
        Nivel de urgencia: {state.urgency_level}
        Especialista recomendado: {state.recommended_specialist}
        
        Genera un razonamiento conciso (máximo 200 palabras) que explique:
        1. Por qué se clasificó con este nivel de urgencia
        2. Los factores más importantes que influyeron en la decisión
        3. La justificación para el especialista recomendado
        """
        
        try:
            messages = [
                SystemMessage(content="Eres un médico experto en triage. Genera razonamientos médicos profesionales y concisos."),
                HumanMessage(content=reasoning_prompt)
            ]
            response = await self.llm.ainvoke(messages)
            state.reasoning = response.content
        except Exception as e:
            state.reasoning = self._generate_fallback_reasoning(state)
        
        return state
    
    def _get_symptom_weight(self, symptom: str) -> int:
        """Obtener peso del síntoma"""
        weights = {
            'chest_pain': 3,
            'shortness_breath': 3,
            'consciousness': 5,
            'bleeding': 2,
            'severe_headache': 2,
            'abdominal_pain': 2
        }
        return weights.get(symptom, 1)
    
    def _get_symptom_description(self, symptom: str) -> str:
        """Obtener descripción del síntoma"""
        descriptions = {
            'chest_pain': 'Dolor en el pecho',
            'shortness_breath': 'Dificultad respiratoria',
            'consciousness': 'Alteración del estado de conciencia',
            'bleeding': 'Sangrado activo',
            'severe_headache': 'Dolor de cabeza severo',
            'abdominal_pain': 'Dolor abdominal'
        }
        return descriptions.get(symptom, symptom)
    
    def _get_immediate_actions(self, urgency_level: str, risk_factors: List[str]) -> List[str]:
        """Obtener acciones inmediatas basadas en urgencia"""
        actions = []
        
        if urgency_level == "critical":
            actions.extend([
                "Buscar atención médica de emergencia inmediatamente",
                "Llamar al servicio de emergencias (911)",
                "No conducir al hospital"
            ])
        elif urgency_level == "high":
            actions.extend([
                "Acudir al servicio de urgencias",
                "Informar al personal médico sobre los síntomas",
                "Llevar lista de medicamentos actuales"
            ])
        elif urgency_level == "medium":
            actions.extend([
                "Programar cita médica prioritaria",
                "Monitorear síntomas y cambios",
                "Preparar información médica relevante"
            ])
        else:
            actions.extend([
                "Programar cita médica de rutina",
                "Mantener registro de síntomas",
                "Seguir recomendaciones de cuidado general"
            ])
        
        return actions
    
    def _generate_fallback_reasoning(self, state: TriageState) -> str:
        """Generar razonamiento de respaldo"""
        return f"""
        El análisis de triage indica un nivel de urgencia {state.urgency_level} basado en los siguientes factores: 
        {', '.join(state.risk_factors)}. 
        Se recomienda consultar con {state.recommended_specialist} y seguir las acciones inmediatas indicadas.
        """
    
    async def analyze_triage(self, answers: Dict[str, Any]) -> Dict[str, Any]:
        """Analizar triage completo"""
        try:
            # Crear estado inicial
            state = TriageState(answers=answers)
            
            # Ejecutar workflow
            result = await self.workflow.ainvoke(state)
            
            # Generar próximos pasos
            next_steps = self._generate_next_steps(result.urgency_level, result.recommended_specialist)
            
            return {
                "urgencyLevel": result.urgency_level,
                "estimatedWaitTime": result.estimated_wait_time,
                "recommendedSpecialist": result.recommended_specialist,
                "immediateActions": result.immediate_actions,
                "riskFactors": result.risk_factors,
                "confidence": result.confidence,
                "reasoning": result.reasoning,
                "nextSteps": next_steps
            }
            
        except Exception as e:
            print(f"Error en análisis de triage: {e}")
            # Fallback a análisis básico
            return self._fallback_analysis(answers)
    
    def _generate_next_steps(self, urgency_level: str, specialist: str) -> List[str]:
        """Generar próximos pasos"""
        steps = []
        
        if urgency_level == "critical":
            steps.extend([
                "Buscar atención médica de emergencia inmediatamente",
                "Llamar al servicio de emergencias (911)",
                "No conducir al hospital"
            ])
        elif urgency_level == "high":
            steps.extend([
                "Acudir al servicio de urgencias",
                "Informar al personal médico sobre los síntomas",
                "Llevar lista de medicamentos actuales"
            ])
        elif urgency_level == "medium":
            steps.extend([
                "Programar cita médica prioritaria",
                "Monitorear síntomas y cambios",
                "Preparar información médica relevante"
            ])
        else:
            steps.extend([
                "Programar cita médica de rutina",
                "Mantener registro de síntomas",
                "Seguir recomendaciones de cuidado general"
            ])
        
        steps.extend([
            f"Consultar con especialista en {specialist}",
            "Seguir las recomendaciones médicas",
            "Mantener comunicación con el equipo médico"
        ])
        
        return steps
    
    def _fallback_analysis(self, answers: Dict[str, Any]) -> Dict[str, Any]:
        """Análisis de respaldo si falla el workflow"""
        urgency_score = 0
        risk_factors = []
        
        # Análisis básico
        if answers.get('chest_pain') == True:
            urgency_score += 3
            risk_factors.append('Dolor en el pecho')
        
        if answers.get('shortness_breath') == True:
            urgency_score += 3
            risk_factors.append('Dificultad respiratoria')
        
        if answers.get('consciousness') == False:
            urgency_score += 5
            risk_factors.append('Alteración del estado de conciencia')
        
        # Determinar urgencia
        if urgency_score >= 8:
            urgency_level = "critical"
            estimated_wait_time = "Inmediato (0-15 min)"
            confidence = 0.95
        elif urgency_score >= 5:
            urgency_level = "high"
            estimated_wait_time = "Urgente (15-60 min)"
            confidence = 0.85
        elif urgency_score >= 3:
            urgency_level = "medium"
            estimated_wait_time = "Prioritario (1-4 horas)"
            confidence = 0.75
        else:
            urgency_level = "low"
            estimated_wait_time = "Rutinario (4-24 horas)"
            confidence = 0.65
        
        return {
            "urgencyLevel": urgency_level,
            "estimatedWaitTime": estimated_wait_time,
            "recommendedSpecialist": "Medicina General",
            "immediateActions": ["Consultar con un profesional médico"],
            "riskFactors": risk_factors,
            "confidence": confidence,
            "reasoning": "Análisis básico de triage realizado",
            "nextSteps": ["Consultar con un profesional médico"]
        }

# Instancia global del workflow
triage_workflow = TriageWorkflow()












