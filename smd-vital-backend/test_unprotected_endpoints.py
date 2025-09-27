#!/usr/bin/env python3
"""
SMD VITAL - Pruebas de Endpoints Desprotegidos
==============================================

Script para probar endpoints que deberían requerir autenticación pero no la tienen.

Author: Backend Team
Date: 2025-01-27
"""

import requests
import json
import time
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class UnprotectedEndpointTester:
    """Clase para probar endpoints desprotegidos"""
    
    def __init__(self):
        self.base_urls = {
            "notifications": "http://localhost:8004",
            "payments": "http://localhost:8006",
            "medical-records": "http://localhost:8005",
            "health-metrics": "http://localhost:8007"
        }
        
        self.vulnerable_endpoints = []
        self.test_results = []
    
    def test_endpoint_without_auth(self, service: str, endpoint: str, method: str = "GET") -> Dict:
        """Probar endpoint sin autenticación"""
        url = f"{self.base_urls[service]}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json={}, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(url, json={}, timeout=10)
            elif method.upper() == "DELETE":
                response = requests.delete(url, timeout=10)
            
            result = {
                "service": service,
                "endpoint": endpoint,
                "method": method,
                "url": url,
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds(),
                "response_size": len(response.content),
                "headers": dict(response.headers),
                "body": response.text[:1000] if response.text else None,
                "vulnerable": response.status_code == 200 and len(response.content) > 0
            }
            
            # Analizar si el endpoint está desprotegido
            if result["vulnerable"]:
                result["security_issue"] = "Endpoint accesible sin autenticación"
                result["risk_level"] = "HIGH"
                
                # Analizar tipo de datos expuestos
                if "medical" in service or "health" in service:
                    result["data_type"] = "MEDICAL_DATA"
                    result["risk_level"] = "CRITICAL"
                elif "payment" in service:
                    result["data_type"] = "FINANCIAL_DATA"
                    result["risk_level"] = "CRITICAL"
                elif "notification" in service:
                    result["data_type"] = "PERSONAL_DATA"
                    result["risk_level"] = "HIGH"
            
            return result
            
        except requests.exceptions.RequestException as e:
            return {
                "service": service,
                "endpoint": endpoint,
                "method": method,
                "url": url,
                "error": str(e),
                "vulnerable": False
            }
    
    def test_sensitive_endpoints(self):
        """Probar endpoints sensibles sin autenticación"""
        sensitive_endpoints = [
            # Notifications Service - CRÍTICO
            {"service": "notifications", "endpoint": "/notifications", "method": "GET"},
            {"service": "notifications", "endpoint": "/notifications", "method": "POST"},
            {"service": "notifications", "endpoint": "/notifications/1", "method": "GET"},
            {"service": "notifications", "endpoint": "/notifications/1", "method": "PUT"},
            {"service": "notifications", "endpoint": "/notifications/1", "method": "DELETE"},
            
            # Payments Service - CRÍTICO
            {"service": "payments", "endpoint": "/payments", "method": "GET"},
            {"service": "payments", "endpoint": "/payments", "method": "POST"},
            {"service": "payments", "endpoint": "/payments/1", "method": "GET"},
            {"service": "payments", "endpoint": "/payments/1", "method": "PUT"},
            {"service": "payments", "endpoint": "/payments/1", "method": "DELETE"},
            
            # Medical Records Service - CRÍTICO
            {"service": "medical-records", "endpoint": "/medical-records", "method": "GET"},
            {"service": "medical-records", "endpoint": "/medical-records", "method": "POST"},
            {"service": "medical-records", "endpoint": "/medical-records/1", "method": "GET"},
            {"service": "medical-records", "endpoint": "/medical-records/1", "method": "PUT"},
            {"service": "medical-records", "endpoint": "/medical-records/1", "method": "DELETE"},
            
            # Health Metrics Service - ALTO
            {"service": "health-metrics", "endpoint": "/health-metrics", "method": "GET"},
            {"service": "health-metrics", "endpoint": "/health-metrics", "method": "POST"},
            {"service": "health-metrics", "endpoint": "/health-metrics/1", "method": "GET"},
            {"service": "health-metrics", "endpoint": "/health-metrics/1", "method": "PUT"},
            {"service": "health-metrics", "endpoint": "/health-metrics/1", "method": "DELETE"},
        ]
        
        logger.info("🔍 Probando endpoints sensibles sin autenticación...")
        
        for endpoint_config in sensitive_endpoints:
            service = endpoint_config["service"]
            endpoint = endpoint_config["endpoint"]
            method = endpoint_config["method"]
            
            logger.info(f"🧪 Probando {method} {service}{endpoint}")
            
            result = self.test_endpoint_without_auth(service, endpoint, method)
            self.test_results.append(result)
            
            if result.get("vulnerable"):
                self.vulnerable_endpoints.append(result)
                logger.warning(f"⚠️  VULNERABLE: {service}{endpoint} - {result.get('security_issue')}")
            
            time.sleep(0.5)  # Evitar sobrecarga
    
    def test_admin_endpoints(self):
        """Probar endpoints de administración sin autenticación"""
        admin_endpoints = [
            # Endpoints que deberían requerir rol admin
            {"service": "users", "endpoint": "/users", "method": "GET"},
            {"service": "users", "endpoint": "/users", "method": "POST"},
            {"service": "users", "endpoint": "/users/1", "method": "DELETE"},
            {"service": "appointments", "endpoint": "/appointments/admin", "method": "GET"},
            {"service": "medical-records", "endpoint": "/medical-records/admin", "method": "GET"},
        ]
        
        logger.info("🔍 Probando endpoints de administración...")
        
        for endpoint_config in admin_endpoints:
            service = endpoint_config["service"]
            endpoint = endpoint_config["endpoint"]
            method = endpoint_config["method"]
            
            result = self.test_endpoint_without_auth(service, endpoint, method)
            self.test_results.append(result)
            
            if result.get("status_code") == 200:
                result["security_issue"] = "Endpoint de administración accesible sin autenticación"
                result["risk_level"] = "CRITICAL"
                self.vulnerable_endpoints.append(result)
                logger.warning(f"⚠️  ADMIN VULNERABLE: {service}{endpoint}")
    
    def analyze_vulnerabilities(self):
        """Analizar vulnerabilidades encontradas"""
        critical_vulnerabilities = []
        high_vulnerabilities = []
        medium_vulnerabilities = []
        
        for result in self.vulnerable_endpoints:
            risk_level = result.get("risk_level", "MEDIUM")
            data_type = result.get("data_type", "UNKNOWN")
            
            vulnerability = {
                "endpoint": f"{result['service']}{result['endpoint']}",
                "method": result["method"],
                "status_code": result["status_code"],
                "risk_level": risk_level,
                "data_type": data_type,
                "response_size": result.get("response_size", 0),
                "security_issue": result.get("security_issue", "Endpoint desprotegido")
            }
            
            if risk_level == "CRITICAL":
                critical_vulnerabilities.append(vulnerability)
            elif risk_level == "HIGH":
                high_vulnerabilities.append(vulnerability)
            else:
                medium_vulnerabilities.append(vulnerability)
        
        return {
            "critical": critical_vulnerabilities,
            "high": high_vulnerabilities,
            "medium": medium_vulnerabilities,
            "total": len(self.vulnerable_endpoints)
        }
    
    def generate_security_report(self):
        """Generar reporte de seguridad"""
        vulnerabilities = self.analyze_vulnerabilities()
        
        report = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "summary": {
                "total_endpoints_tested": len(self.test_results),
                "vulnerable_endpoints": len(self.vulnerable_endpoints),
                "critical_vulnerabilities": len(vulnerabilities["critical"]),
                "high_vulnerabilities": len(vulnerabilities["high"]),
                "medium_vulnerabilities": len(vulnerabilities["medium"])
            },
            "vulnerabilities": vulnerabilities,
            "detailed_results": self.test_results,
            "recommendations": self._generate_recommendations(vulnerabilities)
        }
        
        # Guardar reporte
        with open("unprotected_endpoints_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        return report
    
    def _generate_recommendations(self, vulnerabilities: Dict) -> List[Dict]:
        """Generar recomendaciones de seguridad"""
        recommendations = []
        
        if vulnerabilities["critical"]:
            recommendations.append({
                "priority": "CRITICAL",
                "issue": f"{len(vulnerabilities['critical'])} vulnerabilidades críticas encontradas",
                "recommendation": "Implementar autenticación JWT obligatoria en TODOS los endpoints sensibles",
                "action": "Agregar middleware de autenticación a todos los servicios",
                "affected_services": list(set([v["endpoint"].split("/")[0] for v in vulnerabilities["critical"]]))
            })
        
        if vulnerabilities["high"]:
            recommendations.append({
                "priority": "HIGH",
                "issue": f"{len(vulnerabilities['high'])} vulnerabilidades de alto riesgo",
                "recommendation": "Implementar control de acceso basado en roles (RBAC)",
                "action": "Verificar permisos de usuario antes de permitir acceso a datos sensibles"
            })
        
        # Recomendaciones generales
        recommendations.extend([
            {
                "priority": "HIGH",
                "issue": "Falta implementación de middleware de seguridad",
                "recommendation": "Implementar middleware de autenticación centralizado",
                "action": "Crear middleware común para todos los servicios que valide JWT"
            },
            {
                "priority": "MEDIUM",
                "issue": "Falta logging de intentos de acceso no autorizado",
                "recommendation": "Implementar logging de seguridad",
                "action": "Registrar todos los intentos de acceso a endpoints protegidos"
            },
            {
                "priority": "MEDIUM",
                "issue": "Falta implementación de rate limiting",
                "recommendation": "Implementar límites de velocidad para prevenir ataques",
                "action": "Agregar rate limiting en API Gateway"
            }
        ])
        
        return recommendations

def main():
    """Función principal"""
    print("🔒 SMD VITAL - Pruebas de Endpoints Desprotegidos")
    print("=" * 50)
    
    tester = UnprotectedEndpointTester()
    
    try:
        # Ejecutar pruebas
        tester.test_sensitive_endpoints()
        tester.test_admin_endpoints()
        
        # Generar reporte
        report = tester.generate_security_report()
        
        # Mostrar resumen
        print(f"\n📊 RESUMEN DE VULNERABILIDADES:")
        print(f"Total de endpoints probados: {report['summary']['total_endpoints_tested']}")
        print(f"Endpoints vulnerables: {report['summary']['vulnerable_endpoints']}")
        print(f"Vulnerabilidades críticas: {report['summary']['critical_vulnerabilities']}")
        print(f"Vulnerabilidades de alto riesgo: {report['summary']['high_vulnerabilities']}")
        
        if report['summary']['critical_vulnerabilities'] > 0:
            print(f"\n🚨 VULNERABILIDADES CRÍTICAS:")
            for vuln in report['vulnerabilities']['critical']:
                print(f"- {vuln['endpoint']} ({vuln['method']}) - {vuln['data_type']}")
        
        print(f"\n🎯 RECOMENDACIONES PRINCIPALES:")
        for rec in report['recommendations']:
            print(f"- [{rec['priority']}] {rec['issue']}: {rec['recommendation']}")
        
        print(f"\n📄 Reporte completo guardado en: unprotected_endpoints_report.json")
        
    except Exception as e:
        logger.error(f"Error durante las pruebas: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
