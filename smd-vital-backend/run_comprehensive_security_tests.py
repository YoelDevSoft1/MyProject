#!/usr/bin/env python3
"""
SMD VITAL - Ejecutor Maestro de Pruebas de Seguridad
====================================================

Script maestro para ejecutar todas las pruebas de seguridad y generar reportes consolidados.

Author: Backend Team
Date: 2025-01-27
"""

import subprocess
import json
import time
import os
from datetime import datetime
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ComprehensiveSecurityTester:
    """Ejecutor maestro de pruebas de seguridad"""
    
    def __init__(self):
        self.test_scripts = [
            {
                "name": "Pruebas de Endpoints Desprotegidos",
                "script": "test_unprotected_endpoints.py",
                "description": "Detecta endpoints que deberían requerir autenticación pero no la tienen"
            },
            {
                "name": "Pruebas de Control de Acceso Basado en Roles",
                "script": "test_role_based_access.py", 
                "description": "Verifica el control de acceso basado en roles (RBAC)"
            },
            {
                "name": "Pruebas de Seguridad de Endpoints",
                "script": "security_endpoint_tests.py",
                "description": "Prueba endpoints con datos inválidos, tokens expirados y roles incorrectos"
            }
        ]
        
        self.results = {}
        self.consolidated_report = {}
    
    def run_security_test(self, script_name: str) -> Dict:
        """Ejecutar un script de prueba de seguridad"""
        logger.info(f"🔍 Ejecutando: {script_name}")
        
        try:
            # Ejecutar script
            result = subprocess.run(
                ["python", script_name],
                capture_output=True,
                text=True,
                timeout=300  # 5 minutos timeout
            )
            
            return {
                "script": script_name,
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "return_code": result.returncode,
                "execution_time": time.time()
            }
            
        except subprocess.TimeoutExpired:
            return {
                "script": script_name,
                "success": False,
                "error": "Timeout - script tardó más de 5 minutos",
                "execution_time": time.time()
            }
        except Exception as e:
            return {
                "script": script_name,
                "success": False,
                "error": str(e),
                "execution_time": time.time()
            }
    
    def run_all_security_tests(self):
        """Ejecutar todas las pruebas de seguridad"""
        logger.info("🚀 Iniciando pruebas de seguridad comprehensivas...")
        
        start_time = time.time()
        
        for test_config in self.test_scripts:
            script_name = test_config["script"]
            test_name = test_config["name"]
            
            logger.info(f"📋 Ejecutando: {test_name}")
            logger.info(f"📝 Descripción: {test_config['description']}")
            
            result = self.run_security_test(script_name)
            self.results[script_name] = result
            
            if result["success"]:
                logger.info(f"✅ {test_name} completado exitosamente")
            else:
                logger.error(f"❌ {test_name} falló: {result.get('error', 'Error desconocido')}")
            
            time.sleep(2)  # Pausa entre pruebas
        
        execution_time = time.time() - start_time
        logger.info(f"⏱️  Tiempo total de ejecución: {execution_time:.2f} segundos")
        
        return self.results
    
    def load_test_reports(self):
        """Cargar reportes generados por los scripts de prueba"""
        report_files = [
            "unprotected_endpoints_report.json",
            "rbac_test_report.json", 
            "security_test_report.json"
        ]
        
        loaded_reports = {}
        
        for report_file in report_files:
            if os.path.exists(report_file):
                try:
                    with open(report_file, 'r', encoding='utf-8') as f:
                        report_data = json.load(f)
                        loaded_reports[report_file] = report_data
                        logger.info(f"📄 Cargado reporte: {report_file}")
                except Exception as e:
                    logger.error(f"❌ Error cargando {report_file}: {e}")
            else:
                logger.warning(f"⚠️  Reporte no encontrado: {report_file}")
        
        return loaded_reports
    
    def consolidate_reports(self, loaded_reports: Dict) -> Dict:
        """Consolidar todos los reportes en uno solo"""
        consolidated = {
            "timestamp": datetime.now().isoformat(),
            "execution_summary": {
                "total_scripts_executed": len(self.test_scripts),
                "successful_scripts": sum(1 for r in self.results.values() if r["success"]),
                "failed_scripts": sum(1 for r in self.results.values() if not r["success"])
            },
            "security_summary": {
                "unprotected_endpoints": 0,
                "rbac_violations": 0,
                "data_leaks": 0,
                "critical_vulnerabilities": 0,
                "high_vulnerabilities": 0,
                "medium_vulnerabilities": 0
            },
            "detailed_findings": {},
            "recommendations": [],
            "execution_results": self.results
        }
        
        # Consolidar datos de reportes
        for report_file, report_data in loaded_reports.items():
            if "unprotected_endpoints_report.json" in report_file:
                summary = report_data.get("summary", {})
                consolidated["security_summary"]["unprotected_endpoints"] = summary.get("vulnerable_endpoints", 0)
                consolidated["detailed_findings"]["unprotected_endpoints"] = report_data.get("vulnerabilities", {})
                
            elif "rbac_test_report.json" in report_file:
                summary = report_data.get("summary", {})
                consolidated["security_summary"]["rbac_violations"] = summary.get("access_violations", 0)
                consolidated["detailed_findings"]["rbac_violations"] = report_data.get("violations", {})
                
            elif "security_test_report.json" in report_file:
                summary = report_data.get("summary", {})
                consolidated["security_summary"]["data_leaks"] = summary.get("data_leaks_count", 0)
                consolidated["detailed_findings"]["security_tests"] = report_data.get("detailed_results", {})
        
        # Calcular totales de vulnerabilidades
        for finding_type, findings in consolidated["detailed_findings"].items():
            if isinstance(findings, dict):
                critical = findings.get("critical", [])
                high = findings.get("high", [])
                medium = findings.get("medium", [])
                
                consolidated["security_summary"]["critical_vulnerabilities"] += len(critical)
                consolidated["security_summary"]["high_vulnerabilities"] += len(high)
                consolidated["security_summary"]["medium_vulnerabilities"] += len(medium)
        
        return consolidated
    
    def generate_consolidated_recommendations(self, consolidated: Dict) -> List[Dict]:
        """Generar recomendaciones consolidadas"""
        recommendations = []
        
        # Recomendaciones críticas
        if consolidated["security_summary"]["critical_vulnerabilities"] > 0:
            recommendations.append({
                "priority": "CRITICAL",
                "category": "SECURITY",
                "issue": f"{consolidated['security_summary']['critical_vulnerabilities']} vulnerabilidades críticas encontradas",
                "recommendation": "Implementar medidas de seguridad inmediatas",
                "actions": [
                    "Proteger todos los endpoints desprotegidos",
                    "Implementar autenticación JWT obligatoria",
                    "Validar roles y permisos en todos los endpoints",
                    "Implementar logging de seguridad"
                ]
            })
        
        # Recomendaciones de alto riesgo
        if consolidated["security_summary"]["high_vulnerabilities"] > 0:
            recommendations.append({
                "priority": "HIGH",
                "category": "ACCESS_CONTROL",
                "issue": f"{consolidated['security_summary']['high_vulnerabilities']} vulnerabilidades de alto riesgo",
                "recommendation": "Implementar control de acceso robusto",
                "actions": [
                    "Implementar RBAC completo",
                    "Validar permisos específicos",
                    "Implementar middleware de autorización"
                ]
            })
        
        # Recomendaciones de estandarización
        recommendations.extend([
            {
                "priority": "HIGH",
                "category": "STANDARDIZATION",
                "issue": "Falta estandarización de respuestas de error",
                "recommendation": "Implementar formato estándar para respuestas de error",
                "actions": [
                    "Crear middleware de manejo de errores unificado",
                    "Implementar masking de datos sensibles",
                    "Estandarizar códigos de respuesta HTTP"
                ]
            },
            {
                "priority": "MEDIUM",
                "category": "MONITORING",
                "issue": "Falta implementación de monitoreo de seguridad",
                "recommendation": "Implementar monitoreo y alertas de seguridad",
                "actions": [
                    "Implementar logging de intentos de acceso no autorizado",
                    "Configurar alertas de seguridad",
                    "Implementar rate limiting"
                ]
            }
        ])
        
        return recommendations
    
    def generate_final_report(self):
        """Generar reporte final consolidado"""
        logger.info("📊 Generando reporte consolidado...")
        
        # Cargar reportes individuales
        loaded_reports = self.load_test_reports()
        
        # Consolidar reportes
        consolidated = self.consolidate_reports(loaded_reports)
        
        # Generar recomendaciones
        consolidated["recommendations"] = self.generate_consolidated_recommendations(consolidated)
        
        # Guardar reporte consolidado
        with open("comprehensive_security_report.json", "w", encoding="utf-8") as f:
            json.dump(consolidated, f, indent=2, ensure_ascii=False)
        
        # Generar reporte en texto plano
        self.generate_text_report(consolidated)
        
        return consolidated
    
    def generate_text_report(self, consolidated: Dict):
        """Generar reporte en formato de texto"""
        with open("comprehensive_security_report.txt", "w", encoding="utf-8") as f:
            f.write("🔒 REPORTE COMPREHENSIVO DE SEGURIDAD - SMD VITAL\n")
            f.write("=" * 60 + "\n\n")
            
            f.write(f"Fecha: {consolidated['timestamp']}\n")
            f.write(f"Scripts ejecutados: {consolidated['execution_summary']['total_scripts_executed']}\n")
            f.write(f"Scripts exitosos: {consolidated['execution_summary']['successful_scripts']}\n")
            f.write(f"Scripts fallidos: {consolidated['execution_summary']['failed_scripts']}\n\n")
            
            f.write("📊 RESUMEN DE SEGURIDAD:\n")
            f.write("-" * 30 + "\n")
            f.write(f"Endpoints desprotegidos: {consolidated['security_summary']['unprotected_endpoints']}\n")
            f.write(f"Violaciones RBAC: {consolidated['security_summary']['rbac_violations']}\n")
            f.write(f"Fugas de datos: {consolidated['security_summary']['data_leaks']}\n")
            f.write(f"Vulnerabilidades críticas: {consolidated['security_summary']['critical_vulnerabilities']}\n")
            f.write(f"Vulnerabilidades de alto riesgo: {consolidated['security_summary']['high_vulnerabilities']}\n")
            f.write(f"Vulnerabilidades de riesgo medio: {consolidated['security_summary']['medium_vulnerabilities']}\n\n")
            
            f.write("🎯 RECOMENDACIONES PRINCIPALES:\n")
            f.write("-" * 35 + "\n")
            for i, rec in enumerate(consolidated["recommendations"], 1):
                f.write(f"{i}. [{rec['priority']}] {rec['issue']}\n")
                f.write(f"   Recomendación: {rec['recommendation']}\n")
                if 'actions' in rec:
                    f.write(f"   Acciones:\n")
                    for action in rec['actions']:
                        f.write(f"   - {action}\n")
                f.write("\n")
            
            f.write("📋 DETALLES DE EJECUCIÓN:\n")
            f.write("-" * 25 + "\n")
            for script, result in consolidated["execution_results"].items():
                f.write(f"Script: {script}\n")
                f.write(f"Estado: {'✅ Exitoso' if result['success'] else '❌ Fallido'}\n")
                if not result['success'] and 'error' in result:
                    f.write(f"Error: {result['error']}\n")
                f.write("\n")
    
    def print_summary(self, consolidated: Dict):
        """Imprimir resumen en consola"""
        print("\n" + "="*60)
        print("🔒 REPORTE COMPREHENSIVO DE SEGURIDAD - SMD VITAL")
        print("="*60)
        
        print(f"\n📊 RESUMEN EJECUTIVO:")
        print(f"Scripts ejecutados: {consolidated['execution_summary']['total_scripts_executed']}")
        print(f"Scripts exitosos: {consolidated['execution_summary']['successful_scripts']}")
        print(f"Scripts fallidos: {consolidated['execution_summary']['failed_scripts']}")
        
        print(f"\n🚨 VULNERABILIDADES DETECTADAS:")
        print(f"Endpoints desprotegidos: {consolidated['security_summary']['unprotected_endpoints']}")
        print(f"Violaciones RBAC: {consolidated['security_summary']['rbac_violations']}")
        print(f"Fugas de datos: {consolidated['security_summary']['data_leaks']}")
        print(f"Vulnerabilidades críticas: {consolidated['security_summary']['critical_vulnerabilities']}")
        print(f"Vulnerabilidades de alto riesgo: {consolidated['security_summary']['high_vulnerabilities']}")
        print(f"Vulnerabilidades de riesgo medio: {consolidated['security_summary']['medium_vulnerabilities']}")
        
        print(f"\n🎯 RECOMENDACIONES PRINCIPALES:")
        for i, rec in enumerate(consolidated["recommendations"][:5], 1):  # Mostrar solo las 5 principales
            print(f"{i}. [{rec['priority']}] {rec['issue']}")
            print(f"   {rec['recommendation']}")
        
        print(f"\n📄 Reportes generados:")
        print(f"- comprehensive_security_report.json (formato JSON)")
        print(f"- comprehensive_security_report.txt (formato texto)")
        print(f"- unprotected_endpoints_report.json")
        print(f"- rbac_test_report.json")
        print(f"- security_test_report.json")

def main():
    """Función principal"""
    print("🔒 SMD VITAL - Ejecutor Maestro de Pruebas de Seguridad")
    print("=" * 60)
    
    tester = ComprehensiveSecurityTester()
    
    try:
        # Ejecutar todas las pruebas
        tester.run_all_security_tests()
        
        # Generar reporte consolidado
        consolidated_report = tester.generate_final_report()
        
        # Mostrar resumen
        tester.print_summary(consolidated_report)
        
        print(f"\n✅ Pruebas de seguridad completadas exitosamente!")
        
    except Exception as e:
        logger.error(f"Error durante la ejecución: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
