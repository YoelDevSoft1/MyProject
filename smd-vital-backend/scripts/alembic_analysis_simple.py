#!/usr/bin/env python3
"""
SMD Vital - Análisis Simple de Scripts Alembic
==============================================

Script simplificado para analizar la cobertura y consistencia de las migraciones de Alembic
en todos los servicios del sistema SMD Vital.

Author: Backend Team
Date: 2025-01-12
"""

import os
import sys
import subprocess
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

# Configuración de bases de datos
DATABASE_CONFIGS = {
    'auth': {
        'name': 'smdvital_auth',
        'service_path': 'services/auth',
    },
    'appointments': {
        'name': 'smdvital_appointments',
        'service_path': 'services/appointments',
    },
    'medical-records': {
        'name': 'smdvital_medical_records',
        'service_path': 'services/medical-records',
    },
    'notifications': {
        'name': 'smdvital_notifications',
        'service_path': 'services/notifications',
    },
    'payments': {
        'name': 'smdvital_payments',
        'service_path': 'services/payments',
    },
    'users': {
        'name': 'smdvital_users',
        'service_path': 'services/users',
    }
}

class AlembicAnalyzer:
    """Analizador de migraciones Alembic"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.results = {}
        self.issues = []
        self.recommendations = []
    
    def analyze_migration_files(self) -> Dict[str, Any]:
        """Analiza los archivos de migración de cada servicio"""
        print("🔍 Analizando archivos de migración...")
        
        migration_analysis = {}
        
        for service, config in DATABASE_CONFIGS.items():
            service_path = self.project_root / config['service_path']
            versions_path = service_path / 'alembic' / 'versions'
            
            if not versions_path.exists():
                self.issues.append(f"❌ No se encontró directorio de versiones para {service}")
                continue
            
            # Obtener archivos de migración
            migration_files = list(versions_path.glob("*.py"))
            migration_files = [f for f in migration_files if not f.name.startswith('__')]
            
            analysis = {
                'service': service,
                'migration_count': len(migration_files),
                'migrations': [],
                'has_initial_migration': False,
                'latest_revision': None,
                'migration_chain': []
            }
            
            for migration_file in sorted(migration_files):
                try:
                    with open(migration_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Extraer información básica
                    revision_id = self._extract_revision_id(content)
                    down_revision = self._extract_down_revision(content)
                    create_date = self._extract_create_date(content)
                    
                    migration_info = {
                        'file': migration_file.name,
                        'revision_id': revision_id,
                        'down_revision': down_revision,
                        'create_date': create_date,
                        'tables_created': self._extract_tables_created(content),
                        'tables_dropped': self._extract_tables_dropped(content),
                        'has_upgrade': 'def upgrade()' in content,
                        'has_downgrade': 'def downgrade()' in content
                    }
                    
                    analysis['migrations'].append(migration_info)
                    
                    if 'initial' in migration_file.name.lower():
                        analysis['has_initial_migration'] = True
                    
                except Exception as e:
                    self.issues.append(f"❌ Error analizando {migration_file}: {e}")
            
            # Verificar cadena de migraciones
            analysis['migration_chain'] = self._build_migration_chain(analysis['migrations'])
            analysis['latest_revision'] = self._get_latest_revision(analysis['migrations'])
            
            migration_analysis[service] = analysis
        
        return migration_analysis
    
    def _extract_revision_id(self, content: str) -> Optional[str]:
        """Extrae el ID de revisión del archivo"""
        match = re.search(r"revision:\s*str\s*=\s*['\"]([^'\"]+)['\"]", content)
        return match.group(1) if match else None
    
    def _extract_down_revision(self, content: str) -> Optional[str]:
        """Extrae la revisión padre"""
        match = re.search(r"down_revision:\s*Union\[str,\s*None\]\s*=\s*['\"]([^'\"]*)['\"]", content)
        return match.group(1) if match else None
    
    def _extract_create_date(self, content: str) -> Optional[str]:
        """Extrae la fecha de creación"""
        match = re.search(r"Create Date:\s*([^\n]+)", content)
        return match.group(1).strip() if match else None
    
    def _extract_tables_created(self, content: str) -> List[str]:
        """Extrae las tablas creadas en la migración"""
        tables = []
        matches = re.findall(r"op\.create_table\('([^']+)'", content)
        return matches
    
    def _extract_tables_dropped(self, content: str) -> List[str]:
        """Extrae las tablas eliminadas en la migración"""
        tables = []
        matches = re.findall(r"op\.drop_table\('([^']+)'", content)
        return matches
    
    def _build_migration_chain(self, migrations: List[Dict]) -> List[str]:
        """Construye la cadena de migraciones"""
        chain = []
        current = None
        
        # Encontrar la migración inicial (sin down_revision)
        for migration in migrations:
            if not migration['down_revision'] or migration['down_revision'] == 'None':
                current = migration['revision_id']
                break
        
        # Construir cadena hacia adelante
        while current:
            chain.append(current)
            next_migration = None
            for migration in migrations:
                if migration['down_revision'] == current:
                    next_migration = migration['revision_id']
                    break
            current = next_migration
        
        return chain
    
    def _get_latest_revision(self, migrations: List[Dict]) -> Optional[str]:
        """Obtiene la revisión más reciente"""
        chain = self._build_migration_chain(migrations)
        return chain[-1] if chain else None
    
    def check_alembic_config(self) -> Dict[str, Any]:
        """Verifica la configuración de Alembic en cada servicio"""
        print("🔍 Verificando configuración de Alembic...")
        
        config_analysis = {}
        
        for service, config in DATABASE_CONFIGS.items():
            service_path = self.project_root / config['service_path']
            
            analysis = {
                'service': service,
                'has_alembic_dir': (service_path / 'alembic').exists(),
                'has_alembic_ini': (service_path / 'alembic.ini').exists(),
                'has_env_py': (service_path / 'alembic' / 'env.py').exists(),
                'has_versions_dir': (service_path / 'alembic' / 'versions').exists(),
                'config_status': 'complete' if all([
                    (service_path / 'alembic').exists(),
                    (service_path / 'alembic.ini').exists(),
                    (service_path / 'alembic' / 'env.py').exists(),
                    (service_path / 'alembic' / 'versions').exists()
                ]) else 'incomplete'
            }
            
            config_analysis[service] = analysis
        
        return config_analysis
    
    def simulate_migrations(self) -> Dict[str, Any]:
        """Simula migraciones y rollbacks"""
        print("🔄 Simulando migraciones y rollbacks...")
        
        simulation_results = {}
        
        for service, config in DATABASE_CONFIGS.items():
            service_path = self.project_root / config['service_path']
            
            if not (service_path / 'alembic').exists():
                self.issues.append(f"❌ No hay configuración de Alembic para {service}")
                continue
            
            try:
                # Simular upgrade
                upgrade_result = self._simulate_upgrade(service_path, config)
                
                # Simular downgrade
                downgrade_result = self._simulate_downgrade(service_path, config)
                
                simulation_results[service] = {
                    'upgrade': upgrade_result,
                    'downgrade': downgrade_result,
                    'overall_status': 'success' if upgrade_result['success'] and downgrade_result['success'] else 'failed'
                }
                
            except Exception as e:
                simulation_results[service] = {
                    'upgrade': {'success': False, 'error': str(e)},
                    'downgrade': {'success': False, 'error': str(e)},
                    'overall_status': 'failed'
                }
                self.issues.append(f"❌ Error simulando migraciones para {service}: {e}")
        
        return simulation_results
    
    def _simulate_upgrade(self, service_path: Path, config: Dict) -> Dict[str, Any]:
        """Simula upgrade de migraciones"""
        try:
            # Cambiar al directorio del servicio
            original_cwd = os.getcwd()
            os.chdir(service_path)
            
            # Ejecutar alembic upgrade --sql head
            result = subprocess.run(
                ['alembic', 'upgrade', '--sql', 'head'],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            return {
                'success': result.returncode == 0,
                'stdout': result.stdout,
                'stderr': result.stderr,
                'returncode': result.returncode
            }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Timeout ejecutando upgrade',
                'returncode': -1
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'returncode': -1
            }
        finally:
            os.chdir(original_cwd)
    
    def _simulate_downgrade(self, service_path: Path, config: Dict) -> Dict[str, Any]:
        """Simula downgrade de migraciones"""
        try:
            # Cambiar al directorio del servicio
            original_cwd = os.getcwd()
            os.chdir(service_path)
            
            # Ejecutar alembic downgrade --sql base
            result = subprocess.run(
                ['alembic', 'downgrade', '--sql', 'base'],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            return {
                'success': result.returncode == 0,
                'stdout': result.stdout,
                'stderr': result.stderr,
                'returncode': result.returncode
            }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Timeout ejecutando downgrade',
                'returncode': -1
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'returncode': -1
            }
        finally:
            os.chdir(original_cwd)
    
    def identify_risks_and_inconsistencies(self, migration_analysis: Dict, config_analysis: Dict, simulation_results: Dict) -> List[str]:
        """Identifica riesgos e inconsistencias"""
        risks = []
        
        # Verificar cobertura de migraciones
        for service, analysis in migration_analysis.items():
            if not analysis['has_initial_migration']:
                risks.append(f"⚠️  {service}: No tiene migración inicial")
            
            if len(analysis['migrations']) == 0:
                risks.append(f"❌ {service}: No tiene migraciones")
            
            # Verificar cadena de migraciones
            if len(analysis['migration_chain']) != len(analysis['migrations']):
                risks.append(f"⚠️  {service}: Cadena de migraciones rota")
            
            # Verificar funciones upgrade/downgrade
            for migration in analysis['migrations']:
                if not migration['has_upgrade']:
                    risks.append(f"⚠️  {service}: Migración {migration['file']} sin función upgrade")
                if not migration['has_downgrade']:
                    risks.append(f"⚠️  {service}: Migración {migration['file']} sin función downgrade")
        
        # Verificar configuración de Alembic
        for service, config in config_analysis.items():
            if config['config_status'] != 'complete':
                risks.append(f"❌ {service}: Configuración de Alembic incompleta")
        
        # Verificar resultados de simulación
        for service, results in simulation_results.items():
            if not results['upgrade']['success']:
                risks.append(f"❌ {service}: Fallo en simulación de upgrade")
            if not results['downgrade']['success']:
                risks.append(f"❌ {service}: Fallo en simulación de downgrade")
        
        return risks
    
    def generate_recommendations(self, migration_analysis: Dict, config_analysis: Dict, simulation_results: Dict) -> List[str]:
        """Genera recomendaciones de mejora"""
        recommendations = []
        
        # Recomendaciones generales
        recommendations.append("📋 Recomendaciones generales:")
        recommendations.append("  • Implementar migraciones de datos para cambios estructurales")
        recommendations.append("  • Agregar validaciones de integridad en migraciones")
        recommendations.append("  • Implementar rollback automático en caso de fallo")
        recommendations.append("  • Documentar dependencias entre servicios")
        
        # Recomendaciones específicas por servicio
        for service, analysis in migration_analysis.items():
            if analysis['migration_count'] == 0:
                recommendations.append(f"🔧 {service}: Crear migración inicial")
            elif analysis['migration_count'] == 1 and analysis['has_initial_migration']:
                recommendations.append(f"🔧 {service}: Considerar dividir migración inicial en pasos más pequeños")
            
            # Verificar si hay migraciones sin downgrade
            migrations_without_downgrade = [m for m in analysis['migrations'] if not m['has_downgrade']]
            if migrations_without_downgrade:
                recommendations.append(f"🔧 {service}: Implementar funciones downgrade para {len(migrations_without_downgrade)} migraciones")
        
        return recommendations
    
    def generate_report(self) -> str:
        """Genera reporte completo del análisis"""
        print("📊 Generando reporte de análisis...")
        
        # Ejecutar análisis
        migration_analysis = self.analyze_migration_files()
        config_analysis = self.check_alembic_config()
        simulation_results = self.simulate_migrations()
        
        # Identificar problemas
        risks = self.identify_risks_and_inconsistencies(migration_analysis, config_analysis, simulation_results)
        recommendations = self.generate_recommendations(migration_analysis, config_analysis, simulation_results)
        
        # Generar reporte
        report = []
        report.append("=" * 80)
        report.append("SMD VITAL - ANÁLISIS DE SCRIPTS ALEMBIC")
        report.append("=" * 80)
        report.append(f"Fecha de análisis: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("")
        
        # Resumen ejecutivo
        report.append("📋 RESUMEN EJECUTIVO")
        report.append("-" * 40)
        total_services = len(DATABASE_CONFIGS)
        services_with_migrations = len([s for s in migration_analysis.values() if s['migration_count'] > 0])
        services_config_complete = len([s for s in config_analysis.values() if s['config_status'] == 'complete'])
        services_simulation_ok = len([s for s in simulation_results.values() if s['overall_status'] == 'success'])
        
        report.append(f"• Servicios analizados: {total_services}")
        report.append(f"• Servicios con migraciones: {services_with_migrations}")
        report.append(f"• Servicios con configuración completa: {services_config_complete}")
        report.append(f"• Servicios con simulación exitosa: {services_simulation_ok}")
        report.append(f"• Problemas identificados: {len(risks)}")
        report.append("")
        
        # Análisis por servicio
        report.append("🔍 ANÁLISIS POR SERVICIO")
        report.append("-" * 40)
        
        for service_name, config in DATABASE_CONFIGS.items():
            report.append(f"\n📦 {service_name.upper()}")
            report.append("-" * 20)
            
            # Información de migraciones
            if service_name in migration_analysis:
                migration_info = migration_analysis[service_name]
                report.append(f"  Migraciones: {migration_info['migration_count']}")
                report.append(f"  Migración inicial: {'✅' if migration_info['has_initial_migration'] else '❌'}")
                report.append(f"  Última revisión: {migration_info['latest_revision'] or 'N/A'}")
                report.append(f"  Cadena completa: {'✅' if len(migration_info['migration_chain']) == migration_info['migration_count'] else '❌'}")
            
            # Información de configuración
            if service_name in config_analysis:
                config_info = config_analysis[service_name]
                report.append(f"  Configuración: {config_info['config_status']}")
                report.append(f"  Alembic dir: {'✅' if config_info['has_alembic_dir'] else '❌'}")
                report.append(f"  alembic.ini: {'✅' if config_info['has_alembic_ini'] else '❌'}")
                report.append(f"  env.py: {'✅' if config_info['has_env_py'] else '❌'}")
                report.append(f"  versions/: {'✅' if config_info['has_versions_dir'] else '❌'}")
            
            # Información de simulación
            if service_name in simulation_results:
                sim_info = simulation_results[service_name]
                report.append(f"  Simulación: {sim_info['overall_status']}")
                if not sim_info['upgrade']['success']:
                    report.append(f"    Upgrade error: {sim_info['upgrade'].get('error', 'Unknown')}")
                if not sim_info['downgrade']['success']:
                    report.append(f"    Downgrade error: {sim_info['downgrade'].get('error', 'Unknown')}")
        
        # Problemas identificados
        if risks:
            report.append("\n⚠️  PROBLEMAS IDENTIFICADOS")
            report.append("-" * 40)
            for risk in risks:
                report.append(f"  {risk}")
        
        # Recomendaciones
        if recommendations:
            report.append("\n🔧 RECOMENDACIONES")
            report.append("-" * 40)
            for rec in recommendations:
                report.append(f"  {rec}")
        
        # Detalles técnicos
        report.append("\n📊 DETALLES TÉCNICOS")
        report.append("-" * 40)
        
        for service_name, analysis in migration_analysis.items():
            report.append(f"\n{service_name.upper()} - Migraciones:")
            for migration in analysis['migrations']:
                report.append(f"  • {migration['file']}")
                report.append(f"    Revisión: {migration['revision_id']}")
                report.append(f"    Padre: {migration['down_revision']}")
                report.append(f"    Tablas creadas: {len(migration['tables_created'])}")
                report.append(f"    Upgrade: {'✅' if migration['has_upgrade'] else '❌'}")
                report.append(f"    Downgrade: {'✅' if migration['has_downgrade'] else '❌'}")
        
        report.append("\n" + "=" * 80)
        report.append("FIN DEL REPORTE")
        report.append("=" * 80)
        
        return "\n".join(report)

def main():
    """Función principal"""
    project_root = Path(__file__).parent.parent
    
    print("🚀 Iniciando análisis de scripts Alembic...")
    
    analyzer = AlembicAnalyzer(project_root)
    
    # Generar reporte
    report = analyzer.generate_report()
    
    # Guardar reporte
    report_path = project_root / "alembic_analysis_report.txt"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"✅ Reporte guardado en: {report_path}")
    print("\n" + "="*50)
    print("RESUMEN DEL ANÁLISIS")
    print("="*50)
    print(report.split("📋 RESUMEN EJECUTIVO")[1].split("🔍 ANÁLISIS POR SERVICIO")[0])

if __name__ == "__main__":
    main()
