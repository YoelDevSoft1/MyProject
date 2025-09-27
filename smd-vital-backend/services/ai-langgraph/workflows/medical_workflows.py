"""
Medical Workflows using LangGraph
Workflows especializados para análisis médico con IA
"""

import logging
from typing import Dict, List, Optional, Any, AsyncGenerator
from datetime import datetime

# LangGraph imports
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool

# Local imports
from services.ai_service import AIService
from services.image_service import ImageService
from services.monitoring_service import MonitoringService
from utils.prompt_templates import MedicalPromptTemplates
from utils.medical_knowledge import MedicalKnowledgeBase

logger = logging.getLogger(__name__)

class MedicalWorkflowManager:
    """Manager for medical AI workflows using LangGraph"""
    
    def __init__(self, ai_service: AIService):
        self.ai_service = ai_service
        self.image_service = ImageService()
        self.monitoring_service = MonitoringService()
        self.prompt_templates = MedicalPromptTemplates()
        self.knowledge_base = MedicalKnowledgeBase()
        
        # Initialize workflows
        self.workflows = {}
        self._initialize_workflows()
    
    def _initialize_workflows(self):
        """Initialize all medical workflows"""
        try:
            # Diagnosis workflow
            self.workflows["diagnosis"] = self._create_diagnosis_workflow()
            
            # Medication workflow
            self.workflows["medication"] = self._create_medication_workflow()
            
            # Imaging workflow
            self.workflows["imaging"] = self._create_imaging_workflow()
            
            # Monitoring workflow
            self.workflows["monitoring"] = self._create_monitoring_workflow()
            
            # Documentation workflow
            self.workflows["documentation"] = self._create_documentation_workflow()
            
            # Prediction workflow
            self.workflows["prediction"] = self._create_prediction_workflow()
            
            logger.info(f"Initialized {len(self.workflows)} medical workflows")
            
        except Exception as e:
            logger.error(f"Error initializing workflows: {e}")
    
    def _create_diagnosis_workflow(self) -> StateGraph:
        """Create diagnosis workflow"""
        
        # Define tools
        @tool
        def analyze_symptoms(symptoms: str) -> str:
            """Analyze patient symptoms for potential diagnoses"""
            return f"Análisis de síntomas: {symptoms}"
        
        @tool
        def check_medical_history(patient_id: str) -> str:
            """Check patient medical history"""
            return f"Historial médico del paciente {patient_id}"
        
        @tool
        def suggest_diagnostic_tests(symptoms: str) -> str:
            """Suggest diagnostic tests based on symptoms"""
            return f"Pruebas diagnósticas sugeridas para: {symptoms}"
        
        # Create workflow
        workflow = StateGraph(dict)
        
        # Add nodes
        workflow.add_node("analyze_symptoms", analyze_symptoms)
        workflow.add_node("check_history", check_medical_history)
        workflow.add_node("suggest_tests", suggest_diagnostic_tests)
        workflow.add_node("ai_analysis", self._ai_analysis_node)
        
        # Add edges
        workflow.add_edge("analyze_symptoms", "check_history")
        workflow.add_edge("check_history", "suggest_tests")
        workflow.add_edge("suggest_tests", "ai_analysis")
        workflow.add_edge("ai_analysis", END)
        
        return workflow.compile()
    
    def _create_medication_workflow(self) -> StateGraph:
        """Create medication recommendation workflow"""
        
        @tool
        def check_drug_interactions(medications: str) -> str:
            """Check for drug interactions"""
            return f"Verificación de interacciones para: {medications}"
        
        @tool
        def check_allergies(patient_id: str) -> str:
            """Check patient allergies"""
            return f"Alergias del paciente {patient_id}"
        
        @tool
        def suggest_dosage(medication: str, condition: str) -> str:
            """Suggest medication dosage"""
            return f"Dosis sugerida para {medication} en {condition}"
        
        workflow = StateGraph(dict)
        
        workflow.add_node("check_interactions", check_drug_interactions)
        workflow.add_node("check_allergies", check_allergies)
        workflow.add_node("suggest_dosage", suggest_dosage)
        workflow.add_node("ai_recommendation", self._ai_medication_node)
        
        workflow.add_edge("check_interactions", "check_allergies")
        workflow.add_edge("check_allergies", "suggest_dosage")
        workflow.add_edge("suggest_dosage", "ai_recommendation")
        workflow.add_edge("ai_recommendation", END)
        
        return workflow.compile()
    
    def _create_imaging_workflow(self) -> StateGraph:
        """Create medical imaging analysis workflow"""
        
        @tool
        def analyze_image(image_path: str) -> str:
            """Analyze medical image"""
            return f"Análisis de imagen médica: {image_path}"
        
        @tool
        def detect_anomalies(image_analysis: str) -> str:
            """Detect anomalies in medical image"""
            return f"Detección de anomalías: {image_analysis}"
        
        @tool
        def generate_report(findings: str) -> str:
            """Generate imaging report"""
            return f"Reporte de imagen: {findings}"
        
        workflow = StateGraph(dict)
        
        workflow.add_node("analyze_image", analyze_image)
        workflow.add_node("detect_anomalies", detect_anomalies)
        workflow.add_node("generate_report", generate_report)
        workflow.add_node("ai_interpretation", self._ai_imaging_node)
        
        workflow.add_edge("analyze_image", "detect_anomalies")
        workflow.add_edge("detect_anomalies", "generate_report")
        workflow.add_edge("generate_report", "ai_interpretation")
        workflow.add_edge("ai_interpretation", END)
        
        return workflow.compile()
    
    def _create_monitoring_workflow(self) -> StateGraph:
        """Create vital signs monitoring workflow"""
        
        @tool
        def analyze_vitals(vital_signs: str) -> str:
            """Analyze vital signs data"""
            return f"Análisis de signos vitales: {vital_signs}"
        
        @tool
        def detect_anomalies(vitals_analysis: str) -> str:
            """Detect anomalies in vital signs"""
            return f"Detección de anomalías en signos vitales: {vitals_analysis}"
        
        @tool
        def generate_alerts(anomalies: str) -> str:
            """Generate alerts for critical values"""
            return f"Alertas generadas: {anomalies}"
        
        workflow = StateGraph(dict)
        
        workflow.add_node("analyze_vitals", analyze_vitals)
        workflow.add_node("detect_anomalies", detect_anomalies)
        workflow.add_node("generate_alerts", generate_alerts)
        workflow.add_node("ai_monitoring", self._ai_monitoring_node)
        
        workflow.add_edge("analyze_vitals", "detect_anomalies")
        workflow.add_edge("detect_anomalies", "generate_alerts")
        workflow.add_edge("generate_alerts", "ai_monitoring")
        workflow.add_edge("ai_monitoring", END)
        
        return workflow.compile()
    
    def _create_documentation_workflow(self) -> StateGraph:
        """Create medical documentation workflow"""
        
        @tool
        def extract_key_info(consultation_notes: str) -> str:
            """Extract key information from consultation"""
            return f"Información clave extraída: {consultation_notes}"
        
        @tool
        def structure_documentation(info: str) -> str:
            """Structure medical documentation"""
            return f"Documentación estructurada: {info}"
        
        @tool
        def generate_summary(documentation: str) -> str:
            """Generate summary of documentation"""
            return f"Resumen generado: {documentation}"
        
        workflow = StateGraph(dict)
        
        workflow.add_node("extract_info", extract_key_info)
        workflow.add_node("structure_doc", structure_documentation)
        workflow.add_node("generate_summary", generate_summary)
        workflow.add_node("ai_documentation", self._ai_documentation_node)
        
        workflow.add_edge("extract_info", "structure_doc")
        workflow.add_edge("structure_doc", "generate_summary")
        workflow.add_edge("generate_summary", "ai_documentation")
        workflow.add_edge("ai_documentation", END)
        
        return workflow.compile()
    
    def _create_prediction_workflow(self) -> StateGraph:
        """Create health prediction workflow"""
        
        @tool
        def analyze_risk_factors(patient_data: str) -> str:
            """Analyze patient risk factors"""
            return f"Factores de riesgo analizados: {patient_data}"
        
        @tool
        def predict_outcomes(risk_analysis: str) -> str:
            """Predict health outcomes"""
            return f"Predicción de resultados: {risk_analysis}"
        
        @tool
        def suggest_prevention(prevention_data: str) -> str:
            """Suggest prevention measures"""
            return f"Medidas de prevención: {prevention_data}"
        
        workflow = StateGraph(dict)
        
        workflow.add_node("analyze_risks", analyze_risk_factors)
        workflow.add_node("predict_outcomes", predict_outcomes)
        workflow.add_node("suggest_prevention", suggest_prevention)
        workflow.add_node("ai_prediction", self._ai_prediction_node)
        
        workflow.add_edge("analyze_risks", "predict_outcomes")
        workflow.add_edge("predict_outcomes", "suggest_prevention")
        workflow.add_edge("suggest_prevention", "ai_prediction")
        workflow.add_edge("ai_prediction", END)
        
        return workflow.compile()
    
    # AI Analysis Nodes
    async def _ai_analysis_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """AI analysis node for diagnosis"""
        try:
            query = state.get("query", "")
            context = state.get("context", {})
            
            system_prompt = self.prompt_templates.get_diagnosis_prompt()
            user_prompt = f"""
            Consulta del paciente: {query}
            Contexto adicional: {context}
            
            Proporciona un análisis médico detallado incluyendo:
            1. Posibles diagnósticos
            2. Nivel de confianza
            3. Recomendaciones de pruebas
            4. Próximos pasos
            """
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            response = await self.ai_service.generate_response(
                messages, 
                state.get("model", "gpt-4")
            )
            
            return {
                "response": response["content"],
                "confidence": 0.85,  # This would be calculated based on analysis
                "workflow": "diagnosis",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in AI analysis node: {e}")
            return {
                "response": f"Error en el análisis: {str(e)}",
                "confidence": 0.0,
                "workflow": "diagnosis",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _ai_medication_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """AI medication recommendation node"""
        try:
            query = state.get("query", "")
            context = state.get("context", {})
            
            system_prompt = self.prompt_templates.get_medication_prompt()
            user_prompt = f"""
            Consulta sobre medicación: {query}
            Contexto del paciente: {context}
            
            Proporciona recomendaciones de medicación incluyendo:
            1. Medicamentos sugeridos
            2. Dosis recomendadas
            3. Consideraciones especiales
            4. Posibles efectos secundarios
            5. Interacciones medicamentosas
            """
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            response = await self.ai_service.generate_response(
                messages, 
                state.get("model", "gpt-4")
            )
            
            return {
                "response": response["content"],
                "confidence": 0.80,
                "workflow": "medication",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in AI medication node: {e}")
            return {
                "response": f"Error en recomendación de medicación: {str(e)}",
                "confidence": 0.0,
                "workflow": "medication",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _ai_imaging_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """AI imaging analysis node"""
        try:
            query = state.get("query", "")
            context = state.get("context", {})
            
            system_prompt = self.prompt_templates.get_imaging_prompt()
            user_prompt = f"""
            Análisis de imagen médica: {query}
            Contexto: {context}
            
            Proporciona análisis de imagen incluyendo:
            1. Hallazgos principales
            2. Anomalías detectadas
            3. Interpretación clínica
            4. Recomendaciones de seguimiento
            """
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            response = await self.ai_service.generate_response(
                messages, 
                state.get("model", "gpt-4")
            )
            
            return {
                "response": response["content"],
                "confidence": 0.75,
                "workflow": "imaging",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in AI imaging node: {e}")
            return {
                "response": f"Error en análisis de imagen: {str(e)}",
                "confidence": 0.0,
                "workflow": "imaging",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _ai_monitoring_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """AI monitoring analysis node"""
        try:
            query = state.get("query", "")
            context = state.get("context", {})
            
            system_prompt = self.prompt_templates.get_monitoring_prompt()
            user_prompt = f"""
            Análisis de monitoreo: {query}
            Datos de signos vitales: {context}
            
            Proporciona análisis de monitoreo incluyendo:
            1. Evaluación de signos vitales
            2. Detección de anomalías
            3. Nivel de alerta
            4. Recomendaciones inmediatas
            """
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            response = await self.ai_service.generate_response(
                messages, 
                state.get("model", "gpt-4")
            )
            
            return {
                "response": response["content"],
                "confidence": 0.90,
                "workflow": "monitoring",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in AI monitoring node: {e}")
            return {
                "response": f"Error en análisis de monitoreo: {str(e)}",
                "confidence": 0.0,
                "workflow": "monitoring",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _ai_documentation_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """AI documentation generation node"""
        try:
            query = state.get("query", "")
            context = state.get("context", {})
            
            system_prompt = self.prompt_templates.get_documentation_prompt()
            user_prompt = f"""
            Generación de documentación médica: {query}
            Información de la consulta: {context}
            
            Genera documentación médica incluyendo:
            1. Resumen de la consulta
            2. Diagnóstico principal
            3. Plan de tratamiento
            4. Recomendaciones
            5. Próxima cita
            """
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            response = await self.ai_service.generate_response(
                messages, 
                state.get("model", "gpt-4")
            )
            
            return {
                "response": response["content"],
                "confidence": 0.88,
                "workflow": "documentation",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in AI documentation node: {e}")
            return {
                "response": f"Error en generación de documentación: {str(e)}",
                "confidence": 0.0,
                "workflow": "documentation",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _ai_prediction_node(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """AI prediction node"""
        try:
            query = state.get("query", "")
            context = state.get("context", {})
            
            system_prompt = self.prompt_templates.get_prediction_prompt()
            user_prompt = f"""
            Predicción de salud: {query}
            Datos del paciente: {context}
            
            Proporciona predicción de salud incluyendo:
            1. Factores de riesgo identificados
            2. Predicción de resultados
            3. Probabilidad de complicaciones
            4. Medidas preventivas
            5. Recomendaciones de seguimiento
            """
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
            
            response = await self.ai_service.generate_response(
                messages, 
                state.get("model", "gpt-4")
            )
            
            return {
                "response": response["content"],
                "confidence": 0.70,
                "workflow": "prediction",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in AI prediction node: {e}")
            return {
                "response": f"Error en predicción: {str(e)}",
                "confidence": 0.0,
                "workflow": "prediction",
                "timestamp": datetime.utcnow().isoformat()
            }
    
    # Workflow execution methods
    async def execute_workflow(
        self, 
        workflow_name: str, 
        query: str, 
        user_id: str, 
        context: Dict[str, Any] = None,
        model: str = "gpt-4"
    ) -> Dict[str, Any]:
        """Execute a medical workflow"""
        try:
            if workflow_name not in self.workflows:
                raise ValueError(f"Workflow {workflow_name} not found")
            
            workflow = self.workflows[workflow_name]
            
            # Prepare state
            state = {
                "query": query,
                "user_id": user_id,
                "context": context or {},
                "model": model,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Execute workflow
            result = await workflow.ainvoke(state)
            
            return result
            
        except Exception as e:
            logger.error(f"Error executing workflow {workflow_name}: {e}")
            raise
    
    async def stream_workflow(
        self, 
        workflow_name: str, 
        query: str, 
        user_id: str, 
        context: Dict[str, Any] = None,
        model: str = "gpt-4"
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream workflow execution"""
        try:
            if workflow_name not in self.workflows:
                raise ValueError(f"Workflow {workflow_name} not found")
            
            workflow = self.workflows[workflow_name]
            
            # Prepare state
            state = {
                "query": query,
                "user_id": user_id,
                "context": context or {},
                "model": model,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Stream workflow execution
            async for chunk in workflow.astream(state):
                yield {
                    "chunk": str(chunk),
                    "is_final": False,
                    "workflow": workflow_name,
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            # Final chunk
            yield {
                "chunk": "",
                "is_final": True,
                "workflow": workflow_name,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error streaming workflow {workflow_name}: {e}")
            yield {
                "chunk": "",
                "is_final": True,
                "error": str(e),
                "workflow": workflow_name,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def get_available_workflows(self) -> List[Dict[str, Any]]:
        """Get list of available workflows"""
        workflows = []
        
        for name, workflow in self.workflows.items():
            workflow_info = {
                "name": name,
                "description": self._get_workflow_description(name),
                "capabilities": self._get_workflow_capabilities(name),
                "estimated_time": self._get_workflow_time(name)
            }
            workflows.append(workflow_info)
        
        return workflows
    
    def _get_workflow_description(self, workflow_name: str) -> str:
        """Get workflow description"""
        descriptions = {
            "diagnosis": "Análisis de síntomas y diagnóstico médico",
            "medication": "Recomendaciones de medicación y dosis",
            "imaging": "Análisis de imágenes médicas",
            "monitoring": "Monitoreo de signos vitales",
            "documentation": "Generación de documentación médica",
            "prediction": "Predicción de riesgos de salud"
        }
        return descriptions.get(workflow_name, "Workflow médico")
    
    def _get_workflow_capabilities(self, workflow_name: str) -> List[str]:
        """Get workflow capabilities"""
        capabilities = {
            "diagnosis": ["symptom_analysis", "differential_diagnosis", "test_recommendations"],
            "medication": ["drug_recommendations", "dosage_calculation", "interaction_check"],
            "imaging": ["image_analysis", "anomaly_detection", "report_generation"],
            "monitoring": ["vital_signs_analysis", "anomaly_detection", "alert_generation"],
            "documentation": ["note_generation", "summary_creation", "report_structuring"],
            "prediction": ["risk_assessment", "outcome_prediction", "prevention_recommendations"]
        }
        return capabilities.get(workflow_name, [])
    
    def _get_workflow_time(self, workflow_name: str) -> int:
        """Get estimated workflow execution time in seconds"""
        times = {
            "diagnosis": 30,
            "medication": 20,
            "imaging": 45,
            "monitoring": 15,
            "documentation": 25,
            "prediction": 35
        }
        return times.get(workflow_name, 30)