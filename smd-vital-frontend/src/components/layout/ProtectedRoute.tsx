import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  fallbackPath = '/unauthorized',
}) => {
  // Fast Refresh compatible - no hooks exported
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especificaron roles y el usuario no tiene ninguno de ellos
  if (allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Si pasa todas las validaciones, renderizar el contenido
  // Priorizar children si se proporcionan, sino usar Outlet
  return children ? <>{children}</> : <Outlet />;
};
