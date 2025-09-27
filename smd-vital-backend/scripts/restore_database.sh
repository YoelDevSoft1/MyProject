#!/bin/bash
# SMD Vital - Database Restore Script
# ===================================

# Configuración
CONTAINER_NAME="smd_vital_postgres"
DB_USER="smdvital"
DB_NAME="smdvital"

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo "❌ Error: Debes especificar el archivo de backup"
    echo "Uso: $0 <archivo_backup>"
    echo "Ejemplos:"
    echo "  $0 smdvital_complete_20241201_143022.sql"
    echo "  $0 smdvital_custom_20241201_143022.backup"
    exit 1
fi

BACKUP_FILE=$1

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: El archivo $BACKUP_FILE no existe"
    exit 1
fi

echo "🔄 Iniciando restauración de la base de datos SMD Vital..."
echo "📅 Fecha: $(date)"
echo "📁 Archivo: $BACKUP_FILE"

# Verificar que el contenedor está ejecutándose
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ Error: El contenedor $CONTAINER_NAME no está ejecutándose"
    echo "Ejecuta: docker-compose up -d postgres"
    exit 1
fi

# Determinar el tipo de archivo y restaurar
if [[ $BACKUP_FILE == *.backup ]]; then
    echo "📦 Restaurando backup personalizado..."
    docker exec -i $CONTAINER_NAME pg_restore -U $DB_USER -d $DB_NAME < $BACKUP_FILE
elif [[ $BACKUP_FILE == *.sql ]]; then
    echo "📦 Restaurando backup SQL..."
    docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < $BACKUP_FILE
elif [[ $BACKUP_FILE == *.sql.gz ]]; then
    echo "📦 Restaurando backup SQL comprimido..."
    gunzip -c $BACKUP_FILE | docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME
else
    echo "❌ Error: Formato de archivo no soportado"
    echo "Formatos soportados: .sql, .backup, .sql.gz"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo "✅ Restauración completada exitosamente!"
    echo "🔍 Verificando conexión..."
    docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';"
else
    echo "❌ Error durante la restauración"
    exit 1
fi
