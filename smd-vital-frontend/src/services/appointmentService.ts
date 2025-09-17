// ========================================
// SERVICIO DE CITAS MÉDICAS
// ========================================

import { apiService } from './apiService';
import type { 
  Appointment, 
  PaginationInfo, 
  AppointmentFilters, 
  SearchOptions 
} from '../types/models';
import type { ApiResponse } from '../types/api-new';

export class AppointmentService {
  private baseEndpoint = '/appointments';

  // ===== OBTENER CITAS =====
  async getAppointments(
    filters?: AppointmentFilters,
    page: number = 1,
    limit: number = 10,
    sort?: { field: string; direction: 'asc' | 'desc' }
  ): Promise<ApiResponse<{ appointments: Appointment[]; pagination: PaginationInfo }>> {
    const params = {
      page,
      limit,
      ...filters,
      ...(sort && { sort_by: sort.field, sort_order: sort.direction }),
    };

    return apiService.get<{ appointments: Appointment[]; pagination: PaginationInfo }>(
      this.baseEndpoint,
      params
    );
  }

  // ===== OBTENER CITA POR ID =====
  async getAppointmentById(id: string): Promise<ApiResponse<Appointment>> {
    return apiService.get<Appointment>(`${this.baseEndpoint}/${id}`);
  }

  // ===== CREAR CITA =====
  async createAppointment(appointmentData: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    return apiService.post<Appointment>(this.baseEndpoint, appointmentData);
  }

  // ===== ACTUALIZAR CITA =====
  async updateAppointment(id: string, appointmentData: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    return apiService.put<Appointment>(`${this.baseEndpoint}/${id}`, appointmentData);
  }

  // ===== ELIMINAR CITA =====
  async deleteAppointment(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // ===== CANCELAR CITA =====
  async cancelAppointment(id: string, reason?: string): Promise<ApiResponse<Appointment>> {
    return apiService.patch<Appointment>(`${this.baseEndpoint}/${id}/cancel`, { reason });
  }

  // ===== CONFIRMAR CITA =====
  async confirmAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return apiService.patch<Appointment>(`${this.baseEndpoint}/${id}/confirm`);
  }

  // ===== COMPLETAR CITA =====
  async completeAppointment(id: string, notes?: string): Promise<ApiResponse<Appointment>> {
    return apiService.patch<Appointment>(`${this.baseEndpoint}/${id}/complete`, { notes });
  }

  // ===== REAGENDAR CITA =====
  async rescheduleAppointment(id: string, newDate: string, newTime: string): Promise<ApiResponse<Appointment>> {
    return apiService.patch<Appointment>(`${this.baseEndpoint}/${id}/reschedule`, {
      date: newDate,
      time: newTime,
    });
  }

  // ===== OBTENER CITAS DE HOY =====
  async getTodayAppointments(): Promise<ApiResponse<Appointment[]>> {
    return apiService.get<Appointment[]>(`${this.baseEndpoint}/today`);
  }

  // ===== OBTENER CITAS POR FECHA =====
  async getAppointmentsByDate(date: string): Promise<ApiResponse<Appointment[]>> {
    return apiService.get<Appointment[]>(`${this.baseEndpoint}/date/${date}`);
  }

