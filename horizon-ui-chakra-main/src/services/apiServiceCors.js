// SMD VITAL - API Service with CORS Support
// Servicio de API completamente rediseñado para manejar CORS

import corsInterceptor from './corsInterceptor';

/**
 * Servicio de API con soporte completo de CORS
 */
class ApiServiceCors {
  constructor() {
    this.authToken = null;
    this.loadToken();
  }

  /**
   * Cargar token desde localStorage
   */
  loadToken() {
    try {
      const token = localStorage.getItem('smd_vital_token');
      if (token) {
        this.setAuthToken(token);
      }
    } catch (error) {
      console.warn('No se pudo cargar el token desde localStorage:', error);
    }
  }

  /**
   * Establecer token de autenticación
   */
  setAuthToken(token) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('smd_vital_token', token);
    } else {
      localStorage.removeItem('smd_vital_token');
    }
  }

  /**
   * Limpiar token
   */
  clearToken() {
    this.authToken = null;
    localStorage.removeItem('smd_vital_token');
  }

  /**
   * Realizar request con manejo de respuesta estándar
   */
  async makeRequest(method, endpoint, data = null, token = null) {
    try {
      const authToken = token || this.authToken;
      
      let response;
      switch (method.toLowerCase()) {
        case 'get':
          response = await corsInterceptor.get(endpoint, authToken, data);
          break;
        case 'post':
          response = await corsInterceptor.post(endpoint, data, authToken);
          break;
        case 'put':
          response = await corsInterceptor.put(endpoint, data, authToken);
          break;
        case 'delete':
          response = await corsInterceptor.delete(endpoint, authToken);
          break;
        default:
          throw new Error(`Método HTTP no soportado: ${method}`);
      }

      return {
        success: true,
        data: response,
        error: null
      };

    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      
      return {
        success: false,
        data: null,
        error: error.message,
        corsError: error.message.includes('CORS')
      };
    }
  }

  // ========== MÉTODOS DE AUTENTICACIÓN ==========

  /**
   * Login de usuario
   */
  async login(credentials) {
    const response = await this.makeRequest('post', '/api/v1/auth/login', credentials);
    
    if (response.success && response.data?.access_token) {
      this.setAuthToken(response.data.access_token);
    }
    
    return response;
  }

  /**
   * Registro de usuario
   */
  async register(userData) {
    return this.makeRequest('post', '/api/v1/auth/register', userData);
  }

  /**
   * Login con Google
   * TEMPORAL: Sin credentials para evitar CORS wildcard
   */
  async loginWithGoogle(googleUserData) {
    try {
      // Usar corsInterceptor directamente sin credentials para evitar CORS wildcard
      const response = await corsInterceptor.post('/api/v1/auth/google', {
        token: googleUserData.token, // JWT token de Google
        email: googleUserData.email,
        name: googleUserData.name,
        picture: googleUserData.picture,
        googleId: googleUserData.googleId
      }, null, { credentials: 'omit' }); // 🔧 TEMPORAL: Sin credentials para evitar CORS wildcard
      
      if (response?.access_token) {
        this.setAuthToken(response.access_token);
        return {
          success: true,
          data: response,
          error: null
        };
      }
      
      return {
        success: true,
        data: response,
        error: null
      };
      
    } catch (error) {
      console.error('Google Login Error:', error);
      return {
        success: false,
        data: null,
        error: error.message,
        corsError: error.message.includes('CORS')
      };
    }
  }

  /**
   * Logout
   */
  async logout() {
    const response = await this.makeRequest('post', '/api/v1/auth/logout');
    this.clearToken();
    return response;
  }

  /**
   * Verificar token
   */
  async verifyToken(token) {
    return this.makeRequest('get', '/api/v1/auth/verify', null, token);
  }

  // ========== GESTIÓN DE USUARIOS ==========

  /**
   * Obtener perfil de usuario
   */
  async getUserProfile(token) {
    return this.makeRequest('get', '/users/profile', null, token);
  }

  /**
   * Obtener perfil (alias para compatibilidad)
   */
  async getProfile(token) {
    return this.getUserProfile(token);
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateUserProfile(userData, token) {
    return this.makeRequest('put', '/users/profile', userData, token);
  }

  /**
   * Obtener lista de usuarios (admin)
   */
  async getUsers(token, params = {}) {
    return this.makeRequest('get', '/users', params, token);
  }

  // ========== GESTIÓN DE CITAS ==========

  /**
   * Obtener citas
   */
  async getAppointments(token, params = {}) {
    return this.makeRequest('get', '/appointments', params, token);
  }

  /**
   * Crear nueva cita
   */
  async createAppointment(appointmentData, token) {
    return this.makeRequest('post', '/appointments', appointmentData, token);
  }

  /**
   * Actualizar cita
   */
  async updateAppointment(appointmentId, appointmentData, token) {
    return this.makeRequest('put', `/appointments/${appointmentId}`, appointmentData, token);
  }

  /**
   * Eliminar cita
   */
  async deleteAppointment(appointmentId, token) {
    return this.makeRequest('delete', `/appointments/${appointmentId}`, null, token);
  }

  /**
   * Obtener cita por ID
   */
  async getAppointmentById(appointmentId, token) {
    return this.makeRequest('get', `/appointments/${appointmentId}`, null, token);
  }

  // ========== GESTIÓN DE HISTORIALES MÉDICOS ==========

  /**
   * Obtener historiales médicos
   */
  async getMedicalRecords(token, params = {}) {
    return this.makeRequest('get', '/medical-records', params, token);
  }

  /**
   * Crear historial médico
   */
  async createMedicalRecord(recordData, token) {
    return this.makeRequest('post', '/medical-records', recordData, token);
  }

  /**
   * Actualizar historial médico
   */
  async updateMedicalRecord(recordId, recordData, token) {
    return this.makeRequest('put', `/medical-records/${recordId}`, recordData, token);
  }

  // ========== GESTIÓN DE PAGOS ==========

  /**
   * Obtener pagos
   */
  async getPayments(token, params = {}) {
    return this.makeRequest('get', '/payments', params, token);
  }

  /**
   * Crear pago
   */
  async createPayment(paymentData, token) {
    return this.makeRequest('post', '/payments', paymentData, token);
  }

  /**
   * Actualizar pago
   */
  async updatePayment(paymentId, paymentData, token) {
    return this.makeRequest('put', `/payments/${paymentId}`, paymentData, token);
  }

  // ========== GESTIÓN DE NOTIFICACIONES ==========

  /**
   * Obtener notificaciones
   */
  async getNotifications(token, params = {}) {
    return this.makeRequest('get', '/notifications', params, token);
  }

  /**
   * Marcar notificación como leída
   */
  async markNotificationAsRead(notificationId, token) {
    return this.makeRequest('put', `/notifications/${notificationId}/read`, null, token);
  }

  /**
   * Crear notificación
   */
  async createNotification(notificationData, token) {
    return this.makeRequest('post', '/notifications', notificationData, token);
  }

  // ========== SERVICIOS DE SALUD ==========

  /**
   * Health check del sistema
   */
  async healthCheck() {
    return this.makeRequest('get', '/health');
  }

  /**
   * Obtener información del sistema
   */
  async getSystemInfo() {
    return this.makeRequest('get', '/system/info');
  }

  // ========== SERVICIOS DE IA ==========

  /**
   * Obtener modelos de IA
   */
  async getAIModels(token) {
    return this.makeRequest('get', '/ai/models', null, token);
  }

  /**
   * Obtener workflows de IA
   */
  async getAIWorkflows(token) {
    return this.makeRequest('get', '/ai/workflows', null, token);
  }

  /**
   * Procesar con IA
   */
  async processWithAI(data, token) {
    return this.makeRequest('post', '/ai/process', data, token);
  }

  // ========== BÚSQUEDA DE DOCTORES ==========

  /**
   * Buscar doctores
   */
  async searchDoctors(query, token) {
    return this.makeRequest('get', '/doctors/search', { query }, token);
  }

  /**
   * Obtener disponibilidad de doctor
   */
  async getDoctorAvailability(doctorId, date, token) {
    return this.makeRequest('get', `/doctors/${doctorId}/availability`, { date }, token);
  }

  // ========== RESERVAS TEMPORALES ==========

  /**
   * Crear reserva temporal
   */
  async createTemporaryReservation(reservationData, token) {
    return this.makeRequest('post', '/reservations/temporary', reservationData, token);
  }

  /**
   * Confirmar reserva temporal
   */
  async confirmTemporaryReservation(reservationId, token) {
    return this.makeRequest('post', `/reservations/temporary/${reservationId}/confirm`, null, token);
  }

  /**
   * Cancelar reserva temporal
   */
  async cancelTemporaryReservation(reservationId, token) {
    return this.makeRequest('delete', `/reservations/temporary/${reservationId}`, null, token);
  }

  // ========== UTILIDADES ==========

  /**
   * Obtener estado del interceptor CORS
   */
  getCorsStatus() {
    return corsInterceptor.getStatus();
  }

  /**
   * Reinicializar CORS
   */
  async reinitializeCors() {
    corsInterceptor.reset();
    return corsInterceptor.initialize();
  }

  /**
   * Probar conectividad
   */
  async testConnectivity() {
    try {
      const response = await this.healthCheck();
      return {
        success: response.success,
        status: response.success ? 'connected' : 'disconnected',
        corsStatus: this.getCorsStatus(),
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        status: 'error',
        corsStatus: this.getCorsStatus(),
        error: error.message
      };
    }
  }
}

// Crear instancia singleton
const apiServiceCors = new ApiServiceCors();

export default apiServiceCors;
