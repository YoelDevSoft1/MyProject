#!/usr/bin/env python3
"""
SMD Vital - Configuración Validation Script
============================================

Script para validar configuración de seguridad, secretos y compliance.
"""

import os
import sys
import re
import json
import yaml
from typing import List, Dict, Any, Tuple
from pathlib import Path
import subprocess
import hashlib

class ConfigValidator:
    """Validador de configuración para SMD Vital"""
    
    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.project_root = Path(__file__).parent.parent
        
    def validate_secrets(self) -> bool:
        """Validar que no hay secretos hardcodeados"""
        print("🔍 Validating secrets...")
        
        secret_patterns = [
            r'password\s*=\s*["\'][^"\']+["\']',
            r'secret\s*=\s*["\'][^"\']+["\']',
            r'key\s*=\s*["\'][^"\']+["\']',
            r'token\s*=\s*["\'][^"\']+["\']',
            r'api_key\s*=\s*["\'][^"\']+["\']',
            r'private_key\s*=\s*["\'][^"\']+["\']',
            r'secret_key\s*=\s*["\'][^"\']+["\']',
            r'jwt_secret\s*=\s*["\'][^"\']+["\']',
            r'database_password\s*=\s*["\'][^"\']+["\']',
            r'redis_password\s*=\s*["\'][^"\']+["\']'
        ]
        
        excluded_files = [
            '.git',
            '__pycache__',
            '.pytest_cache',
            'node_modules',
            '.env.example',
            'env.example',
            'validate-config.py'
        ]
        
        for root, dirs, files in os.walk(self.project_root):
            # Excluir directorios no deseados
            dirs[:] = [d for d in dirs if d not in excluded_files]
            
            for file in files:
                if file.endswith(('.py', '.js', '.ts', '.yml', '.yaml', '.json')):
                    filepath = Path(root) / file
                    if any(excluded in str(filepath) for excluded in excluded_files):
                        continue
                        
                    self._check_file_for_secrets(filepath, secret_patterns)
        
        if self.errors:
            print("❌ Secret validation failed:")
            for error in self.errors:
                print(f"  - {error}")
            return False
        
        print("✅ No hardcoded secrets found")
        return True
    
    def _check_file_for_secrets(self, filepath: Path, patterns: List[str]):
        """Verificar archivo por patrones de secretos"""
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                lines = content.split('\n')
                
                for i, line in enumerate(lines, 1):
                    for pattern in patterns:
                        if re.search(pattern, line, re.IGNORECASE):
                            # Verificar si es un comentario o ejemplo
                            if not self._is_comment_or_example(line):
                                self.errors.append(
                                    f"Potential secret in {filepath}:{i}: {line.strip()}"
                                )
        except Exception as e:
            self.warnings.append(f"Could not read {filepath}: {e}")
    
    def _is_comment_or_example(self, line: str) -> bool:
        """Verificar si la línea es un comentario o ejemplo"""
        line = line.strip()
        return (
            line.startswith('#') or
            line.startswith('//') or
            line.startswith('*') or
            'example' in line.lower() or
            'test' in line.lower() or
            'TODO' in line.upper() or
            'FIXME' in line.upper()
        )
    
    def validate_environment_variables(self) -> bool:
        """Validar variables de entorno requeridas"""
        print("🔍 Validating environment variables...")
        
        required_vars = [
            'DATABASE_URL',
            'JWT_SECRET_KEY',
            'REDIS_URL',
            'RABBITMQ_URL'
        ]
        
        optional_vars = [
            'STRIPE_SECRET_KEY',
            'SMTP_PASSWORD',
            'TWILIO_AUTH_TOKEN',
            'GRAFANA_ADMIN_PASSWORD'
        ]
        
        missing_required = []
        for var in required_vars:
            if not os.getenv(var):
                missing_required.append(var)
        
        if missing_required:
            self.errors.append(f"Missing required environment variables: {', '.join(missing_required)}")
            return False
        
        missing_optional = []
        for var in optional_vars:
            if not os.getenv(var):
                missing_optional.append(var)
        
        if missing_optional:
            self.warnings.append(f"Missing optional environment variables: {', '.join(missing_optional)}")
        
        print("✅ Environment variables validation passed")
        return True
    
    def validate_docker_configuration(self) -> bool:
        """Validar configuración de Docker"""
        print("🔍 Validating Docker configuration...")
        
        docker_files = [
            'docker-compose.yml',
            'Dockerfile',
            'docker-compose.prod.yml'
        ]
        
        for docker_file in docker_files:
            filepath = self.project_root / docker_file
            if filepath.exists():
                self._validate_docker_file(filepath)
        
        if self.errors:
            return False
        
        print("✅ Docker configuration validation passed")
        return True
    
    def _validate_docker_file(self, filepath: Path):
        """Validar archivo de Docker específico"""
        try:
            with open(filepath, 'r') as f:
                if filepath.suffix == '.yml' or filepath.suffix == '.yaml':
                    content = yaml.safe_load(f)
                    self._validate_docker_compose(content, filepath)
                else:
                    content = f.read()
                    self._validate_dockerfile(content, filepath)
        except Exception as e:
            self.errors.append(f"Error reading {filepath}: {e}")
    
    def _validate_docker_compose(self, content: Dict, filepath: Path):
        """Validar docker-compose.yml"""
        if not isinstance(content, dict) or 'services' not in content:
            return
        
        for service_name, service_config in content['services'].items():
            # Verificar que no hay secretos en variables de entorno
            if 'environment' in service_config:
                for env_var in service_config['environment']:
                    if isinstance(env_var, str) and '=' in env_var:
                        key, value = env_var.split('=', 1)
                        if self._looks_like_secret(key, value):
                            self.errors.append(
                                f"Potential secret in {filepath} service {service_name}: {key}"
                            )
            
            # Verificar que los servicios no corren como root
            if 'user' not in service_config:
                self.warnings.append(
                    f"Service {service_name} in {filepath} should specify a non-root user"
                )
    
    def _validate_dockerfile(self, content: str, filepath: Path):
        """Validar Dockerfile"""
        lines = content.split('\n')
        for i, line in enumerate(lines, 1):
            line = line.strip()
            
            # Verificar que no hay secretos en ENV
            if line.startswith('ENV '):
                if self._looks_like_secret_in_dockerfile(line):
                    self.errors.append(
                        f"Potential secret in {filepath}:{i}: {line}"
                    )
            
            # Verificar que no se usa root
            if line.startswith('USER root'):
                self.warnings.append(
                    f"Consider using non-root user in {filepath}:{i}"
                )
    
    def _looks_like_secret(self, key: str, value: str) -> bool:
        """Verificar si parece un secreto"""
        secret_indicators = [
            'password', 'secret', 'key', 'token', 'auth',
            'credential', 'private', 'jwt', 'api'
        ]
        
        key_lower = key.lower()
        value_lower = value.lower()
        
        return (
            any(indicator in key_lower for indicator in secret_indicators) and
            len(value) > 8 and
            not value.startswith('$')  # No es una variable de entorno
        )
    
    def _looks_like_secret_in_dockerfile(self, line: str) -> bool:
        """Verificar si línea de Dockerfile parece contener secreto"""
        secret_patterns = [
            r'ENV\s+\w*(?:PASSWORD|SECRET|KEY|TOKEN|AUTH)\w*\s*=\s*[^$]',
            r'ENV\s+\w*(?:PASSWORD|SECRET|KEY|TOKEN|AUTH)\w*\s*=\s*"[^$]+"'
        ]
        
        return any(re.search(pattern, line, re.IGNORECASE) for pattern in secret_patterns)
    
    def validate_security_headers(self) -> bool:
        """Validar headers de seguridad"""
        print("🔍 Validating security headers...")
        
        # Verificar configuración de CORS
        cors_origins = os.getenv('CORS_ORIGINS', '')
        if not cors_origins:
            self.warnings.append("CORS_ORIGINS not configured")
        elif '*' in cors_origins:
            self.errors.append("CORS_ORIGINS contains wildcard (*) - security risk")
        
        # Verificar configuración de JWT
        jwt_secret = os.getenv('JWT_SECRET_KEY', '')
        if not jwt_secret:
            self.errors.append("JWT_SECRET_KEY not configured")
        elif len(jwt_secret) < 32:
            self.errors.append("JWT_SECRET_KEY should be at least 32 characters")
        
        if self.errors:
            return False
        
        print("✅ Security headers validation passed")
        return True
    
    def validate_database_configuration(self) -> bool:
        """Validar configuración de base de datos"""
        print("🔍 Validating database configuration...")
        
        database_url = os.getenv('DATABASE_URL', '')
        if not database_url:
            self.errors.append("DATABASE_URL not configured")
            return False
        
        # Verificar que la URL de base de datos no contiene credenciales hardcodeadas
        if 'postgresql://' in database_url:
            if '@' in database_url and ':' in database_url.split('@')[0]:
                # Verificar que no son credenciales por defecto
                user_pass = database_url.split('@')[0].split('://')[1]
                if ':' in user_pass:
                    user, password = user_pass.split(':', 1)
                    if user in ['postgres', 'admin', 'root'] or password in ['password', 'admin', '123456']:
                        self.warnings.append("Database credentials appear to be default values")
        
        print("✅ Database configuration validation passed")
        return True
    
    def validate_ssl_configuration(self) -> bool:
        """Validar configuración SSL/TLS"""
        print("🔍 Validating SSL configuration...")
        
        # Verificar que hay certificados SSL configurados
        ssl_dir = self.project_root / 'ssl'
        if not ssl_dir.exists():
            self.warnings.append("SSL directory not found - HTTPS may not be configured")
        else:
            cert_files = list(ssl_dir.glob('*.crt')) + list(ssl_dir.glob('*.pem'))
            if not cert_files:
                self.warnings.append("No SSL certificates found in ssl/ directory")
        
        print("✅ SSL configuration validation passed")
        return True
    
    def validate_logging_configuration(self) -> bool:
        """Validar configuración de logging"""
        print("🔍 Validating logging configuration...")
        
        # Verificar que el nivel de logging está configurado
        log_level = os.getenv('LOG_LEVEL', 'INFO')
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if log_level not in valid_levels:
            self.warnings.append(f"LOG_LEVEL should be one of {valid_levels}")
        
        # Verificar que hay directorio de logs
        logs_dir = self.project_root / 'logs'
        if not logs_dir.exists():
            self.warnings.append("Logs directory not found")
        
        print("✅ Logging configuration validation passed")
        return True
    
    def validate_compliance(self) -> bool:
        """Validar configuración de compliance"""
        print("🔍 Validating compliance configuration...")
        
        # Verificar configuración de retención de logs
        retention_days = os.getenv('LOG_RETENTION_DAYS', '90')
        try:
            retention = int(retention_days)
            if retention < 30:
                self.warnings.append("LOG_RETENTION_DAYS should be at least 30 days for compliance")
        except ValueError:
            self.warnings.append("LOG_RETENTION_DAYS should be a valid number")
        
        # Verificar configuración de auditoría
        audit_enabled = os.getenv('AUDIT_ENABLED', 'true').lower() == 'true'
        if not audit_enabled:
            self.warnings.append("AUDIT_ENABLED should be true for compliance")
        
        print("✅ Compliance configuration validation passed")
        return True
    
    def run_validation(self) -> bool:
        """Ejecutar todas las validaciones"""
        print("🔍 SMD Vital Configuration Validation")
        print("=====================================")
        
        validations = [
            self.validate_secrets,
            self.validate_environment_variables,
            self.validate_docker_configuration,
            self.validate_security_headers,
            self.validate_database_configuration,
            self.validate_ssl_configuration,
            self.validate_logging_configuration,
            self.validate_compliance
        ]
        
        all_passed = True
        for validation in validations:
            try:
                if not validation():
                    all_passed = False
            except Exception as e:
                self.errors.append(f"Validation error: {e}")
                all_passed = False
        
        print("\n📊 Validation Summary")
        print("====================")
        
        if self.errors:
            print("❌ Errors found:")
            for error in self.errors:
                print(f"  - {error}")
        
        if self.warnings:
            print("⚠️  Warnings:")
            for warning in self.warnings:
                print(f"  - {warning}")
        
        if all_passed:
            print("✅ All validations passed")
        else:
            print("❌ Some validations failed")
        
        return all_passed

def main():
    """Función principal"""
    validator = ConfigValidator()
    success = validator.run_validation()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()



