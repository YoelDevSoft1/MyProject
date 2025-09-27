-- =============================================
-- SMD VITAL - Health Metrics Database Schema
-- =============================================
-- Diseño híbrido optimizado para flexibilidad y rendimiento

-- Tabla de definiciones de métricas (catálogo)
CREATE TABLE health_metric_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_code VARCHAR(100) NOT NULL UNIQUE,
    metric_name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    
    -- Configuración de validación
    min_value DECIMAL(10,3),
    max_value DECIMAL(10,3),
    data_type VARCHAR(50) NOT NULL DEFAULT 'numeric',
    is_required BOOLEAN DEFAULT FALSE,
    
    -- Configuración de alertas
    warning_threshold_low DECIMAL(10,3),
    warning_threshold_high DECIMAL(10,3),
    critical_threshold_low DECIMAL(10,3),
    critical_threshold_high DECIMAL(10,3),
    
    -- Metadata
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_data_type CHECK (data_type IN (
        'numeric', 'text', 'boolean', 'categorical', 'date'
    )),
    CONSTRAINT valid_category CHECK (category IN (
        'vital_signs', 'lab_results', 'medications', 'symptoms', 
        'lifestyle', 'mental_health', 'physical_activity'
    ))
);

-- Tabla principal de métricas de salud (JSONB para flexibilidad)
CREATE TABLE health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    metric_code VARCHAR(100) NOT NULL,
    
    -- Datos flexibles en JSONB
    metric_data JSONB NOT NULL,
    
    -- Metadatos de la medición
    measured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100) DEFAULT 'manual', -- 'manual', 'device', 'imported'
    device_id VARCHAR(255),
    
    -- Contexto adicional
    notes TEXT,
    location VARCHAR(200),
    weather_conditions JSONB,
    
    -- Validación y calidad
    is_validated BOOLEAN DEFAULT FALSE,
    validation_notes TEXT,
    
    -- Índices para optimización
    CONSTRAINT fk_metric_definition 
        FOREIGN KEY (metric_code) 
        REFERENCES health_metric_definitions(metric_code),
    
    CONSTRAINT valid_source CHECK (source IN (
        'manual', 'device', 'imported', 'api', 'integration'
    ))
);

-- Tabla de agregaciones precalculadas (para rendimiento)
CREATE TABLE health_metric_aggregations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    metric_code VARCHAR(100) NOT NULL,
    
    -- Períodos de agregación
    period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Estadísticas calculadas
    count_measurements INTEGER NOT NULL DEFAULT 0,
    min_value DECIMAL(10,3),
    max_value DECIMAL(10,3),
    avg_value DECIMAL(10,3),
    median_value DECIMAL(10,3),
    std_deviation DECIMAL(10,3),
    
    -- Valores específicos para métricas categóricas
    most_common_value VARCHAR(200),
    value_distribution JSONB,
    
    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, metric_code, period_type, period_start),
    CONSTRAINT valid_period_type CHECK (period_type IN (
        'daily', 'weekly', 'monthly', 'yearly'
    ))
);

-- Tabla de alertas de salud
CREATE TABLE health_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    metric_code VARCHAR(100) NOT NULL,
    
    -- Detalles de la alerta
    alert_type VARCHAR(50) NOT NULL, -- 'warning', 'critical', 'trend'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    message TEXT NOT NULL,
    
    -- Datos que dispararon la alerta
    trigger_value DECIMAL(10,3),
    threshold_value DECIMAL(10,3),
    measured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Estado de la alerta
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_alert_type CHECK (alert_type IN (
        'warning', 'critical', 'trend', 'anomaly', 'goal_achieved'
    )),
    CONSTRAINT valid_severity CHECK (severity IN (
        'low', 'medium', 'high', 'critical'
    )),
    CONSTRAINT valid_alert_status CHECK (status IN (
        'active', 'acknowledged', 'resolved', 'dismissed'
    ))
);

