-- SMD VITAL - Complete Database Schema
-- Crear todas las tablas necesarias para el sistema

-- =============================================
-- 1. TABLA DE USUARIOS
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'patient', -- 'patient', 'doctor', 'nurse', 'admin'
    specialty VARCHAR(100), -- Para doctores
    license_number VARCHAR(100), -- Para doctores
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- 2. TABLA DE CITAS MÉDICAS
-- =============================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'
    type VARCHAR(50) DEFAULT 'consultation', -- 'consultation', 'follow_up', 'emergency'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES users(id),
    CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- =============================================
-- 3. TABLA DE REGISTROS MÉDICOS (EHR)
-- =============================================
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    appointment_id UUID NOT NULL,
    record_type VARCHAR(50) NOT NULL DEFAULT 'consultation', -- 'consultation', 'prescription', 'lab_result', 'diagnosis'
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadatos de auditoría
    created_by UUID NOT NULL,
    last_modified_by UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'amended', 'voided'
    
    -- Datos estructurados (JSONB para flexibilidad)
    clinical_data JSONB NOT NULL,
    
    -- Índices para consultas frecuentes
    CONSTRAINT fk_medical_patient FOREIGN KEY (patient_id) REFERENCES users(id),
    CONSTRAINT fk_medical_doctor FOREIGN KEY (doctor_id) REFERENCES users(id),
    CONSTRAINT fk_medical_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    CONSTRAINT fk_medical_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_medical_modified_by FOREIGN KEY (last_modified_by) REFERENCES users(id)
);

-- =============================================
-- 4. TABLA DE CALIFICACIONES DE DOCTORES
-- =============================================
CREATE TABLE IF NOT EXISTS doctor_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    appointment_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    categories JSONB, -- {"punctuality": 5, "communication": 4, "treatment": 5}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE, -- Solo citas completadas
    
    CONSTRAINT fk_rating_doctor FOREIGN KEY (doctor_id) REFERENCES users(id),
    CONSTRAINT fk_rating_patient FOREIGN KEY (patient_id) REFERENCES users(id),
    CONSTRAINT fk_rating_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- =============================================
-- 5. TABLA DE AGREGACIONES DE CALIFICACIONES
-- =============================================
CREATE TABLE IF NOT EXISTS doctor_rating_aggregates (
    doctor_id UUID PRIMARY KEY,
    total_ratings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    rating_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}',
    category_averages JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confidence_score DECIMAL(3,2) DEFAULT 0.00, -- Basado en número de ratings
    
    CONSTRAINT fk_doctor_agg FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- =============================================
-- 6. TABLA DE RECETAS MÉDICAS
-- =============================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    prescription_data JSONB NOT NULL, -- Datos de la receta
    pdf_url VARCHAR(500), -- URL del PDF generado
    pdf_generated_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'cancelled'
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_prescription_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id),
    CONSTRAINT fk_prescription_patient FOREIGN KEY (patient_id) REFERENCES users(id),
    CONSTRAINT fk_prescription_doctor FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- =============================================
-- 7. ÍNDICES OPTIMIZADOS
-- =============================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_specialty ON users(specialty) WHERE specialty IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- Índices para appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);

-- Índices para medical_records
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_created ON medical_records(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor ON medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON medical_records(record_type);
CREATE INDEX IF NOT EXISTS idx_medical_records_clinical_gin ON medical_records USING GIN (clinical_data);
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status) WHERE status = 'active';

