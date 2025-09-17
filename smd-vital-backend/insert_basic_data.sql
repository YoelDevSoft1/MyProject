-- SMD VITAL - Datos Básicos para Dashboard
-- ========================================

-- Conectar a la base de datos de appointments
\c smdvital_appointments;

-- Insertar servicios médicos básicos
INSERT INTO medical_services (id, name, description, base_price, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Consulta General', 'Consulta médica general', 50000, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Consulta Especializada', 'Consulta con especialista', 80000, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Control Pediátrico', 'Control médico pediátrico', 40000, true, NOW(), NOW());

-- Insertar citas básicas
INSERT INTO appointments (id, appointment_number, patient_id, medical_service_id, appointment_type, priority, scheduled_date, estimated_duration_minutes, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'APT-001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'consultation', 'normal', '2024-01-20 09:00:00', 30, 'scheduled', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'APT-002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'consultation', 'high', '2024-01-20 10:30:00', 45, 'completed', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'APT-003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'consultation', 'normal', '2024-01-20 14:00:00', 30, 'pending', NOW(), NOW());

-- Conectar a la base de datos de medical_records
\c smdvital_medical_records;

-- Insertar expedientes básicos
INSERT INTO medical_records (id, patient_id, professional_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', NOW(), NOW());

-- Conectar a la base de datos de payments
\c smdvital_payments;

-- Insertar pagos básicos
INSERT INTO payments (id, appointment_id, amount, payment_method, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 50000, 'CASH', 'COMPLETED', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 80000, 'CARD', 'COMPLETED', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 50000, 'TRANSFER', 'PENDING', NOW(), NOW());

-- Conectar a la base de datos de notifications
\c smdvital_notifications;

-- Insertar notificaciones básicas
INSERT INTO notifications (id, recipient_id, message, notification_type, priority, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Tienes una cita mañana a las 09:00', 'appointment', 'normal', 'unread', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'No olvides tomar tu medicamento', 'medication', 'high', 'unread', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Tus resultados están listos', 'lab_results', 'normal', 'read', NOW(), NOW());

-- Mostrar resumen
\c smdvital_appointments;
SELECT 'Appointments' as table_name, COUNT(*) as count FROM appointments
UNION ALL
\c smdvital_medical_records;
SELECT 'Medical Records' as table_name, COUNT(*) as count FROM medical_records
UNION ALL
\c smdvital_payments;
SELECT 'Payments' as table_name, COUNT(*) as count FROM payments
UNION ALL
\c smdvital_notifications;
SELECT 'Notifications' as table_name, COUNT(*) as count FROM notifications;
