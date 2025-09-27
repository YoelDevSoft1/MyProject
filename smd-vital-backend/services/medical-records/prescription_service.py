"""
SMD VITAL - Prescription Service
Servicio para generación y manejo de recetas médicas PDF
"""

import uuid
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging
import io
import base64

# Para generación de PDFs
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    logging.info("ReportLab not available. PDF generation will be disabled.")

logger = logging.getLogger(__name__)

class PrescriptionStatus(Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

@dataclass
class Prescription:
    id: str
    medical_record_id: str
    patient_id: str
    doctor_id: str
    prescription_data: Dict[str, Any]
    pdf_url: Optional[str]
    pdf_generated_at: Optional[datetime]
    status: str
    expires_at: Optional[datetime]
    created_at: datetime

@dataclass
class Medication:
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: str
    quantity: Optional[int] = None

class PrescriptionService:
    def __init__(self, db, storage_client=None, redis_client=None):
        self.db = db
        self.storage = storage_client
        self.redis = redis_client
        self.cache_ttl = 3600  # 1 hora
        self.pdf_ttl = 24 * 3600  # 24 horas para PDFs en caché
    
    async def create_prescription(
        self,
        medical_record_id: str,
        patient_id: str,
        doctor_id: str,
        medications: List[Medication],
        doctor_notes: str = "",
        generate_pdf: bool = True
    ) -> Prescription:
        """
        Crear una nueva receta médica
        """
        try:
            prescription_id = str(uuid.uuid4())
            now = datetime.utcnow()
            
            # Validar medicamentos
            validated_medications = self._validate_medications(medications)
            
            # Estructurar datos de la receta
            prescription_data = {
                "medications": [self._serialize_medication(med) for med in validated_medications],
                "doctor_notes": doctor_notes,
                "prescription_date": now.isoformat(),
                "prescription_id": prescription_id
            }
            
            # Calcular fecha de expiración (30 días por defecto)
            expires_at = now + timedelta(days=30)
            
            # Crear receta en la base de datos
            query = """
                INSERT INTO prescriptions (
                    id, medical_record_id, patient_id, doctor_id,
                    prescription_data, status, expires_at, created_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s
                ) RETURNING *
            """
            
            values = (
                prescription_id, medical_record_id, patient_id, doctor_id,
                json.dumps(prescription_data), PrescriptionStatus.ACTIVE.value,
                expires_at, now
            )
            
            result = await self.db.fetch_one(query, values)
            
            if result:
                prescription = Prescription(
                    id=result['id'],
                    medical_record_id=result['medical_record_id'],
                    patient_id=result['patient_id'],
                    doctor_id=result['doctor_id'],
                    prescription_data=json.loads(result['prescription_data']),
                    pdf_url=result['pdf_url'],
                    pdf_generated_at=result['pdf_generated_at'],
                    status=result['status'],
                    expires_at=result['expires_at'],
                    created_at=result['created_at']
                )
                
                # Generar PDF si se solicita
                if generate_pdf and REPORTLAB_AVAILABLE:
                    pdf_url = await self.generate_prescription_pdf(prescription)
                    prescription.pdf_url = pdf_url
                
                logger.info(f"Prescription created: {prescription_id} for patient {patient_id}")
                return prescription
            else:
                raise Exception("Failed to create prescription")
                
        except Exception as e:
            logger.error(f"Error creating prescription: {e}")
            raise
    
    async def generate_prescription_pdf(
        self, 
        prescription: Prescription,
        force_regenerate: bool = False
    ) -> str:
        """
        Generar PDF de la receta médica
        """
        try:
            # Verificar caché si no se fuerza regeneración
            if not force_regenerate and prescription.pdf_url:
                cache_key = f"prescription_pdf:{prescription.id}"
                if self.redis:
                    cached_url = await self.redis.get(cache_key)
                    if cached_url:
                        return cached_url
            
            if not REPORTLAB_AVAILABLE:
                raise Exception("ReportLab not available for PDF generation")
            
            # Obtener datos del paciente y doctor
            patient_data = await self._get_patient_data(prescription.patient_id)
            doctor_data = await self._get_doctor_data(prescription.doctor_id)
            
            # Generar PDF directamente con ReportLab
            pdf_bytes = await self._generate_prescription_pdf_reportlab(
                prescription, patient_data, doctor_data
            )
            
            # Subir a storage si está disponible
            if self.storage:
                file_path = f"prescriptions/{prescription.patient_id}/{prescription.id}.pdf"
                pdf_url = await self.storage.upload_file(file_path, pdf_bytes)
            else:
                # Si no hay storage, convertir a base64 para devolver
                pdf_b64 = base64.b64encode(pdf_bytes).decode('utf-8')
                pdf_url = f"data:application/pdf;base64,{pdf_b64}"
            
            # Actualizar registro en la base de datos
            await self.db.execute(
                "UPDATE prescriptions SET pdf_url = %s, pdf_generated_at = %s WHERE id = %s",
                [pdf_url, datetime.utcnow(), prescription.id]
            )
            
            # Cachear URL
            if self.redis:
                cache_key = f"prescription_pdf:{prescription.id}"
                await self.redis.setex(cache_key, self.pdf_ttl, pdf_url)
            
            logger.info(f"PDF generated for prescription: {prescription.id}")
            return pdf_url
            
        except Exception as e:
            logger.error(f"Error generating prescription PDF: {e}")
            raise
    
    async def get_prescription(self, prescription_id: str) -> Optional[Prescription]:
        """
        Obtener una receta específica
        """
        try:
            query = "SELECT * FROM prescriptions WHERE id = %s"
            result = await self.db.fetch_one(query, [prescription_id])
            
            if result:
                return Prescription(
                    id=result['id'],
                    medical_record_id=result['medical_record_id'],
                    patient_id=result['patient_id'],
                    doctor_id=result['doctor_id'],
                    prescription_data=json.loads(result['prescription_data']),
                    pdf_url=result['pdf_url'],
                    pdf_generated_at=result['pdf_generated_at'],
                    status=result['status'],
                    expires_at=result['expires_at'],
                    created_at=result['created_at']
                )
            return None
            
        except Exception as e:
            logger.error(f"Error getting prescription: {e}")
            raise
    
    async def get_patient_prescriptions(
        self, 
        patient_id: str, 
        status: Optional[PrescriptionStatus] = None,
        limit: int = 50
    ) -> List[Prescription]:
        """
        Obtener recetas de un paciente
        """
        try:
            base_query = "SELECT * FROM prescriptions WHERE patient_id = %s"
            params = [patient_id]
            
            if status:
                base_query += " AND status = %s"
                params.append(status.value)
            
            base_query += " ORDER BY created_at DESC LIMIT %s"
            params.append(limit)
            
            results = await self.db.fetch_all(base_query, params)
            
            prescriptions = []
            for result in results:
                prescription = Prescription(
                    id=result['id'],
                    medical_record_id=result['medical_record_id'],
                    patient_id=result['patient_id'],
                    doctor_id=result['doctor_id'],
                    prescription_data=json.loads(result['prescription_data']),
                    pdf_url=result['pdf_url'],
                    pdf_generated_at=result['pdf_generated_at'],
                    status=result['status'],
                    expires_at=result['expires_at'],
                    created_at=result['created_at']
                )
                prescriptions.append(prescription)
            
            return prescriptions
            
        except Exception as e:
            logger.error(f"Error getting patient prescriptions: {e}")
            raise
    
    async def cancel_prescription(self, prescription_id: str, reason: str = "") -> bool:
        """
        Cancelar una receta médica
        """
        try:
            await self.db.execute(
                "UPDATE prescriptions SET status = %s WHERE id = %s",
                [PrescriptionStatus.CANCELLED.value, prescription_id]
            )
            
            # Invalidar caché
            if self.redis:
                cache_key = f"prescription_pdf:{prescription_id}"
                await self.redis.delete(cache_key)
            
            logger.info(f"Prescription cancelled: {prescription_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error cancelling prescription: {e}")
            raise
    
    def _validate_medications(self, medications: List[Medication]) -> List[Medication]:
        """
        Validar lista de medicamentos
        """
        if not medications:
            raise ValueError("At least one medication is required")
        
        for med in medications:
            if not med.name or not med.dosage or not med.frequency:
                raise ValueError("Each medication must have name, dosage, and frequency")
        
        return medications
    
    def _serialize_medication(self, medication: Medication) -> Dict[str, Any]:
        """
        Serializar medicamento para almacenamiento
        """
        return {
            "name": medication.name,
            "dosage": medication.dosage,
            "frequency": medication.frequency,
            "duration": medication.duration,
            "instructions": medication.instructions,
            "quantity": medication.quantity
        }
    
    async def _get_patient_data(self, patient_id: str) -> Dict[str, Any]:
        """
        Obtener datos del paciente
        """
        query = "SELECT first_name, last_name, date_of_birth, phone FROM users WHERE id = %s"
        result = await self.db.fetch_one(query, [patient_id])
        
        if result:
            return {
                "name": f"{result['first_name']} {result['last_name']}",
                "date_of_birth": result['date_of_birth'].isoformat() if result['date_of_birth'] else None,
                "phone": result['phone']
            }
        return {}
    
    async def _get_doctor_data(self, doctor_id: str) -> Dict[str, Any]:
        """
        Obtener datos del doctor
        """
        query = "SELECT first_name, last_name, specialty, license_number FROM users WHERE id = %s"
        result = await self.db.fetch_one(query, [doctor_id])
        
        if result:
            return {
                "name": f"Dr. {result['first_name']} {result['last_name']}",
                "specialty": result['specialty'],
                "license": result['license_number']
            }
        return {}
    
    
    async def _generate_prescription_pdf_reportlab(
        self, 
        prescription: Prescription, 
        patient_data: Dict[str, Any], 
        doctor_data: Dict[str, Any]
    ) -> bytes:
        """
        Generar PDF de receta médica usando ReportLab
        """
        try:
            # Crear buffer para el PDF
            buffer = io.BytesIO()
            
            # Crear documento PDF
            doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
            
            # Obtener estilos
            styles = getSampleStyleSheet()
            
            # Crear estilos personalizados
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=18,
                spaceAfter=30,
                alignment=TA_CENTER,
                textColor=colors.HexColor('#2c5aa0')
            )
            
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=14,
                spaceAfter=12,
                textColor=colors.HexColor('#2c5aa0')
            )
            
            normal_style = ParagraphStyle(
                'CustomNormal',
                parent=styles['Normal'],
                fontSize=10,
                spaceAfter=6
            )
            
            # Construir contenido del PDF
            story = []
            
            # Título principal
            story.append(Paragraph("SMD VITAL", title_style))
            story.append(Paragraph("Sistema Médico Digital", normal_style))
            story.append(Paragraph("Receta Médica", normal_style))
            story.append(Spacer(1, 20))
            
            # Información de la receta
            prescription_info = [
                ['No. Receta:', prescription.id[:8]],
                ['Fecha:', prescription.created_at.strftime('%d/%m/%Y')],
                ['Válida hasta:', prescription.expires_at.strftime('%d/%m/%Y') if prescription.expires_at else 'N/A']
            ]
            
            prescription_table = Table(prescription_info, colWidths=[2*inch, 3*inch])
            prescription_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            
            story.append(prescription_table)
            story.append(Spacer(1, 20))
            
            # Datos del paciente
            story.append(Paragraph("Datos del Paciente", heading_style))
            patient_info = f"""
            <b>Nombre:</b> {patient_data.get('name', 'N/A')}<br/>
            <b>Teléfono:</b> {patient_data.get('phone', 'N/A')}
            """
            story.append(Paragraph(patient_info, normal_style))
            story.append(Spacer(1, 15))
            
            # Datos del doctor
            story.append(Paragraph("Datos del Médico", heading_style))
            doctor_info = f"""
            <b>Nombre:</b> {doctor_data.get('name', 'N/A')}<br/>
            <b>Especialidad:</b> {doctor_data.get('specialty', 'N/A')}<br/>
            <b>Licencia:</b> {doctor_data.get('license', 'N/A')}
            """
            story.append(Paragraph(doctor_info, normal_style))
            story.append(Spacer(1, 15))
            
            # Medicamentos
            story.append(Paragraph("Medicamentos Recetados", heading_style))
            
            # Crear tabla de medicamentos
            med_data = [['#', 'Medicamento', 'Dosis', 'Frecuencia', 'Duración', 'Instrucciones']]
            
            for i, med in enumerate(prescription.prescription_data['medications'], 1):
                med_data.append([
                    str(i),
                    med['name'],
                    med['dosage'],
                    med['frequency'],
                    med['duration'],
                    med['instructions']
                ])
            
            med_table = Table(med_data, colWidths=[0.5*inch, 1.5*inch, 1*inch, 1*inch, 1*inch, 2*inch])
            med_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c5aa0')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            
            story.append(med_table)
            story.append(Spacer(1, 15))
            
            # Notas médicas
            if prescription.prescription_data.get('doctor_notes'):
                story.append(Paragraph("Notas Médicas", heading_style))
                story.append(Paragraph(prescription.prescription_data['doctor_notes'], normal_style))
                story.append(Spacer(1, 15))
            
            # Footer
            story.append(Spacer(1, 30))
            story.append(Paragraph("Esta receta es válida únicamente con la presentación de identificación oficial.", 
                                 ParagraphStyle('Disclaimer', parent=styles['Normal'], fontSize=8, 
                                               textColor=colors.grey, alignment=TA_CENTER, fontStyle='italic')))
            
            # Construir PDF
            doc.build(story)
            
            # Obtener bytes del PDF
            pdf_bytes = buffer.getvalue()
            buffer.close()
            
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"Error generating PDF with ReportLab: {e}")
            raise
