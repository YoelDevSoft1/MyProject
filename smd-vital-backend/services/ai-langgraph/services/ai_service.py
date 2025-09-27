"""
AI Service - Core AI functionality for medical applications
"""

import os
import logging
from typing import Dict, List, Optional, Any, AsyncGenerator
from datetime import datetime

# LangChain imports
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_community.llms import Ollama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

# AI providers
import openai
import anthropic

logger = logging.getLogger(__name__)

class AIService:
    """Core AI service for medical applications"""
    
    def __init__(self, openai_api_key: str, anthropic_api_key: str, ollama_base_url: str):
        self.openai_api_key = openai_api_key
        self.anthropic_api_key = anthropic_api_key
        self.ollama_base_url = ollama_base_url
        
        # Initialize models
        self.models = {}
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize AI models"""
        try:
            # OpenAI models
            if self.openai_api_key:
                self.models["gpt-4"] = ChatOpenAI(
                    model="gpt-4",
                    api_key=self.openai_api_key,
                    temperature=0.1
                )
                self.models["gpt-3.5-turbo"] = ChatOpenAI(
                    model="gpt-3.5-turbo",
                    api_key=self.openai_api_key,
                    temperature=0.1
                )
                self.models["gpt-4-turbo"] = ChatOpenAI(
                    model="gpt-4-turbo-preview",
                    api_key=self.openai_api_key,
                    temperature=0.1
                )
            
            # Anthropic models
            if self.anthropic_api_key:
                self.models["claude-3-opus"] = ChatAnthropic(
                    model="claude-3-opus-20240229",
                    api_key=self.anthropic_api_key,
                    temperature=0.1
                )
                self.models["claude-3-sonnet"] = ChatAnthropic(
                    model="claude-3-sonnet-20240229",
                    api_key=self.anthropic_api_key,
                    temperature=0.1
                )
                self.models["claude-3-haiku"] = ChatAnthropic(
                    model="claude-3-haiku-20240307",
                    api_key=self.anthropic_api_key,
                    temperature=0.1
                )
            
            # Ollama models (local)
            self.models["llama2"] = Ollama(
                model="llama2",
                base_url=self.ollama_base_url,
                temperature=0.1
            )
            self.models["codellama"] = Ollama(
                model="codellama",
                base_url=self.ollama_base_url,
                temperature=0.1
            )
            self.models["medllama"] = Ollama(
                model="medllama",
                base_url=self.ollama_base_url,
                temperature=0.1
            )
            
            logger.info(f"Initialized {len(self.models)} AI models")
            
        except Exception as e:
            logger.error(f"Error initializing AI models: {e}")
    
    async def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available AI models"""
        models = []
        
        for name, model in self.models.items():
            model_info = {
                "name": name,
                "provider": self._get_provider(name),
                "capabilities": self._get_capabilities(name),
                "max_tokens": self._get_max_tokens(name),
                "cost_per_token": self._get_cost_per_token(name)
            }
            models.append(model_info)
        
        return models
    
    def _get_provider(self, model_name: str) -> str:
        """Get model provider"""
        if model_name.startswith("gpt"):
            return "openai"
        elif model_name.startswith("claude"):
            return "anthropic"
        else:
            return "ollama"
    
    def _get_capabilities(self, model_name: str) -> List[str]:
        """Get model capabilities"""
        capabilities = ["text_generation", "medical_analysis"]
        
        if model_name in ["gpt-4", "gpt-4-turbo", "claude-3-opus", "claude-3-sonnet"]:
            capabilities.extend(["reasoning", "complex_analysis", "multimodal"])
        
        if model_name.startswith("gpt-4") or model_name.startswith("claude-3"):
            capabilities.append("function_calling")
        
        return capabilities
    
    def _get_max_tokens(self, model_name: str) -> int:
        """Get maximum tokens for model"""
        token_limits = {
            "gpt-3.5-turbo": 4096,
            "gpt-4": 8192,
            "gpt-4-turbo": 128000,
            "claude-3-haiku": 200000,
            "claude-3-sonnet": 200000,
            "claude-3-opus": 200000,
            "llama2": 4096,
            "codellama": 4096,
            "medllama": 4096
        }
        return token_limits.get(model_name, 4096)
    
    def _get_cost_per_token(self, model_name: str) -> float:
        """Get cost per token for model (approximate)"""
        costs = {
            "gpt-3.5-turbo": 0.0000015,
            "gpt-4": 0.00003,
            "gpt-4-turbo": 0.00001,
            "claude-3-haiku": 0.00000025,
            "claude-3-sonnet": 0.000003,
            "claude-3-opus": 0.000015,
            "llama2": 0.0,  # Local model
            "codellama": 0.0,  # Local model
            "medllama": 0.0  # Local model
        }
        return costs.get(model_name, 0.0)
    
    async def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        model_name: str = "gpt-4",
        temperature: float = 0.1,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """Generate AI response"""
        try:
            if model_name not in self.models:
                raise ValueError(f"Model {model_name} not available")
            
            model = self.models[model_name]
            
            # Convert messages to LangChain format
            langchain_messages = []
            for msg in messages:
                if msg["role"] == "system":
                    langchain_messages.append(SystemMessage(content=msg["content"]))
                elif msg["role"] == "user":
                    langchain_messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    langchain_messages.append(AIMessage(content=msg["content"]))
            
            # Generate response
            response = await model.ainvoke(langchain_messages)
            
            return {
                "content": response.content,
                "model": model_name,
                "timestamp": datetime.utcnow().isoformat(),
                "tokens_used": self._estimate_tokens(messages, response.content)
            }
            
        except Exception as e:
            logger.error(f"Error generating response with {model_name}: {e}")
            raise
    
    async def stream_response(
        self, 
        messages: List[Dict[str, str]], 
        model_name: str = "gpt-4",
        temperature: float = 0.1
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream AI response"""
        try:
            if model_name not in self.models:
                raise ValueError(f"Model {model_name} not available")
            
            model = self.models[model_name]
            
            # Convert messages to LangChain format
            langchain_messages = []
            for msg in messages:
                if msg["role"] == "system":
                    langchain_messages.append(SystemMessage(content=msg["content"]))
                elif msg["role"] == "user":
                    langchain_messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    langchain_messages.append(AIMessage(content=msg["content"]))
            
            # Stream response
            full_response = ""
            async for chunk in model.astream(langchain_messages):
                if hasattr(chunk, 'content') and chunk.content:
                    full_response += chunk.content
                    yield {
                        "chunk": chunk.content,
                        "is_final": False,
                        "model": model_name,
                        "timestamp": datetime.utcnow().isoformat()
                    }
            
            # Final chunk
            yield {
                "chunk": "",
                "is_final": True,
                "model": model_name,
                "full_response": full_response,
                "tokens_used": self._estimate_tokens(messages, full_response),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error streaming response with {model_name}: {e}")
            yield {
                "chunk": "",
                "is_final": True,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def _estimate_tokens(self, messages: List[Dict[str, str]], response: str) -> int:
        """Estimate token count (rough approximation)"""
        total_text = ""
        for msg in messages:
            total_text += msg["content"] + " "
        total_text += response
        
        # Rough estimation: 1 token ≈ 4 characters
        return len(total_text) // 4
    
    async def analyze_medical_text(
        self, 
        text: str, 
        analysis_type: str = "general",
        model_name: str = "gpt-4"
    ) -> Dict[str, Any]:
        """Analyze medical text"""
        system_prompt = f"""
        Eres un asistente médico especializado en análisis de texto médico.
        Analiza el siguiente texto y proporciona un análisis detallado.
        
        Tipo de análisis: {analysis_type}
        
        Proporciona:
        1. Resumen del contenido médico
        2. Identificación de síntomas, diagnósticos o tratamientos mencionados
        3. Nivel de urgencia (bajo, medio, alto)
        4. Recomendaciones generales
        5. Confianza en el análisis (0-1)
        """
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text}
        ]
        
        response = await self.generate_response(messages, model_name)
        
        return {
            "analysis": response["content"],
            "analysis_type": analysis_type,
            "model_used": model_name,
            "confidence": 0.8,  # This would be calculated based on model response
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def generate_medical_recommendations(
        self, 
        patient_data: Dict[str, Any], 
        model_name: str = "gpt-4"
    ) -> Dict[str, Any]:
        """Generate medical recommendations based on patient data"""
        system_prompt = """
        Eres un médico especialista que analiza datos del paciente y proporciona recomendaciones médicas.
        
        Analiza los datos del paciente y proporciona:
        1. Evaluación de la condición actual
        2. Recomendaciones de tratamiento
        3. Próximos pasos sugeridos
        4. Nivel de prioridad
        5. Consideraciones especiales
        """
        
        user_prompt = f"""
        Datos del paciente:
        {json.dumps(patient_data, indent=2)}
        
        Proporciona recomendaciones médicas basadas en esta información.
        """
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        response = await self.generate_response(messages, model_name)
        
        return {
            "recommendations": response["content"],
            "patient_data": patient_data,
            "model_used": model_name,
            "timestamp": datetime.utcnow().isoformat()
        }