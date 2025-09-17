// ========================================
// SERVICIO DE USUARIOS
// ========================================

import { apiService } from './apiService';
import type { 
  User,
  PaginationInfo,
  UserFilters
} from '../types/models';
import type { ApiResponse, SearchOptions } from '../types/api-new';

export class UserService {
  private baseEndpoint = '/users';

  // ===== OBTENER USUARIOS =====
  async getUsers(
    filters?: UserFilters,
    page: number = 1,
    limit: number = 10,
    sort?: { field: string; direction: 'asc' | 'desc' }
  ): Promise<ApiResponse<{ users: User[]; pagination: PaginationInfo }>> {
    const params = {
      page,
      limit,
      ...filters,
      ...(sort && { sort_by: sort.field, sort_order: sort.direction }),
    };

    return apiService.get<{ users: User[]; pagination: PaginationInfo }>(
      this.baseEndpoint,
      params
    );
  }

  // ===== OBTENER USUARIO POR ID =====
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiService.get<User>(`${this.baseEndpoint}/${id}`);
  }

  // ===== CREAR USUARIO =====
  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.post<User>(this.baseEndpoint, userData);
  }

  // ===== ACTUALIZAR USUARIO =====
  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.put<User>(`${this.baseEndpoint}/${id}`, userData);
  }

  // ===== ACTUALIZAR PERFIL DEL USUARIO ACTUAL =====
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.put<User>(`${this.baseEndpoint}/profile`, userData);
  }

  // ===== ELIMINAR USUARIO =====
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // ===== ACTIVAR/DESACTIVAR USUARIO =====
  async toggleUserStatus(id: string, status: 'active' | 'inactive'): Promise<ApiResponse<User>> {
    return apiService.patch<User>(`${this.baseEndpoint}/${id}/status`, { status });
  }

  // ===== BUSCAR USUARIOS =====
  async searchUsers(searchOptions: SearchOptions): Promise<ApiResponse<{ users: User[]; pagination: PaginationInfo }>> {
    return apiService.post<{ users: User[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/search`,
      searchOptions
    );
  }

  // ===== OBTENER ESTADÍSTICAS DE USUARIOS =====
  async getUserStats(): Promise<ApiResponse<{
    total_users: number;
    active_users: number;
    users_by_role: Record<string, number>;
    new_users_this_month: number;
    user_growth_rate: number;
  }>> {
    return apiService.get<{
      total_users: number;
      active_users: number;
      users_by_role: Record<string, number>;
      new_users_this_month: number;
      user_growth_rate: number;
    }>(`${this.baseEndpoint}/stats`);
  }

  // ===== OBTENER USUARIOS POR ROL =====
  async getUsersByRole(role: string): Promise<ApiResponse<User[]>> {
    return apiService.get<User[]>(`${this.baseEndpoint}/role/${role}`);
  }

  // ===== VERIFICAR EMAIL =====
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/verify-email`, { token });
  }

  // ===== REENVIAR EMAIL DE VERIFICACIÓN =====
  async resendVerificationEmail(): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/resend-verification`);
  }

  // ===== CAMBIAR CONTRASEÑA =====
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/change-password`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  // ===== SOLICITAR RESET DE CONTRASEÑA =====
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/request-password-reset`, { email });
  }

  // ===== RESETEAR CONTRASEÑA =====
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/reset-password`, {
      token,
      new_password: newPassword,
    });
  }

  // ===== SUBIR FOTO DE PERFIL =====
  async uploadProfilePicture(file: File): Promise<ApiResponse<{ profile_picture: string }>> {
    return apiService.uploadFile<{ profile_picture: string }>(
      `${this.baseEndpoint}/profile-picture`,
      file
    );
  }

  // ===== ELIMINAR FOTO DE PERFIL =====
  async deleteProfilePicture(): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/profile-picture`);
  }

  // ===== OBTENER HISTORIAL DE ACTIVIDAD =====
  async getUserActivity(userId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<{
    activities: Array<{
      id: string;
      action: string;
      description: string;
      timestamp: string;
      ip_address?: string;
      user_agent?: string;
    }>;
    pagination: PaginationInfo;
  }>> {
    return apiService.get<{
      activities: Array<{
        id: string;
        action: string;
        description: string;
        timestamp: string;
        ip_address?: string;
        user_agent?: string;
      }>;
      pagination: PaginationInfo;
    }>(`${this.baseEndpoint}/${userId}/activity`, { page, limit });
  }
}

// ===== INSTANCIA SINGLETON =====
export const userService = new UserService();
