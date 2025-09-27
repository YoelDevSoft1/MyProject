#!/bin/bash

# SMD VITAL Frontend - Script de build optimizado
# ================================================

set -e

echo "🚀 Iniciando build optimizado de SMD VITAL Frontend..."

# Configurar variables de entorno
export NODE_ENV=production
export GENERATE_SOURCEMAP=false
export DISABLE_ESLINT_PLUGIN=true
export CI=true

# Limpiar cache y node_modules
echo "🧹 Limpiando cache y dependencias..."
rm -rf node_modules package-lock.json
npm cache clean --force

# Instalar dependencias con optimizaciones
echo "📦 Instalando dependencias optimizadas..."
npm ci --only=production --no-audit --no-fund --silent

# Verificar tamaño de node_modules
echo "📊 Tamaño de node_modules:"
du -sh node_modules/ || echo "No se pudo calcular el tamaño"

# Build de la aplicación
echo "🔨 Construyendo aplicación..."
npm run build

# Verificar build
if [ -d "build" ]; then
    echo "✅ Build completado exitosamente!"
    echo "📊 Tamaño del build:"
    du -sh build/
    echo "📁 Contenido del build:"
    ls -la build/
    
    # Verificar archivos críticos
    if [ -f "build/index.html" ]; then
        echo "✅ index.html encontrado"
    else
        echo "❌ index.html no encontrado"
        exit 1
    fi
    
    if [ -f "build/static/js/main*.js" ]; then
        echo "✅ Archivos JS encontrados"
    else
        echo "❌ Archivos JS no encontrados"
        exit 1
    fi
    
    if [ -f "build/static/css/main*.css" ]; then
        echo "✅ Archivos CSS encontrados"
    else
        echo "❌ Archivos CSS no encontrados"
        exit 1
    fi
    
    # Optimizar archivos estáticos
    echo "🔧 Optimizando archivos estáticos..."
    
    # Comprimir archivos HTML
    if command -v gzip >/dev/null 2>&1; then
        find build -name "*.html" -exec gzip -k {} \;
        echo "✅ Archivos HTML comprimidos"
    fi
    
    # Verificar tamaño final
    echo "📊 Tamaño final del build:"
    du -sh build/
    
    echo "🎉 Build optimizado completado exitosamente!"
else
    echo "❌ Build falló - directorio build no encontrado"
    exit 1
fi
