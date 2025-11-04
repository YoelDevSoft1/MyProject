// SMD VITAL - API Service with CORS Support
// Servicio de API completamente rediseñado para manejar CORS

import corsInterceptor from './corsInterceptor';

/**
 * Servicio de API con soporte completo de CORS
 */
class ApiServiceCors {
  constructor() {
    this.authToken = null;
    this.mockPatients = this._initializeMockPatients();
    this.patientsApiAvailable = true;
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
   * Login con Google
   * TEMPORAL: Sin credentials para evitar CORS wildcard
   */
  async loginWithGoogle(googleUserData) {
    try {
      // Usar corsInterceptor directamente sin credentials para evitar CORS wildcard
      const response = await corsInterceptor.post('/google', {
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
    const response = await this.makeRequest('post', '/logout');
    this.clearToken();
    return response;
  }

  /**
   * Verificar token
   */
  async verifyToken(token) {
    return this.makeRequest('get', '/me', null, token);
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

  // ========== GESTIÓN DE PACIENTES ==========
  /**
   * Obtener pacientes con soporte de fallback local
   */
  async getPatients(token, params = {}) {
    if (this.patientsApiAvailable) {
      const response = await this.makeRequest('get', '/patients', params, token);

      if (response.success) {
        const normalized = this._normalizePatientsResponse(response.data);
        const limit = this._parsePositiveInt(params?.limit, 10) || normalized.length || 1;
        const total = response.data?.total ?? response.total ?? normalized.length;
        const totalPages = response.totalPages || response.data?.totalPages || Math.max(1, Math.ceil((total || normalized.length || 1) / limit));

        return {
          success: true,
          data: normalized,
          total,
          totalPages
        };
      }

      if (!(response.error && response.error.includes('404'))) {
        throw new Error(response.error || 'Error obteniendo pacientes');
      }

      this.patientsApiAvailable = false;
    }

    return this._getPatientsFromMock(params);
  }

  /**
   * Crear paciente
   */
  async createPatient(patientData, token) {
    if (this.patientsApiAvailable) {
      const response = await this.makeRequest('post', '/patients', patientData, token);

      if (response.success) {
        return response;
      }

      if (!(response.error && response.error.includes('404'))) {
        throw new Error(response.error || 'Error creando paciente');
      }

      this.patientsApiAvailable = false;
    }

    return this._createPatientInMock(patientData);
  }

  /**
   * Actualizar paciente
   */
  async updatePatient(patientId, patientData, token) {
    if (this.patientsApiAvailable) {
      const response = await this.makeRequest('put', `/patients/${patientId}`, patientData, token);

      if (response.success) {
        return response;
      }

      if (!(response.error && response.error.includes('404'))) {
        throw new Error(response.error || 'Error actualizando paciente');
      }

      this.patientsApiAvailable = false;
    }

    return this._updatePatientInMock(patientId, patientData);
  }

  /**
   * Eliminar paciente
   */
  async deletePatient(patientId, token) {
    if (this.patientsApiAvailable) {
      const response = await this.makeRequest('delete', `/patients/${patientId}`, null, token);

      if (response.success) {
        return response;
      }

      if (!(response.error && response.error.includes('404'))) {
        throw new Error(response.error || 'Error eliminando paciente');
      }

      this.patientsApiAvailable = false;
    }

    return this._deletePatientFromMock(patientId);
  }

  /**
   * Exportar pacientes en CSV
   */
  async exportPatients(token, params = {}) {
    if (this.patientsApiAvailable) {
      const response = await this.makeRequest('get', '/patients/export', params, token);

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      if (!(response.error && response.error.includes('404'))) {
        throw new Error(response.error || 'Error exportando pacientes');
      }

      this.patientsApiAvailable = false;
    }

    return {
      success: true,
      data: this._generatePatientsCsv(this._filterPatients(this.mockPatients, params))
    };
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

  // ========== MÉTODOS HTTP DIRECTOS ==========

  /**
   * Método GET directo
   */
  async get(endpoint, params = {}, token = null) {
    return this.makeRequest('get', endpoint, params, token);
  }

  /**
   * Método POST directo
   */
  async post(endpoint, data = {}, token = null) {
    return this.makeRequest('post', endpoint, data, token);
  }

  /**
   * Método PUT directo
   */
  async put(endpoint, data = {}, token = null) {
    return this.makeRequest('put', endpoint, data, token);
  }

  /**
   * Método DELETE directo
   */
  async delete(endpoint, token = null) {
    return this.makeRequest('delete', endpoint, null, token);
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

  /**
   * Normalizar respuesta de pacientes
   */
  _normalizePatientsResponse(raw) {
    if (!raw) {
      return [];
    }

    if (Array.isArray(raw)) {
      return raw;
    }

    if (Array.isArray(raw?.patients)) {
      return raw.patients;
    }

    if (Array.isArray(raw?.data)) {
      return raw.data;
    }

    if (Array.isArray(raw?.users)) {
      return raw.users;
    }

    return [];
  }

  _getPatientsFromMock(params = {}) {
    const filtered = this._filterPatients(this.mockPatients, params);
    const limit = this._parsePositiveInt(params?.limit, 10) || 10;
    const page = this._parsePositiveInt(params?.page, 1) || 1;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      success: true,
      data,
      total,
      totalPages
    };
  }

  _filterPatients(patients, params = {}) {
    const search = (params?.search || '').toLowerCase();
    const status = (params?.status || '').toLowerCase();
    const gender = (params?.gender || '').toLowerCase();

    return patients.filter((patient) => {
      const matchesSearch = !search ||
        patient.name?.toLowerCase().includes(search) ||
        patient.patientId?.toLowerCase().includes(search) ||
        patient.email?.toLowerCase().includes(search);

      const matchesStatus = !status || patient.status?.toLowerCase() === status;
      const matchesGender = !gender || patient.gender?.toLowerCase() === gender;

      return matchesSearch && matchesStatus && matchesGender;
    });
  }

  _createPatientInMock(patientData) {
    const newPatient = this._preparePatientRecord({
      id: `patient-${Date.now()}`,
      ...patientData,
      status: patientData.status || 'active',
      lastVisit: patientData.lastVisit || new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.mockPatients = [newPatient, ...this.mockPatients];
    return { success: true, data: newPatient };
  }

  _updatePatientInMock(patientId, patientData) {
    const index = this.mockPatients.findIndex((patient) => patient.id === patientId);

    if (index === -1) {
      throw new Error('Paciente no encontrado en datos locales');
    }

    const updated = this._preparePatientRecord({
      ...this.mockPatients[index],
      ...patientData,
      updatedAt: new Date().toISOString()
    });

    this.mockPatients[index] = updated;
    return { success: true, data: updated };
  }

  _deletePatientFromMock(patientId) {
    const exists = this.mockPatients.some((patient) => patient.id === patientId);

    if (!exists) {
      throw new Error('Paciente no encontrado en datos locales');
    }

    this.mockPatients = this.mockPatients.filter((patient) => patient.id !== patientId);
    return { success: true };
  }

  _generatePatientsCsv(patients) {
    const headers = ['ID', 'Paciente', 'Edad', 'Género', 'Email', 'Teléfono', 'Estado', 'Última visita'];
    const rows = patients.map((patient) => [
      patient.patientId || patient.id,
      patient.name || '',
      patient.age || '',
      patient.gender || '',
      patient.email || '',
      patient.phone || '',
      patient.status || '',
      patient.lastVisit || ''
    ]);

    return [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
  }

  _preparePatientRecord(patient) {
    return {
      id: patient.id,
      patientId: patient.patientId || patient.id,
      name: patient.name || 'Paciente sin nombre',
      age: this._parsePositiveInt(patient.age, 0),
      gender: patient.gender || 'female',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      bloodType: patient.bloodType || 'O+',
      emergencyContact: patient.emergencyContact || '',
      insurance: patient.insurance || '',
      allergies: patient.allergies || '',
      status: patient.status || 'active',
      lastVisit: patient.lastVisit || '',
      upcomingAppointment: patient.upcomingAppointment || patient.nextAppointment || '',
      nextAppointment: patient.nextAppointment || patient.upcomingAppointment || '',
      createdAt: patient.createdAt || new Date().toISOString(),
      updatedAt: patient.updatedAt || new Date().toISOString()
    };
  }

  _initializeMockPatients() {
    const now = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];

    return [
      this._preparePatientRecord({
        id: 'patient-001',
        patientId: 'PAT-001',
        name: 'Ana Gómez',
        age: 32,
        gender: 'female',
        phone: '+57 300 123 4567',
        email: 'ana.gomez@smdvital.com',
        address: 'Cra 15 #45-32, Bogotá',
        bloodType: 'O+',
        emergencyContact: 'Luis Gómez - +57 310 765 4321',
        insurance: 'Salud Total',
        allergies: 'Penicilina',
        status: 'active',
        lastVisit: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5)),
        nextAppointment: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10))
      }),
      this._preparePatientRecord({
        id: 'patient-002',
        patientId: 'PAT-002',
        name: 'Carlos Pérez',
        age: 45,
        gender: 'male',
        phone: '+57 301 987 6543',
        email: 'carlos.perez@smdvital.com',
        address: 'Av 9 #120-05, Bogotá',
        bloodType: 'A+',
        emergencyContact: 'María Pérez - +57 315 123 9876',
        insurance: 'Sura',
        allergies: 'Ninguna',
        status: 'active',
        lastVisit: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12)),
        nextAppointment: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3))
      }),
      this._preparePatientRecord({
        id: 'patient-003',
        patientId: 'PAT-003',
        name: 'Juliana Rodríguez',
        age: 28,
        gender: 'female',
        phone: '+57 310 222 3344',
        email: 'juliana.rodriguez@smdvital.com',
        address: 'Calle 100 #15-25, Bogotá',
        bloodType: 'B-',
        emergencyContact: 'Andrés Rodríguez - +57 300 555 6677',
        insurance: 'Compensar',
        allergies: 'Mariscos',
        status: 'pending',
        lastVisit: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)),
        nextAppointment: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 20))
      }),
      this._preparePatientRecord({
        id: 'patient-004',
        patientId: 'PAT-004',
        name: 'Miguel Torres',
        age: 52,
        gender: 'male',
        phone: '+57 320 444 5566',
        email: 'miguel.torres@smdvital.com',
        address: 'Cl 26 #68C-61, Bogotá',
        bloodType: 'AB+',
        emergencyContact: 'Laura Torres - +57 315 444 5566',
        insurance: 'Nueva EPS',
        allergies: 'Aspirina',
        status: 'inactive',
        lastVisit: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90)),
        nextAppointment: ''
      }),
      this._preparePatientRecord({
        id: 'patient-005',
        patientId: 'PAT-005',
        name: 'Valentina Prieto',
        age: 36,
        gender: 'female',
        phone: '+57 313 888 1122',
        email: 'valentina.prieto@smdvital.com',
        address: 'Av Suba #105-15, Bogotá',
        bloodType: 'A-',
        emergencyContact: 'Sebastián Prieto - +57 312 555 4455',
        insurance: 'Sanitas',
        allergies: 'Gluten',
        status: 'active',
        lastVisit: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)),
        nextAppointment: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 45))
      })
    ];
  }

  _parsePositiveInt(value, fallback = 0) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }


  /**
   * Normalizar respuesta de pacientes
   */
  _normalizePatientsResponse(raw) {
    if (!raw) {
      return [];
    }

    if (Array.isArray(raw)) {
      return raw;
    }

    if (Array.isArray(raw?.patients)) {
      return raw.patients;
    }

    if (Array.isArray(raw?.data)) {
      return raw.data;
    }

    if (Array.isArray(raw?.users)) {
      return raw.users;
    }

    return [];
  }

  _getPatientsFromMock(params = {}) {
    const filtered = this._filterPatients(this.mockPatients, params);
    const limit = this._parsePositiveInt(params?.limit, 10) || 10;
    const page = this._parsePositiveInt(params?.page, 1) || 1;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      success: true,
      data,
      total,
      totalPages
    };
  }

  _filterPatients(patients, params = {}) {
    const search = (params?.search || '').toLowerCase();
    const status = (params?.status || '').toLowerCase();
    const gender = (params?.gender || '').toLowerCase();

    return patients.filter((patient) => {
      const matchesSearch = !search ||
        patient.name?.toLowerCase().includes(search) ||
        patient.patientId?.toLowerCase().includes(search) ||
        patient.email?.toLowerCase().includes(search);

      const matchesStatus = !status || patient.status?.toLowerCase() === status;
      const matchesGender = !gender || patient.gender?.toLowerCase() === gender;

      return matchesSearch && matchesStatus && matchesGender;
    });
  }

  _createPatientInMock(patientData) {
    const newPatient = this._preparePatientRecord({
      id: `patient-${Date.now()}`,
      ...patientData,
      status: patientData.status || 'active',
      lastVisit: patientData.lastVisit || new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.mockPatients = [newPatient, ...this.mockPatients];
    return { success: true, data: newPatient };
  }

  _updatePatientInMock(patientId, patientData) {
    const index = this.mockPatients.findIndex((patient) => patient.id === patientId);

    if (index === -1) {
      throw new Error('Paciente no encontrado en datos locales');
    }

    const updated = this._preparePatientRecord({
      ...this.mockPatients[index],
      ...patientData,
      updatedAt: new Date().toISOString()
    });

    this.mockPatients[index] = updated;
    return { success: true, data: updated };
  }

  _deletePatientFromMock(patientId) {
    const exists = this.mockPatients.some((patient) => patient.id === patientId);

    if (!exists) {
      throw new Error('Paciente no encontrado en datos locales');
    }

    this.mockPatients = this.mockPatients.filter((patient) => patient.id !== patientId);
    return { success: true };
  }

  _generatePatientsCsv(patients) {
    const headers = ['ID', 'Paciente', 'Edad', 'Género', 'Email', 'Teléfono', 'Estado', 'Última visita'];
    const rows = patients.map((patient) => [
      patient.patientId || patient.id,
      patient.name || '',
      patient.age || '',
      patient.gender || '',
      patient.email || '',
      patient.phone || '',
      patient.status || '',
      patient.lastVisit || ''
    ]);

    return [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
  }

  _preparePatientRecord(patient) {
    return {
      id: patient.id,
      patientId: patient.patientId || patient.id,
      name: patient.name || 'Paciente sin nombre',
      age: this._parsePositiveInt(patient.age, 0),
      gender: patient.gender || 'female',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      bloodType: patient.bloodType || 'O+',
      emergencyContact: patient.emergencyContact || '',
      insurance: patient.insurance || '',
      allergies: patient.allergies || '',
      status: patient.status || 'active',
      lastVisit: patient.lastVisit || '',
      upcomingAppointment: patient.upcomingAppointment || patient.nextAppointment || '',
      nextAppointment: patient.nextAppointment || patient.upcomingAppointment || '',
      createdAt: patient.createdAt || new Date().toISOString(),
      updatedAt: patient.updatedAt || new Date().toISOString()
    };
  }

  _initializeMockPatients() {
    const now = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];

    return [
      this._preparePatientRecord({
        id: 'patient-001',
        patientId: 'PAT-001',
        name: 'Ana Gómez',
        age: 32,
        gender: 'female',
        phone: '+57 300 123 4567',
        email: 'ana.gomez@smdvital.com',
        address: 'Cra 15 #45-32, Bogotá',
        bloodType: 'O+',
        emergencyContact: 'Luis Gómez - +57 310 765 4321',
        insurance: 'Salud Total',
        allergies: 'Penicilina',
        status: 'active',
        lastVisit: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5)),
        nextAppointment: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10))
      }),
      this._preparePatientRecord({
        id: 'patient-002',
        patientId: 'PAT-002',
        name: 'Carlos Pérez',
        age: 45,
        gender: 'male',
        phone: '+57 301 987 6543',
        email: 'carlos.perez@smdvital.com',
        address: 'Av 9 #120-05, Bogotá',
        bloodType: 'A+',
        emergencyContact: 'María Pérez - +57 315 123 9876',
        insurance: 'Sura',
        allergies: 'Ninguna',
        status: 'active',
        lastVisit: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12)),
        nextAppointment: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3))
      }),
      this._preparePatientRecord({
        id: 'patient-003',
        patientId: 'PAT-003',
        name: 'Juliana Rodríguez',
        age: 28,
        gender: 'female',
        phone: '+57 310 222 3344',
        email: 'juliana.rodriguez@smdvital.com',
        address: 'Calle 100 #15-25, Bogotá',
        bloodType: 'B-',
        emergencyContact: 'Andrés Rodríguez - +57 300 555 6677',
        insurance: 'Compensar',
        allergies: 'Mariscos',
        status: 'pending',
        lastVisit: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)),
        nextAppointment: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 20))
      }),
      this._preparePatientRecord({
        id: 'patient-004',
        patientId: 'PAT-004',
        name: 'Miguel Torres',
        age: 52,
        gender: 'male',
        phone: '+57 320 444 5566',
        email: 'miguel.torres@smdvital.com',
        address: 'Cl 26 #68C-61, Bogotá',
        bloodType: 'AB+',
        emergencyContact: 'Laura Torres - +57 315 444 5566',
        insurance: 'Nueva EPS',
        allergies: 'Aspirina',
        status: 'inactive',
        lastVisit: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90)),
        nextAppointment: ''
      }),
      this._preparePatientRecord({
        id: 'patient-005',
        patientId: 'PAT-005',
        name: 'Valentina Prieto',
        age: 36,
        gender: 'female',
        phone: '+57 313 888 1122',
        email: 'valentina.prieto@smdvital.com',
        address: 'Av Suba #105-15, Bogotá',
        bloodType: 'A-',
        emergencyContact: 'Sebastián Prieto - +57 312 555 4455',
        insurance: 'Sanitas',
        allergies: 'Gluten',
        status: 'active',
        lastVisit: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2)),
        nextAppointment: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 45))
      })
    ];
  }

  _parsePositiveInt(value, fallback = 0) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

}

// Crear instancia singleton
const apiServiceCors = new ApiServiceCors();

export default apiServiceCors;
