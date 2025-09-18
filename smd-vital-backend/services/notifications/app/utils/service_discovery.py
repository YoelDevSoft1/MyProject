# app/utils/service_discovery.py
import requests
import time
from typing import Dict, Optional
from ..config import Config

class ServiceRegistry:
    """
    Registro de servicios para descubrimiento dinámico de microservicios.
    """
    
    def __init__(self):
        self.config = Config()
        self.services = {
            'auth': self.config.AUTH_SERVICE_URL,
            'user': self.config.USER_SERVICE_URL,
            'appointment': self.config.APPOINTMENT_SERVICE_URL,
            'notification': self.config.NOTIFICATION_SERVICE_URL,
            'medical_records': self.config.MEDICAL_RECORDS_SERVICE_URL,
            'payment': self.config.PAYMENT_SERVICE_URL,
        }
        self.health_cache = {}
        self.cache_ttl = 30  # 30 segundos

    def get_service_url(self, service_name: str) -> Optional[str]:
        """
        Obtiene la URL de un servicio por nombre.
        """
        return self.services.get(service_name)

    def is_service_healthy(self, service_name: str) -> bool:
        """
        Verifica si un servicio está saludable usando cache.
        """
        current_time = time.time()
        
        # Verificar cache
        if service_name in self.health_cache:
            cached_time, is_healthy = self.health_cache[service_name]
            if current_time - cached_time < self.cache_ttl:
                return is_healthy
        
        # Verificar salud del servicio
        service_url = self.get_service_url(service_name)
        if not service_url:
            return False
        
        try:
            response = requests.get(f"{service_url}/health", timeout=5)
            is_healthy = response.status_code == 200
        except:
            is_healthy = False
        
        # Actualizar cache
        self.health_cache[service_name] = (current_time, is_healthy)
        return is_healthy

    def get_healthy_services(self) -> Dict[str, str]:
        """
        Obtiene todos los servicios saludables.
        """
        healthy_services = {}
        for service_name, service_url in self.services.items():
            if self.is_service_healthy(service_name):
                healthy_services[service_name] = service_url
        return healthy_services
