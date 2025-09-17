// Authentication Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name?: string; // Computed property: first_name + last_name
  phone?: string;
  role: UserRole;
  is_active: boolean;
  email_verified?: boolean;
  two_factor_enabled?: boolean;
  avatar?: string; // Avatar URL
  created_at: string;
  updated_at: string;
  last_login?: string | null;
}

export interface UserProfile extends User {
  address?: string;
  emergency_contact?: string;
  medical_conditions?: string[];
  avatar_url?: string;
}

export type UserRole = 'patient' | 'doctor' | 'nurse' | 'admin' | 'lab_technician';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Role-based permissions
export const ROLE_PERMISSIONS = {
  patient: ['view_own_profile', 'create_appointment', 'view_own_medical_records', 'make_payment'],
  doctor: ['view_all_profiles', 'create_medical_record', 'view_medical_records', 'create_prescription', 'view_appointments'],
  nurse: ['view_profiles', 'record_vital_signs', 'view_medical_records', 'view_appointments'],
  admin: ['manage_users', 'view_all_data', 'manage_system', 'view_reports', 'manage_payments'],
  lab_technician: ['create_lab_results', 'view_lab_data', 'update_lab_status']
} as const;

export type Permission = typeof ROLE_PERMISSIONS[UserRole][number];

// API Error types
export interface ApiError {
  success: boolean;
  message: string;
  error_code?: string;
  details?: Record<string, any>;
}

export interface ValidationError {
  success: boolean;
  message: string;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}
