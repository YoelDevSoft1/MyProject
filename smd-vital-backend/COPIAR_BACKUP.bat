@echo off
REM SMD Vital - Copiar Archivo de Backup
REM ====================================

echo 📦 Copiando archivo de backup de SMD Vital...
echo 📅 Fecha: %date% %time%
echo.

REM Buscar el archivo de backup en esta PC
echo 🔍 Buscando archivo de backup en esta PC...
set BACKUP_SOURCE=

REM Buscar en el directorio actual
for %%i in (*backup*.sql) do (
    set BACKUP_SOURCE=%%i
    echo ✅ Encontrado: %%i
    goto :found_source
)

REM Buscar en subdirectorios
for /r . %%i in (*backup*.sql) do (
    set BACKUP_SOURCE=%%i
    echo ✅ Encontrado: %%i
    goto :found_source
)

echo ❌ No se encontró archivo de backup en esta PC
echo 📁 Busca manualmente el archivo que termine en 'backup.sql'
pause
exit /b 1

:found_source
echo ✅ Archivo fuente: %BACKUP_SOURCE%
echo.

REM Preguntar dónde copiar
echo 📁 ¿Dónde quieres copiar el archivo de backup?
echo.
echo 1. Carpeta actual (recomendado)
echo 2. Especificar ruta personalizada
echo 3. Cancelar
echo.
set /p choice="Selecciona una opción (1-3): "

if "%choice%"=="1" goto :copy_current
if "%choice%"=="2" goto :copy_custom
if "%choice%"=="3" goto :cancel
goto :invalid_choice

:copy_current
echo 📁 Copiando a carpeta actual...
copy "%BACKUP_SOURCE%" "smdvital_complete_backup_20250927_000353.sql"
if %errorlevel% equ 0 (
    echo ✅ Archivo copiado exitosamente
    echo 📁 Ubicación: %cd%\smdvital_complete_backup_20250927_000353.sql
) else (
    echo ❌ Error al copiar el archivo
)
goto :end

:copy_custom
set /p custom_path="Ingresa la ruta completa donde copiar: "
echo 📁 Copiando a: %custom_path%
copy "%BACKUP_SOURCE%" "%custom_path%\smdvital_complete_backup_20250927_000353.sql"
if %errorlevel% equ 0 (
    echo ✅ Archivo copiado exitosamente
    echo 📁 Ubicación: %custom_path%\smdvital_complete_backup_20250927_000353.sql
) else (
    echo ❌ Error al copiar el archivo
)
goto :end

:cancel
echo ❌ Operación cancelada
goto :end

:invalid_choice
echo ❌ Opción inválida
goto :end

:end
echo.
echo 🔧 Ahora puedes ejecutar INSTALAR_EN_OTRA_PC.bat
pause




