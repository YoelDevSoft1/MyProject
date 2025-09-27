#!/usr/bin/env python3
"""
SMD VITAL - Pruebas de Masking de Datos y Estandarización
==========================================================

Script para probar el masking de datos sensibles y la estandarización de respuestas de error.

Author: Backend Team
Date: 2025-01-27
"""

import requests
import json
import time
import jwt
import os
import re
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataMaskingStandardizationTester:
    """Clase para probar masking de datos y estandarización"""
    
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
        
        # Patrones de datos sensibles
        self.sensitive_patterns = {
            "passwords": [r"password['\"]?\s*[:=]\s*['\"][^'\"]+['\"]", r"passwd['\"]?\s*[:=]\s*['\"][^'\"]+['\"]"],
            "tokens": [r"token['\"]?\s*[:=]\s*['\"][^'\"]+['\"]", r"jwt['\"]?\s*[:=]\s*['\"][^'\"]+['\"]"],
            "secrets": [r"secret['\"]?\s*[:=]\s*['\"][^'\"]+['\"]", r"key['\"]?\s*[:=]\s*['\"][^'\"]+['\"]"],
            "emails": [r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"],
            "phone_numbers": [r"\+?[\d\s\-\(\)]{10,}"],
            "credit_cards": [r"\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}"],
            "ssn": [r"\d{3}-\d{2}-\d{4}"],
            "database_urls": [r"postgresql://[^'\"]+", r"mysql://[^'\"]+", r"mongodb://[^'\"]+"],
            "api_keys": [r"api[_-]?key['\"]?\s*[:=]\s*['\"][^'\"]+['\"]"],
            "internal_ips": [r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b"],
            "file_paths": [r"[A-Za-z]:\\[^'\"]+", r"/[^'\"]+"],
            "stack_traces": [r"Traceback \(most recent call last\):", r"File \".*\", line \d+", r"Exception:.*"]
        }
        
        self.test_results = []
        self.data_leaks = []
        self.standardization_issues = []
    
    def create_invalid_token(self) -> str:
        """Crear token inválido para probar manejo de errores"""
        return "invalid.jwt.token"
    
    def test_error_response_standardization(self, service: str, endpoint: str, method: str = "GET") -> Dict:
        """Probar estandarización de respuestas de error"""
        url = f"{self.base_urls[service]}{endpoint}"
        
        # Probar diferentes tipos de errores
        error_scenarios = [
            {
                "name": "invalid_token",
                "headers": {"Authorization": "Bearer invalid_token"},
                "expected_status": 401
            },
            {
                "name": "expired_token", 
                "headers": {"Authorization": f"Bearer {self.create_invalid_token()}"},
                "expected_status": 401
            },
            {
                "name": "no_auth_header",
                "headers": {},
                "expected_status": 401
            },
            {
                "name": "malformed_auth",
                "headers": {"Authorization": "InvalidFormat token"},
                "expected_status": 401
            }
        ]
        
        results = []
        
        for scenario in error_scenarios:
            try:
                if method.upper() == "GET":
                    response = requests.get(url, headers=scenario["headers"], timeout=10)
                elif method.upper() == "POST":
                    response = requests.post(url, headers=scenario["headers"], json={}, timeout=10)
                elif method.upper() == "PUT":
                    response = requests.put(url, headers=scenario["headers"], json={}, timeout=10)
                elif method.upper() == "DELETE":
                    response = requests.delete(url, headers=scenario["headers"], timeout=10)
                
                result = {
                    "service": service,
                    "endpoint": endpoint,
                    "method": method,
                    "scenario": scenario["name"],
                    "status_code": response.status_code,
                    "expected_status": scenario["expected_status"],
                    "response_time": response.elapsed.total_seconds(),
                    "response_size": len(response.content),
                    "headers": dict(response.headers),
                    "body": response.text,
                    "content_type": response.headers.get("content-type", ""),
                    "standardization_score": self._evaluate_standardization(response)
                }
                
                # Verificar si el código de estado es correcto
                if response.status_code == scenario["expected_status"]:
                    result["status_correct"] = True
                else:
                    result["status_correct"] = False
                    result["standardization_issue"] = f"Status code incorrecto: esperado {scenario['expected_status']}, obtenido {response.status_code}"
                
                results.append(result)
                
            except requests.exceptions.RequestException as e:
                results.append({
                    "service": service,
                    "endpoint": endpoint,
                    "method": method,
                    "scenario": scenario["name"],
                    "error": str(e),
                    "standardization_score": 0
                })
        
        return results
    
    def test_data_masking(self, service: str, endpoint: str, method: str = "GET") -> Dict:
        """Probar masking de datos sensibles en respuestas de error"""
        url = f"{self.base_urls[service]}{endpoint}"
        
        # Probar con datos que podrían causar errores internos
        error_trigger_data = [
            {"invalid_json": "not_a_json"},
            {"sql_injection": "'; DROP TABLE users; --"},
            {"xss_attempt": "<script>alert('xss')</script>"},
            {"path_traversal": "../../../etc/passwd"},
            {"null_byte": "test\x00string"},
            {"unicode_bomb": "🚀" * 1000},
            {"oversized_data": "A" * 10000}
        ]
        
        results = []
        
        for i, error_data in enumerate(error_trigger_data):
            try:
                if method.upper() == "GET":
                    response = requests.get(url, params=error_data, timeout=10)
                elif method.upper() == "POST":
                    response = requests.post(url, json=error_data, timeout=10)
                elif method.upper() == "PUT":
                    response = requests.put(url, json=error_data, timeout=10)
                elif method.upper() == "DELETE":
                    response = requests.delete(url, json=error_data, timeout=10)
                
                result = {
                    "service": service,
                    "endpoint": endpoint,
                    "method": method,
                    "error_trigger": list(error_data.keys())[0],
                    "status_code": response.status_code,
                    "response_time": response.elapsed.total_seconds(),
                    "response_size": len(response.content),
                    "body": response.text,
                    "data_leaks": self._detect_data_leaks(response.text),
                    "masking_score": self._evaluate_masking(response.text)
                }
                
                # Verificar si hay fuga de datos sensibles
                if result["data_leaks"]["leaks_detected"]:
                    result["security_issue"] = "Fuga de datos sensibles detectada"
                    self.data_leaks.append(result)
                
                results.append(result)
                
            except requests.exceptions.RequestException as e:
                results.append({
                    "service": service,
                    "endpoint": endpoint,
                    "method": method,
                    "error_trigger": list(error_data.keys())[0],
                    "error": str(e)
                })
        
        return results
    
    def _detect_data_leaks(self, response_text: str) -> Dict:
        """Detectar fugas de datos sensibles"""
        leaks = []
        
        for category, patterns in self.sensitive_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, response_text, re.IGNORECASE)
                if matches:
                    leaks.append({
                        "category": category,
                        "pattern": pattern,
                        "matches": matches,
                        "severity": self._get_leak_severity(category)
                    })
        
        return {
            "leaks_detected": len(leaks) > 0,
            "leak_count": len(leaks),
            "leaks": leaks,
            "severity_score": max([leak["severity"] for leak in leaks]) if leaks else 0
        }
    
    def _get_leak_severity(self, category: str) -> int:
        """Obtener severidad de fuga de datos"""
        severity_map = {
            "passwords": 10,
            "tokens": 10,
            "secrets": 10,
            "api_keys": 9,
            "database_urls": 8,
            "credit_cards": 8,
            "ssn": 8,
            "emails": 5,
            "phone_numbers": 5,
            "internal_ips": 6,
            "file_paths": 7,
            "stack_traces": 8
        }
        return severity_map.get(category, 5)
    
    def _evaluate_masking(self, response_text: str) -> int:
        """Evaluar calidad del masking de datos"""
        score = 100
        
        # Penalizar por cada fuga detectada
        leaks = self._detect_data_leaks(response_text)
        if leaks["leaks_detected"]:
            score -= leaks["severity_score"] * 10
        
        # Verificar si hay información del sistema
        system_info_patterns = [
            r"python.*\d+\.\d+",
            r"fastapi.*\d+\.\d+",
            r"uvicorn.*\d+\.\d+",
            r"sqlalchemy.*\d+\.\d+",
            r"psycopg2.*\d+\.\d+",
            r"pydantic.*\d+\.\d+"
        ]
        
        for pattern in system_info_patterns:
            if re.search(pattern, response_text, re.IGNORECASE):
                score -= 5
        
        return max(0, score)
    
    def _evaluate_standardization(self, response) -> int:
        """Evaluar estandarización de respuesta"""
        score = 100
        
        # Verificar headers estándar
        required_headers = ["content-type", "content-length"]
        for header in required_headers:
            if header not in response.headers:
                score -= 10
        
        # Verificar formato JSON en respuestas de error
        if response.status_code >= 400:
            try:
                json.loads(response.text)
                score += 10  # Bonus por formato JSON válido
            except:
                score -= 20  # Penalización por formato inválido
        
        # Verificar estructura de respuesta
        if response.status_code >= 400:
            try:
                error_data = json.loads(response.text)
                required_fields = ["error", "message", "detail"]
                if any(field in error_data for field in required_fields):
                    score += 10
                else:
                    score -= 15
            except:
                pass
        
        # Verificar códigos de estado apropiados
        if response.status_code in [200, 201, 400, 401, 403, 404, 422, 500]:
            score += 5
        else:
            score -= 10
        
        return max(0, min(100, score))
    
    def test_response_consistency(self):
        """Probar consistencia de respuestas entre servicios"""
        logger.info("🔍 Probando consistencia de respuestas entre servicios...")
        
        # Endpoints similares en diferentes servicios
        similar_endpoints = [
            {"service": "users", "endpoint": "/users", "method": "GET"},
            {"service": "appointments", "endpoint": "/appointments", "method": "GET"},
            {"service": "medical-records", "endpoint": "/medical-records", "method": "GET"},
            {"service": "notifications", "endpoint": "/notifications", "method": "GET"}
        ]
        
        consistency_results = []
        
        for endpoint_config in similar_endpoints:
            service = endpoint_config["service"]
            endpoint = endpoint_config["endpoint"]
            method = endpoint_config["method"]
            
            # Probar con token inválido
            result = self.test_error_response_standardization(service, endpoint, method)
            consistency_results.extend(result)
        
        # Analizar consistencia
        status_codes = [r["status_code"] for r in consistency_results if "status_code" in r]
        content_types = [r.get("content_type", "") for r in consistency_results if "content_type" in r]
        
        consistency_analysis = {
            "status_code_consistency": len(set(status_codes)) == 1 if status_codes else False,
            "content_type_consistency": len(set(content_types)) == 1 if content_types else False,
            "average_standardization_score": sum(r.get("standardization_score", 0) for r in consistency_results) / len(consistency_results) if consistency_results else 0
        }
        
        return consistency_analysis
    
    def run_comprehensive_masking_tests(self):
        """Ejecutar todas las pruebas de masking y estandarización"""
        logger.info("🔍 Iniciando pruebas de masking y estandarización...")
        
        # Definir endpoints a probar
        endpoints_to_test = [
            {"service": "auth", "endpoint": "/me", "method": "GET"},
            {"service": "users", "endpoint": "/users", "method": "GET"},
            {"service": "users", "endpoint": "/users", "method": "POST"},
            {"service": "appointments", "endpoint": "/appointments", "method": "GET"},
            {"service": "medical-records", "endpoint": "/medical-records", "method": "GET"},
            {"service": "payments", "endpoint": "/payments", "method": "GET"},
            {"service": "notifications", "endpoint": "/notifications", "method": "GET"},
            {"service": "health-metrics", "endpoint": "/health-metrics", "method": "GET"}
        ]
        
        all_results = []
        
        for endpoint_config in endpoints_to_test:
            service = endpoint_config["service"]
            endpoint = endpoint_config["endpoint"]
            method = endpoint_config["method"]
            
            logger.info(f"🧪 Probando {method} {service}{endpoint}")
            
            # Probar estandarización de errores
            error_results = self.test_error_response_standardization(service, endpoint, method)
            all_results.extend(error_results)
            
            # Probar masking de datos
            if method in ["POST", "PUT"]:
                masking_results = self.test_data_masking(service, endpoint, method)
                all_results.extend(masking_results)
            
            time.sleep(0.5)  # Evitar sobrecarga
        
        # Probar consistencia entre servicios
        consistency_analysis = self.test_response_consistency()
        
        return {
            "detailed_results": all_results,
            "consistency_analysis": consistency_analysis,
            "data_leaks": self.data_leaks,
            "standardization_issues": self.standardization_issues
        }
    
    def generate_masking_report(self, results: Dict):
        """Generar reporte de masking y estandarización"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": len(results["detailed_results"]),
                "data_leaks_detected": len(results["data_leaks"]),
                "standardization_issues": len(results["standardization_issues"]),
                "consistency_score": results["consistency_analysis"]["average_standardization_score"]
            },
            "detailed_results": results["detailed_results"],
            "data_leaks": results["data_leaks"],
            "consistency_analysis": results["consistency_analysis"],
            "recommendations": self._generate_masking_recommendations(results)
        }
        
        # Guardar reporte
        with open("data_masking_standardization_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        return report
    
    def _generate_masking_recommendations(self, results: Dict) -> List[Dict]:
        """Generar recomendaciones de masking y estandarización"""
        recommendations = []
        
        if results["data_leaks"]:
            recommendations.append({
                "priority": "CRITICAL",
                "category": "DATA_MASKING",
                "issue": f"{len(results['data_leaks'])} fugas de datos sensibles detectadas",
                "recommendation": "Implementar masking obligatorio de datos sensibles",
                "actions": [
                    "Ocultar passwords, tokens y secretos en respuestas de error",
                    "Implementar sanitización de stack traces",
                    "Ocultar información de base de datos y URLs internas",
                    "Implementar logging seguro sin exposición de datos"
                ]
            })
        
        if results["consistency_analysis"]["average_standardization_score"] < 70:
            recommendations.append({
                "priority": "HIGH",
                "category": "STANDARDIZATION",
                "issue": "Falta estandarización de respuestas de error",
                "recommendation": "Implementar formato estándar para todas las respuestas",
                "actions": [
                    "Crear middleware de manejo de errores unificado",
                    "Estandarizar códigos de respuesta HTTP",
                    "Implementar formato JSON consistente para errores",
                    "Agregar headers de seguridad estándar"
                ]
            })
        
        if not results["consistency_analysis"]["status_code_consistency"]:
            recommendations.append({
                "priority": "MEDIUM",
                "category": "CONSISTENCY",
                "issue": "Inconsistencia en códigos de respuesta entre servicios",
                "recommendation": "Estandarizar códigos de respuesta HTTP",
                "actions": [
                    "Definir estándares de códigos de respuesta",
                    "Implementar validación centralizada",
                    "Crear documentación de códigos de respuesta"
                ]
            })
        
        return recommendations

def main():
    """Función principal"""
    print("🔒 SMD VITAL - Pruebas de Masking de Datos y Estandarización")
    print("=" * 65)
    
    tester = DataMaskingStandardizationTester()
    
    try:
        # Ejecutar pruebas
        results = tester.run_comprehensive_masking_tests()
        
        # Generar reporte
        report = tester.generate_masking_report(results)
        
        # Mostrar resumen
        print(f"\n📊 RESUMEN DE PRUEBAS:")
        print(f"Total de pruebas: {report['summary']['total_tests']}")
        print(f"Fugas de datos detectadas: {report['summary']['data_leaks_detected']}")
        print(f"Problemas de estandarización: {report['summary']['standardization_issues']}")
        print(f"Puntuación de consistencia: {report['summary']['consistency_score']:.1f}/100")
        
        if report['summary']['data_leaks_detected'] > 0:
            print(f"\n🚨 FUGAS DE DATOS DETECTADAS:")
            for leak in report['data_leaks'][:5]:  # Mostrar solo las primeras 5
                print(f"- {leak['service']}{leak['endpoint']} - {leak.get('security_issue', 'Fuga de datos')}")
        
        print(f"\n🎯 RECOMENDACIONES PRINCIPALES:")
        for rec in report['recommendations']:
            print(f"- [{rec['priority']}] {rec['issue']}: {rec['recommendation']}")
        
        print(f"\n📄 Reporte guardado en: data_masking_standardization_report.json")
        
    except Exception as e:
        logger.error(f"Error durante las pruebas: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
