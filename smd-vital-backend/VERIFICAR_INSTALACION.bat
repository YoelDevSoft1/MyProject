@echo off
REM SMD Vital - Verificación de Instalación
REM ========================================

echo 🔍 Verificando instalación de SMD Vital...
echo 📅 Fecha: %date% %time%
echo.

REM Verificar Docker
echo 🔍 Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado o no funciona
    exit /b 1
)
echo ✅ Docker: OK

REM Verificar Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose no está disponible
    exit /b 1
)
echo ✅ Docker Compose: OK

REM Verificar archivos necesarios
echo 🔍 Verificando archivos necesarios...
if not exist "docker-compose.yml" (
    echo ❌ docker-compose.yml no encontrado
    exit /b 1
)
echo ✅ docker-compose.yml: OK

if not exist ".env" (
    echo ❌ .env no encontrado
    exit /b 1
)
echo ✅ .env: OK

REM Verificar contenedores
echo 🔍 Verificando contenedores...
docker-compose ps

echo.
echo 🔍 Verificando servicios específicos...

REM Verificar PostgreSQL
echo 🔍 PostgreSQL...
docker exec smd_vital_postgres pg_isready -U smdvital >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL: OK
) else (
    echo ❌ PostgreSQL: No responde
)

REM Verificar Redis
echo 🔍 Redis...
docker exec smd_vital_redis redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis: OK
) else (
    echo ❌ Redis: No responde
)

REM Verificar RabbitMQ
echo 🔍 RabbitMQ...
docker exec smd_vital_rabbitmq rabbitmq-diagnostics ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ RabbitMQ: OK
) else (
    echo ❌ RabbitMQ: No responde
)

echo.
echo 🌐 Probando acceso a servicios web...

REM Probar API Gateway
echo 🔍 API Gateway (http://localhost:8000)...
curl -s http://localhost:8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API Gateway: OK
) else (
    echo ❌ API Gateway: No responde
)

REM Probar Grafana
echo 🔍 Grafana (http://localhost:3005)...
curl -s http://localhost:3005 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Grafana: OK
) else (
    echo ❌ Grafana: No responde
)

echo.
echo 📊 Resumen de verificación completado
echo.
echo 🔧 Si hay errores, ejecuta:
echo   docker-compose logs [servicio]
echo   docker-compose restart [servicio]

pause