-- Tabla de objetivos de salud
CREATE TABLE health_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    metric_code VARCHAR(100) NOT NULL,
    
    -- Configuración del objetivo
    goal_type VARCHAR(50) NOT NULL, -- 'target', 'maintain', 'improve', 'reduce'
    target_value DECIMAL(10,3),
    target_date DATE,
    
    -- Progreso
    current_value DECIMAL(10,3),
    progress_percentage DECIMAL(5,2),
    is_achieved BOOLEAN DEFAULT FALSE,
    achieved_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_goal_type CHECK (goal_type IN (
        'target', 'maintain', 'improve', 'reduce', 'track'
    ))
);

-- Índices optimizados para consultas de series temporales
CREATE INDEX idx_health_metrics_user_metric_time 
    ON health_metrics(user_id, metric_code, measured_at DESC);

CREATE INDEX idx_health_metrics_measured_at 
    ON health_metrics(measured_at DESC);

CREATE INDEX idx_health_metrics_metric_data_gin 
    ON health_metrics USING GIN(metric_data);

-- Índices para agregaciones
CREATE INDEX idx_health_aggregations_user_period 
    ON health_metric_aggregations(user_id, period_type, period_start DESC);

-- Índices para alertas
CREATE INDEX idx_health_alerts_user_status 
    ON health_alerts(user_id, status, created_at DESC);

CREATE INDEX idx_health_alerts_metric_type 
    ON health_alerts(metric_code, alert_type, status);

-- Índices para objetivos
CREATE INDEX idx_health_goals_user_active 
    ON health_goals(user_id, is_active, created_at DESC);

-- Funciones para consultas optimizadas de series temporales
CREATE OR REPLACE FUNCTION get_health_metrics_timeseries(
    p_user_id UUID,
    p_metric_code VARCHAR(100),
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE,
    p_aggregation VARCHAR(20) DEFAULT 'raw'
) RETURNS TABLE (
    measured_at TIMESTAMP WITH TIME ZONE,
    value DECIMAL(10,3),
    source VARCHAR(100)
) AS $$
BEGIN
    IF p_aggregation = 'raw' THEN
        RETURN QUERY
        SELECT 
            hm.measured_at,
            (hm.metric_data->>'value')::DECIMAL(10,3) as value,
            hm.source
        FROM health_metrics hm
        WHERE hm.user_id = p_user_id
            AND hm.metric_code = p_metric_code
            AND hm.measured_at BETWEEN p_start_date AND p_end_date
        ORDER BY hm.measured_at DESC;
    ELSE
        RETURN QUERY
        SELECT 
            hma.period_start as measured_at,
            hma.avg_value as value,
            'aggregated'::VARCHAR(100) as source
        FROM health_metric_aggregations hma
        WHERE hma.user_id = p_user_id
            AND hma.metric_code = p_metric_code
            AND hma.period_type = p_aggregation
            AND hma.period_start BETWEEN p_start_date AND p_end_date
        ORDER BY hma.period_start DESC;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para detectar anomalías
CREATE OR REPLACE FUNCTION detect_health_anomalies(
    p_user_id UUID,
    p_metric_code VARCHAR(100),
    p_days_back INTEGER DEFAULT 30
) RETURNS TABLE (
    measured_at TIMESTAMP WITH TIME ZONE,
    value DECIMAL(10,3),
    anomaly_score DECIMAL(5,3),
    is_anomaly BOOLEAN
) AS $$
DECLARE
    avg_val DECIMAL(10,3);
    std_val DECIMAL(10,3);
    threshold DECIMAL(5,3) := 2.0; -- 2 desviaciones estándar
