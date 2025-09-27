#!/usr/bin/env python3
"""
SMD VITAL - Ejecutor Completo de Pruebas de Seguridad
======================================================

Script maestro que ejecuta todas las pruebas de seguridad y genera reportes consolidados.

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

class CompleteSecurityTester:
    """Ejecutor completo de pruebas de seguridad"""
    
    def __init__(self):
        self.test_scripts = [
            {
                "name": "Endpoints Desprotegidos",
                "script": "test_unprotected_endpoints.py",
                "description": "Detecta endpoints que deberían requerir autenticación",
                "priority": "CRITICAL"
            },
            {
                "name": "Control de Acceso Basado en Roles",
                "script": "test_role_based_access.py",
                "description": "Verifica el control de acceso basado en roles (RBAC)",
                "priority": "HIGH"
            },
            {
                "name": "Pruebas de Seguridad de Endpoints",
                "script": "security_endpoint_tests.py",
                "description": "Prueba endpoints con datos inválidos y tokens expirados",
                "priority": "HIGH"
            },
            {
                "name": "Masking de Datos y Estandarización",
                "script": "test_data_masking_standardization.py",
                "description": "Verifica masking de datos sensibles y estandarización",
                "priority": "MEDIUM"
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
                timeout=600  # 10 minutos timeout
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
                "error": "Timeout - script tardó más de 10 minutos",
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
        logger.info("🚀 Iniciando pruebas de seguridad completas...")
        
        start_time = time.time()
        
        for test_config in self.test_scripts:
            script_name = test_config["script"]
            test_name = test_config["name"]
            priority = test_config["priority"]
            
            logger.info(f"📋 Ejecutando: {test_name} [{priority}]")
            logger.info(f"📝 Descripción: {test_config['description']}")
            
            result = self.run_security_test(script_name)
            result["priority"] = priority
            result["test_name"] = test_name
            self.results[script_name] = result
            
            if result["success"]:
                logger.info(f"✅ {test_name} completado exitosamente")
            else:
                logger.error(f"❌ {test_name} falló: {result.get('error', 'Error desconocido')}")
            
            time.sleep(3)  # Pausa entre pruebas
        
        execution_time = time.time() - start_time
        logger.info(f"⏱️  Tiempo total de ejecución: {execution_time:.2f} segundos")
        
        return self.results
    
    def load_all_reports(self):
        """Cargar todos los reportes generados"""
        report_files = [
            "unprotected_endpoints_report.json",
            "rbac_test_report.json",
            "security_test_report.json",
            "data_masking_standardization_report.json"
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
    
    def consolidate_all_reports(self, loaded_reports: Dict) -> Dict:
        """Consolidar todos los reportes en uno ejecutivo"""
        consolidated = {
            "timestamp": datetime.now().isoformat(),
            "executive_summary": {
                "total_scripts_executed": len(self.test_scripts),
                "successful_scripts": sum(1 for r in self.results.values() if r["success"]),
                "failed_scripts": sum(1 for r in self.results.values() if not r["success"]),
                "execution_time_minutes": round((time.time() - time.mktime(time.strptime(consolidated.get("timestamp", datetime.now().isoformat()), "%Y-%m-%dT%H:%M:%S.%f"))) / 60, 2) if "timestamp" in locals() else 0
            },
            "security_metrics": {
                "unprotected_endpoints": 0,
                "rbac_violations": 0,
                "data_leaks": 0,
                "standardization_issues": 0,
                "critical_vulnerabilities": 0,
                "high_vulnerabilities": 0,
                "medium_vulnerabilities": 0,
                "low_vulnerabilities": 0
            },
            "detailed_findings": {},
            "executive_recommendations": [],
            "implementation_roadmap": [],
            "execution_results": self.results
        }
        
        # Consolidar métricas de seguridad
        for report_file, report_data in loaded_reports.items():
            if "unprotected_endpoints_report.json" in report_file:
                summary = report_data.get("summary", {})
                consolidated["security_metrics"]["unprotected_endpoints"] = summary.get("vulnerable_endpoints", 0)
                consolidated["detailed_findings"]["unprotected_endpoints"] = report_data.get("vulnerabilities", {})
                
            elif "rbac_test_report.json" in report_file:
                summary = report_data.get("summary", {})
                consolidated["security_metrics"]["rbac_violations"] = summary.get("access_violations", 0)
                consolidated["detailed_findings"]["rbac_violations"] = report_data.get("violations", {})
                
            elif "security_test_report.json" in report_file:
                summary = report_data.get("summary", {})
                consolidated["security_metrics"]["data_leaks"] = summary.get("data_leaks_count", 0)
                consolidated["detailed_findings"]["security_tests"] = report_data.get("detailed_results", {})
                
            elif "data_masking_standardization_report.json" in report_file:
                summary = report_data.get("summary", {})
                consolidated["security_metrics"]["standardization_issues"] = summary.get("standardization_issues", 0)
                consolidated["detailed_findings"]["data_masking"] = report_data.get("data_leaks", [])
        
        # Calcular totales de vulnerabilidades
        for finding_type, findings in consolidated["detailed_findings"].items():
            if isinstance(findings, dict):
                critical = findings.get("critical", [])
                high = findings.get("high", [])
                medium = findings.get("medium", [])
                low = findings.get("low", [])
                
                consolidated["security_metrics"]["critical_vulnerabilities"] += len(critical)
                consolidated["security_metrics"]["high_vulnerabilities"] += len(high)
                consolidated["security_metrics"]["medium_vulnerabilities"] += len(medium)
                consolidated["security_metrics"]["low_vulnerabilities"] += len(low)
        
        return consolidated
    
    def generate_executive_recommendations(self, consolidated: Dict) -> List[Dict]:
        """Generar recomendaciones ejecutivas"""
        recommendations = []
        
        # Recomendaciones críticas
        if consolidated["security_metrics"]["critical_vulnerabilities"] > 0:
            recommendations.append({
                "priority": "CRITICAL",
                "category": "IMMEDIATE_ACTION",
                "title": "Vulnerabilidades Críticas Requieren Acción Inmediata",
                "description": f"Se detectaron {consolidated['security_metrics']['critical_vulnerabilities']} vulnerabilidades críticas que requieren atención inmediata",
                "business_impact": "Alto riesgo de compromiso de datos médicos y financieros",
                "timeline": "1-3 días",
                "actions": [
                    "Proteger todos los endpoints desprotegidos",
                    "Implementar autenticación JWT obligatoria",
                    "Validar roles y permisos en todos los endpoints",
                    "Implementar logging de seguridad inmediato"
                ],
                "resources_needed": ["Desarrollador Senior", "Especialista en Seguridad", "DevOps"]
            })
        
        # Recomendaciones de alto riesgo
        if consolidated["security_metrics"]["high_vulnerabilities"] > 0:
            recommendations.append({
                "priority": "HIGH",
                "category": "SECURITY_ENHANCEMENT",
                "title": "Mejoras de Seguridad de Alto Riesgo",
                "description": f"Se detectaron {consolidated['security_metrics']['high_vulnerabilities']} vulnerabilidades de alto riesgo",
                "business_impact": "Riesgo de acceso no autorizado a datos sensibles",
                "timeline": "1-2 semanas",
                "actions": [
                    "Implementar RBAC completo",
                    "Validar permisos específicos",
                    "Implementar middleware de autorización",
                    "Mejorar manejo de errores"
                ],
                "resources_needed": ["Desarrollador Backend", "Arquitecto de Software"]
            })
        
        # Recomendaciones de estandarización
        if consolidated["security_metrics"]["standardization_issues"] > 0:
            recommendations.append({
                "priority": "MEDIUM",
                "category": "STANDARDIZATION",
                "title": "Estandarización de Respuestas y Manejo de Errores",
                "description": f"Se detectaron {consolidated['security_metrics']['standardization_issues']} problemas de estandarización",
                "business_impact": "Mejora en experiencia de usuario y mantenibilidad",
                "timeline": "2-4 semanas",
                "actions": [
                    "Implementar formato estándar de respuestas",
                    "Crear middleware de manejo de errores unificado",
                    "Implementar masking de datos sensibles",
                    "Estandarizar códigos de respuesta HTTP"
                ],
                "resources_needed": ["Desarrollador Full-Stack", "QA Engineer"]
            })
        
        return recommendations
    
    def generate_implementation_roadmap(self, recommendations: List[Dict]) -> List[Dict]:
        """Generar hoja de ruta de implementación"""
        roadmap = []
        
        # Fase 1: Acciones Críticas (1-3 días)
        critical_actions = [rec for rec in recommendations if rec["priority"] == "CRITICAL"]
        if critical_actions:
            roadmap.append({
                "phase": "Fase 1: Acciones Críticas",
                "timeline": "1-3 días",
                "objectives": [
                    "Proteger endpoints desprotegidos",
                    "Implementar autenticación básica",
                    "Validar roles críticos"
                ],
                "deliverables": [
                    "Middleware de autenticación implementado",
                    "Endpoints críticos protegidos",
                    "Logging de seguridad básico"
                ],
                "success_criteria": [
                    "0 endpoints desprotegidos",
                    "Autenticación funcional en todos los servicios",
                    "Logs de seguridad generándose"
                ]
            })
        
        # Fase 2: Mejoras de Seguridad (1-2 semanas)
        high_priority_actions = [rec for rec in recommendations if rec["priority"] == "HIGH"]
        if high_priority_actions:
            roadmap.append({
                "phase": "Fase 2: Mejoras de Seguridad",
                "timeline": "1-2 semanas",
                "objectives": [
                    "Implementar RBAC completo",
                    "Mejorar manejo de errores",
                    "Implementar validación de permisos"
                ],
                "deliverables": [
                    "Sistema RBAC implementado",
                    "Middleware de autorización",
                    "Validación de permisos granular"
                ],
                "success_criteria": [
                    "Control de acceso basado en roles funcional",
                    "Validación de permisos en todos los endpoints",
                    "Manejo de errores estandarizado"
                ]
            })
        
        # Fase 3: Estandarización (2-4 semanas)
        medium_priority_actions = [rec for rec in recommendations if rec["priority"] == "MEDIUM"]
        if medium_priority_actions:
            roadmap.append({
                "phase": "Fase 3: Estandarización y Mejoras",
                "timeline": "2-4 semanas",
                "objectives": [
                    "Estandarizar respuestas de API",
                    "Implementar masking de datos",
                    "Mejorar monitoreo de seguridad"
                ],
                "deliverables": [
                    "Formato estándar de respuestas",
                    "Masking de datos sensibles",
                    "Monitoreo de seguridad avanzado"
                ],
                "success_criteria": [
                    "Respuestas de API estandarizadas",
                    "Datos sensibles enmascarados",
                    "Monitoreo de seguridad implementado"
                ]
            })
        
        return roadmap
    
    def generate_final_report(self):
        """Generar reporte final ejecutivo"""
        logger.info("📊 Generando reporte ejecutivo final...")
        
        # Cargar reportes individuales
        loaded_reports = self.load_all_reports()
        
        # Consolidar reportes
        consolidated = self.consolidate_all_reports(loaded_reports)
        
        # Generar recomendaciones
        recommendations = self.generate_executive_recommendations(consolidated)
        consolidated["executive_recommendations"] = recommendations
        
        # Generar hoja de ruta
        roadmap = self.generate_implementation_roadmap(recommendations)
        consolidated["implementation_roadmap"] = roadmap
        
        # Guardar reporte ejecutivo
        with open("executive_security_report.json", "w", encoding="utf-8") as f:
            json.dump(consolidated, f, indent=2, ensure_ascii=False)
        
        # Generar reporte ejecutivo en texto
        self.generate_executive_text_report(consolidated)
        
        return consolidated
    
    def generate_executive_text_report(self, consolidated: Dict):
        """Generar reporte ejecutivo en formato texto"""
        with open("executive_security_report.txt", "w", encoding="utf-8") as f:
            f.write("🔒 REPORTE EJECUTIVO DE SEGURIDAD - SMD VITAL\n")
            f.write("=" * 60 + "\n\n")
            
            f.write(f"Fecha: {consolidated['timestamp']}\n")
            f.write(f"Scripts ejecutados: {consolidated['executive_summary']['total_scripts_executed']}\n")
            f.write(f"Scripts exitosos: {consolidated['executive_summary']['successful_scripts']}\n")
            f.write(f"Scripts fallidos: {consolidated['executive_summary']['failed_scripts']}\n\n")
            
            f.write("📊 MÉTRICAS DE SEGURIDAD:\n")
            f.write("-" * 30 + "\n")
            f.write(f"Endpoints desprotegidos: {consolidated['security_metrics']['unprotected_endpoints']}\n")
            f.write(f"Violaciones RBAC: {consolidated['security_metrics']['rbac_violations']}\n")
            f.write(f"Fugas de datos: {consolidated['security_metrics']['data_leaks']}\n")
            f.write(f"Problemas de estandarización: {consolidated['security_metrics']['standardization_issues']}\n")
            f.write(f"Vulnerabilidades críticas: {consolidated['security_metrics']['critical_vulnerabilities']}\n")
            f.write(f"Vulnerabilidades de alto riesgo: {consolidated['security_metrics']['high_vulnerabilities']}\n")
            f.write(f"Vulnerabilidades de riesgo medio: {consolidated['security_metrics']['medium_vulnerabilities']}\n")
            f.write(f"Vulnerabilidades de bajo riesgo: {consolidated['security_metrics']['low_vulnerabilities']}\n\n")
            
            f.write("🎯 RECOMENDACIONES EJECUTIVAS:\n")
            f.write("-" * 35 + "\n")
            for i, rec in enumerate(consolidated["executive_recommendations"], 1):
                f.write(f"{i}. [{rec['priority']}] {rec['title']}\n")
                f.write(f"   Descripción: {rec['description']}\n")
                f.write(f"   Impacto en el negocio: {rec['business_impact']}\n")
                f.write(f"   Timeline: {rec['timeline']}\n")
                f.write(f"   Recursos necesarios: {', '.join(rec['resources_needed'])}\n")
                f.write(f"   Acciones:\n")
                for action in rec['actions']:
                    f.write(f"   - {action}\n")
                f.write("\n")
            
            f.write("🗺️  HOJA DE RUTA DE IMPLEMENTACIÓN:\n")
            f.write("-" * 40 + "\n")
            for phase in consolidated["implementation_roadmap"]:
                f.write(f"\n{phase['phase']} ({phase['timeline']})\n")
                f.write(f"Objetivos:\n")
                for obj in phase['objectives']:
                    f.write(f"- {obj}\n")
                f.write(f"Entregables:\n")
                for deliv in phase['deliverables']:
                    f.write(f"- {deliv}\n")
                f.write(f"Criterios de éxito:\n")
                for crit in phase['success_criteria']:
                    f.write(f"- {crit}\n")
                f.write("\n")
    
    def print_executive_summary(self, consolidated: Dict):
        """Imprimir resumen ejecutivo en consola"""
        print("\n" + "="*80)
        print("🔒 REPORTE EJECUTIVO DE SEGURIDAD - SMD VITAL")
        print("="*80)
        
        print(f"\n📊 RESUMEN EJECUTIVO:")
        print(f"Scripts ejecutados: {consolidated['executive_summary']['total_scripts_executed']}")
        print(f"Scripts exitosos: {consolidated['executive_summary']['successful_scripts']}")
        print(f"Scripts fallidos: {consolidated['executive_summary']['failed_scripts']}")
        
        print(f"\n🚨 MÉTRICAS DE SEGURIDAD:")
        print(f"Endpoints desprotegidos: {consolidated['security_metrics']['unprotected_endpoints']}")
        print(f"Violaciones RBAC: {consolidated['security_metrics']['rbac_violations']}")
        print(f"Fugas de datos: {consolidated['security_metrics']['data_leaks']}")
        print(f"Problemas de estandarización: {consolidated['security_metrics']['standardization_issues']}")
        print(f"Vulnerabilidades críticas: {consolidated['security_metrics']['critical_vulnerabilities']}")
        print(f"Vulnerabilidades de alto riesgo: {consolidated['security_metrics']['high_vulnerabilities']}")
        print(f"Vulnerabilidades de riesgo medio: {consolidated['security_metrics']['medium_vulnerabilities']}")
        
        print(f"\n🎯 RECOMENDACIONES PRINCIPALES:")
        for i, rec in enumerate(consolidated["executive_recommendations"], 1):
            print(f"{i}. [{rec['priority']}] {rec['title']}")
            print(f"   {rec['description']}")
            print(f"   Timeline: {rec['timeline']}")
        
        print(f"\n🗺️  HOJA DE RUTA DE IMPLEMENTACIÓN:")
        for phase in consolidated["implementation_roadmap"]:
            print(f"\n{phase['phase']} ({phase['timeline']})")
            print(f"Objetivos: {', '.join(phase['objectives'])}")
        
        print(f"\n📄 Reportes generados:")
        print(f"- executive_security_report.json (formato JSON)")
        print(f"- executive_security_report.txt (formato texto)")
        print(f"- Reportes individuales de cada prueba")

def main():
    """Función principal"""
    print("🔒 SMD VITAL - Ejecutor Completo de Pruebas de Seguridad")
    print("=" * 70)
    
    tester = CompleteSecurityTester()
    
    try:
        # Ejecutar todas las pruebas
        tester.run_all_security_tests()
        
        # Generar reporte ejecutivo
        consolidated_report = tester.generate_final_report()
        
        # Mostrar resumen ejecutivo
        tester.print_executive_summary(consolidated_report)
        
        print(f"\n✅ Pruebas de seguridad completadas exitosamente!")
        print(f"📊 Se generaron reportes detallados para análisis posterior")
        
    except Exception as e:
        logger.error(f"Error durante la ejecución: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
