// ========================================
// HOOK PARA CITAS MÉDICAS
// ========================================

import { useEffect, useCallback, useState } from 'react';
import { useApiState } from './useApiState';
import { appointmentService } from '../services/appointmentService';
import { useAuth } from './useAuth';
import { useRolePermissions } from './useRolePermissions';
import type { 
  Appointment, 
  AppointmentFilters, 
  PaginationInfo,
  AppointmentStatus 
} from '../types/models';

// ===== TIPOS =====
interface AppointmentsData {
  appointments: Appointment[];
  pagination: PaginationInfo;
}

// ===== HOOK PRINCIPAL =====
export function useAppointments(
  filters?: AppointmentFilters,
  page: number = 1,
  limit: number = 10,
  sort?: { field: string; direction: 'asc' | 'desc' }
) {
  const { user } = useAuth();
  const { isPatient, isDoctor, isNurse, isAdmin } = useRolePermissions();
  
  const {
    state: appointmentsState,
    handleApiCall,
    reset
  } = useApiState<AppointmentsData>({ appointments: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false } });

  // Cargar citas
  const loadAppointments = useCallback(async () => {
    if (!user) return;

    // Aplicar filtros según el rol
    const roleFilters = { ...filters };
    
    if (isPatient) {
      roleFilters.patient_id = user.id;
    } else if (isDoctor) {
      roleFilters.doctor_id = user.id;
    } else if (isNurse) {
      roleFilters.nurse_id = user.id;
    }
    // Admin puede ver todas las citas

    return appointmentService.getAppointments(roleFilters, page, limit, sort);
  }, [user, isPatient, isDoctor, isNurse, isAdmin, filters, page, limit, sort]);

  useEffect(() => {
    if (user) {
      handleApiCall(loadAppointments);
    }
  }, [user, filters, page, limit, sort, loadAppointments, handleApiCall]);

  // Crear cita
  const createAppointment = useCallback(async (appointmentData: Partial<Appointment>) => {
    try {
      const response = await appointmentService.createAppointment(appointmentData);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadAppointments);
        return response.data;
      }
      throw new Error(response.message || 'Error al crear cita');
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }, [loadAppointments, handleApiCall]);

  // Actualizar cita
  const updateAppointment = useCallback(async (id: string, appointmentData: Partial<Appointment>) => {
    try {
      const response = await appointmentService.updateAppointment(id, appointmentData);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadAppointments);
        return response.data;
      }
      throw new Error(response.message || 'Error al actualizar cita');
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }, [loadAppointments, handleApiCall]);

  // Eliminar cita
  const deleteAppointment = useCallback(async (id: string) => {
    try {
      const response = await appointmentService.deleteAppointment(id);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadAppointments);
        return true;
      }
      throw new Error(response.message || 'Error al eliminar cita');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }, [loadAppointments, handleApiCall]);

  // Cancelar cita
  const cancelAppointment = useCallback(async (id: string, reason?: string) => {
    try {
      const response = await appointmentService.cancelAppointment(id, reason);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadAppointments);
        return response.data;
      }
      throw new Error(response.message || 'Error al cancelar cita');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }, [loadAppointments, handleApiCall]);

  // Confirmar cita
  const confirmAppointment = useCallback(async (id: string) => {
    try {
      const response = await appointmentService.confirmAppointment(id);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadAppointments);
        return response.data;
      }
      throw new Error(response.message || 'Error al confirmar cita');
    } catch (error) {
      console.error('Error confirming appointment:', error);
      throw error;
    }
  }, [loadAppointments, handleApiCall]);

  // Completar cita
  const completeAppointment = useCallback(async (id: string, notes?: string) => {
    try {
      const response = await appointmentService.completeAppointment(id, notes);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadAppointments);
        return response.data;
      }
      throw new Error(response.message || 'Error al completar cita');
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  }, [loadAppointments, handleApiCall]);

  // Reagendar cita
  const rescheduleAppointment = useCallback(async (id: string, newDate: string, newTime: string) => {
    try {
      const response = await appointmentService.rescheduleAppointment(id, newDate, newTime);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadAppointments);
        return response.data;
      }
      throw new Error(response.message || 'Error al reagendar cita');
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }, [loadAppointments, handleApiCall]);

  return {
    ...appointmentsState,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    confirmAppointment,
    completeAppointment,
    rescheduleAppointment,
    refresh: () => handleApiCall(loadAppointments),
    reset
  };
}

// ===== HOOK PARA CITAS DE HOY =====
export function useTodayAppointments() {
  const {
    state: todayAppointmentsState,
    handleApiCall,
    reset
  } = useApiState<Appointment[]>([]);

  const loadTodayAppointments = useCallback(async () => {
    return appointmentService.getTodayAppointments();
  }, []);

  useEffect(() => {
    handleApiCall(loadTodayAppointments);
  }, [loadTodayAppointments, handleApiCall]);

  return {
    ...todayAppointmentsState,
    refresh: () => handleApiCall(loadTodayAppointments),
    reset
  };
}

// ===== HOOK PARA CITAS PRÓXIMAS =====
export function useUpcomingAppointments(limit: number = 5) {
  const {
    state: upcomingAppointmentsState,
    handleApiCall,
    reset
  } = useApiState<Appointment[]>([]);

  const loadUpcomingAppointments = useCallback(async () => {
    return appointmentService.getUpcomingAppointments(limit);
  }, [limit]);

  useEffect(() => {
    handleApiCall(loadUpcomingAppointments);
  }, [loadUpcomingAppointments, handleApiCall]);

  return {
    ...upcomingAppointmentsState,
    refresh: () => handleApiCall(loadUpcomingAppointments),
    reset
  };
}

// ===== HOOK PARA ESTADÍSTICAS DE CITAS =====
export function useAppointmentStats(period: 'today' | 'week' | 'month' | 'year' = 'month') {
  const {
    state: statsState,
    handleApiCall,
    reset
  } = useApiState<any>(null);

  const loadStats = useCallback(async () => {
    return appointmentService.getAppointmentStats(period);
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

// ===== HOOK PARA DISPONIBILIDAD =====
export function useAvailability(doctorId: string, date: string) {
  const {
    state: availabilityState,
    handleApiCall,
    reset
  } = useApiState<any>(null);

  const loadAvailability = useCallback(async () => {
    if (!doctorId || !date) return;
    return appointmentService.getAvailability(doctorId, date);
  }, [doctorId, date]);

  useEffect(() => {
    if (doctorId && date) {
      handleApiCall(loadAvailability);
    }
  }, [doctorId, date, loadAvailability, handleApiCall]);

  return {
    ...availabilityState,
    refresh: () => handleApiCall(loadAvailability),
    reset
  };
}
