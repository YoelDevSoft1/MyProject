#!/usr/bin/env python3
"""
SMD VITAL - Comprehensive Endpoint Testing
==========================================

Script para testear endpoints con datos inválidos, tokens expirados y roles incorrectos.
Analiza códigos de respuesta, mensajes de error y sugiere estandarización.

Author: Security Testing Team
Date: 2025-01-27
"""

import asyncio
import json
import time
import jwt
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import logging

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuración de la API
API_BASE_URL = "http://localhost:8000"
AUTH_SERVICE_URL = "http://localhost:8001"
USERS_SERVICE_URL = "http://localhost:8002"
APPOINTMENTS_SERVICE_URL = "http://localhost:8003"
MEDICAL_RECORDS_SERVICE_URL = "http://localhost:8004"
PAYMENTS_SERVICE_URL = "http://localhost:8005"
NOTIFICATIONS_SERVICE_URL = "http://localhost:8006"

# JWT Configuration
JWT_SECRET = "super_secret_jwt_key_for_smd_vital_2024"
JWT_ALGORITHM = "HS256"

class TestResult:
    """Resultado de un test individual"""
    def __init__(self, endpoint: str, method: str, status_code: int, 
                 response_data: Dict, error_message: str = None, 
                 test_type: str = "unknown"):
        self.endpoint = endpoint
        self.method = method
        self.status_code = status_code
        self.response_data = response_data
        self.error_message = error_message
        self.test_type = test_type
        self.timestamp = datetime.now()

