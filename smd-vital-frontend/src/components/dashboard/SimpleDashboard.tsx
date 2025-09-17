import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const SimpleDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(249 250 251)' }}>
      {/* Header */}
      <header className="shadow-sm border-b" style={{ backgroundColor: 'white', borderColor: 'rgb(229 231 235)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: 'rgb(17 24 39)' }}>
                SMD Vital
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm" style={{ color: 'rgb(55 65 81)' }}>
                Hola, {user?.first_name} {user?.last_name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-sm font-medium transition duration-200 text-white"
                style={{ backgroundColor: 'rgb(220 38 38)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(185 28 28)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(220 38 38)'}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="overflow-hidden shadow rounded-lg" style={{ backgroundColor: 'white' }}>
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium mb-4" style={{ color: 'rgb(17 24 39)' }}>
                ¡Bienvenido al Sistema SMD Vital!
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User Info Card */}
                <div className="p-6 rounded-lg" style={{ backgroundColor: 'rgb(239 246 255)' }}>
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'rgb(30 58 138)' }}>
                    Información del Usuario
                  </h3>
                  <div className="space-y-2 text-sm" style={{ color: 'rgb(30 64 175)' }}>
                    <p><strong>Nombre:</strong> {user?.first_name} {user?.last_name}</p>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Rol:</strong> {user?.role}</p>
                    <p><strong>Estado:</strong> {user?.is_active ? 'Activo' : 'Inactivo'}</p>
                  </div>
                </div>

                {/* System Status Card */}
                <div className="p-6 rounded-lg" style={{ backgroundColor: 'rgb(240 253 244)' }}>
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'rgb(20 83 45)' }}>
                    Estado del Sistema
                  </h3>
                  <div className="space-y-2 text-sm" style={{ color: 'rgb(22 101 52)' }}>
                    <p>✅ Backend conectado</p>
                    <p>✅ Base de datos activa</p>
                    <p>✅ Autenticación funcionando</p>
                    <p>✅ Frontend operativo</p>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="p-6 rounded-lg" style={{ backgroundColor: 'rgb(250 245 255)' }}>
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'rgb(88 28 135)' }}>
                    Acciones Rápidas
                  </h3>
                  <div className="space-y-2">
                    <button 
                      className="w-full px-4 py-2 rounded-md text-sm font-medium transition duration-200 text-white"
                      style={{ backgroundColor: 'rgb(147 51 234)' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(126 34 206)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(147 51 234)'}
                    >
                      Ver Perfil
                    </button>
                    <button 
                      className="w-full px-4 py-2 rounded-md text-sm font-medium transition duration-200 text-white"
                      style={{ backgroundColor: 'rgb(147 51 234)' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgb(126 34 206)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'rgb(147 51 234)'}
                    >
                      Configuración
                    </button>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="mt-8 px-4 py-3 rounded" style={{ backgroundColor: 'rgb(240 253 244)', borderColor: 'rgb(74 222 128)', color: 'rgb(21 128 61)' }}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5" style={{ color: 'rgb(74 222 128)' }} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      ¡Sistema funcionando correctamente! El backend y frontend están conectados y operativos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
