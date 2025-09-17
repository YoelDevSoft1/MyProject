"""
SMD Vital - Payment Service
============================

Microservicio de gestión de pagos y facturación para la plataforma SMD Vital.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
import uuid
from datetime import datetime, date
from decimal import Decimal
import logging

from models.database import get_db, Payment, Invoice, PaymentMethod_Entity, Refund, Transaction
from models import PaymentCreate, PaymentResponse, InvoiceCreate, InvoiceResponse, PaymentMethodCreate, RefundCreate, TransactionResponse
from security import verify_token, get_current_user

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# FastAPI app instance
app = FastAPI(
    title="SMD Vital - Payment Service",
    description="Microservicio de gestión de pagos, facturación y métodos de pago para SMD Vital Bogotá",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS is handled by Nginx API Gateway
# No need for CORS middleware in individual microservices

security = HTTPBearer()

# Payment Endpoints
@app.post("/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED, tags=["Payments"])
async def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Procesar un nuevo pago"""
    try:
        # Verificar permisos (pacientes pueden hacer sus pagos, admins y doctores pueden procesar cualquier pago)
        if current_user.get("role") not in ["admin", "doctor"] and current_user.get("user_id") != payment_data.patient_id:
            raise HTTPException(status_code=403, detail="No tiene permisos para procesar este pago")
        
        payment = Payment(
            id=str(uuid.uuid4()),
            patient_id=payment_data.patient_id,
            appointment_id=payment_data.appointment_id,
            amount=payment_data.amount,
            currency=payment_data.currency,
            payment_method_id=payment_data.payment_method_id,
            status="pending",
            payment_date=datetime.utcnow(),
            description=payment_data.description,
            processed_by=current_user["user_id"]
        )
        
        # Simular procesamiento de pago (en producción sería integración con Stripe, PayU, etc.)
        if payment_data.amount > 0:
            payment.status = "completed"
            payment.transaction_id = f"TXN_{uuid.uuid4().hex[:12].upper()}"
            
            # Crear registro de transacción
            transaction = Transaction(
                id=str(uuid.uuid4()),
                payment_id=payment.id,
                transaction_id=payment.transaction_id,
                amount=payment.amount,
                currency=payment.currency,
                status="success",
                gateway_response="Payment processed successfully",
                processed_at=datetime.utcnow()
            )
            db.add(transaction)
        
        db.add(payment)
        db.commit()
        db.refresh(payment)
        
        logger.info(f"Payment processed: {payment.id} for amount: {payment.amount} {payment.currency}")
        return payment
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing payment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al procesar pago: {str(e)}")

