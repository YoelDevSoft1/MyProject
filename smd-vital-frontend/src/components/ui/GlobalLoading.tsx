// ========================================
// COMPONENTE DE LOADING GLOBAL
// ========================================

import React from 'react';
import { useGlobalLoading } from '../../contexts/GlobalStateContext';
import { Loader2 } from 'lucide-react';

export const GlobalLoading: React.FC = () => {
  const { loading } = useGlobalLoading();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-xl">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-gray-700 font-medium">Cargando...</span>
      </div>
    </div>
  );
};

// ===== COMPONENTE DE LOADING PARA OPERACIONES =====
interface OperationLoadingProps {
  operation: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const OperationLoading: React.FC<OperationLoadingProps> = ({ 
  operation, 
  children, 
  fallback 
}) => {
  const { loading } = useGlobalLoading();
  const { loading: operationLoading } = useOperationLoading(operation);

  if (loading || operationLoading) {
    return fallback || (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando...</span>
      </div>
    );
  }

  return <>{children}</>;
};

// ===== HOOK PARA OPERACIONES =====
import { useOperationLoading as useOperationLoadingHook } from '../../contexts/GlobalStateContext';

export function useOperationLoading(operation: string) {
  return useOperationLoadingHook(operation);
}
