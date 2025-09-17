// ========================================
// SERVICIO DE EXPEDIENTES MÉDICOS
// ========================================

import { apiService } from './apiService';
import type { 
  MedicalRecord,
  PaginationInfo,
  MedicalRecordFilters,
  VitalSigns,
  Attachment,
  LabResult,
  ImagingResult
} from '../types/models';
import type { ApiResponse, SearchOptions } from '../types/api-new';

export class MedicalRecordService {
  private baseEndpoint = '/medical-records';

  // ===== OBTENER EXPEDIENTES MÉDICOS =====
  async getMedicalRecords(
    filters?: MedicalRecordFilters,
    page: number = 1,
    limit: number = 10,
    sort?: { field: string; direction: 'asc' | 'desc' }
  ): Promise<ApiResponse<{ medical_records: MedicalRecord[]; pagination: PaginationInfo }>> {
    const params = {
      page,
      limit,
      ...filters,
      ...(sort && { sort_by: sort.field, sort_order: sort.direction }),
    };

    return apiService.get<{ medical_records: MedicalRecord[]; pagination: PaginationInfo }>(
      this.baseEndpoint,
      params
    );
  }

  // ===== OBTENER EXPEDIENTE POR ID =====
  async getMedicalRecordById(id: string): Promise<ApiResponse<MedicalRecord>> {
    return apiService.get<MedicalRecord>(`${this.baseEndpoint}/${id}`);
  }

  // ===== CREAR EXPEDIENTE MÉDICO =====
  async createMedicalRecord(recordData: Partial<MedicalRecord>): Promise<ApiResponse<MedicalRecord>> {
    return apiService.post<MedicalRecord>(this.baseEndpoint, recordData);
  }

  // ===== ACTUALIZAR EXPEDIENTE MÉDICO =====
  async updateMedicalRecord(id: string, recordData: Partial<MedicalRecord>): Promise<ApiResponse<MedicalRecord>> {
    return apiService.put<MedicalRecord>(`${this.baseEndpoint}/${id}`, recordData);
  }

