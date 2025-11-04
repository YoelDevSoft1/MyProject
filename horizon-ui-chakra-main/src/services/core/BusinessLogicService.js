/**
 * SMD VITAL - Servicio de Lógica de Negocio Core
 * ================================================
 * 
 * Servicio centralizado para toda la lógica de negocio del sistema médico.
 * Maneja reglas de negocio, validaciones, cálculos y operaciones complejas.
 * 
 * Author: Senior Developer Team
 * Version: 2.0.0
 */

import apiService from '../apiService';
import notificationService from './NotificationService';
import aiService from './AIService';

class BusinessLogicService {
  constructor() {
    this.cache = new Map();
    this.eventListeners = new Map();
  }

  // =====================================================
  // 1. LÓGICA DE CITAS MÉDICAS
  // =====================================================

  /**
   * Crear cita médica con validaciones de negocio
   */
  async createAppointment(appointmentData) {
    try {
      // Validaciones de negocio
      const validation = await this.validateAppointmentData(appointmentData);
      if (!validation.isValid) {
        throw new Error(`Datos de cita inválidos: ${validation.errors.join(', ')}`);
      }

      // Verificar disponibilidad del profesional
      const isAvailable = await this.checkProfessionalAvailability(
        appointmentData.professional_id,
        appointmentData.scheduled_date,
        appointmentData.scheduled_time,
        appointmentData.duration_minutes || 30
      );

      if (!isAvailable) {
        throw new Error('El profesional no está disponible en el horario solicitado');
      }

      // Generar número de cita único
      const appointmentNumber = await this.generateAppointmentNumber();

      // Crear la cita
      const appointment = {
        ...appointmentData,
        appointment_number: appointmentNumber,
        status: 'scheduled',
        created_at: new Date().toISOString()
      };

      const result = await apiService.post('/appointments', appointment);

      // Enviar notificaciones
      await this.sendAppointmentNotifications(result.data, 'created');

      // Actualizar cache
      this.cache.set(`appointment_${result.data.id}`, result.data);

      return result.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  /**
   * Validar datos de cita médica
   */
  async validateAppointmentData(data) {
    const errors = [];

    // Validar campos requeridos
    if (!data.patient_id) errors.push('ID de paciente requerido');
    if (!data.professional_id) errors.push('ID de profesional requerido');
    if (!data.scheduled_date) errors.push('Fecha de cita requerida');
    if (!data.scheduled_time) errors.push('Hora de cita requerida');

    // Validar fecha futura
    const appointmentDateTime = new Date(`${data.scheduled_date}T${data.scheduled_time}`);
    if (appointmentDateTime <= new Date()) {
      errors.push('La cita debe ser en una fecha futura');
    }

    // Validar horario de trabajo
    const isWithinWorkingHours = await this.isWithinWorkingHours(
      data.professional_id,
      data.scheduled_date,
      data.scheduled_time
    );
    if (!isWithinWorkingHours) {
      errors.push('La cita está fuera del horario de trabajo del profesional');
    }

    // Validar duración mínima
    if (data.duration_minutes && data.duration_minutes < 15) {
      errors.push('La duración mínima de una cita es 15 minutos');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Verificar disponibilidad del profesional
   */
  async checkProfessionalAvailability(professionalId, date, time, duration) {
    try {
      const response = await apiService.get(`/availability/check`, {
        params: {
          professional_id: professionalId,
          date,
          time,
          duration
        }
      });
      return response.data.is_available;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }

  /**
   * Generar número de cita único
   */
  async generateAppointmentNumber() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `APT-${timestamp}-${random}`.toUpperCase();
  }

  // =====================================================
  // 2. LÓGICA DE PACIENTES
  // =====================================================

  /**
   * Crear paciente con validaciones médicas
   */
  async createPatient(patientData) {
    try {
      // Validar datos médicos
      const medicalValidation = await this.validateMedicalData(patientData);
      if (!medicalValidation.isValid) {
        throw new Error(`Datos médicos inválidos: ${medicalValidation.errors.join(', ')}`);
      }

      // Generar código de paciente único
      const patientCode = await this.generatePatientCode();

      // Crear perfil de usuario primero
      const userProfile = await this.createUserProfile(patientData);

      // Crear registro de paciente
      const patient = {
        ...patientData,
        user_id: userProfile.id,
        patient_code: patientCode,
        medical_record_number: await this.generateMedicalRecordNumber(),
        status: 'active',
        created_at: new Date().toISOString()
      };

      const result = await apiService.post('/patients', patient);

      // Crear contactos de emergencia si existen
      if (patientData.emergency_contacts) {
        await this.createEmergencyContacts(result.data.id, patientData.emergency_contacts);
      }

      // Enviar notificación de bienvenida
      await this.sendWelcomeNotification(result.data);

      return result.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  /**
   * Validar datos médicos del paciente
   */
  async validateMedicalData(data) {
    const errors = [];

    // Validar información básica
    if (!data.first_name || data.first_name.length < 2) {
      errors.push('Nombre debe tener al menos 2 caracteres');
    }
    if (!data.last_name || data.last_name.length < 2) {
      errors.push('Apellido debe tener al menos 2 caracteres');
    }
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Email válido requerido');
    }

    // Validar fecha de nacimiento
    if (data.date_of_birth) {
      const birthDate = new Date(data.date_of_birth);
      const age = this.calculateAge(birthDate);
      if (age < 0 || age > 150) {
        errors.push('Fecha de nacimiento inválida');
      }
    }

    // Validar tipo de sangre
    if (data.blood_type && !this.isValidBloodType(data.blood_type)) {
      errors.push('Tipo de sangre inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generar código de paciente único
   */
  async generatePatientCode() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `PAT-${year}${month}-${random}`;
  }

  // =====================================================
  // 3. LÓGICA DE EXPEDIENTES MÉDICOS
  // =====================================================

  /**
   * Crear expediente médico con validaciones
   */
  async createMedicalRecord(recordData) {
    try {
      // Validar datos del expediente
      const validation = await this.validateMedicalRecordData(recordData);
      if (!validation.isValid) {
        throw new Error(`Datos de expediente inválidos: ${validation.errors.join(', ')}`);
      }

      // Generar número de expediente
      const recordNumber = await this.generateMedicalRecordNumber();

      // Procesar diagnósticos con IA si está disponible
      if (recordData.symptoms && recordData.symptoms.length > 0) {
        const aiAnalysis = await this.analyzeSymptomsWithAI(recordData.symptoms);
        recordData.ai_analysis = aiAnalysis;
      }

      const record = {
        ...recordData,
        record_number: recordNumber,
        status: 'active',
        created_at: new Date().toISOString()
      };

      const result = await apiService.post('/medical-records', record);

      // Crear prescripciones si existen
      if (recordData.prescriptions && recordData.prescriptions.length > 0) {
        await this.createPrescriptions(result.data.id, recordData.prescriptions);
      }

      // Registrar signos vitales si existen
      if (recordData.vital_signs) {
        await this.recordVitalSigns(result.data.patient_id, recordData.vital_signs);
      }

      return result.data;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  }

  /**
   * Analizar síntomas con IA
   */
  async analyzeSymptomsWithAI(symptoms) {
    try {
      const analysis = await aiService.analyzeSymptoms(symptoms);
      return {
        suggested_diagnoses: analysis.diagnoses,
        confidence_scores: analysis.confidence,
        recommendations: analysis.recommendations,
        analyzed_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing symptoms with AI:', error);
      return null;
    }
  }

  // =====================================================
  // 4. LÓGICA DE PAGOS
  // =====================================================

  /**
   * Procesar pago con validaciones financieras
   */
  async processPayment(paymentData) {
    try {
      // Validar datos de pago
      const validation = await this.validatePaymentData(paymentData);
      if (!validation.isValid) {
        throw new Error(`Datos de pago inválidos: ${validation.errors.join(', ')}`);
      }

      // Verificar factura
      const invoice = await this.getInvoice(paymentData.invoice_id);
      if (!invoice) {
        throw new Error('Factura no encontrada');
      }

      // Verificar que el pago no exceda el monto de la factura
      if (paymentData.amount > invoice.final_amount) {
        throw new Error('El monto del pago excede el monto de la factura');
      }

      // Generar número de pago único
      const paymentNumber = await this.generatePaymentNumber();

      const payment = {
        ...paymentData,
        payment_number: paymentNumber,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const result = await apiService.post('/payments', payment);

      // Procesar pago con gateway
      const gatewayResult = await this.processWithPaymentGateway(payment);

      // Actualizar estado del pago
      await this.updatePaymentStatus(result.data.id, gatewayResult.status);

      // Enviar confirmación
      await this.sendPaymentConfirmation(result.data);

      return result.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // =====================================================
  // 5. LÓGICA DE NOTIFICACIONES
  // =====================================================

  /**
   * Enviar notificaciones de cita
   */
  async sendAppointmentNotifications(appointment, eventType) {
    try {
      const notifications = [];

      // Notificación al paciente
      notifications.push({
        recipient_id: appointment.patient_id,
        type: 'appointment',
        channel: 'email',
        template: `appointment_${eventType}`,
        data: {
          appointment_number: appointment.appointment_number,
          date: appointment.scheduled_date,
          time: appointment.scheduled_time,
          doctor_name: await this.getProfessionalName(appointment.professional_id)
        }
      });

      // Notificación al profesional
      notifications.push({
        recipient_id: appointment.professional_id,
        type: 'appointment',
        channel: 'email',
        template: `professional_appointment_${eventType}`,
        data: {
          appointment_number: appointment.appointment_number,
          date: appointment.scheduled_date,
          time: appointment.scheduled_time,
          patient_name: await this.getPatientName(appointment.patient_id)
        }
      });

      // Enviar todas las notificaciones
      for (const notification of notifications) {
        await notificationService.sendNotification(notification);
      }
    } catch (error) {
      console.error('Error sending appointment notifications:', error);
    }
  }

  // =====================================================
  // 6. UTILIDADES Y VALIDACIONES
  // =====================================================

  /**
   * Validar email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar tipo de sangre
   */
  isValidBloodType(bloodType) {
    const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return validTypes.includes(bloodType.toUpperCase());
  }

  /**
   * Calcular edad
   */
  calculateAge(birthDate) {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  }

  /**
   * Generar número de expediente médico
   */
  async generateMedicalRecordNumber() {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `MR-${year}-${random}`;
  }

  /**
   * Generar número de pago único
   */
  async generatePaymentNumber() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `PAY-${timestamp}-${random}`.toUpperCase();
  }

  // =====================================================
  // 7. CACHE Y OPTIMIZACIÓN
  // =====================================================

  /**
   * Obtener datos del cache
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutos
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Guardar en cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Limpiar cache
   */
  clearCache() {
    this.cache.clear();
  }

  // =====================================================
  // 8. EVENTOS Y OBSERVADORES
  // =====================================================

  /**
   * Suscribirse a eventos
   */
  subscribe(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Desuscribirse de eventos
   */
  unsubscribe(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emitir evento
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Instancia singleton
const businessLogicService = new BusinessLogicService();

export default businessLogicService;
