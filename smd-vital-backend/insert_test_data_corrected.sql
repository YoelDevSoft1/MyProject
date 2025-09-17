-- SMD VITAL - Datos de Prueba Corregidos para Dashboard
-- =====================================================

-- Conectar a la base de datos de appointments
\c smdvital_appointments;

-- Insertar servicios médicos primero
INSERT INTO medical_services (id, name, description, duration_minutes, base_price, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Consulta General', 'Consulta médica general', 30, 50000, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Consulta Especializada', 'Consulta con especialista', 45, 80000, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Control Pediátrico', 'Control médico pediátrico', 25, 40000, true, NOW(), NOW());

-- Insertar citas de prueba
INSERT INTO appointments (id, appointment_number, patient_id, professional_id, medical_service_id, appointment_type, priority, scheduled_date, estimated_duration_minutes, status, reason, notes, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'APT-001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'consultation', 'normal', '2024-01-20 09:00:00', 30, 'scheduled', 'Consulta general', 'Primera consulta del paciente', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'APT-002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'consultation', 'high', '2024-01-20 10:30:00', 45, 'completed', 'Seguimiento diabetes', 'Control de glucosa', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'APT-003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'consultation', 'normal', '2024-01-20 14:00:00', 30, 'pending', 'Revisión médica', 'Chequeo anual', NOW(), NOW());

-- Conectar a la base de datos de medical_records
\c smdvital_medical_records;

-- Insertar expedientes médicos de prueba
INSERT INTO medical_records (id, patient_id, professional_id, diagnosis, treatment, notes, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Hipertensión arterial', 'Losartán 50mg diario', 'Paciente con presión arterial elevada', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Diabetes tipo 2', 'Metformina 850mg dos veces al día', 'Control de glucosa en ayunas', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Gripe común', 'Reposo y líquidos', 'Síntomas leves, sin complicaciones', NOW(), NOW());

-- Conectar a la base de datos de payments
\c smdvital_payments;

-- Insertar pagos de prueba
INSERT INTO payments (id, appointment_id, amount, payment_method, status, description, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 50000, 'cash', 'completed', 'Pago consulta general', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 80000, 'card', 'completed', 'Pago seguimiento diabetes', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 50000, 'transfer', 'pending', 'Pago revisión médica', NOW(), NOW());

-- Conectar a la base de datos de notifications
\c smdvital_notifications;

-- Insertar notificaciones de prueba
INSERT INTO notifications (id, recipient_id, title, message, notification_type, priority, status, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Nueva cita programada', 'Tienes una cita mañana a las 09:00 con Dr. López', 'appointment', 'normal', 'unread', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Recordatorio de medicamento', 'No olvides tomar tu medicamento para la diabetes', 'medication', 'high', 'unread', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Resultados de laboratorio', 'Tus resultados de laboratorio están listos', 'lab_results', 'normal', 'read', NOW(), NOW());

-- Mostrar resumen de datos insertados
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
