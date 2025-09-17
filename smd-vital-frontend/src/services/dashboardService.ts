// ========================================
// SERVICIO DE DASHBOARD Y ESTADÍSTICAS
// ========================================

import { apiService } from './apiService';
import type { ApiResponse } from '../types/api-new';

// Definir tipos localmente para evitar problemas de importación
export interface DashboardStats {
  total_users: number;
  total_appointments: number;
  total_medical_records: number;
  total_payments: number;
  total_revenue: number;
  active_users: number;
  completed_appointments: number;
  pending_appointments: number;
  recent_activity: Array<{
    id: string;
    action: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'patient';

export class DashboardService {
  private baseEndpoint = '/dashboard';

  // ===== OBTENER ESTADÍSTICAS GENERALES =====
  async getGeneralStats(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<DashboardStats>> {
    return apiService.get<DashboardStats>(`${this.baseEndpoint}/stats`, { period });
  }

  // ===== OBTENER ESTADÍSTICAS POR ROL =====
  async getRoleStats(role: UserRole, period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<DashboardStats>> {
    return apiService.get<DashboardStats>(`${this.baseEndpoint}/stats/${role}`, { period });
  }

  // ===== OBTENER ESTADÍSTICAS DEL PACIENTE =====
  async getPatientStats(patientId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    total_appointments: number;
    completed_appointments: number;
    upcoming_appointments: number;
    total_medical_records: number;
    recent_medical_records: number;
    total_payments: number;
    pending_payments: number;
    next_appointment?: {
      id: string;
      date: string;
      time: string;
      doctor_name: string;
      type: string;
    };
    health_summary: {
      last_checkup: string;
      current_medications: number;
      active_conditions: number;
      risk_factors: string[];
    };
  }>> {
    return apiService.get<{
      total_appointments: number;
      completed_appointments: number;
      upcoming_appointments: number;
      total_medical_records: number;
      recent_medical_records: number;
      total_payments: number;
      pending_payments: number;
      next_appointment?: {
        id: string;
        date: string;
        time: string;
        doctor_name: string;
        type: string;
      };
      health_summary: {
        last_checkup: string;
        current_medications: number;
        active_conditions: number;
        risk_factors: string[];
      };
    }>(`${this.baseEndpoint}/patient/${patientId}`, { period });
  }

  // ===== OBTENER ESTADÍSTICAS DEL DOCTOR =====
  async getDoctorStats(doctorId: string, period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    total_appointments: number;
    completed_appointments: number;
    pending_appointments: number;
    cancelled_appointments: number;
    total_patients: number;
    new_patients: number;
    total_medical_records: number;
    pending_medical_records: number;
    today_appointments: Array<{
      id: string;
      time: string;
      patient_name: string;
      type: string;
      status: string;
    }>;
    recent_medical_records: Array<{
      id: string;
      patient_name: string;
      date: string;
      diagnosis: string;
      status: string;
    }>;
    performance_metrics: {
      average_appointment_duration: number;
      patient_satisfaction_score: number;
      completion_rate: number;
      cancellation_rate: number;
    };
  }>> {
    return apiService.get<{
      total_appointments: number;
      completed_appointments: number;
      pending_appointments: number;
      cancelled_appointments: number;
      total_patients: number;
      new_patients: number;
      total_medical_records: number;
      pending_medical_records: number;
      today_appointments: Array<{
        id: string;
        time: string;
        patient_name: string;
        type: string;
        status: string;
      }>;
      recent_medical_records: Array<{
        id: string;
        patient_name: string;
        date: string;
        diagnosis: string;
        status: string;
      }>;
      performance_metrics: {
        average_appointment_duration: number;
        patient_satisfaction_score: number;
        completion_rate: number;
        cancellation_rate: number;
      };
    }>(`${this.baseEndpoint}/doctor/${doctorId}`, { period });
  }

  // ===== OBTENER ESTADÍSTICAS DE LA ENFERMERA =====
  async getNurseStats(nurseId: string, period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    urgent_tasks: number;
    total_patients: number;
    vital_signs_recorded: number;
    medications_administered: number;
    today_tasks: Array<{
      id: string;
      time: string;
      patient_name: string;
      task: string;
      status: string;
      priority: string;
    }>;
    vital_signs: Array<{
      id: string;
      patient_name: string;
      temperature: string;
      blood_pressure: string;
      heart_rate: string;
      oxygen: string;
      time: string;
      status: string;
    }>;
    performance_metrics: {
      task_completion_rate: number;
      average_task_duration: number;
      patient_satisfaction_score: number;
      accuracy_rate: number;
    };
  }>> {
    return apiService.get<{
      total_tasks: number;
      completed_tasks: number;
      pending_tasks: number;
      urgent_tasks: number;
      total_patients: number;
      vital_signs_recorded: number;
      medications_administered: number;
      today_tasks: Array<{
        id: string;
        time: string;
        patient_name: string;
        task: string;
        status: string;
        priority: string;
      }>;
      vital_signs: Array<{
        id: string;
        patient_name: string;
        temperature: string;
        blood_pressure: string;
        heart_rate: string;
        oxygen: string;
        time: string;
        status: string;
      }>;
      performance_metrics: {
        task_completion_rate: number;
        average_task_duration: number;
        patient_satisfaction_score: number;
        accuracy_rate: number;
      };
    }>(`${this.baseEndpoint}/nurse/${nurseId}`, { period });
  }

  // ===== OBTENER ESTADÍSTICAS DEL ADMINISTRADOR =====
  async getAdminStats(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    total_users: number;
    active_users: number;
    new_users_this_month: number;
    users_by_role: Record<string, number>;
    total_appointments: number;
    completed_appointments: number;
    pending_appointments: number;
    total_medical_records: number;
    total_payments: number;
    total_revenue: number;
    revenue_this_month: number;
    system_alerts: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      time: string;
      severity: string;
    }>;
    recent_users: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      last_login: string;
    }>;
    performance_metrics: {
      user_growth_rate: number;
      appointment_growth_rate: number;
      revenue_growth_rate: number;
      system_uptime: number;
      average_response_time: number;
    };
  }>> {
    return apiService.get<{
      total_users: number;
      active_users: number;
      new_users_this_month: number;
      users_by_role: Record<string, number>;
      total_appointments: number;
      completed_appointments: number;
      pending_appointments: number;
      total_medical_records: number;
      total_payments: number;
      total_revenue: number;
      revenue_this_month: number;
      system_alerts: Array<{
        id: string;
        type: string;
        title: string;
        message: string;
        time: string;
        severity: string;
      }>;
      recent_users: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        last_login: string;
      }>;
      performance_metrics: {
        user_growth_rate: number;
        appointment_growth_rate: number;
        revenue_growth_rate: number;
        system_uptime: number;
        average_response_time: number;
      };
    }>(`${this.baseEndpoint}/admin`, { period });
  }

  // ===== OBTENER GRÁFICOS Y TENDENCIAS =====
  async getChartsData(period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    appointments_chart: Array<{
      date: string;
      scheduled: number;
      completed: number;
      cancelled: number;
    }>;
    users_chart: Array<{
      date: string;
      new_users: number;
      active_users: number;
    }>;
    revenue_chart: Array<{
      date: string;
      revenue: number;
      payments: number;
    }>;
    medical_records_chart: Array<{
      date: string;
      created: number;
      completed: number;
    }>;
  }>> {
    return apiService.get<{
      appointments_chart: Array<{
        date: string;
        scheduled: number;
        completed: number;
        cancelled: number;
      }>;
      users_chart: Array<{
        date: string;
        new_users: number;
        active_users: number;
      }>;
      revenue_chart: Array<{
        date: string;
        revenue: number;
        payments: number;
      }>;
      medical_records_chart: Array<{
        date: string;
        created: number;
        completed: number;
      }>;
    }>(`${this.baseEndpoint}/charts`, { period });
  }

  // ===== OBTENER MÉTRICAS DE RENDIMIENTO =====
  async getPerformanceMetrics(period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    system_performance: {
      uptime: number;
      average_response_time: number;
      error_rate: number;
      cpu_usage: number;
      memory_usage: number;
    };
    user_engagement: {
      daily_active_users: number;
      weekly_active_users: number;
      monthly_active_users: number;
      average_session_duration: number;
      page_views: number;
    };
    medical_metrics: {
      average_appointment_duration: number;
      patient_satisfaction_score: number;
      diagnosis_accuracy: number;
      treatment_success_rate: number;
    };
  }>> {
    return apiService.get<{
      system_performance: {
        uptime: number;
        average_response_time: number;
        error_rate: number;
        cpu_usage: number;
        memory_usage: number;
      };
      user_engagement: {
        daily_active_users: number;
        weekly_active_users: number;
        monthly_active_users: number;
        average_session_duration: number;
        page_views: number;
      };
      medical_metrics: {
        average_appointment_duration: number;
        patient_satisfaction_score: number;
        diagnosis_accuracy: number;
        treatment_success_rate: number;
      };
    }>(`${this.baseEndpoint}/performance`, { period });
  }

  // ===== OBTENER ALERTAS DEL SISTEMA =====
  async getSystemAlerts(): Promise<ApiResponse<Array<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    is_active: boolean;
    created_at: string;
    affected_services?: string[];
  }>>> {
    return apiService.get<Array<{
      id: string;
      type: 'info' | 'warning' | 'error' | 'success';
      title: string;
      message: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      is_active: boolean;
      created_at: string;
      affected_services?: string[];
    }>>(`${this.baseEndpoint}/system-alerts`);
  }

