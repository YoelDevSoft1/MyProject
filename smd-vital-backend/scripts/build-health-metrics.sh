#!/bin/bash

# Script para construir el servicio health-metrics con diferentes opciones

set -e

SERVICE_DIR="services/medical-records"
SERVICE_NAME="health-metrics-service"

echo "🏗️  Construyendo servicio $SERVICE_NAME..."

# Función para probar WeasyPrint
test_weasyprint() {
    echo "🧪 Probando WeasyPrint en el contenedor..."
    docker run --rm smd_vital_health_metrics python test_weasyprint.py
}

# Función para construir con WeasyPrint completo
build_with_weasyprint() {
    echo "📦 Construyendo con WeasyPrint completo..."
    docker build -t smd_vital_health_metrics \
        -f $SERVICE_DIR/Dockerfile \
        $SERVICE_DIR
    
    echo "✅ Construcción completada con WeasyPrint"
}

# Función para construir versión simple
build_simple() {
    echo "📦 Construyendo versión simple (sin WeasyPrint)..."
    docker build -t smd_vital_health_metrics \
        -f $SERVICE_DIR/Dockerfile.simple \
        --build-arg REQUIREMENTS_FILE=requirements.simple.txt \
        $SERVICE_DIR
    
    echo "✅ Construcción completada (versión simple)"
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  full        Construir con WeasyPrint completo (recomendado)"
    echo "  simple      Construir versión simple sin WeasyPrint"
    echo "  test        Probar WeasyPrint en contenedor existente"
    echo "  help        Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 full     # Construir con WeasyPrint"
    echo "  $0 simple   # Construir versión simple"
    echo "  $0 test     # Probar WeasyPrint"
}

# Procesar argumentos
case "${1:-full}" in
    "full")
        build_with_weasyprint
        echo ""
        echo "🧪 Probando WeasyPrint..."
        if test_weasyprint; then
            echo "🎉 ¡WeasyPrint funciona correctamente!"
        else
            echo "⚠️  WeasyPrint tiene problemas. Considera usar 'simple'"
        fi
        ;;
    "simple")
        build_simple
        echo ""
        echo "ℹ️  Construcción simple completada. PDFs no estarán disponibles."
        ;;
    "test")
        echo "🧪 Probando WeasyPrint en contenedor existente..."
        test_weasyprint
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ Opción desconocida: $1"
        show_help
        exit 1
        ;;
esac

echo ""
echo "🚀 Para ejecutar el servicio:"
echo "   docker-compose up health-metrics-service"
