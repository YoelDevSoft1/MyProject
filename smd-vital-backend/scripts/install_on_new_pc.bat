@echo off
REM SMD Vital - Script de Instalación en Nueva PC (Windows)
REM ======================================================

echo 🚀 Instalando SMD Vital en nueva PC...
echo 📅 Fecha: %date% %time%

REM Verificar Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker no está instalado
    echo 📥 Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Verificar Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker Compose no está instalado
    pause
    exit /b 1
)

echo ✅ Docker encontrado
echo ✅ Docker Compose encontrado

REM Crear archivo .env si no existe
if not exist ".env" (
    echo 📝 Creando archivo .env...
    copy env.example .env
    echo ✅ Archivo .env creado desde env.example
) else (
    echo ✅ Archivo .env ya existe
)

REM Verificar que existe el backup
if not exist "smdvital_complete_backup_20250927_000353.sql" (
    echo ❌ Error: No se encontró el archivo de backup
    echo 📁 Buscando archivo de backup...
    dir /s *backup*.sql
    echo.
    echo 📁 Asegúrate de que el archivo 'smdvital_complete_backup_20250927_000353.sql' esté en este directorio
    echo 📁 O copia el archivo desde la ubicación mostrada arriba
    pause
    exit /b 1
)

echo ✅ Archivo de backup encontrado

REM Iniciar solo PostgreSQL primero
echo 🐘 Iniciando PostgreSQL...
docker-compose up -d postgres

REM Esperar a que PostgreSQL esté listo
echo ⏳ Esperando a que PostgreSQL esté listo...
timeout /t 30 /nobreak >nul

REM Verificar que PostgreSQL está funcionando
echo 🔍 Verificando PostgreSQL...
for /l %%i in (1,1,10) do (
    docker exec smd_vital_postgres pg_isready -U smdvital >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ PostgreSQL está listo
        goto :restore_db
    ) else (
        echo ⏳ Esperando... (%%i/10)
        timeout /t 10 /nobreak >nul
    )
)

:restore_db
REM Restaurar la base de datos
echo 📦 Restaurando base de datos...
docker exec -i smd_vital_postgres psql -U smdvital < smdvital_complete_backup_20250927_000353.sql

if %errorlevel% equ 0 (
    echo ✅ Base de datos restaurada exitosamente
) else (
    echo ❌ Error al restaurar la base de datos
    pause
    exit /b 1
)

REM Iniciar todos los servicios
echo 🚀 Iniciando todos los servicios...
docker-compose up -d

REM Esperar a que todos los servicios estén listos
echo ⏳ Esperando a que todos los servicios estén listos...
timeout /t 60 /nobreak >nul

REM Verificar servicios
echo 🔍 Verificando servicios...
docker-compose ps

echo.
echo 🎉 ¡Instalación completada!
echo.
echo 📊 Servicios disponibles:
echo   - API Gateway: http://localhost:8000
echo   - PostgreSQL: localhost:5432 (smdvital/smdvital_password_2024)
echo   - Grafana: http://localhost:3005 (admin/smdvital_grafana_2024)
echo   - RabbitMQ: http://localhost:15672 (smdvital/rabbitmq_password_2024)
echo.
echo 🔧 Para verificar el estado:
echo   docker-compose ps
echo   docker-compose logs [servicio]

pause
