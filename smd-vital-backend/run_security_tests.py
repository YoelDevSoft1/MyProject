#!/usr/bin/env python3
"""
SMD VITAL - Ejecutor de Tests de Seguridad
==========================================

Script principal para ejecutar todos los tests de seguridad y generar reportes.

Author: Security Testing Team
Date: 2025-01-27
"""

import asyncio
import subprocess
import sys
import json
import os
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('security_tests.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SecurityTestRunner:
    """Ejecutor principal de tests de seguridad"""
    
    def __init__(self):
        self.start_time = datetime.now()
        self.results = {}
        
    async def run_all_tests(self):
        """Ejecuta todos los tests de seguridad"""
        logger.info("🚀 Iniciando tests de seguridad comprehensivos para SMD VITAL")
        
        try:
            # 1. Verificar que los servicios estén ejecutándose
            await self._check_services()
            
            # 2. Ejecutar tests de endpoints
            await self._run_endpoint_tests()
            
            # 3. Ejecutar análisis de errores
            await self._run_error_analysis()
            
            # 4. Generar reporte final
            await self._generate_final_report()
            
            logger.info("✅ Tests de seguridad completados exitosamente")
            
        except Exception as e:
            logger.error(f"❌ Error ejecutando tests: {e}")
            sys.exit(1)
    
    async def _check_services(self):
        """Verifica que los servicios estén ejecutándose"""
        logger.info("🔍 Verificando servicios...")
        
        services = [
            ("Auth Service", "http://localhost:8001/health"),
            ("Users Service", "http://localhost:8002/health"),
            ("Appointments Service", "http://localhost:8003/health"),
            ("Medical Records Service", "http://localhost:8004/health"),
            ("Payments Service", "http://localhost:8005/health"),
            ("Notifications Service", "http://localhost:8006/health"),
        ]
        
        running_services = []
        failed_services = []
        
        for service_name, url in services:
            try:
                import requests
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    running_services.append(service_name)
                    logger.info(f"✅ {service_name} está ejecutándose")
                else:
                    failed_services.append(f"{service_name} (HTTP {response.status_code})")
                    logger.warning(f"⚠️ {service_name} retorna {response.status_code}")
            except Exception as e:
                failed_services.append(f"{service_name} (Error: {e})")
                logger.warning(f"⚠️ {service_name} no disponible: {e}")
        
        if failed_services:
            logger.warning(f"⚠️ Servicios no disponibles: {', '.join(failed_services)}")
            logger.warning("Los tests pueden fallar o ser incompletos")
        
        self.results["services"] = {
            "running": running_services,
            "failed": failed_services,
            "total_checked": len(services)
        }
    
    async def _run_endpoint_tests(self):
        """Ejecuta tests de endpoints"""
        logger.info("🧪 Ejecutando tests de endpoints...")
        
        try:
            # Ejecutar script de testing de endpoints
            result = subprocess.run([
                sys.executable, "comprehensive_endpoint_testing.py"
            ], capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                logger.info("✅ Tests de endpoints completados")
                self.results["endpoint_tests"] = {
                    "status": "success",
                    "stdout": result.stdout,
                    "stderr": result.stderr
                }
            else:
                logger.warning(f"⚠️ Tests de endpoints con warnings: {result.stderr}")
                self.results["endpoint_tests"] = {
                    "status": "warning",
                    "stdout": result.stdout,
                    "stderr": result.stderr
                }
                
        except subprocess.TimeoutExpired:
            logger.error("⏰ Tests de endpoints timeout")
            self.results["endpoint_tests"] = {
                "status": "timeout",
                "error": "Timeout after 5 minutes"
            }
        except Exception as e:
            logger.error(f"❌ Error ejecutando tests de endpoints: {e}")
            self.results["endpoint_tests"] = {
                "status": "error",
                "error": str(e)
            }
    
    async def _run_error_analysis(self):
        """Ejecuta análisis de errores"""
        logger.info("🔍 Ejecutando análisis de errores...")
        
        try:
            # Ejecutar script de análisis de errores
            result = subprocess.run([
                sys.executable, "analyze_error_responses.py"
            ], capture_output=True, text=True, timeout=120)
            
            if result.returncode == 0:
                logger.info("✅ Análisis de errores completado")
                self.results["error_analysis"] = {
                    "status": "success",
                    "stdout": result.stdout,
                    "stderr": result.stderr
                }
            else:
                logger.warning(f"⚠️ Análisis de errores con warnings: {result.stderr}")
                self.results["error_analysis"] = {
                    "status": "warning",
                    "stdout": result.stdout,
                    "stderr": result.stderr
                }
                
        except subprocess.TimeoutExpired:
            logger.error("⏰ Análisis de errores timeout")
            self.results["error_analysis"] = {
                "status": "timeout",
                "error": "Timeout after 2 minutes"
            }
        except Exception as e:
            logger.error(f"❌ Error ejecutando análisis de errores: {e}")
            self.results["error_analysis"] = {
                "status": "error",
                "error": str(e)
            }
    
    async def _generate_final_report(self):
        """Genera reporte final consolidado"""
        logger.info("📊 Generando reporte final...")
        
        # Leer reportes individuales si existen
        endpoint_report = {}
        error_report = {}
        
        try:
            if os.path.exists("endpoint_testing_report.json"):
                with open("endpoint_testing_report.json", "r", encoding="utf-8") as f:
                    endpoint_report = json.load(f)
        except Exception as e:
            logger.warning(f"⚠️ No se pudo leer endpoint_testing_report.json: {e}")
        
        try:
            if os.path.exists("error_analysis_report.json"):
                with open("error_analysis_report.json", "r", encoding="utf-8") as f:
                    error_report = json.load(f)
        except Exception as e:
            logger.warning(f"⚠️ No se pudo leer error_analysis_report.json: {e}")
        
        # Generar reporte final
        final_report = {
            "metadata": {
                "test_date": self.start_time.isoformat(),
                "test_duration": (datetime.now() - self.start_time).total_seconds(),
                "test_runner": "SMD VITAL Security Test Suite v1.0"
            },
            "services_status": self.results.get("services", {}),
            "endpoint_tests": self.results.get("endpoint_tests", {}),
            "error_analysis": self.results.get("error_analysis", {}),
            "endpoint_report": endpoint_report,
            "error_report": error_report,
            "summary": self._generate_summary(endpoint_report, error_report),
            "recommendations": self._generate_final_recommendations(endpoint_report, error_report)
        }
        
        # Guardar reporte final
        with open("security_test_final_report.json", "w", encoding="utf-8") as f:
            json.dump(final_report, f, indent=2, ensure_ascii=False, default=str)
        
        # Mostrar resumen final
        self._display_final_summary(final_report)
    
    def _generate_summary(self, endpoint_report: dict, error_report: dict) -> dict:
        """Genera resumen de los resultados"""
        summary = {
            "total_tests": 0,
            "successful_tests": 0,
            "failed_tests": 0,
            "security_issues": 0,
            "inconsistencies": 0,
            "critical_issues": 0
        }
        
        # Resumen de endpoint tests
        if "summary" in endpoint_report:
            summary["total_tests"] += endpoint_report["summary"].get("total_tests", 0)
            summary["successful_tests"] += endpoint_report["summary"].get("successful_tests", 0)
            summary["failed_tests"] += endpoint_report["summary"].get("failed_tests", 0)
            summary["security_issues"] += len(endpoint_report.get("security_issues", []))
        
        # Resumen de error analysis
        if "summary" in error_report:
            summary["inconsistencies"] += error_report["summary"].get("inconsistencies_detected", 0)
            summary["security_issues"] += error_report["summary"].get("security_concerns", 0)
        
        # Contar issues críticos
        critical_keywords = ["CRÍTICO", "vulnerable", "bypass", "injection"]
        all_issues = []
        
        if "security_issues" in endpoint_report:
            all_issues.extend(endpoint_report["security_issues"])
        if "security_concerns" in error_report:
            all_issues.extend(error_report["security_concerns"])
        
        for issue in all_issues:
            if any(keyword in str(issue).lower() for keyword in critical_keywords):
                summary["critical_issues"] += 1
        
        return summary
    
    def _generate_final_recommendations(self, endpoint_report: dict, error_report: dict) -> list:
        """Genera recomendaciones finales"""
        recommendations = []
        
        # Recomendaciones de endpoint tests
        if "recommendations" in endpoint_report:
            recommendations.extend(endpoint_report["recommendations"])
        
        # Recomendaciones de error analysis
        if "standardization_recommendations" in error_report:
            recommendations.extend(error_report["standardization_recommendations"])
        
        # Recomendaciones adicionales basadas en resultados
        if endpoint_report.get("summary", {}).get("failed_tests", 0) > 0:
            recommendations.append("Revisar y corregir endpoints que fallan en tests de seguridad")
        
        if error_report.get("summary", {}).get("inconsistencies_detected", 0) > 0:
            recommendations.append("Implementar estandarización de respuestas de error")
        
        # Eliminar duplicados
        return list(set(recommendations))
    
    def _display_final_summary(self, report: dict):
        """Muestra resumen final en consola"""
        summary = report["summary"]
        
        print("\n" + "="*80)
        print("🏁 REPORTE FINAL DE TESTS DE SEGURIDAD - SMD VITAL")
        print("="*80)
        print(f"Fecha de ejecución: {report['metadata']['test_date']}")
        print(f"Duración: {report['metadata']['test_duration']:.2f} segundos")
        print()
        print("📊 RESUMEN DE RESULTADOS:")
        print(f"  Total de tests: {summary['total_tests']}")
        print(f"  Tests exitosos: {summary['successful_tests']}")
        print(f"  Tests fallidos: {summary['failed_tests']}")
        print(f"  Problemas de seguridad: {summary['security_issues']}")
        print(f"  Inconsistencias: {summary['inconsistencies']}")
        print(f"  Issues críticos: {summary['critical_issues']}")
        print()
        
        if summary['critical_issues'] > 0:
            print("🚨 ISSUES CRÍTICOS DETECTADOS - ACCIÓN INMEDIATA REQUERIDA")
            print("   Revisar y corregir antes de producción")
        elif summary['security_issues'] > 0:
            print("⚠️ PROBLEMAS DE SEGURIDAD DETECTADOS")
            print("   Revisar y corregir en la próxima iteración")
        else:
            print("✅ NO SE DETECTARON PROBLEMAS CRÍTICOS DE SEGURIDAD")
        
        print(f"\n📄 Reporte completo guardado en: security_test_final_report.json")
        print("="*80)

async def main():
    """Función principal"""
    runner = SecurityTestRunner()
    await runner.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())



