// ========================================
// HOOK PARA PRESCRIPCIONES
// ========================================

import { useEffect, useCallback } from 'react';
import { useApiState } from './useApiState';
import { prescriptionService } from '../services/prescriptionService';
import { useAuth } from './useAuth';
import { useRolePermissions } from './useRolePermissions';
import type { 
  Prescription, 
  PaginationInfo 
} from '../types/models';

// ===== TIPOS =====
interface PrescriptionsData {
  prescriptions: Prescription[];
  pagination: PaginationInfo;
}

// ===== HOOK PRINCIPAL =====
export function usePrescriptions(
  filters?: {
    patient_id?: string;
    doctor_id?: string;
    status?: string;
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
    state: prescriptionsState,
    handleApiCall,
    reset
  } = useApiState<PrescriptionsData>({ prescriptions: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false } });

  // Cargar prescripciones
  const loadPrescriptions = useCallback(async () => {
    if (!user) return;

    // Aplicar filtros según el rol
    const roleFilters = { ...filters };
    
    if (isPatient) {
      roleFilters.patient_id = user.id;
    } else if (isDoctor) {
      roleFilters.doctor_id = user.id;
    } else if (isNurse) {
      // Enfermeras pueden ver prescripciones asignadas
      roleFilters.doctor_id = user.id;
    }
    // Admin puede ver todas las prescripciones

    return prescriptionService.getPrescriptions(roleFilters, page, limit, sort);
  }, [user, isPatient, isDoctor, isNurse, isAdmin, filters, page, limit, sort]);

  useEffect(() => {
    if (user) {
      handleApiCall(loadPrescriptions);
    }
  }, [user, filters, page, limit, sort, loadPrescriptions, handleApiCall]);

  // Crear prescripción
  const createPrescription = useCallback(async (prescriptionData: Partial<Prescription>) => {
    try {
      const response = await prescriptionService.createPrescription(prescriptionData);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadPrescriptions);
        return response.data;
      }
      throw new Error(response.message || 'Error al crear prescripción');
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  }, [loadPrescriptions, handleApiCall]);

  // Actualizar prescripción
  const updatePrescription = useCallback(async (id: string, prescriptionData: Partial<Prescription>) => {
    try {
      const response = await prescriptionService.updatePrescription(id, prescriptionData);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadPrescriptions);
        return response.data;
      }
      throw new Error(response.message || 'Error al actualizar prescripción');
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  }, [loadPrescriptions, handleApiCall]);

  // Eliminar prescripción
  const deletePrescription = useCallback(async (id: string) => {
    try {
      const response = await prescriptionService.deletePrescription(id);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadPrescriptions);
        return true;
      }
      throw new Error(response.message || 'Error al eliminar prescripción');
    } catch (error) {
      console.error('Error deleting prescription:', error);
      throw error;
    }
  }, [loadPrescriptions, handleApiCall]);

  // Cancelar prescripción
  const cancelPrescription = useCallback(async (id: string, reason: string) => {
    try {
      const response = await prescriptionService.cancelPrescription(id, reason);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadPrescriptions);
        return response.data;
      }
      throw new Error(response.message || 'Error al cancelar prescripción');
    } catch (error) {
      console.error('Error cancelling prescription:', error);
      throw error;
    }
  }, [loadPrescriptions, handleApiCall]);

  // Renovar prescripción
  const renewPrescription = useCallback(async (id: string, newValidUntil: string) => {
    try {
      const response = await prescriptionService.renewPrescription(id, newValidUntil);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadPrescriptions);
        return response.data;
      }
      throw new Error(response.message || 'Error al renovar prescripción');
    } catch (error) {
      console.error('Error renewing prescription:', error);
      throw error;
    }
  }, [loadPrescriptions, handleApiCall]);

  return {
    ...prescriptionsState,
    createPrescription,
    updatePrescription,
    deletePrescription,
    cancelPrescription,
    renewPrescription,
    refresh: () => handleApiCall(loadPrescriptions),
    reset
  };
}

