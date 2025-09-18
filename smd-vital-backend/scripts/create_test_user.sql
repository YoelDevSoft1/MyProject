-- Crear usuario de prueba con contraseña conocida
-- Contraseña: test123 (hash: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2)

INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone, date_of_birth, gender, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440999', 'test@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2', 'Test', 'User', 'doctor', '+57 300 999 9999', '1980-01-01', 'male', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verificar que se creó
SELECT email, first_name, last_name, role FROM users WHERE email = 'test@smdvital.com';
