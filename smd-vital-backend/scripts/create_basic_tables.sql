-- SMD VITAL - Basic Tables Creation
-- Crear tablas básicas en el orden correcto

-- =============================================
-- 1. TABLA DE USUARIOS (debe ir primero)
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
    role VARCHAR(50) NOT NULL DEFAULT 'patient',
    specialty VARCHAR(100),
    license_number VARCHAR(100),
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
    status VARCHAR(20) DEFAULT 'scheduled',
    type VARCHAR(50) DEFAULT 'consultation',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES users(id),
    CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- =============================================
-- 3. TABLA DE REGISTROS MÉDICOS
-- =============================================
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    appointment_id UUID NOT NULL,
    record_type VARCHAR(50) NOT NULL DEFAULT 'consultation',
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_by UUID NOT NULL,
    last_modified_by UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    
    clinical_data JSONB NOT NULL,
    
    CONSTRAINT fk_medical_patient FOREIGN KEY (patient_id) REFERENCES users(id),
    CONSTRAINT fk_medical_doctor FOREIGN KEY (doctor_id) REFERENCES users(id),
    CONSTRAINT fk_medical_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    CONSTRAINT fk_medical_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_medical_modified_by FOREIGN KEY (last_modified_by) REFERENCES users(id)
);

-- =============================================
-- 4. TABLA DE CALIFICACIONES
-- =============================================
CREATE TABLE IF NOT EXISTS doctor_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    appointment_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    categories JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    
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
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    
    CONSTRAINT fk_doctor_agg FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- =============================================
-- 6. TABLA DE RECETAS
-- =============================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    doctor_id UUID NOT NULL,
    prescription_data JSONB NOT NULL,
    pdf_url VARCHAR(500),
    pdf_generated_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_prescription_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id),
    CONSTRAINT fk_prescription_patient FOREIGN KEY (patient_id) REFERENCES users(id),
    CONSTRAINT fk_prescription_doctor FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- =============================================
-- 7. ÍNDICES BÁSICOS
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_ratings_doctor ON doctor_ratings(doctor_id);

-- =============================================
-- 8. DATOS DE PRUEBA
-- =============================================
INSERT INTO users (id, email, password_hash, first_name, last_name, role, specialty, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'doctor1@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.2', 'Dr. Juan', 'Pérez', 'doctor', 'Medicina General', TRUE),
('550e8400-e29b-41d4-a716-446655440002', 'doctor2@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.2', 'Dra. María', 'González', 'doctor', 'Cardiología', TRUE),
('550e8400-e29b-41d4-a716-446655440003', 'patient1@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.2', 'Carlos', 'López', 'patient', NULL, TRUE),
('550e8400-e29b-41d4-a716-446655440004', 'patient2@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.2', 'Ana', 'Martínez', 'patient', NULL, TRUE),
('550e8400-e29b-41d4-a716-446655440005', 'nurse1@smdvital.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.2', 'Laura', 'Rodríguez', 'nurse', 'Enfermería', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, status, type) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', NOW() + INTERVAL '1 day', 'scheduled', 'consultation'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', NOW() + INTERVAL '2 days', 'scheduled', 'consultation')
ON CONFLICT (id) DO NOTHING;