  // ===== OBTENER CITAS DEL PACIENTE =====
  async getPatientAppointments(patientId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ appointments: Appointment[]; pagination: PaginationInfo }>> {
    return apiService.get<{ appointments: Appointment[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/patient/${patientId}`,
      { page, limit }
    );
  }

  // ===== OBTENER CITAS DEL DOCTOR =====
  async getDoctorAppointments(doctorId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ appointments: Appointment[]; pagination: PaginationInfo }>> {
    return apiService.get<{ appointments: Appointment[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/doctor/${doctorId}`,
      { page, limit }
    );
  }

  // ===== OBTENER CITAS DE LA ENFERMERA =====
  async getNurseAppointments(nurseId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ appointments: Appointment[]; pagination: PaginationInfo }>> {
    return apiService.get<{ appointments: Appointment[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/nurse/${nurseId}`,
      { page, limit }
    );
  }

  // ===== BUSCAR CITAS =====
  async searchAppointments(searchOptions: SearchOptions): Promise<ApiResponse<{ appointments: Appointment[]; pagination: PaginationInfo }>> {
    return apiService.post<{ appointments: Appointment[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/search`,
      searchOptions
    );
  }

  // ===== OBTENER DISPONIBILIDAD =====
  async getAvailability(doctorId: string, date: string): Promise<ApiResponse<{
    available_slots: Array<{
      time: string;
      duration: number;
      is_available: boolean;
    }>;
  }>> {
    return apiService.get<{
      available_slots: Array<{
        time: string;
        duration: number;
        is_available: boolean;
      }>;
    }>(`${this.baseEndpoint}/availability/${doctorId}/${date}`);
  }

  // ===== VERIFICAR CONFLICTOS =====
  async checkConflicts(doctorId: string, date: string, time: string, duration: number, excludeId?: string): Promise<ApiResponse<{
    has_conflicts: boolean;
    conflicting_appointments: Appointment[];
  }>> {
    return apiService.post<{
      has_conflicts: boolean;
      conflicting_appointments: Appointment[];
    }>(`${this.baseEndpoint}/check-conflicts`, {
      doctor_id: doctorId,
      date,
      time,
      duration,
      exclude_id: excludeId,
    });
  }

  // ===== OBTENER ESTADÍSTICAS DE CITAS =====
  async getAppointmentStats(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    total_appointments: number;
    completed_appointments: number;
    pending_appointments: number;
    cancelled_appointments: number;
    no_show_appointments: number;
    completion_rate: number;
    cancellation_rate: number;
    no_show_rate: number;
  }>> {
    return apiService.get<{
      total_appointments: number;
      completed_appointments: number;
      pending_appointments: number;
      cancelled_appointments: number;
      no_show_appointments: number;
      completion_rate: number;
      cancellation_rate: number;
      no_show_rate: number;
    }>(`${this.baseEndpoint}/stats`, { period });
  }

  // ===== OBTENER CITAS PRÓXIMAS =====
  async getUpcomingAppointments(limit: number = 5): Promise<ApiResponse<Appointment[]>> {
    return apiService.get<Appointment[]>(`${this.baseEndpoint}/upcoming`, { limit });
  }

  // ===== OBTENER CITAS URGENTES =====
  async getUrgentAppointments(): Promise<ApiResponse<Appointment[]>> {
    return apiService.get<Appointment[]>(`${this.baseEndpoint}/urgent`);
  }

  // ===== ASIGNAR ENFERMERA =====
  async assignNurse(appointmentId: string, nurseId: string): Promise<ApiResponse<Appointment>> {
    return apiService.patch<Appointment>(`${this.baseEndpoint}/${appointmentId}/assign-nurse`, {
      nurse_id: nurseId,
    });
  }

  // ===== REMOVER ENFERMERA =====
  async removeNurse(appointmentId: string): Promise<ApiResponse<Appointment>> {
    return apiService.patch<Appointment>(`${this.baseEndpoint}/${appointmentId}/remove-nurse`);
  }

  // ===== OBTENER HISTORIAL DE CAMBIOS =====
  async getAppointmentHistory(appointmentId: string): Promise<ApiResponse<Array<{
    id: string;
    action: string;
    description: string;
    changed_by: string;
    changed_at: string;
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
  }>>> {
    return apiService.get<Array<{
      id: string;
      action: string;
      description: string;
      changed_by: string;
      changed_at: string;
      old_values?: Record<string, any>;
      new_values?: Record<string, any>;
    }>>(`${this.baseEndpoint}/${appointmentId}/history`);
  }

  // ===== ENVIAR RECORDATORIO =====
  async sendReminder(appointmentId: string, method: 'email' | 'sms' | 'push' = 'email'): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/${appointmentId}/reminder`, { method });
  }

  // ===== OBTENER REPORTE DE CITAS =====
  async getAppointmentReport(
    startDate: string,
    endDate: string,
    format: 'pdf' | 'excel' | 'csv' = 'pdf'
  ): Promise<ApiResponse<{ report_url: string }>> {
    return apiService.get<{ report_url: string }>(`${this.baseEndpoint}/report`, {
      start_date: startDate,
      end_date: endDate,
      format,
    });
  }
}

// ===== INSTANCIA SINGLETON =====
export const appointmentService = new AppointmentService();
