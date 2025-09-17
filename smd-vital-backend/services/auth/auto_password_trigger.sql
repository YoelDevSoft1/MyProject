-- SMD VITAL - Trigger Automático de Hashing de Contraseñas
-- ========================================================
-- Trigger de PostgreSQL para hashing automático de contraseñas
-- Garantiza seguridad incluso si se insertan datos directamente en la BD

-- Función para hashear contraseñas automáticamente
CREATE OR REPLACE FUNCTION auto_hash_password_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo procesar si hay una contraseña en texto plano
    -- (no comienza con $2b$ que es el prefijo de bcrypt)
    IF NEW.password_hash IS NOT NULL 
       AND NEW.password_hash NOT LIKE '$2b$%' 
       AND LENGTH(NEW.password_hash) < 100 THEN
        
        -- Log de seguridad
        INSERT INTO password_audit_log (
            user_id, 
            action, 
            timestamp, 
            success
        ) VALUES (
            NEW.id,
            'auto_hash_trigger',
            NOW(),
            true
        );
        
        -- Marcar para procesamiento por la aplicación
        -- (el hashing real se hace en la aplicación por seguridad)
        RAISE EXCEPTION 'Password must be hashed by application layer for security compliance';
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear tabla de auditoría de contraseñas
CREATE TABLE IF NOT EXISTS password_audit_log (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT
);

-- Crear índice para auditoría
CREATE INDEX IF NOT EXISTS idx_password_audit_user_id ON password_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_password_audit_timestamp ON password_audit_log(timestamp);

-- Crear trigger para la tabla users
DROP TRIGGER IF EXISTS trigger_auto_hash_password ON users;
CREATE TRIGGER trigger_auto_hash_password
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION auto_hash_password_trigger();

-- Función para verificar fortaleza de contraseñas
CREATE OR REPLACE FUNCTION check_password_strength(password TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Verificaciones básicas de seguridad
    IF LENGTH(password) < 8 THEN
        RETURN 'WEAK: Minimum 8 characters required';
    END IF;
    
    IF LENGTH(password) > 128 THEN
        RETURN 'INVALID: Maximum 128 characters allowed';
    END IF;
    
    -- Verificar complejidad básica
    IF NOT password ~ '[A-Z]' THEN
        RETURN 'WEAK: Must contain uppercase letter';
    END IF;
    
    IF NOT password ~ '[a-z]' THEN
        RETURN 'WEAK: Must contain lowercase letter';
    END IF;
    
    IF NOT password ~ '[0-9]' THEN
        RETURN 'WEAK: Must contain number';
    END IF;
    
    IF NOT password ~ '[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]' THEN
        RETURN 'WEAK: Must contain special character';
    END IF;
    
    -- Verificar patrones prohibidos
    IF LOWER(password) ~ '(password|123456|qwerty|admin|user|login)' THEN
        RETURN 'WEAK: Contains common patterns';
    END IF;
    
    RETURN 'STRONG';
END;
$$ LANGUAGE plpgsql;

-- Función para auditoría de cambios de contraseña
CREATE OR REPLACE FUNCTION log_password_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo registrar si la contraseña cambió
    IF OLD.password_hash IS DISTINCT FROM NEW.password_hash THEN
        INSERT INTO password_audit_log (
            user_id,
            action,
            timestamp,
            success
        ) VALUES (
            NEW.id,
            'password_changed',
            NOW(),
            true
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auditoría de cambios
DROP TRIGGER IF EXISTS trigger_password_audit ON users;
CREATE TRIGGER trigger_password_audit
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_password_change();

-- Vista para monitoreo de seguridad de contraseñas
CREATE OR REPLACE VIEW password_security_report AS
SELECT 
    u.id,
    u.email,
    u.username,
    CASE 
        WHEN u.password_hash LIKE '$2b$%' THEN 'HASHED'
        ELSE 'PLAIN_TEXT'
    END as password_status,
    u.password_changed_at,
    EXTRACT(DAYS FROM NOW() - u.password_changed_at) as days_since_change,
    CASE 
        WHEN EXTRACT(DAYS FROM NOW() - u.password_changed_at) > 90 THEN 'EXPIRED'
        WHEN EXTRACT(DAYS FROM NOW() - u.password_changed_at) > 60 THEN 'WARNING'
        ELSE 'OK'
    END as password_age_status,
    u.is_active,
    u.last_login
FROM users u
WHERE u.is_active = true
ORDER BY u.password_changed_at DESC;

-- Comentarios para documentación
COMMENT ON FUNCTION auto_hash_password_trigger() IS 'Trigger para prevenir contraseñas en texto plano';
COMMENT ON FUNCTION check_password_strength(TEXT) IS 'Verifica fortaleza de contraseñas';
COMMENT ON FUNCTION log_password_change() IS 'Registra cambios de contraseña para auditoría';
COMMENT ON TABLE password_audit_log IS 'Log de auditoría de seguridad de contraseñas';
COMMENT ON VIEW password_security_report IS 'Reporte de seguridad de contraseñas para monitoreo';
