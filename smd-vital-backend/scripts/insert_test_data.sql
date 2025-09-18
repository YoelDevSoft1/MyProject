-- SMD Vital - Datos de Prueba
-- ===========================
-- Script para insertar datos de prueba en la base de datos

-- Insertar usuarios de prueba (doctores y pacientes)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone, date_of_birth, gender, is_active, created_at, updated_at) VALUES
-- Doctores
('550e8400-e29b-41d4-a716-446655440001', 'dr.garcia@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'María', 'García', 'doctor', '+57 300 123 4567', '1980-05-15', 'female', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'dr.rodriguez@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'Carlos', 'Rodríguez', 'doctor', '+57 300 234 5678', '1975-08-22', 'male', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'dr.martinez@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'Ana', 'Martínez', 'doctor', '+57 300 345 6789', '1982-12-10', 'female', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'dr.lopez@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'Roberto', 'López', 'doctor', '+57 300 456 7890', '1978-03-18', 'male', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'dr.hernandez@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'Laura', 'Hernández', 'doctor', '+57 300 567 8901', '1985-07-25', 'female', true, NOW(), NOW()),

-- Pacientes
('550e8400-e29b-41d4-a716-446655440010', 'paciente1@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'Juan', 'Pérez', 'patient', '+57 300 111 2222', '1990-01-15', 'male', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'paciente2@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'María', 'González', 'patient', '+57 300 222 3333', '1988-06-20', 'female', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'paciente3@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'Pedro', 'Sánchez', 'patient', '+57 300 333 4444', '1992-11-08', 'male', true, NOW(), NOW()),

-- Enfermeros
('550e8400-e29b-41d4-a716-446655440020', 'enfermero1@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'Carmen', 'Vega', 'nurse', '+57 300 444 5555', '1987-04-12', 'female', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440021', 'enfermero2@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'Miguel', 'Torres', 'nurse', '+57 300 555 6666', '1983-09-30', 'male', true, NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- Insertar especialidades médicas
INSERT INTO doctor_specialties (id, doctor_id, specialty, years_experience, description, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'Cardiología', 15, 'Especialista en enfermedades del corazón y sistema cardiovascular', NOW()),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440002', 'Neurología', 12, 'Especialista en enfermedades del sistema nervioso', NOW()),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440003', 'Pediatría', 8, 'Especialista en medicina infantil', NOW()),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440004', 'Dermatología', 10, 'Especialista en enfermedades de la piel', NOW()),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440005', 'Ginecología', 7, 'Especialista en salud reproductiva femenina', NOW())

ON CONFLICT (id) DO NOTHING;

-- Insertar horarios de trabajo de los doctores
INSERT INTO doctor_schedules (id, doctor_id, day_of_week, start_time, end_time, is_available, created_at) VALUES
-- Dr. García (Cardiólogo) - Lunes a Viernes
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', 'monday', '08:00:00', '17:00:00', true, NOW()),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', 'tuesday', '08:00:00', '17:00:00', true, NOW()),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440001', 'wednesday', '08:00:00', '17:00:00', true, NOW()),
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440001', 'thursday', '08:00:00', '17:00:00', true, NOW()),
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440001', 'friday', '08:00:00', '17:00:00', true, NOW()),

-- Dr. Rodríguez (Neurólogo) - Lunes, Miércoles, Viernes
('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440002', 'monday', '09:00:00', '18:00:00', true, NOW()),
('550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440002', 'wednesday', '09:00:00', '18:00:00', true, NOW()),
('550e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440002', 'friday', '09:00:00', '18:00:00', true, NOW()),

-- Dra. Martínez (Pediatra) - Martes y Jueves
('550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440003', 'tuesday', '08:30:00', '16:30:00', true, NOW()),
('550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440003', 'thursday', '08:30:00', '16:30:00', true, NOW()),

-- Dr. López (Dermatólogo) - Lunes a Viernes
('550e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440004', 'monday', '10:00:00', '19:00:00', true, NOW()),
('550e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440004', 'tuesday', '10:00:00', '19:00:00', true, NOW()),
('550e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440004', 'wednesday', '10:00:00', '19:00:00', true, NOW()),
('550e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440004', 'thursday', '10:00:00', '19:00:00', true, NOW()),
('550e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440004', 'friday', '10:00:00', '19:00:00', true, NOW()),

-- Dra. Hernández (Ginecóloga) - Lunes, Miércoles, Viernes
('550e8400-e29b-41d4-a716-446655440216', '550e8400-e29b-41d4-a716-446655440005', 'monday', '07:00:00', '15:00:00', true, NOW()),
('550e8400-e29b-41d4-a716-446655440217', '550e8400-e29b-41d4-a716-446655440005', 'wednesday', '07:00:00', '15:00:00', true, NOW()),
('550e8400-e29b-41d4-a716-446655440218', '550e8400-e29b-41d4-a716-446655440005', 'friday', '07:00:00', '15:00:00', true, NOW())

ON CONFLICT (id) DO NOTHING;

