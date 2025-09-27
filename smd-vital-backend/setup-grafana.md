# SMD Vital - Configuración de Grafana
=====================================

## 🔐 Credenciales de Grafana

**URL:** http://localhost:3005
**Usuario:** admin
**Contraseña:** smdvital_grafana_2024

## 📋 Pasos para Configurar

### 1. Crear archivo .env
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```bash
# Grafana Configuration
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=smdvital_grafana_2024
GRAFANA_SECRET_KEY=smdvital_grafana_secret_key_2024

# Database Configuration
DATABASE_URL=postgresql://smdvital:smdvital_password_2024@postgres:5432/smdvital
POSTGRES_DB=smdvital
POSTGRES_USER=smdvital
POSTGRES_PASSWORD=smdvital_password_2024

# Redis Configuration
REDIS_URL=redis://:redis_password_2024@redis:6379/0
REDIS_PASSWORD=redis_password_2024

# RabbitMQ Configuration
RABBITMQ_URL=amqp://smdvital:smdvital_password_2024@rabbitmq:5672/smdvital
RABBITMQ_USER=smdvital
RABBITMQ_PASSWORD=smdvital_password_2024
RABBITMQ_VHOST=smdvital

# Celery Configuration
CELERY_BROKER_URL=amqp://smdvital:smdvital_password_2024@rabbitmq:5672/smdvital
CELERY_RESULT_BACKEND=redis://redis:6379/3

# Security
SECRET_KEY=smdvital_super_secret_key_2024_change_in_production
JWT_SECRET_KEY=smdvital_jwt_secret_key_2024_change_in_production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Encryption
ENCRYPTION_KEY=smdvital_encryption_key_2024_change_in_production
```

### 2. Reiniciar servicios
```bash
docker-compose down
docker-compose up -d
```

### 3. Acceder a Grafana
1. Abre http://localhost:3005
2. Usuario: admin
3. Contraseña: smdvital_grafana_2024

### 4. Configurar Prometheus como fuente de datos
1. Ve a Configuration → Data Sources
2. Agrega Prometheus:
   - URL: http://prometheus:9090
   - Access: Server (default)
3. Haz clic en "Save & Test"

### 5. Importar Dashboards
1. Ve a "+" → Import
2. Usa los archivos JSON de la carpeta `grafana-dashboards/`
3. Selecciona Prometheus como fuente de datos

## 🚨 Seguridad

**IMPORTANTE:** En producción, cambia todas las contraseñas por valores seguros y únicos.

## 📊 Dashboards Disponibles

- **Microservices Overview**: Monitoreo general de todos los servicios
- **Database Monitoring**: Métricas de PostgreSQL
- **Celery Tasks**: Monitoreo de tareas en background

## 🔧 Troubleshooting

Si no puedes acceder a Grafana:
1. Verifica que el contenedor esté ejecutándose: `docker-compose ps`
2. Revisa los logs: `docker-compose logs grafana`
3. Asegúrate de que el archivo .env esté creado correctamente