  // ===== ELIMINAR EXPEDIENTE MÉDICO =====
  async deleteMedicalRecord(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // ===== ARCHIVAR EXPEDIENTE =====
  async archiveMedicalRecord(id: string): Promise<ApiResponse<MedicalRecord>> {
    return apiService.patch<MedicalRecord>(`${this.baseEndpoint}/${id}/archive`);
  }

  // ===== RESTAURAR EXPEDIENTE =====
  async restoreMedicalRecord(id: string): Promise<ApiResponse<MedicalRecord>> {
    return apiService.patch<MedicalRecord>(`${this.baseEndpoint}/${id}/restore`);
  }

  // ===== OBTENER EXPEDIENTES DEL PACIENTE =====
  async getPatientMedicalRecords(patientId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ medical_records: MedicalRecord[]; pagination: PaginationInfo }>> {
    return apiService.get<{ medical_records: MedicalRecord[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/patient/${patientId}`,
      { page, limit }
    );
  }

  // ===== OBTENER EXPEDIENTES DEL DOCTOR =====
  async getDoctorMedicalRecords(doctorId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{ medical_records: MedicalRecord[]; pagination: PaginationInfo }>> {
    return apiService.get<{ medical_records: MedicalRecord[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/doctor/${doctorId}`,
      { page, limit }
    );
  }

  // ===== BUSCAR EXPEDIENTES =====
  async searchMedicalRecords(searchOptions: SearchOptions): Promise<ApiResponse<{ medical_records: MedicalRecord[]; pagination: PaginationInfo }>> {
    return apiService.post<{ medical_records: MedicalRecord[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/search`,
      searchOptions
    );
  }

  // ===== OBTENER ESTADÍSTICAS DE EXPEDIENTES =====
  async getMedicalRecordStats(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    total_records: number;
    completed_records: number;
    draft_records: number;
    archived_records: number;
    records_by_type: Record<string, number>;
    records_by_diagnosis: Record<string, number>;
  }>> {
    return apiService.get<{
      total_records: number;
      completed_records: number;
      draft_records: number;
      archived_records: number;
      records_by_type: Record<string, number>;
      records_by_diagnosis: Record<string, number>;
    }>(`${this.baseEndpoint}/stats`, { period });
  }

  // ===== OBTENER EXPEDIENTES RECIENTES =====
  async getRecentMedicalRecords(limit: number = 5): Promise<ApiResponse<MedicalRecord[]>> {
    return apiService.get<MedicalRecord[]>(`${this.baseEndpoint}/recent`, { limit });
  }

  // ===== OBTENER EXPEDIENTES PENDIENTES =====
  async getPendingMedicalRecords(): Promise<ApiResponse<MedicalRecord[]>> {
    return apiService.get<MedicalRecord[]>(`${this.baseEndpoint}/pending`);
  }

  // ===== ACTUALIZAR SIGNOS VITALES =====
  async updateVitalSigns(recordId: string, vitalSigns: Partial<VitalSigns>): Promise<ApiResponse<MedicalRecord>> {
    return apiService.patch<MedicalRecord>(`${this.baseEndpoint}/${recordId}/vital-signs`, vitalSigns);
  }

  // ===== OBTENER SIGNOS VITALES =====
  async getVitalSigns(recordId: string): Promise<ApiResponse<VitalSigns>> {
    return apiService.get<VitalSigns>(`${this.baseEndpoint}/${recordId}/vital-signs`);
  }

  // ===== AGREGAR MEDICAMENTO =====
  async addMedication(recordId: string, medication: any): Promise<ApiResponse<MedicalRecord>> {
    return apiService.post<MedicalRecord>(`${this.baseEndpoint}/${recordId}/medications`, medication);
  }

  // ===== ACTUALIZAR MEDICAMENTO =====
  async updateMedication(recordId: string, medicationId: string, medication: any): Promise<ApiResponse<MedicalRecord>> {
    return apiService.put<MedicalRecord>(`${this.baseEndpoint}/${recordId}/medications/${medicationId}`, medication);
  }

  // ===== ELIMINAR MEDICAMENTO =====
  async removeMedication(recordId: string, medicationId: string): Promise<ApiResponse<MedicalRecord>> {
    return apiService.delete<MedicalRecord>(`${this.baseEndpoint}/${recordId}/medications/${medicationId}`);
  }

  // ===== SUBIR ARCHIVO ADJUNTO =====
  async uploadAttachment(recordId: string, file: File, description?: string): Promise<ApiResponse<Attachment>> {
    return apiService.uploadFile<Attachment>(
      `${this.baseEndpoint}/${recordId}/attachments`,
      file,
      { description }
    );
  }

  // ===== ELIMINAR ARCHIVO ADJUNTO =====
  async deleteAttachment(recordId: string, attachmentId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${recordId}/attachments/${attachmentId}`);
  }

  // ===== DESCARGAR ARCHIVO ADJUNTO =====
  async downloadAttachment(recordId: string, attachmentId: string): Promise<void> {
    return apiService.downloadFile(`${this.baseEndpoint}/${recordId}/attachments/${attachmentId}/download`);
  }

  // ===== OBTENER RESULTADOS DE LABORATORIO =====
  async getLabResults(recordId: string): Promise<ApiResponse<LabResult[]>> {
    return apiService.get<LabResult[]>(`${this.baseEndpoint}/${recordId}/lab-results`);
  }

  // ===== AGREGAR RESULTADO DE LABORATORIO =====
  async addLabResult(recordId: string, labResult: Partial<LabResult>): Promise<ApiResponse<LabResult>> {
    return apiService.post<LabResult>(`${this.baseEndpoint}/${recordId}/lab-results`, labResult);
  }

  // ===== OBTENER RESULTADOS DE IMAGEN =====
  async getImagingResults(recordId: string): Promise<ApiResponse<ImagingResult[]>> {
    return apiService.get<ImagingResult[]>(`${this.baseEndpoint}/${recordId}/imaging-results`);
  }

  // ===== AGREGAR RESULTADO DE IMAGEN =====
  async addImagingResult(recordId: string, imagingResult: Partial<ImagingResult>): Promise<ApiResponse<ImagingResult>> {
    return apiService.post<ImagingResult>(`${this.baseEndpoint}/${recordId}/imaging-results`, imagingResult);
  }

  // ===== OBTENER HISTORIAL MÉDICO COMPLETO =====
  async getCompleteMedicalHistory(patientId: string): Promise<ApiResponse<{
    patient: any;
    medical_records: MedicalRecord[];
    lab_results: LabResult[];
    imaging_results: ImagingResult[];
    appointments: any[];
    prescriptions: any[];
  }>> {
    return apiService.get<{
      patient: any;
      medical_records: MedicalRecord[];
      lab_results: LabResult[];
      imaging_results: ImagingResult[];
      appointments: any[];
      prescriptions: any[];
    }>(`${this.baseEndpoint}/patient/${patientId}/complete-history`);
  }

  // ===== OBTENER DIAGNÓSTICOS FRECUENTES =====
  async getFrequentDiagnoses(limit: number = 10): Promise<ApiResponse<Array<{
    diagnosis: string;
    count: number;
    percentage: number;
  }>>> {
    return apiService.get<Array<{
      diagnosis: string;
      count: number;
      percentage: number;
    }>>(`${this.baseEndpoint}/frequent-diagnoses`, { limit });
  }

  // ===== OBTENER ESTADÍSTICAS POR DIAGNÓSTICO =====
  async getDiagnosisStats(diagnosis: string, period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    total_cases: number;
    age_distribution: Record<string, number>;
    gender_distribution: Record<string, number>;
    treatment_success_rate: number;
    average_recovery_time: number;
  }>> {
    return apiService.get<{
      total_cases: number;
      age_distribution: Record<string, number>;
      gender_distribution: Record<string, number>;
      treatment_success_rate: number;
      average_recovery_time: number;
    }>(`${this.baseEndpoint}/diagnosis-stats/${diagnosis}`, { period });
  }

  // ===== OBTENER REPORTE DE EXPEDIENTES =====
  async getMedicalRecordReport(
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

  // ===== OBTENER HISTORIAL DE CAMBIOS =====
  async getMedicalRecordHistory(recordId: string): Promise<ApiResponse<Array<{
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
    }>>(`${this.baseEndpoint}/${recordId}/history`);
  }

  // ===== DUPLICAR EXPEDIENTE =====
  async duplicateMedicalRecord(recordId: string, newPatientId?: string): Promise<ApiResponse<MedicalRecord>> {
    return apiService.post<MedicalRecord>(`${this.baseEndpoint}/${recordId}/duplicate`, {
      new_patient_id: newPatientId,
    });
  }

  // ===== EXPORTAR EXPEDIENTE =====
  async exportMedicalRecord(recordId: string, format: 'pdf' | 'json' = 'pdf'): Promise<ApiResponse<{ export_url: string }>> {
    return apiService.get<{ export_url: string }>(`${this.baseEndpoint}/${recordId}/export`, { format });
  }
}

// ===== INSTANCIA SINGLETON =====
export const medicalRecordService = new MedicalRecordService();
