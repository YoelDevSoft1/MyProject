// SMD VITAL - Appointment Booking Service
// Servicio para agendamiento inteligente de citas con manejo de race conditions

import apiService from './apiService';

class AppointmentBookingService {
  constructor() {
    this.apiService = apiService;
    this.activeReservations = new Map(); // Cache local de reservas activas
  }

  /**
   * Generar un UUID válido basado en un ID numérico
   * @param {string} id - ID numérico del doctor
   * @returns {string} UUID válido
   */
  generateUUIDFromId(id) {
    console.log('🔧 [generateUUIDFromId] ID recibido:', id, 'Tipo:', typeof id);
    
    // Generar un UUID determinístico basado en el ID
    const paddedId = String(id).padStart(4, '0');
    const uuid = `550e8400-e29b-41d4-a716-${paddedId}${paddedId}${paddedId}`;
    
    console.log('🔧 [generateUUIDFromId] Padded ID:', paddedId);
    console.log('🔧 [generateUUIDFromId] UUID generado:', uuid);
    console.log('🔧 [generateUUIDFromId] Longitud:', uuid.length);
    
    return uuid;
  }

  /**
   * Buscar doctores disponibles por especialidad
   * @param {string} specialty - Especialidad médica
   * @param {string} token - Token de autenticación
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Object>} Lista de doctores disponibles
   */
  async searchAvailableDoctors(specialty, token, filters = {}) {
    try {
      console.log('🔍 [AppointmentBookingService] Iniciando búsqueda de doctores');
      console.log('🔍 [AppointmentBookingService] Especialidad:', specialty);
      console.log('🔍 [AppointmentBookingService] Token:', token ? 'Presente' : 'Ausente');
      console.log('🔍 [AppointmentBookingService] Filtros:', filters);

      const params = {
        specialty: specialty,
        is_active: true,
        ...filters
      };

      console.log('🔍 [AppointmentBookingService] Parámetros:', params);

      const response = await apiService.request('/api/doctors/search', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: params
      });

      console.log('🔍 [AppointmentBookingService] Respuesta completa:', response);

      if (response.success) {
        console.log('✅ [AppointmentBookingService] Búsqueda exitosa, datos:', response.data);
        
        // El backend devuelve una estructura anidada, extraer los doctores
        let doctors = [];
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          doctors = response.data.data;
        } else if (Array.isArray(response.data)) {
          doctors = response.data;
        }
        
        console.log('✅ [AppointmentBookingService] Doctores extraídos:', doctors);
        
        return {
          success: true,
          data: doctors
        };
      }

