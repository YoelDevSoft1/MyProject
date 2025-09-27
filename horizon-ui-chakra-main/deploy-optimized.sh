#!/bin/bash

# SMD VITAL Frontend - Script de deployment optimizado
# ====================================================

set -e

echo "🚀 Iniciando deployment optimizado de SMD VITAL Frontend..."

# Configurar variables de entorno
export NODE_ENV=production
export GENERATE_SOURCEMAP=false
export DISABLE_ESLINT_PLUGIN=true
export CI=true

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado. Ejecutar desde el directorio del frontend."
    exit 1
fi

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  --docker        Construir y desplegar con Docker"
    echo "  --render        Desplegar a Render.com"
    echo "  --heroku        Desplegar a Heroku"
    echo "  --local         Build local optimizado"
    echo "  --analyze       Análisis de bundle"
    echo "  --help          Mostrar esta ayuda"
    echo ""
}

# Función para build local optimizado
build_local() {
    echo "🔨 Construyendo aplicación localmente..."
    
    # Limpiar cache
    echo "🧹 Limpiando cache..."
    rm -rf node_modules package-lock.json
    npm cache clean --force
    
    # Instalar dependencias
    echo "📦 Instalando dependencias..."
    npm ci --only=production --no-audit --no-fund --silent
    
    # Build optimizado
    echo "🔨 Construyendo aplicación..."
    npm run build:optimized
    
    # Verificar build
    if [ -d "build" ]; then
        echo "✅ Build completado exitosamente!"
        echo "📊 Tamaño del build:"
        du -sh build/
    else
        echo "❌ Build falló"
        exit 1
    fi
}

# Función para deployment con Docker
deploy_docker() {
    echo "🐳 Construyendo imagen Docker..."
    
    # Build de la imagen
    docker build -t smd-vital-frontend:latest .
    
    # Verificar imagen
    echo "📊 Información de la imagen:"
    docker images smd-vital-frontend:latest
    
    # Ejecutar contenedor
    echo "🚀 Ejecutando contenedor..."
    docker run -d \
        --name smd-vital-frontend \
        -p 3000:80 \
        -e NODE_ENV=production \
        smd-vital-frontend:latest
    
    # Verificar salud
    echo "🏥 Verificando salud del contenedor..."
    sleep 5
    curl -f http://localhost:3000/health || echo "❌ Health check falló"
    
    echo "✅ Contenedor ejecutándose en http://localhost:3000"
}

# Función para deployment a Render
deploy_render() {
    echo "☁️ Preparando deployment para Render..."
    
    # Verificar que existe el build
    if [ ! -d "build" ]; then
        echo "🔨 Construyendo aplicación primero..."
        build_local
    fi
    
    # Crear archivo de configuración para Render
    cat > render.yaml << EOF
services:
  - type: web
    name: smd-vital-frontend
    env: static
    buildCommand: cd horizon-ui-chakra-main && npm ci && npm run build:optimized
    staticPublishPath: ./horizon-ui-chakra-main/build
    envVars:
      - key: NODE_ENV
        value: production
      - key: GENERATE_SOURCEMAP
        value: false
      - key: DISABLE_ESLINT_PLUGIN
        value: true
EOF
    
    echo "✅ Archivo render.yaml creado"
    echo "📋 Siguiente paso: Subir a GitHub y conectar con Render"
}

# Función para análisis de bundle
analyze_bundle() {
    echo "📊 Analizando bundle..."
    
    # Verificar que existe el build
    if [ ! -d "build" ]; then
        echo "🔨 Construyendo aplicación primero..."
        build_local
    fi
    
    # Instalar webpack-bundle-analyzer si no está instalado
    if ! npm list -g webpack-bundle-analyzer >/dev/null 2>&1; then
        echo "📦 Instalando webpack-bundle-analyzer..."
        npm install -g webpack-bundle-analyzer
    fi
    
    # Ejecutar análisis
    echo "🔍 Ejecutando análisis de bundle..."
    npx webpack-bundle-analyzer build/static/js/*.js
    
    echo "✅ Análisis completado"
}

# Procesar argumentos
case "${1:-}" in
    --docker)
        build_local
        deploy_docker
        ;;
    --render)
        deploy_render
        ;;
    --local)
        build_local
        ;;
    --analyze)
        analyze_bundle
        ;;
    --help)
        show_help
        ;;
    "")
        echo "❌ Error: Debe especificar una opción"
        show_help
        exit 1
        ;;
    *)
        echo "❌ Error: Opción desconocida '$1'"
        show_help
        exit 1
        ;;
esac

echo "🎉 Deployment completado exitosamente!"
