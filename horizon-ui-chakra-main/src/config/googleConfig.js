/**
 * SMD VITAL - Configuración de Google OAuth
 * =========================================
 * 
 * Configuración centralizada para Google OAuth con soporte para FedCM
 * y compatibilidad con localhost para desarrollo.
 */

// Configuración de Google OAuth
export const GOOGLE_CONFIG = {
  // Client ID de Google OAuth
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '719717832661-f1bf6pi22lj5tj0l4duceltt9n1cmp63.apps.googleusercontent.com',
  
  // Configuración de dominios permitidos
  allowedOrigins: [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3000',
    'https://smdvitalbogota.com',
    'https://app.smdvitalbogota.com'
  ],
  
  // Configuración de redirección
  redirectUris: [
    'http://localhost:3001/',
    'http://localhost:3000/',
    'http://127.0.0.1:3001/',
    'http://127.0.0.1:3000/',
    'https://smdvitalbogota.com/',
    'https://app.smdvitalbogota.com/'
  ],
  
  // Scopes de Google OAuth
  scopes: 'openid email profile',
  
  // Configuración de FedCM (Federated Credential Management)
  fedcmConfig: {
    // Habilitar FedCM para mejor compatibilidad
    useFedcm: true,
    // Configuración de contexto
    context: 'signin',
    // Soporte para ITP (Intelligent Tracking Prevention)
    itpSupport: true,
    // Auto-selección deshabilitada para control manual
    autoSelect: false,
    // Cancelar al hacer clic fuera
    cancelOnTapOutside: true
  },
  
  // Configuración tradicional (fallback)
  traditionalConfig: {
    // Modo de interfaz de usuario
    uxMode: 'popup',
    // Contexto de autenticación
    context: 'signin',
    // Deshabilitar ITP para compatibilidad
    itpSupport: false,
    // Auto-selección deshabilitada
    autoSelect: false,
    // Cancelar al hacer clic fuera
    cancelOnTapOutside: true
  }
};

// Función para detectar si FedCM está disponible
export const isFedcmSupported = () => {
  return typeof window !== 'undefined' && 
         'IdentityCredential' in window &&
         'navigator' in window &&
         'credentials' in navigator &&
         'create' in navigator.credentials;
};

// Función para obtener la configuración apropiada
export const getGoogleConfig = () => {
  const baseConfig = {
    client_id: GOOGLE_CONFIG.clientId,
    callback: null, // Se establecerá dinámicamente
    scope: GOOGLE_CONFIG.scopes
  };

  if (isFedcmSupported()) {
    return {
      ...baseConfig,
      ...GOOGLE_CONFIG.fedcmConfig
    };
  } else {
    return {
      ...baseConfig,
      ...GOOGLE_CONFIG.traditionalConfig
    };
  }
};

// Función para validar el origen actual
export const validateOrigin = () => {
  if (typeof window === 'undefined') return false;
  
  const currentOrigin = window.location.origin;
  return GOOGLE_CONFIG.allowedOrigins.includes(currentOrigin);
};

// Función para obtener información de debug
export const getDebugInfo = () => {
  return {
    clientId: GOOGLE_CONFIG.clientId,
    currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
    isOriginValid: validateOrigin(),
    fedcmSupported: isFedcmSupported(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    timestamp: new Date().toISOString()
  };
};

export default GOOGLE_CONFIG;
