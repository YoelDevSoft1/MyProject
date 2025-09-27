"""
SMD Vital - Service Discovery
============================

Sistema de descubrimiento de servicios para microservicios
con health checks y balanceo de carga.
"""

import time
import json
import redis
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import requests
import threading
from concurrent.futures import ThreadPoolExecutor

@dataclass
class ServiceInstance:
    """Instancia de un servicio"""
    name: str
    host: str
    port: int
    health_endpoint: str
    last_health_check: datetime
    is_healthy: bool
    response_time: float
    metadata: Dict[str, Any] = None

class ServiceRegistry:
    """Registro de servicios con health checks"""
    
    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.redis_client = redis_client or redis.Redis(host='redis', port=6379, db=1)
        self.services: Dict[str, List[ServiceInstance]] = {}
        self.health_check_interval = 30  # segundos
        self.health_check_timeout = 5  # segundos
        self.running = False
        self.health_check_thread = None
        
        # Configuración de servicios por defecto
        self.default_services = {
            'user-service': [
                {'host': 'user-service', 'port': 8002, 'health_endpoint': '/health'}
            ],
            'appointment-service': [
                {'host': 'appointment-service', 'port': 8003, 'health_endpoint': '/health'}
            ],
            'notification-service': [
                {'host': 'notification-service', 'port': 8004, 'health_endpoint': '/health'}
            ],
            'medical-records-service': [
                {'host': 'medical-records-service', 'port': 8005, 'health_endpoint': '/health'}
            ],
            'payment-service': [
                {'host': 'payment-service', 'port': 8006, 'health_endpoint': '/health'}
            ],
            'auth-service': [
                {'host': 'auth-service', 'port': 8001, 'health_endpoint': '/health'}
            ]
        }
        
        self._initialize_services()
    
    def _initialize_services(self):
        """Inicializar servicios con configuración por defecto"""
        for service_name, instances in self.default_services.items():
            self.services[service_name] = []
            for instance_config in instances:
                instance = ServiceInstance(
                    name=service_name,
                    host=instance_config['host'],
                    port=instance_config['port'],
                    health_endpoint=instance_config['health_endpoint'],
                    last_health_check=datetime.utcnow(),
                    is_healthy=False,
                    response_time=0.0,
                    metadata=instance_config.get('metadata', {})
                )
                self.services[service_name].append(instance)
    
    def register_service(self, service_name: str, host: str, port: int, 
                        health_endpoint: str = '/health', metadata: Dict = None):
        """Registrar un nuevo servicio"""
        if service_name not in self.services:
            self.services[service_name] = []
        
        instance = ServiceInstance(
            name=service_name,
            host=host,
            port=port,
            health_endpoint=health_endpoint,
            last_health_check=datetime.utcnow(),
            is_healthy=False,
            response_time=0.0,
            metadata=metadata or {}
        )
        
        self.services[service_name].append(instance)
        self._save_to_redis()
    
    def unregister_service(self, service_name: str, host: str, port: int):
        """Desregistrar un servicio"""
        if service_name in self.services:
            self.services[service_name] = [
                instance for instance in self.services[service_name]
                if not (instance.host == host and instance.port == port)
            ]
            self._save_to_redis()
    
    def get_healthy_instances(self, service_name: str) -> List[ServiceInstance]:
        """Obtener instancias saludables de un servicio"""
        if service_name not in self.services:
            return []
        
        return [
            instance for instance in self.services[service_name]
            if instance.is_healthy
        ]
    
    def get_best_instance(self, service_name: str) -> Optional[ServiceInstance]:
        """Obtener la mejor instancia de un servicio (menor tiempo de respuesta)"""
        healthy_instances = self.get_healthy_instances(service_name)
        
        if not healthy_instances:
            return None
        
        # Retornar la instancia con menor tiempo de respuesta
        return min(healthy_instances, key=lambda x: x.response_time)
    
    def get_service_url(self, service_name: str, endpoint: str = '') -> Optional[str]:
        """Obtener URL completa de un servicio"""
        instance = self.get_best_instance(service_name)
        
        if not instance:
            return None
        
        return f"http://{instance.host}:{instance.port}{endpoint}"
    
    def check_service_health(self, instance: ServiceInstance) -> bool:
        """Verificar salud de una instancia de servicio"""
        try:
            url = f"http://{instance.host}:{instance.port}{instance.health_endpoint}"
            start_time = time.time()
            
            response = requests.get(
                url, 
                timeout=self.health_check_timeout,
                headers={'User-Agent': 'SMD-Vital-Health-Check/1.0'}
            )
            
            response_time = time.time() - start_time
            
            # Actualizar instancia
            instance.last_health_check = datetime.utcnow()
            instance.response_time = response_time
            instance.is_healthy = response.status_code == 200
            
            return instance.is_healthy
            
        except Exception:
            instance.last_health_check = datetime.utcnow()
            instance.is_healthy = False
            instance.response_time = 0.0
            return False
    
    def health_check_all_services(self):
        """Verificar salud de todos los servicios"""
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = []
            
            for service_name, instances in self.services.items():
                for instance in instances:
                    future = executor.submit(self.check_service_health, instance)
                    futures.append(future)
            
            # Esperar a que terminen todos los health checks
            for future in futures:
                try:
                    future.result()
                except Exception:
                    pass
        
        self._save_to_redis()
    
    def start_health_check_loop(self):
        """Iniciar loop de health checks en background"""
        if self.running:
            return
        
        self.running = True
        
        def health_check_loop():
            while self.running:
                try:
                    self.health_check_all_services()
                except Exception:
                    pass
                
                time.sleep(self.health_check_interval)
        
        self.health_check_thread = threading.Thread(target=health_check_loop, daemon=True)
        self.health_check_thread.start()
    
    def stop_health_check_loop(self):
        """Detener loop de health checks"""
        self.running = False
        if self.health_check_thread:
            self.health_check_thread.join(timeout=5)
    
    def _save_to_redis(self):
        """Guardar estado de servicios en Redis"""
        try:
            services_data = {}
            for service_name, instances in self.services.items():
                services_data[service_name] = []
                for instance in instances:
                    services_data[service_name].append({
                        'host': instance.host,
                        'port': instance.port,
                        'health_endpoint': instance.health_endpoint,
                        'last_health_check': instance.last_health_check.isoformat(),
                        'is_healthy': instance.is_healthy,
                        'response_time': instance.response_time,
                        'metadata': instance.metadata or {}
                    })
            
            self.redis_client.set(
                'service_registry', 
                json.dumps(services_data, default=str),
                ex=300  # Expirar en 5 minutos
            )
        except Exception:
            pass
    
    def _load_from_redis(self):
        """Cargar estado de servicios desde Redis"""
        try:
            data = self.redis_client.get('service_registry')
            if data:
                services_data = json.loads(data)
                
                for service_name, instances_data in services_data.items():
                    if service_name not in self.services:
                        self.services[service_name] = []
                    
                    for instance_data in instances_data:
                        instance = ServiceInstance(
                            name=service_name,
                            host=instance_data['host'],
                            port=instance_data['port'],
                            health_endpoint=instance_data['health_endpoint'],
                            last_health_check=datetime.fromisoformat(instance_data['last_health_check']),
                            is_healthy=instance_data['is_healthy'],
                            response_time=instance_data['response_time'],
                            metadata=instance_data.get('metadata', {})
                        )
                        self.services[service_name].append(instance)
        except Exception:
            pass
    
    def get_service_status(self) -> Dict[str, Any]:
        """Obtener estado de todos los servicios"""
        status = {}
        
        for service_name, instances in self.services.items():
            healthy_count = sum(1 for instance in instances if instance.is_healthy)
            total_count = len(instances)
            
            status[service_name] = {
                'total_instances': total_count,
                'healthy_instances': healthy_count,
                'unhealthy_instances': total_count - healthy_count,
                'instances': [
                    {
                        'host': instance.host,
                        'port': instance.port,
                        'is_healthy': instance.is_healthy,
                        'response_time': instance.response_time,
                        'last_health_check': instance.last_health_check.isoformat()
                    }
                    for instance in instances
                ]
            }
        
        return status
    
    def is_service_available(self, service_name: str) -> bool:
        """Verificar si un servicio está disponible"""
        return len(self.get_healthy_instances(service_name)) > 0

# Instancia global del registry
service_registry = ServiceRegistry()

# Iniciar health checks automáticamente
service_registry.start_health_check_loop()