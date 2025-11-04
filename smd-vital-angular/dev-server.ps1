# Script de desarrollo para SMD VITAL Angular con Docker en Windows
# Este script reconstruye la aplicación cuando hay cambios

Write-Host "🚀 Iniciando servidor de desarrollo SMD VITAL Angular..." -ForegroundColor Green

# Función para limpiar contenedores
function Cleanup {
    Write-Host "🧹 Limpiando contenedores..." -ForegroundColor Yellow
    docker-compose down
    exit 0
}

# Capturar Ctrl+C
$null = Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

try {
    # Construir y ejecutar el contenedor
    Write-Host "🔨 Construyendo imagen Docker..." -ForegroundColor Blue
    docker-compose build

    Write-Host "🐳 Iniciando contenedor..." -ForegroundColor Blue
    Write-Host "📱 La aplicación estará disponible en: http://localhost:3001" -ForegroundColor Green
    Write-Host "🔧 Para detener el servidor, presiona Ctrl+C" -ForegroundColor Yellow
    
    docker-compose up
}
catch {
    Write-Host "❌ Error al ejecutar el servidor de desarrollo: $($_.Exception.Message)" -ForegroundColor Red
    Cleanup
}
