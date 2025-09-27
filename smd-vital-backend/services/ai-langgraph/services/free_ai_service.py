"""
SMD VITAL - Servicio de IA Gratuito con Ollama
=============================================
Servicio que proporciona modelos de IA 100% gratuitos usando Ollama
"""

import os
import json
import asyncio
import logging
import aiohttp
from typing import Dict, List, Optional, Any, AsyncGenerator
from datetime import datetime

logger = logging.getLogger(__name__)

class FreeAIService:
    """Servicio de IA gratuito usando Ollama"""
    
    def __init__(self, ollama_base_url: str = "http://ollama:11434"):
        self.ollama_base_url = ollama_base_url
        self.available_models = [
            "llama2:latest",
            "phi:latest"
        ]
        self.default_model = "phi"  # Modelo rápido por defecto (TinyLlama tiene problemas)
        self.model_info = self._get_model_info()
    
    def _get_model_info(self) -> Dict[str, Dict]:
        """Información de los modelos disponibles - Solo los instalados y funcionando"""
        return {
            "llama2:latest": {
                "name": "Llama 2",
                "size": "7B",
                "description": "Modelo conversacional general de Meta",
                "best_for": "Conversación general, análisis médico básico",
                "memory_required": "4GB"
            },
            "phi:latest": {
                "name": "Microsoft Phi",
                "size": "3B",
                "description": "Modelo compacto y eficiente",
                "best_for": "Respuestas rápidas, consultas simples",
                "memory_required": "2GB"
            }
        }
    
    async def list_models(self) -> Dict[str, Any]:
        """Listar modelos disponibles - Solo los realmente instalados"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.ollama_base_url}/api/tags") as response:
                    if response.status == 200:
                        data = await response.json()
                        installed_models = [model["name"] for model in data.get("models", [])]
                        
                        # Filtrar solo los modelos realmente instalados
                        available_installed = [model for model in self.available_models if model in installed_models]
                        
                        return {
                            "available_models": available_installed,  # Solo los instalados
                            "installed_models": installed_models,
                            "model_info": self.model_info,
                            "recommended": {
                                "lightweight": "phi",      # Más rápido
                                "balanced": "phi",         # Cambiado a phi para velocidad
                                "advanced": "llama2:latest",  # Para casos complejos
                                "medical": "phi"           # Cambiado a phi para velocidad
                            }
                        }
                    else:
                        return {"error": "No se pudo conectar con Ollama"}
        except Exception as e:
            logger.error(f"Error listando modelos: {str(e)}")
            return {"error": f"Error conectando con Ollama: {str(e)}"}
    
    async def install_model(self, model_name: str) -> Dict[str, Any]:
        """Instalar un modelo"""
        try:
            if model_name not in self.available_models:
                return {"error": f"Modelo {model_name} no disponible"}
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.ollama_base_url}/api/pull",
                    json={"name": model_name}
                ) as response:
                    if response.status == 200:
                        return {"success": f"Modelo {model_name} instalado correctamente"}
                    else:
                        return {"error": f"Error instalando modelo {model_name}"}
        except Exception as e:
            logger.error(f"Error instalando modelo {model_name}: {str(e)}")
            return {"error": f"Error instalando modelo: {str(e)}"}
    
    async def generate_response(
        self, 
        prompt: str, 
        model: str = None,
        context: str = "",
        max_tokens: int = 500,  # Reducido para respuestas más rápidas
        temperature: float = 0.3  # Reducido para respuestas más determinísticas
    ) -> Dict[str, Any]:
        """Generar respuesta usando modelo gratuito - OPTIMIZADO PARA VELOCIDAD"""
        try:
            if not model:
                model = self.default_model
            
            # Preparar el prompt más corto y directo
            medical_prompt = self._prepare_fast_medical_prompt(prompt, context)
            
            # Configuración ULTRA EXTREMA para TinyLlama - MÁXIMA VELOCIDAD Y CONTROL
            payload = {
                "model": model,
                "prompt": medical_prompt,
                "stream": False,
                "options": {
                    "temperature": 0.0,         # MÁXIMO determinístico = instantáneo
                    "num_predict": 30,          # Respuestas MUY cortas (máximo 30 tokens)
                    "top_p": 0.3,               # MUY restrictivo para respuestas cortas
                    "top_k": 3,                 # MUY restrictivo para respuestas cortas
                    "repeat_penalty": 1.1,      # Evitar repeticiones
                    "stop": [".", "!", "?", "\n", "Usuario:", "Paciente:", "Consulta:"],  # Parar MUY rápido
                    "num_ctx": 256,             # Contexto MÍNIMO
                    "num_batch": 128,           # Batch muy pequeño
                    "num_thread": 6,            # Usar todos los CPUs
                    "num_gpu": 0,               # CPU optimizado
                    "low_vram": False,          # Usar toda la RAM disponible
                    "f16_kv": True,             # Precisión mínima para velocidad
                    "logits_all": False,        # No calcular logits
                    "vocab_only": False,        # Cargar modelo completo
                    "use_mmap": True,           # Memory mapping
                    "use_mlock": True,          # Lock en memoria
                    "numa": False,              # No NUMA
                    "embedding": False,         # No embeddings
                    "rope_freq_base": 10000,    # Configuración optimizada
                    "rope_freq_scale": 1.0,     # Configuración optimizada
                    "flash_attn": True          # Flash attention para velocidad
                }
            }
            
            # Timeout más corto para respuestas rápidas
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.ollama_base_url}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=5)   # ULTRA rápido - 5 segundos
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "response": data.get("response", ""),
                            "model_used": model,
                            "created_at": datetime.utcnow().isoformat(),
                            "tokens_used": data.get("eval_count", 0),
                            "success": True
                        }
                    else:
                        error_text = await response.text()
                        return {
                            "error": f"Error generando respuesta: {error_text}",
                            "success": False
                        }
        except asyncio.TimeoutError:
            logger.warning(f"Timeout generando respuesta con modelo {model}")
            return {
                "error": "La respuesta tardó demasiado. Intenta con una consulta más simple.",
                "success": False
            }
        except Exception as e:
            logger.error(f"Error generando respuesta: {str(e)}")
            return {
                "error": f"Error generando respuesta: {str(e)}",
                "success": False
            }
    
    async def stream_response(
        self, 
        prompt: str, 
        model: str = None,
        context: str = ""
    ) -> AsyncGenerator[str, None]:
        """Generar respuesta en streaming - OPTIMIZADO PARA VELOCIDAD"""
        try:
            if not model:
                model = self.default_model
            
            # Usar prompt optimizado para velocidad
            medical_prompt = self._prepare_fast_medical_prompt(prompt, context)
            
            # Configuración ULTRA optimizada para streaming súper rápido
            payload = {
                "model": model,
                "prompt": medical_prompt,
                "stream": True,
                "options": {
                    "temperature": 0.1,         # Muy determinístico
                    "top_p": 0.7,               # Muy reducido para velocidad
                    "top_k": 10,                # Muy reducido para velocidad
                    "num_predict": 150,         # Respuestas muy cortas
                    "repeat_penalty": 1.05,     # Mínimo para velocidad
                    "stop": ["\n\n", "Usuario:", "Paciente:", ".", "!", "?"],
                    "num_ctx": 1024,            # Contexto reducido
                    "num_batch": 512,           # Batch optimizado
                    "num_thread": 8,            # Usar más threads
                    "num_gpu": 0,               # CPU optimizado
                    "low_vram": False,          # Usar toda la RAM disponible
                    "f16_kv": True,             # Usar precisión reducida para velocidad
                    "logits_all": False,        # No calcular todos los logits
                    "vocab_only": False,        # Cargar modelo completo
                    "use_mmap": True,           # Usar memory mapping
                    "use_mlock": True,          # Lock en memoria
                    "numa": False,              # No usar NUMA
                    "embedding": False          # No calcular embeddings
                }
            }
            
            # Timeout más corto para streaming
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.ollama_base_url}/api/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=15)  # Súper rápido - 15 segundos
                ) as response:
                    if response.status == 200:
                        async for line in response.content:
                            if line:
                                try:
                                    data = json.loads(line.decode('utf-8'))
                                    if "response" in data:
                                        yield data["response"]
                                    if data.get("done", False):
                                        break
                                except json.JSONDecodeError:
                                    continue
                    else:
                        yield f"Error: {response.status}"
        except asyncio.TimeoutError:
            logger.warning(f"Timeout en streaming con modelo {model}")
            yield "La respuesta tardó demasiado. Intenta con una consulta más simple."
        except Exception as e:
            logger.error(f"Error en streaming: {str(e)}")
            yield f"Error: {str(e)}"
    
    def _prepare_medical_prompt(self, prompt: str, context: str = "") -> str:
        """Preparar prompt con contexto médico"""
        medical_system_prompt = """Eres un asistente médico virtual especializado en el sistema SMD VITAL. 
        Proporcionas información médica general, análisis de síntomas, y recomendaciones de salud.
        
        IMPORTANTE: 
        - Siempre aclara que no reemplazas la consulta médica profesional
        - Recomienda consultar con un médico para diagnósticos definitivos
        - Proporciona información basada en evidencia médica
        - Sé preciso y responsable en tus respuestas
        
        Responde en español de manera clara y profesional."""
        
        if context:
            return f"{medical_system_prompt}\n\nContexto del paciente: {context}\n\nConsulta: {prompt}"
        else:
            return f"{medical_system_prompt}\n\nConsulta: {prompt}"
    
    def _prepare_fast_medical_prompt(self, prompt: str, context: str = "") -> str:
        """Preparar prompt médico ULTRA optimizado para velocidad máxima - MÍNIMO ABSOLUTO"""
        # Prompt ULTRA corto para respuestas instantáneas
        medical_system_prompt = """Eres un asistente médico. Responde en español de forma breve y directa. No reemplazas consulta médica. Máximo 2 oraciones."""
        
        if context:
            return f"{medical_system_prompt}\nContexto: {context}\nConsulta: {prompt}"
        else:
            return f"{medical_system_prompt}\nConsulta: {prompt}"
    
    async def get_model_status(self, model: str) -> Dict[str, Any]:
        """Obtener estado de un modelo específico"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.ollama_base_url}/api/tags") as response:
                    if response.status == 200:
                        data = await response.json()
                        installed_models = [m["name"] for m in data.get("models", [])]
                        
                        if model in installed_models:
                            return {
                                "model": model,
                                "status": "installed",
                                "available": True,
                                "info": self.model_info.get(model, {})
                            }
                        else:
                            return {
                                "model": model,
                                "status": "not_installed", 
                                "available": model in self.available_models,
                                "info": self.model_info.get(model, {})
                            }
                    else:
                        return {"error": "No se pudo verificar el estado del modelo"}
        except Exception as e:
            return {"error": f"Error verificando modelo: {str(e)}"}
    
    async def health_check(self) -> Dict[str, Any]:
        """Verificar salud del servicio de IA gratuito"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.ollama_base_url}/api/tags") as response:
                    if response.status == 200:
                        data = await response.json()
                        installed_models = len(data.get("models", []))
                        
                        return {
                            "status": "healthy",
                            "ollama_connected": True,
                            "installed_models": installed_models,
                            "available_models": len(self.available_models),
                            "default_model": self.default_model
                        }
                    else:
                        return {
                            "status": "unhealthy",
                            "ollama_connected": False,
                            "error": f"Ollama responded with status {response.status}"
                        }
        except Exception as e:
            return {
                "status": "unhealthy", 
                "ollama_connected": False,
                "error": str(e)
            }
