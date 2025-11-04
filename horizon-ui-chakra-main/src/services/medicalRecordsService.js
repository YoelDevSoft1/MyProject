import apiService from './apiService';

const normalizeRecords = (payload) => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload.records)) {
    return payload.records;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return Array.isArray(payload) ? payload : [];
};

const normalizeStats = (payload = {}) => ({
  totalRecords: payload.totalRecords ?? 0,
  activeRecords: payload.activeRecords ?? 0,
  archivedRecords: payload.archivedRecords ?? 0,
  pendingRecords: payload.pendingRecords ?? 0,
  followUpScheduled: payload.followUpScheduled ?? 0,
  lastUpdated: payload.lastUpdated ?? null
});

const buildPayload = (data = {}) => ({
  ...data,
  status: data.status || 'active'
});

export const fetchMedicalRecordsRequest = async ({ token, page = 1, limit = 10, status, doctor, search } = {}) => {
  const params = {
    page,
    limit,
    status: status || undefined,
    doctor: doctor || undefined,
    search: search || undefined
  };

  const response = await apiService.makeRequest('get', '/medical-records/admin', params, token);

  if (!response.success) {
    throw new Error(response.error || 'No fue posible cargar los expedientes medicos');
  }

  const payload = response.data || {};
  const records = normalizeRecords(payload);

  return {
    records,
    stats: normalizeStats(payload.stats),
    page: payload.page ?? page,
    limit: payload.limit ?? limit,
    total: payload.total ?? records.length,
    totalPages: payload.totalPages ?? payload.total_pages ?? 1
  };
};

export const fetchMedicalRecordRequest = async ({ token, recordId }) => {
  const response = await apiService.makeRequest('get', `/medical-records/admin/${recordId}`, null, token);

  if (!response.success) {
    throw new Error(response.error || 'No fue posible cargar el expediente medico');
  }

  return response.data;
};

export const createMedicalRecordRequest = async ({ token, payload }) => {
  const response = await apiService.makeRequest('post', '/medical-records/admin', buildPayload(payload), token);

  if (!response.success) {
    throw new Error(response.error || 'No fue posible crear el expediente medico');
  }

  return response.data;
};

export const updateMedicalRecordRequest = async ({ token, recordId, payload }) => {
  const response = await apiService.makeRequest('put', `/medical-records/admin/${recordId}`, buildPayload(payload), token);

  if (!response.success) {
    throw new Error(response.error || 'No fue posible actualizar el expediente medico');
  }

  return response.data;
};

export const deleteMedicalRecordRequest = async ({ token, recordId }) => {
  const response = await apiService.makeRequest('delete', `/medical-records/admin/${recordId}`, null, token);

  if (!response.success) {
    throw new Error(response.error || 'No fue posible eliminar el expediente medico');
  }

  return true;
};

export const exportMedicalRecordsRequest = async ({ token, status, doctor, search } = {}) => {
  const params = {
    status: status || undefined,
    doctor: doctor || undefined,
    search: search || undefined
  };

  const response = await apiService.makeRequest('get', '/medical-records/admin/export', params, token);

  if (!response.success) {
    throw new Error(response.error || 'No fue posible exportar los expedientes medicos');
  }

  return typeof response.data === 'string' ? response.data : '';
};
