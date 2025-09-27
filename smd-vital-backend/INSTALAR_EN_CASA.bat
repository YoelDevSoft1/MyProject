@echo off
REM SMD Vital - Instalación Simple en PC de Casa
REM ============================================

echo 🚀 Instalando SMD Vital en PC de Casa...
echo 📅 Fecha: %date% %time%
echo.

REM Verificar Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker no está instalado
    echo 📥 Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker encontrado

REM Buscar archivo de backup
echo 🔍 Buscando archivo de backup...
for /r . %%i in (*backup*.sql) do (
    set BACKUP_FILE=%%i
    echo ✅ Encontrado: %%i
    goto :found_backup
)

echo ❌ No se encontró archivo de backup
echo 📁 Busca manualmente un archivo que termine en 'backup.sql'
pause
exit /b 1

:found_backup
echo ✅ Archivo de backup: %BACKUP_FILE%

REM Crear archivo .env si no existe
if not exist ".env" (
    echo 📝 Creando archivo .env...
    if exist "env.example" (
        copy env.example .env
        echo ✅ Archivo .env creado
    ) else (
        echo ❌ No se encontró env.example
        pause
        exit /b 1
    )
) else (
    echo ✅ Archivo .env ya existe
)

REM Iniciar PostgreSQL
echo 🐘 Iniciando PostgreSQL...
docker-compose up -d postgres

REM Esperar
echo ⏳ Esperando a que PostgreSQL esté listo...
timeout /t 30 /nobreak >nul

REM Verificar PostgreSQL
echo 🔍 Verificando PostgreSQL...
docker exec smd_vital_postgres pg_isready -U smdvital >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL no está listo, esperando más...
    timeout /t 30 /nobreak >nul
)

REM Restaurar base de datos
echo 📦 Restaurando base de datos...
echo 📁 Usando archivo: %BACKUP_FILE%
docker exec -i smd_vital_postgres psql -U smdvital < "%BACKUP_FILE%"

if %errorlevel% equ 0 (
    echo ✅ Base de datos restaurada exitosamente
) else (
    echo ❌ Error al restaurar la base de datos
    echo 🔧 Intenta ejecutar manualmente:
    echo    docker exec -i smd_vital_postgres psql -U smdvital ^< "%BACKUP_FILE%"
    pause
    exit /b 1
)

REM Iniciar todos los servicios
echo 🚀 Iniciando todos los servicios...
docker-compose up -d

REM Esperar
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
echo   - PostgreSQL: localhost:5432
echo     Usuario: smdvital
echo     Contraseña: smdvital_password_2024
echo   - Grafana: http://localhost:3005
echo     Usuario: admin
echo     Contraseña: smdvital_grafana_2024
echo   - RabbitMQ: http://localhost:15672
echo     Usuario: smdvital
echo     Contraseña: rabbitmq_password_2024
echo.
echo 🔧 Para verificar el estado:
echo   docker-compose ps
echo   docker-compose logs [servicio]

pause