@app.get("/payments/patient/{patient_id}", response_model=List[PaymentResponse], tags=["Payments"])
async def get_patient_payments(
    patient_id: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener pagos de un paciente"""
    try:
        # Verificar permisos
        if current_user.get("role") not in ["admin", "doctor"] and current_user.get("user_id") != patient_id:
            raise HTTPException(status_code=403, detail="No tiene permisos para acceder a estos pagos")
        
        query = db.query(Payment).filter(Payment.patient_id == patient_id)
        
        if status:
            query = query.filter(Payment.status == status)
        
        payments = query.order_by(Payment.payment_date.desc()).all()
        return payments
        
    except Exception as e:
        logger.error(f"Error getting patient payments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener pagos: {str(e)}")

@app.get("/payments/{payment_id}", response_model=PaymentResponse, tags=["Payments"])
async def get_payment(
    payment_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener información de un pago específico"""
    try:
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        
        if not payment:
            raise HTTPException(status_code=404, detail="Pago no encontrado")
        
        # Verificar permisos
        if current_user.get("role") not in ["admin", "doctor"] and current_user.get("user_id") != payment.patient_id:
            raise HTTPException(status_code=403, detail="No tiene permisos para acceder a este pago")
        
        return payment
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting payment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener pago: {str(e)}")

# Invoice Endpoints
@app.post("/invoices", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED, tags=["Invoices"])
async def create_invoice(
    invoice_data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Crear una nueva factura"""
    try:
        if current_user.get("role") not in ["admin", "doctor"]:
            raise HTTPException(status_code=403, detail="Solo administradores y doctores pueden crear facturas")
        
        invoice = Invoice(
            id=str(uuid.uuid4()),
            patient_id=invoice_data.patient_id,
            appointment_id=invoice_data.appointment_id,
            invoice_number=f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}",
            subtotal=invoice_data.subtotal,
            tax_amount=invoice_data.tax_amount,
            total_amount=invoice_data.total_amount,
            currency=invoice_data.currency,
            status="pending",
            issue_date=datetime.utcnow(),
            due_date=invoice_data.due_date,
            description=invoice_data.description,
            items=invoice_data.items,
            created_by=current_user["user_id"]
        )
        
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        
        logger.info(f"Invoice created: {invoice.invoice_number} for patient: {invoice.patient_id}")
        return invoice
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating invoice: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al crear factura: {str(e)}")

@app.get("/invoices/patient/{patient_id}", response_model=List[InvoiceResponse], tags=["Invoices"])
async def get_patient_invoices(
    patient_id: str,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener facturas de un paciente"""
    try:
        # Verificar permisos
        if current_user.get("role") not in ["admin", "doctor"] and current_user.get("user_id") != patient_id:
            raise HTTPException(status_code=403, detail="No tiene permisos para acceder a estas facturas")
        
        query = db.query(Invoice).filter(Invoice.patient_id == patient_id)
        
        if status:
            query = query.filter(Invoice.status == status)
        
        invoices = query.order_by(Invoice.issue_date.desc()).all()
        return invoices
        
    except Exception as e:
        logger.error(f"Error getting patient invoices: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener facturas: {str(e)}")

# Payment Methods Endpoints
@app.post("/payment-methods", status_code=status.HTTP_201_CREATED, tags=["Payment Methods"])
async def create_payment_method(
    method_data: PaymentMethodCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Registrar un nuevo método de pago"""
    try:
        # Solo el propio usuario puede registrar sus métodos de pago
        if current_user.get("user_id") != method_data.user_id and current_user.get("role") not in ["admin"]:
            raise HTTPException(status_code=403, detail="No puede registrar métodos de pago para otros usuarios")
        
        payment_method = PaymentMethod(
            id=str(uuid.uuid4()),
            user_id=method_data.user_id,
            type=method_data.type,
            provider=method_data.provider,
            last_four=method_data.last_four,
            expiry_month=method_data.expiry_month,
            expiry_year=method_data.expiry_year,
            is_default=method_data.is_default,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        # Si es método por defecto, desactivar otros métodos como default
        if method_data.is_default:
            db.query(PaymentMethod).filter(
                and_(PaymentMethod.user_id == method_data.user_id, PaymentMethod.is_default == True)
            ).update({"is_default": False})
        
        db.add(payment_method)
        db.commit()
        db.refresh(payment_method)
        
        logger.info(f"Payment method created: {payment_method.id} for user: {payment_method.user_id}")
        return {"message": "Método de pago registrado exitosamente", "id": payment_method.id}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating payment method: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al registrar método de pago: {str(e)}")

@app.get("/payment-methods/user/{user_id}", tags=["Payment Methods"])
async def get_user_payment_methods(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener métodos de pago de un usuario"""
    try:
        # Verificar permisos
        if current_user.get("user_id") != user_id and current_user.get("role") not in ["admin"]:
            raise HTTPException(status_code=403, detail="No tiene permisos para ver estos métodos de pago")
        
        payment_methods = db.query(PaymentMethod).filter(
            and_(PaymentMethod.user_id == user_id, PaymentMethod.is_active == True)
        ).order_by(PaymentMethod.is_default.desc(), PaymentMethod.created_at.desc()).all()
        
        return payment_methods
        
    except Exception as e:
        logger.error(f"Error getting user payment methods: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al obtener métodos de pago: {str(e)}")

# Refund Endpoints
@app.post("/refunds", status_code=status.HTTP_201_CREATED, tags=["Refunds"])
async def request_refund(
    refund_data: RefundCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Solicitar reembolso"""
    try:
        # Verificar que el pago existe
        payment = db.query(Payment).filter(Payment.id == refund_data.payment_id).first()
        if not payment:
            raise HTTPException(status_code=404, detail="Pago no encontrado")
        
        # Verificar permisos
        if current_user.get("role") not in ["admin"] and current_user.get("user_id") != payment.patient_id:
            raise HTTPException(status_code=403, detail="No tiene permisos para solicitar reembolso de este pago")
        
        refund_request = RefundRequest(
            id=str(uuid.uuid4()),
            payment_id=refund_data.payment_id,
            amount=refund_data.amount,
            reason=refund_data.reason,
            status="pending",
            requested_by=current_user["user_id"],
            requested_at=datetime.utcnow()
        )
        
        db.add(refund_request)
        db.commit()
        db.refresh(refund_request)
        
        logger.info(f"Refund request created: {refund_request.id} for payment: {refund_request.payment_id}")
        return {"message": "Solicitud de reembolso creada exitosamente", "id": refund_request.id}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating refund request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al solicitar reembolso: {str(e)}")

# Financial Reports
@app.get("/reports/revenue", tags=["Reports"])
async def get_revenue_report(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Obtener reporte de ingresos"""
    try:
        if current_user.get("role") not in ["admin", "doctor"]:
            raise HTTPException(status_code=403, detail="No tiene permisos para acceder a reportes financieros")
        
        # Calcular ingresos por período
        payments = db.query(Payment).filter(
            and_(
                Payment.status == "completed",
                Payment.payment_date >= start_date,
                Payment.payment_date <= end_date
            )
        ).all()
        
        total_revenue = sum(payment.amount for payment in payments)
        payment_count = len(payments)
        
        # Agrupar por método de pago
        payment_methods = {}
        for payment in payments:
            method = payment.payment_method_id or "unknown"
            if method not in payment_methods:
                payment_methods[method] = {"count": 0, "amount": Decimal(0)}
            payment_methods[method]["count"] += 1
            payment_methods[method]["amount"] += payment.amount
        
        return {
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "summary": {
                "total_revenue": float(total_revenue),
                "payment_count": payment_count,
                "average_payment": float(total_revenue / payment_count) if payment_count > 0 else 0
            },
            "by_payment_method": payment_methods
        }
        
    except Exception as e:
        logger.error(f"Error generating revenue report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error al generar reporte de ingresos: {str(e)}")

# Health Check
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "payment-service",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# Metrics endpoint for Prometheus
@app.get("/metrics", tags=["Metrics"])
async def metrics():
    """Prometheus metrics endpoint"""
    from shared.metrics import get_metrics_response
    return get_metrics_response()

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "SMD Vital Payment Service",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/info", tags=["Info"])
async def service_info():
    """Service information"""
    return {
        "service": "payment-service",
        "description": "Payment processing and billing management service",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "info": "/info"
        },
        "database": "smdvital_payments",
        "port": 8005
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8005,
        reload=True,
        log_level="info"
    )