  // ===== OBTENER NOTIFICACIONES =====
  async getNotifications(limit: number = 10): Promise<ApiResponse<Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'appointment' | 'payment' | 'medical';
    is_read: boolean;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    created_at: string;
    action_url?: string;
    action_text?: string;
  }>>> {
    return apiService.get<Array<{
      id: string;
      title: string;
      message: string;
      type: 'info' | 'warning' | 'error' | 'success' | 'appointment' | 'payment' | 'medical';
      is_read: boolean;
      priority: 'low' | 'normal' | 'high' | 'urgent';
      created_at: string;
      action_url?: string;
      action_text?: string;
    }>>(`${this.baseEndpoint}/notifications`, { limit });
  }

  // ===== MARCAR NOTIFICACIÓN COMO LEÍDA =====
  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return apiService.patch<void>(`${this.baseEndpoint}/notifications/${notificationId}/read`);
  }

  // ===== MARCAR TODAS LAS NOTIFICACIONES COMO LEÍDAS =====
  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    return apiService.patch<void>(`${this.baseEndpoint}/notifications/read-all`);
  }

  // ===== OBTENER RESUMEN RÁPIDO =====
  async getQuickSummary(): Promise<ApiResponse<{
    today_appointments: number;
    pending_tasks: number;
    unread_notifications: number;
    system_alerts: number;
    recent_activity: Array<{
      id: string;
      action: string;
      description: string;
      timestamp: string;
      user: string;
    }>;
  }>> {
    return apiService.get<{
      today_appointments: number;
      pending_tasks: number;
      unread_notifications: number;
      system_alerts: number;
      recent_activity: Array<{
        id: string;
        action: string;
        description: string;
        timestamp: string;
        user: string;
      }>;
    }>(`${this.baseEndpoint}/quick-summary`);
  }
}

// ===== INSTANCIA SINGLETON =====
export const dashboardService = new DashboardService();