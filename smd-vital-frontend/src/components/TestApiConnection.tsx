import React, { useState } from 'react';
import { apiService } from '../services/api';

export const TestApiConnection: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Probando conexión con el backend...');

    try {
      // Probar endpoint de health
      const response = await fetch('http://192.168.1.9:8000/health');
      
      if (response.ok) {
        setStatus('success');
        setMessage('✅ Backend conectado correctamente');
      } else {
        setStatus('error');
        setMessage(`❌ Backend respondió con error: ${response.status}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const testAuth = async () => {
    setStatus('testing');
    setMessage('Probando autenticación...');

    try {
      // Probar login con credenciales de prueba
      const response = await apiService.login({
        email: 'test@example.com',
        password: 'password123'
      });
      
      setStatus('success');
      setMessage('✅ Autenticación funcionando correctamente');
    } catch (error) {
      setStatus('error');
      setMessage(`❌ Error de autenticación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Prueba de Conexión API</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={testConnection}
            disabled={status === 'testing'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            Probar Conexión
          </button>
          
          <button
            onClick={testAuth}
            disabled={status === 'testing'}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
          >
            Probar Autenticación
          </button>
        </div>

        {status !== 'idle' && (
          <div className={`p-4 rounded-lg ${
            status === 'success' ? 'bg-green-50 text-green-800' :
            status === 'error' ? 'bg-red-50 text-red-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            <div className="flex items-center space-x-2">
              {status === 'testing' && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>}
              <span>{message}</span>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p><strong>Backend URL:</strong> http://192.168.1.9:8000</p>
          <p><strong>Estado:</strong> {status === 'idle' ? 'No probado' : status === 'testing' ? 'Probando...' : status === 'success' ? 'Conectado' : 'Error'}</p>
        </div>
      </div>
    </div>
  );
};
