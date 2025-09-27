// SMD VITAL - Environment Configuration
// Configuración de variables de entorno con valores por defecto

/**
 * Configuración de entorno para la aplicación
 */
export const environment = {
  // URLs del backend
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8001',
  aiApiUrl: process.env.REACT_APP_AI_API_URL || 'http://localhost:8008',

  // Configuración de CORS
  corsEnabled: process.env.REACT_APP_CORS_ENABLED !== 'false',
  useProxy: process.env.REACT_APP_USE_PROXY === 'true',
  corsCredentials: process.env.REACT_APP_CORS_CREDENTIALS || 'include',
  corsMode: process.env.REACT_APP_CORS_MODE || 'cors',

  // Timeouts
  requestTimeout: parseInt(process.env.REACT_APP_REQUEST_TIMEOUT) || 30000,
  healthCheckTimeout: parseInt(process.env.REACT_APP_HEALTH_CHECK_TIMEOUT) || 5000,

  // Reintentos
  retryRequests: process.env.REACT_APP_RETRY_REQUESTS !== 'false',
  maxRetries: parseInt(process.env.REACT_APP_MAX_RETRIES) || 3,

  // Debug y logging
  debugCors: process.env.REACT_APP_DEBUG_CORS === 'true' || process.env.NODE_ENV === 'development',
  logLevel: process.env.REACT_APP_LOG_LEVEL || 'info',
  logCorsErrors: process.env.REACT_APP_LOG_CORS_ERRORS !== 'false',

  // Feature flags
  enableRealTime: process.env.REACT_APP_ENABLE_REAL_TIME === 'true',
  enableAutoRefresh: process.env.REACT_APP_ENABLE_AUTO_REFRESH === 'true',
  enableNotifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false',

  // Entorno
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test'
};

/**
 * Logging configurado según el entorno
 */
export const logger = {
  debug: (...args) => {
    if (environment.debugCors && environment.logLevel === 'debug') {
      console.debug('🐛 [DEBUG]', ...args);
    }
  },
  
  info: (...args) => {
    if (['debug', 'info'].includes(environment.logLevel)) {
      console.info('ℹ️ [INFO]', ...args);
    }
  },
  
  warn: (...args) => {
    if (['debug', 'info', 'warn'].includes(environment.logLevel)) {
      console.warn('⚠️ [WARN]', ...args);
    }
  },
  
  error: (...args) => {
    console.error('🚨 [ERROR]', ...args);
  },

  cors: (...args) => {
    if (environment.logCorsErrors) {
      console.group('🌐 [CORS]');
      console.log(...args);
      console.groupEnd();
    }
  }
};

export default environment;
