#!/usr/bin/env python3
"""
SMD Vital - Manual Security Testing
==================================

Script para pruebas manuales de seguridad sin dependencias externas.
Usa requests y urllib para probar endpoints.

Author: Security Team
"""

import json
import time
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime

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

def make_request(url, method="GET", data=None, headers=None):
    """Hacer request HTTP"""
    if headers is None:
        headers = {}
    
    if data:
        data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return {
                'status': response.status,
                'headers': dict(response.headers),
                'body': response.read().decode('utf-8')
            }
    except urllib.error.HTTPError as e:
        return {
            'status': e.code,
            'headers': dict(e.headers),
            'body': e.read().decode('utf-8') if hasattr(e, 'read') else ''
        }
    except Exception as e:
        return {
            'status': 'ERROR',
            'error': str(e)
        }

def test_health_endpoints():
    """Probar endpoints de health check"""
    print("🏥 Probando endpoints de health check...")
    
    health_endpoints = [
        f"{SERVICES['auth']}/health",
        f"{SERVICES['users']}/health", 
        f"{SERVICES['appointments']}/health",
        f"{SERVICES['medical-records']}/health",
        f"{SERVICES['payments']}/health",
        f"{SERVICES['notifications']}/health"
    ]
    
    results = []
    for endpoint in health_endpoints:
        result = make_request(endpoint)
        service_name = endpoint.split('/')[-2]
        
        if result['status'] == 200:
            print(f"✅ {service_name}: {result['status']} - OK")
            results.append({
                'endpoint': endpoint,
                'status': 'HEALTHY',
                'response': result['status']
            })
        else:
            print(f"❌ {service_name}: {result['status']} - ERROR")
            results.append({
                'endpoint': endpoint,
                'status': 'UNHEALTHY',
                'response': result['status']
            })
    
    return results

def test_unprotected_endpoints():
    """Probar endpoints que deberían estar protegidos"""
    print("\n🔍 Probando endpoints protegidos sin autenticación...")
    
    # Endpoints que deberían requerir autenticación
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
        
        # Payments Service
        f"{SERVICES['payments']}/payments",
        f"{SERVICES['payments']}/refunds",
        f"{SERVICES['payments']}/invoices",
        
        # Notifications Service
        f"{SERVICES['notifications']}/notifications",
        f"{SERVICES['notifications']}/templates",
        
        # AI Service
        f"{SERVICES['ai-langgraph']}/ai/query"
    ]
    
    vulnerable_endpoints = []
    secure_endpoints = []
    
    for endpoint in protected_endpoints:
        result = make_request(endpoint)
        service_name = endpoint.split('/')[-2]
        endpoint_path = endpoint.split('/')[-1]
        
        if result['status'] == 200:
            print(f"🚨 VULNERABLE: {service_name}/{endpoint_path} - Accesible sin autenticación")
            vulnerable_endpoints.append({
                'endpoint': endpoint,
                'status': 'VULNERABLE',
                'response': result['status'],
                'severity': 'HIGH'
            })
        elif result['status'] == 401:
            print(f"✅ SECURE: {service_name}/{endpoint_path} - Protegido correctamente")
            secure_endpoints.append({
                'endpoint': endpoint,
                'status': 'SECURE',
                'response': result['status']
            })
        elif result['status'] == 404:
            print(f"⚠️  NOT FOUND: {service_name}/{endpoint_path} - Endpoint no encontrado")
        else:
            print(f"❓ UNKNOWN: {service_name}/{endpoint_path} - Status: {result['status']}")
    
    return vulnerable_endpoints, secure_endpoints

def test_auth_endpoints():
    """Probar endpoints de autenticación"""
    print("\n🔐 Probando endpoints de autenticación...")
    
    # Test registro
    register_data = {
        "email": "test_security@example.com",
        "password": "TestPassword123!",
        "first_name": "Test",
        "last_name": "Security",
        "role": "patient"
    }
    
    print("📝 Probando registro de usuario...")
    register_result = make_request(f"{SERVICES['auth']}/register", "POST", register_data)
    
    if register_result['status'] in [200, 201]:
        print("✅ Registro exitoso")
        try:
            response_data = json.loads(register_result['body'])
            if 'access_token' in response_data:
                print("✅ Token JWT generado correctamente")
                return response_data['access_token']
        except:
            print("⚠️  No se pudo extraer token del registro")
    else:
        print(f"❌ Error en registro: {register_result['status']}")
    
    # Test login
    print("\n🔑 Probando login...")
    login_data = {
        "username": "test_security@example.com",
        "password": "TestPassword123!"
    }
    
    login_result = make_request(f"{SERVICES['auth']}/login", "POST", login_data)
    
    if login_result['status'] == 200:
        print("✅ Login exitoso")
        try:
            response_data = json.loads(login_result['body'])
            if 'access_token' in response_data:
                print("✅ Token JWT generado correctamente")
                return response_data['access_token']
        except:
            print("⚠️  No se pudo extraer token del login")
    else:
        print(f"❌ Error en login: {login_result['status']}")
    
    return None

