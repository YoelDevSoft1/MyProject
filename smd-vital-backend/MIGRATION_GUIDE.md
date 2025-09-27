# 🚀 Guía de Migración SMD Vital
## Migrar proyecto completo a otra PC

### 📋 Requisitos Previos en la PC Destino:
- Docker Desktop instalado
- Git instalado (opcional)
- Al menos 8GB de RAM disponible
- 20GB de espacio libre en disco

### 🔄 Proceso de Migración:

#### **1. Copiar Archivos Necesarios:**
Copia estos archivos/folders a la nueva PC:
```
smd-vital-backend/
├── docker-compose.yml
├── .env (si existe)
├── scripts/
├── services/
├── config/
├── requirements.txt
├── smdvital_complete_backup_20250927_000353.sql
└── MIGRATION_GUIDE.md
```

#### **2. En la PC Destino:**

**a) Crear archivo .env:**
```bash
# Copia el contenido del archivo .env.example y actualiza las credenciales
cp env.example .env
```

**b) Iniciar solo PostgreSQL primero:**
```bash
docker-compose up -d postgres
```

**c) Esperar a que PostgreSQL esté listo:**
```bash
docker-compose logs postgres
```

**d) Restaurar la base de datos:**
```bash
docker exec -i smd_vital_postgres psql -U smdvital < smdvital_complete_backup_20250927_000353.sql
```

**e) Iniciar todos los servicios:**
```bash
docker-compose up -d
```

#### **3. Verificar Instalación:**
- PostgreSQL: `localhost:5432`
- API Gateway: `http://localhost:8000`
- Grafana: `http://localhost:3005`

### 🔧 Scripts de Automatización:

#### **Script de Instalación Automática:**
```bash
# Ejecutar en la PC destino
./scripts/install_on_new_pc.sh
```

#### **Script de Verificación:**
```bash
# Verificar que todo funciona
./scripts/verify_installation.sh
```

### 📊 Credenciales por Defecto:
- **PostgreSQL:** smdvital / smdvital_password_2024
- **Grafana:** admin / smdvital_grafana_2024
- **RabbitMQ:** smdvital / rabbitmq_password_2024

### 🆘 Solución de Problemas:
1. **Error de conexión:** Verificar que Docker esté ejecutándose
2. **Error de permisos:** Ejecutar como administrador
3. **Error de puertos:** Verificar que los puertos no estén ocupados
4. **Error de memoria:** Aumentar memoria disponible para Docker

### 📞 Soporte:
Si tienes problemas, revisa los logs:
```bash
docker-compose logs [nombre_servicio]
```
