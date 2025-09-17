-- SMD Vital - Database Initialization Script
-- ==========================================

-- Create databases for each microservice
CREATE DATABASE smdvital_auth;
CREATE DATABASE smdvital_users;
CREATE DATABASE smdvital_appointments;
CREATE DATABASE smdvital_notifications;
CREATE DATABASE smdvital_medical_records;
CREATE DATABASE smdvital_payments;

-- Create specific users for each service (optional, for production)
-- CREATE USER auth_service WITH PASSWORD 'auth_password_2024';
-- CREATE USER user_service WITH PASSWORD 'user_password_2024';
-- CREATE USER appointment_service WITH PASSWORD 'appointment_password_2024';
-- CREATE USER notification_service WITH PASSWORD 'notification_password_2024';
-- CREATE USER medical_service WITH PASSWORD 'medical_password_2024';
-- CREATE USER payment_service WITH PASSWORD 'payment_password_2024';

-- Grant permissions (uncomment for production with specific users)
-- GRANT ALL PRIVILEGES ON DATABASE smdvital_auth TO auth_service;
-- GRANT ALL PRIVILEGES ON DATABASE smdvital_users TO user_service;
-- GRANT ALL PRIVILEGES ON DATABASE smdvital_appointments TO appointment_service;
-- GRANT ALL PRIVILEGES ON DATABASE smdvital_notifications TO notification_service;
-- GRANT ALL PRIVILEGES ON DATABASE smdvital_medical_records TO medical_service;
-- GRANT ALL PRIVILEGES ON DATABASE smdvital_payments TO payment_service;

-- Create extensions
\c smdvital_auth;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c smdvital_users;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c smdvital_appointments;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c smdvital_notifications;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c smdvital_medical_records;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c smdvital_payments;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
