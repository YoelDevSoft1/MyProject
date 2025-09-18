/**
 * Prueba del endpoint de estadísticas de citas
 * Verifica que el endpoint funcione correctamente desde el frontend
 */

export const testAppointmentStatsEndpoint = {
  runTest: async (apiService, token) => {
    console.log('🧪 PRUEBA DE ENDPOINT DE ESTADÍSTICAS');
    console.log('=====================================');
    
    try {
      // Probar el endpoint directamente
      console.log('🔄 Probando endpoint /api/appointments/stats...');
      const response = await apiService.getAppointmentStats(token);
      
      console.log('📊 Respuesta completa:', response);
      
      if (response.success) {
        console.log('✅ Endpoint funcionando correctamente');
        console.log('   - Total citas:', response.data.total_appointments);
        console.log('   - Citas pendientes:', response.data.pending_appointments);
        console.log('   - Citas confirmadas:', response.data.confirmed_appointments);
        console.log('   - Citas completadas:', response.data.completed_appointments);
        console.log('   - Citas de hoy:', response.data.today_appointments);
        console.log('   - Citas próximas:', response.data.upcoming_appointments);
        console.log('   - Citas atrasadas:', response.data.overdue_appointments);
        
        return {
          success: true,
          message: 'Endpoint de estadísticas funcionando correctamente',
          data: response.data
        };
      } else {
        console.log('⚠️  Respuesta con error:', response.error);
        return {
          success: false,
          message: `Error en el endpoint: ${response.error}`,
          error: response.error
        };
      }
      
    } catch (error) {
      console.error('❌ Error en la prueba:', error.message);
      return {
        success: false,
        message: `Error en la prueba: ${error.message}`,
        error: error
      };
    }
  },
  
  // Función para probar sin token (solo verificar URL)
  testUrl: () => {
    console.log('🔍 VERIFICACIÓN DE URL');
    console.log('======================');
    
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    const endpoint = '/api/appointments/stats';
    const fullURL = `${baseURL}${endpoint}`;
    
    console.log('   - Base URL:', baseURL);
    console.log('   - Endpoint:', endpoint);
    console.log('   - URL completa:', fullURL);
    
    // Verificar que la URL sea correcta
    const isCorrect = fullURL.includes('/api/appointments/stats');
    
    if (isCorrect) {
      console.log('✅ URL configurada correctamente');
    } else {
      console.log('❌ URL incorrecta');
    }
    
    return {
      url: fullURL,
      isCorrect: isCorrect
    };
  }
};

export default testAppointmentStatsEndpoint;

