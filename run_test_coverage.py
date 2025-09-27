#!/usr/bin/env python3
"""
Script para ejecutar pruebas y generar reporte de cobertura
==========================================================

Este script ejecuta todas las pruebas de los microservicios y genera
un reporte detallado de cobertura por microservicio.
"""

import os
import sys
import subprocess
import json
from datetime import datetime
from pathlib import Path

class TestCoverageRunner:
    """Ejecutor de pruebas y generador de reportes de cobertura."""
    
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.results = {}
        self.coverage_data = {}
        
    def run_tests_for_service(self, service_name, test_files):
        """Ejecutar pruebas para un microservicio específico."""
        print(f"\n🧪 Ejecutando pruebas para {service_name}...")
        
        service_results = {
            "service": service_name,
            "timestamp": datetime.now().isoformat(),
            "tests_run": 0,
            "tests_passed": 0,
            "tests_failed": 0,
            "coverage_percentage": 0,
            "test_files": [],
            "errors": []
        }
        
        for test_file in test_files:
            if not os.path.exists(test_file):
                print(f"⚠️  Archivo de prueba no encontrado: {test_file}")
                continue
                
            print(f"   📄 Ejecutando {test_file}...")
            
            try:
                # Ejecutar pytest con cobertura
                cmd = [
                    "python", "-m", "pytest", 
                    test_file,
                    "-v",
                    "--tb=short",
                    "--cov=.",
                    "--cov-report=json",
                    "--cov-report=term-missing"
                ]
                
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    cwd=self.base_dir
                )
                
                # Procesar resultados
                if result.returncode == 0:
                    service_results["tests_passed"] += 1
                    print(f"   ✅ {test_file} - PASÓ")
                else:
                    service_results["tests_failed"] += 1
                    print(f"   ❌ {test_file} - FALLÓ")
                    service_results["errors"].append({
                        "file": test_file,
                        "error": result.stderr
                    })
                
                service_results["tests_run"] += 1
                service_results["test_files"].append({
                    "file": test_file,
                    "status": "passed" if result.returncode == 0 else "failed"
                })
                
            except Exception as e:
                print(f"   💥 Error ejecutando {test_file}: {e}")
                service_results["errors"].append({
                    "file": test_file,
                    "error": str(e)
                })
        
        # Calcular cobertura si hay archivos de cobertura
        coverage_file = "coverage.json"
        if os.path.exists(coverage_file):
            try:
                with open(coverage_file, 'r') as f:
                    coverage_data = json.load(f)
                    service_results["coverage_percentage"] = coverage_data.get("totals", {}).get("percent_covered", 0)
            except Exception as e:
                print(f"   ⚠️  Error leyendo cobertura: {e}")
        
        return service_results
    
    def run_all_tests(self):
        """Ejecutar todas las pruebas de microservicios."""
        print("🚀 Iniciando ejecución de pruebas de microservicios...")
        
        # Definir archivos de prueba por microservicio
        test_files_by_service = {
            "Auth Service": [
                "tests/test_auth_service.py"
            ],
            "Users Service": [
                "tests/test_users_service.py"
            ],
            "Appointments Service": [
                "tests/test_appointments_service_critical.py"
            ],
            "Integration Tests": [
                "tests/test_integration.py"
            ],
            "Security Tests": [
                "tests/test_security.py"
            ]
        }
        
        for service_name, test_files in test_files_by_service.items():
            service_results = self.run_tests_for_service(service_name, test_files)
            self.results[service_name] = service_results
        
        # Ejecutar pruebas de carga si están disponibles
        if os.path.exists("tests/test_load.py"):
            print("\n🧪 Ejecutando pruebas de carga...")
            try:
                result = subprocess.run(
                    ["python", "-m", "pytest", "tests/test_load.py", "-v"],
                    capture_output=True,
                    text=True,
                    cwd=self.base_dir
                )
                if result.returncode == 0:
                    print("   ✅ Pruebas de carga - PASARON")
                else:
                    print("   ❌ Pruebas de carga - FALLARON")
            except Exception as e:
                print(f"   💥 Error en pruebas de carga: {e}")
    
    def generate_coverage_report(self):
        """Generar reporte de cobertura."""
        print("\n📊 Generando reporte de cobertura...")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_services": len(self.results),
                "services_with_tests": len([r for r in self.results.values() if r["tests_run"] > 0]),
                "total_tests_run": sum(r["tests_run"] for r in self.results.values()),
                "total_tests_passed": sum(r["tests_passed"] for r in self.results.values()),
                "total_tests_failed": sum(r["tests_failed"] for r in self.results.values()),
                "average_coverage": 0
            },
            "services": self.results,
            "recommendations": []
        }
        
        # Calcular estadísticas
        if report["summary"]["total_tests_run"] > 0:
            report["summary"]["success_rate"] = (
                report["summary"]["total_tests_passed"] / 
                report["summary"]["total_tests_run"] * 100
            )
        
        # Calcular cobertura promedio
        coverage_values = [r["coverage_percentage"] for r in self.results.values() if r["coverage_percentage"] > 0]
        if coverage_values:
            report["summary"]["average_coverage"] = sum(coverage_values) / len(coverage_values)
        
        # Generar recomendaciones
        self.generate_recommendations(report)
        
        return report
    
    def generate_recommendations(self, report):
        """Generar recomendaciones basadas en los resultados."""
        recommendations = []
        
        for service_name, results in self.results.items():
            if results["tests_run"] == 0:
                recommendations.append({
                    "service": service_name,
                    "priority": "CRÍTICO",
                    "issue": "No hay pruebas implementadas",
                    "action": f"Implementar casos de prueba básicos para {service_name}"
                })
            elif results["tests_failed"] > 0:
                recommendations.append({
                    "service": service_name,
                    "priority": "ALTO",
                    "issue": f"{results['tests_failed']} pruebas fallaron",
                    "action": f"Revisar y corregir las pruebas fallidas en {service_name}"
                })
            elif results["coverage_percentage"] < 70:
                recommendations.append({
                    "service": service_name,
                    "priority": "MEDIO",
                    "issue": f"Cobertura baja: {results['coverage_percentage']:.1f}%",
                    "action": f"Aumentar cobertura de pruebas para {service_name}"
                })
        
        report["recommendations"] = recommendations
    
    def save_report(self, report):
        """Guardar reporte en archivo JSON."""
        report_file = "test_coverage_report.json"
        
        try:
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            print(f"📄 Reporte guardado en: {report_file}")
        except Exception as e:
            print(f"❌ Error guardando reporte: {e}")
    
    def print_summary(self, report):
        """Imprimir resumen de resultados."""
        print("\n" + "="*60)
        print("📊 RESUMEN DE COBERTURA DE PRUEBAS")
        print("="*60)
        
        print(f"\n📈 Estadísticas Generales:")
        print(f"   • Servicios evaluados: {report['summary']['total_services']}")
        print(f"   • Servicios con pruebas: {report['summary']['services_with_tests']}")
        print(f"   • Total de pruebas ejecutadas: {report['summary']['total_tests_run']}")
        print(f"   • Pruebas exitosas: {report['summary']['total_tests_passed']}")
        print(f"   • Pruebas fallidas: {report['summary']['total_tests_failed']}")
        
        if report['summary']['total_tests_run'] > 0:
            print(f"   • Tasa de éxito: {report['summary']['success_rate']:.1f}%")
        
        if report['summary']['average_coverage'] > 0:
            print(f"   • Cobertura promedio: {report['summary']['average_coverage']:.1f}%")
        
        print(f"\n🔍 Detalles por Servicio:")
        for service_name, results in self.results.items():
            status_icon = "✅" if results["tests_failed"] == 0 else "❌" if results["tests_run"] > 0 else "⚠️"
            print(f"   {status_icon} {service_name}:")
            print(f"      • Pruebas ejecutadas: {results['tests_run']}")
            print(f"      • Pruebas exitosas: {results['tests_passed']}")
            print(f"      • Pruebas fallidas: {results['tests_failed']}")
            if results["coverage_percentage"] > 0:
                print(f"      • Cobertura: {results['coverage_percentage']:.1f}%")
        
        if report["recommendations"]:
            print(f"\n🎯 Recomendaciones:")
            for rec in report["recommendations"]:
                priority_icon = "🔴" if rec["priority"] == "CRÍTICO" else "🟡" if rec["priority"] == "ALTO" else "🟢"
                print(f"   {priority_icon} {rec['priority']}: {rec['issue']}")
                print(f"      → {rec['action']}")
    
    def run(self):
        """Ejecutar el proceso completo de pruebas y reportes."""
        try:
            # Verificar que pytest esté instalado
            try:
                subprocess.run(["python", "-m", "pytest", "--version"], 
                             capture_output=True, check=True)
            except subprocess.CalledProcessError:
                print("❌ pytest no está instalado. Instalando...")
                subprocess.run([sys.executable, "-m", "pip", "install", "pytest", "pytest-cov"])
            
            # Ejecutar pruebas
            self.run_all_tests()
            
            # Generar reporte
            report = self.generate_coverage_report()
            
            # Guardar reporte
            self.save_report(report)
            
            # Imprimir resumen
            self.print_summary(report)
            
            print(f"\n🎉 Proceso completado exitosamente!")
            print(f"📄 Reporte detallado disponible en: test_coverage_report.json")
            
        except Exception as e:
            print(f"💥 Error durante la ejecución: {e}")
            sys.exit(1)

def main():
    """Función principal."""
    print("🧪 Ejecutor de Pruebas y Cobertura - SMD VITAL")
    print("=" * 50)
    
    runner = TestCoverageRunner()
    runner.run()

if __name__ == "__main__":
    main()



