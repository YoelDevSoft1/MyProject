#!/bin/bash

# SMD VITAL - Script para probar la integración de IA
# ===================================================

echo "🤖 SMD VITAL - Probando integración de IA gratuita..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
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

# Verificar que los servicios estén corriendo
check_services() {
    print_status "Verificando servicios..."
    
    # Verificar Ollama
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_success "✅ Ollama está corriendo"
    else
        print_error "❌ Ollama no está disponible"
        return 1
    fi
    
    # Verificar AI LangGraph Service
    if curl -s http://localhost:8008/health > /dev/null 2>&1; then
        print_success "✅ AI LangGraph Service está corriendo"
    else
        print_error "❌ AI LangGraph Service no está disponible"
        return 1
    fi
    
    # Verificar Nginx
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_success "✅ Nginx está corriendo"
    else
        print_error "❌ Nginx no está disponible"
        return 1
    fi
}

# Probar endpoints de IA
test_ai_endpoints() {
    print_status "Probando endpoints de IA..."
    
    # Probar estado de IA gratuita
    print_status "Probando /api/ai/free/status..."
    if curl -s http://localhost:8000/api/ai/free/status | jq . > /dev/null 2>&1; then
        print_success "✅ Estado de IA gratuita OK"
        curl -s http://localhost:8000/api/ai/free/status | jq .
    else
        print_error "❌ Error en estado de IA gratuita"
    fi
    
    echo ""
    
    # Probar listado de modelos
    print_status "Probando /api/ai/free/models..."
    if curl -s http://localhost:8000/api/ai/free/models | jq . > /dev/null 2>&1; then
        print_success "✅ Listado de modelos OK"
        curl -s http://localhost:8000/api/ai/free/models | jq '.available_models | length'
    else
        print_error "❌ Error en listado de modelos"
    fi
    
    echo ""
}

# Probar consulta de IA
test_ai_query() {
    print_status "Probando consulta de IA..."
    
    # Consulta simple
    print_status "Enviando consulta de prueba..."
    response=$(curl -s -X POST "http://localhost:8000/api/ai/free/query" \
        -H "Content-Type: application/json" \
        -d '{
            "query": "¿Cuáles son los síntomas de la gripe?",
            "user_id": "test_user",
            "model": "llama2"
        }')
    
    if echo "$response" | jq . > /dev/null 2>&1; then
        print_success "✅ Consulta de IA exitosa"
        echo "$response" | jq '.response' | head -c 100
        echo "..."
    else
        print_error "❌ Error en consulta de IA"
        echo "$response"
    fi
    
    echo ""
}

# Probar streaming de IA
test_ai_streaming() {
    print_status "Probando streaming de IA..."
    
    print_status "Iniciando stream de prueba (5 segundos)..."
    timeout 5s curl -s -X POST "http://localhost:8000/api/ai/free/stream" \
        -H "Content-Type: application/json" \
        -d '{
            "query": "Explica brevemente qué es la hipertensión",
            "user_id": "test_user",
            "model": "llama2"
        }' | head -c 200
    
    echo ""
    print_success "✅ Streaming de IA probado"
    echo ""
}

# Instalar modelo de prueba si no existe
install_test_model() {
    print_status "Verificando si hay modelos instalados..."
    
    models=$(curl -s http://localhost:11434/api/tags | jq -r '.models | length')
    
    if [ "$models" -eq 0 ]; then
        print_warning "No hay modelos instalados. Instalando modelo de prueba..."
        
        # Instalar modelo ligero
        print_status "Instalando phi:3b (modelo ligero)..."
        curl -s -X POST "http://localhost:11434/api/pull" \
            -d '{"name":"phi:3b"}' &
        
        print_warning "La instalación del modelo está en progreso en segundo plano..."
        print_warning "Esto puede tomar varios minutos. Puedes continuar con las pruebas."
    else
        print_success "✅ Hay $models modelos instalados"
    fi
}

# Mostrar información de uso
show_usage_info() {
    echo ""
    print_status "📋 Información de uso:"
    echo ""
    echo "🌐 Frontend: http://localhost:3001/ai"
    echo "🔗 API Base: http://localhost:8000/api/ai/"
    echo "🤖 Ollama: http://localhost:11434"
    echo ""
    echo "📡 Endpoints disponibles:"
    echo "  - GET  /api/ai/free/status     - Estado del servicio"
    echo "  - GET  /api/ai/free/models     - Listar modelos"
    echo "  - POST /api/ai/free/query      - Consulta simple"
    echo "  - POST /api/ai/free/stream     - Consulta con streaming"
    echo "  - POST /api/ai/free/install/{model} - Instalar modelo"
    echo ""
    echo "💡 Ejemplo de uso desde frontend:"
    echo "  fetch('/api/ai/free/query', {"
    echo "    method: 'POST',"
    echo "    headers: { 'Content-Type': 'application/json' },"
    echo "    body: JSON.stringify({"
    echo "      query: 'Consulta médica',"
    echo "      user_id: 'user123',"
    echo "      model: 'llama2'"
    echo "    })"
    echo "  })"
    echo ""
}

# Función principal
main() {
    echo "=========================================="
    echo "🤖 SMD VITAL - Prueba de Integración IA"
    echo "=========================================="
    echo ""
    
    # Verificar servicios
    if ! check_services; then
        print_error "Algunos servicios no están disponibles. Asegúrate de ejecutar:"
        print_error "docker-compose up -d ollama ai-langgraph nginx"
        exit 1
    fi
    
    echo ""
    
    # Instalar modelo si es necesario
    install_test_model
    
    echo ""
    
    # Probar endpoints
    test_ai_endpoints
    
    # Probar consulta
    test_ai_query
    
    # Probar streaming
    test_ai_streaming
    
    # Mostrar información de uso
    show_usage_info
    
    print_success "🎉 ¡Prueba de integración completada!"
    print_status "Ahora puedes usar la IA gratuita desde el frontend en http://localhost:3001/ai"
}

# Ejecutar función principal
main "$@"

