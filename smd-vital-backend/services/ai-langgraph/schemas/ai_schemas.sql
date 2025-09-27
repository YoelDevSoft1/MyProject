-- SMD VITAL - AI LangGraph Service Database Schema
-- ================================================

-- Tabla para almacenar consultas de IA
CREATE TABLE IF NOT EXISTS ai_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_id UUID NOT NULL,
    query_type VARCHAR(50) NOT NULL, -- diagnosis, medication, imaging, monitoring, documentation, prediction
    query_text TEXT NOT NULL,
    query_data JSONB, -- Datos adicionales como imágenes, signos vitales, etc.
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar respuestas de IA
CREATE TABLE IF NOT EXISTS ai_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_id UUID NOT NULL REFERENCES ai_queries(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    confidence_score DECIMAL(5,2), -- 0.00 a 100.00
    response_data JSONB, -- Datos estructurados de la respuesta
    model_used VARCHAR(100), -- openai-gpt4, anthropic-claude, etc.
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar workflows de LangGraph
CREATE TABLE IF NOT EXISTS ai_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    workflow_config JSONB NOT NULL, -- Configuración del workflow de LangGraph
    is_active BOOLEAN DEFAULT TRUE,
    version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar sesiones de IA
CREATE TABLE IF NOT EXISTS ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_name VARCHAR(200),
    context_data JSONB, -- Contexto de la sesión (historial médico, preferencias, etc.)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar modelos de IA y sus configuraciones
CREATE TABLE IF NOT EXISTS ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    provider VARCHAR(50) NOT NULL, -- openai, anthropic, local, etc.
    model_type VARCHAR(50) NOT NULL, -- text, image, multimodal
    config JSONB NOT NULL, -- Configuración específica del modelo
    is_available BOOLEAN DEFAULT TRUE,
    cost_per_token DECIMAL(10,6),
    max_tokens INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar métricas de uso de IA
CREATE TABLE IF NOT EXISTS ai_usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    query_id UUID REFERENCES ai_queries(id),
    model_id UUID REFERENCES ai_models(id),
    tokens_used INTEGER,
    cost DECIMAL(10,4),
    processing_time_ms INTEGER,
    success BOOLEAN,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar plantillas de prompts médicos
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- diagnosis, medication, imaging, etc.
    template_text TEXT NOT NULL,
    variables JSONB, -- Variables que puede usar el template
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_ai_queries_user_id ON ai_queries (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_queries_session_id ON ai_queries (session_id);
CREATE INDEX IF NOT EXISTS idx_ai_queries_query_type ON ai_queries (query_type);
CREATE INDEX IF NOT EXISTS idx_ai_queries_status ON ai_queries (status);
CREATE INDEX IF NOT EXISTS idx_ai_queries_created_at ON ai_queries (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_responses_query_id ON ai_responses (query_id);
CREATE INDEX IF NOT EXISTS idx_ai_responses_created_at ON ai_responses (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON ai_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_is_active ON ai_sessions (is_active);

CREATE INDEX IF NOT EXISTS idx_ai_usage_metrics_user_id ON ai_usage_metrics (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_metrics_created_at ON ai_usage_metrics (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_category ON ai_prompt_templates (category);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_is_active ON ai_prompt_templates (is_active);

-- Insertar datos iniciales
INSERT INTO ai_workflows (name, description, workflow_config) VALUES 
('diagnosis_workflow', 'Workflow para diagnóstico médico', '{"nodes": ["symptom_analysis", "differential_diagnosis", "confidence_scoring"], "edges": [{"from": "symptom_analysis", "to": "differential_diagnosis"}, {"from": "differential_diagnosis", "to": "confidence_scoring"}]}'),
('medication_workflow', 'Workflow para recomendación de medicamentos', '{"nodes": ["condition_analysis", "drug_interaction_check", "dosage_calculation"], "edges": [{"from": "condition_analysis", "to": "drug_interaction_check"}, {"from": "drug_interaction_check", "to": "dosage_calculation"}]}'),
('imaging_workflow', 'Workflow para análisis de imágenes médicas', '{"nodes": ["image_preprocessing", "feature_extraction", "classification"], "edges": [{"from": "image_preprocessing", "to": "feature_extraction"}, {"from": "feature_extraction", "to": "classification"}]}');

INSERT INTO ai_models (name, provider, model_type, config, cost_per_token, max_tokens) VALUES 
('gpt-4', 'openai', 'text', '{"temperature": 0.1, "max_tokens": 4000}', 0.00003, 4000),
('gpt-3.5-turbo', 'openai', 'text', '{"temperature": 0.1, "max_tokens": 4000}', 0.000002, 4000),
('claude-3-sonnet', 'anthropic', 'text', '{"temperature": 0.1, "max_tokens": 4000}', 0.000015, 4000),
('claude-3-haiku', 'anthropic', 'text', '{"temperature": 0.1, "max_tokens": 4000}', 0.0000025, 4000);

INSERT INTO ai_prompt_templates (name, category, template_text, variables) VALUES 
('diagnosis_prompt', 'diagnosis', 'Como médico especialista, analiza los siguientes síntomas: {symptoms}. Historial médico: {medical_history}. Edad: {age}, Sexo: {gender}. Proporciona un diagnóstico diferencial con niveles de confianza.', '["symptoms", "medical_history", "age", "gender"]'),
('medication_prompt', 'medication', 'Como farmacéutico clínico, recomienda medicamentos para: {condition}. Alergias conocidas: {allergies}. Medicamentos actuales: {current_medications}. Considera interacciones y dosificaciones apropiadas.', '["condition", "allergies", "current_medications"]'),
('imaging_prompt', 'imaging', 'Como radiólogo especialista, analiza esta imagen médica: {image_description}. Tipo de estudio: {study_type}. Hallazgos relevantes: {relevant_findings}. Proporciona un reporte detallado.', '["image_description", "study_type", "relevant_findings"]');


