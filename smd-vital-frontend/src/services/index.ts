// ========================================
// EXPORTACIONES DE SERVICIOS
// ========================================

// Servicio base
export { apiService, API_BASE_URL, API_URL } from './apiService';

// Servicios específicos
export { userService } from './userService';
export { appointmentService } from './appointmentService';
export { medicalRecordService } from './medicalRecordService';
export { prescriptionService } from './prescriptionService';
export { paymentService } from './paymentService';
export { notificationService } from './notificationService';
export { dashboardService } from './dashboardService';

// Re-exportar tipos de modelos
export type {
  User,
  Appointment,
  MedicalRecord,
  Prescription,
  Payment,
  Notification,
  SystemAlert,
  MedicalTemplate,
  DashboardStats,
  // ApiResponse moved to types/api-new.ts
  PaginationInfo,
  UserRole,
  AppointmentStatus,
  MedicalRecordStatus,
  PaymentStatus,
  UserStatus,
  AppointmentFilters,
  MedicalRecordFilters,
  UserFilters,
  SearchOptions,
  SortOptions,
  VitalSigns,
  Attachment,
  LabResult,
  ImagingResult,
  Medication,
  Report,
  SystemConfig
} from '../types/models';