// ===== HOOK PARA PRESCRIPCIÓN ESPECÍFICA =====
export function usePrescription(id: string) {
  const {
    state: prescriptionState,
    handleApiCall,
    reset
  } = useApiState<Prescription | null>(null);

  const loadPrescription = useCallback(async () => {
    if (!id) return;
    return prescriptionService.getPrescriptionById(id);
  }, [id]);

  useEffect(() => {
    if (id) {
      handleApiCall(loadPrescription);
    }
  }, [id, loadPrescription, handleApiCall]);

  return {
    ...prescriptionState,
    refresh: () => handleApiCall(loadPrescription),
    reset
  };
}

// ===== HOOK PARA PRESCRIPCIONES ACTIVAS =====
export function useActivePrescriptions(patientId: string) {
  const {
    state: activePrescriptionsState,
    handleApiCall,
    reset
  } = useApiState<Prescription[]>([]);

  const loadActivePrescriptions = useCallback(async () => {
    if (!patientId) return;
    return prescriptionService.getActivePrescriptions(patientId);
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      handleApiCall(loadActivePrescriptions);
    }
  }, [patientId, loadActivePrescriptions, handleApiCall]);

  return {
    ...activePrescriptionsState,
    refresh: () => handleApiCall(loadActivePrescriptions),
    reset
  };
}

// ===== HOOK PARA PRESCRIPCIONES EXPIRADAS =====
export function useExpiredPrescriptions() {
  const {
    state: expiredPrescriptionsState,
    handleApiCall,
    reset
  } = useApiState<Prescription[]>([]);

  const loadExpiredPrescriptions = useCallback(async () => {
    return prescriptionService.getExpiredPrescriptions();
  }, []);

  useEffect(() => {
    handleApiCall(loadExpiredPrescriptions);
  }, [loadExpiredPrescriptions, handleApiCall]);

  return {
    ...expiredPrescriptionsState,
    refresh: () => handleApiCall(loadExpiredPrescriptions),
    reset
  };
}

// ===== HOOK PARA PRESCRIPCIONES PRÓXIMAS A EXPIRAR =====
export function useExpiringPrescriptions(days: number = 7) {
  const {
    state: expiringPrescriptionsState,
    handleApiCall,
    reset
  } = useApiState<Prescription[]>([]);

  const loadExpiringPrescriptions = useCallback(async () => {
    return prescriptionService.getExpiringPrescriptions(days);
  }, [days]);

  useEffect(() => {
    handleApiCall(loadExpiringPrescriptions);
  }, [loadExpiringPrescriptions, handleApiCall]);

  return {
    ...expiringPrescriptionsState,
    refresh: () => handleApiCall(loadExpiringPrescriptions),
    reset
  };
}

// ===== HOOK PARA ESTADÍSTICAS DE PRESCRIPCIONES =====
export function usePrescriptionStats(period: 'today' | 'week' | 'month' | 'year' = 'month') {
  const {
    state: statsState,
    handleApiCall,
    reset
  } = useApiState<any>(null);

  const loadStats = useCallback(async () => {
    return prescriptionService.getPrescriptionStats(period);
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

// ===== HOOK PARA IMPRIMIR PRESCRIPCIÓN =====
export function usePrintPrescription() {
  const printPrescription = useCallback(async (prescriptionId: string) => {
    try {
      const response = await prescriptionService.printPrescription(prescriptionId);
      if (response.success) {
        // Abrir URL de impresión
        window.open(response.data.print_url, '_blank');
        return response.data;
      }
      throw new Error(response.message || 'Error al imprimir prescripción');
    } catch (error) {
      console.error('Error printing prescription:', error);
      throw error;
    }
  }, []);

  const emailPrescription = useCallback(async (prescriptionId: string, email: string) => {
    try {
      const response = await prescriptionService.emailPrescription(prescriptionId, email);
      if (response.success) {
        return true;
      }
      throw new Error(response.message || 'Error al enviar prescripción por email');
    } catch (error) {
      console.error('Error emailing prescription:', error);
      throw error;
    }
  }, []);

  return {
    printPrescription,
    emailPrescription
  };
}
