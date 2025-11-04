@echo off
REM SMD Vital - Instalación en Otra PC
REM ==================================

echo 🚀 Instalando SMD Vital en Nueva PC...
echo 📅 Fecha: %date% %time%
echo.

REM Verificar Docker
echo 🔍 Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker no está instalado o no está funcionando
    echo 📥 Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
    echo 🔄 Reinicia la computadora después de instalar Docker
    pause
    exit /b 1
)

echo ✅ Docker encontrado: 
docker --version

REM Verificar Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker Compose no está disponible
    echo 🔄 Actualiza Docker Desktop a la versión más reciente
    pause
    exit /b 1
)

echo ✅ Docker Compose encontrado: 
docker-compose --version
echo.

REM Buscar archivo de backup
echo 🔍 Buscando archivo de backup...
set BACKUP_FILE=

REM Buscar en el directorio actual
for %%i in (*backup*.sql) do (
    set BACKUP_FILE=%%i
    echo ✅ Encontrado en directorio actual: %%i
    goto :found_backup
)

REM Buscar en subdirectorios
for /r . %%i in (*backup*.sql) do (
    set BACKUP_FILE=%%i
    echo ✅ Encontrado en subdirectorio: %%i
    goto :found_backup
)

REM Buscar archivos .sql que contengan "backup" en el nombre
for /r . %%i in (*backup*.sql) do (
    set BACKUP_FILE=%%i
    echo ✅ Encontrado archivo de backup: %%i
    goto :found_backup
)

REM Buscar cualquier archivo .sql
for /r . %%i in (*.sql) do (
    set BACKUP_FILE=%%i
    echo ✅ Encontrado archivo SQL: %%i
    echo ⚠️  Usando este archivo como backup
    goto :found_backup
)

echo ❌ No se encontró archivo de backup
echo 📁 Archivos .sql encontrados en esta carpeta:
dir /s *.sql 2>nul
echo.
echo 📁 Busca manualmente un archivo que termine en 'backup.sql'
echo 📁 O copia el archivo 'smdvital_complete_backup_20250927_000353.sql' a esta carpeta
pause
exit /b 1

:found_backup
echo ✅ Archivo de backup: %BACKUP_FILE%
echo.

REM Crear archivo .env si no existe
if not exist ".env" (
    echo 📝 Creando archivo .env...
    if exist "env.example" (
        copy env.example .env
        echo ✅ Archivo .env creado desde env.example
    ) else (
        echo ❌ No se encontró env.example
        echo 📁 Asegúrate de que todos los archivos estén copiados
        pause
        exit /b 1
    )
) else (
    echo ✅ Archivo .env ya existe
)

REM Verificar docker-compose.yml
if not exist "docker-compose.yml" (
    echo ❌ No se encontró docker-compose.yml
    echo 📁 Asegúrate de que todos los archivos estén copiados
    pause
    exit /b 1
)

echo ✅ docker-compose.yml encontrado
echo.

REM Detener contenedores existentes (si los hay)
echo 🛑 Deteniendo contenedores existentes...
docker-compose down >nul 2>&1

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

echo ❌ PostgreSQL no está respondiendo después de 100 segundos
echo 🔧 Intenta reiniciar Docker Desktop y ejecutar nuevamente
pause
exit /b 1

:restore_db
REM Restaurar base de datos
echo 📦 Restaurando base de datos...
echo 📁 Usando archivo: %BACKUP_FILE%
Get-Content "%BACKUP_FILE%" | docker exec -i smd_vital_postgres psql -U smdvital

if %errorlevel% equ 0 (
    echo ✅ Base de datos restaurada exitosamente
) else (
    echo ❌ Error al restaurar la base de datos
    echo 🔧 Intenta ejecutar manualmente:
    echo    Get-Content "%BACKUP_FILE%" ^| docker exec -i smd_vital_postgres psql -U smdvital
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
echo 🔧 Comandos útiles:
echo   - Ver estado: docker-compose ps
echo   - Ver logs: docker-compose logs [servicio]
echo   - Reiniciar: docker-compose restart
echo   - Detener: docker-compose down
echo   - Iniciar: docker-compose up -d
echo.
echo 📋 Para pgAdmin:
echo   - Host: localhost
echo   - Puerto: 5432
echo   - Usuario: smdvital
echo   - Contraseña: smdvital_password_2024
echo   - Base de datos: smdvital

pause
