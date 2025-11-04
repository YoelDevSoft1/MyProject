# 🔧 Guía para Configurar pgAdmin en Otra Computadora

## 📋 Problema Común
Docker está funcionando pero pgAdmin no puede ver la base de datos o el servidor aparece en blanco.

## 🔍 Diagnóstico

### **Paso 1: Verificar Docker**
```powershell
# Verificar que PostgreSQL está ejecutándose
docker ps | findstr postgres

# Verificar que PostgreSQL responde
docker exec smd_vital_postgres pg_isready -U smdvital
```

### **Paso 2: Verificar Base de Datos**
```powershell
# Listar bases de datos
docker exec smd_vital_postgres psql -U smdvital -c "\l"

# Verificar base de datos específica
docker exec smd_vital_postgres psql -U smdvital -d smdvital -c "SELECT current_database();"
```

## 🔧 Soluciones

### **Solución 1: Usar Script de Verificación**
1. Ejecutar: `.\VERIFICAR_BASE_DATOS.bat`
2. Seguir las instrucciones que aparezcan

### **Solución 2: Configurar pgAdmin Correctamente**

#### **Opción A: pgAdmin Web (Docker)**
1. **Iniciar pgAdmin en Docker:**
   ```powershell
   docker run -d --name pgadmin -p 5050:80 -e PGADMIN_DEFAULT_EMAIL=admin@admin.com -e PGADMIN_DEFAULT_PASSWORD=admin dpage/pgadmin4
   ```

2. **Acceder a pgAdmin:**
   - URL: http://localhost:5050
   - Email: admin@admin.com
   - Password: admin

3. **Agregar servidor:**
   - Host: `host.docker.internal` (para Docker)
   - Puerto: 5432
   - Usuario: smdvital
   - Contraseña: smdvital_password_2024

#### **Opción B: pgAdmin Desktop**
1. **Instalar pgAdmin Desktop** desde: https://www.pgadmin.org/download/
2. **Crear nueva conexión:**
   - Name: SMD Vital Database
   - Host: localhost
   - Port: 5432
   - Maintenance database: smdvital
   - Username: smdvital
   - Password: smdvital_password_2024

### **Solución 3: Verificar Puertos**

#### **Verificar que el puerto 5432 esté abierto:**
```powershell
netstat -an | findstr :5432
```

#### **Si el puerto no está abierto:**
```powershell
# Reiniciar PostgreSQL
docker-compose restart postgres

# O reiniciar todos los servicios
docker-compose restart
```

### **Solución 4: Crear Base de Datos si No Existe**

```powershell
# Crear base de datos
docker exec smd_vital_postgres psql -U smdvital -c "CREATE DATABASE smdvital;"

# Restaurar datos si es necesario
Get-Content "smdvital_complete_backup_20250927_000353.sql" | docker exec -i smd_vital_postgres psql -U smdvital
```

## 🔑 Credenciales Correctas

### **PostgreSQL:**
- **Host:** localhost (o 127.0.0.1)
- **Puerto:** 5432
- **Usuario:** smdvital
- **Contraseña:** smdvital_password_2024
- **Base de datos:** smdvital

### **pgAdmin (si está en Docker):**
- **URL:** http://localhost:5050
- **Email:** admin@admin.com
- **Password:** admin

## 🆘 Solución de Problemas

### **Error: "Connection refused"**
- Verificar que Docker esté ejecutándose
- Verificar que PostgreSQL esté ejecutándose
- Verificar que el puerto 5432 esté abierto

### **Error: "Authentication failed"**
- Verificar usuario y contraseña
- Verificar que la base de datos existe

### **Error: "Database does not exist"**
- Crear la base de datos manualmente
- Restaurar desde backup

### **pgAdmin muestra servidor en blanco**
- Verificar configuración de red
- Usar `host.docker.internal` en lugar de `localhost`
- Verificar que el puerto esté correcto

## 📞 Comandos de Diagnóstico

```powershell
# Verificar estado de Docker
docker ps

# Verificar logs de PostgreSQL
docker-compose logs postgres

# Verificar conexión a PostgreSQL
docker exec smd_vital_postgres psql -U smdvital -c "SELECT version();"

# Verificar bases de datos
docker exec smd_vital_postgres psql -U smdvital -c "\l"

# Verificar tablas
docker exec smd_vital_postgres psql -U smdvital -d smdvital -c "\dt"
```



