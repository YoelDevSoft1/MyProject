# app/utils/rate_limiter.py
import time
from collections import defaultdict
from typing import Dict

class RateLimiter:
    """
    Un simple sistema de rate limiting basado en tokens o ventanas de tiempo.
    """
    _limits: Dict[str, Dict[str, float]] = defaultdict(lambda: {"last_reset": 0.0, "count": 0})

    def __init__(self, key: str, rate: str):
        """
        Inicializa el rate limiter.
        :param key: Identificador único para el recurso a limitar (e.g., "email_task").
        :param rate: Cadena de límite de velocidad (e.g., "100/hour", "10/minute").
        """
        self.key = key
        self.limit, self.period = self._parse_rate(rate)
        self.last_reset = self._limits[key]["last_reset"]
        self.count = self._limits[key]["count"]

    def _parse_rate(self, rate: str):
        """Parsea la cadena de límite de velocidad."""
        try:
            num, period_str = rate.split('/')
            limit = int(num)
            period_map = {
                'second': 1, 'minute': 60, 'hour': 3600, 'day': 86400,
                'seconds': 1, 'minutes': 60, 'hours': 3600, 'days': 86400
            }
            period = period_map[period_str.lower()]
            return limit, period
        except (ValueError, KeyError) as e:
            raise ValueError(f"Formato de rate limit inválido: {rate}. Use 'N/period' (e.g., '100/hour').") from e

    def allow(self) -> bool:
        """
        Verifica si la acción está permitida según el límite de velocidad.
        """
        current_time = time.time()

        if current_time - self.last_reset > self.period:
            self.last_reset = current_time
            self.count = 0

        if self.count < self.limit:
            self.count += 1
            self._limits[self.key]["last_reset"] = self.last_reset
            self._limits[self.key]["count"] = self.count
            return True
        return False

    def get_remaining(self) -> int:
        """Devuelve el número de solicitudes restantes en el período actual."""
        current_time = time.time()
        if current_time - self.last_reset > self.period:
            return self.limit
        return self.limit - self.count

    def get_reset_time(self) -> float:
        """Devuelve el tiempo en segundos hasta el próximo reinicio."""
        current_time = time.time()
        if current_time - self.last_reset > self.period:
            return 0.0
        return self.period - (current_time - self.last_reset)

class DistributedRateLimiter:
    """
    Rate limiter distribuido usando Redis para múltiples instancias.
    """
    def __init__(self, redis_client, key: str, rate: str):
        self.redis = redis_client
        self.key = f"rate_limit:{key}"
        self.limit, self.period = self._parse_rate(rate)

    def _parse_rate(self, rate: str):
        """Parsea la cadena de límite de velocidad."""
        try:
            num, period_str = rate.split('/')
            limit = int(num)
            period_map = {
                'second': 1, 'minute': 60, 'hour': 3600, 'day': 86400,
                'seconds': 1, 'minutes': 60, 'hours': 3600, 'days': 86400
            }
            period = period_map[period_str.lower()]
            return limit, period
        except (ValueError, KeyError) as e:
            raise ValueError(f"Formato de rate limit inválido: {rate}. Use 'N/period' (e.g., '100/hour').") from e

    def allow(self) -> bool:
        """
        Verifica si la acción está permitida según el límite de velocidad distribuido.
        """
        current_time = int(time.time())
        window = current_time // self.period
        key = f"{self.key}:{window}"
        
        current_count = self.redis.get(key)
        if current_count is None:
            current_count = 0
        else:
            current_count = int(current_count)
        
        if current_count < self.limit:
            self.redis.incr(key)
            self.redis.expire(key, self.period)
            return True
        return False

    def get_remaining(self) -> int:
        """Devuelve el número de solicitudes restantes en el período actual."""
        current_time = int(time.time())
        window = current_time // self.period
        key = f"{self.key}:{window}"
        
        current_count = self.redis.get(key)
        if current_count is None:
            return self.limit
        return self.limit - int(current_count)
