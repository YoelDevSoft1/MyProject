// ========================================
// MODELOS DE DATOS PRINCIPALES
// ========================================

// ===== USUARIO =====
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name?: string; // Computed field
  role: UserRole;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_verified: boolean;
  // Campos específicos por rol
  license_number?: string; // Para doctores
  specialization?: string; // Para doctores
  department?: string; // Para enfermeras
  shift?: 'morning' | 'afternoon' | 'night'; // Para enfermeras
}

// ===== CITA MÉDICA =====
export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  nurse_id?: string;
  nurse_name?: string;
  date: string;
  time: string;
  duration: number; // en minutos
  type: 'consultation' | 'follow_up' | 'procedure' | 'emergency' | 'checkup';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  room?: string;
  created_at: string;
  updated_at: string;
  // Campos adicionales
  symptoms?: string[];
  diagnosis?: string;
  treatment_plan?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
}

// ===== EXPEDIENTE MÉDICO =====
export interface MedicalRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  appointment_id?: string;
  date: string;
  type: 'consultation' | 'follow_up' | 'procedure' | 'emergency' | 'checkup';
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  medications: Medication[];
  notes: string;
  vital_signs: VitalSigns;
  attachments: Attachment[];
  status: 'draft' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  // Campos adicionales
  follow_up_required?: boolean;
  follow_up_date?: string;
  next_appointment?: string;
  lab_results?: LabResult[];
  imaging_results?: ImagingResult[];
}

// ===== MEDICAMENTO =====
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: 'once_daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'as_needed';
  duration: string;
  instructions: string;
  quantity: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

// ===== SIGNOS VITALES =====
export interface VitalSigns {
  blood_pressure: string; // "120/80"
  heart_rate: number; // bpm
  temperature: number; // Celsius
  weight: number; // kg
  height: number; // cm
  oxygen_saturation?: number; // %
  respiratory_rate?: number; // breaths per minute
  pain_level?: number; // 1-10 scale
  notes?: string;
  recorded_by: string;
  recorded_at: string;
}

// ===== ARCHIVO ADJUNTO =====
export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'pdf' | 'video' | 'audio';
  url: string;
  size: number; // bytes
  uploaded_at: string;
  uploaded_by: string;
}

// ===== PRESCRIPCIÓN =====
export interface Prescription {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  date: string;
  medications: Medication[];
  notes: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  valid_until: string;
  created_at: string;
  updated_at: string;
  // Campos adicionales
  refills_remaining?: number;
  pharmacy_notes?: string;
  dispensed_at?: string;
  dispensed_by?: string;
}

// ===== PAGO =====
export interface Payment {
  id: string;
  patient_id: string;
  patient_name: string;
  appointment_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  method: 'cash' | 'card' | 'transfer' | 'insurance' | 'other';
  description: string;
  payment_date?: string;
  created_at: string;
  updated_at: string;
  // Campos adicionales
  transaction_id?: string;
  reference?: string;
  notes?: string;
  processed_by?: string;
}

// ===== NOTIFICACIÓN =====
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'appointment' | 'payment' | 'medical';
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string;
  action_text?: string;
  expires_at?: string;
  created_at: string;
  // Campos adicionales
  data?: Record<string, any>;
  sent_via: 'app' | 'email' | 'sms' | 'push';
}

// ===== ALERTA DEL SISTEMA =====
export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Campos adicionales
  affected_services?: string[];
  resolution_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
}

// ===== PLANTILLA MÉDICA =====
export interface MedicalTemplate {
  id: string;
  name: string;
  description: string;
  category: 'consultation' | 'follow_up' | 'procedure' | 'emergency' | 'checkup';
  sections: TemplateSection[];
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  usage_count: number;
  // Campos adicionales
  tags?: string[];
  is_active: boolean;
}

export interface TemplateSection {
  id: string;
  title: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation_rules?: Record<string, any>;
}

// ===== RESULTADO DE LABORATORIO =====
export interface LabResult {
  id: string;
  patient_id: string;
  test_name: string;
  test_type: string;
  result_value: string;
  normal_range: string;
  unit: string;
  status: 'normal' | 'abnormal' | 'critical';
  notes?: string;
  ordered_by: string;
  ordered_at: string;
  completed_at: string;
  lab_name: string;
}

// ===== RESULTADO DE IMAGEN =====
export interface ImagingResult {
  id: string;
  patient_id: string;
  study_type: string;
  body_part: string;
  findings: string;
  impression: string;
  recommendations: string;
  status: 'pending' | 'completed' | 'reviewed';
  ordered_by: string;
  ordered_at: string;
  completed_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  facility_name: string;
  images: string[];
}

// ===== ESTADÍSTICAS DEL DASHBOARD =====
export interface DashboardStats {
  // Estadísticas generales
  total_users: number;
  total_appointments: number;
  total_medical_records: number;
  total_payments: number;
  
  // Estadísticas por período
  period: 'today' | 'week' | 'month' | 'year';
  start_date: string;
  end_date: string;
  
  // Estadísticas de citas
  appointments_today: number;
  appointments_this_week: number;
  appointments_this_month: number;
  completed_appointments: number;
  pending_appointments: number;
  cancelled_appointments: number;
  
  // Estadísticas de usuarios
  active_users: number;
  new_users_this_month: number;
  users_by_role: Record<string, number>;
  
  // Estadísticas de pagos
  total_revenue: number;
  revenue_this_month: number;
  pending_payments: number;
  completed_payments: number;
  
  // Estadísticas médicas
  total_patients: number;
  total_doctors: number;
  total_nurses: number;
  active_medical_records: number;
  
  // Tendencias
  user_growth_rate: number;
  appointment_growth_rate: number;
  revenue_growth_rate: number;
}

// ===== REPORTE =====
export interface Report {
  id: string;
  name: string;
  type: 'users' | 'appointments' | 'medical_records' | 'payments' | 'custom';
  description: string;
  parameters: Record<string, any>;
  generated_by: string;
  generated_at: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  file_url?: string;
  file_size?: number;
  expires_at?: string;
}

// ===== CONFIGURACIÓN DEL SISTEMA =====
export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  is_public: boolean;
  updated_by: string;
  updated_at: string;
}

// ===== TIPOS DE ROL =====
export type UserRole = 'patient' | 'doctor' | 'nurse' | 'admin' | 'lab_technician';

// ===== TIPOS DE ESTADO =====
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type MedicalRecordStatus = 'draft' | 'completed' | 'archived';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type NotificationStatus = 'unread' | 'read' | 'archived';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

// ===== TIPOS DE RESPUESTA DE API =====
// ApiResponse y PaginationInfo están definidos en types/api.ts

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// ===== TIPOS DE FILTROS =====
export interface AppointmentFilters {
  patient_id?: string;
  doctor_id?: string;
  nurse_id?: string;
  status?: AppointmentStatus;
  type?: string;
  date_from?: string;
  date_to?: string;
  priority?: string;
}

export interface MedicalRecordFilters {
  patient_id?: string;
  doctor_id?: string;
  status?: MedicalRecordStatus;
  type?: string;
  date_from?: string;
  date_to?: string;
  diagnosis?: string;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  created_from?: string;
  created_to?: string;
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
