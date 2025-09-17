// Sistema de permisos robusto y específico para cada rol
export const UserRole = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  ADMIN: 'admin',
  LAB_TECHNICIAN: 'lab_technician'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// Permisos específicos por funcionalidad
export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_MEDICAL_DASHBOARD: 'view_medical_dashboard',
  VIEW_ADMIN_DASHBOARD: 'view_admin_dashboard',
  
  // Citas
  VIEW_APPOINTMENTS: 'view_appointments',
  CREATE_APPOINTMENTS: 'create_appointments',
  EDIT_APPOINTMENTS: 'edit_appointments',
  DELETE_APPOINTMENTS: 'delete_appointments',
  VIEW_ALL_APPOINTMENTS: 'view_all_appointments',
  
  // Expedientes Médicos
  VIEW_MEDICAL_RECORDS: 'view_medical_records',
  CREATE_MEDICAL_RECORDS: 'create_medical_records',
  EDIT_MEDICAL_RECORDS: 'edit_medical_records',
  DELETE_MEDICAL_RECORDS: 'delete_medical_records',
  VIEW_ALL_MEDICAL_RECORDS: 'view_all_medical_records',
  
  // Funcionalidades Avanzadas
  VIEW_MEDICAL_ADVANCED: 'view_medical_advanced',
  CREATE_PRESCRIPTIONS: 'create_prescriptions',
  VIEW_PRESCRIPTIONS: 'view_prescriptions',
  MANAGE_TEMPLATES: 'manage_templates',
  
  // IA Médica
  VIEW_AI_TOOLS: 'view_ai_tools',
  USE_SYMPTOM_ANALYZER: 'use_symptom_analyzer',
  USE_IMAGE_ANALYSIS: 'use_image_analysis',
  USE_AI_RECOMMENDATIONS: 'use_ai_recommendations',
  
  // Pagos
  VIEW_PAYMENTS: 'view_payments',
  PROCESS_PAYMENTS: 'process_payments',
  VIEW_ALL_PAYMENTS: 'view_all_payments',
  
  // Notificaciones
  VIEW_NOTIFICATIONS: 'view_notifications',
  SEND_NOTIFICATIONS: 'send_notifications',
  MANAGE_NOTIFICATIONS: 'manage_notifications',
  
  // Administración
  VIEW_ADMIN_PANEL: 'view_admin_panel',
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',
  MANAGE_SYSTEM: 'manage_system',
  
  // Perfil
  VIEW_PROFILE: 'view_profile',
  EDIT_OWN_PROFILE: 'edit_own_profile',
  EDIT_OTHER_PROFILES: 'edit_other_profiles',
} as const;

// Mapeo de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  patient: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],
  
  doctor: [
    PERMISSIONS.VIEW_MEDICAL_DASHBOARD,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.EDIT_APPOINTMENTS,
    PERMISSIONS.VIEW_ALL_APPOINTMENTS,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
    PERMISSIONS.CREATE_MEDICAL_RECORDS,
    PERMISSIONS.EDIT_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_ALL_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_MEDICAL_ADVANCED,
    PERMISSIONS.CREATE_PRESCRIPTIONS,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
    PERMISSIONS.MANAGE_TEMPLATES,
    PERMISSIONS.VIEW_AI_TOOLS,
    PERMISSIONS.USE_SYMPTOM_ANALYZER,
    PERMISSIONS.USE_IMAGE_ANALYSIS,
    PERMISSIONS.USE_AI_RECOMMENDATIONS,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.PROCESS_PAYMENTS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.SEND_NOTIFICATIONS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],
  
  nurse: [
    PERMISSIONS.VIEW_MEDICAL_DASHBOARD,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.EDIT_APPOINTMENTS,
    PERMISSIONS.VIEW_ALL_APPOINTMENTS,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
    PERMISSIONS.EDIT_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_ALL_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_MEDICAL_ADVANCED,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
    PERMISSIONS.VIEW_AI_TOOLS,
    PERMISSIONS.USE_SYMPTOM_ANALYZER,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.SEND_NOTIFICATIONS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],
  
  admin: [
    PERMISSIONS.VIEW_ADMIN_DASHBOARD,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.CREATE_APPOINTMENTS,
    PERMISSIONS.EDIT_APPOINTMENTS,
    PERMISSIONS.DELETE_APPOINTMENTS,
    PERMISSIONS.VIEW_ALL_APPOINTMENTS,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
    PERMISSIONS.CREATE_MEDICAL_RECORDS,
    PERMISSIONS.EDIT_MEDICAL_RECORDS,
    PERMISSIONS.DELETE_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_ALL_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_MEDICAL_ADVANCED,
    PERMISSIONS.CREATE_PRESCRIPTIONS,
    PERMISSIONS.VIEW_PRESCRIPTIONS,
    PERMISSIONS.MANAGE_TEMPLATES,
    PERMISSIONS.VIEW_AI_TOOLS,
    PERMISSIONS.USE_SYMPTOM_ANALYZER,
    PERMISSIONS.USE_IMAGE_ANALYSIS,
    PERMISSIONS.USE_AI_RECOMMENDATIONS,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.PROCESS_PAYMENTS,
    PERMISSIONS.VIEW_ALL_PAYMENTS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.SEND_NOTIFICATIONS,
    PERMISSIONS.MANAGE_NOTIFICATIONS,
    PERMISSIONS.VIEW_ADMIN_PANEL,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_SYSTEM,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.EDIT_OTHER_PROFILES,
  ],
  
  lab_technician: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.VIEW_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_ALL_MEDICAL_RECORDS,
    PERMISSIONS.VIEW_AI_TOOLS,
    PERMISSIONS.USE_IMAGE_ANALYSIS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],
};

