#!/usr/bin/env python3
"""
SMD VITAL - Pruebas de Seguridad de Endpoints
==============================================

Script completo para probar endpoints con:
- Datos inválidos
- Tokens expirados
- Roles incorrectos
- Análisis de códigos de respuesta
- Detección de fugas de información

Author: Backend Team
Date: 2025-01-27
"""

import requests
import json
import time
import jwt
import os
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any
import logging

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SecurityEndpointTester:
    """Clase para realizar pruebas de seguridad en endpoints"""
    
    def __init__(self):
        self.base_urls = {
            "auth": "http://localhost:8001",
            "users": "http://localhost:8002", 
            "appointments": "http://localhost:8003",
            "medical-records": "http://localhost:8005",
            "payments": "http://localhost:8006",
            "notifications": "http://localhost:8004",
            "health-metrics": "http://localhost:8007",
            "ai-langgraph": "http://localhost:8008"
        }
        
        # JWT Configuration
        self.JWT_SECRET = os.getenv("JWT_SECRET_KEY", "super_secret_jwt_key_for_smd_vital_2024")
        self.JWT_ALGORITHM = "HS256"
        
        # Resultados de las pruebas
        self.test_results = {
            "invalid_data": [],
            "expired_tokens": [],
            "wrong_roles": [],
            "security_issues": [],
            "response_codes": {},
            "data_leaks": []
        }
    
    def create_expired_token(self, user_id: str = "test_user", role: str = "patient") -> str:
        """Crear un token JWT expirado"""
        payload = {
            "sub": user_id,
            "email": "test@example.com",
            "role": role,
            "exp": datetime.utcnow() - timedelta(hours=1)  # Token expirado hace 1 hora
        }
        return jwt.encode(payload, self.JWT_SECRET, algorithm=self.JWT_ALGORITHM)
    
    def create_invalid_token(self) -> str:
        """Crear un token JWT inválido"""
        return "invalid.jwt.token"
    
    def create_malformed_token(self) -> str:
        """Crear un token JWT malformado"""
        return "Bearer invalid_token_format"
    
    def test_endpoint_with_invalid_data(self, service: str, endpoint: str, method: str = "GET") -> Dict:
        """Probar endpoint con datos inválidos"""
        url = f"{self.base_urls[service]}{endpoint}"
        
        invalid_data_sets = [
            # Datos completamente vacíos
            {},
            # Datos con tipos incorrectos
            {"id": "not_a_number", "email": 123, "role": None},
            # Datos con caracteres especiales peligrosos
            {"name": "<script>alert('xss')</script>", "email": "'; DROP TABLE users; --"},
            # Datos con SQL injection
            {"query": "'; SELECT * FROM users; --"},
            # Datos con longitud excesiva
            {"description": "A" * 10000},
            # Datos con caracteres Unicode problemáticos
            {"name": "🚀💥🔥" * 100},
            # Datos con estructura JSON malformada
            {"data": "invalid_json_string"},
            # Datos con campos requeridos faltantes
            {"email": "test@example.com"},  # Sin password
            # Datos con formatos de fecha inválidos
            {"date": "not_a_date", "time": "25:70:90"},
            # Datos con números negativos donde no deberían estar
            {"age": -1, "price": -100.50}
        ]
        
        results = []
        
        for i, invalid_data in enumerate(invalid_data_sets):
            try:
                if method.upper() == "GET":
                    response = requests.get(url, params=invalid_data, timeout=10)
                elif method.upper() == "POST":
                    response = requests.post(url, json=invalid_data, timeout=10)
                elif method.upper() == "PUT":
                    response = requests.put(url, json=invalid_data, timeout=10)
                elif method.upper() == "DELETE":
                    response = requests.delete(url, json=invalid_data, timeout=10)
                
                result = {
                    "test_case": f"invalid_data_{i+1}",
                    "endpoint": f"{service}{endpoint}",
                    "method": method,
                    "status_code": response.status_code,
                    "response_time": response.elapsed.total_seconds(),
                    "response_size": len(response.content),
                    "headers": dict(response.headers),
                    "body": response.text[:500] if response.text else None,
                    "data_sent": invalid_data
                }
                
                # Analizar si hay fuga de información
                if self._analyze_data_leak(response.text, response.status_code):
                    result["data_leak_detected"] = True
                    result["leak_details"] = self._analyze_data_leak(response.text, response.status_code)
                
                results.append(result)
                
            except requests.exceptions.RequestException as e:
                results.append({
                    "test_case": f"invalid_data_{i+1}",
                    "endpoint": f"{service}{endpoint}",
                    "method": method,
                    "error": str(e),
                    "data_sent": invalid_data
                })
        
        return results
    
    def test_endpoint_with_expired_token(self, service: str, endpoint: str, method: str = "GET") -> Dict:
        """Probar endpoint con token expirado"""
        url = f"{self.base_urls[service]}{endpoint}"
        expired_token = self.create_expired_token()
        
        headers = {
            "Authorization": f"Bearer {expired_token}",
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
                "test_case": "expired_token",
                "endpoint": f"{service}{endpoint}",
                "method": method,
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds(),
                "response_size": len(response.content),
                "headers": dict(response.headers),
                "body": response.text[:500] if response.text else None,
                "token_used": expired_token[:50] + "..."
            }
            
            # Verificar si el error es apropiado para token expirado
            if response.status_code == 401 and "expired" in response.text.lower():
                result["correct_error_handling"] = True
            else:
                result["correct_error_handling"] = False
                result["security_issue"] = "Token expirado no manejado correctamente"
            
            return result
            
        except requests.exceptions.RequestException as e:
            return {
                "test_case": "expired_token",
                "endpoint": f"{service}{endpoint}",
                "method": method,
                "error": str(e)
            }
    
    def test_endpoint_with_wrong_role(self, service: str, endpoint: str, method: str = "GET", 
                                     required_role: str = "admin", user_role: str = "patient") -> Dict:
        """Probar endpoint con rol incorrecto"""
        url = f"{self.base_urls[service]}{endpoint}"
        
        # Crear token con rol incorrecto
        payload = {
            "sub": "test_user",
            "email": "test@example.com", 
            "role": user_role,
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        wrong_role_token = jwt.encode(payload, self.JWT_SECRET, algorithm=self.JWT_ALGORITHM)
        
        headers = {
            "Authorization": f"Bearer {wrong_role_token}",
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
                "test_case": "wrong_role",
                "endpoint": f"{service}{endpoint}",
                "method": method,
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds(),
                "response_size": len(response.content),
                "headers": dict(response.headers),
                "body": response.text[:500] if response.text else None,
                "required_role": required_role,
                "user_role": user_role
            }
            
            # Verificar si el acceso fue denegado correctamente
            if response.status_code == 403:
                result["correct_access_denial"] = True
            elif response.status_code == 200:
                result["security_vulnerability"] = "Acceso no autorizado permitido"
                result["correct_access_denial"] = False
            else:
                result["unexpected_response"] = True
            
            return result
            
        except requests.exceptions.RequestException as e:
            return {
                "test_case": "wrong_role",
                "endpoint": f"{service}{endpoint}",
                "method": method,
                "error": str(e)
            }
    
    def test_endpoint_with_invalid_token(self, service: str, endpoint: str, method: str = "GET") -> Dict:
        """Probar endpoint con token inválido"""
        url = f"{self.base_urls[service]}{endpoint}"
        
        invalid_tokens = [
            self.create_invalid_token(),
            self.create_malformed_token(),
            "",  # Token vacío
            "Bearer",  # Bearer sin token
            "Bearer invalid_token",
            "Basic dGVzdDp0ZXN0",  # Basic auth en lugar de Bearer
            "Bearer " + "A" * 1000,  # Token muy largo
            "Bearer " + "🚀💥🔥" * 100  # Token con caracteres especiales
        ]
        
        results = []
        
        for i, invalid_token in enumerate(invalid_tokens):
            headers = {
                "Authorization": invalid_token,
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
                    "test_case": f"invalid_token_{i+1}",
                    "endpoint": f"{service}{endpoint}",
                    "method": method,
                    "status_code": response.status_code,
                    "response_time": response.elapsed.total_seconds(),
                    "response_size": len(response.content),
                    "headers": dict(response.headers),
                    "body": response.text[:500] if response.text else None,
                    "token_used": invalid_token[:50] + "..." if len(invalid_token) > 50 else invalid_token
                }
                
                # Verificar manejo correcto de token inválido
                if response.status_code == 401:
                    result["correct_error_handling"] = True
                else:
                    result["security_issue"] = "Token inválido no rechazado correctamente"
                
                results.append(result)
                
            except requests.exceptions.RequestException as e:
                results.append({
                    "test_case": f"invalid_token_{i+1}",
                    "endpoint": f"{service}{endpoint}",
                    "method": method,
                    "error": str(e),
                    "token_used": invalid_token[:50] + "..." if len(invalid_token) > 50 else invalid_token
                })
        
        return results
    
    def _analyze_data_leak(self, response_text: str, status_code: int) -> Dict:
        """Analizar si hay fuga de información en la respuesta"""
        leaks = []
        
        # Patrones que indican fuga de información
        leak_patterns = [
            r"database.*error",
            r"sql.*error", 
            r"connection.*failed",
            r"internal.*error",
            r"stack.*trace",
            r"file.*path",
            r"line.*\d+",
            r"exception.*at",
            r"debug.*info",
            r"localhost:\d+",
            r"password.*=.*",
            r"secret.*=.*",
            r"key.*=.*",
            r"token.*=.*",
            r"jwt.*secret",
            r"database.*url",
            r"redis.*url",
            r"rabbitmq.*url"
        ]
        
        import re
        for pattern in leak_patterns:
            matches = re.findall(pattern, response_text, re.IGNORECASE)
            if matches:
                leaks.append({
                    "pattern": pattern,
                    "matches": matches,
                    "severity": "HIGH" if "password" in pattern or "secret" in pattern else "MEDIUM"
                })
        
        # Verificar si se expone información del sistema
        system_info_patterns = [
            r"python.*\d+\.\d+",
            r"fastapi.*\d+\.\d+",
            r"uvicorn.*\d+\.\d+",
            r"pydantic.*\d+\.\d+",
            r"sqlalchemy.*\d+\.\d+",
            r"psycopg2.*\d+\.\d+"
        ]
        
        for pattern in system_info_patterns:
            matches = re.findall(pattern, response_text, re.IGNORECASE)
            if matches:
                leaks.append({
                    "pattern": pattern,
                    "matches": matches,
                    "severity": "LOW",
                    "type": "system_info"
                })
        
        return {
            "leaks_detected": len(leaks) > 0,
            "leak_count": len(leaks),
            "leaks": leaks
        } if leaks else None
    
    def run_comprehensive_security_tests(self):
        """Ejecutar todas las pruebas de seguridad"""
        logger.info("🔒 Iniciando pruebas de seguridad de endpoints...")
        
        # Definir endpoints a probar
        endpoints_to_test = [
            # Auth Service
            {"service": "auth", "endpoint": "/register", "method": "POST", "requires_auth": False},
            {"service": "auth", "endpoint": "/login", "method": "POST", "requires_auth": False},
            {"service": "auth", "endpoint": "/me", "method": "GET", "requires_auth": True},
            {"service": "auth", "endpoint": "/refresh", "method": "POST", "requires_auth": True},
            
            # Users Service
            {"service": "users", "endpoint": "/users", "method": "GET", "requires_auth": True, "required_role": "admin"},
            {"service": "users", "endpoint": "/users", "method": "POST", "requires_auth": True, "required_role": "admin"},
            {"service": "users", "endpoint": "/users/1", "method": "GET", "requires_auth": True},
            {"service": "users", "endpoint": "/users/1", "method": "PUT", "requires_auth": True},
            
            # Appointments Service
            {"service": "appointments", "endpoint": "/appointments", "method": "GET", "requires_auth": True},
            {"service": "appointments", "endpoint": "/appointments", "method": "POST", "requires_auth": True},
            {"service": "appointments", "endpoint": "/appointments/1", "method": "GET", "requires_auth": True},
            {"service": "appointments", "endpoint": "/appointments/1", "method": "PUT", "requires_auth": True},
            {"service": "appointments", "endpoint": "/appointments/1", "method": "DELETE", "requires_auth": True},
            
            # Medical Records Service
            {"service": "medical-records", "endpoint": "/medical-records", "method": "GET", "requires_auth": True, "required_role": "doctor"},
            {"service": "medical-records", "endpoint": "/medical-records", "method": "POST", "requires_auth": True, "required_role": "doctor"},
            {"service": "medical-records", "endpoint": "/medical-records/1", "method": "GET", "requires_auth": True},
            
            # Payments Service
            {"service": "payments", "endpoint": "/payments", "method": "GET", "requires_auth": True},
            {"service": "payments", "endpoint": "/payments", "method": "POST", "requires_auth": True},
            {"service": "payments", "endpoint": "/payments/1", "method": "GET", "requires_auth": True},
            
            # Notifications Service
            {"service": "notifications", "endpoint": "/notifications", "method": "GET", "requires_auth": True},
            {"service": "notifications", "endpoint": "/notifications", "method": "POST", "requires_auth": True},
            
            # Health Metrics Service
            {"service": "health-metrics", "endpoint": "/health-metrics", "method": "GET", "requires_auth": True},
            {"service": "health-metrics", "endpoint": "/health-metrics", "method": "POST", "requires_auth": True},
        ]
        
        total_tests = 0
        passed_tests = 0
        security_issues = 0
        
        for endpoint_config in endpoints_to_test:
            service = endpoint_config["service"]
            endpoint = endpoint_config["endpoint"]
            method = endpoint_config["method"]
            requires_auth = endpoint_config.get("requires_auth", False)
            required_role = endpoint_config.get("required_role", None)
            
            logger.info(f"🧪 Probando {method} {service}{endpoint}")
            
            # 1. Probar con datos inválidos
            if method in ["POST", "PUT"]:
                invalid_data_results = self.test_endpoint_with_invalid_data(service, endpoint, method)
                self.test_results["invalid_data"].extend(invalid_data_results)
                total_tests += len(invalid_data_results)
            
            # 2. Probar con tokens expirados (solo si requiere autenticación)
            if requires_auth:
                expired_token_result = self.test_endpoint_with_expired_token(service, endpoint, method)
                self.test_results["expired_tokens"].append(expired_token_result)
                total_tests += 1
                
                # 3. Probar con tokens inválidos
                invalid_token_results = self.test_endpoint_with_invalid_token(service, endpoint, method)
                self.test_results["expired_tokens"].extend(invalid_token_results)
                total_tests += len(invalid_token_results)
                
                # 4. Probar con roles incorrectos (si tiene rol requerido)
                if required_role:
                    wrong_role_result = self.test_endpoint_with_wrong_role(
                        service, endpoint, method, required_role, "patient"
                    )
                    self.test_results["wrong_roles"].append(wrong_role_result)
                    total_tests += 1
        
        # Analizar resultados
        self._analyze_results()
        
        # Generar reporte
        self._generate_security_report()
        
        logger.info(f"✅ Pruebas completadas: {total_tests} tests ejecutados")
        return self.test_results
    
    def _analyze_results(self):
        """Analizar resultados de las pruebas"""
        # Contar códigos de respuesta
        for test_type, results in self.test_results.items():
            if isinstance(results, list):
                for result in results:
                    if "status_code" in result:
                        status_code = result["status_code"]
                        if status_code not in self.test_results["response_codes"]:
                            self.test_results["response_codes"][status_code] = 0
                        self.test_results["response_codes"][status_code] += 1
        
        # Detectar problemas de seguridad
        for test_type, results in self.test_results.items():
            if isinstance(results, list):
                for result in results:
                    if result.get("data_leak_detected"):
                        self.test_results["data_leaks"].append(result)
                    
                    if result.get("security_issue") or result.get("security_vulnerability"):
                        self.test_results["security_issues"].append(result)
    
    def _generate_security_report(self):
        """Generar reporte de seguridad"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": sum(len(results) if isinstance(results, list) else 0 
                                 for results in self.test_results.values()),
                "response_codes": self.test_results["response_codes"],
                "security_issues_count": len(self.test_results["security_issues"]),
                "data_leaks_count": len(self.test_results["data_leaks"])
            },
            "detailed_results": self.test_results,
            "recommendations": self._generate_recommendations()
        }
        
        # Guardar reporte
        with open("security_test_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        logger.info("📊 Reporte de seguridad guardado en: security_test_report.json")
        return report
    
    def _generate_recommendations(self) -> List[Dict]:
        """Generar recomendaciones de seguridad"""
        recommendations = []
        
        # Analizar códigos de respuesta
        response_codes = self.test_results["response_codes"]
        
        if 500 in response_codes:
            recommendations.append({
                "type": "ERROR_HANDLING",
                "priority": "HIGH",
                "issue": "Errores 500 detectados",
                "recommendation": "Implementar manejo de errores robusto para evitar exposición de información interna",
                "action": "Revisar logs de errores y implementar try-catch en todos los endpoints"
            })
        
        if 200 in response_codes and any("security_issue" in result for result in self.test_results["expired_tokens"]):
            recommendations.append({
                "type": "AUTHENTICATION",
                "priority": "CRITICAL", 
                "issue": "Tokens expirados aceptados",
                "recommendation": "Implementar validación estricta de expiración de tokens JWT",
                "action": "Verificar lógica de validación de tokens en todos los servicios"
            })
        
        # Analizar fugas de datos
        if self.test_results["data_leaks"]:
            recommendations.append({
                "type": "DATA_LEAK",
                "priority": "HIGH",
                "issue": f"{len(self.test_results['data_leaks'])} fugas de información detectadas",
                "recommendation": "Implementar masking de datos sensibles en respuestas de error",
                "action": "Revisar mensajes de error y ocultar información interna del sistema"
            })
        
        # Recomendaciones de estandarización
        recommendations.extend([
            {
                "type": "STANDARDIZATION",
                "priority": "MEDIUM",
                "issue": "Falta estandarización de respuestas de error",
                "recommendation": "Implementar formato estándar para respuestas de error",
                "action": "Crear middleware de manejo de errores unificado"
            },
            {
                "type": "SECURITY_HEADERS",
                "priority": "MEDIUM", 
                "issue": "Falta implementación de headers de seguridad",
                "recommendation": "Agregar headers de seguridad estándar",
                "action": "Implementar X-Content-Type-Options, X-Frame-Options, etc."
            },
            {
                "type": "RATE_LIMITING",
                "priority": "MEDIUM",
                "issue": "Falta implementación de rate limiting",
                "recommendation": "Implementar límites de velocidad para prevenir ataques",
                "action": "Agregar middleware de rate limiting en API Gateway"
            }
        ])
        
        return recommendations

def main():
    """Función principal"""
    print("🔒 SMD VITAL - Pruebas de Seguridad de Endpoints")
    print("=" * 50)
    
    tester = SecurityEndpointTester()
    
    try:
        results = tester.run_comprehensive_security_tests()
        
        print("\n📊 RESUMEN DE RESULTADOS:")
        print(f"Total de pruebas: {sum(len(results) if isinstance(results, list) else 0 for results in results.values())}")
        print(f"Códigos de respuesta: {results['response_codes']}")
        print(f"Problemas de seguridad: {len(results['security_issues'])}")
        print(f"Fugas de datos: {len(results['data_leaks'])}")
        
        print("\n🎯 RECOMENDACIONES PRINCIPALES:")
        for rec in results.get('recommendations', []):
            print(f"- [{rec['priority']}] {rec['issue']}: {rec['recommendation']}")
        
        print(f"\n📄 Reporte completo guardado en: security_test_report.json")
        
    except Exception as e:
        logger.error(f"Error durante las pruebas: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
