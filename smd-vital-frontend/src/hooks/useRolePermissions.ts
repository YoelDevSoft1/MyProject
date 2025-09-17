import { useAuth } from './useAuth';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  getFilteredNavigation,
  canAccessRoute,
  PERMISSIONS,
  type UserRole 
} from '../utils/rolePermissions';

// Hook para el nuevo sistema de permisos robusto
export const useRolePermissions = () => {
  const { user } = useAuth();

  const userRole = user?.role as UserRole;

  return {
    // Verificación de permisos individuales
    hasPermission: (permission: string) => userRole ? hasPermission(userRole, permission) : false,
    
    // Verificación de múltiples permisos (OR)
    hasAnyPermission: (permissions: string[]) => userRole ? hasAnyPermission(userRole, permissions) : false,
    
    // Verificación de múltiples permisos (AND)
    hasAllPermissions: (permissions: string[]) => userRole ? hasAllPermissions(userRole, permissions) : false,
    
    // Navegación filtrada por permisos
    getNavigation: () => userRole ? getFilteredNavigation(userRole) : [],
    
    // Verificación de acceso a rutas
    canAccessRoute: (route: string) => userRole ? canAccessRoute(userRole, route) : false,
    
    // Permisos específicos para componentes
    canViewDashboard: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_DASHBOARD) : false,
    canViewMedicalDashboard: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_MEDICAL_DASHBOARD) : false,
    canViewAdminDashboard: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_ADMIN_DASHBOARD) : false,
    
    canViewAppointments: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_APPOINTMENTS) : false,
    canCreateAppointments: userRole ? hasPermission(userRole, PERMISSIONS.CREATE_APPOINTMENTS) : false,
    canEditAppointments: userRole ? hasPermission(userRole, PERMISSIONS.EDIT_APPOINTMENTS) : false,
    canViewAllAppointments: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_ALL_APPOINTMENTS) : false,
    
    canViewMedicalRecords: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_MEDICAL_RECORDS) : false,
    canCreateMedicalRecords: userRole ? hasPermission(userRole, PERMISSIONS.CREATE_MEDICAL_RECORDS) : false,
    canEditMedicalRecords: userRole ? hasPermission(userRole, PERMISSIONS.EDIT_MEDICAL_RECORDS) : false,
    canViewAllMedicalRecords: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_ALL_MEDICAL_RECORDS) : false,
    
    canViewMedicalAdvanced: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_MEDICAL_ADVANCED) : false,
    canCreatePrescriptions: userRole ? hasPermission(userRole, PERMISSIONS.CREATE_PRESCRIPTIONS) : false,
    canViewPrescriptions: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_PRESCRIPTIONS) : false,
    canManageTemplates: userRole ? hasPermission(userRole, PERMISSIONS.MANAGE_TEMPLATES) : false,
    
    canViewAITools: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_AI_TOOLS) : false,
    canUseSymptomAnalyzer: userRole ? hasPermission(userRole, PERMISSIONS.USE_SYMPTOM_ANALYZER) : false,
    canUseImageAnalysis: userRole ? hasPermission(userRole, PERMISSIONS.USE_IMAGE_ANALYSIS) : false,
    canUseAIRecommendations: userRole ? hasPermission(userRole, PERMISSIONS.USE_AI_RECOMMENDATIONS) : false,
    
    canViewPayments: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_PAYMENTS) : false,
    canProcessPayments: userRole ? hasPermission(userRole, PERMISSIONS.PROCESS_PAYMENTS) : false,
    canViewAllPayments: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_ALL_PAYMENTS) : false,
    
    canViewNotifications: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_NOTIFICATIONS) : false,
    canSendNotifications: userRole ? hasPermission(userRole, PERMISSIONS.SEND_NOTIFICATIONS) : false,
    canManageNotifications: userRole ? hasPermission(userRole, PERMISSIONS.MANAGE_NOTIFICATIONS) : false,
    
    canViewAdminPanel: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_ADMIN_PANEL) : false,
    canManageUsers: userRole ? hasPermission(userRole, PERMISSIONS.MANAGE_USERS) : false,
    canViewReports: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_REPORTS) : false,
    canManageSystem: userRole ? hasPermission(userRole, PERMISSIONS.MANAGE_SYSTEM) : false,
    
    canViewProfile: userRole ? hasPermission(userRole, PERMISSIONS.VIEW_PROFILE) : false,
    canEditOwnProfile: userRole ? hasPermission(userRole, PERMISSIONS.EDIT_OWN_PROFILE) : false,
    canEditOtherProfiles: userRole ? hasPermission(userRole, PERMISSIONS.EDIT_OTHER_PROFILES) : false,
    
    // Información del usuario
    userRole,
    isPatient: userRole === 'patient',
    isDoctor: userRole === 'doctor',
    isNurse: userRole === 'nurse',
    isAdmin: userRole === 'admin',
    isLabTechnician: userRole === 'lab_technician',
    isMedicalStaff: userRole ? ['doctor', 'nurse', 'lab_technician'].includes(userRole) : false,
    isStaff: userRole ? ['doctor', 'nurse', 'admin', 'lab_technician'].includes(userRole) : false,
  };
};
