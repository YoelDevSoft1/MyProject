import React from 'react';

export const LoadingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        {/* Logo o imagen de la aplicación */}
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        
        {/* Spinner de carga */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
        
        {/* Texto de carga */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando SMD Vital</h2>
        <p className="text-gray-600 mb-8">Preparando tu experiencia médica...</p>
        
        {/* Barra de progreso animada */}
        <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        
        {/* Texto de estado */}
        <p className="text-sm text-gray-500 mt-4">
          Verificando credenciales y cargando datos...
        </p>
      </div>
    </div>
  );
};