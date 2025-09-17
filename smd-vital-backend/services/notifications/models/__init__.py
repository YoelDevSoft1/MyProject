"""
SMD Vital - Notification Service Schemas
========================================

Esquemas Pydantic para el servicio de notificaciones.
Incluye esquemas de validación para requests y responses.

Author: Backend Team
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


class NotificationCreate(BaseModel):
    """Esquema para crear una notificación"""
    user_id: str = Field(..., description="ID del usuario")
    title: str = Field(..., description="Título de la notificación")
    message: str = Field(..., description="Mensaje de la notificación")
    notification_type: str = Field(..., description="Tipo de notificación")
    priority: str = Field(default="normal", description="Prioridad de la notificación")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadatos adicionales")


class NotificationResponse(BaseModel):
    """Esquema de respuesta para notificaciones"""
    id: str
    user_id: str
    title: str
    message: str
    notification_type: str
    priority: str
    status: str
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime


class NotificationTemplateCreate(BaseModel):
    """Esquema para crear una plantilla de notificación"""
    name: str = Field(..., description="Nombre de la plantilla")
    subject: str = Field(..., description="Asunto de la notificación")
    body: str = Field(..., description="Cuerpo de la notificación")
    notification_type: str = Field(..., description="Tipo de notificación")
    is_active: bool = Field(default=True, description="Si la plantilla está activa")


class NotificationEventCreate(BaseModel):
    """Esquema para crear un evento de notificación"""
    event_name: str = Field(..., description="Nombre del evento")
    description: str = Field(..., description="Descripción del evento")
    is_active: bool = Field(default=True, description="Si el evento está activo")


class NotificationPreferenceCreate(BaseModel):
    """Esquema para crear preferencias de notificación"""
    user_id: str = Field(..., description="ID del usuario")
    notification_type: str = Field(..., description="Tipo de notificación")
    email_enabled: bool = Field(default=True, description="Notificaciones por email habilitadas")
    sms_enabled: bool = Field(default=False, description="Notificaciones por SMS habilitadas")
    push_enabled: bool = Field(default=True, description="Notificaciones push habilitadas")
    whatsapp_enabled: bool = Field(default=False, description="Notificaciones por WhatsApp habilitadas")