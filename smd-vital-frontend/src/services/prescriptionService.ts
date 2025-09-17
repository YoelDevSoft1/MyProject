// ========================================
// SERVICIO DE PRESCRIPCIONES
// ========================================

import { apiService } from './apiService';
import type { 
  Prescription,
  PaginationInfo
} from '../types/models';
import type { ApiResponse, SearchOptions } from '../types/api-new';

export class PrescriptionService {
  private baseEndpoint = '/prescriptions';

  // ===== OBTENER PRESCRIPCIONES =====
  async getPrescriptions(
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
  ): Promise<ApiResponse<{ prescriptions: Prescription[]; pagination: PaginationInfo }>> {
    const params = {
      page,
      limit,
      ...filters,
      ...(sort && { sort_by: sort.field, sort_order: sort.direction }),
    };

    return apiService.get<{ prescriptions: Prescription[]; pagination: PaginationInfo }>(
      this.baseEndpoint,
      params
    );
  }

  // ===== OBTENER PRESCRIPCIÓN POR ID =====
  async getPrescriptionById(id: string): Promise<ApiResponse<Prescription>> {
    return apiService.get<Prescription>(`${this.baseEndpoint}/${id}`);
  }

  // ===== CREAR PRESCRIPCIÓN =====
  async createPrescription(prescriptionData: Partial<Prescription>): Promise<ApiResponse<Prescription>> {
    return apiService.post<Prescription>(this.baseEndpoint, prescriptionData);
  }

  // ===== ACTUALIZAR PRESCRIPCIÓN =====
  async updatePrescription(id: string, prescriptionData: Partial<Prescription>): Promise<ApiResponse<Prescription>> {
    return apiService.put<Prescription>(`${this.baseEndpoint}/${id}`, prescriptionData);
  }

  // ===== ELIMINAR PRESCRIPCIÓN =====
  async deletePrescription(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // ===== OBTENER PRESCRIPCIONES DEL PACIENTE =====
  async getPatientPrescriptions(patientId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ prescriptions: Prescription[]; pagination: PaginationInfo }>> {
    return apiService.get<{ prescriptions: Prescription[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/patient/${patientId}`,
      { page, limit }
    );
  }

  // ===== OBTENER PRESCRIPCIONES DEL DOCTOR =====
  async getDoctorPrescriptions(doctorId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ prescriptions: Prescription[]; pagination: PaginationInfo }>> {
    return apiService.get<{ prescriptions: Prescription[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/doctor/${doctorId}`,
      { page, limit }
    );
  }

  // ===== OBTENER PRESCRIPCIONES ACTIVAS =====
  async getActivePrescriptions(patientId: string): Promise<ApiResponse<Prescription[]>> {
    return apiService.get<Prescription[]>(`${this.baseEndpoint}/patient/${patientId}/active`);
  }

  // ===== CANCELAR PRESCRIPCIÓN =====
  async cancelPrescription(id: string, reason: string): Promise<ApiResponse<Prescription>> {
    return apiService.patch<Prescription>(`${this.baseEndpoint}/${id}/cancel`, { reason });
  }

  // ===== RENOVAR PRESCRIPCIÓN =====
  async renewPrescription(id: string, newValidUntil: string): Promise<ApiResponse<Prescription>> {
    return apiService.patch<Prescription>(`${this.baseEndpoint}/${id}/renew`, { valid_until: newValidUntil });
  }

  // ===== BUSCAR PRESCRIPCIONES =====
  async searchPrescriptions(searchOptions: SearchOptions): Promise<ApiResponse<{ prescriptions: Prescription[]; pagination: PaginationInfo }>> {
    return apiService.post<{ prescriptions: Prescription[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/search`,
      searchOptions
    );
  }

  // ===== OBTENER ESTADÍSTICAS DE PRESCRIPCIONES =====
  async getPrescriptionStats(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    total_prescriptions: number;
    active_prescriptions: number;
    expired_prescriptions: number;
    cancelled_prescriptions: number;
    prescriptions_by_medication: Record<string, number>;
    prescriptions_by_doctor: Record<string, number>;
  }>> {
    return apiService.get<{
      total_prescriptions: number;
      active_prescriptions: number;
      expired_prescriptions: number;
      cancelled_prescriptions: number;
      prescriptions_by_medication: Record<string, number>;
      prescriptions_by_doctor: Record<string, number>;
    }>(`${this.baseEndpoint}/stats`, { period });
  }

  // ===== OBTENER PRESCRIPCIONES EXPIRADAS =====
  async getExpiredPrescriptions(): Promise<ApiResponse<Prescription[]>> {
    return apiService.get<Prescription[]>(`${this.baseEndpoint}/expired`);
  }

  // ===== OBTENER PRESCRIPCIONES PRÓXIMAS A EXPIRAR =====
  async getExpiringPrescriptions(days: number = 7): Promise<ApiResponse<Prescription[]>> {
    return apiService.get<Prescription[]>(`${this.baseEndpoint}/expiring`, { days });
  }

  // ===== IMPRIMIR PRESCRIPCIÓN =====
  async printPrescription(id: string): Promise<ApiResponse<{ print_url: string }>> {
    return apiService.get<{ print_url: string }>(`${this.baseEndpoint}/${id}/print`);
  }

  // ===== ENVIAR PRESCRIPCIÓN POR EMAIL =====
  async emailPrescription(id: string, email: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/${id}/email`, { email });
  }

  // ===== OBTENER HISTORIAL DE PRESCRIPCIONES =====
  async getPrescriptionHistory(prescriptionId: string): Promise<ApiResponse<Array<{
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
    }>>(`${this.baseEndpoint}/${prescriptionId}/history`);
  }
}

// ===== INSTANCIA SINGLETON =====
export const prescriptionService = new PrescriptionService();
