"""
SMD Vital - Medical Records Service Schemas
===========================================

Esquemas Pydantic para el servicio de registros médicos.
Incluye esquemas de validación para requests y responses.

Author: Backend Team
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid


class MedicalRecordCreate(BaseModel):
    """Esquema para crear un registro médico"""
    patient_id: str = Field(..., description="ID del paciente")
    appointment_id: Optional[str] = Field(None, description="ID de la cita relacionada")
    chief_complaint: Optional[str] = Field(None, description="Motivo principal de consulta")
    present_illness: Optional[str] = Field(None, description="Historia de enfermedad actual")
    physical_examination: Optional[str] = Field(None, description="Examen físico")
    assessment: Optional[str] = Field(None, description="Evaluación")
    plan: Optional[str] = Field(None, description="Plan de tratamiento")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }


class MedicalRecordResponse(BaseModel):
    """Esquema de respuesta para registro médico"""
    id: str
    patient_id: str
    doctor_id: str
    appointment_id: Optional[str]
    chief_complaint: Optional[str]
    present_illness: Optional[str]
    physical_examination: Optional[str]
    assessment: Optional[str]
    plan: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }


class MedicalHistoryCreate(BaseModel):
    """Esquema para crear entrada en historial médico"""
    patient_id: str = Field(..., description="ID del paciente")
    condition: str = Field(..., description="Condición médica")
    diagnosis_date: date = Field(..., description="Fecha de diagnóstico")
    status: str = Field(..., description="Estado de la condición")
    notes: Optional[str] = Field(None, description="Notas adicionales")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }


class PrescriptionCreate(BaseModel):
    """Esquema para crear una receta médica"""
    patient_id: str = Field(..., description="ID del paciente")
    medication_name: str = Field(..., description="Nombre del medicamento")
    dosage: str = Field(..., description="Dosis")
    frequency: str = Field(..., description="Frecuencia")
    duration: Optional[str] = Field(None, description="Duración del tratamiento")
    instructions: Optional[str] = Field(None, description="Instrucciones especiales")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }


class LabResultCreate(BaseModel):
    """Esquema para registrar resultado de laboratorio"""
    patient_id: str = Field(..., description="ID del paciente")
    test_name: str = Field(..., description="Nombre del examen")
    test_type: str = Field(..., description="Tipo de examen")
    result_value: Optional[str] = Field(None, description="Valor del resultado")
    reference_range: Optional[str] = Field(None, description="Rango de referencia")
    units: Optional[str] = Field(None, description="Unidades de medida")
    status: str = Field(..., description="Estado del examen")
    notes: Optional[str] = Field(None, description="Notas adicionales")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }


class ImagingStudyCreate(BaseModel):
    """Esquema para crear estudio de imagen"""
    patient_id: str = Field(..., description="ID del paciente")
    study_type: str = Field(..., description="Tipo de estudio")
    body_part: str = Field(..., description="Parte del cuerpo")
    description: Optional[str] = Field(None, description="Descripción del estudio")
    findings: Optional[str] = Field(None, description="Hallazgos")
    impression: Optional[str] = Field(None, description="Impresión diagnóstica")
    status: str = Field(..., description="Estado del estudio")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }


class VitalSignsCreate(BaseModel):
    """Esquema para registrar signos vitales"""
    patient_id: str = Field(..., description="ID del paciente")
    appointment_id: Optional[str] = Field(None, description="ID de la cita")
    blood_pressure_systolic: Optional[int] = Field(None, description="Presión arterial sistólica")
    blood_pressure_diastolic: Optional[int] = Field(None, description="Presión arterial diastólica")
    heart_rate: Optional[int] = Field(None, description="Frecuencia cardíaca")
    temperature: Optional[float] = Field(None, description="Temperatura")
    respiratory_rate: Optional[int] = Field(None, description="Frecuencia respiratoria")
    oxygen_saturation: Optional[int] = Field(None, description="Saturación de oxígeno")
    weight: Optional[float] = Field(None, description="Peso")
    height: Optional[float] = Field(None, description="Altura")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }