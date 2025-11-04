/**
 * SMD VITAL - Configuración de Módulos
 * =====================================
 * 
 * Configuración centralizada de todos los módulos del sistema
 * con integración completa y lógica de negocio robusta.
 * 
 * Author: Senior Developer Team
 * Version: 2.0.0
 */

// =====================================================
// CONFIGURACIÓN DE MÓDULOS PRINCIPALES
// =====================================================

export const MODULES_CONFIG = {
  // Módulo de Citas Médicas
  appointments: {
    name: 'Citas Médicas',
    path: '/admin/appointments',
    component: 'AdvancedAppointments',
    icon: 'MdCalendarToday',
    color: 'blue',
    description: 'Gestión completa de citas médicas con IA',
    features: [
      'Calendario inteligente',
      'Disponibilidad en tiempo real',
      'Gestión de profesionales',
      'Notificaciones automáticas',
      'Integración con IA'
    ],
    permissions: ['read_appointments', 'write_appointments'],
    dependencies: ['patients', 'professionals', 'notifications']
  },

  // Módulo de Expedientes Médicos
  medicalRecords: {
    name: 'Expedientes Médicos',
    path: '/admin/medical-records',
    component: 'AdvancedMedicalRecords',
    icon: 'MdFileCopy',
    color: 'green',
    description: 'Historiales médicos completos con IA',
    features: [
      'Historial médico completo',
      'Prescripciones médicas',
      'Signos vitales',
      'Resultados de laboratorio',
      'Imágenes médicas',
      'Integración con IA'
    ],
    permissions: ['read_medical_records', 'write_medical_records'],
    dependencies: ['patients', 'professionals', 'ai']
  },

  // Módulo de Gestión de Pacientes
  patients: {
    name: 'Gestión de Pacientes',
    path: '/admin/patients',
    component: 'AdvancedPatients',
    icon: 'FaUser',
    color: 'purple',
    description: 'Gestión completa de perfiles médicos',
    features: [
      'Perfiles médicos completos',
      'Historial médico',
      'Contactos de emergencia',
      'Alergias y condiciones',
      'Seguimiento de salud',
      'Integración con IA'
    ],
    permissions: ['read_patients', 'write_patients'],
    dependencies: ['medicalRecords', 'appointments']
  },

  // Módulo de Sistema de Pagos
  payments: {
    name: 'Sistema de Pagos',
    path: '/admin/payments',
    component: 'AdvancedPayments',
    icon: 'MdAttachMoney',
    color: 'green',
    description: 'Pagos integrados con múltiples gateways',
    features: [
      'Procesamiento multi-gateway',
      'Facturación automática',
      'Reembolsos y conciliación',
      'Reportes financieros',
      'Integración con Stripe, PayU, PSE'
    ],
    permissions: ['read_payments', 'write_payments'],
    dependencies: ['patients', 'appointments', 'invoices']
  },

  // Módulo de IA Médica
  aiMedical: {
    name: 'IA Médica',
    path: '/admin/ai',
    component: 'AdvancedAIMedical',
    icon: 'MdPsychology',
    color: 'purple',
    description: 'Inteligencia artificial para diagnóstico y asistencia',
    features: [
      'Chat médico inteligente',
      'Análisis de síntomas',
      'Diagnósticos asistidos',
      'Recomendaciones de tratamiento',
      'Análisis de imágenes médicas',
      'Predicción de riesgos',
      'Educación médica personalizada'
    ],
    permissions: ['ai_access'],
    dependencies: ['patients', 'medicalRecords']
  },

  // Módulo de Notificaciones
  notifications: {
    name: 'Sistema de Notificaciones',
    path: '/admin/notifications',
    component: 'AdvancedNotifications',
    icon: 'MdNotifications',
    color: 'orange',
    description: 'Notificaciones multi-canal en tiempo real',
    features: [
      'Notificaciones multi-canal',
      'Templates personalizables',
      'Programación de notificaciones',
      'Analytics y métricas',
      'Notificaciones en tiempo real'
    ],
    permissions: ['read_notifications', 'write_notifications'],
    dependencies: ['users', 'templates']
  },

  // Módulo de Administración
  admin: {
    name: 'Panel de Administración',
    path: '/admin/administration',
    component: 'AdvancedAdminPanel',
    icon: 'MdAdminPanelSettings',
    color: 'red',
    description: 'Gestión completa del sistema',
    features: [
      'Dashboard ejecutivo',
      'Gestión de usuarios y roles',
      'Configuración del sistema',
      'Monitoreo en tiempo real',
      'Analytics avanzados',
      'Auditoría y logs'
    ],
    permissions: ['admin_access'],
    dependencies: ['users', 'roles', 'audit']
  },

  // Módulo de Tablas de Datos Avanzadas
  dataTables: {
    name: 'Tablas de Datos SMD VITAL',
    path: '/admin/data-tables',
    component: 'AdvancedDataTables',
    icon: 'MdBarChart',
    color: 'teal',
    description: 'Sistema avanzado de reportes y analytics médicos',
    features: [
      'Reportes ejecutivos con gráficos interactivos',
      'Exportación a Excel/PDF con templates personalizados',
      'Filtros avanzados y búsqueda inteligente',
      'Analytics en tiempo real con métricas KPI',
      'Dashboards personalizables por rol',
      'Integración con IA para insights automáticos',
      'Métricas de rendimiento y tendencias',
      'Reportes de cumplimiento y auditoría'
    ],
    permissions: ['read_data_tables', 'write_data_tables', 'export_data'],
    dependencies: ['analytics', 'ai', 'appointments', 'patients', 'payments']
  },

  // Módulo de Perfiles SMD VITAL
  profile: {
    name: 'Perfil SMD VITAL',
    path: '/admin/profile',
    component: 'AdvancedProfile',
    icon: 'MdPerson',
    color: 'gray',
    description: 'Gestión completa de perfiles médicos y configuraciones',
    features: [
      'Perfil médico completo con información profesional',
      'Configuraciones personalizadas por rol',
      'Preferencias de notificaciones avanzadas',
      'Historial de actividad detallado',
      'Configuración de seguridad y privacidad',
      'Integración con sistemas de autenticación',
      'Gestión de permisos y accesos',
      'Configuración de dispositivos y sesiones',
      'Autenticación de dos factores',
      'Autenticación biométrica'
    ],
    permissions: ['read_profile', 'write_profile', 'manage_security'],
    dependencies: ['users', 'authentication', 'notifications', 'security']
  }
};

// =====================================================
// CONFIGURACIÓN DE RUTAS
// =====================================================

export const ROUTES_CONFIG = [
  {
    path: '/admin/dashboard',
    component: 'ContextualDashboard',
    name: 'Dashboard SMD VITAL',
    icon: 'IoMdHome',
    color: 'blue',
    isProtected: true,
    roles: ['admin', 'doctor', 'nurse', 'receptionist']
  },
  {
    path: '/admin/appointments',
    component: 'AdvancedAppointments',
    name: 'Citas Médicas',
    icon: 'MdCalendarToday',
    color: 'blue',
    isProtected: true,
    roles: ['admin', 'doctor', 'nurse', 'receptionist']
  },
  {
    path: '/admin/medical-records',
    component: 'AdvancedMedicalRecords',
    name: 'Expedientes',
    icon: 'MdFileCopy',
    color: 'green',
    isProtected: true,
    roles: ['admin', 'doctor', 'nurse']
  },
  {
    path: '/admin/patients',
    component: 'AdvancedPatients',
    name: 'Pacientes',
    icon: 'FaUser',
    color: 'purple',
    isProtected: true,
    roles: ['admin', 'doctor', 'nurse', 'receptionist']
  },
  {
    path: '/admin/payments',
    component: 'AdvancedPayments',
    name: 'Pagos',
    icon: 'MdAttachMoney',
    color: 'green',
    isProtected: true,
    roles: ['admin', 'receptionist']
  },
  {
    path: '/admin/ai',
    component: 'AdvancedAIMedical',
    name: 'IA Médica',
    icon: 'MdPsychology',
    color: 'purple',
    isProtected: true,
    roles: ['admin', 'doctor']
  },
  {
    path: '/admin/notifications',
    component: 'AdvancedNotifications',
    name: 'Notificaciones',
    icon: 'MdNotifications',
    color: 'orange',
    isProtected: true,
    roles: ['admin', 'receptionist']
  },
  {
    path: '/admin/administration',
    component: 'AdvancedAdminPanel',
    name: 'Administración',
    icon: 'MdAdminPanelSettings',
    color: 'red',
    isProtected: true,
    roles: ['admin']
  },
  {
    path: '/admin/data-tables',
    component: 'DataTables',
    name: 'Tablas de Datos SMD VITAL',
    icon: 'MdBarChart',
    color: 'teal',
    isProtected: true,
    roles: ['admin', 'doctor', 'nurse']
  },
  {
    path: '/admin/profile',
    component: 'Profile',
    name: 'Perfil SMD VITAL',
    icon: 'MdPerson',
    color: 'gray',
    isProtected: true,
    roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient']
  }
];

