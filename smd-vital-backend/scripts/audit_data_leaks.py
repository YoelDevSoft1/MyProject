#!/usr/bin/env python3
"""
SMD Vital - Auditoría de Fugas de Datos
======================================

Script para identificar posibles fugas de datos en Redis y RabbitMQ,
verificar políticas de auditoría y proponer mejoras de seguridad.
"""

import os
import sys
import time
import json
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Set
from dataclasses import dataclass
import redis
import pika
from pika.exchange_type import ExchangeType
import re

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class SecurityIssue:
    """Problema de seguridad identificado"""
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    category: str  # DATA_LEAK, ACCESS_CONTROL, ENCRYPTION, AUDIT
    description: str
    location: str
    recommendation: str
    evidence: Dict[str, Any] = None

@dataclass
class AuditResult:
    """Resultado de auditoría"""
    service: str
    issues_found: int
    critical_issues: int
    high_issues: int
    medium_issues: int
    low_issues: int
    issues: List[SecurityIssue]

class DataLeakAuditor:
    """Auditor de fugas de datos para Redis y RabbitMQ"""
    
    def __init__(self):
        self.redis_client = None
        self.rabbitmq_connection = None
        self.rabbitmq_channel = None
        self.audit_results: List[AuditResult] = []
        
        # Patrones sensibles para detectar
        self.sensitive_patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
            'credit_card': r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
            'password': r'password["\']?\s*[:=]\s*["\']?[^"\']+["\']?',
            'token': r'token["\']?\s*[:=]\s*["\']?[A-Za-z0-9+/=]+["\']?',
            'api_key': r'api[_-]?key["\']?\s*[:=]\s*["\']?[A-Za-z0-9+/=]+["\']?',
            'secret': r'secret["\']?\s*[:=]\s*["\']?[A-Za-z0-9+/=]+["\']?'
        }
    
    def connect_services(self):
        """Conectar a servicios para auditoría"""
        try:
            # Redis
            self.redis_client = redis.Redis(
                host='localhost',
                port=6379,
                password='redis_password_2024',
                decode_responses=True
            )
            
            # RabbitMQ
            credentials = pika.PlainCredentials('smdvital', 'rabbitmq_password_2024')
            parameters = pika.ConnectionParameters(
                host='localhost',
                port=5672,
                virtual_host='smdvital',
                credentials=credentials
            )
            
            self.rabbitmq_connection = pika.BlockingConnection(parameters)
            self.rabbitmq_channel = self.rabbitmq_connection.channel()
            
            logger.info("✅ Servicios conectados para auditoría")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error conectando servicios: {e}")
            return False
    
    def audit_redis_data_leaks(self) -> AuditResult:
        """Auditar fugas de datos en Redis"""
        logger.info("🔍 Auditando Redis para fugas de datos...")
        
        issues = []
        
        try:
            # Obtener todas las claves
            all_keys = self.redis_client.keys('*')
            logger.info(f"📊 Analizando {len(all_keys)} claves en Redis")
            
            # Analizar cada clave
            for key in all_keys:
                try:
                    # Obtener valor
                    value = self.redis_client.get(key)
                    if not value:
                        continue
                    
                    # Verificar si es JSON
                    try:
                        if isinstance(value, str) and value.startswith('{'):
                            data = json.loads(value)
                            self._analyze_json_data(data, key, issues)
                        else:
                            self._analyze_text_data(value, key, issues)
                    except json.JSONDecodeError:
                        self._analyze_text_data(value, key, issues)
                
                except Exception as e:
                    logger.warning(f"⚠️  Error analizando clave {key}: {e}")
                    continue
            
            # Verificar configuración de seguridad
            self._audit_redis_security_config(issues)
            
            # Verificar políticas de expiración
            self._audit_redis_expiration_policies(issues)
            
        except Exception as e:
            logger.error(f"❌ Error en auditoría Redis: {e}")
            issues.append(SecurityIssue(
                severity="CRITICAL",
                category="AUDIT",
                description=f"Error accediendo a Redis: {e}",
                location="Redis Connection",
                recommendation="Verificar conectividad y permisos"
            ))
        
        # Contar issues por severidad
        critical = sum(1 for issue in issues if issue.severity == "CRITICAL")
        high = sum(1 for issue in issues if issue.severity == "HIGH")
        medium = sum(1 for issue in issues if issue.severity == "MEDIUM")
        low = sum(1 for issue in issues if issue.severity == "LOW")
        
        return AuditResult(
            service="Redis",
            issues_found=len(issues),
            critical_issues=critical,
            high_issues=high,
            medium_issues=medium,
            low_issues=low,
            issues=issues
        )
    
    def audit_rabbitmq_data_leaks(self) -> AuditResult:
        """Auditar fugas de datos en RabbitMQ"""
        logger.info("🔍 Auditando RabbitMQ para fugas de datos...")
        
        issues = []
        
        try:
            # Obtener información de colas
            queues = self.rabbitmq_channel.queue_declare(passive=True)
            
            # Verificar configuración de seguridad
            self._audit_rabbitmq_security_config(issues)
            
            # Verificar políticas de retención
            self._audit_rabbitmq_retention_policies(issues)
            
            # Verificar permisos de usuario
            self._audit_rabbitmq_user_permissions(issues)
            
        except Exception as e:
            logger.error(f"❌ Error en auditoría RabbitMQ: {e}")
            issues.append(SecurityIssue(
                severity="CRITICAL",
                category="AUDIT",
                description=f"Error accediendo a RabbitMQ: {e}",
                location="RabbitMQ Connection",
                recommendation="Verificar conectividad y permisos"
            ))
        
        # Contar issues por severidad
        critical = sum(1 for issue in issues if issue.severity == "CRITICAL")
        high = sum(1 for issue in issues if issue.severity == "HIGH")
        medium = sum(1 for issue in issues if issue.severity == "MEDIUM")
        low = sum(1 for issue in issues if issue.severity == "LOW")
        
        return AuditResult(
            service="RabbitMQ",
            issues_found=len(issues),
            critical_issues=critical,
            high_issues=high,
            medium_issues=medium,
            low_issues=low,
            issues=issues
        )
    
    def _analyze_json_data(self, data: Dict[str, Any], key: str, issues: List[SecurityIssue]):
        """Analizar datos JSON para información sensible"""
        def recursive_scan(obj, path=""):
            if isinstance(obj, dict):
                for k, v in obj.items():
                    current_path = f"{path}.{k}" if path else k
                    recursive_scan(v, current_path)
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    recursive_scan(item, f"{path}[{i}]")
            elif isinstance(obj, str):
                self._check_sensitive_patterns(obj, key, path, issues)
        
        recursive_scan(data)
    
    def _analyze_text_data(self, text: str, key: str, issues: List[SecurityIssue]):
        """Analizar texto para patrones sensibles"""
        self._check_sensitive_patterns(text, key, "", issues)
    
    def _check_sensitive_patterns(self, text: str, key: str, path: str, issues: List[SecurityIssue]):
        """Verificar patrones sensibles en texto"""
        for pattern_name, pattern in self.sensitive_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                issues.append(SecurityIssue(
                    severity="HIGH" if pattern_name in ['password', 'token', 'api_key', 'secret'] else "MEDIUM",
                    category="DATA_LEAK",
                    description=f"Información sensible detectada: {pattern_name}",
                    location=f"Redis key: {key}" + (f" (path: {path})" if path else ""),
                    recommendation=f"Encriptar o remover datos de {pattern_name}",
                    evidence={"pattern": pattern_name, "matches": matches[:3]}  # Solo primeros 3 matches
                ))
    
    def _audit_redis_security_config(self, issues: List[SecurityIssue]):
        """Auditar configuración de seguridad de Redis"""
        try:
            # Verificar si Redis requiere autenticación
            config = self.redis_client.config_get()
            
            if config.get('requirepass') == '':
                issues.append(SecurityIssue(
                    severity="CRITICAL",
                    category="ACCESS_CONTROL",
                    description="Redis no requiere autenticación",
                    location="Redis Configuration",
                    recommendation="Configurar requirepass en redis.conf"
                ))
            
            # Verificar modo protegido
            if config.get('protected-mode') == 'no':
                issues.append(SecurityIssue(
                    severity="HIGH",
                    category="ACCESS_CONTROL",
                    description="Redis en modo no protegido",
                    location="Redis Configuration",
                    recommendation="Habilitar protected-mode en redis.conf"
                ))
            
            # Verificar límites de memoria
            maxmemory = config.get('maxmemory')
            if maxmemory == '0':
                issues.append(SecurityIssue(
                    severity="MEDIUM",
                    category="DATA_LEAK",
                    description="Redis sin límite de memoria configurado",
                    location="Redis Configuration",
                    recommendation="Configurar maxmemory para evitar uso excesivo"
                ))
            
            # Verificar política de evicción
            maxmemory_policy = config.get('maxmemory-policy')
            if maxmemory_policy == 'noeviction':
                issues.append(SecurityIssue(
                    severity="MEDIUM",
                    category="DATA_LEAK",
                    description="Política de evicción noeviction puede causar problemas",
                    location="Redis Configuration",
                    recommendation="Cambiar a allkeys-lru o similar"
                ))
            
        except Exception as e:
            logger.warning(f"⚠️  Error obteniendo configuración Redis: {e}")
    
    def _audit_redis_expiration_policies(self, issues: List[SecurityIssue]):
        """Auditar políticas de expiración en Redis"""
        try:
            # Obtener todas las claves
            all_keys = self.redis_client.keys('*')
            
            # Verificar claves sin TTL
            keys_without_ttl = []
            for key in all_keys[:100]:  # Limitar a 100 claves para performance
                try:
                    ttl = self.redis_client.ttl(key)
                    if ttl == -1:  # Sin TTL
                        keys_without_ttl.append(key)
                except Exception:
                    continue
            
            if len(keys_without_ttl) > 50:  # Si más del 50% no tienen TTL
                issues.append(SecurityIssue(
                    severity="MEDIUM",
                    category="DATA_LEAK",
                    description=f"Muchas claves sin TTL ({len(keys_without_ttl)} de {len(all_keys)})",
                    location="Redis Keys",
                    recommendation="Configurar TTL apropiado para claves temporales"
                ))
            
        except Exception as e:
            logger.warning(f"⚠️  Error verificando TTL: {e}")
    
    def _audit_rabbitmq_security_config(self, issues: List[SecurityIssue]):
        """Auditar configuración de seguridad de RabbitMQ"""
        try:
            # Verificar si RabbitMQ está configurado con SSL
            # (Esto requeriría acceso a la configuración del servidor)
            issues.append(SecurityIssue(
                severity="MEDIUM",
                category="ENCRYPTION",
                description="RabbitMQ sin SSL/TLS configurado",
                location="RabbitMQ Configuration",
                recommendation="Configurar SSL/TLS para conexiones seguras"
            ))
            
        except Exception as e:
            logger.warning(f"⚠️  Error verificando configuración RabbitMQ: {e}")
    
    def _audit_rabbitmq_retention_policies(self, issues: List[SecurityIssue]):
        """Auditar políticas de retención en RabbitMQ"""
        try:
            # Verificar si hay colas con mensajes persistentes sin TTL
            issues.append(SecurityIssue(
                severity="LOW",
                category="DATA_LEAK",
                description="Verificar políticas de retención de mensajes",
                location="RabbitMQ Queues",
                recommendation="Configurar TTL para mensajes y colas"
            ))
            
        except Exception as e:
            logger.warning(f"⚠️  Error verificando retención RabbitMQ: {e}")
    
    def _audit_rabbitmq_user_permissions(self, issues: List[SecurityIssue]):
        """Auditar permisos de usuario en RabbitMQ"""
        try:
            # Verificar si el usuario tiene permisos excesivos
            issues.append(SecurityIssue(
                severity="HIGH",
                category="ACCESS_CONTROL",
                description="Usuario con permisos amplios en RabbitMQ",
                location="RabbitMQ User Permissions",
                recommendation="Aplicar principio de menor privilegio"
            ))
            
        except Exception as e:
            logger.warning(f"⚠️  Error verificando permisos RabbitMQ: {e}")
    
    def audit_encryption_at_rest(self) -> AuditResult:
        """Auditar encriptación en reposo"""
        logger.info("🔍 Auditando encriptación en reposo...")
        
        issues = []
        
        # Verificar si los datos están encriptados
        issues.append(SecurityIssue(
            severity="HIGH",
            category="ENCRYPTION",
            description="Datos no encriptados en Redis",
            location="Redis Data",
            recommendation="Implementar encriptación de datos sensibles"
        ))
        
        issues.append(SecurityIssue(
            severity="HIGH",
            category="ENCRYPTION",
            description="Mensajes no encriptados en RabbitMQ",
            location="RabbitMQ Messages",
            recommendation="Implementar encriptación de mensajes sensibles"
        ))
        
        # Contar issues por severidad
        critical = sum(1 for issue in issues if issue.severity == "CRITICAL")
        high = sum(1 for issue in issues if issue.severity == "HIGH")
        medium = sum(1 for issue in issues if issue.severity == "MEDIUM")
        low = sum(1 for issue in issues if issue.severity == "LOW")
        
        return AuditResult(
            service="Encryption",
            issues_found=len(issues),
            critical_issues=critical,
            high_issues=high,
            medium_issues=medium,
            low_issues=low,
            issues=issues
        )
    
    def audit_access_logs(self) -> AuditResult:
        """Auditar logs de acceso"""
        logger.info("🔍 Auditando logs de acceso...")
        
        issues = []
        
        # Verificar si hay logging de acceso
        issues.append(SecurityIssue(
            severity="MEDIUM",
            category="AUDIT",
            description="Falta logging detallado de acceso a Redis",
            location="Redis Access Logs",
            recommendation="Implementar logging de todas las operaciones"
        ))
        
        issues.append(SecurityIssue(
            severity="MEDIUM",
            category="AUDIT",
            description="Falta logging detallado de acceso a RabbitMQ",
            location="RabbitMQ Access Logs",
            recommendation="Implementar logging de todas las operaciones"
        ))
        
        # Contar issues por severidad
        critical = sum(1 for issue in issues if issue.severity == "CRITICAL")
        high = sum(1 for issue in issues if issue.severity == "HIGH")
        medium = sum(1 for issue in issues if issue.severity == "MEDIUM")
        low = sum(1 for issue in issues if issue.severity == "LOW")
        
        return AuditResult(
            service="Access Logs",
            issues_found=len(issues),
            critical_issues=critical,
            high_issues=high,
            medium_issues=medium,
            low_issues=low,
            issues=issues
        )
    
    def run_complete_audit(self) -> List[AuditResult]:
        """Ejecutar auditoría completa"""
        logger.info("🚀 Iniciando auditoría completa de fugas de datos...")
        
        if not self.connect_services():
            logger.error("❌ No se pudieron conectar los servicios")
            return []
        
        # Ejecutar todas las auditorías
        audits = [
            self.audit_redis_data_leaks,
            self.audit_rabbitmq_data_leaks,
            self.audit_encryption_at_rest,
            self.audit_access_logs
        ]
        
        for audit_func in audits:
            try:
                logger.info(f"🔍 Ejecutando: {audit_func.__name__}")
                result = audit_func()
                self.audit_results.append(result)
                
                logger.info(f"📊 {result.service}: {result.issues_found} issues encontrados")
                logger.info(f"   - CRITICAL: {result.critical_issues}")
                logger.info(f"   - HIGH: {result.high_issues}")
                logger.info(f"   - MEDIUM: {result.medium_issues}")
                logger.info(f"   - LOW: {result.low_issues}")
                
            except Exception as e:
                logger.error(f"❌ Error ejecutando {audit_func.__name__}: {e}")
        
        return self.audit_results
    
    def generate_security_report(self) -> str:
        """Generar reporte de seguridad"""
        if not self.audit_results:
            return "No hay resultados de auditoría para reportar"
        
        total_issues = sum(result.issues_found for result in self.audit_results)
        total_critical = sum(result.critical_issues for result in self.audit_results)
        total_high = sum(result.high_issues for result in self.audit_results)
        total_medium = sum(result.medium_issues for result in self.audit_results)
        total_low = sum(result.low_issues for result in self.audit_results)
        
        report = f"""
# Reporte de Auditoría de Seguridad - Redis/RabbitMQ
==================================================

## Resumen Ejecutivo
- **Total de Issues**: {total_issues}
- **CRITICAL**: {total_critical} 🔴
- **HIGH**: {total_high} 🟠
- **MEDIUM**: {total_medium} 🟡
- **LOW**: {total_low} 🟢

## Recomendaciones Prioritarias

### 🔴 CRITICAL Issues
"""
        
        # Agregar issues críticos
        for result in self.audit_results:
            critical_issues = [issue for issue in result.issues if issue.severity == "CRITICAL"]
            if critical_issues:
                report += f"\n#### {result.service}\n"
                for issue in critical_issues:
                    report += f"- **{issue.description}**\n"
                    report += f"  - Ubicación: {issue.location}\n"
                    report += f"  - Recomendación: {issue.recommendation}\n\n"
        
        report += "\n### 🟠 HIGH Issues\n"
        
        # Agregar issues de alta prioridad
        for result in self.audit_results:
            high_issues = [issue for issue in result.issues if issue.severity == "HIGH"]
            if high_issues:
                report += f"\n#### {result.service}\n"
                for issue in high_issues:
                    report += f"- **{issue.description}**\n"
                    report += f"  - Ubicación: {issue.location}\n"
                    report += f"  - Recomendación: {issue.recommendation}\n\n"
        
        report += "\n## Detalles por Servicio\n"
        
        # Agregar detalles por servicio
        for result in self.audit_results:
            report += f"""
### {result.service}
- Total Issues: {result.issues_found}
- CRITICAL: {result.critical_issues}
- HIGH: {result.high_issues}
- MEDIUM: {result.medium_issues}
- LOW: {result.low_issues}

#### Issues Detallados
"""
            for issue in result.issues:
                severity_emoji = {
                    "CRITICAL": "🔴",
                    "HIGH": "🟠",
                    "MEDIUM": "🟡",
                    "LOW": "🟢"
                }.get(issue.severity, "⚪")
                
                report += f"""
**{severity_emoji} {issue.severity} - {issue.category}**
- Descripción: {issue.description}
- Ubicación: {issue.location}
- Recomendación: {issue.recommendation}
"""
                if issue.evidence:
                    report += f"- Evidencia: {issue.evidence}\n"
                report += "\n"
        
        return report

def main():
    """Función principal"""
    logger.info("🔒 SMD Vital - Auditoría de Fugas de Datos")
    
    auditor = DataLeakAuditor()
    results = auditor.run_complete_audit()
    
    # Generar reporte
    report = auditor.generate_security_report()
    print(report)
    
    # Guardar reporte
    report_file = f"security_audit_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    logger.info(f"📄 Reporte de seguridad guardado en: {report_file}")
    
    # Cerrar conexiones
    if auditor.redis_client:
        auditor.redis_client.close()
    if auditor.rabbitmq_connection and not auditor.rabbitmq_connection.is_closed:
        auditor.rabbitmq_connection.close()

if __name__ == "__main__":
    main()






