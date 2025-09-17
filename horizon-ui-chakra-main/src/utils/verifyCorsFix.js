/**
 * Verificación de la corrección de CORS para el endpoint de estadísticas
 * Confirma que los headers CORS estén funcionando correctamente
 */

export const verifyCorsFix = {
  runVerification: async () => {
    console.log('🔍 VERIFICACIÓN DE CORRECCIÓN CORS');
    console.log('==================================');
    
    try {
      // Probar el endpoint con fetch desde el navegador
      const response = await fetch('http://localhost:8000/api/appointments/stats', {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:3001',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Respuesta del endpoint:', response);
      console.log('   - Status:', response.status);
      console.log('   - OK:', response.ok);
      
      // Verificar headers CORS
      const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
      const corsMethods = response.headers.get('Access-Control-Allow-Methods');
      const corsHeaders = response.headers.get('Access-Control-Allow-Headers');
      const corsCredentials = response.headers.get('Access-Control-Allow-Credentials');
      
      console.log('🌐 Headers CORS:');
      console.log('   - Access-Control-Allow-Origin:', corsOrigin);
      console.log('   - Access-Control-Allow-Methods:', corsMethods);
      console.log('   - Access-Control-Allow-Headers:', corsHeaders);
      console.log('   - Access-Control-Allow-Credentials:', corsCredentials);
      
      // Verificar que los headers estén presentes
      const hasCorsOrigin = corsOrigin === 'http://localhost:3001';
      const hasCorsMethods = corsMethods && corsMethods.includes('GET');
      const hasCorsHeaders = corsHeaders && corsHeaders.includes('Authorization');
      const hasCorsCredentials = corsCredentials === 'true';
      
      const allCorsHeadersPresent = hasCorsOrigin && hasCorsMethods && hasCorsHeaders && hasCorsCredentials;
      
      if (response.ok && allCorsHeadersPresent) {
        console.log('✅ CORS configurado correctamente');
        
        // Intentar obtener los datos
        const data = await response.json();
        console.log('📈 Datos de estadísticas:', data);
        
        return {
          success: true,
          message: 'CORS funcionando correctamente - El endpoint de estadísticas está disponible',
          data: data,
          corsHeaders: {
            origin: corsOrigin,
            methods: corsMethods,
            headers: corsHeaders,
            credentials: corsCredentials
          }
        };
      } else {
        console.log('❌ Problemas con CORS o respuesta');
        return {
          success: false,
          message: 'Problemas con CORS o respuesta del endpoint',
          corsHeaders: {
            origin: corsOrigin,
            methods: corsMethods,
            headers: corsHeaders,
            credentials: corsCredentials
          }
        };
      }
      
    } catch (error) {
      console.error('❌ Error en la verificación:', error.message);
      return {
        success: false,
        message: `Error en la verificación: ${error.message}`,
        error: error
      };
    }
  },
  
  // Función para probar preflight request
  testPreflight: async () => {
    console.log('🔄 PRUEBA DE PREFLIGHT REQUEST');
    console.log('===============================');
    
    try {
      const response = await fetch('http://localhost:8000/api/appointments/stats', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3001',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Authorization,Content-Type'
        }
      });
      
      console.log('📊 Respuesta preflight:', response);
      console.log('   - Status:', response.status);
      console.log('   - OK:', response.ok);
      
      const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
      const corsMethods = response.headers.get('Access-Control-Allow-Methods');
      const corsHeaders = response.headers.get('Access-Control-Allow-Headers');
      
      console.log('🌐 Headers CORS en preflight:');
      console.log('   - Access-Control-Allow-Origin:', corsOrigin);
      console.log('   - Access-Control-Allow-Methods:', corsMethods);
      console.log('   - Access-Control-Allow-Headers:', corsHeaders);
      
      const isPreflightWorking = response.status === 204 && corsOrigin === 'http://localhost:3001';
      
      if (isPreflightWorking) {
        console.log('✅ Preflight request funcionando correctamente');
        return {
          success: true,
          message: 'Preflight request funcionando correctamente'
        };
      } else {
        console.log('❌ Problemas con preflight request');
        return {
          success: false,
          message: 'Problemas con preflight request'
        };
      }
      
    } catch (error) {
      console.error('❌ Error en preflight request:', error.message);
      return {
        success: false,
        message: `Error en preflight request: ${error.message}`,
        error: error
      };
    }
  }
};

export default verifyCorsFix;