// =====================================================
// CONFIGURACIÓN DE PERMISOS
// =====================================================

export const PERMISSIONS_CONFIG = {
  // Permisos de Pacientes
  read_patients: {
    name: 'Leer Pacientes',
    description: 'Permite ver información de pacientes',
    module: 'patients'
  },
  write_patients: {
    name: 'Escribir Pacientes',
    description: 'Permite crear y modificar pacientes',
    module: 'patients'
  },

  // Permisos de Citas
  read_appointments: {
    name: 'Leer Citas',
    description: 'Permite ver citas médicas',
    module: 'appointments'
  },
  write_appointments: {
    name: 'Escribir Citas',
    description: 'Permite crear y modificar citas',
    module: 'appointments'
  },

  // Permisos de Expedientes
  read_medical_records: {
    name: 'Leer Expedientes',
    description: 'Permite ver expedientes médicos',
    module: 'medicalRecords'
  },
  write_medical_records: {
    name: 'Escribir Expedientes',
    description: 'Permite crear y modificar expedientes',
    module: 'medicalRecords'
  },

  // Permisos de Pagos
  read_payments: {
    name: 'Leer Pagos',
    description: 'Permite ver información de pagos',
    module: 'payments'
  },
  write_payments: {
    name: 'Escribir Pagos',
    description: 'Permite procesar pagos',
    module: 'payments'
  },

  // Permisos de Notificaciones
  read_notifications: {
    name: 'Leer Notificaciones',
    description: 'Permite ver notificaciones',
    module: 'notifications'
  },
  write_notifications: {
    name: 'Escribir Notificaciones',
    description: 'Permite enviar notificaciones',
    module: 'notifications'
  },

  // Permisos de IA
  ai_access: {
    name: 'Acceso a IA',
    description: 'Permite usar funciones de IA médica',
    module: 'aiMedical'
  },

  // Permisos de Administración
  admin_access: {
    name: 'Acceso de Administrador',
    description: 'Acceso completo al sistema',
    module: 'admin'
  },

  // Permisos de Tablas de Datos
  read_data_tables: {
    name: 'Leer Tablas de Datos',
    description: 'Permite ver reportes y analytics',
    module: 'dataTables'
  },
  write_data_tables: {
    name: 'Escribir Tablas de Datos',
    description: 'Permite crear y modificar reportes',
    module: 'dataTables'
  },
  export_data: {
    name: 'Exportar Datos',
    description: 'Permite exportar datos a Excel/PDF',
    module: 'dataTables'
  },

  // Permisos de Perfil
  read_profile: {
    name: 'Leer Perfil',
    description: 'Permite ver información del perfil',
    module: 'profile'
  },
  write_profile: {
    name: 'Escribir Perfil',
    description: 'Permite modificar información del perfil',
    module: 'profile'
  },
  manage_security: {
    name: 'Gestionar Seguridad',
    description: 'Permite configurar opciones de seguridad',
    module: 'profile'
  }
};

// =====================================================
// CONFIGURACIÓN DE ROLES
// =====================================================

export const ROLES_CONFIG = {
  admin: {
    name: 'Administrador',
    description: 'Acceso completo al sistema',
    permissions: Object.keys(PERMISSIONS_CONFIG),
    color: 'red',
    icon: 'MdAdminPanelSettings'
  },
  doctor: {
    name: 'Doctor',
    description: 'Profesional médico con acceso a pacientes y expedientes',
    permissions: [
      'read_patients', 'write_patients',
      'read_appointments', 'write_appointments',
      'read_medical_records', 'write_medical_records',
      'ai_access',
      'read_data_tables', 'export_data',
      'read_profile', 'write_profile'
    ],
    color: 'blue',
    icon: 'FaUserMd'
  },
  nurse: {
    name: 'Enfermero',
    description: 'Personal de enfermería con acceso limitado',
    permissions: [
      'read_patients', 'write_patients',
      'read_appointments', 'write_appointments',
      'read_medical_records', 'write_medical_records',
      'read_data_tables',
      'read_profile', 'write_profile'
    ],
    color: 'green',
    icon: 'FaUserMd'
  },
  receptionist: {
    name: 'Recepcionista',
    description: 'Personal de recepción con acceso a citas y pagos',
    permissions: [
      'read_patients', 'write_patients',
      'read_appointments', 'write_appointments',
      'read_payments', 'write_payments',
      'read_notifications', 'write_notifications',
      'read_data_tables', 'export_data',
      'read_profile', 'write_profile'
    ],
    color: 'purple',
    icon: 'MdPerson'
  },
  patient: {
    name: 'Paciente',
    description: 'Paciente con acceso a su propia información',
    permissions: [
      'read_patients',
      'read_profile'
    ],
    color: 'gray',
    icon: 'FaUser'
  }
};

