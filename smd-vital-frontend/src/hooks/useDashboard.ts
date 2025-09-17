// ========================================
// HOOK PARA DATOS DEL DASHBOARD
// ========================================

import { useEffect, useCallback } from 'react';
import { useApiState } from './useApiState';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from './useAuth';
import { useRolePermissions } from './useRolePermissions';
import type { DashboardStats, UserRole } from '../types/models';

// ===== TIPOS =====
interface DashboardData {
  stats: DashboardStats;
  charts: any;
  notifications: any[];
  systemAlerts: any[];
  recentActivity: any[];
}

// ===== HOOK PRINCIPAL =====
export function useDashboard(period: 'today' | 'week' | 'month' | 'year' = 'month') {
  const { user } = useAuth();
  const { isPatient, isDoctor, isNurse, isAdmin } = useRolePermissions();
  
  const {
    state: dashboardState,
    handleApiCall,
    reset
  } = useApiState<DashboardData>(null, {
    onError: (error) => console.error('Error loading dashboard:', error)
  });

  // Cargar datos del dashboard
  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      // Cargar estadísticas según el rol
      let statsPromise;
      if (isPatient) {
        statsPromise = dashboardService.getPatientStats(user.id, period);
      } else if (isDoctor) {
        statsPromise = dashboardService.getDoctorStats(user.id, period);
      } else if (isNurse) {
        statsPromise = dashboardService.getNurseStats(user.id, period);
      } else if (isAdmin) {
        statsPromise = dashboardService.getAdminStats(period);
      } else {
        statsPromise = dashboardService.getGeneralStats(period);
      }

      // Cargar datos adicionales en paralelo
      const [statsResponse, chartsResponse, notificationsResponse, alertsResponse, summaryResponse] = await Promise.all([
        statsPromise,
        dashboardService.getChartsData(period),
        dashboardService.getNotifications(10),
        dashboardService.getSystemAlerts(),
        dashboardService.getQuickSummary()
      ]);

      const dashboardData: DashboardData = {
        stats: statsResponse.data,
        charts: chartsResponse.data,
        notifications: notificationsResponse.data,
        systemAlerts: alertsResponse.data,
        recentActivity: summaryResponse.data.recent_activity || []
      };

      return dashboardData;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      throw error;
    }
  }, [user, isPatient, isDoctor, isNurse, isAdmin, period]);

  // Cargar datos al montar o cambiar período
  useEffect(() => {
    if (user) {
      handleApiCall(loadDashboardData);
    }
  }, [user, period, loadDashboardData, handleApiCall]);

  // Refrescar datos
  const refresh = useCallback(() => {
    if (user) {
      handleApiCall(loadDashboardData);
    }
  }, [user, loadDashboardData, handleApiCall]);

  // Marcar notificación como leída
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await dashboardService.markNotificationAsRead(notificationId);
      // Refrescar notificaciones
      refresh();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [refresh]);

  // Marcar todas las notificaciones como leídas
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await dashboardService.markAllNotificationsAsRead();
      // Refrescar notificaciones
      refresh();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [refresh]);

  return {
    ...dashboardState,
    refresh,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    reset
  };
}

// ===== HOOK PARA ESTADÍSTICAS ESPECÍFICAS =====
export function useDashboardStats(period: 'today' | 'week' | 'month' | 'year' = 'month') {
  const { user } = useAuth();
  const { isPatient, isDoctor, isNurse, isAdmin } = useRolePermissions();
  
  const {
    state: statsState,
    handleApiCall,
    reset
  } = useApiState<DashboardStats>(null);

  const loadStats = useCallback(async () => {
    if (!user) return;

    let statsPromise;
    if (isPatient) {
      statsPromise = dashboardService.getPatientStats(user.id, period);
    } else if (isDoctor) {
      statsPromise = dashboardService.getDoctorStats(user.id, period);
    } else if (isNurse) {
      statsPromise = dashboardService.getNurseStats(user.id, period);
    } else if (isAdmin) {
      statsPromise = dashboardService.getAdminStats(period);
    } else {
      statsPromise = dashboardService.getGeneralStats(period);
    }

    return statsPromise;
  }, [user, isPatient, isDoctor, isNurse, isAdmin, period]);

  useEffect(() => {
    if (user) {
      handleApiCall(loadStats);
    }
  }, [user, period, loadStats, handleApiCall]);

  return {
    ...statsState,
    refresh: () => handleApiCall(loadStats),
    reset
  };
}

// ===== HOOK PARA NOTIFICACIONES =====
export function useNotifications(limit: number = 10) {
  const {
    state: notificationsState,
    handleApiCall,
    reset
  } = useApiState<any[]>([]);

  const loadNotifications = useCallback(async () => {
    return dashboardService.getNotifications(limit);
  }, [limit]);

  useEffect(() => {
    handleApiCall(loadNotifications);
  }, [loadNotifications, handleApiCall]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await dashboardService.markNotificationAsRead(notificationId);
      // Refrescar notificaciones
      handleApiCall(loadNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [loadNotifications, handleApiCall]);

  const markAllAsRead = useCallback(async () => {
    try {
      await dashboardService.markAllNotificationsAsRead();
      // Refrescar notificaciones
      handleApiCall(loadNotifications);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [loadNotifications, handleApiCall]);

  return {
    ...notificationsState,
    markAsRead,
    markAllAsRead,
    refresh: () => handleApiCall(loadNotifications),
    reset
  };
}

// ===== HOOK PARA ALERTAS DEL SISTEMA =====
export function useSystemAlerts() {
  const {
    state: alertsState,
    handleApiCall,
    reset
  } = useApiState<any[]>([]);

  const loadAlerts = useCallback(async () => {
    return dashboardService.getSystemAlerts();
  }, []);

  useEffect(() => {
    handleApiCall(loadAlerts);
  }, [loadAlerts, handleApiCall]);

  return {
    ...alertsState,
    refresh: () => handleApiCall(loadAlerts),
    reset
  };
}
