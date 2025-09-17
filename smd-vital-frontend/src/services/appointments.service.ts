import { apiService } from './api';
import type { Appointment, AppointmentCreate, PaginatedResponse } from '../types/api';

export class AppointmentsService {
  private baseUrl = '/api/appointments';

  async getAppointments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    patient_id?: string;
    professional_id?: string;
  }): Promise<PaginatedResponse<Appointment>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.patient_id) queryParams.append('patient_id', params.patient_id);
      if (params?.professional_id) queryParams.append('professional_id', params.professional_id);

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      return await apiService.get<PaginatedResponse<Appointment>>(url);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async getAppointment(id: string): Promise<Appointment> {
    try {
      return await apiService.get<Appointment>(`${this.baseUrl}/${id}`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async createAppointment(data: AppointmentCreate): Promise<Appointment> {
    try {
      return await apiService.post<Appointment>(this.baseUrl, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async updateAppointment(id: string, data: Partial<AppointmentCreate>): Promise<Appointment> {
    try {
      return await apiService.put<Appointment>(`${this.baseUrl}/${id}`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    try {
      return await apiService.patch<Appointment>(`${this.baseUrl}/${id}/cancel`, {
        reason,
      });
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async confirmAppointment(id: string): Promise<Appointment> {
    try {
      return await apiService.patch<Appointment>(`${this.baseUrl}/${id}/confirm`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async completeAppointment(id: string, notes?: string): Promise<Appointment> {
    try {
      return await apiService.patch<Appointment>(`${this.baseUrl}/${id}/complete`, {
        notes,
      });
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async deleteAppointment(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async getAvailableSlots(professionalId: string, date: string): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        professional_id: professionalId,
        date: date
      });
      return await apiService.get<string[]>(`${this.baseUrl}/available-slots?${params}`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }
}

export const appointmentsService = new AppointmentsService();
