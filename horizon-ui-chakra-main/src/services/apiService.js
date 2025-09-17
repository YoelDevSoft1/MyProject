// SMD VITAL - API Service mejorado
// Servicio centralizado para todas las llamadas al backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Interceptores personalizados
const requestInterceptors = [];
const responseInterceptors = [];

// Clase personalizada para errores HTTP
class HttpError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.authToken = null;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    // Intentar recuperar el token del localStorage al inicializar
    this.loadToken();
  }

  // Cargar token desde localStorage
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

  // Guardar token en localStorage
  saveToken(token) {
    try {
      if (token) {
        localStorage.setItem('smd_vital_token', token);
      } else {
        localStorage.removeItem('smd_vital_token');
      }
    } catch (error) {
      console.warn('No se pudo guardar el token en localStorage:', error);
    }
  }

  // Métodos para manejar interceptores
  addRequestInterceptor(interceptor) {
    requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor) {
    responseInterceptors.push(interceptor);
  }

  // Establecer el token de autenticación
  setAuthToken(token) {
    this.authToken = token;
    if (token) {
      this.saveToken(token);
    }
  }

  // Eliminar el token de autenticación
  clearAuthToken() {
    this.authToken = null;
    this.saveToken(null);
  }

  // Método para aplicar interceptores de request
  async applyRequestInterceptors(config) {
    let processedConfig = { ...config };
    
    for (const interceptor of requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }
    
    return processedConfig;
  }

  // Método para aplicar interceptores de response
  async applyResponseInterceptors(response, config) {
    let processedResponse = response;
    
    for (const interceptor of responseInterceptors) {
      processedResponse = await interceptor(processedResponse, config);
    }
    
    return processedResponse;
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Configuración base
    let config = {
      headers: {
        ...this.defaultHeaders,
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
        ...options.headers,
      },
      ...options,
    };

    // Eliminar body si no se especifica (especialmente para GET/HEAD)
    if (['GET', 'HEAD'].includes(options.method?.toUpperCase()) && config.body) {
      delete config.body;
    }

    try {
      // Aplicar interceptores de request
      config = await this.applyRequestInterceptors(config);

      // Configurar timeout
      const timeout = options.timeout || 15000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Aplicar interceptores de response
      const processedResponse = await this.applyResponseInterceptors(response, config);

      if (!processedResponse.ok) {
        const errorData = await this.parseResponse(processedResponse);
        throw new HttpError(
          `HTTP ${processedResponse.status}: ${processedResponse.statusText}`,
          processedResponse.status,
          errorData
        );
      }

      const data = await this.parseResponse(processedResponse);
      return { success: true, data, status: processedResponse.status };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      
      // Manejar errores específicos
      if (error.name === 'AbortError') {
        return { 
          success: false, 
          error: 'Request timeout', 
          status: 0, 
          isTimeout: true 
        };
      }
      
      if (error instanceof HttpError) {
        // Si es un error de autenticación, limpiar el token
        if (error.status === 401) {
          this.clearAuthToken();
          // Redirigir a login si es una aplicación web
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = '/login';
          }
        }
        
        return { 
          success: false, 
          error: error.message, 
          status: error.status,
          data: error.data 
        };
      }
      
      return { 
        success: false, 
        error: error.message, 
        status: 0 
      };
    }
  }

  // Método para analizar la respuesta correctamente
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (error) {
        console.warn('Error parsing JSON response:', error);
        return null;
      }
    }
    
    return await response.text();
  }

  // ===== AUTH SERVICE =====
  async login(credentials) {
    // Convertir a formato form-data para OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', credentials.email); // OAuth2PasswordRequestForm usa 'username' para el email
    formData.append('password', credentials.password);
    
    const result = await this.request('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    if (result.success && result.data.access_token) {
      this.setAuthToken(result.data.access_token);
    }
    
    return result;
  }

  async register(userData) {
    const result = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (result.success && result.data.access_token) {
      this.setAuthToken(result.data.access_token);
    }
    
    return result;
  }

  async getProfile() {
    return this.request('/api/auth/me');
  }

  async logout() {
    const result = await this.request('/api/auth/logout', {
      method: 'POST',
    });
    
    this.clearAuthToken();
    return result;
  }

  async refreshToken(refreshToken) {
    return this.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async loginWithGoogle(googleUserData) {
    const result = await this.request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleUserData),
    });
    
    if (result.success && result.data.access_token) {
      this.setAuthToken(result.data.access_token);
    }
    
    return result;
  }

  // ===== USERS SERVICE =====
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    return this.request(endpoint);
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ===== APPOINTMENTS SERVICE =====
  async getAppointments(token, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/appointments?${queryString}` : '/appointments';
    return this.request(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getAppointmentById(id, token) {
    return this.request(`/appointments/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async createAppointment(appointmentData, token) {
    return this.request('/appointments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id, appointmentData, token) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData),
    });
  }

  async deleteAppointment(id, token) {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getAppointmentStats(token) {
    return this.request('/api/appointments/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // ===== MEDICAL RECORDS SERVICE =====
  async getMedicalRecords(token, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/medical-records?${queryString}` : '/medical-records';
    return this.request(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getMedicalRecordById(id, token) {
    return this.request(`/medical-records/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async createMedicalRecord(recordData, token) {
    return this.request('/medical-records', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(recordData),
    });
  }

  async updateMedicalRecord(id, recordData, token) {
    return this.request(`/medical-records/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(recordData),
    });
  }

  async deleteMedicalRecord(id, token) {
    return this.request(`/medical-records/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // ===== PAYMENTS SERVICE =====
  async getPayments(token, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/payments?${queryString}` : '/payments';
    return this.request(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getPaymentById(id, token) {
    return this.request(`/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async createPayment(paymentData, token) {
    return this.request('/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData),
    });
  }

  async updatePayment(id, paymentData, token) {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData),
    });
  }

  async deletePayment(id, token) {
    return this.request(`/payments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // ===== NOTIFICATIONS SERVICE =====
  async getNotifications(token, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
    return this.request(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getNotificationById(id, token) {
    return this.request(`/notifications/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async createNotification(notificationData, token) {
    return this.request('/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(notificationData),
    });
  }

  async updateNotification(id, notificationData, token) {
    return this.request(`/notifications/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(notificationData),
    });
  }

  async deleteNotification(id, token) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }


  // ===== USER PROFILE SERVICE =====
  async getUserProfile(token) {
    return this.request('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async updateUserProfile(profileData, token) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
  }

  async getUserNotifications(token, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/users/notifications?${queryString}` : '/api/users/notifications';
    return this.request(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async updateNotificationSettings(settings, token) {
    return this.request('/api/users/notifications/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings),
    });
  }

  async markNotificationAsRead(notificationId, token) {
    return this.request(`/api/users/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // ===== HEALTH CHECKS =====
  async checkHealth() {
    return this.request('/health');
  }
}

// Crear instancia singleton
const apiService = new ApiService();

// Añadir interceptor para reintentos en errores de red
apiService.addResponseInterceptor(async (response, config) => {
  if (!response.ok && config.retryCount < 3) {
    // Reintentar en caso de error de red o servidor
    await new Promise(resolve => setTimeout(resolve, 1000 * config.retryCount));
    return apiService.request(config.url, { ...config, retryCount: (config.retryCount || 0) + 1 });
  }
  return response;
});

export default apiService;