import apiService from './apiService';

const normalizePatients = (payload) => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload.patients)) {
    return payload.patients;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.users)) {
    return payload.users;
  }

  return Array.isArray(payload) ? payload : [];
};

const normalizeStats = (payload = {}) => ({
  totalPatients: payload.totalPatients ?? payload.total_patients ?? 0,
  activePatients: payload.activePatients ?? payload.active_patients ?? 0,
  inactivePatients: payload.inactivePatients ?? payload.inactive_patients ?? 0,
  pendingPatients: payload.pendingPatients ?? payload.pending_patients ?? 0,
  averageAge: payload.averageAge ?? payload.average_age ?? 0
});

const buildPayload = (data = {}) => {
  const payload = { ...data };

  if (typeof payload.age === 'string' && payload.age.trim() === '') {
    delete payload.age;
  }

  if (payload.age !== undefined) {
    const parsed = Number(payload.age);
    if (Number.isNaN(parsed)) {
      delete payload.age;
    } else {
      payload.age = parsed;
    }
  }

  return payload;
};

export const fetchPatientsRequest = async ({ token, page = 1, limit = 10, status, gender, search } = {}) => {
  const params = {
    page,
    limit,
    status: status || undefined,
    gender: gender || undefined,
    search: search || undefined
  };

  const response = await apiService.makeRequest('get', '/patients', params, token);

  if (!response.success) {
    throw new Error(response.error || 'No fue posible cargar los pacientes');
  }

  const payload = response.data || {};
  const patients = normalizePatients(payload);

  return {
    patients,
    stats: normalizeStats(payload.stats),
    page: payload.page ?? page,
    limit: payload.limit ?? limit,
    total: payload.total ?? patients.length,
    totalPages: payload.totalPages ?? payload.total_pages ?? 1
  };
};

export const fetchPatientRequest = async ({ token, patientId }) => {
  const response = await apiService.makeRequest('get', `/patients/${patientId}`, null, token);

  if (!response.success) {
    throw new Error(response.error || 'No fue posible cargar el paciente');
  }

  return response.data;
};

export const createPatientRequest = async ({ token, payload }) => {
  const response = await apiService.makeRequest('post', '/patients', buildPayload(payload), token);

  if (!response.success) {
    throw new Error(response.error || 'No fue posible crear el paciente');
  }

  return response.data;
};

export const updatePatientRequest = async ({ token, patientId, payload }) => {
  const response = await apiService.makeRequest('put', `/patients/${patientId}`, buildPayload(payload), token);

  if (!response.success) {
    throw new Error(response.error || 'No fue posible actualizar el paciente');
  }

  return response.data;
};

export const deletePatientRequest = async ({ token, patientId }) => {
  const response = await apiService.makeRequest('delete', `/patients/${patientId}`, null, token);

  if (!response.success) {
    throw new Error(response.error || 'No fue posible eliminar el paciente');
  }

  return true;
};

export const exportPatientsRequest = async ({ token, status, gender, search } = {}) => {
  const params = {
    status: status || undefined,
    gender: gender || undefined,
    search: search || undefined
  };

  const response = await apiService.makeRequest('get', '/patients/export', params, token);

  if (!response.success) {
    throw new Error(response.error || 'No fue posible exportar los pacientes');
  }

  return typeof response.data === 'string' ? response.data : '';
};
