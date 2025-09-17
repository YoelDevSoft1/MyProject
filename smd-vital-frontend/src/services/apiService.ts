// ========================================
// SERVICIO API BASE - CONFIGURACIÓN CENTRAL
// ========================================

// Importar tipos de API desde el archivo dedicado
import type { 
  ApiResponse, 
  PaginationInfo,
  SearchOptions
} from '../types/api';

// Importar modelos de datos desde models.ts
import type { 
  User, 
  Appointment, 
  MedicalRecord, 
  Prescription, 
  Payment, 
  Notification, 
  SystemAlert, 
  MedicalTemplate, 
  DashboardStats, 
  Report,
  AppointmentFilters,
  MedicalRecordFilters,
  UserFilters
} from '../types/models';

// ===== CONFIGURACIÓN DE LA API =====
const API_BASE_URL = 'http://localhost:8001'; // Direct connection to auth service for development
const API_VERSION = ''; // Removed v1 to match nginx routing
const API_URL = `${API_BASE_URL}`;

// ===== INTERCEPTOR DE AUTENTICACIÓN =====
class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseURL = API_URL;
    this.loadTokens();
  }

  private loadTokens() {
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokens(accessToken: string, refreshToken: string) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  public clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  public getToken(): string | null {
    return this.token;
  }

  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  public setToken(token: string): void {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  public setRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
    localStorage.setItem('refresh_token', refreshToken);
  }

  public isAuthenticated(): boolean {
    return !!(this.token && this.refreshToken);
  }

  public handleApiError(error: any): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          const retryResponse = await fetch(response.url, {
            method: response.url.includes('refresh') ? 'POST' : 'GET',
            headers: this.getHeaders(),
            body: response.url.includes('refresh') ? JSON.stringify({ refresh_token: this.refreshToken }) : undefined,
          });
          return this.handleResponse(retryResponse);
        } else {
          this.clearTokens();
          window.location.href = '/login';
          throw new Error('Sesión expirada');
        }
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error - Status:', response.status);
      console.error('API Error - Response:', errorData);
      console.error('API Error - URL:', response.url);
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Si la respuesta ya tiene la estructura ApiResponse, devolverla tal como está
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return data as ApiResponse<T>;
    }
    
    // Si la respuesta es directa del backend, envolverla en la estructura ApiResponse
    return {
      success: true,
      data: data as T,
      message: data.message || 'Success'
    };
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.saveTokens(data.access_token, data.refresh_token);
        return true;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }

    return false;
  }

  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  public async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    console.log('API POST - URL:', `${this.baseURL}${endpoint}`);
    console.log('API POST - Data:', data);
    console.log('API POST - Headers:', this.getHeaders());
    console.log('API POST - Body:', data ? JSON.stringify(data) : undefined);
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    console.log('API POST - Response status:', response.status);
    console.log('API POST - Response headers:', Object.fromEntries(response.headers.entries()));

    return this.handleResponse<T>(response);
  }

  public async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  public async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    // Crear headers sin Content-Type para FormData
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    // No incluimos Content-Type - el navegador lo asigna automáticamente para FormData

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  async downloadFile(endpoint: string, filename?: string): Promise<void> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error downloading file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const apiService = new ApiService();

export { API_BASE_URL, API_URL };