class EndpointTester:
    """Clase principal para testing de endpoints"""
    
    def __init__(self):
        self.results: List[TestResult] = []
        self.valid_tokens: Dict[str, str] = {}
        self.expired_tokens: Dict[str, str] = {}
        self.invalid_tokens: Dict[str, str] = {}
        
    async def run_comprehensive_tests(self):
        """Ejecuta todos los tests comprehensivos"""
        logger.info("🚀 Iniciando tests comprehensivos de endpoints SMD VITAL")
        
        # 1. Preparar tokens de prueba
        await self._prepare_test_tokens()
        
        # 2. Tests de datos inválidos
        await self._test_invalid_data()
        
        # 3. Tests de tokens expirados
        await self._test_expired_tokens()
        
        # 4. Tests de roles incorrectos
        await self._test_incorrect_roles()
        
        # 5. Tests de endpoints sin autenticación
        await self._test_unprotected_endpoints()
        
        # 6. Tests de validación de entrada
        await self._test_input_validation()
        
        # 7. Generar reporte
        self._generate_report()
        
    async def _prepare_test_tokens(self):
        """Prepara tokens válidos, expirados e inválidos para testing"""
        logger.info("🔑 Preparando tokens de prueba...")
        
        # Crear usuario de prueba para cada rol
        test_users = [
            {"email": "patient@test.com", "password": "Test123!", "role": "patient"},
            {"email": "doctor@test.com", "password": "Test123!", "role": "doctor"},
            {"email": "admin@test.com", "password": "Test123!", "role": "admin"},
            {"email": "nurse@test.com", "password": "Test123!", "role": "nurse"}
        ]
        
        for user_data in test_users:
            try:
                # Registrar usuario
                register_response = requests.post(
                    f"{AUTH_SERVICE_URL}/register",
                    json=user_data,
                    timeout=10
                )
                
                if register_response.status_code in [200, 201, 409]:  # 409 = usuario ya existe
                    # Login para obtener token
                    login_response = requests.post(
                        f"{AUTH_SERVICE_URL}/login",
                        data={"username": user_data["email"], "password": user_data["password"]},
                        timeout=10
                    )
                    
                    if login_response.status_code == 200:
                        token_data = login_response.json()
                        self.valid_tokens[user_data["role"]] = token_data["access_token"]
                        logger.info(f"✅ Token válido obtenido para rol: {user_data['role']}")
                
            except Exception as e:
                logger.warning(f"⚠️ Error preparando token para {user_data['role']}: {e}")
        
        # Crear tokens expirados
        for role in ["patient", "doctor", "admin"]:
            expired_payload = {
                "sub": f"test_{role}_id",
                "email": f"{role}@test.com",
                "role": role,
                "exp": datetime.utcnow() - timedelta(hours=1)  # Token expirado hace 1 hora
            }
            expired_token = jwt.encode(expired_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
            self.expired_tokens[role] = expired_token
        
        # Crear tokens inválidos
        self.invalid_tokens = {
            "malformed": "invalid.token.here",
            "wrong_signature": jwt.encode({"sub": "test"}, "wrong_secret", algorithm=JWT_ALGORITHM),
            "empty": "",
            "none": "none"
        }
        
        logger.info(f"🔑 Tokens preparados - Válidos: {len(self.valid_tokens)}, Expirados: {len(self.expired_tokens)}")
    
    async def _test_invalid_data(self):
        """Tests con datos inválidos para todos los endpoints"""
        logger.info("📝 Testing datos inválidos...")
        
        # Datos de prueba inválidos
        invalid_data_sets = {
            "empty_data": {},
            "null_values": {"email": None, "password": None},
            "invalid_email": {"email": "invalid-email", "password": "Test123!"},
            "weak_password": {"email": "test@test.com", "password": "123"},
            "sql_injection": {"email": "test@test.com'; DROP TABLE users; --", "password": "Test123!"},
            "xss_attempt": {"email": "<script>alert('xss')</script>@test.com", "password": "Test123!"},
            "oversized_data": {"email": "test@test.com", "password": "Test123!", "extra": "x" * 10000},
            "special_chars": {"email": "test@test.com", "password": "Test123!@#$%^&*()"},
            "unicode": {"email": "tëst@tëst.com", "password": "Tëst123!"},
            "json_injection": {"email": "test@test.com", "password": "Test123!", "role": '{"admin": true}'}
        }
        
        # Endpoints a testear
        endpoints_to_test = [
            {"url": f"{AUTH_SERVICE_URL}/register", "method": "POST", "requires_auth": False},
            {"url": f"{AUTH_SERVICE_URL}/login", "method": "POST", "requires_auth": False},
            {"url": f"{USERS_SERVICE_URL}/profile", "method": "PUT", "requires_auth": True},
            {"url": f"{APPOINTMENTS_SERVICE_URL}/appointments", "method": "POST", "requires_auth": True},
            {"url": f"{MEDICAL_RECORDS_SERVICE_URL}/records", "method": "POST", "requires_auth": True},
            {"url": f"{PAYMENTS_SERVICE_URL}/payments", "method": "POST", "requires_auth": True},
        ]
        
        for endpoint in endpoints_to_test:
            for data_name, invalid_data in invalid_data_sets.items():
                await self._test_single_endpoint(
                    endpoint["url"], 
                    endpoint["method"], 
                    invalid_data, 
                    endpoint["requires_auth"],
                    f"invalid_data_{data_name}"
                )
    
    async def _test_expired_tokens(self):
        """Tests con tokens expirados"""
        logger.info("⏰ Testing tokens expirados...")
        
        protected_endpoints = [
            {"url": f"{USERS_SERVICE_URL}/profile", "method": "GET"},
            {"url": f"{APPOINTMENTS_SERVICE_URL}/appointments", "method": "GET"},
            {"url": f"{MEDICAL_RECORDS_SERVICE_URL}/records", "method": "GET"},
            {"url": f"{PAYMENTS_SERVICE_URL}/payments", "method": "GET"},
            {"url": f"{NOTIFICATIONS_SERVICE_URL}/notifications", "method": "GET"},
        ]
        
        for endpoint in protected_endpoints:
            for role, expired_token in self.expired_tokens.items():
                await self._test_single_endpoint(
                    endpoint["url"],
                    endpoint["method"],
                    {},
                    True,
                    f"expired_token_{role}",
                    expired_token
                )
    
    async def _test_incorrect_roles(self):
        """Tests con roles incorrectos para endpoints específicos"""
        logger.info("👥 Testing roles incorrectos...")
        
        # Endpoints que requieren roles específicos
        role_specific_endpoints = [
            {
                "url": f"{APPOINTMENTS_SERVICE_URL}/appointments",
                "method": "POST",
                "required_role": "doctor",
                "data": {
                    "service_type": "consulta_general",
                    "scheduled_date": "2024-12-01T10:00:00Z",
                    "address": "Test Address",
                    "notes": "Test appointment"
                }
            },
            {
                "url": f"{MEDICAL_RECORDS_SERVICE_URL}/records",
                "method": "POST",
                "required_role": "doctor",
                "data": {
                    "patient_id": "test_patient_id",
                    "diagnosis": "Test diagnosis",
                    "treatment": "Test treatment"
                }
            },
            {
                "url": f"{USERS_SERVICE_URL}/admin/users",
                "method": "GET",
                "required_role": "admin",
                "data": {}
            }
        ]
        
        for endpoint in role_specific_endpoints:
            # Test con roles incorrectos
            incorrect_roles = ["patient", "nurse"] if endpoint["required_role"] == "doctor" else ["patient", "doctor"]
            
            for incorrect_role in incorrect_roles:
                if incorrect_role in self.valid_tokens:
                    await self._test_single_endpoint(
                        endpoint["url"],
                        endpoint["method"],
                        endpoint["data"],
                        True,
                        f"incorrect_role_{incorrect_role}_for_{endpoint['required_role']}",
                        self.valid_tokens[incorrect_role]
                    )
    
    async def _test_unprotected_endpoints(self):
        """Tests de endpoints que deberían estar protegidos pero no lo están"""
        logger.info("🔓 Testing endpoints desprotegidos...")
        
        potentially_unprotected = [
            f"{NOTIFICATIONS_SERVICE_URL}/notifications",
            f"{PAYMENTS_SERVICE_URL}/payments",
            f"{MEDICAL_RECORDS_SERVICE_URL}/records",
            f"{USERS_SERVICE_URL}/admin/users"
        ]
        
        for endpoint in potentially_unprotected:
            # Test sin token
            await self._test_single_endpoint(
                endpoint,
                "GET",
                {},
                False,  # Sin autenticación
                "unprotected_access"
            )
    
    async def _test_input_validation(self):
        """Tests de validación de entrada"""
        logger.info("✅ Testing validación de entrada...")
        
        # Payloads maliciosos
        malicious_payloads = [
            {"type": "sql_injection", "data": {"query": "'; DROP TABLE users; --"}},
            {"type": "xss", "data": {"content": "<script>alert('xss')</script>"}},
            {"type": "path_traversal", "data": {"file": "../../../etc/passwd"}},
            {"type": "command_injection", "data": {"command": "ls; rm -rf /"}},
            {"type": "json_bomb", "data": {"json": {"a": {"b": {"c": {"d": {"e": "bomb"}}}}}},
            {"type": "oversized_string", "data": {"text": "A" * 100000}},
            {"type": "unicode_attack", "data": {"text": "🚀" * 1000}},
        ]
        
        for payload in malicious_payloads:
            await self._test_single_endpoint(
                f"{AUTH_SERVICE_URL}/register",
                "POST",
                payload["data"],
                False,
                f"malicious_input_{payload['type']}"
            )
    
    async def _test_single_endpoint(self, url: str, method: str, data: Dict, 
                                  requires_auth: bool, test_type: str, 
                                  token: str = None) -> TestResult:
        """Test individual de un endpoint"""
        try:
            headers = {"Content-Type": "application/json"}
            
            if requires_auth and token:
                headers["Authorization"] = f"Bearer {token}"
            elif requires_auth and not token:
                # Test sin autenticación
                pass
            
            start_time = time.time()
            
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                response = requests.request(method, url, json=data, headers=headers, timeout=10)
            
            response_time = time.time() - start_time
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}
            
            result = TestResult(
                endpoint=url,
                method=method,
                status_code=response.status_code,
                response_data=response_data,
                test_type=test_type
            )
            
            self.results.append(result)
            
            # Log del resultado
            status_emoji = "✅" if response.status_code < 400 else "❌" if response.status_code >= 500 else "⚠️"
            logger.info(f"{status_emoji} {test_type}: {method} {url} -> {response.status_code} ({response_time:.2f}s)")
            
            return result
            
        except requests.exceptions.Timeout:
            result = TestResult(
                endpoint=url,
                method=method,
                status_code=0,
                response_data={"error": "Request timeout"},
                error_message="Request timeout",
                test_type=test_type
            )
            self.results.append(result)
            logger.warning(f"⏰ {test_type}: {method} {url} -> TIMEOUT")
            return result
            
        except Exception as e:
            result = TestResult(
                endpoint=url,
                method=method,
                status_code=0,
                response_data={"error": str(e)},
                error_message=str(e),
                test_type=test_type
            )
            self.results.append(result)
            logger.error(f"💥 {test_type}: {method} {url} -> ERROR: {e}")
            return result
    
    def _generate_report(self):
        """Genera reporte comprehensivo de los tests"""
        logger.info("📊 Generando reporte de resultados...")
        
        # Análisis por códigos de respuesta
        status_codes = {}
        error_messages = {}
        security_issues = []
        
        for result in self.results:
            # Contar códigos de respuesta
            status_codes[result.status_code] = status_codes.get(result.status_code, 0) + 1
            
            # Analizar mensajes de error
            if result.status_code >= 400:
                error_detail = result.response_data.get("detail", "Unknown error")
                error_messages[error_detail] = error_messages.get(error_detail, 0) + 1
                
                # Detectar problemas de seguridad
                if result.status_code == 500 and "sql" in str(result.response_data).lower():
                    security_issues.append(f"SQL Injection vulnerability in {result.endpoint}")
                
                if "token" in str(result.response_data).lower() and result.status_code == 200:
                    security_issues.append(f"Token validation bypass in {result.endpoint}")
                
                if result.status_code == 200 and result.test_type.startswith("malicious_input"):
                    security_issues.append(f"Malicious input accepted in {result.endpoint}")
        
        # Generar reporte
        report = {
            "summary": {
                "total_tests": len(self.results),
                "successful_tests": len([r for r in self.results if r.status_code < 400]),
                "failed_tests": len([r for r in self.results if r.status_code >= 400]),
                "timeout_tests": len([r for r in self.results if r.status_code == 0])
            },
            "status_codes": status_codes,
            "error_messages": error_messages,
            "security_issues": security_issues,
            "recommendations": self._generate_recommendations()
        }
        
        # Guardar reporte
        with open("endpoint_testing_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)
        
        # Mostrar resumen
        print("\n" + "="*80)
        print("📊 REPORTE DE TESTING DE ENDPOINTS - SMD VITAL")
        print("="*80)
        print(f"Total de tests ejecutados: {report['summary']['total_tests']}")
        print(f"Tests exitosos: {report['summary']['successful_tests']}")
        print(f"Tests fallidos: {report['summary']['failed_tests']}")
        print(f"Timeouts: {report['summary']['timeout_tests']}")
        
        print("\n📈 CÓDIGOS DE RESPUESTA:")
        for status_code, count in sorted(status_codes.items()):
            print(f"  {status_code}: {count} requests")
        
        print("\n🚨 PROBLEMAS DE SEGURIDAD DETECTADOS:")
        for issue in security_issues:
            print(f"  ❌ {issue}")
        
        print("\n💡 RECOMENDACIONES:")
        for rec in report["recommendations"]:
            print(f"  • {rec}")
        
        print(f"\n📄 Reporte completo guardado en: endpoint_testing_report.json")
        print("="*80)
    
    def _generate_recommendations(self) -> List[str]:
        """Genera recomendaciones basadas en los resultados"""
        recommendations = []
        
        # Analizar códigos de respuesta
        status_codes = {}
        for result in self.results:
            status_codes[result.status_code] = status_codes.get(result.status_code, 0) + 1
        
        # Recomendaciones de estandarización
        if 500 in status_codes:
            recommendations.append("Implementar manejo de errores consistente - muchos 500 errors detectados")
        
        if 401 in status_codes and 200 in status_codes:
            recommendations.append("Revisar autenticación - algunos endpoints retornan 200 sin token válido")
        
        # Recomendaciones de seguridad
        recommendations.extend([
            "Implementar rate limiting en todos los endpoints",
            "Añadir validación de entrada más estricta",
            "Implementar logging de seguridad para requests sospechosos",
            "Estandarizar mensajes de error para evitar información disclosure",
            "Implementar CORS policies apropiadas",
            "Añadir headers de seguridad (HSTS, CSP, etc.)",
            "Implementar validación de JWT más robusta",
            "Añadir middleware de autenticación obligatorio",
            "Implementar sanitización de entrada",
            "Añadir monitoreo de intentos de acceso no autorizado"
        ])
        
        return recommendations

async def main():
    """Función principal"""
    tester = EndpointTester()
    await tester.run_comprehensive_tests()

if __name__ == "__main__":
    asyncio.run(main())



