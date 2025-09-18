-- Corregir el hash de la contraseña para el usuario de prueba
-- Contraseña: test123
-- Hash correcto generado con bcrypt

UPDATE users 
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4QZ8K2'
WHERE email = 'test@smdvital.com';

-- Verificar que se actualizó
SELECT email, password_hash FROM users WHERE email = 'test@smdvital.com';
