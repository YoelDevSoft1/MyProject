// ========================================
// PANEL DE TESTING DE API
// ========================================

import React, { useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { useAsyncOperation } from '../../hooks/useLoading';
import { 
  useDashboard, 
  useAppointments, 
  useMedicalRecords, 
  useUsers,
  usePrescriptions,
  usePayments 
} from '../../hooks';
import { 
  apiService, 
  userService, 
  appointmentService, 
  medicalRecordService,
  prescriptionService,
  paymentService 
} from '../../services';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration: number;
  data?: any;
}

export const ApiTestPanel: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { showSuccess, showError, showInfo } = useNotification();

  // Hooks para testing
  const { refresh: refreshDashboard } = useDashboard();
  const { refresh: refreshAppointments } = useAppointments();
  const { refresh: refreshMedicalRecords } = useMedicalRecords();
  const { refresh: refreshUsers } = useUsers();
  const { refresh: refreshPrescriptions } = usePrescriptions();
  const { refresh: refreshPayments } = usePayments();

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    addResult({ name, status: 'pending', message: 'Ejecutando...', duration: 0 });

    try {
      const data = await testFn();
      const duration = Date.now() - startTime;
      addResult({ 
        name, 
        status: 'success', 
        message: '✅ Exitoso', 
        duration,
        data: data ? 'Datos recibidos' : 'Sin datos'
      });
      return true;
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Error desconocido';
      addResult({ 
        name, 
        status: 'error', 
        message: `❌ ${message}`, 
        duration 
      });
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    showInfo('Iniciando pruebas de API', 'Ejecutando tests de integración...');

    const tests = [
      // Tests de autenticación
      {
        name: 'Login API',
        test: () => apiService.post('/auth/login', { email: 'test@test.com', password: 'test123' })
      },
      {
        name: 'Register API',
        test: () => apiService.post('/auth/register', { 
          email: 'test2@test.com', 
          password: 'test123',
          name: 'Test User',
          role: 'patient'
        })
      },

      // Tests de usuarios
      {
        name: 'Get Users',
        test: () => userService.getUsers()
      },
      {
        name: 'Get User Profile',
        test: () => userService.getProfile()
      },

      // Tests de citas
      {
        name: 'Get Appointments',
        test: () => appointmentService.getAppointments()
      },
      {
        name: 'Get Today Appointments',
        test: () => appointmentService.getTodayAppointments()
      },

      // Tests de expedientes médicos
      {
        name: 'Get Medical Records',
        test: () => medicalRecordService.getMedicalRecords()
      },
      {
        name: 'Get Vital Signs',
        test: () => medicalRecordService.getVitalSigns()
      },

      // Tests de prescripciones
      {
        name: 'Get Prescriptions',
        test: () => prescriptionService.getPrescriptions()
      },

      // Tests de pagos
      {
        name: 'Get Payments',
        test: () => paymentService.getPayments()
      },

      // Tests de dashboard
      {
        name: 'Get Dashboard Stats',
        test: () => apiService.get('/dashboard/stats')
      },
      {
        name: 'Get Notifications',
        test: () => apiService.get('/notifications')
      }
    ];

    let successCount = 0;
    let totalCount = tests.length;

    for (const test of tests) {
      const success = await runTest(test.name, test.test);
      if (success) successCount++;
      
      // Pequeña pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Resultado final
    const successRate = (successCount / totalCount) * 100;
    if (successRate === 100) {
      showSuccess('Tests completados', `Todos los tests pasaron (${successCount}/${totalCount})`);
    } else if (successRate >= 80) {
      showInfo('Tests mayormente exitosos', `${successCount}/${totalCount} tests pasaron (${successRate.toFixed(1)}%)`);
    } else {
      showError('Tests con errores', `Solo ${successCount}/${totalCount} tests pasaron (${successRate.toFixed(1)}%)`);
    }

    setIsRunning(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🧪 Panel de Testing de API</h2>
        <div className="flex space-x-2">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Ejecutando...' : 'Ejecutar Tests'}
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Resumen */}
      {results.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {results.filter(r => r.status === 'success').length}
              </div>
              <div className="text-sm text-gray-600">Exitosos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {results.filter(r => r.status === 'error').length}
              </div>
              <div className="text-sm text-gray-600">Errores</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {results.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de resultados */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getStatusIcon(result.status)}</span>
                <div>
                  <div className="font-medium">{result.name}</div>
                  <div className="text-sm opacity-75">{result.message}</div>
                </div>
              </div>
              <div className="text-sm font-mono">
                {result.duration}ms
              </div>
            </div>
            {result.data && (
              <div className="mt-2 text-xs opacity-75">
                {result.data}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Estado de ejecución */}
      {isRunning && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-700">Ejecutando tests de integración...</span>
          </div>
        </div>
      )}
    </div>
  );
};
