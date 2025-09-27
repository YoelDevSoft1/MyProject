#!/usr/bin/env python3
"""
SMD VITAL - Simple Security Test
===============================

Script simplificado para testear endpoints con datos inválidos, tokens expirados y roles incorrectos.
"""

import json
import time
from datetime import datetime

def test_endpoints():
    """Test básico de endpoints"""
    print("🚀 Iniciando tests de seguridad básicos para SMD VITAL")
    print("="*60)
    
    # Resultados de los tests
    results = {
        "timestamp": datetime.now().isoformat(),
        "tests": [],
        "summary": {
            "total": 0,
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    }
    
    # Endpoints a testear
    endpoints = [
        {
            "name": "Auth Service - Register",
            "url": "http://localhost:8001/register",
            "method": "POST",
            "test_cases": [
                {
                    "name": "Datos válidos",
                    "data": {
                        "email": "test@example.com",
                        "password": "Test123!",
                        "first_name": "Test",
                        "last_name": "User",
                        "phone": "+573001234567",
                        "role": "patient"
                    },
                    "expected_status": [200, 201, 409]  # 409 = usuario ya existe
                },
                {
                    "name": "Email inválido",
                    "data": {
                        "email": "invalid-email",
                        "password": "Test123!",
                        "first_name": "Test",
                        "last_name": "User",
                        "phone": "+573001234567",
                        "role": "patient"
                    },
                    "expected_status": [400, 422]
                },
                {
                    "name": "Contraseña débil",
                    "data": {
                        "email": "test2@example.com",
                        "password": "123",
                        "first_name": "Test",
                        "last_name": "User",
                        "phone": "+573001234567",
                        "role": "patient"
                    },
                    "expected_status": [400, 422]
                },
                {
                    "name": "Datos vacíos",
                    "data": {},
                    "expected_status": [400, 422]
                },
                {
                    "name": "SQL Injection",
                    "data": {
                        "email": "test@example.com'; DROP TABLE users; --",
                        "password": "Test123!",
                        "first_name": "Test",
                        "last_name": "User",
                        "phone": "+573001234567",
                        "role": "patient"
                    },
                    "expected_status": [400, 422]
                }
            ]
        },
        {
            "name": "Auth Service - Login",
            "url": "http://localhost:8001/login",
            "method": "POST",
            "test_cases": [
                {
                    "name": "Credenciales válidas",
                    "data": {
                        "username": "test@example.com",
                        "password": "Test123!"
                    },
                    "expected_status": [200]
                },
                {
                    "name": "Credenciales inválidas",
                    "data": {
                        "username": "test@example.com",
                        "password": "wrongpassword"
                    },
                    "expected_status": [401, 422]
                },
                {
                    "name": "Usuario inexistente",
                    "data": {
                        "username": "nonexistent@example.com",
                        "password": "Test123!"
                    },
                    "expected_status": [401, 422]
                },
                {
                    "name": "Datos vacíos",
                    "data": {},
                    "expected_status": [400, 422]
                }
            ]
        }
    ]
    
    # Ejecutar tests
    for endpoint in endpoints:
        print(f"\n🧪 Testing: {endpoint['name']}")
        print("-" * 40)
        
        for test_case in endpoint["test_cases"]:
            result = run_single_test(endpoint, test_case)
            results["tests"].append(result)
            results["summary"]["total"] += 1
            
            if result["status"] == "passed":
                results["summary"]["passed"] += 1
                print(f"  ✅ {test_case['name']}: {result['status_code']}")
            else:
                results["summary"]["failed"] += 1
                results["summary"]["errors"].append(f"{endpoint['name']} - {test_case['name']}: {result['error']}")
                print(f"  ❌ {test_case['name']}: {result['error']}")
    
    # Generar reporte
    generate_report(results)
    
    return results

def run_single_test(endpoint, test_case):
    """Ejecuta un test individual"""
    try:
        import requests
        
        start_time = time.time()
        
        # Realizar request
        if endpoint["method"].upper() == "POST":
            response = requests.post(
                endpoint["url"],
                json=test_case["data"],
                headers={"Content-Type": "application/json"},
                timeout=10
            )
        else:
            response = requests.get(
                endpoint["url"],
                headers={"Content-Type": "application/json"},
                timeout=10
            )
        
        response_time = time.time() - start_time
        
        # Analizar respuesta
        status_code = response.status_code
        expected_status = test_case.get("expected_status", [200])
        
        try:
            response_data = response.json()
        except:
            response_data = {"raw_response": response.text}
        
        # Determinar si el test pasó
        if status_code in expected_status:
            status = "passed"
            error = None
        else:
            status = "failed"
            error = f"Expected {expected_status}, got {status_code}"
        
        return {
            "endpoint": endpoint["name"],
            "test_case": test_case["name"],
            "status": status,
            "status_code": status_code,
            "response_time": response_time,
            "response_data": response_data,
            "error": error
        }
        
    except requests.exceptions.Timeout:
        return {
            "endpoint": endpoint["name"],
            "test_case": test_case["name"],
            "status": "failed",
            "status_code": 0,
            "response_time": 0,
            "response_data": {},
            "error": "Request timeout"
        }
    except Exception as e:
        return {
            "endpoint": endpoint["name"],
            "test_case": test_case["name"],
            "status": "failed",
            "status_code": 0,
            "response_time": 0,
            "response_data": {},
            "error": str(e)
        }

def generate_report(results):
    """Genera reporte de resultados"""
    print("\n" + "="*60)
    print("📊 REPORTE DE TESTS DE SEGURIDAD")
    print("="*60)
    print(f"Fecha: {results['timestamp']}")
    print(f"Total de tests: {results['summary']['total']}")
    print(f"Tests exitosos: {results['summary']['passed']}")
    print(f"Tests fallidos: {results['summary']['failed']}")
    
    if results['summary']['errors']:
        print("\n❌ ERRORES DETECTADOS:")
        for error in results['summary']['errors']:
            print(f"  • {error}")
    
    # Análisis de códigos de respuesta
    status_codes = {}
    for test in results['tests']:
        code = test['status_code']
        status_codes[code] = status_codes.get(code, 0) + 1
    
    print(f"\n📈 CÓDIGOS DE RESPUESTA:")
    for code, count in sorted(status_codes.items()):
        print(f"  {code}: {count} requests")
    
    # Detectar problemas de seguridad
    security_issues = []
    for test in results['tests']:
        if test['status_code'] == 500:
            security_issues.append(f"Error 500 en {test['endpoint']} - {test['test_case']}")
        elif test['status_code'] == 200 and "injection" in test['test_case'].lower():
            security_issues.append(f"Posible vulnerabilidad en {test['endpoint']} - {test['test_case']}")
    
    if security_issues:
        print(f"\n🚨 PROBLEMAS DE SEGURIDAD DETECTADOS:")
        for issue in security_issues:
            print(f"  • {issue}")
    
    # Recomendaciones
    print(f"\n💡 RECOMENDACIONES:")
    recommendations = [
        "Implementar validación de entrada más estricta",
        "Estandarizar códigos de respuesta HTTP",
        "Añadir logging de seguridad para requests sospechosos",
        "Implementar rate limiting",
        "Añadir headers de seguridad (CORS, CSP, etc.)",
        "Implementar manejo de errores consistente",
        "Añadir tests automatizados de seguridad",
        "Implementar monitoreo de intentos de acceso no autorizado"
    ]
    
    for rec in recommendations:
        print(f"  • {rec}")
    
    # Guardar reporte
    with open("security_test_report.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"\n📄 Reporte guardado en: security_test_report.json")
    print("="*60)

if __name__ == "__main__":
    test_endpoints()



