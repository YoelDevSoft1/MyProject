// SMD VITAL - API Migration Service
// Servicio para migrar del API Service anterior al nuevo con CORS

import apiServiceCors from './apiServiceCors';
import { logger } from '../config/environment';

/**
 * Migración del API Service con CORS funcionando
 * Este servicio mantiene compatibilidad con el código existente
 */
class ApiMigration {
  constructor() {
    this.newApiService = apiServiceCors;
    logger.info('🔄 API Migration initialized - Using CORS-enabled service');
  }

  // ========== MÉTODOS DE COMPATIBILIDAD ==========

  /**
   * Método request genérico (compatibilidad)
   */
  async request(url, options = {}) {
    const {
      method = 'GET',
      headers = {},
      body = null,
      token = null
    } = options;

    try {
      // Limpiar URL (remover base URL si está presente)
      const cleanUrl = url.replace('http://localhost:8000', '');
      
      // Convertir body a data si existe
      let data = null;
      if (body) {
        try {
          data = typeof body === 'string' ? JSON.parse(body) : body;
        } catch {
          data = body;
        }
      }

      // Usar el nuevo servicio
      const response = await this.newApiService.makeRequest(
        method.toLowerCase(),
        cleanUrl,
        data,
        token
      );

      // Convertir respuesta al formato esperado por el código anterior
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Request failed');
      }

    } catch (error) {
      logger.error('API Migration request failed:', error);
      throw error;
    }
  }

  // ========== MÉTODOS DIRECTOS (RECOMENDADOS) ==========

  /**
   * Login
   */
  async login(credentials) {
    return this.newApiService.login(credentials);
  }

  /**
   * Obtener citas
   */
  async getAppointments(token, params = {}) {
    return this.newApiService.getAppointments(token, params);
  }

  /**
   * Crear cita
   */
  async createAppointment(appointmentData, token) {
    return this.newApiService.createAppointment(appointmentData, token);
  }

  /**
   * Actualizar cita
   */
  async updateAppointment(appointmentId, appointmentData, token) {
    return this.newApiService.updateAppointment(appointmentId, appointmentData, token);
  }

  /**
   * Eliminar cita
   */
  async deleteAppointment(appointmentId, token) {
    return this.newApiService.deleteAppointment(appointmentId, token);
  }

  /**
   * Obtener perfil de usuario
   */
  async getUserProfile(token) {
    return this.newApiService.getUserProfile(token);
  }

  /**
   * Actualizar perfil
   */
  async updateUserProfile(userData, token) {
    return this.newApiService.updateUserProfile(userData, token);
  }

  /**
   * Obtener usuarios (admin)
   */
  async getUsers(token, params = {}) {
    return this.newApiService.getUsers(token, params);
  }

  /**
   * Obtener historiales médicos
   */
  async getMedicalRecords(token, params = {}) {
    return this.newApiService.getMedicalRecords(token, params);
  }

  /**
   * Obtener pagos
   */
  async getPayments(token, params = {}) {
    return this.newApiService.getPayments(token, params);
  }

  /**
   * Obtener notificaciones
   */
  async getNotifications(token, params = {}) {
    return this.newApiService.getNotifications(token, params);
  }

  /**
   * Health check
   */
  async healthCheck() {
    return this.newApiService.healthCheck();
  }

  /**
   * Buscar doctores
   */
  async searchDoctors(query, token) {
    return this.newApiService.searchDoctors(query, token);
  }

  /**
   * Obtener disponibilidad de doctor
   */
  async getDoctorAvailability(doctorId, date, token) {
    return this.newApiService.getDoctorAvailability(doctorId, date, token);
  }

  /**
   * Procesar con IA
   */
  async processWithAI(data, token) {
    return this.newApiService.processWithAI(data, token);
  }

  /**
   * Obtener modelos de IA
   */
  async getAIModels(token) {
    return this.newApiService.getAIModels(token);
  }

  /**
   * Obtener workflows de IA
   */
  async getAIWorkflows(token) {
    return this.newApiService.getAIWorkflows(token);
  }

  // ========== MÉTODOS DE GESTIÓN DE TOKEN ==========

  /**
   * Establecer token
   */
  setAuthToken(token) {
    this.newApiService.setAuthToken(token);
  }

  /**
   * Limpiar token
   */
  clearToken() {
    this.newApiService.clearToken();
  }

  // ========== MÉTODOS DE DIAGNÓSTICO ==========

  /**
   * Obtener estado CORS
   */
  getCorsStatus() {
    return this.newApiService.getCorsStatus();
  }

  /**
   * Probar conectividad
   */
  async testConnectivity() {
    return this.newApiService.testConnectivity();
  }

  /**
   * Reinicializar CORS
   */
  async reinitializeCors() {
    return this.newApiService.reinitializeCors();
  }
}

// Crear instancia singleton
const apiMigration = new ApiMigration();

// Mantener compatibilidad con el API Service anterior
export default apiMigration;


