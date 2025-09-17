import React from 'react';
import { usePWA } from '../../hooks/usePWA';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isOnline, needRefresh, installApp, updateApp } = usePWA();

  if (isInstalled) return null;

  return (
    <>
      {/* Install Prompt */}
      {isInstallable && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 md:left-auto md:right-4 md:max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🏥</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">
                Instalar SMD Vital
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Instala la app para acceso rápido y funcionalidad offline
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={installApp}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  Instalar
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Más tarde
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Available */}
      {needRefresh && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 md:left-auto md:right-4 md:max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">↻</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-green-900">
                Actualización disponible
              </h3>
              <p className="text-xs text-green-700 mt-1">
                Hay una nueva versión de SMD Vital disponible
              </p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={updateApp}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                >
                  Actualizar
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs text-green-600 hover:text-green-800"
                >
                  Recargar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-3 md:left-auto md:right-4 md:max-w-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">⚠️</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-900">
                Sin conexión
              </h3>
              <p className="text-xs text-yellow-700">
                Algunas funciones pueden estar limitadas
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
