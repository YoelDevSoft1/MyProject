/**
 * SMD VITAL - API Service
 * =======================
 * 
 * Servicio centralizado para todas las llamadas a la API del backend.
 */

const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data, status: response.status };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return { success: false, error: error.message, status: 0 };
    }
  }

  // ===== AUTH SERVICE =====
  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile(token) {
    return this.request('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // ===== USERS SERVICE =====
  async getUsers(token) {
    return this.request('/api/users/', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // ===== APPOINTMENTS SERVICE =====
  async getAppointments(token, params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const url = `/api/appointments/appointments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getAppointmentById(token, appointmentId) {
    return this.request(`/api/appointments/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createAppointment(token, appointmentData) {
    return this.request('/api/appointments/appointments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(token, appointmentId, appointmentData) {
    return this.request(`/api/appointments/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(appointmentData),
    });
  }

  async deleteAppointment(token, appointmentId) {
    return this.request(`/api/appointments/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getAppointmentStats(token) {
    return this.request('/api/appointments/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // ===== MEDICAL RECORDS SERVICE =====
  async getMedicalRecords(token) {
    return this.request('/api/medical-records/', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // ===== PAYMENTS SERVICE =====
  async getPayments(token) {
    return this.request('/api/payments/', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // ===== NOTIFICATIONS SERVICE =====
  async getNotifications(token) {
    return this.request('/api/notifications/', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

const apiService = new ApiService();
export default apiService;

