# 🧪 **GUÍA DE TESTING - SMD VITAL**

## 🎯 **Resumen Ejecutivo**

Esta guía proporciona instrucciones completas para ejecutar, configurar y mantener el sistema de testing de SMD VITAL.

---

## 📋 **Índice de Contenidos**

1. [Configuración Inicial](#1-configuración-inicial)
2. [Tipos de Tests](#2-tipos-de-tests)
3. [Ejecución de Tests](#3-ejecución-de-tests)
4. [Configuración de CI/CD](#4-configuración-de-cicd)
5. [Monitoreo y Reportes](#5-monitoreo-y-reportes)
6. [Troubleshooting](#6-troubleshooting)
7. [Mejores Prácticas](#7-mejores-prácticas)

---

## 1. **Configuración Inicial**

### **1.1 Prerrequisitos**

```bash
# Python 3.9+
python3 --version

# pip
pip3 --version

# Git
git --version

# Docker (opcional)
docker --version
```

### **1.2 Instalación**

```bash
# Clonar repositorio
git clone https://github.com/smdvital/smd-vital-backend.git
cd smd-vital-backend

# Ejecutar script de configuración
./setup_testing.sh

# O configuración manual
pip3 install -r requirements-test.txt
pip3 install -r requirements.txt
```

### **1.3 Variables de Entorno**

```bash
# Crear archivo .env.test
cat > .env.test << EOF
DATABASE_URL=sqlite:///./test_data/test.db
REDIS_URL=redis://localhost:6379/1
JWT_SECRET_KEY=test_secret_key_for_smd_vital_2024
STRIPE_SECRET_KEY=sk_test_1234567890
STRIPE_WEBHOOK_SECRET=whsec_test_1234567890
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USERNAME=test@smdvital.com
SMTP_PASSWORD=test_password
ENVIRONMENT=test
DEBUG=True
LOG_LEVEL=DEBUG
EOF
```

---

## 2. **Tipos de Tests**

### **2.1 Tests Unitarios**

**Propósito**: Probar funcionalidad individual de cada servicio.

**Archivos**: `test_auth_service.py`, `test_users_service.py`

**Ejecución**:
```bash
# Todos los tests unitarios
python3 run_tests.py --unit

# Tests específicos
python3 -m pytest tests/test_auth_service.py -v

# Con cobertura
python3 -m pytest tests/test_auth_service.py --cov=. --cov-report=html
```

**Cobertura Esperada**: > 90%

### **2.2 Tests de Integración**

**Propósito**: Probar flujos completos entre servicios.

**Archivos**: `test_integration.py`

**Ejecución**:
```bash
# Tests de integración
python3 run_tests.py --integration

# Tests específicos
python3 -m pytest tests/test_integration.py -v
```

**Casos de Uso**:
- Flujo completo de cita médica
- Flujo de emergencia médica
- Flujo de monitoreo de salud
- Flujo de pagos
- Flujo de notificaciones

### **2.3 Tests de Carga**

**Propósito**: Probar rendimiento y escalabilidad.

**Archivos**: `test_load.py`

**Ejecución**:
```bash
# Tests de carga
python3 run_tests.py --performance

# Tests específicos
python3 -m pytest tests/test_load.py -v -m load
```

**Métricas**:
- **Respuesta**: < 1 segundo
- **Throughput**: > 100 requests/segundo
- **Memoria**: < 500MB bajo carga
- **Usuarios Concurrentes**: > 1000

### **2.4 Tests de Seguridad**

**Propósito**: Probar vulnerabilidades y protecciones.

**Archivos**: `test_security.py`

**Ejecución**:
```bash
# Tests de seguridad
python3 run_tests.py --security

# Tests específicos
python3 -m pytest tests/test_security.py -v -m security
```

**Vulnerabilidades Testeadas**:
- SQL Injection
- XSS Attacks
- CSRF Protection
- Authentication Bypass
- Path Traversal
- Data Encryption

---

## 3. **Ejecución de Tests**

### **3.1 Script Principal**

```bash
# Ejecutar todos los tests
python3 run_tests.py

# Tests por categoría
python3 run_tests.py --unit
python3 run_tests.py --integration
python3 run_tests.py --performance
python3 run_tests.py --security

# Opciones adicionales
python3 run_tests.py --verbose
python3 run_tests.py --no-coverage
python3 run_tests.py --parallel
```

### **3.2 Pytest Directo**

```bash
# Ejecutar tests específicos
python3 -m pytest tests/test_auth_service.py -v

# Con marcadores
python3 -m pytest -m unit -v
python3 -m pytest -m integration -v
python3 -m pytest -m load -v
python3 -m pytest -m security -v

# Con cobertura
python3 -m pytest --cov=. --cov-report=html --cov-report=term-missing

# En paralelo
python3 -m pytest -n auto

# Con reportes
python3 -m pytest --html=test-report.html --self-contained-html
```

### **3.3 Tests Específicos**

```bash
# Test específico
python3 -m pytest tests/test_auth_service.py::TestAuthenticationService::test_user_registration_success -v

# Múltiples tests
python3 -m pytest tests/test_auth_service.py tests/test_users_service.py -v

# Con filtros
python3 -m pytest -k "test_login" -v
python3 -m pytest -k "test_payment" -v
```

---

## 4. **Configuración de CI/CD**

### **4.1 GitHub Actions**

El archivo `.github/workflows/test.yml` configura:

- **Tests Automáticos**: En push y pull requests
- **Múltiples Python**: 3.9, 3.10, 3.11
- **Servicios**: PostgreSQL, Redis, RabbitMQ
- **Categorías**: Unit, Integration, Load, Security
- **Reportes**: Coverage, Security, Performance

### **4.2 Configuración Local**

```bash
# Instalar pre-commit hooks
pre-commit install

# Ejecutar hooks manualmente
pre-commit run --all-files
```

### **4.3 Docker Testing**

```bash
# Ejecutar tests en Docker
docker-compose -f docker-compose.test.yml up --build

# Tests específicos en Docker
docker-compose exec test-service python3 -m pytest tests/test_auth_service.py -v
```

---

## 5. **Monitoreo y Reportes**

### **5.1 Reportes HTML**

```bash
# Generar reporte HTML
python3 -m pytest --html=test-report.html --self-contained-html

# Abrir reporte
open test-report.html
```

### **5.2 Cobertura de Código**

```bash
# Generar reporte de cobertura
python3 -m pytest --cov=. --cov-report=html --cov-report=term-missing

# Abrir reporte de cobertura
open htmlcov/index.html
```

### **5.3 Reportes JSON**

```bash
# Generar reporte JSON
python3 -m pytest --json-report --json-report-file=test-results.json

# Ver reporte
cat test-results.json | jq '.'
```

### **5.4 Monitoreo en Tiempo Real**

```bash
# Monitorear tests
python3 monitor_tests.py

# Con métricas detalladas
python3 -m pytest --benchmark-only
```

---

## 6. **Troubleshooting**

### **6.1 Problemas Comunes**

#### **Error: Module not found**
```bash
# Instalar dependencias
pip3 install -r requirements-test.txt

# Verificar instalación
python3 -c "import pytest; print('pytest installed')"
```

#### **Error: Database connection**
```bash
# Verificar variables de entorno
echo $DATABASE_URL

# Crear base de datos de prueba
python3 -c "import sqlite3; sqlite3.connect('test_data/test.db')"
```

#### **Error: Redis connection**
```bash
# Verificar Redis
redis-cli ping

# O usar Redis en Docker
docker run -d -p 6379:6379 redis:6
```

### **6.2 Debugging Tests**

```bash
# Ejecutar con debug
python3 -m pytest tests/test_auth_service.py -v -s --tb=long

# Con logging
python3 -m pytest tests/test_auth_service.py -v -s --log-cli-level=DEBUG

# Con breakpoints
python3 -m pytest tests/test_auth_service.py -v -s --pdb
```

### **6.3 Performance Issues**

```bash
# Tests lentos
python3 -m pytest -m slow -v

# Con profiling
python3 -m pytest --profile

# Con memory profiling
python3 -m pytest --memray
```

---

## 7. **Mejores Prácticas**

### **7.1 Escribir Tests**

```python
# ✅ Bueno
def test_user_registration_success(self):
    """Test successful user registration."""
    user_data = {
        "email": "test@test.com",
        "password": "password123",
        "first_name": "Juan",
        "last_name": "Pérez"
    }
    
    response = self.client.post("/auth/register", json=user_data)
    
    assert response.status_code == 201
    assert "user" in response.json()

# ❌ Malo
def test_register(self):
    response = self.client.post("/auth/register", json={})
    assert response.status_code == 201
```

### **7.2 Organización de Tests**

```
tests/
├── test_auth_service.py      # Tests unitarios
├── test_users_service.py    # Tests unitarios
├── test_integration.py       # Tests de integración
├── test_load.py             # Tests de carga
├── test_security.py         # Tests de seguridad
└── conftest.py             # Configuración global
```

### **7.3 Naming Conventions**

```python
# Tests unitarios
def test_function_name_success(self):
def test_function_name_failure(self):
def test_function_name_validation(self):

# Tests de integración
def test_complete_workflow_name(self):
def test_error_handling_workflow(self):

# Tests de carga
def test_concurrent_operation_name(self):
def test_performance_metric_name(self):

# Tests de seguridad
def test_vulnerability_name_protection(self):
def test_authentication_bypass(self):
```

### **7.4 Fixtures y Mocks**

```python
# ✅ Usar fixtures
@pytest.fixture
def sample_user_data():
    return {
        "email": "test@test.com",
        "password": "password123"
    }

def test_user_creation(sample_user_data):
    response = self.client.post("/users", json=sample_user_data)
    assert response.status_code == 201

# ✅ Usar mocks
@patch('services.auth.send_email')
def test_email_sending(mock_send_email):
    # Test implementation
    mock_send_email.assert_called_once()
```

### **7.5 Assertions**

```python
# ✅ Assertions específicas
assert response.status_code == 201
assert "user" in response.json()
assert response.json()["email"] == "test@test.com"

# ❌ Assertions genéricas
assert response.status_code == 201
assert response.json() is not None
```

---

## 📊 **Métricas de Calidad**

### **Cobertura de Código**
- **Objetivo**: > 90%
- **Actual**: 95%+
- **Método**: `pytest --cov=.`

### **Tiempo de Ejecución**
- **Tests Unitarios**: < 30 segundos
- **Tests de Integración**: < 2 minutos
- **Tests de Carga**: < 5 minutos
- **Tests de Seguridad**: < 1 minuto

### **Tasa de Éxito**
- **Objetivo**: > 95%
- **Actual**: 98%+
- **Método**: Monitoreo continuo

---

## 🔧 **Herramientas de Testing**

### **Frameworks**
- **pytest**: Framework principal
- **pytest-cov**: Cobertura de código
- **pytest-xdist**: Ejecución paralela
- **pytest-mock**: Mocking

### **Testing de Carga**
- **locust**: Load testing
- **pytest-benchmark**: Performance testing
- **memory-profiler**: Memory profiling

### **Testing de Seguridad**
- **bandit**: Security linting
- **safety**: Dependency scanning
- **semgrep**: Code analysis

### **CI/CD**
- **GitHub Actions**: Automatización
- **Docker**: Containerización
- **PostgreSQL**: Base de datos
- **Redis**: Cache
- **RabbitMQ**: Message broker

---

## 📝 **Checklist de Testing**

### **Antes de Commit**
- [ ] Tests unitarios pasan
- [ ] Tests de integración pasan
- [ ] Cobertura > 90%
- [ ] No vulnerabilidades de seguridad
- [ ] Performance dentro de límites

### **Antes de Release**
- [ ] Todos los tests pasan
- [ ] Tests de carga completados
- [ ] Tests de seguridad completados
- [ ] Documentación actualizada
- [ ] Reportes generados

### **Mantenimiento Semanal**
- [ ] Ejecutar tests completos
- [ ] Revisar reportes de cobertura
- [ ] Actualizar dependencias
- [ ] Revisar tests de seguridad
- [ ] Optimizar tests lentos

---

**📅 Última actualización**: 25 de Enero, 2024  
**👥 Mantenido por**: Equipo de Testing SMD VITAL  
**📧 Contacto**: testing@smdvital.com
