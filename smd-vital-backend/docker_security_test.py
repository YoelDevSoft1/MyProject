#!/usr/bin/env python3
"""
SMD Vital - Docker Security Testing
===================================

Script para pruebas de seguridad en entorno Docker.
Prueba autenticación JWT, roles y endpoints vulnerables.

Author: Security Team
"""

import json
import time
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime
import subprocess
import sys

# Configuración de servicios Docker
DOCKER_SERVICES = {
    "auth": "http://localhost:8001",
    "users": "http://localhost:8002", 
    "appointments": "http://localhost:8003",
    "medical-records": "http://localhost:8004",
    "notifications": "http://localhost:8004",  # Mapeado al puerto 8004
    "payments": "http://localhost:8006",
    "health-metrics": "http://localhost:8007",
    "ai-langgraph": "http://localhost:8008"
}

def check_docker_containers():
    """Verificar contenedores Docker activos"""
    print("🐳 Verificando contenedores Docker...")
    
    try:
        result = subprocess.run(['docker', 'ps', '--format', 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'], 
                               capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ Contenedores Docker activos:")
            print(result.stdout)
            return True
        else:
            print("❌ Error al verificar contenedores Docker")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def make_request(url, method="GET", data=None, headers=None, timeout=10):
    """Hacer request HTTP con manejo de errores mejorado"""
    if headers is None:
        headers = {}
    
    if data:
        data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return {
                'status': response.status,
                'headers': dict(response.headers),
                'body': response.read().decode('utf-8'),
                'success': True
            }
    except urllib.error.HTTPError as e:
        return {
            'status': e.code,
            'headers': dict(e.headers),
            'body': e.read().decode('utf-8') if hasattr(e, 'read') else '',
            'success': False
        }
    except urllib.error.URLError as e:
        return {
            'status': 'CONNECTION_ERROR',
            'error': str(e),
            'success': False
        }
    except Exception as e:
        return {
            'status': 'ERROR',
            'error': str(e),
            'success': False
        }

def test_docker_services_health():
    """Probar salud de servicios Docker"""
    print("\n🏥 Probando salud de servicios Docker...")
    
    health_endpoints = [
        ("auth", f"{DOCKER_SERVICES['auth']}/health"),
        ("notifications", f"{DOCKER_SERVICES['notifications']}/health"),
        ("payments", f"{DOCKER_SERVICES['payments']}/health")
    ]
    
    results = []
    for service_name, endpoint in health_endpoints:
        print(f"🔍 Probando {service_name}...")
        result = make_request(endpoint)
        
        if result['success'] and result['status'] == 200:
            print(f"✅ {service_name}: Saludable")
            results.append({
                'service': service_name,
                'status': 'HEALTHY',
                'endpoint': endpoint
            })
        else:
            print(f"❌ {service_name}: {result.get('status', 'ERROR')} - {result.get('error', 'Sin respuesta')}")
            results.append({
                'service': service_name,
                'status': 'UNHEALTHY',
                'endpoint': endpoint,
                'error': result.get('error', 'Sin respuesta')
            })
    
    return results

def test_jwt_authentication():
    """Probar autenticación JWT en Docker"""
    print("\n🔐 Probando autenticación JWT...")
    
    # Test 1: Registro de usuario
    print("📝 Probando registro de usuario...")
    register_data = {
        "email": "security_test@example.com",
        "password": "SecurityTest123!",
        "first_name": "Security",
        "last_name": "Test",
        "role": "patient"
    }
    
    register_result = make_request(f"{DOCKER_SERVICES['auth']}/register", "POST", register_data)
    
    jwt_token = None
    if register_result['success'] and register_result['status'] in [200, 201]:
        print("✅ Registro exitoso")
        try:
            response_data = json.loads(register_result['body'])
            if 'access_token' in response_data:
                jwt_token = response_data['access_token']
                print("✅ Token JWT generado correctamente")
            else:
                print("⚠️  No se encontró access_token en la respuesta")
        except json.JSONDecodeError:
            print("⚠️  Error al decodificar respuesta JSON")
    else:
        print(f"❌ Error en registro: {register_result.get('status', 'ERROR')}")
        if register_result.get('body'):
            print(f"   Respuesta: {register_result['body'][:200]}...")
    
    # Test 2: Login
    print("\n🔑 Probando login...")
    login_data = {
        "username": "security_test@example.com",
        "password": "SecurityTest123!"
    }
    
    login_result = make_request(f"{DOCKER_SERVICES['auth']}/login", "POST", login_data)
    
    if login_result['success'] and login_result['status'] == 200:
        print("✅ Login exitoso")
        try:
            response_data = json.loads(login_result['body'])
            if 'access_token' in response_data:
                jwt_token = response_data['access_token']
                print("✅ Token JWT obtenido del login")
        except json.JSONDecodeError:
            print("⚠️  Error al decodificar respuesta de login")
    else:
        print(f"❌ Error en login: {login_result.get('status', 'ERROR')}")
    
    return jwt_token

def test_authenticated_endpoints(token):
    """Probar endpoints con autenticación JWT"""
    if not token:
        print("⚠️  No hay token JWT disponible para pruebas autenticadas")
        return []
    
    print(f"\n🔒 Probando endpoints autenticados...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Endpoints que requieren autenticación
    auth_endpoints = [
        ("auth", f"{DOCKER_SERVICES['auth']}/me"),
        ("notifications", f"{DOCKER_SERVICES['notifications']}/notifications"),
        ("payments", f"{DOCKER_SERVICES['payments']}/payments")
    ]
    
    results = []
    for service_name, endpoint in auth_endpoints:
        print(f"🔍 Probando {service_name}...")
        result = make_request(endpoint, headers=headers)
        
        if result['success'] and result['status'] == 200:
            print(f"✅ {service_name}: Acceso autorizado")
            results.append({
                'service': service_name,
                'endpoint': endpoint,
                'status': 'AUTHORIZED',
                'response': result['status']
            })
        elif result['status'] == 401:
            print(f"❌ {service_name}: Token inválido o expirado")
            results.append({
                'service': service_name,
                'endpoint': endpoint,
                'status': 'UNAUTHORIZED',
                'response': result['status']
            })
        elif result['status'] == 403:
            print(f"🔒 {service_name}: Acceso denegado por permisos")
            results.append({
                'service': service_name,
                'endpoint': endpoint,
                'status': 'FORBIDDEN',
                'response': result['status']
            })
        else:
            print(f"❓ {service_name}: Status {result.get('status', 'ERROR')}")
            results.append({
                'service': service_name,
                'endpoint': endpoint,
                'status': 'UNKNOWN',
                'response': result.get('status', 'ERROR')
            })
    
    return results

def test_unprotected_endpoints():
    """Probar endpoints sin autenticación"""
    print("\n🚨 Probando endpoints sin autenticación...")
    
    # Endpoints que deberían estar protegidos
    protected_endpoints = [
        ("notifications", f"{DOCKER_SERVICES['notifications']}/notifications"),
        ("notifications", f"{DOCKER_SERVICES['notifications']}/templates"),
        ("payments", f"{DOCKER_SERVICES['payments']}/payments"),
        ("payments", f"{DOCKER_SERVICES['payments']}/refunds"),
        ("payments", f"{DOCKER_SERVICES['payments']}/invoices")
    ]
    
    vulnerable = []
    secure = []
    
    for service_name, endpoint in protected_endpoints:
        print(f"🔍 Probando {service_name}...")
        result = make_request(endpoint)
        
        if result['success'] and result['status'] == 200:
            print(f"🚨 VULNERABLE: {service_name} - Accesible sin autenticación")
            vulnerable.append({
                'service': service_name,
                'endpoint': endpoint,
                'status': 'VULNERABLE',
                'severity': 'HIGH'
            })
        elif result['status'] == 401:
            print(f"✅ SECURE: {service_name} - Protegido correctamente")
            secure.append({
                'service': service_name,
                'endpoint': endpoint,
                'status': 'SECURE'
            })
        elif result['status'] == 404:
            print(f"⚠️  NOT FOUND: {service_name} - Endpoint no encontrado")
        else:
            print(f"❓ {service_name}: Status {result.get('status', 'ERROR')}")
    
    return vulnerable, secure

def test_rate_limiting():
    """Probar rate limiting básico"""
    print("\n⏱️  Probando rate limiting...")
    
    # Usar endpoint de login para probar rate limiting
    login_data = {
        "username": "test@example.com",
        "password": "wrongpassword"
    }
    
    print("🔄 Haciendo 10 requests de login...")
    success_count = 0
    error_count = 0
    
    for i in range(10):
        result = make_request(f"{DOCKER_SERVICES['auth']}/login", "POST", login_data)
        if result['success'] and result['status'] in [200, 401, 400]:
            success_count += 1
        else:
            error_count += 1
        
        time.sleep(0.1)  # Pequeña pausa
    
    print(f"📊 Resultados: {success_count} exitosos, {error_count} errores")
    
    if success_count == 10:
        print("⚠️  No se detectó rate limiting - Todas las requests fueron procesadas")
        return "NO_RATE_LIMITING"
    else:
        print("✅ Posible rate limiting detectado")
        return "RATE_LIMITING_DETECTED"

def generate_security_report(health_results, auth_results, vulnerable_endpoints, secure_endpoints, rate_limiting):
    """Generar reporte completo de seguridad"""
    print("\n" + "="*80)
    print("🔐 REPORTE DE SEGURIDAD - SMD VITAL (DOCKER)")
    print("="*80)
    print(f"⏰ Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Resumen de servicios
    healthy_services = len([r for r in health_results if r['status'] == 'HEALTHY'])
    total_services = len(health_results)
    
    print(f"\n📊 RESUMEN DE SERVICIOS:")
    print(f"   Servicios saludables: {healthy_services}/{total_services}")
    
    # Vulnerabilidades
    print(f"\n🚨 VULNERABILIDADES ENCONTRADAS:")
    if vulnerable_endpoints:
        print(f"   Endpoints vulnerables: {len(vulnerable_endpoints)}")
        for vuln in vulnerable_endpoints:
            print(f"   🚨 {vuln['service']}: {vuln['endpoint']} - Severidad: {vuln['severity']}")
    else:
        print("   ✅ No se encontraron endpoints vulnerables")
    
    # Endpoints seguros
    print(f"\n✅ ENDPOINTS SEGUROS:")
    print(f"   Endpoints protegidos: {len(secure_endpoints)}")
    
    # Autenticación
    print(f"\n🔐 ESTADO DE AUTENTICACIÓN:")
    authorized = len([r for r in auth_results if r['status'] == 'AUTHORIZED'])
    unauthorized = len([r for r in auth_results if r['status'] == 'UNAUTHORIZED'])
    print(f"   Endpoints autorizados: {authorized}")
    print(f"   Endpoints no autorizados: {unauthorized}")
    
    # Rate limiting
    print(f"\n⏱️  RATE LIMITING:")
    print(f"   Estado: {rate_limiting}")
    
    # Recomendaciones específicas para Docker
    print(f"\n💡 RECOMENDACIONES DE SEGURIDAD PARA DOCKER:")
    print("   1. 🔐 Implementar autenticación JWT en todos los microservicios")
    print("   2. 🐳 Configurar secrets de Docker para claves JWT")
    print("   3. 🔒 Implementar network policies entre contenedores")
    print("   4. 📝 Configurar logging centralizado con ELK stack")
    print("   5. 🛡️  Implementar validación de entrada en cada servicio")
    print("   6. 🔄 Configurar rotación automática de secretos")
    print("   7. 📊 Implementar monitoreo con Prometheus/Grafana")
    print("   8. 🚫 Configurar CORS restrictivo por servicio")
    print("   9. 🔐 Implementar mTLS entre servicios")
    print("   10. 📋 Realizar escaneos de vulnerabilidades en imágenes Docker")
    print("   11. 🐳 Usar imágenes base minimalistas (Alpine Linux)")
    print("   12. 🔒 Implementar secrets management (HashiCorp Vault)")
    print("   13. 📊 Configurar alertas de seguridad en tiempo real")
    print("   14. 🛡️  Implementar WAF a nivel de API Gateway")
    print("   15. 🔐 Configurar backup y recuperación de datos sensibles")

def main():
    """Función principal"""
    print("🐳 SMD VITAL - Docker Security Testing")
    print("=======================================")
    print(f"⏰ Iniciado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. Verificar contenedores Docker
    if not check_docker_containers():
        print("❌ No se pudieron verificar los contenedores Docker")
        return
    
    # 2. Probar salud de servicios
    health_results = test_docker_services_health()
    
    # 3. Probar autenticación JWT
    jwt_token = test_jwt_authentication()
    
    # 4. Probar endpoints autenticados
    auth_results = test_authenticated_endpoints(jwt_token)
    
    # 5. Probar endpoints desprotegidos
    vulnerable_endpoints, secure_endpoints = test_unprotected_endpoints()
    
    # 6. Probar rate limiting
    rate_limiting = test_rate_limiting()
    
    # 7. Generar reporte
    generate_security_report(health_results, auth_results, vulnerable_endpoints, secure_endpoints, rate_limiting)
    
    print(f"\n⏰ Finalizado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