BEGIN
    -- Calcular estadísticas de los últimos N días
    SELECT 
        AVG((metric_data->>'value')::DECIMAL(10,3)),
        STDDEV((metric_data->>'value')::DECIMAL(10,3))
    INTO avg_val, std_val
    FROM health_metrics
    WHERE user_id = p_user_id
        AND metric_code = p_metric_code
        AND measured_at >= NOW() - INTERVAL '1 day' * p_days_back;
    
    -- Retornar mediciones con score de anomalía
    RETURN QUERY
    SELECT 
        hm.measured_at,
        (hm.metric_data->>'value')::DECIMAL(10,3) as value,
        ABS((hm.metric_data->>'value')::DECIMAL(10,3) - avg_val) / NULLIF(std_val, 0) as anomaly_score,
        ABS((hm.metric_data->>'value')::DECIMAL(10,3) - avg_val) / NULLIF(std_val, 0) > threshold as is_anomaly
    FROM health_metrics hm
    WHERE hm.user_id = p_user_id
        AND hm.metric_code = p_metric_code
        AND hm.measured_at >= NOW() - INTERVAL '1 day' * p_days_back
    ORDER BY hm.measured_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar agregaciones automáticamente
CREATE OR REPLACE FUNCTION update_health_metric_aggregations()
RETURNS TRIGGER AS $$
DECLARE
    daily_start TIMESTAMP WITH TIME ZONE;
    daily_end TIMESTAMP WITH TIME ZONE;
    weekly_start TIMESTAMP WITH TIME ZONE;
    weekly_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calcular períodos
    daily_start := DATE_TRUNC('day', NEW.measured_at);
    daily_end := daily_start + INTERVAL '1 day';
    
    weekly_start := DATE_TRUNC('week', NEW.measured_at);
    weekly_end := weekly_start + INTERVAL '1 week';
    
    -- Actualizar agregación diaria
    INSERT INTO health_metric_aggregations (
        user_id, metric_code, period_type, period_start, period_end,
        count_measurements, min_value, max_value, avg_value
    )
    SELECT 
        NEW.user_id,
        NEW.metric_code,
        'daily',
        daily_start,
        daily_end,
        COUNT(*),
        MIN((metric_data->>'value')::DECIMAL(10,3)),
        MAX((metric_data->>'value')::DECIMAL(10,3)),
        AVG((metric_data->>'value')::DECIMAL(10,3))
    FROM health_metrics
    WHERE user_id = NEW.user_id
        AND metric_code = NEW.metric_code
        AND measured_at >= daily_start
        AND measured_at < daily_end
    ON CONFLICT (user_id, metric_code, period_type, period_start)
    DO UPDATE SET
        count_measurements = EXCLUDED.count_measurements,
        min_value = EXCLUDED.min_value,
        max_value = EXCLUDED.max_value,
        avg_value = EXCLUDED.avg_value,
        calculated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_health_aggregations
    AFTER INSERT ON health_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_health_metric_aggregations();

-- Vista para dashboard de salud
CREATE VIEW health_dashboard AS
SELECT 
    hm.user_id,
    hm.metric_code,
    hmd.metric_name,
    hmd.category,
    hmd.unit,
    COUNT(*) as total_measurements,
    MIN(hm.measured_at) as first_measurement,
    MAX(hm.measured_at) as last_measurement,
    AVG((hm.metric_data->>'value')::DECIMAL(10,3)) as avg_value,
    MIN((hm.metric_data->>'value')::DECIMAL(10,3)) as min_value,
    MAX((hm.metric_data->>'value')::DECIMAL(10,3)) as max_value
FROM health_metrics hm
JOIN health_metric_definitions hmd ON hm.metric_code = hmd.metric_code
WHERE hm.measured_at >= NOW() - INTERVAL '30 days'
GROUP BY hm.user_id, hm.metric_code, hmd.metric_name, hmd.category, hmd.unit;

-- Comentarios para documentación
COMMENT ON TABLE health_metrics IS 'Métricas de salud flexibles con JSONB para nuevos tipos de datos';
COMMENT ON TABLE health_metric_aggregations IS 'Agregaciones precalculadas para consultas rápidas de series temporales';
COMMENT ON TABLE health_alerts IS 'Sistema de alertas basado en umbrales y anomalías';
COMMENT ON TABLE health_goals IS 'Objetivos de salud personalizados por usuario';
COMMENT ON FUNCTION get_health_metrics_timeseries IS 'Función optimizada para consultas de series temporales';
COMMENT ON FUNCTION detect_health_anomalies IS 'Detección automática de anomalías usando estadísticas';


