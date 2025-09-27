#!/bin/bash

# SMD VITAL - Script para instalar modelos de IA gratuitos
# ========================================================

echo "🤖 SMD VITAL - Instalando modelos de IA gratuitos..."

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

# Verificar si Ollama está corriendo
check_ollama() {
    print_status "Verificando conexión con Ollama..."
    
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_success "Ollama está corriendo"
        return 0
    else
        print_error "Ollama no está disponible en localhost:11434"
        print_status "Asegúrate de que el contenedor de Ollama esté corriendo:"
        print_status "docker-compose up -d ollama"
        return 1
    fi
}

# Instalar un modelo
install_model() {
    local model_name=$1
    local model_size=$2
    
    print_status "Instalando modelo: $model_name ($model_size)"
    
    if curl -s -X POST http://localhost:11434/api/pull -d "{\"name\":\"$model_name\"}" > /dev/null; then
        print_success "Modelo $model_name instalado correctamente"
    else
        print_error "Error instalando modelo $model_name"
        return 1
    fi
}

# Lista de modelos recomendados por tamaño de memoria
MODELS_LIGHTWEIGHT=(
    "phi:3b"
    "gemma:2b"
    "orca-mini"
)

MODELS_BALANCED=(
    "llama2"
    "mistral"
    "phi"
    "gemma"
)

MODELS_ADVANCED=(
    "llama2:13b"
    "codellama:13b"
    "mistral:7b"
)

MODELS_MEDICAL=(
    "medllama"
    "neural-chat"
)

# Función principal
main() {
    echo "=========================================="
    echo "🤖 SMD VITAL - Instalador de IA Gratuita"
    echo "=========================================="
    echo ""
    
    # Verificar Ollama
    if ! check_ollama; then
        exit 1
    fi
    
    echo ""
    print_status "Selecciona qué modelos instalar:"
    echo "1) Modelos ligeros (2-4GB RAM) - Recomendado para desarrollo"
    echo "2) Modelos balanceados (4-8GB RAM) - Recomendado para producción"
    echo "3) Modelos avanzados (8-16GB RAM) - Máxima calidad"
    echo "4) Modelos médicos especializados"
    echo "5) Instalar todos los modelos"
    echo "6) Instalar modelo personalizado"
    echo ""
    
    read -p "Ingresa tu opción (1-6): " choice
    
    case $choice in
        1)
            print_status "Instalando modelos ligeros..."
            for model in "${MODELS_LIGHTWEIGHT[@]}"; do
                install_model "$model" "2-4GB"
            done
            ;;
        2)
            print_status "Instalando modelos balanceados..."
            for model in "${MODELS_BALANCED[@]}"; do
                install_model "$model" "4-8GB"
            done
            ;;
        3)
            print_status "Instalando modelos avanzados..."
            for model in "${MODELS_ADVANCED[@]}"; do
                install_model "$model" "8-16GB"
            done
            ;;
        4)
            print_status "Instalando modelos médicos..."
            for model in "${MODELS_MEDICAL[@]}"; do
                install_model "$model" "4-8GB"
            done
            ;;
        5)
            print_status "Instalando todos los modelos (esto puede tomar mucho tiempo)..."
            all_models=("${MODELS_LIGHTWEIGHT[@]}" "${MODELS_BALANCED[@]}" "${MODELS_ADVANCED[@]}" "${MODELS_MEDICAL[@]}")
            for model in "${all_models[@]}"; do
                install_model "$model" "Variable"
            done
            ;;
        6)
            read -p "Ingresa el nombre del modelo: " custom_model
            install_model "$custom_model" "Variable"
            ;;
        *)
            print_error "Opción inválida"
            exit 1
            ;;
    esac
    
    echo ""
    print_status "Verificando modelos instalados..."
    
    # Listar modelos instalados
    echo ""
    print_success "Modelos instalados:"
    curl -s http://localhost:11434/api/tags | jq -r '.models[] | "  - \(.name) (\(.size | . / 1024 / 1024 / 1024 | floor)GB)"' 2>/dev/null || echo "  (No se pudo obtener la lista)"
    
    echo ""
    print_success "¡Instalación completada!"
    echo ""
    print_status "Para usar los modelos en tu aplicación:"
    echo "  - Endpoint principal: POST /ai/query"
    echo "  - IA gratuita: POST /ai/free/query"
    echo "  - Listar modelos: GET /ai/free/models"
    echo "  - Estado: GET /ai/free/status"
    echo ""
    print_status "Ejemplo de uso:"
    echo 'curl -X POST "http://localhost:8008/ai/free/query" \'
    echo '  -H "Content-Type: application/json" \'
    echo '  -d '"'"'{"query": "¿Cuáles son los síntomas de la gripe?", "user_id": "test", "model": "llama2"}'"'"''
}

# Ejecutar función principal
main "$@"

