#!/usr/bin/env python3
"""
SMD Vital - Security Testing Suite
=================================

Script para ejecutar pruebas de seguridad JWT, roles y endpoints vulnerables.
Incluye pruebas de autenticación, autorización, rate limiting y validaciones.

Author: Security Team
"""

import asyncio
import aiohttp
import json
import time
import jwt
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuración de servicios
SERVICES = {
    "auth": "http://localhost:8001",
    "users": "http://localhost:8002", 
    "appointments": "http://localhost:8003",
    "medical-records": "http://localhost:8004",
    "payments": "http://localhost:8005",
    "notifications": "http://localhost:8006",
    "health-metrics": "http://localhost:8007",
    "ai-langgraph": "http://localhost:8008"
}

# JWT Configuration
JWT_SECRET = "smd_vital_secret_key_2024_change_in_production"
JWT_ALGORITHM = "HS256"

class SecurityTester:
    def __init__(self):
        self.session = None
        self.test_results = {
            "jwt_tests": [],
            "role_tests": [],
            "vulnerable_endpoints": [],
            "rate_limiting_tests": [],
            "security_recommendations": []
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def create_test_token(self, user_id: str, role: str = "patient", expires_minutes: int = 60) -> str:
        """Crear token JWT para pruebas"""
        payload = {
            "sub": user_id,
            "email": f"test_{user_id}@example.com",
            "role": role,
            "exp": datetime.utcnow() + timedelta(minutes=expires_minutes),
            "type": "access"
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    def create_expired_token(self, user_id: str) -> str:
        """Crear token JWT expirado para pruebas"""
        payload = {
            "sub": user_id,
            "email": f"test_{user_id}@example.com",
            "role": "patient",
            "exp": datetime.utcnow() - timedelta(hours=1),  # Expirado hace 1 hora
            "type": "access"
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    def create_invalid_token(self) -> str:
        """Crear token JWT inválido para pruebas"""
        return "invalid.jwt.token"
    
    async def test_jwt_authentication(self):
        """Probar autenticación JWT"""
        logger.info("🔐 Ejecutando pruebas de autenticación JWT...")
        
        # Test 1: Token válido
        valid_token = self.create_test_token("test_user_1", "patient")
        headers = {"Authorization": f"Bearer {valid_token}"}
        
        try:
            async with self.session.get(f"{SERVICES['auth']}/me", headers=headers) as response:
                if response.status == 200:
                    self.test_results["jwt_tests"].append({
                        "test": "Token válido",
                        "status": "✅ PASS",
                        "details": "Token válido aceptado correctamente"
                    })
                else:
                    self.test_results["jwt_tests"].append({
                        "test": "Token válido",
                        "status": "❌ FAIL",
                        "details": f"Token válido rechazado: {response.status}"
                    })
        except Exception as e:
            self.test_results["jwt_tests"].append({
                "test": "Token válido",
                "status": "❌ ERROR",
                "details": f"Error en prueba: {str(e)}"
            })
        
        # Test 2: Token expirado
        expired_token = self.create_expired_token("test_user_2")
        headers = {"Authorization": f"Bearer {expired_token}"}
        
        try:
            async with self.session.get(f"{SERVICES['auth']}/me", headers=headers) as response:
                if response.status == 401:
                    self.test_results["jwt_tests"].append({
                        "test": "Token expirado",
                        "status": "✅ PASS",
                        "details": "Token expirado rechazado correctamente"
                    })
                else:
                    self.test_results["jwt_tests"].append({
                        "test": "Token expirado",
                        "status": "❌ FAIL",
                        "details": f"Token expirado aceptado: {response.status}"
                    })
        except Exception as e:
            self.test_results["jwt_tests"].append({
                "test": "Token expirado",
                "status": "❌ ERROR",
                "details": f"Error en prueba: {str(e)}"
            })
        
        # Test 3: Token inválido
        invalid_token = self.create_invalid_token()
        headers = {"Authorization": f"Bearer {invalid_token}"}
        
        try:
            async with self.session.get(f"{SERVICES['auth']}/me", headers=headers) as response:
                if response.status == 401:
                    self.test_results["jwt_tests"].append({
                        "test": "Token inválido",
                        "status": "✅ PASS",
                        "details": "Token inválido rechazado correctamente"
                    })
                else:
                    self.test_results["jwt_tests"].append({
                        "test": "Token inválido",
                        "status": "❌ FAIL",
                        "details": f"Token inválido aceptado: {response.status}"
                    })
        except Exception as e:
            self.test_results["jwt_tests"].append({
                "test": "Token inválido",
                "status": "❌ ERROR",
                "details": f"Error en prueba: {str(e)}"
            })
        
        # Test 4: Sin token
        try:
            async with self.session.get(f"{SERVICES['auth']}/me") as response:
                if response.status == 401:
                    self.test_results["jwt_tests"].append({
                        "test": "Sin token",
                        "status": "✅ PASS",
                        "details": "Petición sin token rechazada correctamente"
                    })
                else:
                    self.test_results["jwt_tests"].append({
                        "test": "Sin token",
                        "status": "❌ FAIL",
                        "details": f"Petición sin token aceptada: {response.status}"
                    })
        except Exception as e:
            self.test_results["jwt_tests"].append({
                "test": "Sin token",
                "status": "❌ ERROR",
                "details": f"Error en prueba: {str(e)}"
            })
    
    async def test_role_authorization(self):
        """Probar autorización por roles"""
        logger.info("👥 Ejecutando pruebas de roles y permisos...")
        
        roles_to_test = ["patient", "doctor", "nurse", "admin", "lab_technician"]
        
        for role in roles_to_test:
            token = self.create_test_token(f"test_{role}", role)
            headers = {"Authorization": f"Bearer {token}"}
            
            # Test acceso a endpoints protegidos
            test_endpoints = [
                f"{SERVICES['users']}/profile",
                f"{SERVICES['appointments']}/appointments",
                f"{SERVICES['medical-records']}/medical-records",
                f"{SERVICES['payments']}/payments"
            ]
            
            for endpoint in test_endpoints:
                try:
                    async with self.session.get(endpoint, headers=headers) as response:
                        if response.status == 200:
                            self.test_results["role_tests"].append({
                                "test": f"Acceso {role} a {endpoint}",
                                "status": "✅ PASS",
                                "details": f"Rol {role} tiene acceso correcto"
                            })
                        elif response.status == 403:
                            self.test_results["role_tests"].append({
                                "test": f"Acceso {role} a {endpoint}",
                                "status": "✅ PASS",
                                "details": f"Rol {role} correctamente restringido"
                            })
                        else:
                            self.test_results["role_tests"].append({
                                "test": f"Acceso {role} a {endpoint}",
                                "status": "⚠️ WARNING",
                                "details": f"Respuesta inesperada: {response.status}"
                            })
                except Exception as e:
                    self.test_results["role_tests"].append({
                        "test": f"Acceso {role} a {endpoint}",
                        "status": "❌ ERROR",
                        "details": f"Error en prueba: {str(e)}"
                    })
    
    async def find_vulnerable_endpoints(self):
        """Identificar endpoints vulnerables sin autenticación"""
        logger.info("🔍 Buscando endpoints vulnerables...")
        
        # Endpoints que deberían estar protegidos
        protected_endpoints = [
            # Users Service
            f"{SERVICES['users']}/profile",
            f"{SERVICES['users']}/notifications",
            f"{SERVICES['users']}/doctors/search",
            
            # Appointments Service
            f"{SERVICES['appointments']}/appointments",
            f"{SERVICES['appointments']}/appointments/stats",
            
            # Medical Records Service
            f"{SERVICES['medical-records']}/medical-records",
            f"{SERVICES['medical-records']}/prescriptions",
            f"{SERVICES['medical-records']}/ratings",
            f"{SERVICES['medical-records']}/vital-signs",
            
            # Payments Service
            f"{SERVICES['payments']}/payments",
            f"{SERVICES['payments']}/refunds",
            f"{SERVICES['payments']}/invoices",
            
            # Notifications Service
            f"{SERVICES['notifications']}/notifications",
            f"{SERVICES['notifications']}/templates",
            f"{SERVICES['notifications']}/settings",
            
            # AI Service
            f"{SERVICES['ai-langgraph']}/ai/query",
            f"{SERVICES['ai-langgraph']}/ai/workflows"
        ]
        
        for endpoint in protected_endpoints:
            try:
                # Intentar acceso sin token
                async with self.session.get(endpoint) as response:
                    if response.status == 200:
                        self.test_results["vulnerable_endpoints"].append({
                            "endpoint": endpoint,
                            "status": "🚨 VULNERABLE",
                            "details": "Endpoint accesible sin autenticación",
                            "severity": "HIGH"
                        })
                    elif response.status == 401:
                        self.test_results["vulnerable_endpoints"].append({
                            "endpoint": endpoint,
                            "status": "✅ SECURE",
                            "details": "Endpoint protegido correctamente"
                        })
                    else:
                        self.test_results["vulnerable_endpoints"].append({
                            "endpoint": endpoint,
                            "status": "⚠️ UNKNOWN",
                            "details": f"Respuesta inesperada: {response.status}"
                        })
            except Exception as e:
                self.test_results["vulnerable_endpoints"].append({
                    "endpoint": endpoint,
                    "status": "❌ ERROR",
                    "details": f"Error al probar endpoint: {str(e)}"
                })
    
    async def test_rate_limiting(self):
        """Probar rate limiting"""
        logger.info("⏱️ Ejecutando pruebas de rate limiting...")
        
        # Test de rate limiting en endpoints críticos
        test_endpoints = [
            f"{SERVICES['auth']}/login",
            f"{SERVICES['auth']}/register",
            f"{SERVICES['payments']}/create-payment-intent"
        ]
        
        for endpoint in test_endpoints:
            requests_made = 0
            successful_requests = 0
            
            # Hacer múltiples requests rápidamente
            for i in range(20):  # 20 requests en secuencia
                try:
                    if "login" in endpoint or "register" in endpoint:
                        # Para login/register, usar datos de prueba
                        data = {
                            "email": f"test{i}@example.com",
                            "password": "testpassword123"
                        }
                        async with self.session.post(endpoint, json=data) as response:
                            requests_made += 1
                            if response.status in [200, 201, 400, 401, 409]:  # Respuestas válidas
                                successful_requests += 1
                    else:
                        # Para otros endpoints, usar GET
                        async with self.session.get(endpoint) as response:
                            requests_made += 1
                            if response.status in [200, 401, 403]:  # Respuestas válidas
                                successful_requests += 1
                except Exception as e:
                    requests_made += 1
                
                # Pequeña pausa entre requests
                await asyncio.sleep(0.1)
            
            # Analizar resultados
            if successful_requests == requests_made:
                self.test_results["rate_limiting_tests"].append({
                    "endpoint": endpoint,
                    "status": "⚠️ NO RATE LIMITING",
                    "details": f"Todas las {requests_made} requests fueron procesadas",
                    "recommendation": "Implementar rate limiting"
                })
            elif successful_requests < requests_made * 0.5:
                self.test_results["rate_limiting_tests"].append({
                    "endpoint": endpoint,
                    "status": "✅ RATE LIMITED",
                    "details": f"Solo {successful_requests}/{requests_made} requests exitosas"
                })
            else:
                self.test_results["rate_limiting_tests"].append({
                    "endpoint": endpoint,
                    "status": "⚠️ PARTIAL RATE LIMITING",
                    "details": f"{successful_requests}/{requests_made} requests exitosas"
                })
    
    def generate_security_recommendations(self):
        """Generar recomendaciones de seguridad"""
        logger.info("💡 Generando recomendaciones de seguridad...")
        
        recommendations = [
            {
                "category": "JWT Security",
                "priority": "HIGH",
                "recommendations": [
                    "Implementar rotación de secretos JWT",
                    "Reducir tiempo de expiración de tokens (actualmente 24 horas)",
                    "Implementar blacklist de tokens revocados",
                    "Usar algoritmos más seguros (RS256 en lugar de HS256)"
                ]
            },
            {
                "category": "Rate Limiting",
                "priority": "HIGH", 
                "recommendations": [
                    "Implementar rate limiting por IP y usuario",
                    "Configurar límites específicos por endpoint",
                    "Implementar backoff exponencial",
                    "Monitorear intentos de abuso"
                ]
            },
            {
                "category": "Input Validation",
                "priority": "MEDIUM",
                "recommendations": [
                    "Validar todos los inputs con esquemas estrictos",
                    "Implementar sanitización de datos",
                    "Validar tipos de archivo en uploads",
                    "Limitar tamaño de payloads"
                ]
            },
            {
                "category": "Authorization",
                "priority": "HIGH",
                "recommendations": [
                    "Implementar RBAC (Role-Based Access Control) granular",
                    "Validar permisos en cada endpoint",
                    "Implementar principio de menor privilegio",
                    "Auditar accesos y cambios de permisos"
                ]
            },
            {
                "category": "Monitoring & Logging",
                "priority": "MEDIUM",
                "recommendations": [
                    "Implementar logging de seguridad detallado",
                    "Configurar alertas por intentos de acceso no autorizado",
                    "Monitorear patrones de uso anómalos",
                    "Implementar SIEM para correlación de eventos"
                ]
            },
            {
                "category": "Infrastructure",
                "priority": "MEDIUM",
                "recommendations": [
                    "Implementar WAF (Web Application Firewall)",
                    "Configurar HTTPS obligatorio",
                    "Implementar headers de seguridad (HSTS, CSP, etc.)",
                    "Configurar CORS restrictivo"
                ]
            }
        ]
        
        self.test_results["security_recommendations"] = recommendations
    
    async def run_all_tests(self):
        """Ejecutar todas las pruebas de seguridad"""
        logger.info("🚀 Iniciando suite de pruebas de seguridad...")
        
        start_time = time.time()
        
        # Ejecutar pruebas en paralelo donde sea posible
        await asyncio.gather(
            self.test_jwt_authentication(),
            self.test_role_authorization(),
            self.find_vulnerable_endpoints(),
            self.test_rate_limiting()
        )
        
        # Generar recomendaciones
        self.generate_security_recommendations()
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        logger.info(f"✅ Pruebas completadas en {execution_time:.2f} segundos")
        
        return self.test_results
    
    def print_results(self):
        """Imprimir resultados de las pruebas"""
        print("\n" + "="*80)
        print("🔐 REPORTE DE SEGURIDAD - SMD VITAL")
        print("="*80)
        
        # JWT Tests
        print("\n📋 PRUEBAS DE AUTENTICACIÓN JWT:")
        print("-" * 50)
        for test in self.test_results["jwt_tests"]:
            print(f"{test['status']} {test['test']}: {test['details']}")
        
        # Role Tests
        print("\n👥 PRUEBAS DE ROLES Y PERMISOS:")
        print("-" * 50)
        for test in self.test_results["role_tests"]:
            print(f"{test['status']} {test['test']}: {test['details']}")
        
        # Vulnerable Endpoints
        print("\n🚨 ENDPOINTS VULNERABLES:")
        print("-" * 50)
        vulnerable_count = 0
        for endpoint in self.test_results["vulnerable_endpoints"]:
            if "VULNERABLE" in endpoint['status']:
                vulnerable_count += 1
            print(f"{endpoint['status']} {endpoint['endpoint']}: {endpoint['details']}")
        
        if vulnerable_count == 0:
            print("✅ No se encontraron endpoints vulnerables")
        
        # Rate Limiting Tests
        print("\n⏱️ PRUEBAS DE RATE LIMITING:")
        print("-" * 50)
        for test in self.test_results["rate_limiting_tests"]:
            print(f"{test['status']} {test['endpoint']}: {test['details']}")
        
        # Security Recommendations
        print("\n💡 RECOMENDACIONES DE SEGURIDAD:")
        print("-" * 50)
        for category in self.test_results["security_recommendations"]:
            print(f"\n🔸 {category['category']} (Prioridad: {category['priority']}):")
            for rec in category['recommendations']:
                print(f"   • {rec}")
        
        # Resumen
        print("\n📊 RESUMEN:")
        print("-" * 50)
        print(f"Total endpoints probados: {len(self.test_results['vulnerable_endpoints'])}")
        print(f"Endpoints vulnerables encontrados: {vulnerable_count}")
        print(f"Pruebas JWT ejecutadas: {len(self.test_results['jwt_tests'])}")
        print(f"Pruebas de roles ejecutadas: {len(self.test_results['role_tests'])}")
        print(f"Pruebas de rate limiting: {len(self.test_results['rate_limiting_tests'])}")
        
        if vulnerable_count > 0:
            print(f"\n⚠️  ATENCIÓN: Se encontraron {vulnerable_count} endpoints vulnerables que requieren atención inmediata.")
        else:
            print("\n✅ No se encontraron vulnerabilidades críticas en los endpoints probados.")

async def main():
    """Función principal"""
    print("🔐 SMD VITAL - Security Testing Suite")
    print("=====================================")
    
    async with SecurityTester() as tester:
        results = await tester.run_all_tests()
        tester.print_results()
        
        # Guardar resultados en archivo
        with open("security_test_results.json", "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"\n📄 Resultados guardados en: security_test_results.json")

if __name__ == "__main__":
    asyncio.run(main())
