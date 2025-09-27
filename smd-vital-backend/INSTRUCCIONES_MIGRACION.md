# 🚀 Instrucciones para Migrar SMD Vital a Otra PC

## 📋 Requisitos en la PC Destino:
- Windows 10/11
- Docker Desktop instalado y funcionando
- Al menos 8GB de RAM disponible
- 20GB de espacio libre en disco
- Conexión a internet

## 📁 Archivos que Debes Copiar:

### **Archivos Principales:**
```
smd-vital-backend/
├── smdvital_complete_backup_20250927_000353.sql  ← ¡IMPORTANTE!
├── docker-compose.yml
├── env.example
├── requirements.txt
├── INSTALAR_EN_OTRA_PC.bat
├── INSTRUCCIONES_MIGRACION.md
└── scripts/
    ├── install_on_new_pc.bat
    └── install_on_new_pc.sh
```

### **Carpetas Completas:**
```
smd-vital-backend/
├── services/          ← Carpeta completa
├── config/           ← Carpeta completa
├── infrastructure/   ← Carpeta completa (opcional)
└── shared/          ← Carpeta completa (opcional)
```

## 🔧 Proceso de Instalación en la Nueva PC:

### **Paso 1: Preparar la Nueva PC**
1. Instalar Docker Desktop desde: https://www.docker.com/products/docker-desktop
2. Reiniciar la computadora
3. Verificar que Docker funciona: `docker --version`

### **Paso 2: Copiar Archivos**
1. Crear carpeta: `C:\SMD_VITAL\`
2. Copiar todos los archivos mencionados arriba
3. Verificar que el archivo de backup esté presente

### **Paso 3: Instalación Automática**
1. Abrir PowerShell como Administrador
2. Navegar a la carpeta: `cd "C:\SMD_VITAL"`
3. Ejecutar: `.\INSTALAR_EN_OTRA_PC.bat`

### **Paso 4: Verificación**
1. Esperar 5-10 minutos para que todos los servicios se inicien
2. Verificar: `docker-compose ps`
3. Probar acceso: http://localhost:8000

## 🔑 Credenciales por Defecto:

### **PostgreSQL:**
- Host: localhost:5432
- Usuario: smdvital
- Contraseña: smdvital_password_2024

### **Grafana:**
- URL: http://localhost:3005
- Usuario: admin
- Contraseña: smdvital_grafana_2024

### **RabbitMQ:**
- URL: http://localhost:15672
- Usuario: smdvital
- Contraseña: rabbitmq_password_2024

## 🆘 Solución de Problemas:

### **Si Docker no inicia:**
- Verificar que la virtualización esté habilitada en BIOS
- Reiniciar Docker Desktop
- Ejecutar como administrador

### **Si los servicios no arrancan:**
```powershell
# Ver logs de un servicio específico
docker-compose logs postgres
docker-compose logs auth-service

# Reiniciar servicios
docker-compose restart

# Ver estado de todos los servicios
docker-compose ps
```

### **Si la base de datos no se restaura:**
```powershell
# Verificar que PostgreSQL esté funcionando
docker exec smd_vital_postgres pg_isready -U smdvital

# Restaurar manualmente
Get-Content "smdvital_complete_backup_20250927_000353.sql" | docker exec -i smd_vital_postgres psql -U smdvital
```

## 📞 Soporte:
Si tienes problemas, revisa los logs y verifica que todos los archivos estén copiados correctamente.
