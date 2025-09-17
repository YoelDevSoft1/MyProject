// ========================================
// HOOK PARA PAGOS
// ========================================

import { useEffect, useCallback } from 'react';
import { useApiState } from './useApiState';
import { paymentService } from '../services/paymentService';
import { useAuth } from './useAuth';
import { useRolePermissions } from './useRolePermissions';
import type { 
  Payment, 
  PaginationInfo 
} from '../types/models';

// ===== TIPOS =====
interface PaymentsData {
  payments: Payment[];
  pagination: PaginationInfo;
}

// ===== HOOK PRINCIPAL =====
export function usePayments(
  filters?: {
    patient_id?: string;
    appointment_id?: string;
    status?: string;
    method?: string;
    date_from?: string;
    date_to?: string;
  },
  page: number = 1,
  limit: number = 10,
  sort?: { field: string; direction: 'asc' | 'desc' }
) {
  const { user } = useAuth();
  const { isPatient, isDoctor, isNurse, isAdmin } = useRolePermissions();
  
  const {
    state: paymentsState,
    handleApiCall,
    reset
  } = useApiState<PaymentsData>({ payments: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false } });

  // Cargar pagos
  const loadPayments = useCallback(async () => {
    if (!user) return;

    // Aplicar filtros según el rol
    const roleFilters = { ...filters };
    
    if (isPatient) {
      roleFilters.patient_id = user.id;
    } else if (isDoctor) {
      // Doctores pueden ver pagos de sus pacientes
      roleFilters.patient_id = user.id;
    } else if (isNurse) {
      // Enfermeras pueden ver pagos asignados
      roleFilters.patient_id = user.id;
    }
    // Admin puede ver todos los pagos

    return paymentService.getPayments(roleFilters, page, limit, sort);
  }, [user, isPatient, isDoctor, isNurse, isAdmin, filters, page, limit, sort]);

  useEffect(() => {
    if (user) {
      handleApiCall(loadPayments);
    }
  }, [user, filters, page, limit, sort, loadPayments, handleApiCall]);

  // Crear pago
  const createPayment = useCallback(async (paymentData: Partial<Payment>) => {
    try {
      const response = await paymentService.createPayment(paymentData);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadPayments);
        return response.data;
      }
      throw new Error(response.message || 'Error al crear pago');
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }, [loadPayments, handleApiCall]);

  // Actualizar pago
  const updatePayment = useCallback(async (id: string, paymentData: Partial<Payment>) => {
    try {
      const response = await paymentService.updatePayment(id, paymentData);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadPayments);
        return response.data;
      }
      throw new Error(response.message || 'Error al actualizar pago');
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }, [loadPayments, handleApiCall]);

  // Eliminar pago
  const deletePayment = useCallback(async (id: string) => {
    try {
      const response = await paymentService.deletePayment(id);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadPayments);
        return true;
      }
      throw new Error(response.message || 'Error al eliminar pago');
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }, [loadPayments, handleApiCall]);

  // Procesar pago
  const processPayment = useCallback(async (paymentId: string, paymentMethod: string, paymentData: any) => {
    try {
      const response = await paymentService.processPayment(paymentId, paymentMethod, paymentData);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadPayments);
        return response.data;
      }
      throw new Error(response.message || 'Error al procesar pago');
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }, [loadPayments, handleApiCall]);

  // Confirmar pago
  const confirmPayment = useCallback(async (paymentId: string, transactionId: string) => {
    try {
      const response = await paymentService.confirmPayment(paymentId, transactionId);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadPayments);
        return response.data;
      }
      throw new Error(response.message || 'Error al confirmar pago');
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }, [loadPayments, handleApiCall]);

  // Cancelar pago
  const cancelPayment = useCallback(async (paymentId: string, reason: string) => {
    try {
      const response = await paymentService.cancelPayment(paymentId, reason);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadPayments);
        return response.data;
      }
      throw new Error(response.message || 'Error al cancelar pago');
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw error;
    }
  }, [loadPayments, handleApiCall]);

  // Reembolsar pago
  const refundPayment = useCallback(async (paymentId: string, amount?: number, reason?: string) => {
    try {
      const response = await paymentService.refundPayment(paymentId, amount, reason);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadPayments);
        return response.data;
      }
      throw new Error(response.message || 'Error al reembolsar pago');
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }, [loadPayments, handleApiCall]);

  return {
    ...paymentsState,
    createPayment,
    updatePayment,
    deletePayment,
    processPayment,
    confirmPayment,
    cancelPayment,
    refundPayment,
    refresh: () => handleApiCall(loadPayments),
    reset
  };
}

