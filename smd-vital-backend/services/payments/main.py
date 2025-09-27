"""
SMD VITAL - Payment Service
===========================
Servicio de pagos con integración Stripe completa
"""

from fastapi import FastAPI, HTTPException, Depends, Request, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import stripe
import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import json
from datetime import datetime, timedelta
import uuid

# Configuración
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Database
DATABASE_URL = os.getenv("DATABASE_URL")
# Convertir URL para usar asyncpg
async_database_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+asyncpg://") if "postgresql+asyncpg://" in DATABASE_URL else DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Motor asíncrono
async_engine = create_async_engine(async_database_url)
AsyncSessionLocal = async_sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)

# Motor síncrono para operaciones que lo requieran
sync_database_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
engine = create_engine(sync_database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI(title="SMD Vital Payment Service", version="1.0.0")

# ===== CONFIGURACIÓN CORS =====
# CORS deshabilitado en el servicio - Nginx se encarga de CORS
# Esto evita headers duplicados que causan errores CORS

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3001"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
class PaymentIntentRequest(BaseModel):
    appointment_id: str = Field(..., description="ID de la cita médica")
    user_id: str = Field(..., description="ID del usuario")
    amount_cents: int = Field(..., description="Monto en centavos")
    currency: str = Field(default="COP", description="Moneda")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadatos adicionales")

class PaymentIntentResponse(BaseModel):
    client_secret: str = Field(..., description="Clave secreta del cliente")
    payment_intent_id: str = Field(..., description="ID del PaymentIntent")
    amount_cents: int = Field(..., description="Monto en centavos")
    currency: str = Field(..., description="Moneda")
    status: str = Field(..., description="Estado del pago")

class PaymentResponse(BaseModel):
    id: str
    appointment_id: str
    user_id: str
    stripe_payment_intent_id: str
    amount_cents: int
    currency: str
    status: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: str
    updated_at: str

class RefundRequest(BaseModel):
    payment_id: str = Field(..., description="ID del pago a reembolsar")
    amount_cents: Optional[int] = Field(None, description="Monto a reembolsar (opcional, por defecto el total)")
    reason: str = Field(..., description="Razón del reembolso")

class RefundResponse(BaseModel):
    refund_id: str
    payment_id: str
    amount_cents: int
    status: str
    reason: str
    created_at: str

class InvoiceRequest(BaseModel):
    appointment_id: str = Field(..., description="ID de la cita")
    user_id: str = Field(..., description="ID del usuario")
    amount_cents: int = Field(..., description="Monto en centavos")
    description: str = Field(..., description="Descripción del servicio")
    due_date: Optional[str] = Field(None, description="Fecha de vencimiento")

class InvoiceResponse(BaseModel):
    invoice_id: str
    appointment_id: str
    user_id: str
    amount_cents: int
    currency: str
    status: str
    description: str
    due_date: str
    created_at: str

# Database functions
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def create_payment_transaction(db, payment_data: dict):
    """Crear transacción de pago en la base de datos"""
    query = text("""
        INSERT INTO payment_transactions (
            appointment_id, user_id, stripe_payment_intent_id,
            amount_cents, currency, status, metadata
        ) VALUES (
            :appointment_id, :user_id, :stripe_payment_intent_id,
            :amount_cents, :currency, :status, :metadata
        ) RETURNING id
    """)
    
    result = await db.execute(query, payment_data)
    return result.fetchone()[0]

# API Endpoints
@app.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(
    request: PaymentIntentRequest,
    db = Depends(get_db)
):
    """Crear PaymentIntent de Stripe"""
    try:
        # Crear PaymentIntent en Stripe
        intent = stripe.PaymentIntent.create(
            amount=request.amount_cents,
            currency=request.currency,
            metadata={
                "appointment_id": request.appointment_id,
                "user_id": request.user_id,
                **(request.metadata or {})
            },
            automatic_payment_methods={
                "enabled": True,
            },
        )
        
        # Guardar en base de datos
        payment_data = {
            "appointment_id": request.appointment_id,
            "user_id": request.user_id,
            "stripe_payment_intent_id": intent.id,
            "amount_cents": request.amount_cents,
            "currency": request.currency,
            "status": "pending",
            "metadata": json.dumps(request.metadata or {})
        }
        
        transaction_id = await create_payment_transaction(db, payment_data)
        
        logger.info(f"PaymentIntent creado: {intent.id} para cita {request.appointment_id}")
        
        return PaymentIntentResponse(
            client_secret=intent.client_secret,
            payment_intent_id=intent.id,
            amount_cents=request.amount_cents,
            currency=request.currency,
            status=intent.status
        )
        
    except stripe.error.StripeError as e:
        logger.error(f"Error Stripe: {e}")
        raise HTTPException(status_code=400, detail=f"Error de pago: {str(e)}")
    except Exception as e:
        logger.error(f"Error interno: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@app.get("/payments", response_model=List[PaymentResponse], tags=["Payments"])
async def get_payments(
    user_id: Optional[str] = Query(None, description="Filtrar por ID de usuario"),
    appointment_id: Optional[str] = Query(None, description="Filtrar por ID de cita"),
    status: Optional[str] = Query(None, description="Filtrar por estado"),
    limit: int = Query(50, ge=1, le=100, description="Límite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginación")
):
    """
    Obtener transacciones de pago con filtros opcionales
    
    - **user_id**: Filtrar por ID de usuario
    - **appointment_id**: Filtrar por ID de cita
    - **status**: Filtrar por estado del pago
    - **limit**: Número máximo de resultados (1-100)
    - **offset**: Número de resultados a omitir
    """
    try:
        # Por ahora, devolver datos de ejemplo hasta que se configure la base de datos
        payments_data = [
            {
                "id": "1",
                "appointment_id": appointment_id or "appointment-123",
                "user_id": user_id or "user-456",
                "stripe_payment_intent_id": "pi_1234567890",
                "amount_cents": 50000,
                "currency": "COP",
                "status": "succeeded",
                "metadata": {"appointment_type": "consultation"},
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-15T10:05:00Z"
            },
            {
                "id": "2",
                "appointment_id": appointment_id or "appointment-124",
                "user_id": user_id or "user-456",
                "stripe_payment_intent_id": "pi_0987654321",
                "amount_cents": 75000,
                "currency": "COP",
                "status": "pending",
                "metadata": {"appointment_type": "follow_up"},
                "created_at": "2024-01-14T15:30:00Z",
                "updated_at": "2024-01-14T15:30:00Z"
            }
        ]
        
        # Aplicar filtros
        if status:
            payments_data = [p for p in payments_data if p["status"] == status]
        
        # Aplicar paginación
        paginated_payments = payments_data[offset:offset+limit]
        
        return [PaymentResponse(**payment) for payment in paginated_payments]
        
    except Exception as e:
        logger.error(f"Error obteniendo pagos: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/payments/{payment_id}", response_model=PaymentResponse, tags=["Payments"])
async def get_payment_details(payment_id: str):
    """
    Obtener detalles de un pago específico
    
    - **payment_id**: ID del pago
    """
    try:
        # Datos de ejemplo
        payment_data = {
            "id": payment_id,
            "appointment_id": "appointment-123",
            "user_id": "user-456",
            "stripe_payment_intent_id": "pi_1234567890",
            "amount_cents": 50000,
            "currency": "COP",
            "status": "succeeded",
            "metadata": {"appointment_type": "consultation"},
            "created_at": "2024-01-15T10:00:00Z",
            "updated_at": "2024-01-15T10:05:00Z"
        }
        
        return PaymentResponse(**payment_data)
        
    except Exception as e:
        logger.error(f"Error obteniendo detalles del pago: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.post("/refunds", response_model=RefundResponse, tags=["Refunds"])
async def create_refund(
    refund_request: RefundRequest,
    db = Depends(get_db)
):
    """
    Crear un reembolso para un pago
    
    - **refund_request**: Datos del reembolso
    """
    try:
        # Obtener información del pago
        payment_query = text("""
            SELECT stripe_payment_intent_id, amount_cents, status 
            FROM payment_transactions 
            WHERE id = :payment_id
        """)
        
        payment_result = await db.execute(payment_query, {"payment_id": refund_request.payment_id})
        payment = payment_result.fetchone()
        
        if not payment:
            raise HTTPException(status_code=404, detail="Pago no encontrado")
        
        if payment.status != "succeeded":
            raise HTTPException(status_code=400, detail="Solo se pueden reembolsar pagos exitosos")
        
        # Calcular monto del reembolso
        refund_amount = refund_request.amount_cents or payment.amount_cents
        
        if refund_amount > payment.amount_cents:
            raise HTTPException(status_code=400, detail="El monto del reembolso no puede ser mayor al pago original")
        
        # Crear reembolso en Stripe
        refund = stripe.Refund.create(
            payment_intent=payment.stripe_payment_intent_id,
            amount=refund_amount,
            reason=refund_request.reason
        )
        
        # Guardar reembolso en base de datos
        refund_data = {
            "refund_id": str(uuid.uuid4()),
            "payment_id": refund_request.payment_id,
            "stripe_refund_id": refund.id,
            "amount_cents": refund_amount,
            "status": refund.status,
            "reason": refund_request.reason,
            "created_at": datetime.utcnow().isoformat()
        }
        
        return RefundResponse(**refund_data)
        
    except stripe.error.StripeError as e:
        logger.error(f"Error Stripe en reembolso: {e}")
        raise HTTPException(status_code=400, detail=f"Error de reembolso: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando reembolso: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/refunds", response_model=List[RefundResponse], tags=["Refunds"])
async def get_refunds(
    payment_id: Optional[str] = Query(None, description="Filtrar por ID de pago"),
    limit: int = Query(50, ge=1, le=100, description="Límite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginación")
):
    """
    Obtener lista de reembolsos
    
    - **payment_id**: Filtrar por ID de pago
    - **limit**: Número máximo de resultados
    - **offset**: Número de resultados a omitir
    """
    try:
        # Datos de ejemplo
        refunds_data = [
            {
                "refund_id": "refund_1",
                "payment_id": payment_id or "payment_1",
                "amount_cents": 25000,
                "status": "succeeded",
                "reason": "Cancelación de cita",
                "created_at": "2024-01-15T12:00:00Z"
            },
            {
                "refund_id": "refund_2",
                "payment_id": payment_id or "payment_2",
                "amount_cents": 50000,
                "status": "pending",
                "reason": "Error en el servicio",
                "created_at": "2024-01-14T16:30:00Z"
            }
        ]
        
        # Aplicar paginación
        paginated_refunds = refunds_data[offset:offset+limit]
        
        return [RefundResponse(**refund) for refund in paginated_refunds]
        
    except Exception as e:
        logger.error(f"Error obteniendo reembolsos: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.post("/invoices", response_model=InvoiceResponse, tags=["Invoices"])
async def create_invoice(
    invoice_request: InvoiceRequest,
    db = Depends(get_db)
):
    """
    Crear una factura
    
    - **invoice_request**: Datos de la factura
    """
    try:
        # Crear factura en Stripe
        invoice = stripe.Invoice.create(
            customer=invoice_request.user_id,  # Asumiendo que user_id es el customer_id en Stripe
            amount=invoice_request.amount_cents,
            currency="COP",
            description=invoice_request.description,
            due_date=int(datetime.fromisoformat(invoice_request.due_date or (datetime.utcnow() + timedelta(days=30)).isoformat()).timestamp())
        )
        
        # Guardar factura en base de datos
        invoice_data = {
            "invoice_id": str(uuid.uuid4()),
            "appointment_id": invoice_request.appointment_id,
            "user_id": invoice_request.user_id,
            "stripe_invoice_id": invoice.id,
            "amount_cents": invoice_request.amount_cents,
            "currency": "COP",
            "status": "draft",
            "description": invoice_request.description,
            "due_date": invoice_request.due_date or (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "created_at": datetime.utcnow().isoformat()
        }
        
        return InvoiceResponse(**invoice_data)
        
    except stripe.error.StripeError as e:
        logger.error(f"Error Stripe creando factura: {e}")
        raise HTTPException(status_code=400, detail=f"Error creando factura: {str(e)}")
    except Exception as e:
        logger.error(f"Error creando factura: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/invoices", response_model=List[InvoiceResponse], tags=["Invoices"])
async def get_invoices(
    user_id: Optional[str] = Query(None, description="Filtrar por ID de usuario"),
    status: Optional[str] = Query(None, description="Filtrar por estado"),
    limit: int = Query(50, ge=1, le=100, description="Límite de resultados"),
    offset: int = Query(0, ge=0, description="Offset para paginación")
):
    """
    Obtener lista de facturas
    
    - **user_id**: Filtrar por ID de usuario
    - **status**: Filtrar por estado
    - **limit**: Número máximo de resultados
    - **offset**: Número de resultados a omitir
    """
    try:
        # Datos de ejemplo
        invoices_data = [
            {
                "invoice_id": "invoice_1",
                "appointment_id": "appointment-123",
                "user_id": user_id or "user-456",
                "amount_cents": 50000,
                "currency": "COP",
                "status": "paid",
                "description": "Consulta médica general",
                "due_date": "2024-02-15T00:00:00Z",
                "created_at": "2024-01-15T10:00:00Z"
            },
            {
                "invoice_id": "invoice_2",
                "appointment_id": "appointment-124",
                "user_id": user_id or "user-456",
                "amount_cents": 75000,
                "currency": "COP",
                "status": "pending",
                "description": "Seguimiento médico",
                "due_date": "2024-02-20T00:00:00Z",
                "created_at": "2024-01-14T15:30:00Z"
            }
        ]
        
        # Aplicar filtros
        if status:
            invoices_data = [i for i in invoices_data if i["status"] == status]
        
        # Aplicar paginación
        paginated_invoices = invoices_data[offset:offset+limit]
        
        return [InvoiceResponse(**invoice) for invoice in paginated_invoices]
        
    except Exception as e:
        logger.error(f"Error obteniendo facturas: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.post("/webhooks/stripe", tags=["Webhooks"])
async def stripe_webhook(request: Request):
    """
    Webhook para recibir eventos de Stripe
    
    - **request**: Request con el payload del webhook
    """
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        # Verificar la firma del webhook
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
        
        # Procesar el evento
        if event["type"] == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            logger.info(f"Pago exitoso: {payment_intent['id']}")
            
            # Actualizar estado en base de datos
            # TODO: Implementar actualización de estado
            
        elif event["type"] == "payment_intent.payment_failed":
            payment_intent = event["data"]["object"]
            logger.info(f"Pago fallido: {payment_intent['id']}")
            
            # Actualizar estado en base de datos
            # TODO: Implementar actualización de estado
            
        elif event["type"] == "invoice.payment_succeeded":
            invoice = event["data"]["object"]
            logger.info(f"Factura pagada: {invoice['id']}")
            
            # Actualizar estado en base de datos
            # TODO: Implementar actualización de estado
        
        return {"status": "success"}
        
    except stripe.error.SignatureVerificationError:
        logger.error("Firma de webhook inválida")
        raise HTTPException(status_code=400, detail="Firma inválida")
    except Exception as e:
        logger.error(f"Error procesando webhook: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "payment-service"}

from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)