// SMD VITAL - Robust Configuration
// Configuración para el sistema robusto de CORS

/**
 * Configuración del sistema robusto de CORS
 */
export const robustConfig = {
  // URLs de backend para detección
  backendUrls: {
    primary: 'http://localhost:8001',
    secondary: 'http://localhost:3000',
    proxy: '/api'
  },

  // Estrategias de CORS soportadas
  corsStrategies: {
    'credentials-wildcard': {
      name: 'Credentials con Wildcard',
      description: 'Backend soporta wildcard con credentials',
      credentials: 'include',
      supportsWildcard: true,
      supportsCredentials: true
    },
    'specific-origin': {
      name: 'Origin Específico',
      description: 'Backend requiere origin específico',
      credentials: 'include',
      supportsWildcard: false,
      supportsCredentials: true,
      requiresOrigin: true
    },
    'wildcard-omit': {
      name: 'Wildcard sin Credentials',
      description: 'Backend soporta wildcard sin credentials',
      credentials: 'omit',
      supportsWildcard: true,
      supportsCredentials: false
    },
    'proxy': {
      name: 'Proxy',
      description: 'Usar proxy configurado',
      credentials: 'include',
      supportsProxy: true,
      supportsCredentials: true
    },
    'fallback': {
      name: 'Fallback',
      description: 'Configuración de emergencia',
      credentials: 'omit',
      mode: 'no-cors',
      supportsCredentials: false
    }
  },

  // Configuración de reintentos
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000
  },

  // Timeouts
  timeouts: {
    detection: 5000,
    request: 30000,
    healthCheck: 10000
  },

  // Headers por defecto
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },

  // Endpoints de prueba
  testEndpoints: {
    health: '/health',
    auth: '/api/v1/auth/',
    appointments: '/appointments',
    users: '/users'
  },

  // Configuración de logging
  logging: {
    enabled: true,
    level: 'info', // debug, info, warn, error
    showStrategy: true,
    showRetries: true
  }
};

/**
 * Utilidades para el sistema robusto
 */
export const robustUtils = {
  /**
   * Obtener configuración de estrategia
   */
  getStrategyConfig(strategy) {
    return robustConfig.corsStrategies[strategy] || robustConfig.corsStrategies.fallback;
  },

  /**
   * Validar configuración de backend
   */
  validateBackendConfig(config) {
    const required = ['backendUrl', 'supportsCredentials', 'supportsWildcard'];
    return required.every(key => config.hasOwnProperty(key));
  },

  /**
   * Generar headers para estrategia específica
   */
  generateHeaders(strategy, token = null, customHeaders = {}) {
    const strategyConfig = this.getStrategyConfig(strategy);
    const headers = { ...robustConfig.defaultHeaders, ...customHeaders };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (strategyConfig.requiresOrigin) {
      headers['Origin'] = 'http://localhost:3001';
    }

    return headers;
  },

  /**
   * Calcular delay para reintentos
   */
  calculateRetryDelay(attempt) {
    const { retryDelay, backoffMultiplier, maxDelay } = robustConfig.retryConfig;
    const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
    return Math.min(delay, maxDelay);
  },

  /**
   * Logging del sistema
   */
  log(level, message, data = null) {
    if (!robustConfig.logging.enabled) return;
    
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[robustConfig.logging.level] || 1;
    
    if (levels[level] >= currentLevel) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [ROBUST-CORS] ${message}`;
      
      switch (level) {
        case 'debug':
          console.debug(logMessage, data);
          break;
        case 'info':
          console.info(logMessage, data);
          break;
        case 'warn':
          console.warn(logMessage, data);
          break;
        case 'error':
          console.error(logMessage, data);
          break;
      }
    }
  }
};

export default robustConfig;


