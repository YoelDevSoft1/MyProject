-- =============================================
-- SMD VITAL - Database Initialization Script
-- =============================================
-- Script para crear todas las bases de datos y esquemas necesarios

-- Crear bases de datos
CREATE DATABASE smdvital_users;
CREATE DATABASE smdvital_appointments;
CREATE DATABASE smdvital_notifications;
CREATE DATABASE smdvital_medical_records;
CREATE DATABASE smdvital_payments;
CREATE DATABASE smdvital_ai;

-- Conceder permisos al usuario smdvital
GRANT ALL PRIVILEGES ON DATABASE smdvital_users TO smdvital;
GRANT ALL PRIVILEGES ON DATABASE smdvital_appointments TO smdvital;
GRANT ALL PRIVILEGES ON DATABASE smdvital_notifications TO smdvital;
GRANT ALL PRIVILEGES ON DATABASE smdvital_medical_records TO smdvital;
GRANT ALL PRIVILEGES ON DATABASE smdvital_payments TO smdvital;
GRANT ALL PRIVILEGES ON DATABASE smdvital_ai TO smdvital;

-- Conectar a cada base de datos y crear esquemas
\c smdvital_payments;

-- Ejecutar esquema de pagos
\i /docker-entrypoint-initdb.d/schemas/payment_schemas.sql;

\c smdvital_notifications;

-- Ejecutar esquema de notificaciones
\i /docker-entrypoint-initdb.d/schemas/notification_schemas.sql;

\c smdvital_medical_records;

-- Ejecutar esquema de métricas de salud
\i /docker-entrypoint-initdb.d/schemas/health_metrics_schemas.sql;

\c smdvital_ai;

-- Ejecutar esquema de IA
\i /docker-entrypoint-initdb.d/schemas/ai_schemas.sql;

-- Crear métricas de salud por defecto
INSERT INTO health_metric_definitions (metric_code, metric_name, category, unit, min_value, max_value, data_type) VALUES
('blood_pressure_systolic', 'Presión Arterial Sistólica', 'vital_signs', 'mmHg', 70, 200, 'numeric'),
('blood_pressure_diastolic', 'Presión Arterial Diastólica', 'vital_signs', 'mmHg', 40, 120, 'numeric'),
('heart_rate', 'Frecuencia Cardíaca', 'vital_signs', 'bpm', 40, 200, 'numeric'),
('temperature', 'Temperatura Corporal', 'vital_signs', '°C', 35, 42, 'numeric'),
('weight', 'Peso', 'vital_signs', 'kg', 20, 300, 'numeric'),
('height', 'Estatura', 'vital_signs', 'cm', 100, 250, 'numeric'),
('blood_glucose', 'Glucosa en Sangre', 'lab_results', 'mg/dL', 50, 500, 'numeric'),
('cholesterol_total', 'Colesterol Total', 'lab_results', 'mg/dL', 100, 400, 'numeric'),
('steps_daily', 'Pasos Diarios', 'physical_activity', 'pasos', 0, 50000, 'numeric'),
('sleep_hours', 'Horas de Sueño', 'lifestyle', 'horas', 0, 24, 'numeric');

-- Crear plantillas de notificación por defecto
\c smdvital_notifications;

INSERT INTO notification_templates (name, event_type, channel, subject_template, body_template, variables) VALUES
('appointment_confirmation', 'appointment_created', 'email', 'Confirmación de Cita - SMD Vital', 
 '<h2>Su cita ha sido confirmada</h2><p>Estimado/a {{patient_name}},</p><p>Su cita para el {{appointment_date}} a las {{appointment_time}} ha sido confirmada exitosamente.</p><p>Doctor: {{doctor_name}}</p><p>Especialidad: {{specialty}}</p><p>Por favor llegue 15 minutos antes de su cita.</p>',
 '{"patient_name": "string", "appointment_date": "string", "appointment_time": "string", "doctor_name": "string", "specialty": "string"}'),

('payment_confirmation', 'payment_succeeded', 'email', 'Confirmación de Pago - SMD Vital',
 '<h2>Pago Confirmado</h2><p>Su pago de ${{amount}} ha sido procesado exitosamente.</p><p>Referencia: {{payment_reference}}</p><p>Fecha: {{payment_date}}</p>',
 '{"amount": "number", "payment_reference": "string", "payment_date": "string"}'),

('health_alert', 'health_alert_triggered', 'email', 'Alerta de Salud - SMD Vital',
 '<h2>Alerta de Salud</h2><p>Se ha detectado una alerta en su métrica de {{metric_name}}.</p><p>Valor registrado: {{current_value}} {{unit}}</p><p>Umbral: {{threshold_value}} {{unit}}</p><p>Por favor consulte con su médico.</p>',
 '{"metric_name": "string", "current_value": "number", "unit": "string", "threshold_value": "number"}');

-- Crear usuario de prueba
\c smdvital_users;

-- Asumiendo que ya existe la tabla users
-- INSERT INTO users (id, email, first_name, last_name, phone) VALUES 
-- ('550e8400-e29b-41d4-a716-446655440000', 'test@smdvital.com', 'Usuario', 'Prueba', '+573001234567');

COMMENT ON DATABASE smdvital_users IS 'Base de datos para gestión de usuarios';
COMMENT ON DATABASE smdvital_appointments IS 'Base de datos para gestión de citas médicas';
COMMENT ON DATABASE smdvital_notifications IS 'Base de datos para sistema de notificaciones';
COMMENT ON DATABASE smdvital_medical_records IS 'Base de datos para historias clínicas y métricas de salud';
COMMENT ON DATABASE smdvital_payments IS 'Base de datos para procesamiento de pagos';
COMMENT ON DATABASE smdvital_ai IS 'Base de datos para servicio de IA médica con LangGraph';