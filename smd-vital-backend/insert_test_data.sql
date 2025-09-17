-- SMD VITAL - Datos de Prueba para Dashboard
-- =============================================

-- Conectar a la base de datos de appointments
\c smdvital_appointments;

-- Insertar citas de prueba
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes, created_at, updated_at) VALUES
(1, 1, 1, '2024-01-20', '09:00:00', 'scheduled', 'Consulta general', 'Primera consulta del paciente', NOW(), NOW()),
(2, 2, 1, '2024-01-20', '10:30:00', 'completed', 'Seguimiento diabetes', 'Control de glucosa', NOW(), NOW()),
(3, 3, 2, '2024-01-20', '14:00:00', 'pending', 'Revisión médica', 'Chequeo anual', NOW(), NOW()),
(4, 4, 2, '2024-01-21', '08:30:00', 'scheduled', 'Consulta cardiología', 'Dolor en el pecho', NOW(), NOW()),
(5, 5, 1, '2024-01-21', '11:00:00', 'scheduled', 'Consulta pediatría', 'Control de niño sano', NOW(), NOW());

-- Conectar a la base de datos de medical_records
\c smdvital_medical_records;

-- Insertar expedientes médicos de prueba
INSERT INTO medical_records (id, patient_id, doctor_id, diagnosis, treatment, notes, created_at, updated_at) VALUES
(1, 1, 1, 'Hipertensión arterial', 'Losartán 50mg diario', 'Paciente con presión arterial elevada', NOW(), NOW()),
(2, 2, 1, 'Diabetes tipo 2', 'Metformina 850mg dos veces al día', 'Control de glucosa en ayunas', NOW(), NOW()),
(3, 3, 2, 'Gripe común', 'Reposo y líquidos', 'Síntomas leves, sin complicaciones', NOW(), NOW()),
(4, 4, 2, 'Ansiedad', 'Terapia psicológica', 'Episodios de ansiedad leve', NOW(), NOW()),
(5, 5, 1, 'Control pediátrico', 'Vacunación al día', 'Niño sano, desarrollo normal', NOW(), NOW());

-- Conectar a la base de datos de payments
\c smdvital_payments;

-- Insertar pagos de prueba
INSERT INTO payments (id, patient_id, appointment_id, amount, payment_method, status, description, created_at, updated_at) VALUES
(1, 1, 1, 50000, 'efectivo', 'completed', 'Pago consulta general', NOW(), NOW()),
(2, 2, 2, 75000, 'tarjeta', 'completed', 'Pago seguimiento diabetes', NOW(), NOW()),
(3, 3, 3, 60000, 'transferencia', 'pending', 'Pago revisión médica', NOW(), NOW()),
(4, 4, 4, 120000, 'efectivo', 'completed', 'Pago consulta cardiología', NOW(), NOW()),
(5, 5, 5, 40000, 'tarjeta', 'completed', 'Pago consulta pediatría', NOW(), NOW());

-- Conectar a la base de datos de notifications
\c smdvital_notifications;

-- Insertar notificaciones de prueba
INSERT INTO notifications (id, user_id, title, message, type, priority, status, created_at, updated_at) VALUES
(1, 1, 'Nueva cita programada', 'Tienes una cita mañana a las 09:00 con Dr. López', 'appointment', 'normal', 'unread', NOW(), NOW()),
(2, 2, 'Recordatorio de medicamento', 'No olvides tomar tu medicamento para la diabetes', 'medication', 'high', 'unread', NOW(), NOW()),
(3, 3, 'Resultados de laboratorio', 'Tus resultados de laboratorio están listos', 'lab_results', 'normal', 'read', NOW(), NOW()),
(4, 4, 'Cita cancelada', 'Tu cita del viernes ha sido cancelada', 'appointment', 'urgent', 'unread', NOW(), NOW()),
(5, 5, 'Recordatorio de vacuna', 'Es hora de la próxima vacuna de tu hijo', 'vaccination', 'normal', 'unread', NOW(), NOW());

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
