#!/bin/bash

# Script para hacer build local y preparar para deployment
echo "🚀 Building SMD VITAL Frontend locally..."

# Navegar al directorio del frontend
cd horizon-ui-chakra-main

# Verificar que package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    exit 1
fi

# Instalar dependencias
echo "📦 Installing dependencies..."
npm install

# Hacer el build
echo "🔨 Building React app..."
npm run build

# Verificar que el build se completó
if [ -d "build" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build directory contents:"
    ls -la build/
    
    # Verificar que index.html existe
    if [ -f "build/index.html" ]; then
        echo "✅ index.html found in build directory"
    else
        echo "❌ index.html not found in build directory"
        exit 1
    fi
else
    echo "❌ Build failed - no build directory found"
    exit 1
fi

echo "🎉 Frontend ready for deployment!"