// =====================================================
// CONFIGURACIÓN DE SERVICIOS
// =====================================================

export const SERVICES_CONFIG = {
  authentication: {
    name: 'Authentication Service',
    port: 8001,
    url: 'http://localhost:8001',
    health: '/health',
    description: 'Servicio de autenticación y autorización'
  },
  users: {
    name: 'Users Service',
    port: 8002,
    url: 'http://localhost:8002',
    health: '/health',
    description: 'Servicio de gestión de usuarios'
  },
  appointments: {
    name: 'Appointments Service',
    port: 8003,
    url: 'http://localhost:8003',
    health: '/health',
    description: 'Servicio de gestión de citas médicas'
  },
  medicalRecords: {
    name: 'Medical Records Service',
    port: 8004,
    url: 'http://localhost:8004',
    health: '/health',
    description: 'Servicio de expedientes médicos'
  },
  payments: {
    name: 'Payments Service',
    port: 8005,
    url: 'http://localhost:8005',
    health: '/health',
    description: 'Servicio de pagos y facturación'
  },
  notifications: {
    name: 'Notifications Service',
    port: 8006,
    url: 'http://localhost:8006',
    health: '/health',
    description: 'Servicio de notificaciones'
  },
  aiMedical: {
    name: 'AI Medical Service',
    port: 8007,
    url: 'http://localhost:8007',
    health: '/health',
    description: 'Servicio de inteligencia artificial médica'
  },
  integration: {
    name: 'Integration Service',
    port: 8009,
    url: 'http://localhost:8009',
    health: '/health',
    description: 'Servicio de integración central para todos los módulos'
  }
};

// =====================================================
// CONFIGURACIÓN DE BASE DE DATOS
// =====================================================

export const DATABASE_CONFIG = {
  primary: {
    host: 'localhost',
    port: 5432,
    database: 'smdvital_primary',
    username: 'smdvital_user',
    password: 'smdvital_password'
  },
  auth: {
    host: 'localhost',
    port: 5432,
    database: 'smdvital_auth',
    username: 'smdvital_user',
    password: 'smdvital_password'
  },
  users: {
    host: 'localhost',
    port: 5432,
    database: 'smdvital_users',
    username: 'smdvital_user',
    password: 'smdvital_password'
  },
  appointments: {
    host: 'localhost',
    port: 5432,
    database: 'smdvital_appointments',
    username: 'smdvital_user',
    password: 'smdvital_password'
  },
  medicalRecords: {
    host: 'localhost',
    port: 5432,
    database: 'smdvital_medical_records',
    username: 'smdvital_user',
    password: 'smdvital_password'
  },
  payments: {
    host: 'localhost',
    port: 5432,
    database: 'smdvital_payments',
    username: 'smdvital_user',
    password: 'smdvital_password'
  },
  notifications: {
    host: 'localhost',
    port: 5432,
    database: 'smdvital_notifications',
    username: 'smdvital_user',
    password: 'smdvital_password'
  }
};

// =====================================================
// CONFIGURACIÓN DE INTEGRACIÓN
// =====================================================

export const INTEGRATION_CONFIG = {
  // Configuración de APIs externas
  externalAPIs: {
    stripe: {
      publicKey: process.env.REACT_APP_STRIPE_PUBLIC_KEY,
      secretKey: process.env.REACT_APP_STRIPE_SECRET_KEY,
      webhookSecret: process.env.REACT_APP_STRIPE_WEBHOOK_SECRET
    },
    payu: {
      merchantId: process.env.REACT_APP_PAYU_MERCHANT_ID,
      apiKey: process.env.REACT_APP_PAYU_API_KEY,
      apiLogin: process.env.REACT_APP_PAYU_API_LOGIN
    },
    sendgrid: {
      apiKey: process.env.REACT_APP_SENDGRID_API_KEY,
      fromEmail: process.env.REACT_APP_SENDGRID_FROM_EMAIL
    },
    twilio: {
      accountSid: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
      authToken: process.env.REACT_APP_TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.REACT_APP_TWILIO_PHONE_NUMBER
    }
  },

  // Configuración de IA
  ai: {
    openai: {
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      model: 'gpt-4-medical',
      maxTokens: 2000
    },
    anthropic: {
      apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
      model: 'claude-3-medical',
      maxTokens: 2000
    }
  },

  // Configuración de almacenamiento
  storage: {
    s3: {
      bucket: process.env.REACT_APP_S3_BUCKET,
      region: process.env.REACT_APP_S3_REGION,
      accessKeyId: process.env.REACT_APP_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_S3_SECRET_ACCESS_KEY
    }
  }
};

