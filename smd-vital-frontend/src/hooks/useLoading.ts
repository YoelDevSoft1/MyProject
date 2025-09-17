// ========================================
// HOOK DE LOADING MEJORADO
// ========================================

import { useGlobalLoading, useOperationLoading as useOperationLoadingContext } from '../contexts/GlobalStateContext';

export function useLoading() {
  const { loading: globalLoading, setLoading: setGlobalLoading } = useGlobalLoading();

  const withGlobalLoading = async <T>(
    operation: () => Promise<T>,
    operationName: string = 'operación'
  ): Promise<T> => {
    try {
      setGlobalLoading(true);
      const result = await operation();
      return result;
    } finally {
      setGlobalLoading(false);
    }
  };

  return {
    globalLoading,
    setGlobalLoading,
    withGlobalLoading,
  };
}

export function useOperationLoading(operation: string) {
  const { loading, setLoading } = useOperationLoadingContext(operation);

  const withLoading = async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    try {
      setLoading(true);
      const result = await operation();
      return result;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    withLoading,
  };
}

// ===== HOOK COMBINADO =====
export function useAsyncOperation(operation: string) {
  const { withGlobalLoading } = useLoading();
  const { withLoading } = useOperationLoading(operation);
  const { showApiError, showApiSuccess } = useNotification();

  const execute = async <T>(
    operation: () => Promise<T>,
    showSuccess: boolean = true,
    successMessage?: string
  ): Promise<T | null> => {
    try {
      const result = await withLoading(operation);
      if (showSuccess) {
        showApiSuccess(successMessage || operation);
      }
      return result;
    } catch (error) {
      showApiError(error, operation);
      return null;
    }
  };

  const executeWithGlobalLoading = async <T>(
    operation: () => Promise<T>,
    showSuccess: boolean = true,
    successMessage?: string
  ): Promise<T | null> => {
    try {
      const result = await withGlobalLoading(operation, operation);
      if (showSuccess) {
        showApiSuccess(successMessage || operation);
      }
      return result;
    } catch (error) {
      showApiError(error, operation);
      return null;
    }
  };

  return {
    execute,
    executeWithGlobalLoading,
  };
}