      console.error('❌ [AppointmentBookingService] Búsqueda falló:', response);
      return response;
    } catch (error) {
      console.error('💥 [AppointmentBookingService] Error en búsqueda:', error);
      return {
        success: false,
        error: error.message || 'Error al buscar doctores'
      };
    }
  }

  /**
   * Obtener horarios disponibles de un doctor
   * @param {string} doctorId - ID del doctor
   * @param {string} date - Fecha en formato ISO
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} Horarios disponibles
   */
  async getAvailableSlots(doctorId, date, token) {
    try {
      console.log('🔍 [AppointmentBookingService] Obteniendo horarios disponibles');
      console.log('🔍 [AppointmentBookingService] Doctor ID:', doctorId);
      console.log('🔍 [AppointmentBookingService] Fecha recibida:', date);
      
      // Convertir fecha a formato YYYY-MM-DD si es necesario
      let formattedDate = date;
      if (date.includes('T')) {
        formattedDate = date.split('T')[0];
      }
      console.log('🔍 [AppointmentBookingService] Fecha formateada:', formattedDate);

      // Verificar si doctorId ya es un UUID válido
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doctorId);
      console.log('🔍 [AppointmentBookingService] Doctor ID es UUID:', isUUID);
      
      let uuid;
      if (isUUID) {
        // Si ya es un UUID, usarlo directamente
        uuid = doctorId;
        console.log('🔍 [AppointmentBookingService] Usando UUID existente:', uuid);
      } else {
        // Si no es UUID, generar uno
        uuid = this.generateUUIDFromId(doctorId);
        console.log('🔍 [AppointmentBookingService] UUID generado:', uuid);
      }
      
      console.log('🔍 [AppointmentBookingService] UUID final:', uuid);
      console.log('🔍 [AppointmentBookingService] Longitud del UUID:', uuid.length);
      console.log('🔍 [AppointmentBookingService] Formato UUID válido:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid));

      const requestParams = {
        doctor_id: uuid,
        date: formattedDate
      };
      
      console.log('🔧 [AppointmentBookingService] Parámetros de la petición:', requestParams);
      console.log('🔧 [AppointmentBookingService] URL completa:', `/api/appointments/availability?doctor_id=${uuid}&date=${formattedDate}`);

      const response = await apiService.request('/api/appointments/availability', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: requestParams
      });

      console.log('🔍 [AppointmentBookingService] Respuesta de disponibilidad:', response);
      console.log('🔍 [AppointmentBookingService] Respuesta completa:', JSON.stringify(response, null, 2));

      if (response.success) {
        console.log('🔍 [AppointmentBookingService] Slots extraídos:', response.data.slots);
        console.log('🔍 [AppointmentBookingService] Total slots:', response.data.slots?.length || 0);
        
        return {
          success: true,
          data: response.data.slots || []
        };
      }

      return response;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener horarios disponibles'
      };
    }
  }

  /**
   * Crear reserva temporal de horario
   * @param {Object} reservationData - Datos de la reserva
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} Resultado de la reserva
   */
  async createTemporaryReservation(reservationData, token) {
    try {
      console.log('🔧 [AppointmentBookingService] Creando reserva temporal');
      console.log('🔧 [AppointmentBookingService] Datos de reserva:', reservationData);
      console.log('🔧 [AppointmentBookingService] Token:', token ? 'Presente' : 'Ausente');
      
      const response = await apiService.request('/api/appointments/reserve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
      });
      
      console.log('🔧 [AppointmentBookingService] Respuesta de reserva:', response);

      if (response.success) {
        const reservation = response.data;
        
        // Guardar en cache local
        this.activeReservations.set(reservation.reservation_id, {
          ...reservation,
          expires_at: new Date(reservation.expires_at),
          created_at: new Date()
        });

        // Programar limpieza automática
        this._scheduleReservationCleanup(reservation.reservation_id);

        return {
          success: true,
          data: reservation
        };
      }

      return response;
    } catch (error) {
      console.error('Error creating temporary reservation:', error);
      return {
        success: false,
        error: error.message || 'Error al crear reserva temporal'
      };
    }
  }

  /**
   * Confirmar reserva temporal y crear cita definitiva
   * @param {string} reservationId - ID de la reserva
   * @param {Object} patientData - Datos del paciente
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} Resultado de la confirmación
   */
  async confirmReservation(reservationId, patientData, token) {
    try {
      // Verificar que la reserva existe y no ha expirado
      const reservation = this.activeReservations.get(reservationId);
      if (!reservation) {
        return {
          success: false,
          error: 'Reserva no encontrada o ha expirado'
        };
      }

      if (new Date() > reservation.expires_at) {
        this.activeReservations.delete(reservationId);
        return {
          success: false,
          error: 'La reserva ha expirado. Por favor, selecciona otro horario.'
        };
      }

      const response = await apiService.request('/api/appointments/confirm', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reservation_id: reservationId,
          patient_data: patientData
        })
      });

      if (response.success) {
        // Limpiar reserva del cache local
        this.activeReservations.delete(reservationId);
        
        return {
          success: true,
          data: response.data
        };
      }

      return response;
    } catch (error) {
      console.error('Error confirming reservation:', error);
      return {
        success: false,
        error: error.message || 'Error al confirmar la reserva'
      };
    }
  }

  /**
   * Cancelar reserva temporal
   * @param {string} reservationId - ID de la reserva
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} Resultado de la cancelación
   */
  async cancelReservation(reservationId, token) {
    try {
      const response = await apiService.request(`/api/appointments/reserve/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Limpiar del cache local independientemente del resultado
      this.activeReservations.delete(reservationId);

      return response;
    } catch (error) {
      console.error('Error canceling reservation:', error);
      return {
        success: false,
        error: error.message || 'Error al cancelar la reserva'
      };
    }
  }

  /**
   * Obtener estado de una reserva
   * @param {string} reservationId - ID de la reserva
   * @returns {Object} Estado de la reserva
   */
  getReservationStatus(reservationId) {
    const reservation = this.activeReservations.get(reservationId);
    
    if (!reservation) {
      return {
        status: 'not_found',
        message: 'Reserva no encontrada'
      };
    }

    const now = new Date();
    const timeLeft = Math.max(0, reservation.expires_at.getTime() - now.getTime());
    
    if (timeLeft === 0) {
      this.activeReservations.delete(reservationId);
      return {
        status: 'expired',
        message: 'La reserva ha expirado'
      };
    }

    return {
      status: 'active',
      message: 'Reserva activa',
      expires_at: reservation.expires_at,
      time_left_ms: timeLeft,
      time_left_minutes: Math.floor(timeLeft / (1000 * 60))
    };
  }

  /**
   * Obtener todas las reservas activas
   * @returns {Array} Lista de reservas activas
   */
  getActiveReservations() {
    const now = new Date();
    const activeReservations = [];

    for (const [id, reservation] of this.activeReservations.entries()) {
      if (reservation.expires_at > now) {
        activeReservations.push({
          id,
          ...reservation
        });
      } else {
        // Limpiar reservas expiradas
        this.activeReservations.delete(id);
      }
    }

    return activeReservations;
  }

  /**
   * Programar limpieza automática de reserva
   * @param {string} reservationId - ID de la reserva
   */
  _scheduleReservationCleanup(reservationId) {
    const reservation = this.activeReservations.get(reservationId);
    if (!reservation) return;

    const timeUntilExpiry = reservation.expires_at.getTime() - new Date().getTime();
    
    if (timeUntilExpiry > 0) {
      setTimeout(() => {
        this.activeReservations.delete(reservationId);
        console.log(`Reservation ${reservationId} automatically cleaned up`);
      }, timeUntilExpiry);
    }
  }

  /**
   * Limpiar todas las reservas expiradas
   */
  cleanupExpiredReservations() {
    const now = new Date();
    const expiredIds = [];

    for (const [id, reservation] of this.activeReservations.entries()) {
      if (reservation.expires_at <= now) {
        expiredIds.push(id);
      }
    }

    expiredIds.forEach(id => this.activeReservations.delete(id));
    
    return expiredIds.length;
  }

  /**
   * Obtener servicios médicos disponibles
   * @param {string} token - Token de autenticación
   * @param {Object} filters - Filtros
   * @returns {Promise<Object>} Lista de servicios
   */
  async getMedicalServices(token, filters = {}) {
    try {
      const response = await apiService.request('/api/medical-services', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: filters
      });

      return response;
    } catch (error) {
      console.error('Error getting medical services:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener servicios médicos'
      };
    }
  }

  /**
   * Validar disponibilidad antes de mostrar horarios
   * @param {string} doctorId - ID del doctor
   * @param {string} slotDateTime - Fecha y hora del slot
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} Resultado de la validación
   */
  async validateSlotAvailability(doctorId, slotDateTime, token) {
    try {
      const response = await apiService.request('/api/appointments/validate-slot', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          slot_datetime: slotDateTime
        })
      });

      return response;
    } catch (error) {
      console.error('Error validating slot availability:', error);
      return {
        success: false,
        error: error.message || 'Error al validar disponibilidad'
      };
    }
  }
}

// Crear instancia singleton
const appointmentBookingService = new AppointmentBookingService();

export default appointmentBookingService;
