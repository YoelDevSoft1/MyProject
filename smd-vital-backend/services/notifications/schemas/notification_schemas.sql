-- =============================================
-- SMD VITAL - Notification Service Database Schema
-- =============================================
-- Diseñado para notificaciones multicanal con alta disponibilidad

-- Tabla de plantillas de notificaciones
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    
    -- Contenido de la plantilla
    subject_template TEXT,
    body_template TEXT NOT NULL,
    variables JSONB, -- Variables disponibles en la plantilla
    
    -- Configuración
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 1, -- 1=low, 2=normal, 3=high, 4=urgent
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_channel CHECK (channel IN (
        'email', 'sms', 'whatsapp', 'push', 'in_app'
    )),
    CONSTRAINT valid_priority CHECK (priority BETWEEN 1 AND 4)
);

-- Tabla de preferencias de notificación por usuario
CREATE TABLE user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    channel VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    delivery_time_start TIME DEFAULT '08:00:00',
    delivery_time_end TIME DEFAULT '22:00:00',
    timezone VARCHAR(50) DEFAULT 'America/Bogota',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, channel, event_type),
    CONSTRAINT valid_channel_pref CHECK (channel IN (
        'email', 'sms', 'whatsapp', 'push', 'in_app'
    ))
);

-- Tabla principal de notificaciones
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    
    -- Contenido procesado
    subject TEXT,
    body TEXT NOT NULL,
    metadata JSONB,
    
    -- Estado de entrega
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority INTEGER DEFAULT 1,
    
    -- Configuración de entrega
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    max_retries INTEGER DEFAULT 3,
    retry_count INTEGER DEFAULT 0,
    
    -- Resultado de entrega
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    external_id VARCHAR(255), -- ID del proveedor (SendGrid, Twilio, etc.)
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_notification_status CHECK (status IN (
        'pending', 'scheduled', 'processing', 'delivered', 
        'failed', 'canceled', 'expired'
    )),
    CONSTRAINT valid_notification_channel CHECK (channel IN (
        'email', 'sms', 'whatsapp', 'push', 'in_app'
    ))
);

-- Tabla de historial de eventos (Event Sourcing)
CREATE TABLE notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_event_type CHECK (event_type IN (
        'created', 'scheduled', 'processing', 'delivered', 
        'failed', 'retry', 'canceled', 'expired'
    ))
);

-- Tabla de proveedores de notificaciones
CREATE TABLE notification_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    channel VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB NOT NULL, -- Configuración específica del proveedor
    rate_limit_per_minute INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_provider_channel CHECK (channel IN (
        'email', 'sms', 'whatsapp', 'push', 'in_app'
    ))
);

-- Tabla de métricas de entrega
CREATE TABLE notification_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES notification_providers(id),
    channel VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    
    -- Contadores
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    
    -- Tiempos de respuesta
    avg_delivery_time_ms INTEGER,
    max_delivery_time_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(provider_id, channel, date)
);

-- Índices para optimización
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled_for ON notifications(scheduled_for);
CREATE INDEX idx_notifications_channel ON notifications(channel);
CREATE INDEX idx_notifications_event_type ON notifications(event_type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_notification_events_notification_id ON notification_events(notification_id);
CREATE INDEX idx_notification_events_event_type ON notification_events(event_type);
CREATE INDEX idx_notification_events_created_at ON notification_events(created_at);

CREATE INDEX idx_user_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX idx_user_preferences_channel ON user_notification_preferences(channel);

-- Triggers para auditoría
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

CREATE TRIGGER trigger_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_updated_at();

-- Función para crear evento de notificación
CREATE OR REPLACE FUNCTION create_notification_event(
    p_notification_id UUID,
    p_event_type VARCHAR(100),
    p_event_data JSONB
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO notification_events (notification_id, event_type, event_data)
    VALUES (p_notification_id, p_event_type, p_event_data)
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Vista para dashboard de notificaciones
CREATE VIEW notification_dashboard AS
SELECT 
    n.id,
    n.user_id,
    n.event_type,
    n.channel,
    n.status,
    n.priority,
    n.created_at,
    n.delivered_at,
    n.failed_at,
    CASE 
        WHEN n.status = 'delivered' THEN 'success'
        WHEN n.status = 'failed' THEN 'error'
        WHEN n.status = 'pending' OR n.status = 'scheduled' THEN 'pending'
        ELSE 'processing'
    END as status_category,
    EXTRACT(EPOCH FROM (n.delivered_at - n.created_at)) as delivery_time_seconds
FROM notifications n
WHERE n.created_at >= NOW() - INTERVAL '30 days';

-- Comentarios para documentación
COMMENT ON TABLE notifications IS 'Notificaciones multicanal con seguimiento de estado';
COMMENT ON TABLE notification_events IS 'Event sourcing para auditoría completa de notificaciones';
COMMENT ON TABLE notification_templates IS 'Plantillas reutilizables para diferentes tipos de notificaciones';
COMMENT ON TABLE user_notification_preferences IS 'Preferencias de notificación por usuario y canal';