// ===== HOOK PARA PAGO ESPECÍFICO =====
export function usePayment(id: string) {
  const {
    state: paymentState,
    handleApiCall,
    reset
  } = useApiState<Payment | null>(null);

  const loadPayment = useCallback(async () => {
    if (!id) return;
    return paymentService.getPaymentById(id);
  }, [id]);

  useEffect(() => {
    if (id) {
      handleApiCall(loadPayment);
    }
  }, [id, loadPayment, handleApiCall]);

  return {
    ...paymentState,
    refresh: () => handleApiCall(loadPayment),
    reset
  };
}

// ===== HOOK PARA PAGOS PENDIENTES =====
export function usePendingPayments() {
  const {
    state: pendingPaymentsState,
    handleApiCall,
    reset
  } = useApiState<Payment[]>([]);

  const loadPendingPayments = useCallback(async () => {
    return paymentService.getPendingPayments();
  }, []);

  useEffect(() => {
    handleApiCall(loadPendingPayments);
  }, [loadPendingPayments, handleApiCall]);

  return {
    ...pendingPaymentsState,
    refresh: () => handleApiCall(loadPendingPayments),
    reset
  };
}

// ===== HOOK PARA PAGOS COMPLETADOS =====
export function useCompletedPayments(page: number = 1, limit: number = 10) {
  const {
    state: completedPaymentsState,
    handleApiCall,
    reset
  } = useApiState<PaymentsData>({ payments: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false } });

  const loadCompletedPayments = useCallback(async () => {
    return paymentService.getCompletedPayments(page, limit);
  }, [page, limit]);

  useEffect(() => {
    handleApiCall(loadCompletedPayments);
  }, [loadCompletedPayments, handleApiCall]);

  return {
    ...completedPaymentsState,
    refresh: () => handleApiCall(loadCompletedPayments),
    reset
  };
}

// ===== HOOK PARA ESTADÍSTICAS DE PAGOS =====
export function usePaymentStats(period: 'today' | 'week' | 'month' | 'year' = 'month') {
  const {
    state: statsState,
    handleApiCall,
    reset
  } = useApiState<any>(null);

  const loadStats = useCallback(async () => {
    return paymentService.getPaymentStats(period);
  }, [period]);

  useEffect(() => {
    handleApiCall(loadStats);
  }, [loadStats, handleApiCall]);

  return {
    ...statsState,
    refresh: () => handleApiCall(loadStats),
    reset
  };
}

// ===== HOOK PARA INGRESOS =====
export function useRevenue(period: 'today' | 'week' | 'month' | 'year' = 'month') {
  const {
    state: revenueState,
    handleApiCall,
    reset
  } = useApiState<any>(null);

  const loadRevenue = useCallback(async () => {
    return paymentService.getRevenue(period);
  }, [period]);

  useEffect(() => {
    handleApiCall(loadRevenue);
  }, [loadRevenue, handleApiCall]);

  return {
    ...revenueState,
    refresh: () => handleApiCall(loadRevenue),
    reset
  };
}

// ===== HOOK PARA PAGOS FALLIDOS =====
export function useFailedPayments() {
  const {
    state: failedPaymentsState,
    handleApiCall,
    reset
  } = useApiState<Payment[]>([]);

  const loadFailedPayments = useCallback(async () => {
    return paymentService.getFailedPayments();
  }, []);

  const retryFailedPayment = useCallback(async (paymentId: string) => {
    try {
      const response = await paymentService.retryFailedPayment(paymentId);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadFailedPayments);
        return response.data;
      }
      throw new Error(response.message || 'Error al reintentar pago');
    } catch (error) {
      console.error('Error retrying payment:', error);
      throw error;
    }
  }, [loadFailedPayments, handleApiCall]);

  useEffect(() => {
    handleApiCall(loadFailedPayments);
  }, [loadFailedPayments, handleApiCall]);

  return {
    ...failedPaymentsState,
    retryFailedPayment,
    refresh: () => handleApiCall(loadFailedPayments),
    reset
  };
}

// ===== HOOK PARA COMPROBANTES =====
export function useReceipts() {
  const generateReceipt = useCallback(async (paymentId: string) => {
    try {
      const response = await paymentService.generateReceipt(paymentId);
      if (response.success) {
        // Abrir URL del comprobante
        window.open(response.data.receipt_url, '_blank');
        return response.data;
      }
      throw new Error(response.message || 'Error al generar comprobante');
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw error;
    }
  }, []);

  const emailReceipt = useCallback(async (paymentId: string, email: string) => {
    try {
      const response = await paymentService.emailReceipt(paymentId, email);
      if (response.success) {
        return true;
      }
      throw new Error(response.message || 'Error al enviar comprobante por email');
    } catch (error) {
      console.error('Error emailing receipt:', error);
      throw error;
    }
  }, []);

  return {
    generateReceipt,
    emailReceipt
  };
}
