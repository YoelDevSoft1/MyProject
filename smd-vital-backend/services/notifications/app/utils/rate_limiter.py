"""
SMD Vital - Distributed Rate Limiter
===================================

Rate limiter distribuido usando Redis para controlar
la frecuencia de ejecución de tareas en microservicios.
"""

import time
import redis
from typing import Optional
from functools import wraps

class DistributedRateLimiter:
    """Rate limiter distribuido usando Redis"""
    
    def __init__(self, key: str, limit: str, redis_client: Optional[redis.Redis] = None):
        """
        Inicializar rate limiter
        
        Args:
            key: Clave única para el rate limiter
            limit: Límite en formato "requests/timeframe" (ej: "100/hour", "10/minute")
            redis_client: Cliente Redis (se crea uno nuevo si no se proporciona)
        """
        self.key = f"rate_limit:{key}"
        self.limit, self.timeframe = self._parse_limit(limit)
        self.redis_client = redis_client or redis.Redis(host='redis', port=6379, db=0)
        
    def _parse_limit(self, limit_str: str) -> tuple:
        """Parsear string de límite a número y timeframe"""
        try:
            limit, timeframe = limit_str.split('/')
            limit = int(limit)
            
            # Convertir timeframe a segundos
            timeframe_map = {
                'second': 1,
                'minute': 60,
                'hour': 3600,
                'day': 86400
            }
            
            if timeframe in timeframe_map:
                return limit, timeframe_map[timeframe]
            else:
                raise ValueError(f"Invalid timeframe: {timeframe}")
                
        except (ValueError, IndexError):
            raise ValueError(f"Invalid limit format: {limit_str}. Use 'requests/timeframe'")
    
    def allow(self) -> bool:
        """
        Verificar si se permite la operación
        
        Returns:
            bool: True si se permite, False si se excede el límite
        """
        try:
            current_time = int(time.time())
            window_start = current_time - self.timeframe
            
            # Usar pipeline para operaciones atómicas
            pipe = self.redis_client.pipeline()
            
            # Remover entradas expiradas
            pipe.zremrangebyscore(self.key, 0, window_start)
            
            # Contar entradas actuales
            pipe.zcard(self.key)
            
            # Agregar nueva entrada
            pipe.zadd(self.key, {str(current_time): current_time})
            
            # Establecer expiración
            pipe.expire(self.key, self.timeframe)
            
            results = pipe.execute()
            current_count = results[1]
            
            return current_count < self.limit
            
        except Exception:
            # En caso de error de Redis, permitir la operación
            return True
    
    def reset(self) -> bool:
        """Resetear el contador"""
        try:
            return self.redis_client.delete(self.key) > 0
        except Exception:
            return False
    
    def remaining(self) -> int:
        """Obtener número de operaciones restantes"""
        try:
            current_time = int(time.time())
            window_start = current_time - self.timeframe
            
            # Limpiar entradas expiradas
            self.redis_client.zremrangebyscore(self.key, 0, window_start)
            
            # Contar entradas actuales
            current_count = self.redis_client.zcard(self.key)
            
            return max(0, self.limit - current_count)
            
        except Exception:
            return self.limit

def rate_limit(key: str, limit: str):
    """
    Decorador para aplicar rate limiting a funciones
    
    Args:
        key: Clave única para el rate limiter
        limit: Límite en formato "requests/timeframe"
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            limiter = DistributedRateLimiter(key, limit)
            
            if not limiter.allow():
                raise Exception(f"Rate limit exceeded for {key}")
            
            return func(*args, **kwargs)
        
        return wrapper
    return decorator

# Rate limiter global para tareas críticas
class GlobalRateLimiter:
    """Rate limiter global para operaciones críticas del sistema"""
    
    def __init__(self, redis_client: Optional[redis.Redis] = None):
        self.redis_client = redis_client or redis.Redis(host='redis', port=6379, db=0)
    
    def check_email_limit(self, user_id: str) -> bool:
        """Verificar límite de emails por usuario"""
        limiter = DistributedRateLimiter(
            f"email_user_{user_id}", 
            "10/hour", 
            self.redis_client
        )
        return limiter.allow()
    
    def check_sms_limit(self, user_id: str) -> bool:
        """Verificar límite de SMS por usuario"""
        limiter = DistributedRateLimiter(
            f"sms_user_{user_id}", 
            "5/hour", 
            self.redis_client
        )
        return limiter.allow()
    
    def check_global_notification_limit(self) -> bool:
        """Verificar límite global de notificaciones"""
        limiter = DistributedRateLimiter(
            "global_notifications", 
            "1000/hour", 
            self.redis_client
        )
        return limiter.allow()
    
    def check_api_limit(self, service_name: str) -> bool:
        """Verificar límite de llamadas API por servicio"""
        limiter = DistributedRateLimiter(
            f"api_{service_name}", 
            "100/minute", 
            self.redis_client
        )
        return limiter.allow()

# Instancia global
global_rate_limiter = GlobalRateLimiter()