// SMD VITAL - useRealtimeStats Hook
// Hook para métricas en tiempo real del dashboard de citas

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import robustApiService from '../services/robustApiService';
import useRequestThrottle from './useRequestThrottle';

/**
 * Hook para estadísticas en tiempo real de citas médicas
 * 
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estadísticas y funciones de control
 */
export const useRealtimeStats = (options = {}) => {
  const { token, isAuthenticated } = useAuth();
  const { throttledRequest, canMakeRequest } = useRequestThrottle(5000); // 5 segundos mínimo
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);
  
  const {
    enabled = true,
    refreshInterval = 30000,
    includeAlerts = true,
    includeTrends = true
  } = options;

  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    urgentAppointments: 0,
    completedToday: 0,
    pendingAppointments: 0,
    telemedicineCount: 0,
    averageWaitTime: 0,
    revenue: 0,
    lastUpdated: null,
    trends: {
      appointments: { value: 0, change: 0, direction: 'up' },
      revenue: { value: 0, change: 0, direction: 'up' },
      efficiency: { value: 0, change: 0, direction: 'up' },
      satisfaction: { value: 0, change: 0, direction: 'up' }
    }
  });

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(enabled);

  // Calcular métricas desde datos de citas
  const calculateMetrics = useCallback((appointments, payments = []) => {
    // Validar que appointments sea un array
    if (!Array.isArray(appointments)) {
      console.warn('calculateMetrics: appointments no es un array:', appointments);
      appointments = [];
    }
    
    // Validar que payments sea un array
    if (!Array.isArray(payments)) {
      console.warn('calculateMetrics: payments no es un array:', payments);
      payments = [];
    }
    
    const today = new Date().toDateString();
    
    const todayAppointments = appointments.filter(apt => 
      apt && apt.scheduled_date && new Date(apt.scheduled_date).toDateString() === today
    );
    
    const urgentAppointments = appointments.filter(apt => 
      apt && (apt.priority === 'URGENT' || apt.priority === 'HIGH')
    );
    
    const completedToday = appointments.filter(apt => 
      apt && apt.status === 'COMPLETED' && apt.scheduled_date &&
      new Date(apt.scheduled_date).toDateString() === today
    );
    
    const pendingAppointments = appointments.filter(apt => 
      apt && (apt.status === 'PENDING' || apt.status === 'CONFIRMED')
    );
    
    const telemedicineCount = appointments.filter(apt => 
      apt && apt.is_telemedicine === true
    ).length;
    
    const totalRevenue = payments.reduce((sum, payment) => 
      sum + (payment.amount || 0), 0
    );

    // Calcular tendencias (simulado por ahora)
    const trends = includeTrends ? {
      appointments: { 
        value: appointments.length, 
        change: Math.floor(Math.random() * 20) - 10, 
        direction: Math.random() > 0.5 ? 'up' : 'down' 
      },
      revenue: { 
        value: totalRevenue, 
        change: Math.floor(Math.random() * 15) - 5, 
        direction: Math.random() > 0.5 ? 'up' : 'down' 
      },
      efficiency: { 
        value: Math.floor(Math.random() * 40) + 60, 
        change: Math.floor(Math.random() * 10) - 5, 
        direction: Math.random() > 0.5 ? 'up' : 'down' 
      },
      satisfaction: { 
        value: Math.floor(Math.random() * 20) + 80, 
        change: Math.floor(Math.random() * 8) - 4, 
        direction: Math.random() > 0.5 ? 'up' : 'down' 
      }
    } : stats.trends;

    return {
      totalAppointments: appointments.length,
      todayAppointments: todayAppointments.length,
      urgentAppointments: urgentAppointments.length,
      completedToday: completedToday.length,
      pendingAppointments: pendingAppointments.length,
      telemedicineCount,
      averageWaitTime: Math.floor(Math.random() * 30) + 15, // Mock data
      revenue: totalRevenue,
      lastUpdated: new Date(),
      trends
    };
  }, [includeTrends, stats.trends]);

  // Generar alertas del sistema
  const generateAlerts = useCallback((metrics, appointments) => {
    if (!includeAlerts) return [];
    
    // Validar que appointments sea un array
    if (!Array.isArray(appointments)) {
      console.warn('generateAlerts: appointments no es un array:', appointments);
      appointments = [];
    }

    const newAlerts = [];
    
    if (metrics.urgentAppointments > 0) {
      newAlerts.push({
        id: 'urgent',
        type: 'warning',
        title: 'Citas Urgentes',
        message: `${metrics.urgentAppointments} citas urgentes pendientes`,
        icon: 'MdWarning',
        timestamp: new Date(),
        priority: 'high'
      });
    }
    
    if (metrics.todayAppointments > 10) {
      newAlerts.push({
        id: 'busy',
        type: 'info',
        title: 'Día Ocupado',
        message: `${metrics.todayAppointments} citas programadas para hoy`,
        icon: 'MdSchedule',
        timestamp: new Date(),
        priority: 'medium'
      });
    }

    if (metrics.pendingAppointments > 5) {
      newAlerts.push({
        id: 'pending',
        type: 'warning',
        title: 'Citas Pendientes',
        message: `${metrics.pendingAppointments} citas requieren confirmación`,
        icon: 'MdNotifications',
        timestamp: new Date(),
        priority: 'medium'
      });
    }

    // Alerta de eficiencia baja
    if (metrics.trends.efficiency.value < 70) {
      newAlerts.push({
        id: 'efficiency',
        type: 'error',
        title: 'Eficiencia Baja',
        message: `Eficiencia del sistema: ${metrics.trends.efficiency.value}%`,
        icon: 'MdSpeed',
        timestamp: new Date(),
        priority: 'high'
      });
    }

    return newAlerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [includeAlerts]);

  // Cargar estadísticas en tiempo real con throttling
  const loadStats = useCallback(async (showLoading = true, force = false) => {
    if (!isAuthenticated || !token || !mountedRef.current) return;
    
    // Verificar throttling solo si no es forzado
    if (!force && !canMakeRequest('realtime-stats')) {
      console.log('Request throttled for realtime stats');
      return;
    }
    
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Cargar datos con throttling individual
      const appointmentsRes = await throttledRequest('appointments', () => 
        robustApiService.getAppointments(token, { limit: 1000 })
      );
      
      const paymentsRes = await throttledRequest('payments', () => 
        robustApiService.getPayments(token)
      ).catch(() => ({ success: false, data: [] }));
      
      const notificationsRes = await throttledRequest('notifications', () => 
        robustApiService.getNotifications(token)
      ).catch(() => ({ success: false, data: [] }));

      // Asegurar que appointments siempre sea un array
      let appointments = [];
      if (appointmentsRes.success) {
        if (Array.isArray(appointmentsRes.data?.appointments)) {
          appointments = appointmentsRes.data.appointments;
        } else if (Array.isArray(appointmentsRes.data)) {
          appointments = appointmentsRes.data;
        } else if (appointmentsRes.data?.data && Array.isArray(appointmentsRes.data.data)) {
          appointments = appointmentsRes.data.data;
        }
      }
      
      const payments = paymentsRes.success 
        ? (Array.isArray(paymentsRes.data) ? paymentsRes.data : [])
        : [];

      // Calcular métricas
      const metrics = calculateMetrics(appointments, payments);
      setStats(metrics);

      // Generar alertas
      if (includeAlerts) {
        const newAlerts = generateAlerts(metrics, appointments);
        setAlerts(newAlerts);
      }

    } catch (error) {
      console.error('Error loading real-time stats:', error);
      setError(error.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [isAuthenticated, token, calculateMetrics, generateAlerts, includeAlerts]);

  // Refrescar estadísticas
  const refreshStats = useCallback(async () => {
    await loadStats(false);
  }, [loadStats]);

  // Toggle tiempo real
  const toggleRealTime = useCallback((enabled) => {
    setIsRealTimeEnabled(enabled);
  }, []);

  // Descartar alerta
  const dismissAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Limpiar todas las alertas
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Efecto para carga inicial
  useEffect(() => {
    mountedRef.current = true;
    
    if (isAuthenticated && token && isRealTimeEnabled) {
      // Carga inicial con force - solo una vez
      loadStats(true, true);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [isAuthenticated, token]); // Solo depende de auth, no de las funciones

  // Efecto separado para auto-refresh
  useEffect(() => {
    if (!isRealTimeEnabled || !isAuthenticated || !token) {
      return;
    }

    // Auto-refresh con intervalo
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          refreshStats();
        }
      }, Math.max(refreshInterval, 15000)); // Mínimo 15 segundos - CORS funcionando
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRealTimeEnabled, refreshInterval]); // Solo depende de configuración

  // Métricas derivadas
  const derivedMetrics = {
    completionRate: stats.totalAppointments > 0 
      ? Math.round((stats.completedToday / stats.todayAppointments) * 100) || 0
      : 0,
    urgencyRate: stats.totalAppointments > 0
      ? Math.round((stats.urgentAppointments / stats.totalAppointments) * 100)
      : 0,
    telemedicineRate: stats.totalAppointments > 0
      ? Math.round((stats.telemedicineCount / stats.totalAppointments) * 100)
      : 0,
    hasUrgentAlerts: alerts.some(alert => alert.priority === 'high'),
    alertCount: alerts.length,
    isHealthy: stats.trends.efficiency.value > 80 && stats.urgentAppointments < 3
  };

  return {
    // Estados principales
    stats,
    alerts,
    loading,
    error,
    isRealTimeEnabled,
    
    // Métricas derivadas
    ...derivedMetrics,
    
    // Funciones de control
    loadStats,
    refreshStats,
    toggleRealTime,
    
    // Gestión de alertas
    dismissAlert,
    clearAllAlerts,
    
    // Utilidades
    formatCurrency: (amount) => new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount),
    
    formatPercentage: (value) => `${Math.round(value)}%`,
    
    getStatusColor: (status) => {
      const colors = {
        PENDING: "yellow",
        CONFIRMED: "blue", 
        IN_PROGRESS: "purple",
        COMPLETED: "green",
        CANCELLED: "red",
        NO_SHOW: "gray"
      };
      return colors[status] || "gray";
    },
    
    getPriorityColor: (priority) => {
      const colors = {
        URGENT: "red",
        HIGH: "orange", 
        MEDIUM: "yellow",
        LOW: "green"
      };
      return colors[priority] || "gray";
    }
  };
};

export default useRealtimeStats;
