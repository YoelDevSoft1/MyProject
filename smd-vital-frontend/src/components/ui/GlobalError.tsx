// ========================================
// COMPONENTE DE ERROR GLOBAL
// ========================================

import React from 'react';
import { useGlobalError } from '../../contexts/GlobalStateContext';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const GlobalError: React.FC<GlobalErrorProps> = ({ onRetry, onDismiss }) => {
  const { error, setError } = useGlobalError();

  if (!error) return null;

  const handleDismiss = () => {
    setError(null);
    onDismiss?.();
  };

  const handleRetry = () => {
    onRetry?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error del Sistema
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {error}
            </p>
            <div className="flex space-x-3">
              {onRetry && (
                <button
                  onClick={handleRetry}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reintentar
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 mr-1" />
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== COMPONENTE DE ERROR PARA OPERACIONES =====
interface OperationErrorProps {
  operation: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const OperationError: React.FC<OperationErrorProps> = ({ 
  operation, 
  onRetry, 
  onDismiss, 
  children, 
  fallback 
}) => {
  const { error } = useGlobalError();
  const { error: operationError } = useOperationError(operation);

  if (error || operationError) {
    return fallback || (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Error en {operation}
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {operationError || error}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// ===== HOOK PARA OPERACIONES =====
import { useOperationError as useOperationErrorHook } from '../../contexts/GlobalStateContext';

export function useOperationError(operation: string) {
  return useOperationErrorHook(operation);
}