-- Insertar citas de prueba
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, start_time, end_time, status, reason, notes, created_at, updated_at) VALUES
-- Citas completadas (para probar calificaciones)
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '2024-09-15', '10:00:00', '10:30:00', 'completed', 'Consulta de seguimiento cardiológico', 'Paciente con hipertensión controlada', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', '2024-09-16', '14:00:00', '14:30:00', 'completed', 'Evaluación neurológica', 'Migrañas recurrentes', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', '2024-09-17', '09:00:00', '09:30:00', 'completed', 'Control pediátrico', 'Vacunación y revisión general', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Citas confirmadas (para probar consultas médicas)
('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', '2024-09-20', '11:00:00', '11:30:00', 'confirmed', 'Consulta dermatológica', 'Revisión de lunares', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440005', '2024-09-21', '15:00:00', '15:30:00', 'confirmed', 'Consulta ginecológica', 'Control anual', NOW(), NOW()),

-- Citas pendientes
('550e8400-e29b-41d4-a716-446655440306', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', '2024-09-25', '16:00:00', '16:30:00', 'pending', 'Primera consulta cardiológica', 'Dolor en el pecho', NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- Insertar registros médicos de prueba
INSERT INTO medical_records (id, patient_id, doctor_id, appointment_id, record_type, version, created_at, updated_at, created_by, last_modified_by, status, clinical_data) VALUES
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440301', 'consultation', 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'active', '{
  "chief_complaint": "Seguimiento de hipertensión arterial",
  "history_present_illness": "Paciente de 34 años con hipertensión arterial controlada con losartán 50mg/día",
  "vital_signs": {
    "blood_pressure": "120/80 mmHg",
    "heart_rate": "72 bpm",
    "temperature": "36.5°C",
    "weight": "75 kg",
    "height": "170 cm"
  },
  "physical_examination": {
    "cardiovascular": "Ritmo regular, sin soplos",
    "respiratory": "MVC conservada bilateralmente",
    "abdomen": "Blando, no doloroso"
  },
  "assessment": "Hipertensión arterial controlada",
  "plan": "Continuar con losartán 50mg/día, control en 3 meses"
}'),

('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440302', 'consultation', 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'active', '{
  "chief_complaint": "Migrañas recurrentes",
  "history_present_illness": "Paciente de 36 años con migrañas de 2 años de evolución, 2-3 episodios por mes",
  "vital_signs": {
    "blood_pressure": "110/70 mmHg",
    "heart_rate": "68 bpm",
    "temperature": "36.2°C"
  },
  "neurological_examination": "Normal, sin signos de focalización",
  "assessment": "Migraña sin aura",
  "plan": "Sumatriptán 50mg al inicio del episodio, control en 1 mes"
}')

ON CONFLICT (id) DO NOTHING;

-- Insertar recetas médicas de prueba
INSERT INTO prescriptions (id, medical_record_id, patient_id, doctor_id, prescription_data, status, expires_at, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '{
  "medications": [
    {
      "name": "Losartán",
      "dosage": "50mg",
      "frequency": "1 vez al día",
      "duration": "3 meses",
      "instructions": "Tomar en ayunas"
    }
  ],
  "instructions": "Continuar tratamiento actual, control de presión arterial diario",
  "follow_up": "Control en 3 meses"
}', 'active', NOW() + INTERVAL '3 months', NOW() - INTERVAL '3 days'),

('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', '{
  "medications": [
    {
      "name": "Sumatriptán",
      "dosage": "50mg",
      "frequency": "Al inicio del episodio",
      "duration": "Según necesidad",
      "instructions": "Máximo 2 comprimidos por episodio"
    }
  ],
  "instructions": "Tomar al primer signo de migraña",
  "follow_up": "Control en 1 mes"
}', 'active', NOW() + INTERVAL '1 month', NOW() - INTERVAL '2 days')

ON CONFLICT (id) DO NOTHING;

-- Insertar calificaciones de prueba
INSERT INTO doctor_ratings (id, doctor_id, patient_id, appointment_id, rating, comment, categories, is_verified, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440301', 5, 'Excelente atención, muy profesional y explicó todo muy bien', '{"punctuality": 5, "communication": 5, "treatment": 5, "facilities": 4}', true, NOW() - INTERVAL '2 days'),
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440302', 4, 'Muy buena atención, resolvió mis dudas', '{"punctuality": 4, "communication": 5, "treatment": 4, "facilities": 4}', true, NOW() - INTERVAL '1 day'),
('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440303', 5, 'La doctora fue muy amable con mi hijo, excelente trato', '{"punctuality": 5, "communication": 5, "treatment": 5, "facilities": 5}', true, NOW())

ON CONFLICT (id) DO NOTHING;

-- Actualizar agregaciones de calificaciones
INSERT INTO doctor_rating_aggregates (doctor_id, total_ratings, average_rating, rating_distribution, category_averages, last_updated, confidence_score) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1, 5.00, '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 1}', '{"punctuality": 5.0, "communication": 5.0, "treatment": 5.0, "facilities": 4.0}', NOW(), 0.85),
('550e8400-e29b-41d4-a716-446655440002', 1, 4.00, '{"1": 0, "2": 0, "3": 0, "4": 1, "5": 0}', '{"punctuality": 4.0, "communication": 5.0, "treatment": 4.0, "facilities": 4.0}', NOW(), 0.75),
('550e8400-e29b-41d4-a716-446655440003', 1, 5.00, '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 1}', '{"punctuality": 5.0, "communication": 5.0, "treatment": 5.0, "facilities": 5.0}', NOW(), 0.85)

ON CONFLICT (doctor_id) DO NOTHING;

-- Mensaje de confirmación
SELECT 'Datos de prueba insertados exitosamente' as status;
