import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User, LoginCredentials, RegisterData, UserRole } from '../types/auth';
import { apiService } from '../services/api';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const response = await apiService.login(credentials);
          
          // Obtener datos del usuario desde el endpoint /me
          const userData = await apiService.getCurrentUser();
          
          const processedUserData = {
            ...userData,
            role: userData.role as UserRole,
            name: userData.first_name && userData.last_name 
              ? `${userData.first_name} ${userData.last_name}`
              : userData.name || userData.email.split('@')[0],
            is_active: userData.is_active || true
          };
          
          console.log('Login successful - User data:', processedUserData);
          
          set({
            user: processedUserData,
            token: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });

          console.log('Register - Sending data:', userData);
          const response = await apiService.register(userData);
          console.log('Register - Response received:', response);
          console.log('Register - Response.user:', response.user);
          
          // El registro siempre devuelve tokens, autenticar automáticamente
          set({
            user: {
              id: response.user.id,
              email: response.user.email,
              first_name: response.user.first_name,
              last_name: response.user.last_name,
              name: `${response.user.first_name} ${response.user.last_name}`,
              phone: userData.phone || '',
              role: response.user.role as UserRole,
              is_active: response.user.is_active,
              email_verified: false,
              two_factor_enabled: false,
              created_at: response.user.created_at,
              updated_at: response.user.updated_at,
            },
            token: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          
          await apiService.logout();
          
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Force logout even if server request fails
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      loadUser: async () => {
        const token = localStorage.getItem('access_token');
        
        console.log('loadUser - Token found:', !!token);
        
        if (!token) {
          console.log('loadUser - No token, setting unauthenticated');
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        try {
          set({ isLoading: true, error: null });
          
          console.log('loadUser - Fetching user data from API...');
          const userData = await apiService.getCurrentUser();
          const refreshToken = localStorage.getItem('refresh_token');

          const processedUserData = {
            ...userData,
            role: userData.role as UserRole,
            name: userData.first_name && userData.last_name 
              ? `${userData.first_name} ${userData.last_name}`
              : userData.name || userData.email.split('@')[0],
            is_active: userData.is_active || true
          };

          console.log('loadUser - User data loaded:', processedUserData);

          set({
            user: processedUserData,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('loadUser - Error loading user:', error);
          // Token might be expired or invalid
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Session expired. Please login again.',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (updatedUser: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...updatedUser },
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'smd-vital-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for better performance
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
export const selectError = (state: AuthStore) => state.error;
export const selectUserRole = (state: AuthStore) => state.user?.role;

// Permission helpers
export const usePermissions = () => {
  const user = useAuthStore(selectUser);

  return {
    canAccessAdminPanel: user?.role === 'admin' || user?.role === 'doctor',
    canCreateMedicalRecords: user?.role === 'doctor' || user?.role === 'nurse' || user?.role === 'admin',
    canProcessPayments: user?.role === 'admin' || user?.role === 'doctor',
    isDoctor: user?.role === 'doctor',
    isNurse: user?.role === 'nurse',
    isAdmin: user?.role === 'admin',
    isPatient: user?.role === 'patient',
    isMedicalStaff: user?.role === 'doctor' || user?.role === 'nurse' || user?.role === 'admin',
  };
};
