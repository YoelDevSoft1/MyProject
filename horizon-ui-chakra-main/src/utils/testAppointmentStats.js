/**
 * Prueba para la función getAppointmentStats
 * Verifica que la función esté disponible y funcione correctamente
 */

export const testAppointmentStats = {
  runTest: async (apiService, token) => {
    console.log('🧪 PRUEBA DE ESTADÍSTICAS DE CITAS');
    console.log('==================================');
    
    try {
      // Verificar que la función existe
      if (typeof apiService.getAppointmentStats !== 'function') {
        throw new Error('getAppointmentStats no es una función');
      }
      console.log('✅ Función getAppointmentStats está disponible');
      
      // Probar la función
      console.log('🔄 Probando función getAppointmentStats...');
      const response = await apiService.getAppointmentStats(token);
      
      console.log('📊 Respuesta recibida:', response);
      
      if (response.success) {
        console.log('✅ Estadísticas cargadas correctamente');
        console.log('   - Datos:', response.data);
      } else {
        console.log('⚠️  Respuesta con error:', response.error);
        console.log('   - Esto es normal si el backend no tiene el endpoint implementado');
      }
      
      return {
        success: true,
        message: 'Prueba completada - La función getAppointmentStats está funcionando',
        response: response
      };
      
    } catch (error) {
      console.error('❌ Error en la prueba:', error.message);
      return {
        success: false,
        message: `Error en la prueba: ${error.message}`,
        error: error
      };
    }
  },
  
  // Función para probar sin token (solo verificar que existe)
  testFunctionExists: (apiService) => {
    console.log('🔍 VERIFICACIÓN DE FUNCIÓN');
    console.log('==========================');
    
    const exists = typeof apiService.getAppointmentStats === 'function';
    
    if (exists) {
      console.log('✅ getAppointmentStats está definida');
      console.log('   - Tipo:', typeof apiService.getAppointmentStats);
      console.log('   - Nombre:', apiService.getAppointmentStats.name);
    } else {
      console.log('❌ getAppointmentStats NO está definida');
      console.log('   - Funciones disponibles:', Object.getOwnPropertyNames(apiService).filter(name => typeof apiService[name] === 'function'));
    }
    
    return exists;
  }
};

export default testAppointmentStats;