-- Índices para doctor_ratings
CREATE INDEX IF NOT EXISTS idx_ratings_doctor_created ON doctor_ratings(doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_verified ON doctor_ratings(doctor_id) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_ratings_patient ON doctor_ratings(patient_id);
CREATE INDEX IF NOT EXISTS idx_ratings_appointment ON doctor_ratings(appointment_id);

-- Índices para prescriptions
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_expires ON prescriptions(expires_at) WHERE status = 'active';

-- =============================================
-- 8. VISTA MATERIALIZADA PARA ESTADO ACTUAL DEL PACIENTE
-- =============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS patient_current_state AS
SELECT 
    patient_id,
    jsonb_agg(
        jsonb_build_object(
            'record_id', id,
            'type', record_type,
            'data', clinical_data,
            'created_at', created_at,
            'doctor_id', doctor_id,
            'status', status
        ) ORDER BY created_at DESC
    ) as current_medical_state,
    MAX(created_at) as last_consultation_date
FROM medical_records 
WHERE status = 'active'
GROUP BY patient_id;

-- Índice para la vista materializada
CREATE INDEX IF NOT EXISTS idx_patient_current_state_patient ON patient_current_state(patient_id);

-- =============================================
-- 9. FUNCIONES DE UTILIDAD
-- =============================================

-- Función para actualizar agregaciones de calificaciones
CREATE OR REPLACE FUNCTION update_doctor_rating_aggregates(target_doctor_id UUID)
RETURNS VOID AS $$
DECLARE
    total_count INTEGER;
    avg_rating DECIMAL(3,2);
    distribution JSONB;
    category_totals JSONB;
    category_counts JSONB;
    category_averages JSONB;
    confidence DECIMAL(3,2);
BEGIN
    -- Obtener total de calificaciones verificadas
    SELECT COUNT(*), AVG(rating::DECIMAL)
    INTO total_count, avg_rating
    FROM doctor_ratings 
    WHERE doctor_id = target_doctor_id AND is_verified = TRUE;
    
    -- Calcular distribución
    SELECT jsonb_object_agg(rating::TEXT, count)
    INTO distribution
    FROM (
        SELECT rating, COUNT(*) as count
        FROM doctor_ratings 
        WHERE doctor_id = target_doctor_id AND is_verified = TRUE
        GROUP BY rating
    ) subq;
    
    -- Calcular promedios por categoría
    SELECT 
        jsonb_object_agg(category, total_score / category_count)
    INTO category_averages
    FROM (
        SELECT 
            category,
            SUM(score) as total_score,
            COUNT(*) as category_count
        FROM doctor_ratings,
        LATERAL jsonb_each(categories) as cat(category, score)
        WHERE doctor_id = target_doctor_id AND is_verified = TRUE
        GROUP BY category
    ) cat_agg;
    
    -- Calcular confidence score (Bayesian average)
    confidence := LEAST(1.0, total_count::DECIMAL / 50.0);
    
    -- Actualizar o insertar agregaciones
    INSERT INTO doctor_rating_aggregates (
        doctor_id, total_ratings, average_rating, 
        rating_distribution, category_averages, confidence_score, last_updated
    ) VALUES (
        target_doctor_id, total_count, COALESCE(avg_rating, 0), 
        COALESCE(distribution, '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'),
        COALESCE(category_averages, '{}'), confidence, NOW()
    )
    ON CONFLICT (doctor_id) DO UPDATE SET
        total_ratings = EXCLUDED.total_ratings,
        average_rating = EXCLUDED.average_rating,
        rating_distribution = EXCLUDED.rating_distribution,
        category_averages = EXCLUDED.category_averages,
        confidence_score = EXCLUDED.confidence_score,
        last_updated = EXCLUDED.last_updated;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 10. TRIGGERS PARA MANTENER AGREGACIONES
-- =============================================

-- Trigger para actualizar agregaciones cuando se inserta/actualiza una calificación
CREATE OR REPLACE FUNCTION trigger_update_rating_aggregates()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_doctor_rating_aggregates(NEW.doctor_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rating_aggregates
    AFTER INSERT OR UPDATE ON doctor_ratings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_rating_aggregates();

-- =============================================
-- 11. DATOS DE PRUEBA
-- =============================================

-- Insertar usuarios de prueba
INSERT INTO users (id, email, password_hash, first_name, last_name, role, specialty, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'doctor1@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.2', 'Dr. Juan', 'Pérez', 'doctor', 'Medicina General', TRUE),
('550e8400-e29b-41d4-a716-446655440002', 'doctor2@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.2', 'Dra. María', 'González', 'doctor', 'Cardiología', TRUE),
('550e8400-e29b-41d4-a716-446655440003', 'patient1@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.2', 'Carlos', 'López', 'patient', NULL, TRUE),
('550e8400-e29b-41d4-a716-446655440004', 'patient2@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.2', 'Ana', 'Martínez', 'patient', NULL, TRUE),
('550e8400-e29b-41d4-a716-446655440005', 'nurse1@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.2', 'Laura', 'Rodríguez', 'nurse', 'Enfermería', TRUE);

-- Insertar citas de prueba
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, status, type) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', NOW() + INTERVAL '1 day', 'scheduled', 'consultation'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', NOW() + INTERVAL '2 days', 'scheduled', 'consultation');

-- =============================================
-- 12. COMENTARIOS Y DOCUMENTACIÓN
-- =============================================

COMMENT ON TABLE users IS 'Usuarios del sistema (pacientes, doctores, enfermeras, admin)';
COMMENT ON TABLE appointments IS 'Citas médicas programadas';
COMMENT ON TABLE medical_records IS 'Registros médicos inmutables del sistema EHR';
COMMENT ON TABLE doctor_ratings IS 'Calificaciones de doctores por pacientes';
COMMENT ON TABLE doctor_rating_aggregates IS 'Agregaciones optimizadas de calificaciones';
COMMENT ON TABLE prescriptions IS 'Recetas médicas generadas';
COMMENT ON MATERIALIZED VIEW patient_current_state IS 'Vista materializada del estado médico actual de cada paciente';

COMMENT ON COLUMN medical_records.clinical_data IS 'Datos clínicos estructurados en formato JSONB';
COMMENT ON COLUMN doctor_ratings.categories IS 'Calificaciones por categorías específicas';
COMMENT ON COLUMN doctor_rating_aggregates.confidence_score IS 'Score de confianza basado en número de calificaciones';