// Navegación específica por rol
export const ROLE_NAVIGATION: Record<UserRole, Array<{
  name: string;
  href: string;
  icon: string;
  permissions: string[];
}>> = {
  patient: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', permissions: [PERMISSIONS.VIEW_DASHBOARD] },
    { name: 'Mis Citas', href: '/appointments', icon: '📅', permissions: [PERMISSIONS.VIEW_APPOINTMENTS] },
    { name: 'Mi Perfil', href: '/profile', icon: '👤', permissions: [PERMISSIONS.VIEW_PROFILE] },
    { name: 'Mis Pagos', href: '/payments', icon: '💳', permissions: [PERMISSIONS.VIEW_PAYMENTS] },
    { name: 'Notificaciones', href: '/notifications', icon: '🔔', permissions: [PERMISSIONS.VIEW_NOTIFICATIONS] },
  ],
  
  doctor: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', permissions: [PERMISSIONS.VIEW_MEDICAL_DASHBOARD] },
    { name: 'Citas', href: '/appointments', icon: '📅', permissions: [PERMISSIONS.VIEW_APPOINTMENTS] },
    { name: 'Expedientes', href: '/medical-records', icon: '📋', permissions: [PERMISSIONS.VIEW_MEDICAL_RECORDS] },
    { name: 'Funcionalidades Avanzadas', href: '/medical-advanced', icon: '🩺', permissions: [PERMISSIONS.VIEW_MEDICAL_ADVANCED] },
    { name: 'IA Médica', href: '/ai', icon: '🤖', permissions: [PERMISSIONS.VIEW_AI_TOOLS] },
    { name: 'Pagos', href: '/payments', icon: '💳', permissions: [PERMISSIONS.VIEW_PAYMENTS] },
    { name: 'Notificaciones', href: '/notifications', icon: '🔔', permissions: [PERMISSIONS.VIEW_NOTIFICATIONS] },
    { name: 'Perfil', href: '/profile', icon: '👤', permissions: [PERMISSIONS.VIEW_PROFILE] },
  ],
  
  nurse: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', permissions: [PERMISSIONS.VIEW_MEDICAL_DASHBOARD] },
    { name: 'Citas', href: '/appointments', icon: '📅', permissions: [PERMISSIONS.VIEW_APPOINTMENTS] },
    { name: 'Expedientes', href: '/medical-records', icon: '📋', permissions: [PERMISSIONS.VIEW_MEDICAL_RECORDS] },
    { name: 'Funcionalidades Avanzadas', href: '/medical-advanced', icon: '🩺', permissions: [PERMISSIONS.VIEW_MEDICAL_ADVANCED] },
    { name: 'IA Médica', href: '/ai', icon: '🤖', permissions: [PERMISSIONS.VIEW_AI_TOOLS] },
    { name: 'Notificaciones', href: '/notifications', icon: '🔔', permissions: [PERMISSIONS.VIEW_NOTIFICATIONS] },
    { name: 'Perfil', href: '/profile', icon: '👤', permissions: [PERMISSIONS.VIEW_PROFILE] },
  ],
  
  admin: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', permissions: [PERMISSIONS.VIEW_ADMIN_DASHBOARD] },
    { name: 'Citas', href: '/appointments', icon: '📅', permissions: [PERMISSIONS.VIEW_APPOINTMENTS] },
    { name: 'Expedientes', href: '/medical-records', icon: '📋', permissions: [PERMISSIONS.VIEW_MEDICAL_RECORDS] },
    { name: 'Funcionalidades Avanzadas', href: '/medical-advanced', icon: '🩺', permissions: [PERMISSIONS.VIEW_MEDICAL_ADVANCED] },
    { name: 'IA Médica', href: '/ai', icon: '🤖', permissions: [PERMISSIONS.VIEW_AI_TOOLS] },
    { name: 'Pagos', href: '/payments', icon: '💳', permissions: [PERMISSIONS.VIEW_PAYMENTS] },
    { name: 'Notificaciones', href: '/notifications', icon: '🔔', permissions: [PERMISSIONS.VIEW_NOTIFICATIONS] },
    { name: 'Administración', href: '/admin', icon: '⚙️', permissions: [PERMISSIONS.VIEW_ADMIN_PANEL] },
    { name: 'Perfil', href: '/profile', icon: '👤', permissions: [PERMISSIONS.VIEW_PROFILE] },
  ],
  
  lab_technician: [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', permissions: [PERMISSIONS.VIEW_DASHBOARD] },
    { name: 'Citas', href: '/appointments', icon: '📅', permissions: [PERMISSIONS.VIEW_APPOINTMENTS] },
    { name: 'Expedientes', href: '/medical-records', icon: '📋', permissions: [PERMISSIONS.VIEW_MEDICAL_RECORDS] },
    { name: 'IA Médica', href: '/ai', icon: '🤖', permissions: [PERMISSIONS.VIEW_AI_TOOLS] },
    { name: 'Notificaciones', href: '/notifications', icon: '🔔', permissions: [PERMISSIONS.VIEW_NOTIFICATIONS] },
    { name: 'Perfil', href: '/profile', icon: '👤', permissions: [PERMISSIONS.VIEW_PROFILE] },
  ],
};

// Función para verificar permisos
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

// Función para verificar múltiples permisos (OR)
export const hasAnyPermission = (userRole: UserRole, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

// Función para verificar múltiples permisos (AND)
export const hasAllPermissions = (userRole: UserRole, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// Función para obtener navegación filtrada por permisos
export const getFilteredNavigation = (userRole: UserRole) => {
  return ROLE_NAVIGATION[userRole] || [];
};

// Función para verificar si un usuario puede acceder a una ruta
export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  const navigation = getFilteredNavigation(userRole);
  return navigation.some(item => item.href === route);
};
