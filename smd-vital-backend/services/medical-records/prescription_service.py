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
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False
    logging.warning("WeasyPrint not available. PDF generation will be disabled.")

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
                if generate_pdf and WEASYPRINT_AVAILABLE:
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
            
            if not WEASYPRINT_AVAILABLE:
                raise Exception("WeasyPrint not available for PDF generation")
            
            # Obtener datos del paciente y doctor
            patient_data = await self._get_patient_data(prescription.patient_id)
            doctor_data = await self._get_doctor_data(prescription.doctor_id)
            
            # Generar HTML de la receta
            html_content = self._generate_prescription_html(
                prescription, patient_data, doctor_data
            )
            
            # Generar CSS
            css_content = self._get_prescription_css()
            
            # Convertir a PDF
            pdf_bytes = await self._html_to_pdf(html_content, css_content)
            
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
    
    def _generate_prescription_html(
        self, 
        prescription: Prescription, 
        patient_data: Dict[str, Any], 
        doctor_data: Dict[str, Any]
    ) -> str:
        """
        Generar HTML para la receta médica
        """
        medications_html = ""
        for i, med in enumerate(prescription.prescription_data['medications'], 1):
            medications_html += f"""
            <div class="medication">
                <div class="med-number">{i}.</div>
                <div class="med-details">
                    <div class="med-name">{med['name']}</div>
                    <div class="med-dosage">Dosis: {med['dosage']}</div>
                    <div class="med-frequency">Frecuencia: {med['frequency']}</div>
                    <div class="med-duration">Duración: {med['duration']}</div>
                    <div class="med-instructions">Instrucciones: {med['instructions']}</div>
                </div>
            </div>
            """
        
        html_template = f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Receta Médica - SMD VITAL</title>
        </head>
        <body>
            <div class="prescription-container">
                <header class="prescription-header">
                    <div class="clinic-info">
                        <h1>SMD VITAL</h1>
                        <p>Sistema Médico Digital</p>
                        <p>Receta Médica</p>
                    </div>
                    <div class="prescription-info">
                        <p><strong>No. Receta:</strong> {prescription.id[:8]}</p>
                        <p><strong>Fecha:</strong> {prescription.created_at.strftime('%d/%m/%Y')}</p>
                    </div>
                </header>
                
                <div class="patient-info">
                    <h2>Datos del Paciente</h2>
                    <p><strong>Nombre:</strong> {patient_data.get('name', 'N/A')}</p>
                    <p><strong>Teléfono:</strong> {patient_data.get('phone', 'N/A')}</p>
                </div>
                
                <div class="doctor-info">
                    <h2>Datos del Médico</h2>
                    <p><strong>Nombre:</strong> {doctor_data.get('name', 'N/A')}</p>
                    <p><strong>Especialidad:</strong> {doctor_data.get('specialty', 'N/A')}</p>
                    <p><strong>Licencia:</strong> {doctor_data.get('license', 'N/A')}</p>
                </div>
                
                <div class="medications">
                    <h2>Medicamentos Recetados</h2>
                    {medications_html}
                </div>
                
                <div class="notes">
                    <h2>Notas Médicas</h2>
                    <p>{prescription.prescription_data.get('doctor_notes', 'Sin notas adicionales')}</p>
                </div>
                
                <footer class="prescription-footer">
                    <p><strong>Válida hasta:</strong> {prescription.expires_at.strftime('%d/%m/%Y') if prescription.expires_at else 'N/A'}</p>
                    <p class="disclaimer">Esta receta es válida únicamente con la presentación de identificación oficial.</p>
                </footer>
            </div>
        </body>
        </html>
        """
        
        return html_template
    
    def _get_prescription_css(self) -> str:
        """
        Obtener CSS para la receta médica
        """
        return """
        @page {
            size: A4;
            margin: 2cm;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        
        .prescription-container {
            max-width: 100%;
        }
        
        .prescription-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2c5aa0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .clinic-info h1 {
            color: #2c5aa0;
            font-size: 24px;
            margin: 0;
        }
        
        .clinic-info p {
            margin: 5px 0;
            color: #666;
        }
        
        .prescription-info {
            text-align: right;
        }
        
        .prescription-info p {
            margin: 5px 0;
        }
        
        .patient-info, .doctor-info, .medications, .notes {
            margin-bottom: 25px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        
        .patient-info h2, .doctor-info h2, .medications h2, .notes h2 {
            color: #2c5aa0;
            font-size: 16px;
            margin: 0 0 15px 0;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        
        .medication {
            display: flex;
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 3px;
        }
        
        .med-number {
            font-weight: bold;
            margin-right: 15px;
            color: #2c5aa0;
        }
        
        .med-details {
            flex: 1;
        }
        
        .med-name {
            font-weight: bold;
            font-size: 14px;
            color: #333;
            margin-bottom: 5px;
        }
        
        .med-dosage, .med-frequency, .med-duration, .med-instructions {
            margin: 3px 0;
            font-size: 11px;
        }
        
        .prescription-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
        }
        
        .disclaimer {
            font-size: 10px;
            color: #666;
            font-style: italic;
            margin-top: 10px;
        }
        
        h2 {
            page-break-after: avoid;
        }
        
        .medication {
            page-break-inside: avoid;
        }
        """
    
    async def _html_to_pdf(self, html_content: str, css_content: str) -> bytes:
        """
        Convertir HTML a PDF usando WeasyPrint
        """
        try:
            # Configurar fuentes
            font_config = FontConfiguration()
            
            # Generar PDF
            html_doc = HTML(string=html_content)
            css_doc = CSS(string=css_content, font_config=font_config)
            
            pdf_bytes = html_doc.write_pdf(stylesheets=[css_doc])
            
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"Error converting HTML to PDF: {e}")
            raise
