# Script de Verificación de Servicios SMD VITAL
# =============================================

Write-Host "🔐 VERIFICANDO SERVICIOS SMD VITAL..." -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue
Write-Host ""

# Función para verificar servicio
function Test-Service {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Port
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Name (Puerto $Port): SALUDABLE" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $Name (Puerto $Port): ERROR - Status $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $Name (Puerto $Port): NO DISPONIBLE - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Verificar servicios principales
Write-Host "🔐 SERVICIOS DE AUTENTICACIÓN:" -ForegroundColor Yellow
Test-Service "Auth Service" "http://localhost:8001/health" "8001"
Test-Service "User Service" "http://localhost:8002/health" "8002"

Write-Host ""
Write-Host "📅 SERVICIOS DE CITAS:" -ForegroundColor Yellow
Test-Service "Appointment Service" "http://localhost:8003/health" "8003"

Write-Host ""
Write-Host "🔔 SERVICIOS DE NOTIFICACIONES:" -ForegroundColor Yellow
Test-Service "Notification Service" "http://localhost:8004/health" "8004"

Write-Host ""
Write-Host "🏥 SERVICIOS MÉDICOS:" -ForegroundColor Yellow
Test-Service "Medical Records Service" "http://localhost:8005/health" "8005"
Test-Service "Health Metrics Service" "http://localhost:8007/health" "8007"

Write-Host ""
Write-Host "💳 SERVICIOS DE PAGOS:" -ForegroundColor Yellow
Test-Service "Payment Service" "http://localhost:8006/health" "8006"

Write-Host ""
Write-Host "🤖 SERVICIOS DE IA:" -ForegroundColor Yellow
Test-Service "AI LangGraph Service" "http://localhost:8008/health" "8008"

Write-Host ""
Write-Host "🌐 API GATEWAY:" -ForegroundColor Yellow
Test-Service "Nginx Gateway" "http://localhost:8000/health" "8000"

Write-Host ""
Write-Host "📊 SERVICIOS DE MONITOREO:" -ForegroundColor Yellow
Test-Service "Prometheus" "http://localhost:9090/-/healthy" "9090"
Test-Service "Grafana" "http://localhost:3005/api/health" "3005"
Test-Service "Jaeger" "http://localhost:16686" "16686"
Test-Service "Kibana" "http://localhost:5601/api/status" "5601"
Test-Service "Elasticsearch" "http://localhost:9200/_cluster/health" "9200"

Write-Host ""
Write-Host "🔧 SERVICIOS DE TAREAS:" -ForegroundColor Yellow
Test-Service "Flower (Celery Monitor)" "http://localhost:5555" "5555"

Write-Host ""
Write-Host "🗄️ SERVICIOS DE BASE DE DATOS:" -ForegroundColor Yellow
Write-Host "PostgreSQL: Verificando conexión..." -ForegroundColor Cyan
try {
    $pgTest = docker exec smd_vital_postgres pg_isready -U smdvital -d smdvital
    if ($pgTest -match "accepting connections") {
        Write-Host "✅ PostgreSQL: SALUDABLE" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL: ERROR" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ PostgreSQL: NO DISPONIBLE" -ForegroundColor Red
}

Write-Host ""
Write-Host "Redis: Verificando conexión..." -ForegroundColor Cyan
try {
    $redisTest = docker exec smd_vital_redis redis-cli ping
    if ($redisTest -match "PONG") {
        Write-Host "✅ Redis: SALUDABLE" -ForegroundColor Green
    } else {
        Write-Host "❌ Redis: ERROR" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Redis: NO DISPONIBLE" -ForegroundColor Red
}

Write-Host ""
Write-Host "RabbitMQ: Verificando conexión..." -ForegroundColor Cyan
try {
    $rabbitTest = docker exec smd_vital_rabbitmq rabbitmq-diagnostics ping
    if ($rabbitTest -match "pong") {
        Write-Host "✅ RabbitMQ: SALUDABLE" -ForegroundColor Green
    } else {
        Write-Host "❌ RabbitMQ: ERROR" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ RabbitMQ: NO DISPONIBLE" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 VERIFICACIÓN COMPLETADA!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 RESUMEN DE ACCESOS:" -ForegroundColor Blue
Write-Host "=====================" -ForegroundColor Blue
Write-Host "🌐 API Gateway: http://localhost:8000" -ForegroundColor White
Write-Host "🔐 Auth Service: http://localhost:8001" -ForegroundColor White
Write-Host "👥 User Service: http://localhost:8002" -ForegroundColor White
Write-Host "📅 Appointment Service: http://localhost:8003" -ForegroundColor White
Write-Host "🔔 Notification Service: http://localhost:8004" -ForegroundColor White
Write-Host "🏥 Medical Records Service: http://localhost:8005" -ForegroundColor White
Write-Host "💳 Payment Service: http://localhost:8006" -ForegroundColor White
Write-Host "📊 Health Metrics Service: http://localhost:8007" -ForegroundColor White
Write-Host "🤖 AI LangGraph Service: http://localhost:8008" -ForegroundColor White
Write-Host ""
Write-Host "📊 MONITOREO:" -ForegroundColor Blue
Write-Host "=============" -ForegroundColor Blue
Write-Host "📈 Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "📊 Grafana: http://localhost:3005" -ForegroundColor White
Write-Host "🔍 Jaeger: http://localhost:16686" -ForegroundColor White
Write-Host "📋 Kibana: http://localhost:5601" -ForegroundColor White
Write-Host "🔧 Flower: http://localhost:5555" -ForegroundColor White
Write-Host ""
Write-Host "🗄️ BASE DE DATOS:" -ForegroundColor Blue
Write-Host "=================" -ForegroundColor Blue
Write-Host "🐘 PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "🔴 Redis: localhost:6379" -ForegroundColor White
Write-Host "🐰 RabbitMQ: localhost:5672 (Management: http://localhost:15672)" -ForegroundColor White

