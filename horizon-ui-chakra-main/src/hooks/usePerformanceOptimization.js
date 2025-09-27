// SMD VITAL - usePerformanceOptimization Hook
// Hook para optimizaciones de rendimiento en toda la aplicación

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Hook para optimizaciones de rendimiento
 * 
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Utilidades de optimización de rendimiento
 */
export const usePerformanceOptimization = (options = {}) => {
  const {
    enableMemoryOptimization = true,
    enableDebouncing = true,
    enableThrottling = true,
    enableLazyLoading = true,
    enableVirtualization = false,
    debounceDelay = 300,
    throttleDelay = 100
  } = options;

  // Estados de rendimiento
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    memoryUsage: 0,
    componentCount: 0
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef([]);
  const observerRef = useRef(null);

  // Debounce function
  const useDebounce = useCallback((value, delay = debounceDelay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      if (!enableDebouncing) {
        setDebouncedValue(value);
        return;
      }

      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  }, [enableDebouncing, debounceDelay]);

  // Throttle function
  const useThrottle = useCallback((callback, delay = throttleDelay) => {
    const lastRun = useRef(Date.now());

    return useCallback((...args) => {
      if (!enableThrottling) {
        return callback(...args);
      }

      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }, [callback, delay]);
  }, [enableThrottling, throttleDelay]);

  // Memoización inteligente
  const useMemoizedValue = useCallback((factory, deps, shouldMemoize = true) => {
    return useMemo(() => {
      if (!shouldMemoize) return factory();
      return factory();
    }, shouldMemoize ? deps : []);
  }, []);

  // Lazy loading con Intersection Observer
  const useLazyLoading = useCallback((threshold = 0.1) => {
    const [isVisible, setIsVisible] = useState(!enableLazyLoading);
    const [hasLoaded, setHasLoaded] = useState(!enableLazyLoading);
    const elementRef = useRef(null);

    useEffect(() => {
      if (!enableLazyLoading || !elementRef.current) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasLoaded(true);
            observer.disconnect();
          }
        },
        { threshold }
      );

      observer.observe(elementRef.current);
      observerRef.current = observer;

      return () => {
        observer.disconnect();
      };
    }, [threshold]);

    return { elementRef, isVisible, hasLoaded };
  }, [enableLazyLoading]);

  // Virtual scrolling utilities
  const useVirtualScrolling = useCallback((items, itemHeight, containerHeight) => {
    const [scrollTop, setScrollTop] = useState(0);
    
    const visibleItems = useMemo(() => {
      if (!enableVirtualization) return items;

      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
      );

      return items.slice(startIndex, endIndex).map((item, index) => ({
        ...item,
        index: startIndex + index,
        style: {
          position: 'absolute',
          top: (startIndex + index) * itemHeight,
          height: itemHeight,
          width: '100%'
        }
      }));
    }, [items, itemHeight, containerHeight, scrollTop]);

    const totalHeight = items.length * itemHeight;

    const handleScroll = useCallback((e) => {
      setScrollTop(e.target.scrollTop);
    }, []);

    return {
      visibleItems,
      totalHeight,
      handleScroll,
      containerProps: {
        style: {
          height: containerHeight,
          overflowY: 'auto',
          position: 'relative'
        },
        onScroll: handleScroll
      }
    };
  }, [enableVirtualization]);

  // Memory optimization
  const useMemoryOptimization = useCallback(() => {
    const cleanup = useCallback(() => {
      if (!enableMemoryOptimization) return;

      // Limpiar event listeners no utilizados
      const events = ['resize', 'scroll', 'mousemove', 'touchmove'];
      events.forEach(event => {
        const listeners = window.getEventListeners?.(window)?.[event] || [];
        listeners.forEach(listener => {
          if (!listener.useCapture && listener.passive) {
            window.removeEventListener(event, listener.listener);
          }
        });
      });

      // Forzar garbage collection si está disponible
      if (window.gc) {
        window.gc();
      }
    }, []);

    useEffect(() => {
      const interval = setInterval(cleanup, 30000); // Limpiar cada 30 segundos
      return () => {
        clearInterval(interval);
        cleanup();
      };
    }, [cleanup]);

    return cleanup;
  }, [enableMemoryOptimization]);

  // Performance monitoring
  const measurePerformance = useCallback((componentName, renderFunction) => {
    return useCallback((...args) => {
      const startTime = performance.now();
      renderCountRef.current += 1;

      const result = renderFunction(...args);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Actualizar métricas
      renderTimesRef.current.push(renderTime);
      if (renderTimesRef.current.length > 100) {
        renderTimesRef.current.shift(); // Mantener solo las últimas 100 mediciones
      }

      const averageTime = renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;

      setPerformanceMetrics(prev => ({
        ...prev,
        renderCount: renderCountRef.current,
        lastRenderTime: renderTime,
        averageRenderTime: averageTime,
        componentCount: prev.componentCount + 1
      }));

      // Alertar si el rendimiento es bajo
      if (renderTime > 16) { // 60 FPS = 16ms por frame
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }

      return result;
    }, [renderFunction, componentName]);
  }, []);

  // Bundle splitting utilities
  const useDynamicImport = useCallback((importFunction, fallback = null) => {
    const [component, setComponent] = useState(fallback);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      let cancelled = false;

      importFunction()
        .then(module => {
          if (!cancelled) {
            setComponent(() => module.default || module);
            setLoading(false);
          }
        })
        .catch(err => {
          if (!cancelled) {
            setError(err);
            setLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [importFunction]);

    return { component, loading, error };
  }, []);

  // Image optimization
  const useOptimizedImage = useCallback((src, options = {}) => {
    const {
      lazy = enableLazyLoading,
      placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PC9zdmc+',
      quality = 80,
      format = 'webp'
    } = options;

    const [imageSrc, setImageSrc] = useState(lazy ? placeholder : src);
    const [isLoaded, setIsLoaded] = useState(!lazy);
    const { elementRef, isVisible } = useLazyLoading();

    useEffect(() => {
      if (lazy && isVisible && !isLoaded) {
        const img = new Image();
        img.onload = () => {
          setImageSrc(src);
          setIsLoaded(true);
        };
        img.src = src;
      } else if (!lazy) {
        setImageSrc(src);
        setIsLoaded(true);
      }
    }, [src, lazy, isVisible, isLoaded]);

    return {
      ref: elementRef,
      src: imageSrc,
      isLoaded,
      imgProps: {
        loading: lazy ? 'lazy' : 'eager',
        decoding: 'async',
        style: {
          transition: 'opacity 0.3s ease-in-out',
          opacity: isLoaded ? 1 : 0.5
        }
      }
    };
  }, [enableLazyLoading, useLazyLoading]);

  // Performance report
  const getPerformanceReport = useCallback(() => {
    const memoryInfo = performance.memory ? {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    } : {};

    return {
      ...performanceMetrics,
      memoryInfo,
      recommendations: generateRecommendations(performanceMetrics)
    };
  }, [performanceMetrics]);

  // Generar recomendaciones de rendimiento
  const generateRecommendations = useCallback((metrics) => {
    const recommendations = [];

    if (metrics.averageRenderTime > 16) {
      recommendations.push({
        type: 'warning',
        message: 'Tiempo de renderizado promedio alto. Considera usar React.memo() o useMemo().',
        priority: 'high'
      });
    }

    if (metrics.renderCount > 1000) {
      recommendations.push({
        type: 'info',
        message: 'Alto número de re-renderizados. Verifica las dependencias de useEffect y useState.',
        priority: 'medium'
      });
    }

    if (performance.memory && performance.memory.usedJSHeapSize > 50000000) { // 50MB
      recommendations.push({
        type: 'warning',
        message: 'Alto uso de memoria. Considera implementar lazy loading y limpieza de componentes.',
        priority: 'high'
      });
    }

    return recommendations;
  }, []);

  // Cleanup automático
  const memoryCleanup = useMemoryOptimization();

  // Monitoreo de memoria
  useEffect(() => {
    if (!performance.memory) return;

    const updateMemoryUsage = () => {
      setPerformanceMetrics(prev => ({
        ...prev,
        memoryUsage: performance.memory.usedJSHeapSize
      }));
    };

    const interval = setInterval(updateMemoryUsage, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    // Hooks de optimización
    useDebounce,
    useThrottle,
    useMemoizedValue,
    useLazyLoading,
    useVirtualScrolling,
    useDynamicImport,
    useOptimizedImage,

    // Métricas y monitoreo
    performanceMetrics,
    measurePerformance,
    getPerformanceReport,

    // Utilidades
    memoryCleanup,
    isOptimizing,
    setIsOptimizing,

    // Configuraciones
    enableMemoryOptimization,
    enableDebouncing,
    enableThrottling,
    enableLazyLoading,
    enableVirtualization
  };
};

export default usePerformanceOptimization;
