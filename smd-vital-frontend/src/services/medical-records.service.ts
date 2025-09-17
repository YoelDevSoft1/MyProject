import { apiService } from './api';
import type { 
  MedicalRecord, 
  Prescription, 
  VitalSigns, 
  PaginatedResponse 
} from '../types/api';

export class MedicalRecordsService {
  private baseUrl = '/api/medical-records';

  async getMedicalRecords(params?: {
    page?: number;
    limit?: number;
    patient_id?: string;
    doctor_id?: string;
  }): Promise<PaginatedResponse<MedicalRecord>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.patient_id) queryParams.append('patient_id', params.patient_id);
      if (params?.doctor_id) queryParams.append('doctor_id', params.doctor_id);

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      return await apiService.get<PaginatedResponse<MedicalRecord>>(url);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async getMedicalRecord(id: string): Promise<MedicalRecord> {
    try {
      return await apiService.get<MedicalRecord>(`${this.baseUrl}/${id}`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async createMedicalRecord(data: {
    patient_id: string;
    appointment_id?: string;
    chief_complaint: string;
    present_illness?: string;
    physical_examination?: string;
    assessment: string;
    plan: string;
  }): Promise<MedicalRecord> {
    try {
      return await apiService.post<MedicalRecord>(this.baseUrl, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async updateMedicalRecord(id: string, data: Partial<MedicalRecord>): Promise<MedicalRecord> {
    try {
      return await apiService.put<MedicalRecord>(`${this.baseUrl}/${id}`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Prescriptions
  async getPrescriptions(params?: {
    page?: number;
    limit?: number;
    patient_id?: string;
    doctor_id?: string;
    status?: string;
  }): Promise<PaginatedResponse<Prescription>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.patient_id) queryParams.append('patient_id', params.patient_id);
      if (params?.doctor_id) queryParams.append('doctor_id', params.doctor_id);
      if (params?.status) queryParams.append('status', params.status);

      const url = `${this.baseUrl}/prescriptions?${queryParams.toString()}`;
      return await apiService.get<PaginatedResponse<Prescription>>(url);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async createPrescription(data: {
    patient_id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }): Promise<Prescription> {
    try {
      return await apiService.post<Prescription>(`${this.baseUrl}/prescriptions`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async updatePrescription(id: string, data: Partial<Prescription>): Promise<Prescription> {
    try {
      return await apiService.put<Prescription>(`${this.baseUrl}/prescriptions/${id}`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Vital Signs
  async getVitalSigns(params?: {
    page?: number;
    limit?: number;
    patient_id?: string;
    appointment_id?: string;
  }): Promise<PaginatedResponse<VitalSigns>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.patient_id) queryParams.append('patient_id', params.patient_id);
      if (params?.appointment_id) queryParams.append('appointment_id', params.appointment_id);

      const url = `${this.baseUrl}/vital-signs?${queryParams.toString()}`;
      return await apiService.get<PaginatedResponse<VitalSigns>>(url);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async createVitalSigns(data: {
    patient_id: string;
    appointment_id?: string;
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    heart_rate?: number;
    temperature?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
    weight?: number;
    height?: number;
  }): Promise<VitalSigns> {
    try {
      return await apiService.post<VitalSigns>(`${this.baseUrl}/vital-signs`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async updateVitalSigns(id: string, data: Partial<VitalSigns>): Promise<VitalSigns> {
    try {
      return await apiService.put<VitalSigns>(`${this.baseUrl}/vital-signs/${id}`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }
}

export const medicalRecordsService = new MedicalRecordsService();
