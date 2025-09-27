// SMD VITAL - useRequestThrottle Hook
// Hook para manejar throttling de requests y evitar rate limiting

import { useRef, useCallback } from 'react';

/**
 * Hook para throttling de requests
 * Evita hacer demasiadas peticiones al backend
 */
const useRequestThrottle = (minInterval = 2000) => {
  const lastRequestTimes = useRef(new Map());
  const pendingRequests = useRef(new Map());

  /**
   * Ejecuta una función con throttling por endpoint
   */
  const throttledRequest = useCallback(async (endpoint, requestFn) => {
    const now = Date.now();
    const lastTime = lastRequestTimes.current.get(endpoint) || 0;
    const timeSinceLastRequest = now - lastTime;

    // Si hay una request pendiente para este endpoint, retornar la promesa existente
    if (pendingRequests.current.has(endpoint)) {
      return pendingRequests.current.get(endpoint);
    }

    // Si no ha pasado suficiente tiempo, retornar datos cacheados o error
    if (timeSinceLastRequest < minInterval) {
      console.log(`Request throttled for ${endpoint}. Wait ${minInterval - timeSinceLastRequest}ms`);
      return {
        success: false,
        error: 'Request throttled',
        data: null,
        retryAfter: minInterval - timeSinceLastRequest
      };
    }

    // Ejecutar la request
    const requestPromise = (async () => {
      try {
        lastRequestTimes.current.set(endpoint, now);
        const result = await requestFn();
        return result;
      } catch (error) {
        console.error(`Throttled request failed for ${endpoint}:`, error);
        return {
          success: false,
          error: error.message,
          data: null
        };
      } finally {
        // Limpiar la request pendiente después de un pequeño delay
        setTimeout(() => {
          pendingRequests.current.delete(endpoint);
        }, 100);
      }
    })();

    pendingRequests.current.set(endpoint, requestPromise);
    return requestPromise;
  }, [minInterval]);

  /**
   * Verifica si un endpoint puede hacer una request
   */
  const canMakeRequest = useCallback((endpoint) => {
    const now = Date.now();
    const lastTime = lastRequestTimes.current.get(endpoint) || 0;
    return (now - lastTime) >= minInterval;
  }, [minInterval]);

  /**
   * Limpia el throttling para un endpoint específico
   */
  const clearThrottle = useCallback((endpoint) => {
    lastRequestTimes.current.delete(endpoint);
    pendingRequests.current.delete(endpoint);
  }, []);

  /**
   * Limpia todos los throttles
   */
  const clearAllThrottles = useCallback(() => {
    lastRequestTimes.current.clear();
    pendingRequests.current.clear();
  }, []);

  return {
    throttledRequest,
    canMakeRequest,
    clearThrottle,
    clearAllThrottles
  };
};

export default useRequestThrottle;
