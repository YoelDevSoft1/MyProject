# SMD VITAL - Script para probar IA en panel de administración
# ==========================================================

Write-Host "🤖 SMD VITAL - Probando IA en panel de administración..." -ForegroundColor Blue

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

# Verificar servicios
function Test-Services {
    Write-Status "Verificando servicios necesarios..."
    
    $services = @(
        @{ Name = "Ollama"; Url = "http://localhost:11434/api/tags" },
        @{ Name = "AI LangGraph"; Url = "http://localhost:8008/health" },
        @{ Name = "Nginx"; Url = "http://localhost:8000/health" }
    )
    
    foreach ($service in $services) {
        try {
            $response = Invoke-RestMethod -Uri $service.Url -Method Get -TimeoutSec 5
            Write-Success "✅ $($service.Name) está funcionando"
        }
        catch {
            Write-Error "❌ $($service.Name) no está disponible: $($_.Exception.Message)"
            return $false
        }
    }
    
    return $true
}

# Probar endpoints de IA para administradores
function Test-AdminAIEndpoints {
    Write-Status "Probando endpoints de IA para administradores..."
    
    $endpoints = @(
        @{ 
            Name = "Estado de IA"; 
            Url = "http://localhost:8000/api/ai/free/status";
            Method = "GET"
        },
        @{ 
            Name = "Listar Modelos"; 
            Url = "http://localhost:8000/api/ai/free/models";
            Method = "GET"
        },
        @{ 
            Name = "Consulta de Prueba"; 
            Url = "http://localhost:8000/api/ai/free/query";
            Method = "POST";
            Body = @{
                query = "¿Cuáles son las mejores prácticas para administradores médicos?"
                user_id = "admin_test"
                model = "llama2"
            } | ConvertTo-Json
        }
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            Write-Status "Probando: $($endpoint.Name)"
            
            if ($endpoint.Method -eq "GET") {
                $response = Invoke-RestMethod -Uri $endpoint.Url -Method Get
            } else {
                $response = Invoke-RestMethod -Uri $endpoint.Url -Method Post -Body $endpoint.Body -ContentType "application/json"
            }
            
            Write-Success "✅ $($endpoint.Name) - OK"
            
            # Mostrar información relevante
            if ($endpoint.Name -eq "Estado de IA") {
                Write-Host "  - Estado: $($response.status)" -ForegroundColor Gray
                Write-Host "  - Modelos instalados: $($response.installed_models)" -ForegroundColor Gray
            }
            elseif ($endpoint.Name -eq "Listar Modelos") {
                Write-Host "  - Modelos disponibles: $($response.available_models.Count)" -ForegroundColor Gray
            }
            elseif ($endpoint.Name -eq "Consulta de Prueba") {
                Write-Host "  - Respuesta: $($response.response.Substring(0, [Math]::Min(100, $response.response.Length)))..." -ForegroundColor Gray
            }
        }
        catch {
            Write-Error "❌ $($endpoint.Name) - Error: $($_.Exception.Message)"
        }
    }
}

# Verificar configuración de rutas
function Test-RouteConfiguration {
    Write-Status "Verificando configuración de rutas..."
    
    # Verificar que la ruta /api/ai/ esté configurada
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/ai/free/status" -Method Get
        if ($response.StatusCode -eq 200) {
            Write-Success "✅ Ruta /api/ai/ configurada correctamente"
        } else {
            Write-Error "❌ Ruta /api/ai/ no responde correctamente"
        }
    }
    catch {
        Write-Error "❌ Error verificando ruta /api/ai/: $($_.Exception.Message)"
    }
}

# Mostrar información de acceso
function Show-AccessInfo {
    Write-Host ""
    Write-Status "📋 Información de acceso para administradores:"
    Write-Host ""
    Write-Host "🌐 Panel de Administración: http://localhost:3001/admin" -ForegroundColor Cyan
    Write-Host "🤖 Chat IA: http://localhost:3001/admin/ai" -ForegroundColor Cyan
    Write-Host "📊 Dashboard IA: http://localhost:3001/admin/ai-dashboard" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📡 Endpoints de API para administradores:" -ForegroundColor Yellow
    Write-Host "  - GET  /api/ai/free/status     - Estado del servicio de IA" -ForegroundColor Gray
    Write-Host "  - GET  /api/ai/free/models     - Listar modelos disponibles" -ForegroundColor Gray
    Write-Host "  - POST /api/ai/free/query      - Realizar consulta médica" -ForegroundColor Gray
    Write-Host "  - POST /api/ai/free/stream     - Consulta con streaming" -ForegroundColor Gray
    Write-Host "  - POST /api/ai/free/install/{model} - Instalar nuevo modelo" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Caracteristicas para administradores:" -ForegroundColor Yellow
    Write-Host "  - Monitoreo de uso de IA en tiempo real" -ForegroundColor Gray
    Write-Host "  - Estadisticas de consultas y modelos" -ForegroundColor Gray
    Write-Host "  - Gestion de modelos de IA" -ForegroundColor Gray
    Write-Host "  - Logs de consultas medicas" -ForegroundColor Gray
    Write-Host "  - Configuracion de seguridad" -ForegroundColor Gray
    Write-Host ""
}

# Función principal
function Main {
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host "🤖 SMD VITAL - Prueba IA Administración" -ForegroundColor Magenta
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host ""
    
    # Verificar servicios
    if (-not (Test-Services)) {
        Write-Error "Algunos servicios no están disponibles. Asegúrate de ejecutar:"
        Write-Error "docker-compose up -d ollama ai-langgraph nginx"
        exit 1
    }
    
    Write-Host ""
    
    # Verificar configuración de rutas
    Test-RouteConfiguration
    
    Write-Host ""
    
    # Probar endpoints de IA
    Test-AdminAIEndpoints
    
    # Mostrar información de acceso
    Show-AccessInfo
    
    Write-Success "🎉 ¡Prueba de IA para administradores completada!"
    Write-Status "Ahora puedes acceder al panel de administración en http://localhost:3001/admin/ai"
}

# Ejecutar función principal
Main
