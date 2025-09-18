-- Insertar usuarios en la base de datos smdvital_users
-- Estructura: id, email, username, password_hash, role, is_active, is_verified, first_name, last_name

-- Crear usuarios de prueba
INSERT INTO users (id, email, username, password_hash, role, is_active, is_verified, first_name, last_name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'doctor1@smdvital.com', 'doctor1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'doctor', true, true, 'Dr. Juan', 'Pérez', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'doctor2@smdvital.com', 'doctor2', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'doctor', true, true, 'Dra. María', 'González', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'nurse1@smdvital.com', 'nurse1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'nurse', true, true, 'Laura', 'Rodríguez', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'patient1@smdvital.com', 'patient1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'patient', true, true, 'Carlos', 'López', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'patient2@smdvital.com', 'patient2', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'patient', true, true, 'Ana', 'Martínez', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440999', 'test@smdvital.com', 'test', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'doctor', true, true, 'Test', 'User', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Verificar que se insertaron
SELECT email, username, first_name, last_name, role FROM users ORDER BY role, first_name;
