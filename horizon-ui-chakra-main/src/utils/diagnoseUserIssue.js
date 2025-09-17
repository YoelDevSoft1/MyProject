/**
 * SMD Vital - Diagnóstico de Problemas de Usuario
 * ================================================
 * Utilidad para diagnosticar problemas de visualización de usuario
 */

import userService from '../services/userService';

class UserIssueDiagnostic {
  constructor() {
    this.issues = [];
    this.solutions = [];
  }

  /**
   * Ejecutar diagnóstico completo
   */
  async runDiagnostic() {
    console.log('🔍 SMD VITAL - Diagnóstico de Usuario');
    console.log('=====================================');

    // 1. Verificar datos en localStorage
    this.checkLocalStorage();

    // 2. Verificar contexto de autenticación
    this.checkAuthContext();

    // 3. Probar transformación de datos
    await this.testDataTransformation();

    // 4. Verificar conexión con backend
    await this.testBackendConnection();

    // 5. Generar reporte
    this.generateReport();

    return {
      issues: this.issues,
      solutions: this.solutions,
      hasIssues: this.issues.length > 0
    };
  }

  /**
   * Verificar datos en localStorage
   */
  checkLocalStorage() {
    console.log('\n📱 Verificando localStorage...');
    
    const token = localStorage.getItem('smd_vital_token');
    if (!token) {
      this.addIssue('No hay token de autenticación en localStorage', 'CRITICAL');
      this.addSolution('El usuario necesita iniciar sesión nuevamente');
      return;
    }

    console.log('✅ Token encontrado en localStorage');
    
    // Verificar si el token es válido (formato básico)
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        this.addIssue('Token de autenticación tiene formato inválido', 'HIGH');
        this.addSolution('Limpiar localStorage y volver a iniciar sesión');
      } else {
        console.log('✅ Token tiene formato válido');
      }
    } catch (error) {
      this.addIssue('Error al validar formato del token', 'HIGH');
    }
  }

  /**
   * Verificar contexto de autenticación
   */
  checkAuthContext() {
    console.log('\n🔐 Verificando contexto de autenticación...');
    
    // Esta función se llamaría desde un componente que tenga acceso al AuthContext
    // Por ahora, solo verificamos que el contexto esté disponible
    console.log('ℹ️  Nota: Verificar manualmente que AuthContext esté disponible');
  }

  /**
   * Probar transformación de datos
   */
  async testDataTransformation() {
    console.log('\n🔄 Probando transformación de datos...');
    
    const testCases = [
      {
        name: 'Datos de Google Auth',
        data: {
          id: '1',
          email: 'juan.perez@gmail.com',
          given_name: 'Juan',
          family_name: 'Pérez',
          name: 'Juan Pérez',
          google_id: 'google_123',
          role: 'user'
        }
      },
      {
        name: 'Datos de autenticación tradicional',
        data: {
          id: '2',
          email: 'maria.garcia@smdvital.com',
          first_name: 'María',
          last_name: 'García',
          username: 'maria.garcia',
          role: 'doctor'
        }
      },
      {
        name: 'Datos mínimos',
        data: {
          id: '3',
          email: 'test@example.com',
          username: 'testuser',
          role: 'user'
        }
      },
      {
        name: 'Datos vacíos',
        data: {
          id: '4',
          email: 'empty@example.com',
          role: 'user'
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n  Probando: ${testCase.name}`);
      const transformed = userService.transformUserProfile(testCase.data);
      
      if (!transformed) {
        this.addIssue(`Transformación falló para ${testCase.name}`, 'HIGH');
        continue;
      }

      console.log(`    Nombre original: ${testCase.data.name || 'N/A'}`);
      console.log(`    Nombre transformado: "${transformed.name}"`);
      
      if (!transformed.name || transformed.name === 'Usuario') {
        this.addIssue(`Nombre no se transformó correctamente para ${testCase.name}`, 'MEDIUM');
        this.addSolution('Verificar lógica de transformación en userService.transformUserProfile');
      } else {
        console.log('    ✅ Transformación exitosa');
      }
    }
  }

  /**
   * Verificar conexión con backend
   */
  async testBackendConnection() {
    console.log('\n🌐 Probando conexión con backend...');
    
    try {
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ Backend está respondiendo');
      } else {
        this.addIssue(`Backend respondió con status ${response.status}`, 'HIGH');
        this.addSolution('Verificar que el backend esté ejecutándose correctamente');
      }
    } catch (error) {
      this.addIssue(`No se puede conectar al backend: ${error.message}`, 'CRITICAL');
      this.addSolution('Iniciar el backend con: ./start-backend.sh');
    }
  }

  /**
   * Agregar problema al diagnóstico
   */
  addIssue(message, severity = 'MEDIUM') {
    this.issues.push({
      message,
      severity,
      timestamp: new Date().toISOString()
    });
    console.log(`❌ ${severity}: ${message}`);
  }

  /**
   * Agregar solución al diagnóstico
   */
  addSolution(message) {
    this.solutions.push({
      message,
      timestamp: new Date().toISOString()
    });
    console.log(`💡 Solución: ${message}`);
  }

  /**
   * Generar reporte final
   */
  generateReport() {
    console.log('\n📊 REPORTE DE DIAGNÓSTICO');
    console.log('========================');
    
    if (this.issues.length === 0) {
      console.log('✅ No se encontraron problemas');
      return;
    }

    console.log(`\n❌ Problemas encontrados: ${this.issues.length}`);
    this.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. [${issue.severity}] ${issue.message}`);
    });

    console.log(`\n💡 Soluciones sugeridas: ${this.solutions.length}`);
    this.solutions.forEach((solution, index) => {
      console.log(`  ${index + 1}. ${solution.message}`);
    });

    // Recomendaciones específicas
    console.log('\n🎯 RECOMENDACIONES:');
    
    const criticalIssues = this.issues.filter(issue => issue.severity === 'CRITICAL');
    if (criticalIssues.length > 0) {
      console.log('  🚨 Problemas críticos detectados - acción inmediata requerida');
    }

    const backendIssues = this.issues.filter(issue => 
      issue.message.includes('backend') || issue.message.includes('conexión')
    );
    if (backendIssues.length > 0) {
      console.log('  🔧 Problemas de backend - verificar servicios');
    }

    const transformIssues = this.issues.filter(issue => 
      issue.message.includes('transformación') || issue.message.includes('nombre')
    );
    if (transformIssues.length > 0) {
      console.log('  🔄 Problemas de transformación - verificar userService');
    }
  }

  /**
   * Limpiar datos de diagnóstico
   */
  clearDiagnostic() {
    this.issues = [];
    this.solutions = [];
  }

  /**
   * Obtener resumen del diagnóstico
   */
  getSummary() {
    const criticalCount = this.issues.filter(i => i.severity === 'CRITICAL').length;
    const highCount = this.issues.filter(i => i.severity === 'HIGH').length;
    const mediumCount = this.issues.filter(i => i.severity === 'MEDIUM').length;

    return {
      totalIssues: this.issues.length,
      criticalIssues: criticalCount,
      highIssues: highCount,
      mediumIssues: mediumCount,
      hasCriticalIssues: criticalCount > 0,
      status: criticalCount > 0 ? 'CRITICAL' : 
              highCount > 0 ? 'HIGH' : 
              mediumCount > 0 ? 'MEDIUM' : 'OK'
    };
  }
}

// Crear instancia singleton
const userIssueDiagnostic = new UserIssueDiagnostic();

export default userIssueDiagnostic;