// =====================================================
// CONFIGURACIÓN DE NOTIFICACIONES
// =====================================================

export const NOTIFICATION_TEMPLATES = {
  appointment_confirmation: {
    name: 'Confirmación de Cita',
    subject: 'Confirmación de Cita Médica - {{appointment_number}}',
    content: `
      Estimado/a {{patient_name}},
      
      Su cita médica ha sido confirmada para el {{date}} a las {{time}} con el Dr. {{doctor_name}}.
      
      Detalles de la cita:
      - Número: {{appointment_number}}
      - Fecha: {{date}}
      - Hora: {{time}}
      - Doctor: {{doctor_name}}
      - Especialidad: {{specialty}}
      
      Por favor, llegue 15 minutos antes de su cita.
      
      Atentamente,
      Equipo SMD VITAL
    `,
    channels: ['email', 'sms', 'push']
  },
  appointment_reminder: {
    name: 'Recordatorio de Cita',
    subject: 'Recordatorio de Cita Médica - {{appointment_number}}',
    content: `
      Estimado/a {{patient_name}},
      
      Le recordamos que tiene una cita médica mañana a las {{time}} con el Dr. {{doctor_name}}.
      
      Detalles:
      - Fecha: {{date}}
      - Hora: {{time}}
      - Doctor: {{doctor_name}}
      
      ¡No olvide traer su documento de identidad!
      
      Atentamente,
      Equipo SMD VITAL
    `,
    channels: ['email', 'sms', 'push']
  },
  payment_confirmation: {
    name: 'Confirmación de Pago',
    subject: 'Confirmación de Pago - {{payment_number}}',
    content: `
      Estimado/a {{patient_name}},
      
      Su pago de ${{amount}} ha sido procesado exitosamente.
      
      Detalles del pago:
      - Número: {{payment_number}}
      - Monto: ${{amount}}
      - Método: {{payment_method}}
      - Fecha: {{date}}
      
      Gracias por confiar en SMD VITAL.
      
      Atentamente,
      Equipo SMD VITAL
    `,
    channels: ['email', 'sms']
  }
};

// =====================================================
// CONFIGURACIÓN DE VALIDACIONES
// =====================================================

export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'El email debe tener un formato válido'
  },
  phone: {
    pattern: /^\+?[1-9]\d{1,14}$/,
    message: 'El teléfono debe tener un formato válido'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos'
  },
  document: {
    pattern: /^[0-9]{6,12}$/,
    message: 'El documento debe contener solo números y tener entre 6 y 12 dígitos'
  }
};

// =====================================================
// CONFIGURACIÓN DE ESTADOS
// =====================================================

export const STATUS_CONFIG = {
  appointments: {
    scheduled: { label: 'Programada', color: 'blue' },
    confirmed: { label: 'Confirmada', color: 'green' },
    in_progress: { label: 'En Progreso', color: 'orange' },
    completed: { label: 'Completada', color: 'purple' },
    cancelled: { label: 'Cancelada', color: 'red' },
    rescheduled: { label: 'Reprogramada', color: 'yellow' }
  },
  payments: {
    pending: { label: 'Pendiente', color: 'yellow' },
    processing: { label: 'Procesando', color: 'blue' },
    completed: { label: 'Completado', color: 'green' },
    failed: { label: 'Fallido', color: 'red' },
    cancelled: { label: 'Cancelado', color: 'gray' },
    refunded: { label: 'Reembolsado', color: 'purple' }
  },
  notifications: {
    pending: { label: 'Pendiente', color: 'yellow' },
    sent: { label: 'Enviada', color: 'green' },
    delivered: { label: 'Entregada', color: 'blue' },
    failed: { label: 'Fallida', color: 'red' },
    cancelled: { label: 'Cancelada', color: 'gray' }
  },
  users: {
    active: { label: 'Activo', color: 'green' },
    inactive: { label: 'Inactivo', color: 'red' },
    pending: { label: 'Pendiente', color: 'yellow' },
    suspended: { label: 'Suspendido', color: 'orange' }
  }
};

export default {
  MODULES_CONFIG,
  ROUTES_CONFIG,
  PERMISSIONS_CONFIG,
  ROLES_CONFIG,
  SERVICES_CONFIG,
  DATABASE_CONFIG,
  INTEGRATION_CONFIG,
  NOTIFICATION_TEMPLATES,
  VALIDATION_RULES,
  STATUS_CONFIG
};
