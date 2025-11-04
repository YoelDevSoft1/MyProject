// SMD VITAL - Robust CORS Service
// Servicio robusto de CORS que se adapta automáticamente a la configuración del backend

import { robustConfig, robustUtils } from '../config/robustConfig';
import { getServiceBaseUrl } from '../config/corsConfig';

const MEDICAL_RECORDS_URL = process.env.REACT_APP_MEDICAL_RECORDS_SERVICE_URL || 'http://localhost:8005';

/**
 * Servicio robusto de CORS que:
 * 1. Detecta automáticamente la configuración del backend
 * 2. Se adapta dinámicamente a diferentes configuraciones CORS
 * 3. Implementa estrategias de fallback inteligentes
 * 4. Maneja credentials de manera inteligente
 */

class RobustCorsService {
  constructor() {
    this.backendConfig = null;
    this.corsStrategy = null;
    this.credentialsMode = 'include';
    this.retryCount = 0;
    this.maxRetries = robustConfig.retryConfig.maxRetries;
    this.detectionPromise = null;
  }

  /**
   * Detectar configuración del backend automáticamente
   */
  async detectBackendConfiguration() {
    if (this.detectionPromise) {
      return this.detectionPromise;
    }

    this.detectionPromise = this._performDetection();
    return this.detectionPromise;
  }

  async _performDetection() {
    const strategies = [
      this._detectCredentialsSupport,
      this._detectWildcardSupport,
      this._detectSpecificOriginSupport,
      this._detectProxySupport
    ];

    for (const strategy of strategies) {
      try {
        const result = await strategy.call(this);
        if (result.success) {
      this.backendConfig = result.config;
      this.corsStrategy = result.strategy;
      robustUtils.log('info', `CORS Strategy detected: ${result.strategy}`, result.config);
          return result;
        }
      } catch (error) {
        console.warn(`⚠️ Strategy ${strategy.name} failed:`, error.message);
      }
    }

    // Fallback a configuración por defecto
    this.backendConfig = {
      supportsCredentials: false,
      supportsWildcard: true,
      supportsSpecificOrigin: false,
      supportsProxy: false
    };
    this.corsStrategy = 'fallback-omit';
    robustUtils.log('warn', 'Using fallback CORS configuration');
  }

