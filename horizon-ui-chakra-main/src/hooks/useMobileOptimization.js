// SMD VITAL - useMobileOptimization Hook
// Hook para optimizaciones específicas de experiencia móvil

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBreakpointValue, useToast } from '@chakra-ui/react';

/**
 * Hook para optimizaciones de experiencia móvil
 * 
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Utilidades y estados para móvil
 */
export const useMobileOptimization = (options = {}) => {
  const {
    enableSwipeGestures = true,
    enablePullToRefresh = true,
    enableVirtualScrolling = false,
    adaptiveLoading = true,
    touchOptimization = true
  } = options;

  const toast = useToast();

  // Estados de dispositivo
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait',
    screenSize: { width: 0, height: 0 },
    touchSupport: false,
    connectionType: 'unknown'
  });

  const [gestureState, setGestureState] = useState({
    isSwipping: false,
    swipeDirection: null,
    swipeDistance: 0,
    touchStart: null,
    touchEnd: null
  });

  const [pullToRefreshState, setPullToRefreshState] = useState({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    threshold: 80
  });

  // Breakpoints responsivos
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  // Detectar información del dispositivo
  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        orientation: height > width ? 'portrait' : 'landscape',
        screenSize: { width, height },
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        connectionType: navigator.connection?.effectiveType || 'unknown'
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  // Gestión de gestos de deslizamiento
  const handleTouchStart = useCallback((event) => {
    if (!enableSwipeGestures || !touchOptimization) return;

    const touch = event.touches[0];
    setGestureState(prev => ({
      ...prev,
      touchStart: { x: touch.clientX, y: touch.clientY },
      touchEnd: null,
      isSwipping: false
    }));
  }, [enableSwipeGestures, touchOptimization]);

  const handleTouchMove = useCallback((event) => {
    if (!enableSwipeGestures || !gestureState.touchStart) return;

    const touch = event.touches[0];
    const touchEnd = { x: touch.clientX, y: touch.clientY };
    
    const deltaX = touchEnd.x - gestureState.touchStart.x;
    const deltaY = touchEnd.y - gestureState.touchStart.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Determinar dirección del swipe
    let direction = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    setGestureState(prev => ({
      ...prev,
      touchEnd,
      isSwipping: distance > 10,
      swipeDirection: direction,
      swipeDistance: distance
    }));

    // Pull to refresh
    if (enablePullToRefresh && direction === 'down' && window.scrollY === 0) {
      const pullDistance = Math.max(0, deltaY);
      setPullToRefreshState(prev => ({
        ...prev,
        isPulling: pullDistance > 10,
        pullDistance: Math.min(pullDistance, prev.threshold * 1.5)
      }));

      // Prevenir scroll si estamos haciendo pull to refresh
      if (pullDistance > 10) {
        event.preventDefault();
      }
    }
  }, [enableSwipeGestures, enablePullToRefresh, gestureState.touchStart]);

  const handleTouchEnd = useCallback((event, onSwipe) => {
    if (!enableSwipeGestures) return;

    const { touchStart, touchEnd, swipeDirection, swipeDistance } = gestureState;
    
    if (touchStart && touchEnd && swipeDistance > 50) {
      // Ejecutar callback de swipe si se proporciona
      if (onSwipe && typeof onSwipe === 'function') {
        onSwipe({
          direction: swipeDirection,
          distance: swipeDistance,
          startPoint: touchStart,
          endPoint: touchEnd
        });
      }
    }

    // Manejar pull to refresh
    if (enablePullToRefresh && pullToRefreshState.isPulling) {
      if (pullToRefreshState.pullDistance >= pullToRefreshState.threshold) {
        triggerRefresh();
      } else {
        setPullToRefreshState(prev => ({
          ...prev,
          isPulling: false,
          pullDistance: 0
        }));
      }
    }

    // Reset gesture state
    setGestureState({
      isSwipping: false,
      swipeDirection: null,
      swipeDistance: 0,
      touchStart: null,
      touchEnd: null
    });
  }, [enableSwipeGestures, enablePullToRefresh, gestureState, pullToRefreshState]);

  // Trigger refresh function
  const triggerRefresh = useCallback(async (refreshCallback) => {
    if (pullToRefreshState.isRefreshing) return;

    setPullToRefreshState(prev => ({
      ...prev,
      isRefreshing: true,
      isPulling: false
    }));

    try {
      if (refreshCallback && typeof refreshCallback === 'function') {
        await refreshCallback();
      }
      
      toast({
        title: "Contenido actualizado",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error during refresh:', error);
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar el contenido",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTimeout(() => {
        setPullToRefreshState(prev => ({
          ...prev,
          isRefreshing: false,
          pullDistance: 0
        }));
      }, 500);
    }
  }, [pullToRefreshState.isRefreshing, toast]);

  // Configurar event listeners para gestos
  const setupGestureListeners = useCallback((element, callbacks = {}) => {
    if (!element || !touchOptimization) return;

    const touchStartHandler = (e) => {
      handleTouchStart(e);
      callbacks.onTouchStart?.(e);
    };

    const touchMoveHandler = (e) => {
      handleTouchMove(e);
      callbacks.onTouchMove?.(e);
    };

    const touchEndHandler = (e) => {
      handleTouchEnd(e, callbacks.onSwipe);
      callbacks.onTouchEnd?.(e);
    };

    element.addEventListener('touchstart', touchStartHandler, { passive: false });
    element.addEventListener('touchmove', touchMoveHandler, { passive: false });
    element.addEventListener('touchend', touchEndHandler, { passive: true });

    return () => {
      element.removeEventListener('touchstart', touchStartHandler);
      element.removeEventListener('touchmove', touchMoveHandler);
      element.removeEventListener('touchend', touchEndHandler);
    };
  }, [touchOptimization, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Optimizaciones de rendimiento para móvil
  const getOptimalItemsPerPage = useCallback((itemHeight = 100) => {
    if (!adaptiveLoading) return 20;

    const viewportHeight = deviceInfo.screenSize.height;
    const availableHeight = viewportHeight - 200; // Dejar espacio para headers/footers
    const optimalItems = Math.ceil(availableHeight / itemHeight) + 5; // Buffer extra

    // Ajustar según el tipo de dispositivo
    if (deviceInfo.isMobile) {
      return Math.min(optimalItems, 15);
    } else if (deviceInfo.isTablet) {
      return Math.min(optimalItems, 25);
    } else {
      return Math.min(optimalItems, 50);
    }
  }, [adaptiveLoading, deviceInfo]);

  // Configuración de scroll virtual
  const getVirtualScrollConfig = useCallback(() => {
    if (!enableVirtualScrolling) return null;

    return {
      itemHeight: deviceInfo.isMobile ? 80 : 100,
      containerHeight: deviceInfo.screenSize.height - 200,
      overscan: deviceInfo.isMobile ? 3 : 5,
      scrollBehavior: 'smooth'
    };
  }, [enableVirtualScrolling, deviceInfo]);

  // Utilidades para componentes móviles
  const getMobileStyles = useCallback((component) => {
    const baseStyles = {
      mobile: {
        fontSize: 'sm',
        padding: 3,
        spacing: 2,
        borderRadius: 'md'
      },
      tablet: {
        fontSize: 'md',
        padding: 4,
        spacing: 3,
        borderRadius: 'lg'
      },
      desktop: {
        fontSize: 'md',
        padding: 5,
        spacing: 4,
        borderRadius: 'lg'
      }
    };

    if (deviceInfo.isMobile) return baseStyles.mobile;
    if (deviceInfo.isTablet) return baseStyles.tablet;
    return baseStyles.desktop;
  }, [deviceInfo]);

  // Detectar si el usuario está usando un dispositivo táctil
  const isTouchDevice = useMemo(() => {
    return deviceInfo.touchSupport;
  }, [deviceInfo.touchSupport]);

  // Configuración de botones para dispositivos táctiles
  const getTouchButtonProps = useCallback(() => {
    if (!isTouchDevice) return {};

    return {
      minH: '44px', // Tamaño mínimo recomendado para touch
      minW: '44px',
      _active: {
        transform: 'scale(0.95)',
        transition: 'transform 0.1s'
      }
    };
  }, [isTouchDevice]);

  // Utilidades para formularios móviles
  const getMobileFormProps = useCallback(() => {
    return {
      size: deviceInfo.isMobile ? 'lg' : 'md',
      spacing: deviceInfo.isMobile ? 4 : 3,
      autoComplete: 'on',
      inputMode: 'text' // Puede ser específico según el tipo de input
    };
  }, [deviceInfo.isMobile]);

  // Configuración de modal para móvil
  const getMobileModalProps = useCallback(() => {
    return {
      size: deviceInfo.isMobile ? 'full' : 'xl',
      scrollBehavior: deviceInfo.isMobile ? 'inside' : 'outside',
      motionPreset: deviceInfo.isMobile ? 'slideInBottom' : 'scale'
    };
  }, [deviceInfo.isMobile]);

  return {
    // Estados del dispositivo
    deviceInfo,
    isMobile: deviceInfo.isMobile,
    isTablet: deviceInfo.isTablet,
    isDesktop: deviceInfo.isDesktop,
    isTouchDevice,
    orientation: deviceInfo.orientation,

    // Estados de gestos
    gestureState,
    pullToRefreshState,

    // Funciones de gestos
    setupGestureListeners,
    triggerRefresh,

    // Optimizaciones de rendimiento
    getOptimalItemsPerPage,
    getVirtualScrollConfig,

    // Utilidades de estilo
    getMobileStyles,
    getTouchButtonProps,
    getMobileFormProps,
    getMobileModalProps,

    // Configuraciones
    enableSwipeGestures,
    enablePullToRefresh,
    enableVirtualScrolling,
    adaptiveLoading,
    touchOptimization,

    // Breakpoints de Chakra UI
    chakraBreakpoints: {
      isMobile,
      isTablet,
      isDesktop
    }
  };
};

export default useMobileOptimization;
