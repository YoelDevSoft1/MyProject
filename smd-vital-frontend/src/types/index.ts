// ========================================
// ÍNDICE CENTRAL DE TIPOS
// ========================================

// Re-exportar todos los tipos de API
export type {
  ApiResponse,
  PaginationInfo,
  SearchOptions,
  SortOptions,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  PaginatedResponse
} from './api';

// Re-exportar todos los modelos de datos
export type {
  User,
  UserRole,
  UserStatus,
  Appointment,
  AppointmentStatus,
  AppointmentFilters,
  MedicalRecord,
  MedicalRecordStatus,
  MedicalRecordFilters,
  Medication,
  VitalSigns,
  Attachment,
  Prescription,
  Payment,
  PaymentStatus,
  Notification,
  NotificationStatus,
  SystemAlert,
  MedicalTemplate,
  TemplateSection,
  LabResult,
  ImagingResult,
  DashboardStats,
  Report,
  SystemConfig,
  UserFilters
} from './models';

// Exportar tipos de utilidad
export type {
  AppointmentStatus as AppointmentStatusType,
  MedicalRecordStatus as MedicalRecordStatusType,
  PaymentStatus as PaymentStatusType,
  NotificationStatus as NotificationStatusType,
  UserStatus as UserStatusType
} from './models';