  /**
   * Detectar si el backend soporta credentials con wildcard
   */
  async _detectCredentialsSupport() {
    const testUrl = 'http://localhost:8001/health';
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return {
          success: true,
          strategy: 'credentials-wildcard',
          config: {
            supportsCredentials: true,
            supportsWildcard: true,
            credentialsMode: 'include',
            backendUrl: 'http://localhost:8001'
          }
        };
      }
    } catch (error) {
      if (error.message.includes('wildcard') && error.message.includes('credentials')) {
        // Backend usa wildcard con credentials - no compatible
        return { success: false };
      }
    }

    return { success: false };
  }

  /**
   * Detectar si el backend soporta wildcard sin credentials
   */
  async _detectWildcardSupport() {
    const testUrl = 'http://localhost:8001/health';
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return {
          success: true,
          strategy: 'wildcard-omit',
          config: {
            supportsCredentials: false,
            supportsWildcard: true,
            credentialsMode: 'omit',
            backendUrl: 'http://localhost:8001'
          }
        };
      }
    } catch (error) {
      // Continuar con siguiente estrategia
    }

    return { success: false };
  }

  /**
   * Detectar si el backend soporta origins específicos
   */
  async _detectSpecificOriginSupport() {
    const testUrl = 'http://localhost:8001/health';
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3001'
        }
      });

      if (response.ok) {
        return {
          success: true,
          strategy: 'specific-origin',
          config: {
            supportsCredentials: true,
            supportsWildcard: false,
            supportsSpecificOrigin: true,
            credentialsMode: 'include',
            backendUrl: 'http://localhost:8001'
          }
        };
      }
    } catch (error) {
      // Continuar con siguiente estrategia
    }

    return { success: false };
  }

  /**
   * Detectar si hay proxy configurado
   */
  async _detectProxySupport() {
    // Verificar si hay proxy configurado en package.json
    try {
      const response = await fetch('/health', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        return {
          success: true,
          strategy: 'proxy',
          config: {
            supportsCredentials: true,
            supportsProxy: true,
            credentialsMode: 'include',
            backendUrl: 'proxy'
          }
        };
      }
    } catch (error) {
      // No hay proxy configurado
    }

    return { success: false };
  }

  /**
   * Realizar request adaptativo basado en la configuración detectada
   */
  async makeRequest(method, endpoint, data = null, token = null) {
    // Asegurar que la configuración esté detectada
    if (!this.backendConfig) {
      await this.detectBackendConfiguration();
    }

    const url = this._buildUrl(endpoint);
    const headers = this._buildHeaders(token);
    const credentials = this._getCredentialsMode();

    const config = {
      method: method.toUpperCase(),
      headers,
      credentials,
      ...this._getAdditionalConfig()
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
      config.body = JSON.stringify(data);
    }

    try {
      console.log(`🚀 Robust CORS Request [${this.corsStrategy}]: ${method} ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseBody}`);
      }

      const result = await this._parseResponse(response);
      console.log(`✅ Robust CORS Success: ${method} ${url}`);
      
      return {
        success: true,
        data: result,
        error: null,
        strategy: this.corsStrategy
      };

    } catch (error) {
      console.error(`❌ Robust CORS Error: ${method} ${url}`, error);
      
      // Intentar con estrategia de fallback si es necesario
      if (this.retryCount < this.maxRetries && this.corsStrategy !== 'fallback-omit') {
        return this._retryWithFallback(method, endpoint, data, token, error);
      }

      return {
        success: false,
        data: null,
        error: error.message,
        strategy: this.corsStrategy,
        corsError: error.message.includes('CORS') || error.message.includes('Failed to fetch')
      };
    }
  }

  /**
   * Construir URL basada en la estrategia detectada y ruteo por microservicio
   */
  _buildUrl(endpoint) {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    if (this.corsStrategy === 'proxy') {
      return cleanEndpoint; // Usar proxy
    }

    // USAR API GATEWAY (NGINX) - TODO pasa por el puerto 8000
    let baseUrl = 'http://localhost:8000';
    console.log(`🔍 API GATEWAY: ${cleanEndpoint} → ${baseUrl}`);
    
    return `${baseUrl}${cleanEndpoint}`;
  }

  /**
   * Construir headers basados en la configuración
   */
  _buildHeaders(token) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Agregar Origin específico si es necesario
    if (this.corsStrategy === 'specific-origin') {
      headers['Origin'] = 'http://localhost:3001';
    }

    return headers;
  }

  /**
   * Obtener modo de credentials basado en la estrategia
   */
  _getCredentialsMode() {
    switch (this.corsStrategy) {
      case 'credentials-wildcard':
      case 'specific-origin':
      case 'proxy':
        return 'include';
      case 'wildcard-omit':
      case 'fallback-omit':
        return 'omit';
      default:
        return 'include';
    }
  }

  /**
   * Obtener configuración adicional basada en la estrategia
   */
  _getAdditionalConfig() {
    // ARCHITECT'S NOTE: Se ha eliminado la configuración `mode: 'no-cors'` de la estrategia de fallback.
    // 'no-cors' impide el envío de la cabecera 'Content-Type', lo que rompía las solicitudes POST/PUT
    // a APIs que esperan un cuerpo JSON, resultando en errores 422 Unprocessable Entity.
    // La nueva estrategia de fallback ('fallback-omit') simplemente omite las credenciales,
    // lo cual es un intento de recuperación más seguro y compatible.
    const config = {};
    return config;
  }

  /**
   * Parsear respuesta
   */
  async _parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    const text = await response.text();
    // Intentar parsear como JSON, si falla, devolver el texto.
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }

  /**
   * Reintentar con estrategia de fallback
   */
  async _retryWithFallback(method, endpoint, data, token, originalError) {
    this.retryCount++;
    console.log(`🔄 Retrying with fallback strategy (attempt ${this.retryCount})`);

    // Cambiar a estrategia de fallback que omite credenciales pero mantiene la solicitud como una petición CORS estándar.
    const originalStrategy = this.corsStrategy;
    this.corsStrategy = 'fallback-omit';

    try {
      const url = this._buildUrl(endpoint);
      console.log(`🔍 Fallback URL Building: ${endpoint} → ${url}`);
      const headers = this._buildHeaders(token);
      const credentials = this._getCredentialsMode();
      const config = {
        method: method.toUpperCase(),
        headers,
        credentials,
      };

      // ARCHITECT'S FIX: Añadir body solo para los métodos que lo soportan.
      // Esto previene el error "Request with GET/HEAD method cannot have body".
      if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        config.body = JSON.stringify(data);
      }

      console.log(`🚀 Robust CORS Request [${this.corsStrategy}]: ${method} ${url}`);
      const response = await fetch(url, config);

      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseBody}`);
      }
      
      const result = await this._parseResponse(response);
      console.log(`✅ Fallback strategy successful`);
      
      return {
        success: true,
        data: result,
        error: null,
        strategy: this.corsStrategy
      };

    } catch (error) {
      console.error(`❌ Fallback strategy also failed:`, error);
      // Restaurar estrategia original para futuros reintentos si aplica
      this.corsStrategy = originalStrategy;
      // Relanzar el error original para que sea manejado por el consumidor final
      throw originalError;
    }
  }

  /**
   * Obtener estado del servicio
   */
  getStatus() {
    return {
      backendConfig: this.backendConfig,
      corsStrategy: this.corsStrategy,
      credentialsMode: this.credentialsMode,
      retryCount: this.retryCount,
      isDetecting: !!this.detectionPromise
    };
  }

  /**
   * Reinicializar servicio
   */
  reset() {
    this.backendConfig = null;
    this.corsStrategy = null;
    this.credentialsMode = 'include';
    this.retryCount = 0;
    this.detectionPromise = null;
  }

  /**
   * Forzar re-detección
   */
  async reinitialize() {
    this.reset();
    return this.detectBackendConfiguration();
  }
}

// Crear instancia singleton
const robustCorsService = new RobustCorsService();

export default robustCorsService;

