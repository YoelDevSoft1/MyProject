-- =============================================
-- SMD VITAL - Payment Service Database Schema
-- =============================================
-- Diseñado para cumplir con PCI DSS y auditoría completa

-- Tabla principal de transacciones
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    -- Stripe Integration
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_charge_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    
    -- Transaction Details
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'COP',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    
    -- Payment Method Info (sin datos sensibles)
    payment_method_type VARCHAR(50), -- 'card', 'pse', 'nequi'
    last_four_digits VARCHAR(4),
    brand VARCHAR(50), -- 'visa', 'mastercard', etc.
    
    -- Metadata para auditoría
    metadata JSONB,
    failure_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN (
        'pending', 'processing', 'succeeded', 'failed', 
        'canceled', 'requires_action', 'requires_payment_method'
    )),
    CONSTRAINT valid_currency CHECK (currency IN ('COP', 'USD'))
);

-- Tabla de reembolsos
CREATE TABLE payment_refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES payment_transactions(id),
    stripe_refund_id VARCHAR(255) UNIQUE NOT NULL,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    reason VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_refund_status CHECK (status IN (
        'pending', 'succeeded', 'failed', 'canceled'
    )),
    CONSTRAINT valid_refund_reason CHECK (reason IN (
        'duplicate', 'fraudulent', 'requested_by_customer'
    ))
);

-- Tabla de webhooks de Stripe (para idempotencia)
CREATE TABLE stripe_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processing_attempts INTEGER DEFAULT 0,
    raw_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para optimización
CREATE INDEX idx_payment_transactions_appointment ON payment_transactions(appointment_id);
CREATE INDEX idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX idx_payment_transactions_stripe_pi ON payment_transactions(stripe_payment_intent_id);

-- Índices para webhooks
CREATE INDEX idx_stripe_webhooks_event_id ON stripe_webhooks(stripe_event_id);
CREATE INDEX idx_stripe_webhooks_processed ON stripe_webhooks(processed);
CREATE INDEX idx_stripe_webhooks_event_type ON stripe_webhooks(event_type);

-- Triggers para auditoría
CREATE OR REPLACE FUNCTION update_payment_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_transaction_updated_at();

-- Vista para reportes de pagos
CREATE VIEW payment_summary AS
SELECT 
    pt.id,
    pt.appointment_id,
    pt.user_id,
    pt.amount_cents,
    pt.currency,
    pt.status,
    pt.payment_method_type,
    pt.brand,
    pt.last_four_digits,
    pt.created_at,
    pt.processed_at,
    CASE 
        WHEN pt.status = 'succeeded' THEN pt.amount_cents
        ELSE 0
    END as successful_amount_cents
FROM payment_transactions pt;

-- Comentarios para documentación
COMMENT ON TABLE payment_transactions IS 'Transacciones de pago con integración Stripe';
COMMENT ON COLUMN payment_transactions.stripe_payment_intent_id IS 'ID único de Stripe PaymentIntent';
COMMENT ON COLUMN payment_transactions.metadata IS 'Datos adicionales del pago (no sensibles)';
COMMENT ON COLUMN payment_transactions.failure_reason IS 'Razón del fallo si el pago falla';


