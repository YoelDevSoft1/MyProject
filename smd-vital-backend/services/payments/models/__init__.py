"""
SMD Vital - Payment Service Schemas
===================================

Esquemas Pydantic para el servicio de pagos.
Incluye esquemas de validación para requests y responses.

Author: Backend Team
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
from decimal import Decimal
import uuid


class PaymentCreate(BaseModel):
    """Esquema para crear un pago"""
    amount: Decimal = Field(..., description="Monto del pago")
    currency: str = Field(default="COP", description="Moneda del pago")
    payment_method_id: str = Field(..., description="ID del método de pago")
    description: Optional[str] = Field(None, description="Descripción del pago")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadatos adicionales")
    
    class Config:
        json_encoders = {
            Decimal: str
        }


class PaymentResponse(BaseModel):
    """Esquema de respuesta para pagos"""
    id: str
    amount: Decimal
    currency: str
    status: str
    payment_method_id: str
    description: Optional[str]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_encoders = {
            Decimal: str
        }


class InvoiceCreate(BaseModel):
    """Esquema para crear una factura"""
    patient_id: str = Field(..., description="ID del paciente")
    amount: Decimal = Field(..., description="Monto total de la factura")
    currency: str = Field(default="COP", description="Moneda")
    due_date: date = Field(..., description="Fecha de vencimiento")
    description: Optional[str] = Field(None, description="Descripción de la factura")
    
    class Config:
        json_encoders = {
            Decimal: str
        }


class InvoiceResponse(BaseModel):
    """Esquema de respuesta para facturas"""
    id: str
    patient_id: str
    amount: Decimal
    currency: str
    status: str
    due_date: date
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_encoders = {
            Decimal: str
        }


class PaymentMethodCreate(BaseModel):
    """Esquema para crear un método de pago"""
    patient_id: str = Field(..., description="ID del paciente")
    type: str = Field(..., description="Tipo de método de pago")
    provider: str = Field(..., description="Proveedor del método de pago")
    details: Dict[str, Any] = Field(..., description="Detalles del método de pago")
    is_default: bool = Field(default=False, description="Si es el método por defecto")


class RefundCreate(BaseModel):
    """Esquema para crear un reembolso"""
    payment_id: str = Field(..., description="ID del pago original")
    amount: Decimal = Field(..., description="Monto del reembolso")
    reason: str = Field(..., description="Razón del reembolso")
    description: Optional[str] = Field(None, description="Descripción adicional")
    
    class Config:
        json_encoders = {
            Decimal: str
        }


class TransactionResponse(BaseModel):
    """Esquema de respuesta para transacciones"""
    id: str
    payment_id: str
    type: str
    amount: Decimal
    status: str
    provider_transaction_id: Optional[str]
    provider_response: Optional[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        json_encoders = {
            Decimal: str
        }