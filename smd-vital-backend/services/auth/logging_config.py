import logging
import json
import sys
from datetime import datetime
from typing import Optional, Dict, Any

class StructuredLogger:
    """
    Logger estructurado para microservicios SMD Vital.
    Envía logs en formato JSON que pueden ser procesados por Kibana.
    """
    
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.logger = logging.getLogger(service_name)
        self.logger.setLevel(logging.INFO)
        
        # Configurar handler para stdout (para Docker)
        if not self.logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            handler.setLevel(logging.INFO)
            
            # Formatter para JSON
            formatter = logging.Formatter('%(message)s')
            handler.setFormatter(formatter)
            
            self.logger.addHandler(handler)
            self.logger.propagate = False
    
    def _create_log_entry(self, level: str, message: str, **kwargs) -> str:
        """Crea una entrada de log estructurada."""
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "service": self.service_name,
            "level": level,
            "message": message,
            **kwargs
        }
        return json.dumps(log_data, ensure_ascii=False)
    
    def info(self, message: str, **kwargs):
        """Log de información."""
        self.logger.info(self._create_log_entry("INFO", message, **kwargs))
    
    def error(self, message: str, **kwargs):
        """Log de error."""
        self.logger.error(self._create_log_entry("ERROR", message, **kwargs))
    
    def warning(self, message: str, **kwargs):
        """Log de advertencia."""
        self.logger.warning(self._create_log_entry("WARNING", message, **kwargs))
    
    def debug(self, message: str, **kwargs):
        """Log de debug."""
        self.logger.debug(self._create_log_entry("DEBUG", message, **kwargs))
    
    # Métodos específicos para diferentes tipos de eventos
    
    def log_request(self, method: str, path: str, user_id: Optional[str] = None,
                   status_code: Optional[int] = None, duration_ms: Optional[float] = None,
                   request_id: Optional[str] = None, ip_address: Optional[str] = None):
        """Log de peticiones HTTP."""
        self.info(
            f"{method} {path}",
            type="http_request",
            method=method,
            path=path,
            user_id=user_id,
            status_code=status_code,
            duration_ms=duration_ms,
            request_id=request_id,
            ip_address=ip_address
        )
    
    def log_auth_event(self, event_type: str, user_id: Optional[str] = None,
                      success: bool = True, reason: Optional[str] = None):
        """Log de eventos de autenticación."""
        self.info(
            f"Auth event: {event_type}",
            type="auth_event",
            event_type=event_type,
            user_id=user_id,
            success=success,
            reason=reason
        )
    
    def log_business_event(self, event_type: str, user_id: str, 
                          data: Optional[Dict[str, Any]] = None):
        """Log de eventos de negocio."""
        self.info(
            f"Business event: {event_type}",
            type="business_event",
            event_type=event_type,
            user_id=user_id,
            data=data or {}
        )
    
    def log_database_operation(self, operation: str, table: str, 
                              duration_ms: Optional[float] = None,
                              rows_affected: Optional[int] = None):
        """Log de operaciones de base de datos."""
        self.info(
            f"Database {operation} on {table}",
            type="database_operation",
            operation=operation,
            table=table,
            duration_ms=duration_ms,
            rows_affected=rows_affected
        )
    
    def log_external_api_call(self, service: str, endpoint: str, 
                             method: str, status_code: Optional[int] = None,
                             duration_ms: Optional[float] = None):
        """Log de llamadas a APIs externas."""
        self.info(
            f"External API call to {service}",
            type="external_api_call",
            service=service,
            endpoint=endpoint,
            method=method,
            status_code=status_code,
            duration_ms=duration_ms
        )
    
    def log_security_event(self, event_type: str, user_id: Optional[str] = None,
                          ip_address: Optional[str] = None, 
                          user_agent: Optional[str] = None,
                          severity: str = "medium"):
        """Log de eventos de seguridad."""
        self.warning(
            f"Security event: {event_type}",
            type="security_event",
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            severity=severity
        )

# Instancia global del logger para el servicio de autenticación
logger = StructuredLogger("auth-service")


















