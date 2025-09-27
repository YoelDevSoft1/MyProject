// SMD VITAL - Robust API Service
// Servicio de API robusto con CORS inteligente y adaptativo

import robustCorsService from './robustCorsService';

/**
 * Servicio de API robusto que se adapta automáticamente a la configuración del backend
 */
class RobustApiService {
  constructor() {
    this.authToken = null;
    this.loadToken();
    this.initialize();
  }

  /**
   * Inicializar el servicio
   */
  async initialize() {
    try {
      await robustCorsService.detectBackendConfiguration();
      console.log('🚀 Robust API Service initialized with strategy:', robustCorsService.getStatus().corsStrategy);
    } catch (error) {
      console.warn('⚠️ Failed to initialize robust API service:', error);
    }
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
   * Realizar request con manejo robusto de CORS
   */
  async makeRequest(method, endpoint, data = null, token = null) {
    try {
      const authToken = token || this.authToken;
      const response = await robustCorsService.makeRequest(method, endpoint, data, authToken);
      
      return {
        success: response.success,
        data: response.data,
        error: response.error,
        strategy: response.strategy,
        corsError: response.corsError
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
    const response = await this.makeRequest('post', '/login', credentials);
    
    if (response.success && response.data?.access_token) {
      this.setAuthToken(response.data.access_token);
    }
    
    return response;
  }

  /**
   * Registro de usuario
   */
  async register(userData) {
    return this.makeRequest('post', '/register', userData);
  }

  /**
   * Login con Google - Robusto
   */
  async loginWithGoogle(googleUserData) {
    console.log('🔐 Attempting Google login with robust CORS strategy...');
    
    const response = await this.makeRequest('post', '/google', {
      token: googleUserData.token,
      email: googleUserData.email,
      name: googleUserData.name,
      picture: googleUserData.picture,
      googleId: googleUserData.googleId
    });
    
    if (response.success && response.data?.access_token) {
      this.setAuthToken(response.data.access_token);
      console.log('✅ Google login successful with strategy:', response.strategy);
    } else {
      console.error('❌ Google login failed:', response.error);
    }
    
    return response;
  }

  /**
   * Logout
   */
  async logout() {
    const response = await this.makeRequest('post', '/logout');
    this.clearToken();
    return response;
  }

  /**
   * Verificar token (usando el endpoint /me)
   */
  async verifyToken(token) {
    return this.makeRequest('get', '/me', null, token);
  }

  // ========== GESTIÓN DE USUARIOS ==========

  /**
   * Obtener perfil de usuario
   */
  async getUserProfile(token) {
    return this.makeRequest('get', '/me', null, token);
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

  // ========== UTILIDADES ==========

  /**
   * Obtener estado del servicio CORS
   */
  getCorsStatus() {
    return robustCorsService.getStatus();
  }

  /**
   * Reinicializar CORS
   */
  async reinitializeCors() {
    return robustCorsService.reinitialize();
  }

  /**
   * Probar conectividad completa
   */
  async testConnectivity() {
    try {
      const healthResponse = await this.healthCheck();
      const corsStatus = this.getCorsStatus();
      
      return {
        success: healthResponse.success,
        status: healthResponse.success ? 'connected' : 'disconnected',
        corsStatus,
        strategy: corsStatus.corsStrategy,
        error: healthResponse.error
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

  /**
   * Diagnosticar problemas de CORS
   */
  async diagnoseCors() {
    const status = this.getCorsStatus();
    const connectivity = await this.testConnectivity();
    
    return {
      corsStatus: status,
      connectivity,
      recommendations: this._getCorsRecommendations(status, connectivity)
    };
  }

  /**
   * Obtener recomendaciones basadas en el estado
   */
  _getCorsRecommendations(corsStatus, connectivity) {
    const recommendations = [];

    if (!connectivity.success) {
      recommendations.push({
        type: 'error',
        message: 'Backend no accesible',
        action: 'Verificar que el backend esté ejecutándose en http://localhost:8001'
      });
    }

    if (corsStatus.corsStrategy === 'fallback') {
      recommendations.push({
        type: 'warning',
        message: 'Usando configuración de fallback',
        action: 'Configurar CORS correctamente en el backend'
      });
    }

    if (corsStatus.credentialsMode === 'omit') {
      recommendations.push({
        type: 'info',
        message: 'Credentials deshabilitados',
        action: 'El backend no soporta credentials con la configuración actual'
      });
    }

    return recommendations;
  }
}

// Crear instancia singleton
const robustApiService = new RobustApiService();

export default robustApiService;
