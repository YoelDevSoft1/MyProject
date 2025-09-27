# Script de configuración para pruebas de SMD VITAL (PowerShell)
# =============================================================

Write-Host "🧪 Configurando entorno de pruebas para SMD VITAL..." -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

# Función para imprimir mensajes con color
function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verificar que Python esté instalado
try {
    $pythonVersion = python --version 2>&1
    Write-Status "Python encontrado: $pythonVersion"
} catch {
    Write-Error "Python no está instalado. Por favor instala Python 3.8 o superior."
    exit 1
}

# Verificar que pip esté instalado
try {
    $pipVersion = pip --version 2>&1
    Write-Status "pip encontrado: $pipVersion"
} catch {
    Write-Error "pip no está instalado. Por favor instala pip."
    exit 1
}

# Crear directorios de pruebas
New-Item -ItemType Directory -Force -Path "tests" | Out-Null
New-Item -ItemType Directory -Force -Path "reports" | Out-Null
New-Item -ItemType Directory -Force -Path "htmlcov" | Out-Null

Write-Status "Directorios de pruebas creados"

# Instalar dependencias de pruebas
Write-Status "Instalando dependencias de pruebas..."

# Dependencias principales
pip install --upgrade pip
pip install pytest pytest-cov pytest-asyncio pytest-mock pytest-timeout
pip install pytest-html pytest-json-report pytest-xdist

# Dependencias para testing
pip install httpx fastapi testclient
pip install faker factory-boy
pip install coverage

# Dependencias para mocking
pip install responses requests-mock

# Dependencias para performance testing
pip install locust

Write-Success "Dependencias de pruebas instaladas"

# Crear archivo de configuración de entorno para pruebas
@"
# Configuración de entorno para pruebas
TESTING=true
DATABASE_URL=sqlite:///test.db
REDIS_URL=redis://localhost:6379/1
JWT_SECRET=test_secret_key_2024
AI_API_KEY=test_ai_key
STRIPE_SECRET_KEY=sk_test_fake_key
STRIPE_PUBLISHABLE_KEY=pk_test_fake_key
EMAIL_SERVICE_URL=http://localhost:8004
NOTIFICATION_SERVICE_URL=http://localhost:8004
PAYMENT_SERVICE_URL=http://localhost:8006
AI_SERVICE_URL=http://localhost:8007
LOG_LEVEL=INFO
"@ | Out-File -FilePath ".env.test" -Encoding UTF8

Write-Success "Archivo de configuración de pruebas creado"

# Crear archivo de requirements para pruebas
@"
# Dependencias para pruebas de SMD VITAL
pytest>=7.0.0
pytest-cov>=4.0.0
pytest-asyncio>=0.21.0
pytest-mock>=3.10.0
pytest-timeout>=2.1.0
pytest-html>=3.1.0
pytest-json-report>=1.5.0
pytest-xdist>=3.0.0

# Testing frameworks
httpx>=0.24.0
fastapi[all]>=0.100.0
testclient>=0.4.0

# Mocking y faking
faker>=19.0.0
factory-boy>=3.2.0
responses>=0.23.0
requests-mock>=1.10.0

# Performance testing
locust>=2.15.0

# Coverage
coverage>=7.0.0

# Database testing
sqlalchemy>=2.0.0
alembic>=1.11.0

# Redis testing
redis>=4.5.0

# JWT testing
pyjwt>=2.7.0

# AI/ML testing
openai>=1.0.0
anthropic>=0.3.0

# Payment testing
stripe>=6.0.0

# Email testing
sendgrid>=6.9.0
twilio>=8.0.0
"@ | Out-File -FilePath "requirements-test.txt" -Encoding UTF8

Write-Success "Archivo requirements-test.txt creado"

# Crear script de ejecución de pruebas
@"
# Script para ejecutar todas las pruebas

Write-Host "🧪 Ejecutando pruebas de SMD VITAL..."

# Ejecutar pruebas unitarias
Write-Host "📋 Ejecutando pruebas unitarias..."
python -m pytest tests/ -v --cov=. --cov-report=html --cov-report=json

# Ejecutar pruebas de integración
Write-Host "🔗 Ejecutando pruebas de integración..."
python -m pytest tests/test_integration.py -v

# Ejecutar pruebas de seguridad
Write-Host "🔒 Ejecutando pruebas de seguridad..."
python -m pytest tests/test_security.py -v

# Ejecutar pruebas de carga (opcional)
if (Test-Path "tests/test_load.py") {
    Write-Host "⚡ Ejecutando pruebas de carga..."
    python -m pytest tests/test_load.py -v
}

Write-Host "✅ Todas las pruebas completadas"
Write-Host "📊 Reporte de cobertura disponible en: htmlcov/index.html"
"@ | Out-File -FilePath "run_tests.ps1" -Encoding UTF8

Write-Success "Script de ejecución de pruebas creado"

# Crear script de limpieza
@"
# Script para limpiar datos de pruebas

Write-Host "🧹 Limpiando datos de pruebas..."

# Eliminar archivos de cobertura
Remove-Item -Path "htmlcov" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".coverage" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "coverage.xml" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "coverage.json" -Force -ErrorAction SilentlyContinue

# Eliminar reportes
Remove-Item -Path "reports" -Recurse -Force -ErrorAction SilentlyContinue

# Eliminar bases de datos de prueba
Remove-Item -Path "test.db" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "test_*.db" -Force -ErrorAction SilentlyContinue

# Eliminar archivos temporales
Remove-Item -Path "*.log" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "*.tmp" -Force -ErrorAction SilentlyContinue

Write-Host "✅ Limpieza completada"
"@ | Out-File -FilePath "clean_test_data.ps1" -Encoding UTF8

Write-Success "Script de limpieza creado"

# Verificar instalación
Write-Status "Verificando instalación..."

try {
    python -c "import pytest" 2>$null
    Write-Success "pytest instalado correctamente"
} catch {
    Write-Error "Error instalando pytest"
    exit 1
}

try {
    python -c "import pytest_cov" 2>$null
    Write-Success "pytest-cov instalado correctamente"
} catch {
    Write-Error "Error instalando pytest-cov"
    exit 1
}

# Mostrar resumen
Write-Host ""
Write-Host "🎉 Configuración de pruebas completada exitosamente!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Ejecutar pruebas: .\run_tests.ps1"
Write-Host "   2. Ver cobertura: abrir htmlcov/index.html"
Write-Host "   3. Limpiar datos: .\clean_test_data.ps1"
Write-Host ""
Write-Host "📁 Archivos creados:" -ForegroundColor Yellow
Write-Host "   • .env.test - Configuración de entorno"
Write-Host "   • requirements-test.txt - Dependencias de pruebas"
Write-Host "   • run_tests.ps1 - Script de ejecución"
Write-Host "   • clean_test_data.ps1 - Script de limpieza"
Write-Host ""
Write-Host "🔧 Comandos útiles:" -ForegroundColor Yellow
Write-Host "   • python -m pytest tests/ -v"
Write-Host "   • python -m pytest tests/ --cov=. --cov-report=html"
Write-Host "   • python -m pytest tests/test_auth_service.py -v"
Write-Host "   • python -m pytest -m critical -v"
Write-Host ""
Write-Success "¡Listo para ejecutar pruebas!"



