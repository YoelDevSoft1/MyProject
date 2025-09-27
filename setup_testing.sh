#!/bin/bash
# Script de configuración para pruebas de SMD VITAL
# ===============================================

set -e  # Salir si hay algún error

echo "🧪 Configurando entorno de pruebas para SMD VITAL..."
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que Python esté instalado
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 no está instalado. Por favor instala Python 3.8 o superior."
    exit 1
fi

print_status "Python 3 encontrado: $(python3 --version)"

# Verificar que pip esté instalado
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 no está instalado. Por favor instala pip."
    exit 1
fi

print_status "pip3 encontrado: $(pip3 --version)"

# Crear directorio de pruebas si no existe
mkdir -p tests
mkdir -p reports
mkdir -p htmlcov

print_status "Directorios de pruebas creados"

# Instalar dependencias de pruebas
print_status "Instalando dependencias de pruebas..."

# Dependencias principales
pip3 install --upgrade pip
pip3 install pytest pytest-cov pytest-asyncio pytest-mock pytest-timeout
pip3 install pytest-html pytest-json-report pytest-xdist

# Dependencias para testing
pip3 install httpx fastapi testclient
pip3 install faker factory-boy
pip3 install coverage

# Dependencias para mocking
pip3 install responses requests-mock

# Dependencias para performance testing
pip3 install locust

print_success "Dependencias de pruebas instaladas"

# Crear archivo de configuración de entorno para pruebas
cat > .env.test << EOF
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
EOF

print_success "Archivo de configuración de pruebas creado"

# Crear archivo de requirements para pruebas
cat > requirements-test.txt << EOF
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
EOF

print_success "Archivo requirements-test.txt creado"

# Crear script de ejecución de pruebas
cat > run_tests.sh << 'EOF'
#!/bin/bash
# Script para ejecutar todas las pruebas

echo "🧪 Ejecutando pruebas de SMD VITAL..."

# Ejecutar pruebas unitarias
echo "📋 Ejecutando pruebas unitarias..."
python -m pytest tests/ -v --cov=. --cov-report=html --cov-report=json

# Ejecutar pruebas de integración
echo "🔗 Ejecutando pruebas de integración..."
python -m pytest tests/test_integration.py -v

# Ejecutar pruebas de seguridad
echo "🔒 Ejecutando pruebas de seguridad..."
python -m pytest tests/test_security.py -v

# Ejecutar pruebas de carga (opcional)
if [ -f "tests/test_load.py" ]; then
    echo "⚡ Ejecutando pruebas de carga..."
    python -m pytest tests/test_load.py -v
fi

echo "✅ Todas las pruebas completadas"
echo "📊 Reporte de cobertura disponible en: htmlcov/index.html"
EOF

chmod +x run_tests.sh
print_success "Script de ejecución de pruebas creado"

# Crear script de limpieza
cat > clean_test_data.sh << 'EOF'
#!/bin/bash
# Script para limpiar datos de pruebas

echo "🧹 Limpiando datos de pruebas..."

# Eliminar archivos de cobertura
rm -rf htmlcov/
rm -rf .coverage
rm -rf coverage.xml
rm -rf coverage.json

# Eliminar reportes
rm -rf reports/

# Eliminar bases de datos de prueba
rm -f test.db
rm -f test_*.db

# Eliminar archivos temporales
rm -f *.log
rm -f *.tmp

echo "✅ Limpieza completada"
EOF

chmod +x clean_test_data.sh
print_success "Script de limpieza creado"

# Crear archivo de configuración de GitHub Actions (opcional)
mkdir -p .github/workflows
cat > .github/workflows/tests.yml << 'EOF'
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        python-version: [3.8, 3.9, 3.10, 3.11]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements-test.txt
    
    - name: Run tests
      run: |
        python -m pytest tests/ -v --cov=. --cov-report=xml
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
EOF

print_success "Configuración de GitHub Actions creada"

# Verificar instalación
print_status "Verificando instalación..."

if python3 -c "import pytest" 2>/dev/null; then
    print_success "pytest instalado correctamente"
else
    print_error "Error instalando pytest"
    exit 1
fi

if python3 -c "import pytest_cov" 2>/dev/null; then
    print_success "pytest-cov instalado correctamente"
else
    print_error "Error instalando pytest-cov"
    exit 1
fi

# Mostrar resumen
echo ""
echo "🎉 Configuración de pruebas completada exitosamente!"
echo "=================================================="
echo ""
echo "📋 Próximos pasos:"
echo "   1. Ejecutar pruebas: ./run_tests.sh"
echo "   2. Ver cobertura: abrir htmlcov/index.html"
echo "   3. Limpiar datos: ./clean_test_data.sh"
echo ""
echo "📁 Archivos creados:"
echo "   • .env.test - Configuración de entorno"
echo "   • requirements-test.txt - Dependencias de pruebas"
echo "   • run_tests.sh - Script de ejecución"
echo "   • clean_test_data.sh - Script de limpieza"
echo "   • .github/workflows/tests.yml - CI/CD"
echo ""
echo "🔧 Comandos útiles:"
echo "   • python -m pytest tests/ -v"
echo "   • python -m pytest tests/ --cov=. --cov-report=html"
echo "   • python -m pytest tests/test_auth_service.py -v"
echo "   • python -m pytest -m critical -v"
echo ""
print_success "¡Listo para ejecutar pruebas!"



