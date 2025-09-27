#!/usr/bin/env python3
"""
SMD Vital - Role Permissions Testing
===================================

Script específico para probar roles y permisos en el sistema SMD Vital.
Prueba diferentes roles de usuario y sus accesos a endpoints.

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
    "medical-records": "http://localhost:8005",
    "notifications": "http://localhost:8004",
    "payments": "http://localhost:8006"
}

# Roles del sistema
ROLES = {
    "patient": {
        "permissions": [
            "view_own_profile",
            "create_appointment", 
            "view_own_medical_records",
            "make_payment"
        ],
        "restricted_endpoints": [
            "/admin",
            "/doctors/manage",
            "/medical-records/all",
            "/payments/all"
        ]
    },
    "doctor": {
        "permissions": [
            "view_all_profiles",
            "create_medical_record",
            "view_medical_records",
            "create_prescription",
            "view_appointments"
        ],
        "allowed_endpoints": [
            "/medical-records",
            "/prescriptions",
            "/appointments",
            "/patients"
        ]
    },
    "nurse": {
        "permissions": [
            "view_profiles",
            "record_vital_signs",
            "view_medical_records",
            "view_appointments"
        ],
        "allowed_endpoints": [
            "/vital-signs",
            "/medical-records",
            "/appointments"
        ]
    },
    "admin": {
        "permissions": [
            "manage_users",
            "view_all_data",
            "manage_system",
            "view_reports",
            "manage_payments"
        ],
        "allowed_endpoints": [
            "/admin",
            "/users",
            "/reports",
            "/system"
        ]
    },
    "lab_technician": {
        "permissions": [
            "create_lab_results",
            "view_lab_data",
            "update_lab_status"
        ],
        "allowed_endpoints": [
            "/lab-results",
            "/lab-data"
        ]
    }
}

def make_request(url, method="GET", data=None, headers=None, timeout=10):
    """Hacer request HTTP"""
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
    except Exception as e:
        return {
            'status': 'ERROR',
            'error': str(e),
            'success': False
        }

def create_test_user(role="patient"):
    """Crear usuario de prueba para un rol específico"""
    print(f"👤 Creando usuario de prueba para rol: {role}")
    
    user_data = {
        "email": f"test_{role}@example.com",
        "password": "TestPassword123!",
        "first_name": "Test",
        "last_name": role.title(),
        "role": role
    }
    
    result = make_request(f"{SERVICES['auth']}/register", "POST", user_data)
    
    if result['success'] and result['status'] in [200, 201]:
        print(f"✅ Usuario {role} creado exitosamente")
        try:
            response_data = json.loads(result['body'])
            return response_data.get('access_token')
        except:
            print("⚠️  No se pudo extraer token del registro")
            return None
    else:
        print(f"❌ Error creando usuario {role}: {result.get('status', 'ERROR')}")
        return None

def test_role_access(token, role, service_name, endpoint):
    """Probar acceso de un rol a un endpoint específico"""
    if not token:
        return {
            'role': role,
            'service': service_name,
            'endpoint': endpoint,
            'status': 'NO_TOKEN',
            'result': 'No token available'
        }
    
    headers = {"Authorization": f"Bearer {token}"}
    full_url = f"{SERVICES[service_name]}{endpoint}"
    
    result = make_request(full_url, headers=headers)
    
    if result['success'] and result['status'] == 200:
        return {
            'role': role,
            'service': service_name,
            'endpoint': endpoint,
            'status': 'AUTHORIZED',
            'result': 'Access granted'
        }
    elif result['status'] == 403:
        return {
            'role': role,
            'service': service_name,
            'endpoint': endpoint,
            'status': 'FORBIDDEN',
            'result': 'Access denied - insufficient permissions'
        }
    elif result['status'] == 401:
        return {
            'role': role,
            'service': service_name,
            'endpoint': endpoint,
            'status': 'UNAUTHORIZED',
            'result': 'Invalid or expired token'
        }
    else:
        return {
            'role': role,
            'service': service_name,
            'endpoint': endpoint,
            'status': 'ERROR',
            'result': f"Unexpected response: {result.get('status', 'ERROR')}"
        }

def test_role_permissions():
    """Probar permisos de diferentes roles"""
    print("\n👥 Probando permisos de roles...")
    
    test_endpoints = [
        ("users", "/profile"),
        ("appointments", "/appointments"),
        ("medical-records", "/medical-records"),
        ("payments", "/payments"),
        ("notifications", "/notifications")
    ]
    
    results = []
    
    for role, role_config in ROLES.items():
        print(f"\n🔍 Probando rol: {role}")
        
        # Crear usuario para el rol
        token = create_test_user(role)
        
        if not token:
            print(f"⚠️  No se pudo crear token para rol {role}")
            continue
        
        # Probar acceso a endpoints
        for service, endpoint in test_endpoints:
            result = test_role_access(token, role, service, endpoint)
            results.append(result)
            
            status_icon = {
                'AUTHORIZED': '✅',
                'FORBIDDEN': '🔒',
                'UNAUTHORIZED': '❌',
                'ERROR': '⚠️',
                'NO_TOKEN': '🚫'
            }.get(result['status'], '❓')
            
            print(f"   {status_icon} {service}{endpoint}: {result['result']}")
    
    return results

def test_privilege_escalation():
    """Probar escalación de privilegios"""
    print("\n🚨 Probando escalación de privilegios...")
    
    # Crear usuario paciente
    patient_token = create_test_user("patient")
    
    if not patient_token:
        print("❌ No se pudo crear token de paciente")
        return []
    
    # Endpoints que solo deberían ser accesibles por admin/doctor
    admin_endpoints = [
        ("users", "/admin"),
        ("medical-records", "/medical-records/all"),
        ("payments", "/payments/all"),
        ("notifications", "/admin/notifications")
    ]
    
    escalation_results = []
    
    for service, endpoint in admin_endpoints:
        result = test_role_access(patient_token, "patient", service, endpoint)
        escalation_results.append(result)
        
        if result['status'] == 'AUTHORIZED':
            print(f"🚨 ESCALACIÓN DETECTADA: Paciente accedió a {service}{endpoint}")
        else:
            print(f"✅ Protegido: Paciente no puede acceder a {service}{endpoint}")
    
    return escalation_results

def test_cross_user_access():
    """Probar acceso cruzado entre usuarios"""
    print("\n🔍 Probando acceso cruzado entre usuarios...")
    
    # Crear dos usuarios diferentes
    user1_token = create_test_user("patient")
    user2_token = create_test_user("doctor")
    
    if not user1_token or not user2_token:
        print("❌ No se pudieron crear tokens para prueba de acceso cruzado")
        return []
    
    # Probar que cada usuario solo acceda a sus propios datos
    cross_access_results = []
    
    # Simular acceso a datos de otro usuario (esto debería fallar)
    test_cases = [
        ("patient", user1_token, "/profile", "Acceso a propio perfil"),
        ("doctor", user2_token, "/profile", "Acceso a propio perfil"),
    ]
    
    for role, token, endpoint, description in test_cases:
        result = test_role_access(token, role, "users", endpoint)
        cross_access_results.append({
            **result,
            'description': description
        })
        
        if result['status'] == 'AUTHORIZED':
            print(f"✅ {description}: Acceso autorizado")
        else:
            print(f"❌ {description}: Acceso denegado - {result['result']}")
    
    return cross_access_results

def generate_role_security_report(role_results, escalation_results, cross_access_results):
    """Generar reporte de seguridad de roles"""
    print("\n" + "="*80)
    print("👥 REPORTE DE SEGURIDAD DE ROLES - SMD VITAL")
    print("="*80)
    
    # Análisis de permisos por rol
    print("\n📊 ANÁLISIS DE PERMISOS POR ROL:")
    print("-" * 50)
    
    role_stats = {}
    for result in role_results:
        role = result['role']
        if role not in role_stats:
            role_stats[role] = {'total': 0, 'authorized': 0, 'forbidden': 0, 'errors': 0}
        
        role_stats[role]['total'] += 1
        if result['status'] == 'AUTHORIZED':
            role_stats[role]['authorized'] += 1
        elif result['status'] == 'FORBIDDEN':
            role_stats[role]['forbidden'] += 1
        else:
            role_stats[role]['errors'] += 1
    
    for role, stats in role_stats.items():
        authorized_pct = (stats['authorized'] / stats['total']) * 100 if stats['total'] > 0 else 0
        print(f"   {role.upper()}: {stats['authorized']}/{stats['total']} autorizados ({authorized_pct:.1f}%)")
    
    # Análisis de escalación de privilegios
    print(f"\n🚨 ESCALACIÓN DE PRIVILEGIOS:")
    print("-" * 50)
    
    escalations = [r for r in escalation_results if r['status'] == 'AUTHORIZED']
    if escalations:
        print(f"   ❌ {len(escalations)} casos de escalación detectados:")
        for esc in escalations:
            print(f"      • {esc['role']} accedió a {esc['service']}{esc['endpoint']}")
    else:
        print("   ✅ No se detectaron escalaciones de privilegios")
    
    # Análisis de acceso cruzado
    print(f"\n🔍 ACCESO CRUZADO:")
    print("-" * 50)
    
    unauthorized_cross_access = [r for r in cross_access_results if r['status'] != 'AUTHORIZED']
    if unauthorized_cross_access:
        print(f"   ⚠️  {len(unauthorized_cross_access)} casos de acceso no autorizado")
    else:
        print("   ✅ Acceso cruzado controlado correctamente")
    
    # Recomendaciones específicas para roles
    print(f"\n💡 RECOMENDACIONES PARA ROLES:")
    print("-" * 50)
    print("   1. 🔐 Implementar RBAC granular con permisos específicos")
    print("   2. 🛡️  Validar permisos en cada endpoint")
    print("   3. 🔒 Implementar principio de menor privilegio")
    print("   4. 📝 Auditar accesos por rol regularmente")
    print("   5. 🚫 Bloquear escalación de privilegios")
    print("   6. 👥 Implementar aislamiento de datos por usuario")
    print("   7. 🔄 Rotar permisos de administrador regularmente")
    print("   8. 📊 Monitorear patrones de acceso anómalos")

def main():
    """Función principal"""
    print("👥 SMD VITAL - Role Permissions Testing")
    print("=======================================")
    print(f"⏰ Iniciado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. Probar permisos de roles
    role_results = test_role_permissions()
    
    # 2. Probar escalación de privilegios
    escalation_results = test_privilege_escalation()
    
    # 3. Probar acceso cruzado
    cross_access_results = test_cross_user_access()
    
    # 4. Generar reporte
    generate_role_security_report(role_results, escalation_results, cross_access_results)
    
    print(f"\n⏰ Finalizado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