def test_authenticated_endpoints(token):
    """Probar endpoints con autenticación"""
    if not token:
        print("⚠️  No hay token disponible para pruebas autenticadas")
        return
    
    print(f"\n🔒 Probando endpoints con token JWT...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Endpoints que requieren autenticación
    auth_endpoints = [
        f"{SERVICES['auth']}/me",
        f"{SERVICES['users']}/profile",
        f"{SERVICES['appointments']}/appointments"
    ]
    
    for endpoint in auth_endpoints:
        result = make_request(endpoint, headers=headers)
        service_name = endpoint.split('/')[-2]
        endpoint_path = endpoint.split('/')[-1]
        
        if result['status'] == 200:
            print(f"✅ {service_name}/{endpoint_path} - Acceso autorizado")
        elif result['status'] == 401:
            print(f"❌ {service_name}/{endpoint_path} - Token inválido o expirado")
        elif result['status'] == 403:
            print(f"🔒 {service_name}/{endpoint_path} - Acceso denegado por permisos")
        else:
            print(f"❓ {service_name}/{endpoint_path} - Status: {result['status']}")

def test_rate_limiting():
    """Probar rate limiting básico"""
    print("\n⏱️  Probando rate limiting...")
    
    # Endpoint de login para probar rate limiting
    login_data = {
        "username": "test@example.com",
        "password": "wrongpassword"
    }
    
    print("🔄 Haciendo múltiples requests de login...")
    success_count = 0
    error_count = 0
    
    for i in range(10):
        result = make_request(f"{SERVICES['auth']}/login", "POST", login_data)
        if result['status'] in [200, 401, 400]:  # Respuestas válidas
            success_count += 1
        else:
            error_count += 1
        
        time.sleep(0.1)  # Pequeña pausa
    
    print(f"📊 Resultados: {success_count} exitosos, {error_count} errores")
    
    if success_count == 10:
        print("⚠️  No se detectó rate limiting - Todas las requests fueron procesadas")
    else:
        print("✅ Posible rate limiting detectado - Algunas requests fueron bloqueadas")

def generate_security_report(health_results, vulnerable_endpoints, secure_endpoints):
    """Generar reporte de seguridad"""
    print("\n" + "="*80)
    print("🔐 REPORTE DE SEGURIDAD - SMD VITAL")
    print("="*80)
    
    # Resumen de health checks
    healthy_services = len([r for r in health_results if r['status'] == 'HEALTHY'])
    total_services = len(health_results)
    
    print(f"\n📊 RESUMEN DE SERVICIOS:")
    print(f"   Servicios saludables: {healthy_services}/{total_services}")
    
    # Vulnerabilidades encontradas
    print(f"\n🚨 VULNERABILIDADES ENCONTRADAS:")
    if vulnerable_endpoints:
        print(f"   Endpoints vulnerables: {len(vulnerable_endpoints)}")
        for vuln in vulnerable_endpoints:
            print(f"   🚨 {vuln['endpoint']} - Severidad: {vuln['severity']}")
    else:
        print("   ✅ No se encontraron endpoints vulnerables")
    
    # Endpoints seguros
    print(f"\n✅ ENDPOINTS SEGUROS:")
    print(f"   Endpoints protegidos correctamente: {len(secure_endpoints)}")
    
    # Recomendaciones
    print(f"\n💡 RECOMENDACIONES DE SEGURIDAD:")
    print("   1. 🔐 Implementar autenticación JWT en todos los endpoints sensibles")
    print("   2. ⏱️  Configurar rate limiting para prevenir ataques de fuerza bruta")
    print("   3. 🔒 Implementar autorización basada en roles (RBAC)")
    print("   4. 📝 Configurar logging de seguridad detallado")
    print("   5. 🛡️  Implementar validación de entrada estricta")
    print("   6. 🔄 Configurar rotación de secretos JWT")
    print("   7. 📊 Implementar monitoreo de seguridad en tiempo real")
    print("   8. 🚫 Configurar CORS restrictivo")
    print("   9. 🔐 Implementar HTTPS obligatorio")
    print("   10. 📋 Realizar auditorías de seguridad regulares")

def main():
    """Función principal"""
    print("🔐 SMD VITAL - Manual Security Testing")
    print("=====================================")
    print(f"⏰ Iniciado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. Probar health endpoints
    health_results = test_health_endpoints()
    
    # 2. Probar endpoints desprotegidos
    vulnerable_endpoints, secure_endpoints = test_unprotected_endpoints()
    
    # 3. Probar autenticación
    token = test_auth_endpoints()
    
    # 4. Probar endpoints autenticados
    test_authenticated_endpoints(token)
    
    # 5. Probar rate limiting
    test_rate_limiting()
    
    # 6. Generar reporte
    generate_security_report(health_results, vulnerable_endpoints, secure_endpoints)
    
    print(f"\n⏰ Finalizado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
