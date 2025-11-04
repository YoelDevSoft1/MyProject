#!/bin/bash

# Script de desarrollo para SMD VITAL Angular con Docker
# Este script reconstruye la aplicación cuando hay cambios

echo "🚀 Iniciando servidor de desarrollo SMD VITAL Angular..."

# Función para limpiar contenedores
cleanup() {
    echo "🧹 Limpiando contenedores..."
    docker-compose down
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Construir y ejecutar el contenedor
echo "🔨 Construyendo imagen Docker..."
docker-compose build

echo "🐳 Iniciando contenedor..."
docker-compose up

# El script continuará ejecutándose hasta que se presione Ctrl+C
