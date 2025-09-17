-- Actualizar tabla de usuarios para soportar Google OAuth
-- Ejecutar en la base de datos smdvital_users

-- Agregar columnas para Google OAuth
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Crear índice para búsquedas por Google ID
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Actualizar usuarios existentes para que email_verified sea TRUE por defecto
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL;

-- Comentarios sobre las nuevas columnas
COMMENT ON COLUMN users.google_id IS 'ID único de Google OAuth';
COMMENT ON COLUMN users.profile_picture IS 'URL de la foto de perfil de Google';
COMMENT ON COLUMN users.email_verified IS 'Indica si el email ha sido verificado por Google';

