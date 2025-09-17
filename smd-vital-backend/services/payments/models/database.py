"""
SMD Vital - Payment Service Database Models
===========================================

Modelos de base de datos para el servicio de pagos.
Incluye transacciones, facturas, métodos de pago y reconciliación.

Author: Backend Team
"""

from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, ForeignKey, Date, Numeric, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from datetime import datetime, date
from enum import Enum
from decimal import Decimal
import uuid

Base = declarative_base()


class PaymentStatus(Enum):
    """Estado del pago"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"
    PARTIALLY_REFUNDED = "partially_refunded"
    DISPUTED = "disputed"
    ON_HOLD = "on_hold"


class PaymentMethod(Enum):
    """Método de pago"""
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    BANK_TRANSFER = "bank_transfer"
    PSE = "pse"
    CASH = "cash"
    EFECTY = "efecty"
    NEQUI = "nequi"
    DAVIPLATA = "daviplata"
    BANCOLOMBIA_BUTTON = "bancolombia_button"
    PAYPAL = "paypal"
    MERCADOPAGO = "mercadopago"
    OTHER = "other"


class PaymentProcessor(Enum):
    """Procesador de pagos"""
    STRIPE = "stripe"
    PAYU = "payu"
    MERCADOPAGO = "mercadopago"
    WOMPI = "wompi"
    EPAYCO = "epayco"
    INTERNAL = "internal"


class TransactionType(Enum):
    """Tipo de transacción"""
    PAYMENT = "payment"
    REFUND = "refund"
    CHARGEBACK = "chargeback"
    FEE = "fee"
    ADJUSTMENT = "adjustment"
    WITHDRAWAL = "withdrawal"


class InvoiceStatus(Enum):
    """Estado de la factura"""
    DRAFT = "draft"
    SENT = "sent"
    VIEWED = "viewed"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"
    VOIDED = "voided"


class ReconciliationStatus(Enum):
    """Estado de reconciliación"""
    PENDING = "pending"
    MATCHED = "matched"
    UNMATCHED = "unmatched"
    DISPUTED = "disputed"
    RESOLVED = "resolved"


class Payment(Base):
    """
    Modelo principal de pagos
    """
    __tablename__ = 'payments'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payment_number = Column(String(20), unique=True, nullable=False, index=True)
    external_id = Column(String(100), nullable=True, index=True)  # ID del procesador externo
    
    # Participantes
    payer_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # Usuario que paga
    recipient_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Destinatario (opcional)
    
    # Información del pago
    amount = Column(Numeric(12, 2), nullable=False)  # Monto principal
    currency = Column(String(3), default='COP', nullable=False)
    tax_amount = Column(Numeric(12, 2), default=0, nullable=False)
    fee_amount = Column(Numeric(12, 2), default=0, nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)  # Monto total
    
    # Método y procesador
    payment_method = Column(SQLEnum(PaymentMethod), nullable=False)
    payment_processor = Column(SQLEnum(PaymentProcessor), nullable=False)
    processor_transaction_id = Column(String(100), nullable=True, index=True)
    
    # Estado y seguimiento
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False, index=True)
    previous_status = Column(SQLEnum(PaymentStatus), nullable=True)
    status_changed_at = Column(DateTime, nullable=True)
    
    # Descripción y referencia
    description = Column(String(255), nullable=False)
    reference = Column(String(100), nullable=True, index=True)  # Referencia externa
    appointment_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Cita relacionada
    invoice_id = Column(UUID(as_uuid=True), ForeignKey('invoices.id'), nullable=True, index=True)
    
    # Información de la tarjeta/cuenta (encriptada)
    card_last_four = Column(String(4), nullable=True)
    card_brand = Column(String(20), nullable=True)
    bank_name = Column(String(100), nullable=True)
    account_type = Column(String(20), nullable=True)
    
    # Fechas importantes
    payment_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Información de riesgo y fraude
    fraud_score = Column(Numeric(5, 2), nullable=True)  # Score de 0-100
    risk_assessment = Column(JSONB, nullable=True)
    is_flagged = Column(Boolean, default=False, nullable=False)
    
    # Información del cliente
    customer_ip = Column(String(45), nullable=True)
    customer_user_agent = Column(Text, nullable=True)
    billing_address = Column(JSONB, nullable=True)
    
    # Información adicional
    meta_data = Column(JSONB, nullable=True)  # Datos adicionales del procesador
    processor_response = Column(JSONB, nullable=True)  # Respuesta completa del procesador
    failure_reason = Column(String(255), nullable=True)
    failure_code = Column(String(50), nullable=True)
    
    # Información de reconciliación
    reconciliation_status = Column(SQLEnum(ReconciliationStatus), default=ReconciliationStatus.PENDING, nullable=False)
    reconciled_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    initiated_by = Column(UUID(as_uuid=True), nullable=False)
    
    # Relaciones
    invoice = relationship("Invoice", back_populates="payments")
    transactions = relationship("Transaction", back_populates="payment", cascade="all, delete-orphan")
    refunds = relationship("Refund", back_populates="original_payment", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Payment(id={self.id}, number={self.payment_number}, amount={self.total_amount}, status={self.status})>"

    @property
    def net_amount(self):
        """Monto neto después de fees"""
        return self.total_amount - self.fee_amount


class Transaction(Base):
    """
    Modelo para transacciones individuales (movimientos de dinero)
    """
    __tablename__ = 'transactions'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_number = Column(String(20), unique=True, nullable=False, index=True)
    payment_id = Column(UUID(as_uuid=True), ForeignKey('payments.id'), nullable=False, index=True)
    
    # Información de la transacción
    transaction_type = Column(SQLEnum(TransactionType), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default='COP', nullable=False)
    
    # Estado
    status = Column(SQLEnum(PaymentStatus), nullable=False, index=True)
    
    # Información del procesador
    processor_transaction_id = Column(String(100), nullable=True, index=True)
    processor_reference = Column(String(100), nullable=True)
    authorization_code = Column(String(50), nullable=True)
    
    # Descripción
    description = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    
    # Información adicional
    processor_response = Column(JSONB, nullable=True)
    meta_data = Column(JSONB, nullable=True)
    
    # Timestamps
    transaction_date = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    payment = relationship("Payment", back_populates="transactions")
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, type={self.transaction_type}, amount={self.amount})>"


class Invoice(Base):
    """
    Modelo para facturas
    """
    __tablename__ = 'invoices'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_number = Column(String(20), unique=True, nullable=False, index=True)
    
    # Cliente
    customer_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(20), nullable=True)
    
    # Información de facturación
    billing_address = Column(JSONB, nullable=True)
    tax_id = Column(String(50), nullable=True)  # NIT o documento de identidad
    
    # Montos
    subtotal = Column(Numeric(12, 2), nullable=False)
    tax_rate = Column(Numeric(5, 4), default=0.19, nullable=False)  # IVA 19%
    tax_amount = Column(Numeric(12, 2), nullable=False)
    discount_amount = Column(Numeric(12, 2), default=0, nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    
    # Estado y fechas
    status = Column(SQLEnum(InvoiceStatus), default=InvoiceStatus.DRAFT, nullable=False, index=True)
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    sent_date = Column(DateTime, nullable=True)
    viewed_date = Column(DateTime, nullable=True)
    paid_date = Column(DateTime, nullable=True)
    
    # Información adicional
    description = Column(Text, nullable=True)
    terms_and_conditions = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Referencias
    appointment_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    po_number = Column(String(50), nullable=True)  # Purchase Order Number
    
    # Información de pago
    payment_instructions = Column(Text, nullable=True)
    payment_terms = Column(String(100), nullable=True)  # Net 30, etc.
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    
    # Relaciones
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="invoice")
    
    def __repr__(self):
        return f"<Invoice(id={self.id}, number={self.invoice_number}, total={self.total_amount}, status={self.status})>"

    @property
    def is_overdue(self):
        """Verificar si la factura está vencida"""
        return self.status in [InvoiceStatus.SENT, InvoiceStatus.VIEWED] and date.today() > self.due_date

    @property
    def days_overdue(self):
        """Días de vencimiento"""
        if self.is_overdue:
            return (date.today() - self.due_date).days
        return 0


class InvoiceItem(Base):
    """
    Modelo para items de factura
    """
    __tablename__ = 'invoice_items'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey('invoices.id'), nullable=False, index=True)
    
    # Información del item
    description = Column(String(255), nullable=False)
    service_code = Column(String(50), nullable=True)
    quantity = Column(Numeric(10, 2), default=1, nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    
    # Cálculos
    line_total = Column(Numeric(12, 2), nullable=False)
    discount_percentage = Column(Numeric(5, 2), default=0, nullable=False)
    discount_amount = Column(Numeric(12, 2), default=0, nullable=False)
    tax_rate = Column(Numeric(5, 4), default=0.19, nullable=False)
    tax_amount = Column(Numeric(12, 2), nullable=False)
    
    # Información adicional
    notes = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    
    # Referencias
    appointment_id = Column(UUID(as_uuid=True), nullable=True)
    medical_service_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relaciones
    invoice = relationship("Invoice", back_populates="items")
    
    def __repr__(self):
        return f"<InvoiceItem(id={self.id}, description={self.description}, total={self.line_total})>"


class Refund(Base):
    """
    Modelo para reembolsos
    """
    __tablename__ = 'refunds'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    refund_number = Column(String(20), unique=True, nullable=False, index=True)
    original_payment_id = Column(UUID(as_uuid=True), ForeignKey('payments.id'), nullable=False, index=True)
    
    # Información del reembolso
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), default='COP', nullable=False)
    reason = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Estado
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False, index=True)
    
    # Información del procesador
    processor_refund_id = Column(String(100), nullable=True, index=True)
    processor_response = Column(JSONB, nullable=True)
    
    # Fechas
    requested_date = Column(DateTime, nullable=False)
    processed_date = Column(DateTime, nullable=True)
    
    # Información del solicitante
    requested_by = Column(UUID(as_uuid=True), nullable=False)
    approved_by = Column(UUID(as_uuid=True), nullable=True)
    
    # Información adicional
    meta_data = Column(JSONB, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    original_payment = relationship("Payment", back_populates="refunds")
    
    def __repr__(self):
        return f"<Refund(id={self.id}, amount={self.amount}, status={self.status})>"


class PaymentMethod_Entity(Base):
    """
    Modelo para métodos de pago guardados de usuarios
    """
    __tablename__ = 'saved_payment_methods'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    
    # Información del método de pago
    type = Column(SQLEnum(PaymentMethod), nullable=False)
    provider = Column(SQLEnum(PaymentProcessor), nullable=False)
    external_id = Column(String(100), nullable=True)  # ID en el procesador
    
    # Información de la tarjeta (tokenizada/encriptada)
    card_last_four = Column(String(4), nullable=True)
    card_brand = Column(String(20), nullable=True)
    card_exp_month = Column(Integer, nullable=True)
    card_exp_year = Column(Integer, nullable=True)
    cardholder_name = Column(String(255), nullable=True)
    
    # Información del banco
    bank_name = Column(String(100), nullable=True)
    account_type = Column(String(20), nullable=True)
    
    # Configuración
    is_default = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    nickname = Column(String(100), nullable=True)
    
    # Información de facturación
    billing_address = Column(JSONB, nullable=True)
    
    # Información adicional
    meta_data = Column(JSONB, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_used = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<PaymentMethod_Entity(id={self.id}, type={self.type}, last_four={self.card_last_four})>"


class FraudAlert(Base):
    """
    Modelo para alertas de fraude
    """
    __tablename__ = 'fraud_alerts'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    payment_id = Column(UUID(as_uuid=True), ForeignKey('payments.id'), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    
    # Información de la alerta
    alert_type = Column(String(50), nullable=False, index=True)  # velocity, location, device, etc.
    severity = Column(String(20), nullable=False, index=True)  # low, medium, high, critical
    score = Column(Numeric(5, 2), nullable=False)  # Score de riesgo 0-100
    
    # Descripción
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    
    # Estado
    status = Column(String(20), default='active', nullable=False)  # active, resolved, false_positive
    resolved_by = Column(UUID(as_uuid=True), nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    # Información contextual
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    location_data = Column(JSONB, nullable=True)
    device_fingerprint = Column(String(255), nullable=True)
    
    # Datos de la alerta
    alert_data = Column(JSONB, nullable=True)  # Datos específicos de la alerta
    rules_triggered = Column(ARRAY(String), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relaciones
    payment = relationship("Payment")
    
    def __repr__(self):
        return f"<FraudAlert(id={self.id}, type={self.alert_type}, severity={self.severity})>"


class PaymentStatistics(Base):
    """
    Modelo para estadísticas de pagos (agregadas diariamente)
    """
    __tablename__ = 'payment_statistics'

    # Identificación
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date = Column(Date, nullable=False, index=True)
    
    # Estadísticas de transacciones
    total_transactions = Column(Integer, default=0, nullable=False)
    successful_transactions = Column(Integer, default=0, nullable=False)
    failed_transactions = Column(Integer, default=0, nullable=False)
    
    # Estadísticas de montos
    total_volume = Column(Numeric(15, 2), default=0, nullable=False)
    successful_volume = Column(Numeric(15, 2), default=0, nullable=False)
    average_transaction_amount = Column(Numeric(12, 2), nullable=True)
    
    # Estadísticas por método de pago
    card_transactions = Column(Integer, default=0, nullable=False)
    bank_transfer_transactions = Column(Integer, default=0, nullable=False)
    cash_transactions = Column(Integer, default=0, nullable=False)
    
    # Estadísticas de refunds
    total_refunds = Column(Integer, default=0, nullable=False)
    refund_volume = Column(Numeric(15, 2), default=0, nullable=False)
    
    # Métricas de calidad
    success_rate = Column(Numeric(5, 2), nullable=True)  # Porcentaje de éxito
    fraud_rate = Column(Numeric(5, 2), nullable=True)  # Porcentaje de fraude
    chargeback_rate = Column(Numeric(5, 2), nullable=True)  # Porcentaje de contracargos
    
    # Información por procesador (opcional)
    processor = Column(SQLEnum(PaymentProcessor), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<PaymentStatistics(id={self.id}, date={self.date}, transactions={self.total_transactions})>"


# Database Configuration
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://smdvital:smdvital_password_2024@localhost:5432/smdvital_payments")

# Create engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency to get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
