import { apiService } from './api';
import type { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  User
} from '../types/auth';
import type { ApiResponse } from '../types/api-new';

export class AuthService {
  private baseUrl = ''; // Direct connection to auth service

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<any>(`${this.baseUrl}/login`, credentials);
      
      // Store tokens after successful login
      apiService.setToken(response.access_token);
      apiService.setRefreshToken(response.refresh_token);
      
      // Transform response to match AuthResponse interface
      return {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_type: response.token_type || 'bearer',
        expires_in: 3600, // Default 1 hour
        user_id: response.user.id,
        email: response.user.email,
        role: response.user.role
      };
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<any>(`${this.baseUrl}/register`, userData);
      
      // Store tokens after successful registration
      apiService.setToken(response.access_token);
      apiService.setRefreshToken(response.refresh_token);
      
      // Transform response to match AuthResponse interface
      return {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_type: response.token_type || 'bearer',
        expires_in: 3600, // Default 1 hour
        user_id: response.user.id,
        email: response.user.email,
        role: response.user.role
      };
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post<ApiResponse<void>>(`${this.baseUrl}/logout`);
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      console.error('Logout error:', error);
    } finally {
      apiService.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get<User>(`${this.baseUrl}/me`);
      return response;
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse>(`${this.baseUrl}/refresh`);
      
      // Update stored tokens
      apiService.setToken(response.access_token);
      apiService.setRefreshToken(response.refresh_token);
      
      return response;
    } catch (error) {
      // If refresh fails, clear tokens and redirect to login
      apiService.clearTokens();
      throw new Error(apiService.handleApiError(error));
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<ApiResponse<void>>(`${this.baseUrl}/change-password`, {
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<ApiResponse<void>>(`${this.baseUrl}/request-password-reset`, {
        email,
      });
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<ApiResponse<void>>(`${this.baseUrl}/reset-password`, {
        token,
        new_password: newPassword,
      });
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<ApiResponse<void>>(`${this.baseUrl}/verify-email`, {
        token,
      });
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async resendVerificationEmail(): Promise<ApiResponse<void>> {
    try {
      return await apiService.post<ApiResponse<void>>(`${this.baseUrl}/resend-verification`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async enable2FA(): Promise<{ qr_code: string; secret: string }> {
    try {
      return await apiService.post(`${this.baseUrl}/2fa/enable`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async verify2FA(code: string): Promise<ApiResponse> {
    try {
      return await apiService.post<ApiResponse>(`${this.baseUrl}/2fa/verify`, {
        code,
      });
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async disable2FA(code: string): Promise<ApiResponse> {
    try {
      return await apiService.post<ApiResponse>(`${this.baseUrl}/2fa/disable`, {
        code,
      });
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    return apiService.isAuthenticated();
  }

  getToken(): string | null {
    return apiService.getToken();
  }

  getRefreshToken(): string | null {
    return apiService.getRefreshToken();
  }

  clearSession(): void {
    apiService.clearTokens();
  }

  // Role and permission helpers
  hasRole(user: User | null, roles: string[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
  }

  isDoctor(user: User | null): boolean {
    return this.hasRole(user, ['doctor']);
  }

  isNurse(user: User | null): boolean {
    return this.hasRole(user, ['nurse']);
  }

  isAdmin(user: User | null): boolean {
    return this.hasRole(user, ['admin']);
  }

  isPatient(user: User | null): boolean {
    return this.hasRole(user, ['patient']);
  }

  isMedicalStaff(user: User | null): boolean {
    return this.hasRole(user, ['doctor', 'nurse', 'lab_technician']);
  }

  canAccessAdminPanel(user: User | null): boolean {
    return this.hasRole(user, ['admin', 'doctor']);
  }

  canCreateMedicalRecords(user: User | null): boolean {
    return this.hasRole(user, ['doctor', 'nurse']);
  }

  canProcessPayments(user: User | null): boolean {
    return this.hasRole(user, ['admin', 'doctor']);
  }
}

// Export singleton instance
export const authService = new AuthService();
