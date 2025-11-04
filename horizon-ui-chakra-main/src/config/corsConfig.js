// SMD VITAL - CORS Configuration
// Configuración completa para manejar problemas de CORS

/**
 * Configuración de CORS para el frontend
 */
// DEBUG: Verificar variables de entorno - TIMESTAMP: 2025-10-01 10:10:00
console.log('🔍 ENV DEBUG [UPDATED]:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  REACT_APP_USER_SERVICE_URL: process.env.REACT_APP_USER_SERVICE_URL,
  REACT_APP_NOTIFICATION_SERVICE_URL: process.env.REACT_APP_NOTIFICATION_SERVICE_URL,
  REACT_APP_APPOINTMENT_SERVICE_URL: process.env.REACT_APP_APPOINTMENT_SERVICE_URL,
  REACT_APP_MEDICAL_RECORDS_SERVICE_URL: process.env.REACT_APP_MEDICAL_RECORDS_SERVICE_URL,
  REACT_APP_PAYMENT_SERVICE_URL: process.env.REACT_APP_PAYMENT_SERVICE_URL
});

const resolvedMedicalRecordsUrl = process.env.REACT_APP_MEDICAL_RECORDS_SERVICE_URL || 'http://localhost:8005';
console.log('🔍 HARDCODED URLs ACTIVE:', {
  medicalRecords: resolvedMedicalRecordsUrl,
  payments: 'http://localhost:8006',
  users: 'http://localhost:8002'
});

export const corsConfig = {
  // URLs del backend - USAR API GATEWAY (NGINX)
  backendUrls: {
    // Base API Gateway (Nginx) - TODO pasa por aquí
    primary: 'http://localhost:8000',
    // Todos los servicios están detrás del gateway
    users: 'http://localhost:8000',
    notifications: 'http://localhost:8000',
    appointments: 'http://localhost:8000',
    medicalRecords: 'http://localhost:8000',
    payments: 'http://localhost:8000',
    // Alternativas genéricas
    fallback: 'http://127.0.0.1:8000',
    docker: 'http://nginx:80' // Para entornos Docker
  },

  // Headers requeridos para CORS
  corsHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true'
  },

  // Configuración de fetch
  fetchConfig: {
    mode: 'cors',
    credentials: 'include',
    redirect: 'follow',
    referrerPolicy: 'no-referrer-when-downgrade'
  },

  // Endpoints que requieren autenticación
  protectedEndpoints: [
    '/appointments',
    '/users',
    '/medical-records',
    '/payments',
    '/notifications'
  ],

  // Endpoints públicos (no requieren token)
  publicEndpoints: [
    '/health',
    '/docs',
    '/auth/login',
    '/auth/register'
  ],

  // Configuración de reintentos
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2
  }
};

/**
 * Detectar el mejor endpoint del backend
 */
export const detectBackendUrl = async () => {
  const { backendUrls } = corsConfig;
  const urls = [backendUrls.primary, backendUrls.medicalRecords, backendUrls.payments, backendUrls.notifications, backendUrls.users, backendUrls.appointments, backendUrls.fallback, backendUrls.docker];
  
  for (const url of urls) {
    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        ...corsConfig.fetchConfig,
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });
      
      if (response.ok) {
        console.log(`✅ Backend detected at: ${url}`);
        return url;
      }
    } catch (error) {
      console.warn(`❌ Backend not available at: ${url}`, error.message);
    }
  }
  
  console.error('🚨 No backend URL is available');
  return backendUrls.primary; // Fallback por defecto
};

/**
 * Crear headers con CORS apropiados
 */
export const createCorsHeaders = (token = null, additionalHeaders = {}) => {
  const headers = {
    ...corsConfig.corsHeaders,
    ...additionalHeaders
  };

  // Agregar token de autenticación si está disponible
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Verificar si un endpoint requiere autenticación
 */
export const requiresAuth = (endpoint) => {
  const { protectedEndpoints, publicEndpoints } = corsConfig;
  
  // Verificar endpoints públicos primero
  if (publicEndpoints.some(pub => endpoint.startsWith(pub))) {
    return false;
  }
  
  // Verificar endpoints protegidos
  return protectedEndpoints.some(prot => endpoint.startsWith(prot));
};

/**
 * Resolver la URL base según el endpoint solicitado.
 * Permite enrutar a microservicios específicos en desarrollo.
 */
export const getServiceBaseUrl = (endpoint) => {
  const { backendUrls } = corsConfig;

  // Normalizar endpoint y remover prefijo /api si existe para reusar las reglas
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const isApiPrefixed = clean.startsWith('/api/');
  const normalized = isApiPrefixed ? (clean.length > 4 ? clean.slice(4) : '/') : clean;

  console.log(`?Y"? getServiceBaseUrl: ${endpoint} ??' ${clean} (normalized: ${normalized})`);
  console.log('?Y"? Available URLs:', backendUrls);

  const target = normalized;

  // TODO PASA POR EL API GATEWAY (NGINX)
  console.log(`🔍 API GATEWAY: ${target} → ${backendUrls.primary}`);
  return backendUrls.primary;
};

/**
 * Manejar respuesta de CORS
 */
export const handleCorsResponse = async (response, endpoint) => {
  // Si la respuesta es exitosa, devolverla
  if (response.ok) {
    return response;
  }

  // Manejar errores específicos de CORS
  if (response.status === 0 || response.type === 'opaque') {
    throw new Error(`CORS_ERROR: No se puede acceder a ${endpoint}. Verificar configuración de CORS en el backend.`);
  }

  if (response.status === 401) {
    throw new Error('CORS_AUTH_ERROR: Token de autenticación inválido o expirado.');
  }

  if (response.status === 403) {
    throw new Error('CORS_FORBIDDEN: No tienes permisos para acceder a este recurso.');
  }

  if (response.status === 429) {
    throw new Error('CORS_RATE_LIMIT: Demasiadas solicitudes. Intenta de nuevo más tarde.');
  }

  if (response.status >= 500) {
    throw new Error(`CORS_SERVER_ERROR: Error del servidor (${response.status}). El backend puede estar caído.`);
  }

  throw new Error(`CORS_HTTP_ERROR: Error HTTP ${response.status} - ${response.statusText}`);
};

export default corsConfig;






