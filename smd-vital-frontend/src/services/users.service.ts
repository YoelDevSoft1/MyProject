import { apiService } from './api';
import type { User, UserProfile } from '../types/auth';
import type { PaginatedResponse } from '../types/api';

export class UsersService {
  private baseUrl = '/api/users';

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<User>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.role) queryParams.append('role', params.role);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      return await apiService.get<PaginatedResponse<User>>(url);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async getUser(id: string): Promise<User> {
    try {
      return await apiService.get<User>(`${this.baseUrl}/${id}`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async getUserProfile(id: string): Promise<UserProfile> {
    try {
      return await apiService.get<UserProfile>(`${this.baseUrl}/${id}/profile`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async updateUserProfile(id: string, data: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string;
    emergency_contact?: string;
    medical_conditions?: string[];
    avatar_url?: string;
  }): Promise<UserProfile> {
    try {
      return await apiService.put<UserProfile>(`${this.baseUrl}/${id}/profile`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async updateUser(id: string, data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    role?: string;
    is_active?: boolean;
  }): Promise<User> {
    try {
      return await apiService.put<User>(`${this.baseUrl}/${id}`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async deactivateUser(id: string): Promise<User> {
    try {
      return await apiService.patch<User>(`${this.baseUrl}/${id}/deactivate`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async activateUser(id: string): Promise<User> {
    try {
      return await apiService.patch<User>(`${this.baseUrl}/${id}/activate`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async changePassword(id: string, data: {
    current_password: string;
    new_password: string;
  }): Promise<void> {
    try {
      await apiService.post(`${this.baseUrl}/${id}/change-password`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    try {
      await apiService.post(`${this.baseUrl}/${id}/reset-password`, {
        new_password: newPassword,
      });
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async uploadAvatar(id: string, file: File): Promise<{ avatar_url: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      return await apiService.post<{ avatar_url: string }>(
        `${this.baseUrl}/${id}/avatar`,
        formData
      );
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async deleteAvatar(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/${id}/avatar`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // User Statistics
  async getUserStats(): Promise<{
    total_users: number;
    active_users: number;
    users_by_role: Record<string, number>;
    new_users_this_month: number;
    users_by_status: Record<string, number>;
  }> {
    try {
      return await apiService.get(`${this.baseUrl}/stats`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Search Users
  async searchUsers(query: string, role?: string): Promise<User[]> {
    try {
      const params = new URLSearchParams({ q: query });
      if (role) params.append('role', role);
      
      return await apiService.get<User[]>(`${this.baseUrl}/search?${params.toString()}`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Bulk Operations
  async bulkUpdateUsers(userIds: string[], data: {
    is_active?: boolean;
    role?: string;
  }): Promise<{ updated: number; failed: number }> {
    try {
      return await apiService.post<{ updated: number; failed: number }>(
        `${this.baseUrl}/bulk-update`,
        { user_ids: userIds, ...data }
      );
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async bulkDeleteUsers(userIds: string[]): Promise<{ deleted: number; failed: number }> {
    try {
      return await apiService.post<{ deleted: number; failed: number }>(
        `${this.baseUrl}/bulk-delete`,
        { user_ids: userIds }
      );
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }
}

export const usersService = new UsersService();
