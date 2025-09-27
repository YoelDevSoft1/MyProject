// SMD VITAL - useAccessibility Hook
// Hook para mejorar la accesibilidad en toda la aplicación

import { useEffect, useCallback, useState } from 'react';
import { useToast } from '@chakra-ui/react';

/**
 * Hook personalizado para funcionalidades de accesibilidad
 * 
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Utilidades y estados de accesibilidad
 */
export const useAccessibility = (options = {}) => {
  const {
    enableKeyboardNavigation = true,
    enableScreenReader = true,
    enableHighContrast = false,
    enableReducedMotion = false,
    announceChanges = true
  } = options;

  const toast = useToast();
  const [isHighContrast, setIsHighContrast] = useState(enableHighContrast);
  const [isReducedMotion, setIsReducedMotion] = useState(enableReducedMotion);
  const [focusedElement, setFocusedElement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  // Detectar preferencias del sistema
  useEffect(() => {
    if (window.matchMedia) {
      // Detectar preferencia de contraste alto
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      setIsHighContrast(highContrastQuery.matches);
      
      const handleHighContrastChange = (e) => setIsHighContrast(e.matches);
      highContrastQuery.addEventListener('change', handleHighContrastChange);

      // Detectar preferencia de movimiento reducido
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(reducedMotionQuery.matches);
      
      const handleReducedMotionChange = (e) => setIsReducedMotion(e.matches);
      reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

      return () => {
        highContrastQuery.removeEventListener('change', handleHighContrastChange);
        reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      };
    }
  }, []);

  // Anunciar cambios para lectores de pantalla
  const announceToScreenReader = useCallback((message, priority = 'polite') => {
    if (!enableScreenReader || !announceChanges) return;

    // Crear elemento ARIA live region si no existe
    let liveRegion = document.getElementById(`aria-live-${priority}`);
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = `aria-live-${priority}`;
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    // Anunciar el mensaje
    liveRegion.textContent = message;
    
    // Agregar a la lista de anuncios
    setAnnouncements(prev => [
      ...prev.slice(-9), // Mantener solo los últimos 10
      {
        id: Date.now(),
        message,
        priority,
        timestamp: new Date()
      }
    ]);

    // Limpiar después de un tiempo
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }, [enableScreenReader, announceChanges]);

  // Navegación por teclado mejorada
  const handleKeyboardNavigation = useCallback((event) => {
    if (!enableKeyboardNavigation) return;

    const { key, ctrlKey, altKey, shiftKey } = event;
    
    // Atajos de teclado globales
    if (ctrlKey) {
      switch (key) {
        case '/':
          event.preventDefault();
          // Enfocar en el campo de búsqueda
          const searchInput = document.querySelector('[data-search-input]');
          if (searchInput) {
            searchInput.focus();
            announceToScreenReader('Campo de búsqueda enfocado');
          }
          break;
          
        case 'k':
          event.preventDefault();
          // Abrir modal de comandos rápidos
          announceToScreenReader('Comandos rápidos activados');
          break;
          
        case 'h':
          event.preventDefault();
          // Mostrar ayuda de accesibilidad
          showAccessibilityHelp();
          break;
      }
    }

    // Navegación con flechas en listas/tablas
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      const focusableElements = document.querySelectorAll(
        '[tabindex]:not([tabindex="-1"]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"]'
      );
      
      const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
      
      if (currentIndex !== -1) {
        let nextIndex;
        
        switch (key) {
          case 'ArrowDown':
            nextIndex = (currentIndex + 1) % focusableElements.length;
            break;
          case 'ArrowUp':
            nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
            break;
          case 'ArrowRight':
            // En contexto de tabla, moverse a la siguiente celda
            nextIndex = (currentIndex + 1) % focusableElements.length;
            break;
          case 'ArrowLeft':
            // En contexto de tabla, moverse a la celda anterior
            nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
            break;
        }
        
        if (nextIndex !== undefined && focusableElements[nextIndex]) {
          event.preventDefault();
          focusableElements[nextIndex].focus();
        }
      }
    }

    // Escape para cerrar modals/dropdowns
    if (key === 'Escape') {
      const openModal = document.querySelector('[data-modal-open="true"]');
      const openDropdown = document.querySelector('[data-dropdown-open="true"]');
      
      if (openModal) {
        const closeButton = openModal.querySelector('[data-modal-close]');
        if (closeButton) {
          closeButton.click();
          announceToScreenReader('Modal cerrado');
        }
      } else if (openDropdown) {
        const dropdownButton = document.querySelector('[data-dropdown-button]');
        if (dropdownButton) {
          dropdownButton.focus();
          announceToScreenReader('Menú cerrado');
        }
      }
    }
  }, [enableKeyboardNavigation, announceToScreenReader]);

  // Mostrar ayuda de accesibilidad
  const showAccessibilityHelp = useCallback(() => {
    const helpMessage = `
Atajos de teclado disponibles:
- Ctrl + / : Enfocar búsqueda
- Ctrl + K : Comandos rápidos  
- Ctrl + H : Esta ayuda
- Escape : Cerrar modals
- Flechas : Navegar elementos
- Tab : Siguiente elemento
- Shift + Tab : Elemento anterior
- Enter/Espacio : Activar elemento
    `.trim();

    toast({
      title: "Ayuda de Accesibilidad",
      description: helpMessage,
      status: "info",
      duration: 10000,
      isClosable: true,
      position: "top"
    });

    announceToScreenReader('Ayuda de accesibilidad mostrada');
  }, [toast, announceToScreenReader]);

  // Configurar event listeners
  useEffect(() => {
    if (enableKeyboardNavigation) {
      document.addEventListener('keydown', handleKeyboardNavigation);
      return () => document.removeEventListener('keydown', handleKeyboardNavigation);
    }
  }, [enableKeyboardNavigation, handleKeyboardNavigation]);

  // Rastrear elemento enfocado
  useEffect(() => {
    const handleFocus = (event) => {
      setFocusedElement(event.target);
    };

    const handleBlur = () => {
      setFocusedElement(null);
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  // Utilidades para componentes
  const getAriaProps = useCallback((type, options = {}) => {
    const baseProps = {
      role: options.role,
      'aria-label': options.label,
      'aria-labelledby': options.labelledBy,
      'aria-describedby': options.describedBy,
      'aria-expanded': options.expanded,
      'aria-selected': options.selected,
      'aria-checked': options.checked,
      'aria-disabled': options.disabled,
      'aria-required': options.required,
      'aria-invalid': options.invalid,
      'aria-live': options.live || 'off',
      'aria-atomic': options.atomic
    };

    // Filtrar propiedades undefined
    return Object.fromEntries(
      Object.entries(baseProps).filter(([, value]) => value !== undefined)
    );
  }, []);

  // Generar ID único para elementos
  const generateId = useCallback((prefix = 'element') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Validar contraste de colores
  const checkColorContrast = useCallback((foreground, background) => {
    // Función simplificada para validar contraste
    // En una implementación real, usarías una librería como 'color-contrast'
    const getLuminance = (color) => {
      // Conversión RGB a luminancia (simplificada)
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(x => {
        x = parseInt(x) / 255;
        return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return {
      ratio: contrast,
      isAACompliant: contrast >= 4.5,
      isAAACompliant: contrast >= 7
    };
  }, []);

  // Funciones de utilidad para focus management
  const trapFocus = useCallback((containerElement) => {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    containerElement.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      containerElement.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  const restoreFocus = useCallback((previousElement) => {
    if (previousElement && typeof previousElement.focus === 'function') {
      previousElement.focus();
    }
  }, []);

  return {
    // Estados
    isHighContrast,
    isReducedMotion,
    focusedElement,
    announcements,
    
    // Funciones principales
    announceToScreenReader,
    showAccessibilityHelp,
    
    // Utilidades para componentes
    getAriaProps,
    generateId,
    checkColorContrast,
    
    // Focus management
    trapFocus,
    restoreFocus,
    
    // Configuraciones
    setIsHighContrast,
    setIsReducedMotion,
    
    // Constantes útiles
    KEYBOARD_KEYS: {
      ENTER: 'Enter',
      SPACE: ' ',
      ESCAPE: 'Escape',
      TAB: 'Tab',
      ARROW_UP: 'ArrowUp',
      ARROW_DOWN: 'ArrowDown',
      ARROW_LEFT: 'ArrowLeft',
      ARROW_RIGHT: 'ArrowRight',
      HOME: 'Home',
      END: 'End'
    },
    
    // Roles ARIA comunes
    ARIA_ROLES: {
      BUTTON: 'button',
      LINK: 'link',
      MENUITEM: 'menuitem',
      TAB: 'tab',
      TABPANEL: 'tabpanel',
      DIALOG: 'dialog',
      ALERT: 'alert',
      STATUS: 'status',
      REGION: 'region',
      BANNER: 'banner',
      NAVIGATION: 'navigation',
      MAIN: 'main',
      COMPLEMENTARY: 'complementary',
      CONTENTINFO: 'contentinfo'
    }
  };
};

export default useAccessibility;
