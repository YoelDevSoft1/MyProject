// SMD VITAL - CORS Interceptor
// Interceptor para manejar todos los problemas de CORS automáticamente

import { corsConfig, detectBackendUrl, createCorsHeaders, handleCorsResponse } from '../config/corsConfig';

/**
 * Interceptor de CORS que maneja automáticamente:
 * - Detección de backend URL
 * - Headers apropiados
 * - Reintentos automáticos
 * - Manejo de errores CORS
 */
class CorsInterceptor {
  constructor() {
    this.backendUrl = null;
    this.isDetecting = false;
    this.detectionPromise = null;
    this.requestQueue = [];
  }

  /**
   * Inicializar el interceptor detectando el backend
   */
  async initialize() {
    if (this.isDetecting) {
      return this.detectionPromise;
    }

    this.isDetecting = true;
    this.detectionPromise = this.detectBackend();
    
    try {
      await this.detectionPromise;
    } finally {
      this.isDetecting = false;
    }
  }

  /**
   * Detectar backend disponible
   */
  async detectBackend() {
    try {
      this.backendUrl = await detectBackendUrl();
      console.log(`🌐 CORS Interceptor initialized with backend: ${this.backendUrl}`);
    } catch (error) {
      console.error('🚨 Failed to detect backend URL:', error);
      this.backendUrl = corsConfig.backendUrls.primary;
    }
  }

  /**
   * Realizar request con manejo completo de CORS
   */
  async request(endpoint, options = {}) {
    // Asegurar que el backend esté detectado
    if (!this.backendUrl) {
      await this.initialize();
    }

    const {
      method = 'GET',
      token = null,
      data = null,
      headers = {},
      timeout = 30000,
      retries = corsConfig.retryConfig.maxRetries,
      credentials = 'include' // 🔧 Permitir configurar credentials
    } = options;

    // Construir URL completa
    const fullUrl = this.buildUrl(endpoint);
    
    // Crear headers con CORS
    const corsHeaders = createCorsHeaders(token, headers);

    // Configuración de fetch
    const fetchConfig = {
      method,
      headers: corsHeaders,
      credentials, // 🔧 Usar credentials configurado
      ...corsConfig.fetchConfig
    };

    // Agregar body si es necesario
    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      fetchConfig.body = JSON.stringify(data);
    }

    // Realizar request con reintentos
    return this.executeWithRetry(fullUrl, fetchConfig, endpoint, retries, timeout);
  }

  /**
   * Construir URL completa
   */
  buildUrl(endpoint) {
    // Si el endpoint ya es una URL completa, usarla
    if (endpoint.startsWith('http')) {
      return endpoint;
    }

    // Limpiar endpoint
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // En desarrollo, usar proxy si está configurado
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_PROXY === 'true') {
      return cleanEndpoint; // El proxy se encarga del resto
    }

    return `${this.backendUrl}${cleanEndpoint}`;
  }

  /**
   * Ejecutar request con reintentos automáticos
   */
  async executeWithRetry(url, config, endpoint, retries, timeout) {
    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🔄 CORS Request [${attempt + 1}/${retries + 1}]: ${config.method} ${url}`);

        // Crear AbortController para timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Realizar fetch con timeout
        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Manejar respuesta con CORS
        const handledResponse = await handleCorsResponse(response, endpoint);
        
        console.log(`✅ CORS Request successful: ${config.method} ${url}`);
        return handledResponse;

      } catch (error) {
        lastError = error;
        console.warn(`⚠️ CORS Request failed [${attempt + 1}/${retries + 1}]:`, error.message);

        // Si es el último intento, no esperar
        if (attempt === retries) {
          break;
        }

        // Esperar antes del siguiente intento (backoff exponencial)
        const delay = corsConfig.retryConfig.retryDelay * Math.pow(corsConfig.retryConfig.backoffMultiplier, attempt);
        await this.sleep(delay);

        // Si es error de CORS, intentar re-detectar backend
        if (error.message.includes('CORS') || error.name === 'TypeError') {
          console.log('🔍 Re-detecting backend due to CORS error...');
          await this.detectBackend();
          
          // Reconstruir URL con nuevo backend
          const newUrl = this.buildUrl(endpoint);
          if (newUrl !== url) {
            url = newUrl;
            console.log(`🔄 Retrying with new backend URL: ${url}`);
          }
        }
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    console.error(`🚨 CORS Request failed after ${retries + 1} attempts:`, lastError);
    throw new Error(`CORS_FINAL_ERROR: ${lastError.message}`);
  }

  /**
   * Realizar request GET con CORS
   */
  async get(endpoint, token = null, params = {}) {
    let fullEndpoint = endpoint;
    const paramsHaveKeys = params && Object.keys(params).length > 0;

    if (paramsHaveKeys) {
      const queryString = new URLSearchParams(params).toString();
      if (fullEndpoint.includes('?')) {
        fullEndpoint += `&${queryString}`;
      } else {
        fullEndpoint += `?${queryString}`;
      }
    }

    const response = await this.request(fullEndpoint, { method: 'GET', token });
    return this.parseResponse(response);
  }

  /**
   * Realizar request POST con CORS
   */
  async post(endpoint, data, token = null, options = {}) {
    const response = await this.request(endpoint, {
      method: 'POST',
      token,
      data,
      ...options
    });

    return this.parseResponse(response);
  }

  /**
   * Realizar request PUT con CORS
   */
  async put(endpoint, data, token = null) {
    const response = await this.request(endpoint, {
      method: 'PUT',
      token,
      data
    });

    return this.parseResponse(response);
  }

  /**
   * Realizar request DELETE con CORS
   */
  async delete(endpoint, token = null) {
    const response = await this.request(endpoint, {
      method: 'DELETE',
      token
    });

    return this.parseResponse(response);
  }

  /**
   * Parsear respuesta JSON
   */
  async parseResponse(response) {
    try {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.warn('⚠️ Failed to parse response as JSON:', error);
      return { error: 'Invalid JSON response' };
    }
  }

  /**
   * Utilidad para sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtener estado del interceptor
   */
  getStatus() {
    return {
      backendUrl: this.backendUrl,
      isDetecting: this.isDetecting,
      initialized: !!this.backendUrl
    };
  }

  /**
   * Resetear interceptor
   */
  reset() {
    this.backendUrl = null;
    this.isDetecting = false;
    this.detectionPromise = null;
    this.requestQueue = [];
  }
}

// Crear instancia singleton
const corsInterceptor = new CorsInterceptor();

// Inicializar automáticamente
corsInterceptor.initialize().catch(error => {
  console.error('🚨 Failed to initialize CORS interceptor:', error);
});

export default corsInterceptor;
