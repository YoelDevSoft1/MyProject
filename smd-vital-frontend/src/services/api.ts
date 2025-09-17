// ========================================
// SERVICIO DE COMPATIBILIDAD - SIMPLIFICADO
// ========================================

import { apiService as newApiService } from './apiService';
import type { User, UserRole } from '../types/models';

// ===== INTERFACES DE COMPATIBILIDAD =====
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}

// ===== CLASE DE COMPATIBILIDAD =====
export class ApiService {
  // Métodos de autenticación
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await newApiService.post<LoginResponse>('/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await newApiService.post<LoginResponse>('/register', userData);
    return response.data;
  }

  async logout(): Promise<void> {
    await newApiService.post<void>('/logout');
  }

  async refreshToken(): Promise<LoginResponse> {
    const response = await newApiService.post<LoginResponse>('/refresh', {
      refresh_token: localStorage.getItem('refresh_token')
    });
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await newApiService.get<User>('/me');
    return response.data;
  }

  // Métodos para registros médicos
  async getMedicalRecords(): Promise<any[]> {
    const response = await newApiService.get<{ medical_records: any[] }>('/medical-records');
    return response.data.medical_records;
  }

  async createMedicalRecord(record: any): Promise<any> {
    const response = await newApiService.post<any>('/medical-records', record);
    return response.data;
  }

  async updateMedicalRecord(id: string, record: any): Promise<any> {
    const response = await newApiService.put<any>(`/medical-records/${id}`, record);
    return response.data;
  }

  async deleteMedicalRecord(id: string): Promise<void> {
    await newApiService.delete<void>(`/medical-records/${id}`);
  }

  // Métodos para citas
  async getAppointments(): Promise<any[]> {
    const response = await newApiService.get<{ appointments: any[] }>('/appointments');
    return response.data.appointments;
  }

  async createAppointment(appointment: any): Promise<any> {
    const response = await newApiService.post<any>('/appointments', appointment);
    return response.data;
  }

  // Métodos para pagos
  async getPayments(): Promise<any[]> {
    const response = await newApiService.get<{ payments: any[] }>('/payments');
    return response.data.payments;
  }

  async createPayment(payment: any): Promise<any> {
    const response = await newApiService.post<any>('/payments', payment);
    return response.data;
  }

  // Métodos para notificaciones
  async getNotifications(): Promise<any[]> {
    const response = await newApiService.get<{ notifications: any[] }>('/notifications');
    return response.data.notifications;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await newApiService.patch<void>(`/notifications/${id}/read`);
  }

  // Métodos para usuarios (admin)
  async getUsers(): Promise<User[]> {
    const response = await newApiService.get<{ users: User[] }>('/users');
    return response.data.users;
  }

  async createUser(user: RegisterRequest): Promise<User> {
    const response = await newApiService.post<User>('/users', user);
    return response.data;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const response = await newApiService.put<User>(`/users/${id}`, user);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await newApiService.delete<void>(`/users/${id}`);
  }

  // Métodos de utilidad
  isAuthenticated(): boolean {
    return !!newApiService.getToken();
  }

  getToken(): string | null {
    return newApiService.getToken();
  }

  getRefreshToken(): string | null {
    return newApiService.getRefreshToken();
  }

  clearTokens() {
    newApiService.clearTokens();
  }

  handleApiError(error: any): string {
    return newApiService.handleApiError(error);
  }
}

// ===== EXPORTACIONES =====
export { API_BASE_URL, API_URL } from './apiService';
export type { ApiResponse, PaginationInfo } from '../types/api';
export type { User, UserRole } from '../types/models';

// Instancia singleton del servicio de compatibilidad
export const apiService = new ApiService();
