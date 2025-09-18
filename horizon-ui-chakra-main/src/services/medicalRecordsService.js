/**
 * SMD VITAL - Medical Records Service
 * Servicio para manejo de registros médicos, prescripciones y calificaciones
 */

import apiService from './apiService';

class MedicalRecordsService {
  constructor() {
    this.baseUrl = '/api/medical-records';
    this.prescriptionsUrl = '/api/prescriptions';
    this.ratingsUrl = '/api/ratings';
  }

  // =============================================
  // REGISTROS MÉDICOS
  // =============================================

  /**
   * Crear un nuevo registro médico de consulta
   */
  async createMedicalRecord(appointmentId, consultationData) {
    try {
      const response = await apiService.request(`${this.baseUrl}`, {
        method: 'POST',
        body: JSON.stringify({
          appointment_id: appointmentId,
          consultation_data: consultationData
        })
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error creating medical record:', error);
      return {
        success: false,
        error: error.message || 'Error al crear registro médico'
      };
    }
  }

  /**
   * Obtener historial médico de un paciente
   */
  async getPatientMedicalHistory(patientId, options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit);
      if (options.recordType) params.append('record_type', options.recordType);

      const response = await apiService.request(
        `${this.baseUrl}/patient/${patientId}?${params.toString()}`
      );

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error getting patient medical history:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener historial médico'
      };
    }
  }

  /**
   * Obtener un registro médico específico
   */
  async getMedicalRecord(recordId) {
    try {
      const response = await apiService.request(`${this.baseUrl}/${recordId}`);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error getting medical record:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener registro médico'
      };
    }
  }

  // =============================================
  // PRESCRIPCIONES
  // =============================================

  /**
   * Crear una nueva receta médica
   */
  async createPrescription(medicalRecordId, medications, doctorNotes = '') {
    try {
      const response = await apiService.request(this.prescriptionsUrl, {
        method: 'POST',
        body: JSON.stringify({
          medical_record_id: medicalRecordId,
          medications: medications,
          doctor_notes: doctorNotes
        })
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error creating prescription:', error);
      return {
        success: false,
        error: error.message || 'Error al crear receta médica'
      };
    }
  }

  /**
   * Obtener recetas de un paciente
   */
  async getPatientPrescriptions(patientId, options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.status) params.append('status', options.status);
      if (options.limit) params.append('limit', options.limit);

      const response = await apiService.request(
        `${this.prescriptionsUrl}/patient/${patientId}?${params.toString()}`
      );

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error getting patient prescriptions:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener recetas'
      };
    }
  }

  /**
   * Obtener una receta específica
   */
  async getPrescription(prescriptionId) {
    try {
      const response = await apiService.request(`${this.prescriptionsUrl}/${prescriptionId}`);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error getting prescription:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener receta'
      };
    }
  }

  /**
   * Cancelar una receta médica
   */
  async cancelPrescription(prescriptionId, reason = '') {
    try {
      const response = await apiService.request(`${this.prescriptionsUrl}/${prescriptionId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error cancelling prescription:', error);
      return {
        success: false,
        error: error.message || 'Error al cancelar receta'
      };
    }
  }

  // =============================================
  // CALIFICACIONES
  // =============================================

  /**
   * Enviar calificación de un doctor
   */
  async submitRating(doctorId, appointmentId, rating, comment = '', categories = {}) {
    try {
      const response = await apiService.request(this.ratingsUrl, {
        method: 'POST',
        body: JSON.stringify({
          doctor_id: doctorId,
          appointment_id: appointmentId,
          rating: rating,
          comment: comment,
          categories: categories
        })
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error submitting rating:', error);
      return {
        success: false,
        error: error.message || 'Error al enviar calificación'
      };
    }
  }

  /**
   * Obtener calificaciones de un doctor
   */
  async getDoctorRatings(doctorId, options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit);
      if (options.verifiedOnly !== undefined) params.append('verified_only', options.verifiedOnly);

      const response = await apiService.request(
        `${this.ratingsUrl}/doctor/${doctorId}?${params.toString()}`
      );

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error getting doctor ratings:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener calificaciones'
      };
    }
  }

  /**
   * Obtener agregaciones de calificaciones de un doctor
   */
  async getDoctorRatingAggregate(doctorId) {
    try {
      const response = await apiService.request(`${this.ratingsUrl}/doctor/${doctorId}/aggregate`);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error getting doctor rating aggregate:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener estadísticas de calificaciones'
      };
    }
  }

  /**
   * Obtener doctores mejor calificados
   */
  async getTopRatedDoctors(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.specialty) params.append('specialty', options.specialty);
      if (options.minRatings) params.append('min_ratings', options.minRatings);
      if (options.limit) params.append('limit', options.limit);

      const response = await apiService.request(
        `${this.ratingsUrl}/top-doctors?${params.toString()}`
      );

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error getting top rated doctors:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener doctores mejor calificados'
      };
    }
  }

  /**
   * Obtener estadísticas generales de calificaciones
   */
  async getRatingStatistics() {
    try {
      const response = await apiService.request(`${this.ratingsUrl}/stats`);

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error getting rating statistics:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener estadísticas'
      };
    }
  }

  // =============================================
  // UTILIDADES
  // =============================================

  /**
   * Validar datos de consulta médica
   */
  validateConsultationData(data) {
    const errors = {};

    if (!data.chiefComplaint?.trim()) {
      errors.chiefComplaint = 'El motivo de consulta es requerido';
    }

    if (!data.historyPresentIllness?.trim()) {
      errors.historyPresentIllness = 'La historia de la enfermedad es requerida';
    }

    if (!data.assessment?.trim()) {
      errors.assessment = 'La evaluación es requerida';
    }

    if (!data.plan?.trim()) {
      errors.plan = 'El plan de tratamiento es requerido';
    }

    // Validar medicamentos si existen
    if (data.prescriptions && data.prescriptions.length > 0) {
      data.prescriptions.forEach((med, index) => {
        if (med.name && (!med.dosage || !med.frequency)) {
          errors[`prescription_${index}`] = 'Dosis y frecuencia son requeridas';
        }
      });
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validar datos de calificación
   */
  validateRatingData(data) {
    const errors = {};

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.rating = 'La calificación debe estar entre 1 y 5';
    }

    if (!data.doctorId) {
      errors.doctorId = 'ID del doctor es requerido';
    }

    if (!data.appointmentId) {
      errors.appointmentId = 'ID de la cita es requerido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Formatear fecha para mostrar
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formatear fecha corta
   */
  formatDateShort(dateString) {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Obtener color de estado de receta
   */
  getPrescriptionStatusColor(status) {
    switch (status) {
      case 'active':
        return 'green';
      case 'expired':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'blue';
    }
  }

  /**
   * Obtener texto de estado de receta
   */
  getPrescriptionStatusText(status) {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'expired':
        return 'Expirada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  }

  /**
   * Obtener texto de calificación
   */
  getRatingText(rating) {
    switch (rating) {
      case 1:
        return 'Muy malo';
      case 2:
        return 'Malo';
      case 3:
        return 'Regular';
      case 4:
        return 'Bueno';
      case 5:
        return 'Excelente';
      default:
        return '';
    }
  }

  /**
   * Calcular promedio de calificaciones
   */
  calculateAverageRating(ratings) {
    if (!ratings || ratings.length === 0) return 0;
    
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / ratings.length;
  }

  /**
   * Obtener distribución de calificaciones
   */
  getRatingDistribution(ratings) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    ratings.forEach(rating => {
      distribution[rating.rating]++;
    });
    
    return distribution;
  }
}

// Crear instancia singleton
const medicalRecordsService = new MedicalRecordsService();

export default medicalRecordsService;
