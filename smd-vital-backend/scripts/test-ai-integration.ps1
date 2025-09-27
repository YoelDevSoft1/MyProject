# SMD VITAL - Script para probar la integración de IA (PowerShell)
# ================================================================

Write-Host "🤖 SMD VITAL - Probando integración de IA gratuita..." -ForegroundColor Blue

# Función para imprimir mensajes
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

# Verificar que los servicios estén corriendo
function Test-Services {
    Write-Status "Verificando servicios..."
    
    # Verificar Ollama
    try {
        $ollamaResponse = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 5
        Write-Success "✅ Ollama está corriendo"
    }
    catch {
        Write-Error "❌ Ollama no está disponible"
        return $false
    }
    
    # Verificar AI LangGraph Service
    try {
        $aiResponse = Invoke-RestMethod -Uri "http://localhost:8008/health" -Method Get -TimeoutSec 5
        Write-Success "✅ AI LangGraph Service está corriendo"
    }
    catch {
        Write-Error "❌ AI LangGraph Service no está disponible"
        return $false
    }
    
    # Verificar Nginx
    try {
        $nginxResponse = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get -TimeoutSec 5
        Write-Success "✅ Nginx está corriendo"
    }
    catch {
        Write-Error "❌ Nginx no está disponible"
        return $false
    }
    
    return $true
}

# Probar endpoints de IA
function Test-AIEndpoints {
    Write-Status "Probando endpoints de IA..."
    
    # Probar estado de IA gratuita
    Write-Status "Probando /api/ai/free/status..."
    try {
        $statusResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/ai/free/status" -Method Get
        Write-Success "✅ Estado de IA gratuita OK"
        $statusResponse | ConvertTo-Json -Depth 3
    }
    catch {
        Write-Error "❌ Error en estado de IA gratuita: $($_.Exception.Message)"
    }
    
    Write-Host ""
    
    # Probar listado de modelos
    Write-Status "Probando /api/ai/free/models..."
    try {
        $modelsResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/ai/free/models" -Method Get
        Write-Success "✅ Listado de modelos OK"
        Write-Host "Modelos disponibles: $($modelsResponse.available_models.Count)"
    }
    catch {
        Write-Error "❌ Error en listado de modelos: $($_.Exception.Message)"
    }
    
    Write-Host ""
}

# Probar consulta de IA
function Test-AIQuery {
    Write-Status "Probando consulta de IA..."
    
    # Consulta simple
    Write-Status "Enviando consulta de prueba..."
    try {
        $queryBody = @{
            query = "¿Cuáles son los síntomas de la gripe?"
            user_id = "test_user"
            model = "llama2"
        } | ConvertTo-Json
        
        $queryResponse = Invoke-RestMethod -Uri "http://localhost:8000/api/ai/free/query" -Method Post -Body $queryBody -ContentType "application/json"
        Write-Success "✅ Consulta de IA exitosa"
        Write-Host "Respuesta: $($queryResponse.response.Substring(0, [Math]::Min(100, $queryResponse.response.Length)))..."
    }
    catch {
        Write-Error "❌ Error en consulta de IA: $($_.Exception.Message)"
    }
    
    Write-Host ""
}

# Instalar modelo de prueba si no existe
function Install-TestModel {
    Write-Status "Verificando si hay modelos instalados..."
    
    try {
        $ollamaModels = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get
        $modelCount = $ollamaModels.models.Count
        
        if ($modelCount -eq 0) {
            Write-Warning "No hay modelos instalados. Instalando modelo de prueba..."
            
            # Instalar modelo ligero
            Write-Status "Instalando phi:3b (modelo ligero)..."
            $installBody = @{
                name = "phi:3b"
            } | ConvertTo-Json
            
            Start-Job -ScriptBlock {
                Invoke-RestMethod -Uri "http://localhost:11434/api/pull" -Method Post -Body $using:installBody -ContentType "application/json"
            } | Out-Null
            
            Write-Warning "La instalación del modelo está en progreso en segundo plano..."
            Write-Warning "Esto puede tomar varios minutos. Puedes continuar con las pruebas."
        }
        else {
            Write-Success "✅ Hay $modelCount modelos instalados"
        }
    }
    catch {
        Write-Error "Error verificando modelos: $($_.Exception.Message)"
    }
}

# Mostrar información de uso
function Show-UsageInfo {
    Write-Host ""
    Write-Status "📋 Información de uso:"
    Write-Host ""
    Write-Host "🌐 Frontend: http://localhost:3001/ai" -ForegroundColor Cyan
    Write-Host "🔗 API Base: http://localhost:8000/api/ai/" -ForegroundColor Cyan
    Write-Host "🤖 Ollama: http://localhost:11434" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📡 Endpoints disponibles:" -ForegroundColor Yellow
    Write-Host "  - GET  /api/ai/free/status     - Estado del servicio"
    Write-Host "  - GET  /api/ai/free/models     - Listar modelos"
    Write-Host "  - POST /api/ai/free/query      - Consulta simple"
    Write-Host "  - POST /api/ai/free/stream     - Consulta con streaming"
    Write-Host "  - POST /api/ai/free/install/{model} - Instalar modelo"
    Write-Host ""
    Write-Host "💡 Ejemplo de uso desde frontend:" -ForegroundColor Yellow
    Write-Host "  fetch('/api/ai/free/query', {" -ForegroundColor Gray
    Write-Host "    method: 'POST'," -ForegroundColor Gray
    Write-Host "    headers: { 'Content-Type': 'application/json' }," -ForegroundColor Gray
    Write-Host "    body: JSON.stringify({" -ForegroundColor Gray
    Write-Host "      query: 'Consulta medica'," -ForegroundColor Gray
    Write-Host "      user_id: 'user123'," -ForegroundColor Gray
    Write-Host "      model: 'llama2'" -ForegroundColor Gray
    Write-Host "    })" -ForegroundColor Gray
    Write-Host "  })" -ForegroundColor Gray
    Write-Host ""
}

# Función principal
function Main {
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host "🤖 SMD VITAL - Prueba de Integración IA" -ForegroundColor Magenta
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host ""
    
    # Verificar servicios
    if (-not (Test-Services)) {
        Write-Error "Algunos servicios no están disponibles. Asegúrate de ejecutar:"
        Write-Error "docker-compose up -d ollama ai-langgraph nginx"
        exit 1
    }
    
    Write-Host ""
    
    # Instalar modelo si es necesario
    Install-TestModel
    
    Write-Host ""
    
    # Probar endpoints
    Test-AIEndpoints
    
    # Probar consulta
    Test-AIQuery
    
    # Mostrar información de uso
    Show-UsageInfo
    
    Write-Success "🎉 ¡Prueba de integración completada!"
    Write-Status "Ahora puedes usar la IA gratuita desde el frontend en http://localhost:3001/ai"
}

# Ejecutar función principal
Main
