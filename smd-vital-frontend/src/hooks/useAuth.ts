import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import type { LoginCredentials, RegisterData, UserRole } from '../types/auth';

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    loadUser,
    clearError,
    updateUser,
  } = useAuthStore();

  // Load user on mount if token exists
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      loadUser();
    }
  }, [isAuthenticated, isLoading, loadUser]);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      
      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      // Error is already handled in the store
      throw error;
    }
  };

  const handleRegister = async (userData: RegisterData) => {
    try {
      await register(userData);
      
      // Redirect to dashboard after successful registration
      navigate('/dashboard', { replace: true });
    } catch (error) {
      // Error is already handled in the store
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      // Even if logout fails, redirect to login
      navigate('/login', { replace: true });
    }
  };

  // Role checking functions
  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.some(role => role === user.role) : false;
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
    updateUser,
    
    // Role functions
    hasRole,
    hasAnyRole,
    
    // Computed values
    userRole: user?.role,
    userName: user ? `${user.first_name} ${user.last_name}` : null,
    userEmail: user?.email,
    isEmailVerified: user?.email_verified,
    is2FAEnabled: user?.two_factor_enabled,
  };
};

// Hook for protecting routes
export const useRequireAuth = (allowedRoles?: UserRole[]) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login with return URL
        navigate('/login', { 
          state: { from: location },
          replace: true 
        });
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // User doesn't have required role
        navigate('/unauthorized', { replace: true });
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, navigate, location]);

  return {
    isAuthenticated,
    isLoading,
    user,
    hasAccess: !allowedRoles || (user && allowedRoles.includes(user.role)),
  };
};

// Hook for checking permissions
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.some(role => role === user.role) : false;
  };

  return {
    hasRole,
    hasAnyRole,
    
    // Specific role checks
    isPatient: hasRole(['patient']),
    isDoctor: hasRole(['doctor']),
    isNurse: hasRole(['nurse']),
    isAdmin: hasRole(['admin']),
    isLabTechnician: hasRole(['lab_technician']),
    
    // Combined role checks
    isMedicalStaff: hasAnyRole(['doctor', 'nurse', 'lab_technician']),
    isStaff: hasAnyRole(['doctor', 'nurse', 'admin', 'lab_technician']),
    
    // Permission checks (legacy - mantener compatibilidad)
    canCreateMedicalRecords: hasAnyRole(['doctor', 'nurse']),
    canViewAllPatients: hasAnyRole(['doctor', 'nurse', 'admin']),
    canProcessPayments: hasAnyRole(['admin', 'doctor']),
    canManageUsers: hasRole(['admin']),
    canAccessReports: hasAnyRole(['admin', 'doctor']),
    canSendNotifications: hasAnyRole(['admin', 'doctor', 'nurse']),
  };
};

// Hook for conditional rendering based on roles
export const useRoleBasedAccess = () => {
  const permissions = usePermissions();
  
  const RoleGuard = ({ 
    roles, 
    children, 
    fallback = null 
  }: { 
    roles: UserRole[]; 
    children: React.ReactNode; 
    fallback?: React.ReactNode;
  }) => {
    const hasAccess = permissions.hasAnyRole(roles);
    return hasAccess ? children : fallback;
  };

  return {
    ...permissions,
    RoleGuard,
  };
};
