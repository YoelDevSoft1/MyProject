#!/bin/bash

echo "🚀 Desplegando SMD VITAL AI LangGraph Service..."

# Verificar que Docker esté ejecutándose
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está ejecutándose. Por favor, inicia Docker primero."
    exit 1
fi

# Verificar que docker-compose esté disponible
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose no está instalado. Por favor, instálalo primero."
    exit 1
fi

# Cargar variables de entorno
if [ -f .env ]; then
    export $(cat .env | xargs)
    echo "✅ Variables de entorno cargadas desde .env"
else
    echo "⚠️ Archivo .env no encontrado. Usando valores por defecto."
fi

# Verificar variables de entorno críticas
if [ -z "$OPENAI_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️ Advertencia: No se encontraron claves de API de IA (OPENAI_API_KEY o ANTHROPIC_API_KEY)"
    echo "   El servicio funcionará con capacidades limitadas."
fi

# Construir solo el servicio de IA
echo "🏗️ Construyendo servicio de IA..."
docker-compose build ai-langgraph

if [ $? -ne 0 ]; then
    echo "❌ Error construyendo el servicio de IA"
    exit 1
fi

# Levantar el servicio de IA
echo "🚀 Levantando servicio de IA..."
docker-compose up -d ai-langgraph

if [ $? -eq 0 ]; then
    echo "✅ Servicio de IA desplegado exitosamente"
    echo ""
    echo "📊 Información del servicio:"
    echo "   - URL: http://localhost:8008"
    echo "   - Health Check: http://localhost:8008/health"
    echo "   - Documentación: http://localhost:8008/docs"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "   - Ver logs: docker-compose logs -f ai-langgraph"
    echo "   - Reiniciar: docker-compose restart ai-langgraph"
    echo "   - Detener: docker-compose stop ai-langgraph"
    echo ""
    echo "🧪 Probar el servicio:"
    echo "   curl http://localhost:8008/health"
    echo ""
    echo "🎉 ¡Despliegue completado!"
else
    echo "❌ Error desplegando el servicio de IA"
    echo "📋 Ver logs para más detalles:"
    echo "   docker-compose logs ai-langgraph"
    exit 1
fi


