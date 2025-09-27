#!/usr/bin/env python3
"""
SMD VITAL - Ejemplo de Ejecución de Pruebas de Seguridad
========================================================

Script de ejemplo que demuestra cómo ejecutar las pruebas de seguridad paso a paso.

Author: Backend Team
Date: 2025-01-27
"""

import subprocess
import json
import time
import os
from datetime import datetime

def print_header(title):
    """Imprimir encabezado con formato"""
    print("\n" + "="*60)
    print(f"🔒 {title}")
    print("="*60)

def print_step(step_num, title, description=""):
    """Imprimir paso con formato"""
    print(f"\n📋 Paso {step_num}: {title}")
    if description:
        print(f"   {description}")

def run_script(script_name, description):
    """Ejecutar script y mostrar resultados"""
    print(f"\n🚀 Ejecutando: {script_name}")
    print(f"📝 {description}")
    
    try:
        result = subprocess.run(
            ["python", script_name],
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode == 0:
            print(f"✅ {script_name} completado exitosamente")
            return True
        else:
            print(f"❌ {script_name} falló con código {result.returncode}")
            if result.stderr:
                print(f"Error: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print(f"⏰ {script_name} tardó más de 5 minutos - timeout")
        return False
    except Exception as e:
        print(f"❌ Error ejecutando {script_name}: {e}")
        return False

def check_report_exists(report_name):
    """Verificar si existe un reporte"""
    if os.path.exists(report_name):
        print(f"📄 Reporte generado: {report_name}")
        return True
    else:
        print(f"⚠️  Reporte no encontrado: {report_name}")
        return False

def show_report_summary(report_name):
    """Mostrar resumen de un reporte"""
    if not os.path.exists(report_name):
        return
    
    try:
        with open(report_name, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"\n📊 Resumen de {report_name}:")
        
        if 'summary' in data:
            summary = data['summary']
            for key, value in summary.items():
                print(f"   {key}: {value}")
        
        if 'vulnerabilities' in data:
            vulns = data['vulnerabilities']
            if isinstance(vulns, dict):
                for severity, count in vulns.items():
                    if isinstance(count, int):
                        print(f"   {severity}: {count}")
        
    except Exception as e:
        print(f"❌ Error leyendo {report_name}: {e}")

def main():
    """Función principal - Ejemplo de ejecución paso a paso"""
    print_header("SMD VITAL - Ejemplo de Ejecución de Pruebas de Seguridad")
    
    print("\n🎯 Este ejemplo demuestra cómo ejecutar las pruebas de seguridad paso a paso.")
    print("📋 Asegúrate de que los servicios SMD VITAL estén ejecutándose antes de continuar.")
    
    input("\n⏸️  Presiona Enter para continuar...")
    
    # Paso 1: Verificar servicios
    print_step(1, "Verificar Servicios", "Asegurar que los servicios estén ejecutándose")
    
    services = [
        "http://localhost:8001",  # Auth
        "http://localhost:8002",  # Users
        "http://localhost:8003",  # Appointments
        "http://localhost:8004",  # Notifications
        "http://localhost:8005",  # Medical Records
        "http://localhost:8006",  # Payments
        "http://localhost:8007"   # Health Metrics
    ]
    
    print("🔍 Verificando conectividad con servicios...")
    for service in services:
        try:
            import requests
            response = requests.get(f"{service}/health", timeout=5)
            if response.status_code == 200:
                print(f"   ✅ {service} - OK")
            else:
                print(f"   ⚠️  {service} - Status {response.status_code}")
        except:
            print(f"   ❌ {service} - No disponible")
    
    input("\n⏸️  Presiona Enter para continuar con las pruebas...")
    
    # Paso 2: Pruebas de endpoints desprotegidos
    print_step(2, "Pruebas de Endpoints Desprotegidos", "Detectar endpoints que deberían requerir autenticación")
    
    success = run_script("test_unprotected_endpoints.py", 
                        "Detecta endpoints accesibles sin autenticación")
    
    if success:
        check_report_exists("unprotected_endpoints_report.json")
        show_report_summary("unprotected_endpoints_report.json")
    
    input("\n⏸️  Presiona Enter para continuar...")
    
    # Paso 3: Pruebas de RBAC
    print_step(3, "Pruebas de Control de Acceso Basado en Roles", "Verificar RBAC y prevención de escalación de privilegios")
    
    success = run_script("test_role_based_access.py", 
                        "Verifica control de acceso basado en roles")
    
    if success:
        check_report_exists("rbac_test_report.json")
        show_report_summary("rbac_test_report.json")
    
    input("\n⏸️  Presiona Enter para continuar...")
    
    # Paso 4: Pruebas de seguridad generales
    print_step(4, "Pruebas de Seguridad de Endpoints", "Probar endpoints con datos inválidos y tokens expirados")
    
    success = run_script("security_endpoint_tests.py", 
                        "Prueba endpoints con datos inválidos, tokens expirados y roles incorrectos")
    
    if success:
        check_report_exists("security_test_report.json")
        show_report_summary("security_test_report.json")
    
    input("\n⏸️  Presiona Enter para continuar...")
    
    # Paso 5: Pruebas de masking de datos
    print_step(5, "Pruebas de Masking de Datos y Estandarización", "Verificar enmascaramiento de datos sensibles")
    
    success = run_script("test_data_masking_standardization.py", 
                        "Verifica masking de datos sensibles y estandarización")
    
    if success:
        check_report_exists("data_masking_standardization_report.json")
        show_report_summary("data_masking_standardization_report.json")
    
    input("\n⏸️  Presiona Enter para continuar...")
    
    # Paso 6: Reporte consolidado
    print_step(6, "Generar Reporte Consolidado", "Crear reporte ejecutivo con todas las pruebas")
    
    print("\n🚀 Ejecutando script maestro para generar reporte consolidado...")
    success = run_script("run_all_security_tests.py", 
                        "Genera reporte ejecutivo consolidado")
    
    if success:
        check_report_exists("executive_security_report.json")
        check_report_exists("executive_security_report.txt")
        
        print("\n📄 Reportes generados:")
        print("   - executive_security_report.json (formato JSON)")
        print("   - executive_security_report.txt (formato texto)")
        print("   - Reportes individuales de cada prueba")
    
    # Resumen final
    print_header("Resumen de Ejecución")
    
    print("\n✅ Pruebas de seguridad completadas!")
    print("\n📊 Reportes disponibles:")
    
    report_files = [
        "unprotected_endpoints_report.json",
        "rbac_test_report.json", 
        "security_test_report.json",
        "data_masking_standardization_report.json",
        "executive_security_report.json",
        "executive_security_report.txt"
    ]
    
    for report_file in report_files:
        if os.path.exists(report_file):
            print(f"   ✅ {report_file}")
        else:
            print(f"   ❌ {report_file} - No generado")
    
    print("\n🎯 Próximos pasos:")
    print("   1. Revisar reportes generados")
    print("   2. Analizar vulnerabilidades detectadas")
    print("   3. Implementar recomendaciones de seguridad")
    print("   4. Ejecutar pruebas nuevamente para validar correcciones")
    
    print("\n📚 Para más información, consulta:")
    print("   - SECURITY_TESTING_README.md")
    print("   - Reportes individuales en formato JSON")
    print("   - Reporte ejecutivo en formato texto")

if __name__ == "__main__":
    main()
