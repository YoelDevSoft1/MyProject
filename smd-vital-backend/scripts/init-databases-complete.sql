-- SMD Vital Database Initialization Script - Complete Version
-- ===========================================================
-- 
-- Este script inicializa todas las bases de datos necesarias
-- para los microservicios de SMD Vital Bogotá

-- Verificar y crear usuario principal si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'smdvital') THEN
        CREATE USER smdvital WITH PASSWORD 'smdvital_password_2024';
        ALTER USER smdvital CREATEDB;
        RAISE NOTICE 'Usuario smdvital creado exitosamente';
    ELSE
        RAISE NOTICE 'Usuario smdvital ya existe';
    END IF;
END
$$;

-- Crear bases de datos para cada microservicio
CREATE DATABASE smdvital_auth OWNER smdvital;
CREATE DATABASE smdvital_users OWNER smdvital;
CREATE DATABASE smdvital_appointments OWNER smdvital;
CREATE DATABASE smdvital_notifications OWNER smdvital;
CREATE DATABASE smdvital_medical_records OWNER smdvital;
CREATE DATABASE smdvital_payments OWNER smdvital;

-- Otorgar permisos completos al usuario smdvital
GRANT ALL PRIVILEGES ON DATABASE smdvital_auth TO smdvital;
GRANT ALL PRIVILEGES ON DATABASE smdvital_users TO smdvital;
GRANT ALL PRIVILEGES ON DATABASE smdvital_appointments TO smdvital;
GRANT ALL PRIVILEGES ON DATABASE smdvital_notifications TO smdvital;
GRANT ALL PRIVILEGES ON DATABASE smdvital_medical_records TO smdvital;
GRANT ALL PRIVILEGES ON DATABASE smdvital_payments TO smdvital;

-- Configurar extensiones necesarias en cada base de datos

-- Auth Service Database Extensions
\c smdvital_auth;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
GRANT ALL ON SCHEMA public TO smdvital;

-- Users Service Database Extensions
\c smdvital_users;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
GRANT ALL ON SCHEMA public TO smdvital;

-- Appointments Service Database Extensions
\c smdvital_appointments;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
GRANT ALL ON SCHEMA public TO smdvital;

-- Notifications Service Database Extensions
\c smdvital_notifications;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
GRANT ALL ON SCHEMA public TO smdvital;

-- Medical Records Service Database Extensions
\c smdvital_medical_records;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
GRANT ALL ON SCHEMA public TO smdvital;

-- Payments Service Database Extensions
\c smdvital_payments;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
GRANT ALL ON SCHEMA public TO smdvital;

-- Volver a la base de datos postgres
\c postgres;

-- Configurar configuraciones de PostgreSQL para optimización
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Mostrar resumen de configuración
SELECT 'SMD Vital Database Setup Complete!' as status;

-- Mostrar información de las bases de datos creadas
SELECT 
    datname as database_name, 
    datallowconn as allow_connections, 
    pg_size_pretty(pg_database_size(datname)) as size,
    (SELECT rolname FROM pg_roles WHERE oid = datdba) as owner
FROM pg_database 
WHERE datname LIKE 'smdvital_%'
ORDER BY datname;

-- Mostrar extensiones instaladas
SELECT 
    'Extensions installed in ' || current_database() as info;

\c smdvital_auth;
SELECT extname as extension_name, extversion as version FROM pg_extension WHERE extname != 'plpgsql';

\c smdvital_users;
SELECT extname as extension_name, extversion as version FROM pg_extension WHERE extname != 'plpgsql';

\c smdvital_appointments;
SELECT extname as extension_name, extversion as version FROM pg_extension WHERE extname != 'plpgsql';

\c smdvital_notifications;
SELECT extname as extension_name, extversion as version FROM pg_extension WHERE extname != 'plpgsql';

\c smdvital_medical_records;
SELECT extname as extension_name, extversion as version FROM pg_extension WHERE extname != 'plpgsql';

\c smdvital_payments;
SELECT extname as extension_name, extversion as version FROM pg_extension WHERE extname != 'plpgsql';

\c postgres;

-- Información final
SELECT 
    'Setup completed successfully! Ready for Alembic migrations.' as final_status;

