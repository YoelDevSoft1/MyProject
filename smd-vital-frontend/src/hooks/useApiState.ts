// ========================================
// HOOK BASE PARA MANEJO DE ESTADO DE API
// ========================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ApiResponse } from '../types/api-new';
import { useNotification } from './useNotification';

// ===== TIPOS DE ESTADO =====
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseApiStateOptions {
  initialData?: any;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onFinally?: () => void;
}

// ===== HOOK BASE =====
export function useApiState<T>(
  initialData: T | null = null,
  options: UseApiStateOptions = {}
): {
  state: ApiState<T>;
  setData: (data: T | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: boolean) => void;
  reset: () => void;
  handleApiCall: <R>(
    apiCall: () => Promise<ApiResponse<R>>,
    transform?: (data: R) => T
  ) => Promise<T | null>;
} {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
    success: false,
  });

  const { onSuccess, onError, onFinally } = options;
  const isMountedRef = useRef(true);
  const { showApiError } = useNotification();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Setters
  const setData = useCallback((data: T | null) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, data, success: true, error: null }));
    }
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, loading }));
    }
  }, []);

  const setError = useCallback((error: string | null) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, error, success: false }));
    }
  }, []);

  const setSuccess = useCallback((success: boolean) => {
    if (isMountedRef.current) {
      setState(prev => ({ ...prev, success }));
    }
  }, []);

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setState({
        data: initialData,
        loading: false,
        error: null,
        success: false,
      });
    }
  }, [initialData]);

  // Manejar llamadas a API
  const handleApiCall = useCallback(async <R>(
    apiCall: () => Promise<ApiResponse<R>>,
    transform?: (data: R) => T
  ): Promise<T | null> => {
    if (!isMountedRef.current) return null;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiCall();
      
      if (response.success) {
        const transformedData = transform ? transform(response.data) : (response.data as unknown as T);
        setData(transformedData);
        onSuccess?.(transformedData);
        return transformedData;
      } else {
        const errorMessage = response.message || 'Error desconocido';
        setError(errorMessage);
        onError?.(errorMessage);
        showApiError(new Error(errorMessage));
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      setError(errorMessage);
      onError?.(errorMessage);
      showApiError(error);
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        onFinally?.();
      }
    }
  }, [setData, setLoading, setError, setSuccess, onSuccess, onError, onFinally, showApiError]);

  return {
    state,
    setData,
    setLoading,
    setError,
    setSuccess,
    reset,
    handleApiCall,
  };
}
