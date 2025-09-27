#!/usr/bin/env python3
"""
SMD VITAL - Pruebas de Control de Acceso Basado en Roles
=========================================================

Script para probar el control de acceso basado en roles (RBAC) en todos los endpoints.

Author: Backend Team
Date: 2025-01-27
"""

import requests
import json
import time
import jwt
import os
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RoleBasedAccessTester:
    """Clase para probar control de acceso basado en roles"""
    
    def __init__(self):
        self.base_urls = {
            "auth": "http://localhost:8001",
            "users": "http://localhost:8002",
            "appointments": "http://localhost:8003",
            "medical-records": "http://localhost:8005",
            "payments": "http://localhost:8006",
            "notifications": "http://localhost:8004",
            "health-metrics": "http://localhost:8007"
        }
        
        # JWT Configuration
        self.JWT_SECRET = os.getenv("JWT_SECRET_KEY", "super_secret_jwt_key_for_smd_vital_2024")
        self.JWT_ALGORITHM = "HS256"
        
        # Roles y permisos del sistema
        self.roles = {
            "patient": {
                "permissions": ["read_own_data", "create_appointment", "read_own_appointments"],
                "restrictions": ["admin_access", "doctor_access", "financial_access"]
            },
            "doctor": {
                "permissions": ["read_patient_data", "create_medical_record", "read_medical_records", "update_medical_records"],
                "restrictions": ["admin_access", "financial_access"]
            },
            "admin": {
                "permissions": ["all_access"],
                "restrictions": []
            },
            "nurse": {
                "permissions": ["read_patient_data", "create_medical_record", "read_medical_records"],
                "restrictions": ["admin_access", "financial_access", "delete_medical_records"]
            }
        }
        
        self.test_results = []
        self.access_violations = []
    
    def create_token_for_role(self, role: str, user_id: str = "test_user") -> str:
        """Crear token JWT para un rol específico"""
        permissions = self.roles.get(role, {}).get("permissions", [])
        
        payload = {
            "sub": user_id,
            "email": f"test_{role}@example.com",
            "role": role,
            "permissions": permissions,
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        
        return jwt.encode(payload, self.JWT_SECRET, algorithm=self.JWT_ALGORITHM)
    
    def test_endpoint_with_role(self, service: str, endpoint: str, method: str, 
                              role: str, expected_access: str) -> Dict:
        """Probar endpoint con un rol específico"""
        url = f"{self.base_urls[service]}{endpoint}"
        token = self.create_token_for_role(role)
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json={}, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=headers, json={}, timeout=10)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=10)
            
            result = {
                "service": service,
                "endpoint": endpoint,
                "method": method,
                "role": role,
                "expected_access": expected_access,
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds(),
                "response_size": len(response.content),
                "headers": dict(response.headers),
                "body": response.text[:500] if response.text else None
            }
            
            # Analizar si el acceso es correcto
            if expected_access == "ALLOW":
                if response.status_code in [200, 201]:
                    result["access_correct"] = True
                else:
                    result["access_correct"] = False
                    result["issue"] = f"Acceso denegado cuando debería estar permitido (rol: {role})"
            elif expected_access == "DENY":
                if response.status_code in [403, 401]:
                    result["access_correct"] = True
                else:
                    result["access_correct"] = False
                    result["issue"] = f"Acceso permitido cuando debería estar denegado (rol: {role})"
                    result["security_violation"] = True
            
            return result
            
        except requests.exceptions.RequestException as e:
            return {
                "service": service,
                "endpoint": endpoint,
                "method": method,
                "role": role,
                "expected_access": expected_access,
                "error": str(e),
                "access_correct": False
            }
    
    def test_role_based_endpoints(self):
        """Probar endpoints con diferentes roles"""
        # Definir endpoints y sus restricciones de rol
        endpoint_tests = [
            # Users Service
            {
                "service": "users",
                "endpoint": "/users",
                "method": "GET",
                "role_requirements": {
                    "patient": "DENY",
                    "doctor": "DENY", 
                    "nurse": "DENY",
                    "admin": "ALLOW"
                }
            },
            {
                "service": "users",
                "endpoint": "/users",
                "method": "POST",
                "role_requirements": {
                    "patient": "DENY",
                    "doctor": "DENY",
                    "nurse": "DENY", 
                    "admin": "ALLOW"
                }
            },
            {
                "service": "users",
                "endpoint": "/users/1",
                "method": "GET",
                "role_requirements": {
                    "patient": "ALLOW",  # Puede ver su propio perfil
                    "doctor": "ALLOW",
                    "nurse": "ALLOW",
                    "admin": "ALLOW"
                }
            },
            
            # Medical Records Service
            {
                "service": "medical-records",
                "endpoint": "/medical-records",
                "method": "GET",
                "role_requirements": {
                    "patient": "DENY",  # Solo puede ver sus propios registros
                    "doctor": "ALLOW",
                    "nurse": "ALLOW",
                    "admin": "ALLOW"
                }
            },
            {
                "service": "medical-records",
                "endpoint": "/medical-records",
                "method": "POST",
                "role_requirements": {
                    "patient": "DENY",
                    "doctor": "ALLOW",
                    "nurse": "ALLOW",
                    "admin": "ALLOW"
                }
            },
            {
                "service": "medical-records",
                "endpoint": "/medical-records/1",
                "method": "DELETE",
                "role_requirements": {
                    "patient": "DENY",
                    "doctor": "DENY",  # Solo admin puede eliminar
                    "nurse": "DENY",
                    "admin": "ALLOW"
                }
            },
            
            # Appointments Service
            {
                "service": "appointments",
                "endpoint": "/appointments",
                "method": "GET",
                "role_requirements": {
                    "patient": "ALLOW",  # Puede ver sus citas
                    "doctor": "ALLOW",   # Puede ver sus citas
                    "nurse": "ALLOW",
                    "admin": "ALLOW"
                }
            },
            {
                "service": "appointments",
                "endpoint": "/appointments",
                "method": "POST",
                "role_requirements": {
                    "patient": "ALLOW",
                    "doctor": "ALLOW",
                    "nurse": "ALLOW",
                    "admin": "ALLOW"
                }
            },
            
            # Payments Service
            {
                "service": "payments",
                "endpoint": "/payments",
                "method": "GET",
                "role_requirements": {
                    "patient": "ALLOW",  # Solo sus propios pagos
                    "doctor": "DENY",    # No debería ver pagos
                    "nurse": "DENY",
                    "admin": "ALLOW"
                }
            },
            {
                "service": "payments",
                "endpoint": "/payments",
                "method": "POST",
                "role_requirements": {
                    "patient": "ALLOW",
                    "doctor": "DENY",
                    "nurse": "DENY",
                    "admin": "ALLOW"
                }
            },
            
            # Notifications Service
            {
                "service": "notifications",
                "endpoint": "/notifications",
                "method": "GET",
                "role_requirements": {
                    "patient": "ALLOW",
                    "doctor": "ALLOW",
                    "nurse": "ALLOW",
                    "admin": "ALLOW"
                }
            },
            {
                "service": "notifications",
                "endpoint": "/notifications",
                "method": "POST",
                "role_requirements": {
                    "patient": "DENY",  # Solo sistema puede enviar
                    "doctor": "DENY",
                    "nurse": "DENY",
                    "admin": "ALLOW"
                }
            }
        ]
        
        logger.info("🔍 Probando control de acceso basado en roles...")
        
        for endpoint_test in endpoint_tests:
            service = endpoint_test["service"]
            endpoint = endpoint_test["endpoint"]
            method = endpoint_test["method"]
            role_requirements = endpoint_test["role_requirements"]
            
            logger.info(f"🧪 Probando {method} {service}{endpoint}")
            
            for role, expected_access in role_requirements.items():
                result = self.test_endpoint_with_role(
                    service, endpoint, method, role, expected_access
                )
                self.test_results.append(result)
                
                if not result.get("access_correct", True):
                    if result.get("security_violation"):
                        self.access_violations.append(result)
                        logger.warning(f"⚠️  VIOLACIÓN DE SEGURIDAD: {role} accedió a {service}{endpoint} cuando no debería")
                    else:
                        logger.warning(f"⚠️  ACCESO INCORRECTO: {role} no pudo acceder a {service}{endpoint}")
                
                time.sleep(0.2)  # Evitar sobrecarga
    
    def test_privilege_escalation(self):
        """Probar intentos de escalación de privilegios"""
        logger.info("🔍 Probando intentos de escalación de privilegios...")
        
        # Intentar acceder a endpoints de admin con rol de paciente
        admin_endpoints = [
            {"service": "users", "endpoint": "/users", "method": "GET"},
            {"service": "users", "endpoint": "/users", "method": "POST"},
            {"service": "users", "endpoint": "/users/1", "method": "DELETE"},
            {"service": "medical-records", "endpoint": "/medical-records/admin", "method": "GET"},
            {"service": "payments", "endpoint": "/payments/admin", "method": "GET"},
        ]
        
        for endpoint_config in admin_endpoints:
            service = endpoint_config["service"]
            endpoint = endpoint_config["endpoint"]
            method = endpoint_config["method"]
            
            # Probar con rol de paciente
            result = self.test_endpoint_with_role(
                service, endpoint, method, "patient", "DENY"
            )
            result["test_type"] = "privilege_escalation"
            self.test_results.append(result)
            
            if result.get("status_code") == 200:
                result["security_violation"] = True
                result["issue"] = "Escalación de privilegios exitosa - paciente accedió a endpoint de admin"
                self.access_violations.append(result)
                logger.error(f"🚨 ESCALACIÓN DE PRIVILEGIOS: Paciente accedió a {service}{endpoint}")
    
    def test_role_confusion(self):
        """Probar confusión de roles (intentar cambiar rol en el token)"""
        logger.info("🔍 Probando confusión de roles...")
        
        # Crear token con rol falso
        fake_admin_payload = {
            "sub": "test_patient",
            "email": "patient@example.com",
            "role": "admin",  # Rol falso
            "permissions": ["all_access"],
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        
        fake_admin_token = jwt.encode(fake_admin_payload, self.JWT_SECRET, algorithm=self.JWT_ALGORITHM)
        
        # Probar endpoints de admin con token falso
        admin_endpoints = [
            {"service": "users", "endpoint": "/users", "method": "GET"},
            {"service": "medical-records", "endpoint": "/medical-records", "method": "GET"},
        ]
        
        for endpoint_config in admin_endpoints:
            service = endpoint_config["service"]
            endpoint = endpoint_config["endpoint"]
            method = endpoint_config["method"]
            
            url = f"{self.base_urls[service]}{endpoint}"
            headers = {
                "Authorization": f"Bearer {fake_admin_token}",
                "Content-Type": "application/json"
            }
            
            try:
                if method.upper() == "GET":
                    response = requests.get(url, headers=headers, timeout=10)
                elif method.upper() == "POST":
                    response = requests.post(url, headers=headers, json={}, timeout=10)
                
                result = {
                    "service": service,
                    "endpoint": endpoint,
                    "method": method,
                    "test_type": "role_confusion",
                    "status_code": response.status_code,
                    "response_time": response.elapsed.total_seconds(),
                    "fake_role": "admin",
                    "actual_user": "patient"
                }
                
                if response.status_code == 200:
                    result["security_violation"] = True
                    result["issue"] = "Confusión de roles - token falso aceptado"
                    self.access_violations.append(result)
                    logger.error(f"🚨 CONFUSIÓN DE ROLES: Token falso aceptado en {service}{endpoint}")
                
                self.test_results.append(result)
                
            except requests.exceptions.RequestException as e:
                self.test_results.append({
                    "service": service,
                    "endpoint": endpoint,
                    "method": method,
                    "test_type": "role_confusion",
                    "error": str(e)
                })
    
    def analyze_access_violations(self):
        """Analizar violaciones de acceso"""
        critical_violations = []
        high_violations = []
        medium_violations = []
        
        for violation in self.access_violations:
            service = violation.get("service", "unknown")
            endpoint = violation.get("endpoint", "")
            issue = violation.get("issue", "Acceso no autorizado")
            
            # Clasificar por severidad
            if "admin" in endpoint or "delete" in violation.get("method", "").lower():
                severity = "CRITICAL"
                critical_violations.append(violation)
            elif "medical" in service or "payment" in service:
                severity = "HIGH"
                high_violations.append(violation)
            else:
                severity = "MEDIUM"
                medium_violations.append(violation)
            
            violation["severity"] = severity
        
        return {
            "critical": critical_violations,
            "high": high_violations,
            "medium": medium_violations,
            "total": len(self.access_violations)
        }
    
    def generate_rbac_report(self):
        """Generar reporte de RBAC"""
        violations = self.analyze_access_violations()
        
        report = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "summary": {
                "total_tests": len(self.test_results),
                "access_violations": len(self.access_violations),
                "critical_violations": len(violations["critical"]),
                "high_violations": len(violations["high"]),
                "medium_violations": len(violations["medium"])
            },
            "violations": violations,
            "detailed_results": self.test_results,
            "recommendations": self._generate_rbac_recommendations(violations)
        }
        
        # Guardar reporte
        with open("rbac_test_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        return report
    
    def _generate_rbac_recommendations(self, violations: Dict) -> List[Dict]:
        """Generar recomendaciones de RBAC"""
        recommendations = []
        
        if violations["critical"]:
            recommendations.append({
                "priority": "CRITICAL",
                "issue": f"{len(violations['critical'])} violaciones críticas de RBAC",
                "recommendation": "Implementar validación estricta de roles en todos los endpoints",
                "action": "Verificar rol del usuario en cada request y validar permisos"
            })
        
        if violations["high"]:
            recommendations.append({
                "priority": "HIGH",
                "issue": f"{len(violations['high'])} violaciones de alto riesgo",
                "recommendation": "Implementar middleware de autorización centralizado",
                "action": "Crear decorador de autorización que valide roles y permisos"
            })
        
        # Recomendaciones generales
        recommendations.extend([
            {
                "priority": "HIGH",
                "issue": "Falta implementación de RBAC",
                "recommendation": "Implementar sistema completo de control de acceso basado en roles",
                "action": "Definir roles, permisos y aplicar validación en todos los endpoints"
            },
            {
                "priority": "MEDIUM",
                "issue": "Falta validación de permisos específicos",
                "recommendation": "Implementar validación granular de permisos",
                "action": "Verificar permisos específicos además del rol general"
            },
            {
                "priority": "MEDIUM",
                "issue": "Falta logging de intentos de acceso no autorizado",
                "recommendation": "Implementar auditoría de accesos",
                "action": "Registrar todos los intentos de acceso con roles y resultados"
            }
        ])
        
        return recommendations

def main():
    """Función principal"""
    print("🔒 SMD VITAL - Pruebas de Control de Acceso Basado en Roles")
    print("=" * 60)
    
    tester = RoleBasedAccessTester()
    
    try:
        # Ejecutar pruebas
        tester.test_role_based_endpoints()
        tester.test_privilege_escalation()
        tester.test_role_confusion()
        
        # Generar reporte
        report = tester.generate_rbac_report()
        
        # Mostrar resumen
        print(f"\n📊 RESUMEN DE PRUEBAS RBAC:")
        print(f"Total de pruebas: {report['summary']['total_tests']}")
        print(f"Violaciones de acceso: {report['summary']['access_violations']}")
        print(f"Violaciones críticas: {report['summary']['critical_violations']}")
        print(f"Violaciones de alto riesgo: {report['summary']['high_violations']}")
        
        if report['summary']['critical_violations'] > 0:
            print(f"\n🚨 VIOLACIONES CRÍTICAS:")
            for violation in report['violations']['critical']:
                print(f"- {violation['service']}{violation['endpoint']} - {violation.get('issue', 'Acceso no autorizado')}")
        
        print(f"\n🎯 RECOMENDACIONES PRINCIPALES:")
        for rec in report['recommendations']:
            print(f"- [{rec['priority']}] {rec['issue']}: {rec['recommendation']}")
        
        print(f"\n📄 Reporte completo guardado en: rbac_test_report.json")
        
    except Exception as e:
        logger.error(f"Error durante las pruebas: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
