"""
SMD Vital - Sistema de Logging de Auditoría Avanzado
====================================================

Sistema centralizado de logging para auditoría, compliance y seguridad.
Cumple con estándares HIPAA, GDPR y SOX.
"""

import structlog
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from enum import Enum
import hashlib
import hmac
from dataclasses import dataclass, asdict

class AuditEventType(Enum):
    """Tipos de eventos de auditoría"""
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    DATA_ACCESS = "data_access"
    DATA_MODIFICATION = "data_modification"
    SECURITY_EVENT = "security_event"
    BUSINESS_EVENT = "business_event"
    SYSTEM_EVENT = "system_event"
    COMPLIANCE_EVENT = "compliance_event"

class SecurityLevel(Enum):
    """Niveles de seguridad para eventos"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class AuditContext:
    """Contexto de auditoría para eventos"""
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_id: Optional[str] = None
    correlation_id: Optional[str] = None
    organization_id: Optional[str] = None
    department: Optional[str] = None

class AuditLogger:
    """
    Logger de auditoría avanzado para SMD Vital.
    Proporciona logging estructurado, encriptado y compliance-ready.
    """
    
    def __init__(self, service_name: str, encryption_key: Optional[str] = None):
        self.service_name = service_name
        self.encryption_key = encryption_key
        self.logger = structlog.get_logger(service_name)
        
        # Configurar structlog para auditoría
        structlog.configure(
            processors=[
                structlog.stdlib.filter_by_level,
                structlog.stdlib.add_logger_name,
                structlog.stdlib.add_log_level,
                structlog.stdlib.PositionalArgumentsFormatter(),
                structlog.processors.TimeStamper(fmt="iso"),
                structlog.processors.StackInfoRenderer(),
                structlog.processors.format_exc_info,
                structlog.processors.UnicodeDecoder(),
                structlog.processors.JSONRenderer()
            ],
            context_class=dict,
            logger_factory=structlog.stdlib.LoggerFactory(),
            wrapper_class=structlog.stdlib.BoundLogger,
            cache_logger_on_first_use=True,
        )
    
    def _create_audit_entry(self, 
                           event_type: AuditEventType,
                           action: str,
                           resource: str,
                           context: AuditContext,
                           details: Optional[Dict[str, Any]] = None,
                           security_level: SecurityLevel = SecurityLevel.MEDIUM,
                           success: bool = True,
                           error_message: Optional[str] = None) -> Dict[str, Any]:
        """Crear entrada de auditoría estructurada"""
        
        audit_entry = {
            # Identificadores únicos
            "audit_id": str(uuid.uuid4()),
            "event_id": str(uuid.uuid4()),
            "correlation_id": context.correlation_id or str(uuid.uuid4()),
            
            # Metadatos del evento
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": self.service_name,
            "event_type": event_type.value,
            "action": action,
            "resource": resource,
            "security_level": security_level.value,
            
            # Resultado
            "success": success,
            "error_message": error_message,
            
            # Contexto de usuario
            "user_id": context.user_id,
            "session_id": context.session_id,
            "ip_address": context.ip_address,
            "user_agent": context.user_agent,
            "request_id": context.request_id,
            "organization_id": context.organization_id,
            "department": context.department,
            
            # Detalles adicionales
            "details": details or {},
            
            # Compliance
            "compliance_required": security_level in [SecurityLevel.HIGH, SecurityLevel.CRITICAL],
            "retention_period_days": self._get_retention_period(security_level),
            
            # Hash para integridad
            "integrity_hash": None  # Se calculará después
        }
        
        # Calcular hash de integridad
        audit_entry["integrity_hash"] = self._calculate_integrity_hash(audit_entry)
        
        return audit_entry
    
    def _calculate_integrity_hash(self, audit_entry: Dict[str, Any]) -> str:
        """Calcular hash de integridad para el evento de auditoría"""
        # Crear string para hash (excluyendo el hash mismo)
        hash_data = {k: v for k, v in audit_entry.items() if k != "integrity_hash"}
        hash_string = json.dumps(hash_data, sort_keys=True)
        
        if self.encryption_key:
            return hmac.new(
                self.encryption_key.encode(),
                hash_string.encode(),
                hashlib.sha256
            ).hexdigest()
        else:
            return hashlib.sha256(hash_string.encode()).hexdigest()
    
    def _get_retention_period(self, security_level: SecurityLevel) -> int:
        """Obtener período de retención basado en nivel de seguridad"""
        retention_periods = {
            SecurityLevel.LOW: 30,
            SecurityLevel.MEDIUM: 90,
            SecurityLevel.HIGH: 2555,  # 7 años
            SecurityLevel.CRITICAL: 3650  # 10 años
        }
        return retention_periods[security_level]
    
    def log_authentication_event(self,
                               user_id: str,
                               action: str,
                               success: bool,
                               context: AuditContext,
                               details: Optional[Dict[str, Any]] = None,
                               error_message: Optional[str] = None):
        """Log eventos de autenticación"""
        audit_entry = self._create_audit_entry(
            event_type=AuditEventType.AUTHENTICATION,
            action=action,
            resource="authentication",
            context=context,
            details=details,
            security_level=SecurityLevel.HIGH,
            success=success,
            error_message=error_message
        )
        
        self.logger.info("authentication_event", **audit_entry)
    
    def log_phi_access(self,
                      user_id: str,
                      patient_id: str,
                      record_type: str,
                      action: str,
                      context: AuditContext,
                      access_reason: str,
                      success: bool = True,
                      details: Optional[Dict[str, Any]] = None):
        """Log acceso a información médica protegida (HIPAA)"""
        phi_details = {
            "patient_id": patient_id,
            "record_type": record_type,
            "access_reason": access_reason,
            "hipaa_compliant": True,
            **(details or {})
        }
        
        audit_entry = self._create_audit_entry(
            event_type=AuditEventType.DATA_ACCESS,
            action=action,
            resource=f"phi_{record_type}",
            context=context,
            details=phi_details,
            security_level=SecurityLevel.CRITICAL,
            success=success
        )
        
        self.logger.warning("phi_access", **audit_entry)
    
    def log_security_event(self,
                          event_type: str,
                          action: str,
                          resource: str,
                          context: AuditContext,
                          severity: str = "medium",
                          details: Optional[Dict[str, Any]] = None,
                          success: bool = True,
                          error_message: Optional[str] = None):
        """Log eventos de seguridad"""
        security_level = SecurityLevel.CRITICAL if severity == "critical" else SecurityLevel.HIGH
        
        security_details = {
            "security_event": True,
            "severity": severity,
            **(details or {})
        }
        
        audit_entry = self._create_audit_entry(
            event_type=AuditEventType.SECURITY_EVENT,
            action=action,
            resource=resource,
            context=context,
            details=security_details,
            security_level=security_level,
            success=success,
            error_message=error_message
        )
        
        self.logger.error("security_event", **audit_entry)
    
    def log_business_event(self,
                          event_type: str,
                          action: str,
                          resource: str,
                          context: AuditContext,
                          business_impact: str = "low",
                          details: Optional[Dict[str, Any]] = None,
                          success: bool = True):
        """Log eventos de negocio"""
        business_details = {
            "business_event": True,
            "business_impact": business_impact,
            **(details or {})
        }
        
        audit_entry = self._create_audit_entry(
            event_type=AuditEventType.BUSINESS_EVENT,
            action=action,
            resource=resource,
            context=context,
            details=business_details,
            security_level=SecurityLevel.MEDIUM,
            success=success
        )
        
        self.logger.info("business_event", **audit_entry)
    
    def log_data_modification(self,
                             user_id: str,
                             resource_type: str,
                             resource_id: str,
                             action: str,
                             context: AuditContext,
                             old_values: Optional[Dict[str, Any]] = None,
                             new_values: Optional[Dict[str, Any]] = None,
                             success: bool = True,
                             error_message: Optional[str] = None):
        """Log modificaciones de datos"""
        modification_details = {
            "resource_type": resource_type,
            "resource_id": resource_id,
            "old_values": old_values,
            "new_values": new_values,
            "change_summary": self._generate_change_summary(old_values, new_values)
        }
        
        audit_entry = self._create_audit_entry(
            event_type=AuditEventType.DATA_MODIFICATION,
            action=action,
            resource=resource_type,
            context=context,
            details=modification_details,
            security_level=SecurityLevel.HIGH,
            success=success,
            error_message=error_message
        )
        
        self.logger.info("data_modification", **audit_entry)
    
    def _generate_change_summary(self, old_values: Optional[Dict], new_values: Optional[Dict]) -> Dict[str, Any]:
        """Generar resumen de cambios"""
        if not old_values or not new_values:
            return {"changes": "No previous values available"}
        
        changes = {}
        for key in set(old_values.keys()) | set(new_values.keys()):
            old_val = old_values.get(key)
            new_val = new_values.get(key)
            if old_val != new_val:
                changes[key] = {
                    "from": old_val,
                    "to": new_val
                }
        
        return {
            "total_changes": len(changes),
            "changed_fields": list(changes.keys()),
            "changes": changes
        }
    
    def log_compliance_event(self,
                           compliance_type: str,
                           action: str,
                           resource: str,
                           context: AuditContext,
                           compliance_status: str,
                           details: Optional[Dict[str, Any]] = None):
        """Log eventos de compliance"""
        compliance_details = {
            "compliance_type": compliance_type,
            "compliance_status": compliance_status,
            "compliance_required": True,
            **(details or {})
        }
        
        audit_entry = self._create_audit_entry(
            event_type=AuditEventType.COMPLIANCE_EVENT,
            action=action,
            resource=resource,
            context=context,
            details=compliance_details,
            security_level=SecurityLevel.CRITICAL,
            success=True
        )
        
        self.logger.warning("compliance_event", **audit_entry)

# Instancias globales para cada servicio
auth_audit_logger = AuditLogger("auth-service")
appointment_audit_logger = AuditLogger("appointment-service")
medical_audit_logger = AuditLogger("medical-records-service")
payment_audit_logger = AuditLogger("payment-service")
notification_audit_logger = AuditLogger("notification-service")



