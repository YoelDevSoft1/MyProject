import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRolePermissions } from '../../hooks/useRolePermissions';
import { UserRole } from '../../utils/rolePermissions';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
  requireAllPermissions?: string[];
  requireAnyPermissions?: string[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/unauthorized',
  requireAllPermissions = [],
  requireAnyPermissions = [],
}) => {
  const { 
    userRole, 
    hasPermission, 
    hasAllPermissions, 
    hasAnyPermission 
  } = useRolePermissions();

  // Verificar si el usuario tiene uno de los roles permitidos
  const hasAllowedRole = userRole && allowedRoles.includes(userRole);

  // Verificar permisos específicos si se requieren
  const hasRequiredPermissions = 
    (requireAllPermissions.length === 0 || hasAllPermissions(requireAllPermissions)) &&
    (requireAnyPermissions.length === 0 || hasAnyPermission(requireAnyPermissions));

  // Si no tiene el rol permitido o no cumple con los permisos, redirigir
  if (!hasAllowedRole || !hasRequiredPermissions) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Si pasa todas las validaciones, renderizar el contenido
  return <>{children}</>;
};

// Guards específicos para cada rol
export const PatientGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard allowedRoles={['patient']} fallbackPath="/unauthorized">
    {children}
  </RoleGuard>
);

export const DoctorGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard allowedRoles={['doctor']} fallbackPath="/unauthorized">
    {children}
  </RoleGuard>
);

export const NurseGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard allowedRoles={['nurse']} fallbackPath="/unauthorized">
    {children}
  </RoleGuard>
);

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard allowedRoles={['admin']} fallbackPath="/unauthorized">
    {children}
  </RoleGuard>
);

export const MedicalStaffGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard allowedRoles={['doctor', 'nurse']} fallbackPath="/unauthorized">
    {children}
  </RoleGuard>
);

export const StaffGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard allowedRoles={['doctor', 'nurse', 'admin']} fallbackPath="/unauthorized">
    {children}
  </RoleGuard>
);

// Guard para funcionalidades de IA médica
export const AIGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard 
    allowedRoles={['doctor', 'nurse', 'admin']} 
    requireAnyPermissions={['view_ai_tools']}
    fallbackPath="/unauthorized"
  >
    {children}
  </RoleGuard>
);

// Guard para administración
export const AdminPanelGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleGuard 
    allowedRoles={['admin']} 
    requireAnyPermissions={['view_admin_panel']}
    fallbackPath="/unauthorized"
  >
    {children}
  </RoleGuard>
);
