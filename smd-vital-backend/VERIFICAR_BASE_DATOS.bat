@echo off
REM SMD Vital - Verificar Base de Datos
REM ===================================

echo 🔍 Verificando base de datos SMD Vital...
echo 📅 Fecha: %date% %time%
echo.

REM Verificar que PostgreSQL está ejecutándose
echo 🔍 Verificando PostgreSQL...
docker exec smd_vital_postgres pg_isready -U smdvital >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL no está ejecutándose
    echo 🔧 Iniciando PostgreSQL...
    docker-compose up -d postgres
    timeout /t 30 /nobreak >nul
) else (
    echo ✅ PostgreSQL está ejecutándose
)

REM Listar todas las bases de datos
echo 🔍 Listando bases de datos disponibles...
docker exec smd_vital_postgres psql -U smdvital -c "\l"

echo.
echo 🔍 Verificando base de datos 'smdvital'...
docker exec smd_vital_postgres psql -U smdvital -d smdvital -c "SELECT current_database(), current_user;" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Base de datos 'smdvital' existe y es accesible
) else (
    echo ❌ Base de datos 'smdvital' no existe o no es accesible
    echo 🔧 Creando base de datos 'smdvital'...
    docker exec smd_vital_postgres psql -U smdvital -c "CREATE DATABASE smdvital;"
    if %errorlevel% equ 0 (
        echo ✅ Base de datos 'smdvital' creada exitosamente
    ) else (
        echo ❌ Error al crear la base de datos
    )
)

echo.
echo 🔍 Verificando tablas en la base de datos...
docker exec smd_vital_postgres psql -U smdvital -d smdvital -c "\dt"

echo.
echo 📊 Información de conexión para pgAdmin:
echo   - Host: localhost
echo   - Puerto: 5432
echo   - Usuario: smdvital
echo   - Contraseña: smdvital_password_2024
echo   - Base de datos: smdvital
echo.
echo 🔧 Si pgAdmin no puede conectar:
echo   1. Verifica que Docker esté ejecutándose
echo   2. Verifica que el puerto 5432 esté abierto
echo   3. Prueba con 127.0.0.1 en lugar de localhost
echo   4. Verifica las credenciales

pause



