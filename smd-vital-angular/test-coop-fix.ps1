# Script de prueba para verificar la solución de COOP
# Ejecutar después de implementar los cambios

Write-Host "🧪 Probando solución de COOP para Google OAuth..." -ForegroundColor Green

# Verificar que Docker esté ejecutándose
Write-Host "📋 Verificando Docker..." -ForegroundColor Blue
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar que docker-compose esté disponible
Write-Host "📋 Verificando Docker Compose..." -ForegroundColor Blue
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose encontrado: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose no está disponible" -ForegroundColor Red
    exit 1
}

# Construir la imagen
Write-Host "🔨 Construyendo imagen Docker..." -ForegroundColor Blue
docker-compose build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Imagen construida exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al construir la imagen" -ForegroundColor Red
    exit 1
}

# Iniciar el contenedor
Write-Host "🐳 Iniciando contenedor..." -ForegroundColor Blue
docker-compose up -d

# Esperar a que el contenedor esté listo
Write-Host "⏳ Esperando a que el contenedor esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar que el contenedor esté ejecutándose
Write-Host "📋 Verificando estado del contenedor..." -ForegroundColor Blue
$containerStatus = docker-compose ps
Write-Host $containerStatus

# Probar la aplicación
Write-Host "🌐 Probando la aplicación..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Aplicación respondiendo correctamente" -ForegroundColor Green
        Write-Host "🔗 URL: http://localhost:3001" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Aplicación respondió con código: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ No se pudo conectar a la aplicación: $($_.Exception.Message)" -ForegroundColor Red
}

# Verificar logs del contenedor
Write-Host "📋 Verificando logs del contenedor..." -ForegroundColor Blue
$logs = docker-compose logs --tail=20 smd-vital-angular
Write-Host $logs

Write-Host "`n🎉 Prueba completada!" -ForegroundColor Green
Write-Host "📝 Para detener el contenedor, ejecuta: docker-compose down" -ForegroundColor Yellow
Write-Host "🔍 Para ver logs en tiempo real: docker-compose logs -f" -ForegroundColor Yellow
