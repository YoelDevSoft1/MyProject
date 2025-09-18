/**
 * SMD Vital - Debug de Token JWT
 * ===============================
 * Utilidad para diagnosticar problemas con tokens JWT
 */

class TokenDebugger {
  constructor() {
    this.token = null;
    this.decodedToken = null;
  }

  /**
   * Cargar token desde localStorage
   */
  loadToken() {
    this.token = localStorage.getItem('smd_vital_token');
    if (!this.token) {
      console.error('❌ No se encontró token en localStorage');
      return false;
    }
    console.log('✅ Token encontrado en localStorage');
    return true;
  }

  /**
   * Decodificar token JWT (sin verificar firma)
   */
  decodeToken() {
    if (!this.token) {
      console.error('❌ No hay token para decodificar');
      return false;
    }

    try {
      const parts = this.token.split('.');
      if (parts.length !== 3) {
        console.error('❌ Token JWT tiene formato inválido');
        return false;
      }

      // Decodificar header
      const header = JSON.parse(atob(parts[0]));
      console.log('📋 Header del token:', header);

      // Decodificar payload
      const payload = JSON.parse(atob(parts[1]));
      this.decodedToken = payload;
      console.log('📦 Payload del token:', payload);

      // Verificar campos requeridos
      if (!payload.sub) {
        console.error('❌ Token no contiene "sub" (user_id)');
        return false;
      }

      if (!payload.exp) {
        console.error('❌ Token no contiene "exp" (expiration)');
        return false;
      }

      // Verificar si el token está expirado
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        console.error('❌ Token está expirado');
        console.log(`   Expirado: ${new Date(payload.exp * 1000).toISOString()}`);
        console.log(`   Ahora: ${new Date(now * 1000).toISOString()}`);
        return false;
      }

      console.log('✅ Token JWT es válido');
      return true;

    } catch (error) {
      console.error('❌ Error al decodificar token:', error);
      return false;
    }
  }

  /**
   * Probar endpoint /me del backend
   */
  async testMeEndpoint() {
    if (!this.token) {
      console.error('❌ No hay token para probar endpoint');
      return false;
    }

    try {
      console.log('🌐 Probando endpoint /api/auth/me...');
      
      const response = await fetch('http://localhost:8000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📊 Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error en endpoint /me:', errorText);
        return false;
      }

      const userData = await response.json();
      console.log('👤 Datos del usuario recibidos:', userData);

      // Verificar campos críticos
      if (!userData.id) {
        console.error('❌ Campo "id" está vacío o undefined');
      } else {
        console.log('✅ Campo "id" presente:', userData.id);
      }

      if (!userData.email) {
        console.error('❌ Campo "email" está vacío o undefined');
      } else {
        console.log('✅ Campo "email" presente:', userData.email);
      }

      if (!userData.name || userData.name === 'Usuario') {
        console.warn('⚠️  Campo "name" es genérico o vacío:', userData.name);
      } else {
        console.log('✅ Campo "name" presente:', userData.name);
      }

      return true;

    } catch (error) {
      console.error('❌ Error al probar endpoint /me:', error);
      return false;
    }
  }

  /**
   * Ejecutar diagnóstico completo
   */
  async runDiagnostic() {
    console.log('🔍 SMD VITAL - Diagnóstico de Token JWT');
    console.log('========================================');

    // 1. Cargar token
    if (!this.loadToken()) {
      return false;
    }

    // 2. Decodificar token
    if (!this.decodeToken()) {
      return false;
    }

    // 3. Probar endpoint
    if (!await this.testMeEndpoint()) {
      return false;
    }

    console.log('✅ Diagnóstico completado exitosamente');
    return true;
  }

  /**
   * Obtener información del token
   */
  getTokenInfo() {
    if (!this.decodedToken) {
      return null;
    }

    return {
      userId: this.decodedToken.sub,
      email: this.decodedToken.email,
      role: this.decodedToken.role,
      exp: this.decodedToken.exp,
      expDate: new Date(this.decodedToken.exp * 1000).toISOString(),
      isExpired: this.decodedToken.exp < Math.floor(Date.now() / 1000)
    };
  }

  /**
   * Limpiar token (logout)
   */
  clearToken() {
    localStorage.removeItem('smd_vital_token');
    this.token = null;
    this.decodedToken = null;
    console.log('🗑️  Token limpiado de localStorage');
  }
}

// Crear instancia singleton
const tokenDebugger = new TokenDebugger();

// Función global para usar en la consola del navegador
window.debugToken = () => tokenDebugger.runDiagnostic();
window.getTokenInfo = () => tokenDebugger.getTokenInfo();
window.clearToken = () => tokenDebugger.clearToken();

export default tokenDebugger;

