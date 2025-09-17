// ========================================
// HOOK DE NOTIFICACIONES MEJORADO
// ========================================

import { useNotifications } from '../contexts/GlobalStateContext';

export function useNotification() {
  const { addNotification, removeNotification, clearAllNotifications, notifications } = useNotifications();

  const showSuccess = (title: string, message: string, duration: number = 5000) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration,
    });
  };

  const showError = (title: string, message: string, duration: number = 8000) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration,
    });
  };

  const showWarning = (title: string, message: string, duration: number = 6000) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration,
    });
  };

  const showInfo = (title: string, message: string, duration: number = 5000) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration,
    });
  };

  const showApiError = (error: any, operation: string = 'operación') => {
    const message = error?.message || error?.response?.data?.message || 'Error desconocido';
    showError(
      `Error en ${operation}`,
      message,
      8000
    );
  };

  const showApiSuccess = (operation: string = 'operación') => {
    showSuccess(
      `${operation} exitosa`,
      `La ${operation} se completó correctamente`,
      3000
    );
  };

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showApiError,
    showApiSuccess,
    removeNotification,
    clearAllNotifications,
  };
}
