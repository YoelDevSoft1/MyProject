#!/usr/bin/env python3
"""
SMD VITAL - Análisis de Respuestas de Error
==========================================

Script para analizar códigos de respuesta y mensajes de error del sistema.
Identifica inconsistencias y sugiere estandarización.

Author: Security Testing Team
Date: 2025-01-27
"""

import json
import requests
from typing import Dict, List, Any
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

class ErrorResponseAnalyzer:
    """Analizador de respuestas de error del sistema"""
    
    def __init__(self):
        self.error_patterns = defaultdict(list)
        self.status_code_analysis = defaultdict(int)
        self.inconsistencies = []
        self.security_concerns = []
        
    def analyze_endpoint_errors(self):
        """Analiza errores de todos los endpoints"""
        logger.info("🔍 Analizando respuestas de error...")
        
        # Endpoints a analizar
        endpoints = [
            {"url": "http://localhost:8001/auth/register", "method": "POST", "service": "auth"},
            {"url": "http://localhost:8001/auth/login", "method": "POST", "service": "auth"},
            {"url": "http://localhost:8002/users/profile", "method": "GET", "service": "users"},
            {"url": "http://localhost:8003/appointments", "method": "GET", "service": "appointments"},
            {"url": "http://localhost:8004/medical-records", "method": "GET", "service": "medical-records"},
            {"url": "http://localhost:8005/payments", "method": "GET", "service": "payments"},
            {"url": "http://localhost:8006/notifications", "method": "GET", "service": "notifications"},
        ]
        
        # Casos de prueba para generar errores
        test_cases = [
            {"name": "invalid_credentials", "data": {"email": "invalid@test.com", "password": "wrong"}},
            {"name": "missing_required_fields", "data": {}},
            {"name": "malformed_json", "data": "invalid json"},
            {"name": "unauthorized_access", "data": {}, "headers": {}},
            {"name": "sql_injection", "data": {"email": "test@test.com'; DROP TABLE users; --"}},
            {"name": "xss_attempt", "data": {"email": "<script>alert('xss')</script>@test.com"}},
            {"name": "oversized_payload", "data": {"data": "x" * 10000}},
        ]
        
        for endpoint in endpoints:
            for test_case in test_cases:
                self._test_error_response(endpoint, test_case)
        
        self._generate_analysis_report()
    
    def _test_error_response(self, endpoint: Dict, test_case: Dict):
        """Test individual de respuesta de error"""
        try:
            url = endpoint["url"]
            method = endpoint["method"]
            service = endpoint["service"]
            
            headers = {"Content-Type": "application/json"}
            if "headers" in test_case:
                headers.update(test_case["headers"])
            
            # Realizar request
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=5)
            elif method.upper() == "POST":
                response = requests.post(url, json=test_case["data"], headers=headers, timeout=5)
            else:
                response = requests.request(method, url, json=test_case["data"], headers=headers, timeout=5)
            
            # Analizar respuesta
            self._analyze_response(endpoint, test_case, response)
            
        except requests.exceptions.Timeout:
            self._record_timeout(endpoint, test_case)
        except Exception as e:
            self._record_exception(endpoint, test_case, e)
    
    def _analyze_response(self, endpoint: Dict, test_case: Dict, response):
        """Analiza una respuesta HTTP"""
        status_code = response.status_code
        self.status_code_analysis[status_code] += 1
        
        try:
            response_data = response.json()
        except:
            response_data = {"raw_response": response.text}
        
        # Extraer mensaje de error
        error_message = self._extract_error_message(response_data)
        
        # Registrar patrón de error
        error_key = f"{endpoint['service']}_{test_case['name']}_{status_code}"
        self.error_patterns[error_key].append({
            "endpoint": endpoint["url"],
            "test_case": test_case["name"],
            "status_code": status_code,
            "error_message": error_message,
            "response_data": response_data
        })
        
        # Detectar inconsistencias
        self._detect_inconsistencies(endpoint, test_case, status_code, error_message)
        
        # Detectar problemas de seguridad
        self._detect_security_issues(endpoint, test_case, status_code, response_data)
    
    def _extract_error_message(self, response_data: Dict) -> str:
        """Extrae el mensaje de error de la respuesta"""
        if isinstance(response_data, dict):
            # Buscar campos comunes de error
            for field in ["detail", "message", "error", "error_message", "description"]:
                if field in response_data:
                    return str(response_data[field])
            
            # Si no hay campo específico, usar toda la respuesta
            return str(response_data)
        
        return str(response_data)
    
    def _detect_inconsistencies(self, endpoint: Dict, test_case: Dict, status_code: int, error_message: str):
        """Detecta inconsistencias en las respuestas"""
        service = endpoint["service"]
        
        # Inconsistencia 1: Mismo error, diferentes códigos
        if test_case["name"] == "invalid_credentials":
            if status_code not in [401, 422]:
                self.inconsistencies.append(
                    f"Inconsistencia: {service} retorna {status_code} para credenciales inválidas (esperado: 401 o 422)"
                )
        
        # Inconsistencia 2: Mismo error, diferentes mensajes
        if "token" in error_message.lower() and status_code == 401:
            if "expired" in error_message.lower():
                # Token expirado
                pass
            elif "invalid" in error_message.lower():
                # Token inválido
                pass
            else:
                self.inconsistencies.append(
                    f"Inconsistencia: {service} mensaje de token no estándar: {error_message}"
                )
        
        # Inconsistencia 3: Códigos inesperados
        if test_case["name"] == "unauthorized_access" and status_code == 200:
            self.inconsistencies.append(
                f"CRÍTICO: {service} permite acceso sin autenticación (retorna 200)"
            )
        
        if test_case["name"] == "sql_injection" and status_code == 200:
            self.inconsistencies.append(
                f"CRÍTICO: {service} vulnerable a SQL injection (retorna 200)"
            )
    
    def _detect_security_issues(self, endpoint: Dict, test_case: Dict, status_code: int, response_data: Dict):
        """Detecta problemas de seguridad en las respuestas"""
        service = endpoint["service"]
        
        # Problema 1: Información disclosure
        if isinstance(response_data, dict):
            sensitive_fields = ["password", "secret", "key", "token", "database", "sql"]
            for field in sensitive_fields:
                if field in str(response_data).lower():
                    self.security_concerns.append(
                        f"Información sensible expuesta en {service}: {field}"
                    )
        
        # Problema 2: Stack traces
        if "traceback" in str(response_data).lower() or "exception" in str(response_data).lower():
            self.security_concerns.append(
                f"Stack trace expuesto en {service} - información interna visible"
            )
        
        # Problema 3: Códigos de error inconsistentes
        if test_case["name"] == "malformed_json" and status_code == 500:
            self.security_concerns.append(
                f"{service} retorna 500 para JSON malformado (debería ser 400)"
            )
        
        # Problema 4: Mensajes de error muy detallados
        if len(str(response_data)) > 500:
            self.security_concerns.append(
                f"{service} retorna respuestas muy detalladas que pueden exponer información interna"
            )
    
    def _record_timeout(self, endpoint: Dict, test_case: Dict):
        """Registra timeout"""
        self.inconsistencies.append(
            f"Timeout en {endpoint['service']} para {test_case['name']}"
        )
    
    def _record_exception(self, endpoint: Dict, test_case: Dict, exception: Exception):
        """Registra excepción"""
        self.security_concerns.append(
            f"Excepción no manejada en {endpoint['service']}: {str(exception)}"
        )
    
    def _generate_analysis_report(self):
        """Genera reporte de análisis"""
        report = {
            "summary": {
                "total_errors_analyzed": sum(len(patterns) for patterns in self.error_patterns.values()),
                "unique_error_patterns": len(self.error_patterns),
                "status_codes_found": dict(self.status_code_analysis),
                "inconsistencies_detected": len(self.inconsistencies),
                "security_concerns": len(self.security_concerns)
            },
            "error_patterns": dict(self.error_patterns),
            "inconsistencies": self.inconsistencies,
            "security_concerns": self.security_concerns,
            "standardization_recommendations": self._generate_standardization_recommendations()
        }
        
        # Guardar reporte
        with open("error_analysis_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)
        
        # Mostrar resumen
        print("\n" + "="*80)
        print("📊 ANÁLISIS DE RESPUESTAS DE ERROR - SMD VITAL")
        print("="*80)
        print(f"Total de errores analizados: {report['summary']['total_errors_analyzed']}")
        print(f"Patrones de error únicos: {report['summary']['unique_error_patterns']}")
        print(f"Inconsistencias detectadas: {report['summary']['inconsistencies_detected']}")
        print(f"Problemas de seguridad: {report['summary']['security_concerns']}")
        
        print("\n📈 CÓDIGOS DE RESPUESTA ENCONTRADOS:")
        for status_code, count in sorted(self.status_code_analysis.items()):
            print(f"  {status_code}: {count} respuestas")
        
        print("\n⚠️ INCONSISTENCIAS DETECTADAS:")
        for inconsistency in self.inconsistencies[:10]:  # Mostrar solo las primeras 10
            print(f"  • {inconsistency}")
        
        print("\n🚨 PROBLEMAS DE SEGURIDAD:")
        for concern in self.security_concerns[:10]:  # Mostrar solo las primeras 10
            print(f"  • {concern}")
        
        print("\n💡 RECOMENDACIONES DE ESTANDARIZACIÓN:")
        for rec in report["standardization_recommendations"]:
            print(f"  • {rec}")
        
        print(f"\n📄 Reporte completo guardado en: error_analysis_report.json")
        print("="*80)
    
    def _generate_standardization_recommendations(self) -> List[str]:
        """Genera recomendaciones de estandarización"""
        recommendations = []
        
        # Análisis de códigos de respuesta
        status_codes = set(self.status_code_analysis.keys())
        
        # Recomendaciones basadas en inconsistencias
        if any("CRÍTICO" in inc for inc in self.inconsistencies):
            recommendations.append("URGENTE: Implementar autenticación obligatoria en todos los endpoints sensibles")
        
        if 500 in status_codes:
            recommendations.append("Implementar manejo de errores consistente - muchos 500 errors detectados")
        
        if len(status_codes) > 10:
            recommendations.append("Estandarizar códigos de respuesta - demasiada variedad detectada")
        
        # Recomendaciones de seguridad
        if self.security_concerns:
            recommendations.extend([
                "Implementar masking de errores para evitar información disclosure",
                "Estandarizar mensajes de error sin exponer detalles internos",
                "Implementar logging de seguridad para requests sospechosos",
                "Añadir validación de entrada más estricta",
                "Implementar rate limiting para prevenir ataques"
            ])
        
        # Recomendaciones de estandarización
        recommendations.extend([
            "Crear enum de códigos de respuesta estándar para toda la aplicación",
            "Implementar middleware de manejo de errores centralizado",
            "Estandarizar formato de respuestas de error (JSON Schema)",
            "Implementar códigos de error únicos para cada tipo de problema",
            "Añadir documentación de códigos de respuesta en OpenAPI/Swagger",
            "Implementar tests automatizados para validar respuestas de error",
            "Crear guía de desarrollo para manejo de errores",
            "Implementar monitoreo de errores en producción"
        ])
        
        return recommendations

def main():
    """Función principal"""
    analyzer = ErrorResponseAnalyzer()
    analyzer.analyze_endpoint_errors()

if __name__ == "__main__":
    main()



