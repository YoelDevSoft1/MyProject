#!/bin/bash
# SMD Vital - Database Backup Script
# ==================================

# Configuración
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="smd_vital_postgres"
DB_USER="smdvital"
DB_NAME="smdvital"

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

echo "🔄 Iniciando backup de la base de datos SMD Vital..."
echo "📅 Fecha: $(date)"
echo "📁 Directorio: $BACKUP_DIR"

# Backup completo (todas las bases de datos)
echo "📦 Creando backup completo..."
docker exec $CONTAINER_NAME pg_dumpall -U $DB_USER > "$BACKUP_DIR/smdvital_complete_$DATE.sql"

# Backup de la base principal
echo "📦 Creando backup de la base principal..."
docker exec $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/smdvital_main_$DATE.sql"

# Backup en formato personalizado (más eficiente)
echo "📦 Creando backup personalizado..."
docker exec $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME -Fc > "$BACKUP_DIR/smdvital_custom_$DATE.backup"

# Comprimir backups
echo "🗜️ Comprimiendo archivos..."
gzip "$BACKUP_DIR/smdvital_complete_$DATE.sql"
gzip "$BACKUP_DIR/smdvital_main_$DATE.sql"

echo "✅ Backup completado exitosamente!"
echo "📁 Archivos creados:"
ls -lh $BACKUP_DIR/*$DATE*

echo ""
echo "🔧 Para restaurar en otra instalación:"
echo "1. Copia los archivos a la nueva máquina"
echo "2. Ejecuta: docker exec -i smd_vital_postgres psql -U smdvital < smdvital_complete_$DATE.sql.gz"
echo "3. O usa: docker exec -i smd_vital_postgres pg_restore -U smdvital -d smdvital smdvital_custom_$DATE.backup"
