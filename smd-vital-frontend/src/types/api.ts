// ========================================
// TIPOS DE API Y RESPUESTAS
// ========================================

// ===== TIPOS DE RESPUESTA DE API =====
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// ===== TIPOS DE ORDENAMIENTO =====
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// ===== TIPOS DE BÚSQUEDA =====
export interface SearchOptions {
  query: string;
  fields: string[];
  filters?: Record<string, any>;
  sort?: SortOptions;
  pagination?: {
    page: number;
    limit: number;
  };
}

// ===== TIPOS DE AUTENTICACIÓN =====
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

// ===== TIPOS DE RESPUESTA PAGINADA =====
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}
