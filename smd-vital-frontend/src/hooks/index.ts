// ========================================
// EXPORTACIONES DE HOOKS
// ========================================

// Hook base
export { useApiState } from './useApiState';
export type { ApiState, UseApiStateOptions } from './useApiState';

// Hooks específicos
export { 
  useDashboard, 
  useDashboardStats, 
  useNotifications, 
  useSystemAlerts 
} from './useDashboard';

export { 
  useAppointments, 
  useTodayAppointments, 
  useUpcomingAppointments, 
  useAppointmentStats, 
  useAvailability 
} from './useAppointments';

export { 
  useMedicalRecords, 
  useMedicalRecord, 
  useVitalSigns, 
  useAttachments, 
  useLabResults, 
  useImagingResults, 
  useCompleteMedicalHistory 
} from './useMedicalRecords';

export { 
  useUsers, 
  useUser, 
  useProfile, 
  useUsersByRole, 
  useUserStats, 
  useUserSearch 
} from './useUsers';

export { 
  usePrescriptions, 
  usePrescription, 
  useActivePrescriptions, 
  useExpiredPrescriptions, 
  useExpiringPrescriptions, 
  usePrescriptionStats, 
  usePrintPrescription 
} from './usePrescriptions';

export { 
  usePayments, 
  usePayment, 
  usePendingPayments, 
  useCompletedPayments, 
  usePaymentStats, 
  useRevenue, 
  useFailedPayments, 
  useReceipts 
} from './usePayments';

// Hooks existentes
export { useAuth } from './useAuth';
export { useRolePermissions } from './useRolePermissions';

// Hooks de UI
export { useNotification } from './useNotification';
export { useLoading, useOperationLoading, useAsyncOperation } from './useLoading';
