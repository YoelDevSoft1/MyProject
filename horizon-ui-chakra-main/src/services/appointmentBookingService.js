// SMD VITAL - Appointment Booking Service (Optimized)
// Service for intelligent appointment scheduling with race condition handling

import apiService from './apiService';

class AppointmentBookingService {
  constructor() {
    this.apiService = apiService;
    this.activeReservations = new Map();
  }

  /**
   * Generate valid UUID from numeric ID
   */
  generateUUIDFromId(id) {
    const paddedId = String(id).padStart(4, '0');
    return `550e8400-e29b-41d4-a716-${paddedId}${paddedId}${paddedId}`;
  }

  /**
   * Search available doctors by specialty
   */
  async searchAvailableDoctors(specialty, token, filters = {}) {
    try {
      const params = {
        specialty,
        is_active: true,
        ...filters
      };

      const response = await this.apiService.makeRequest('/api/doctors/search', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params
      });

      if (response.success) {
        // Extract doctors from nested structure
        let doctors = [];
        if (response.data?.data && Array.isArray(response.data.data)) {
          doctors = response.data.data;
        } else if (Array.isArray(response.data)) {
          doctors = response.data;
        }
        
        return {
          success: true,
          data: doctors
        };
      }

      return response;
    } catch (error) {
      console.error('[AppointmentBooking] Error searching doctors:', error);
      return {
        success: false,
        error: error.message || 'Error al buscar doctores'
      };
    }
  }

  /**
   * Get available time slots for a doctor
   */
  async getAvailableSlots(doctorId, date, token) {
    try {
      // Format date to YYYY-MM-DD
      const formattedDate = date.includes('T') ? date.split('T')[0] : date;

      // Check if doctorId is already a valid UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doctorId);
      const uuid = isUUID ? doctorId : this.generateUUIDFromId(doctorId);

      const response = await this.apiService.makeRequest('/api/appointments/availability', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          doctor_id: uuid,
          date: formattedDate
        }
      });

      if (response.success) {
        return {
          success: true,
          data: response.data.slots || []
        };
      }

      return response;
    } catch (error) {
      console.error('[AppointmentBooking] Error getting slots:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener horarios disponibles'
      };
    }
  }

  /**
   * Create temporary slot reservation
   */
  async createTemporaryReservation(reservationData, token) {
    try {
      const response = await this.apiService.makeRequest('/api/appointments/reserve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
      });

      if (response.success) {
        const reservation = response.data.data;
        
        // Store in local cache
        this.activeReservations.set(reservation.reservation_id, {
          ...reservation,
          expires_at: new Date(reservation.expires_at),
          created_at: new Date()
        });

        // Schedule automatic cleanup
        this._scheduleReservationCleanup(reservation.reservation_id);

        return {
          success: true,
          data: reservation
        };
      }

      return response;
    } catch (error) {
      console.error('[AppointmentBooking] Error creating reservation:', error);
      return {
        success: false,
        error: error.message || 'Error al crear reserva temporal'
      };
    }
  }

  /**
   * Confirm temporary reservation and create final appointment
   */
  async confirmReservation(reservationId, patientData, token) {
    try {
      // Verify reservation exists and hasn't expired
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

      const response = await this.apiService.makeRequest('/api/appointments/confirm', {
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
        // Clean up reservation from local cache
        this.activeReservations.delete(reservationId);
        
        return {
          success: true,
          data: response.data
        };
      }

      return response;
    } catch (error) {
      console.error('[AppointmentBooking] Error confirming reservation:', error);
      return {
        success: false,
        error: error.message || 'Error al confirmar la reserva'
      };
    }
  }

  /**
   * Cancel temporary reservation
   */
  async cancelReservation(reservationId, token) {
    try {
      const response = await this.apiService.makeRequest(`/api/appointments/reserve/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Clean from local cache regardless of result
      this.activeReservations.delete(reservationId);

      return response;
    } catch (error) {
      console.error('[AppointmentBooking] Error canceling reservation:', error);
      return {
        success: false,
        error: error.message || 'Error al cancelar la reserva'
      };
    }
  }

  /**
   * Get reservation status
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
   * Get all active reservations
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
        this.activeReservations.delete(id);
      }
    }

    return activeReservations;
  }

  /**
   * Schedule automatic reservation cleanup
   */
  _scheduleReservationCleanup(reservationId) {
    const reservation = this.activeReservations.get(reservationId);
    if (!reservation) return;

    const timeUntilExpiry = reservation.expires_at.getTime() - new Date().getTime();
    
    if (timeUntilExpiry > 0) {
      setTimeout(() => {
        this.activeReservations.delete(reservationId);
        console.log(`[AppointmentBooking] Reservation ${reservationId} cleaned up`);
      }, timeUntilExpiry);
    }
  }

  /**
   * Clean all expired reservations
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
   * Get available medical services
   */
  async getMedicalServices(token, filters = {}) {
    try {
      const response = await this.apiService.makeRequest('/api/medical-services', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: filters
      });

      return response;
    } catch (error) {
      console.error('[AppointmentBooking] Error getting services:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener servicios médicos'
      };
    }
  }

  /**
   * Validate slot availability before showing
   */
  async validateSlotAvailability(doctorId, slotDateTime, token) {
    try {
      const response = await this.apiService.makeRequest('/api/appointments/validate-slot', {
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
      console.error('[AppointmentBooking] Error validating slot:', error);
      return {
        success: false,
        error: error.message || 'Error al validar disponibilidad'
      };
    }
  }
}

// Singleton instance
const appointmentBookingService = new AppointmentBookingService();

export default appointmentBookingService;