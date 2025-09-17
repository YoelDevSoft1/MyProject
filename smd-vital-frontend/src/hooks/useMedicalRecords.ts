// ========================================
// HOOK PARA EXPEDIENTES MÉDICOS
// ========================================

import { useEffect, useCallback } from 'react';
import { useApiState } from './useApiState';
import { medicalRecordService } from '../services/medicalRecordService';
import { useAuth } from './useAuth';
import { useRolePermissions } from './useRolePermissions';
import type { 
  MedicalRecord, 
  MedicalRecordFilters, 
  PaginationInfo,
  VitalSigns,
  Attachment,
  LabResult,
  ImagingResult
} from '../types/models';

// ===== TIPOS =====
interface MedicalRecordsData {
  medical_records: MedicalRecord[];
  pagination: PaginationInfo;
}

// ===== HOOK PRINCIPAL =====
export function useMedicalRecords(
  filters?: MedicalRecordFilters,
  page: number = 1,
  limit: number = 10,
  sort?: { field: string; direction: 'asc' | 'desc' }
) {
  const { user } = useAuth();
  const { isPatient, isDoctor, isNurse, isAdmin } = useRolePermissions();
  
  const {
    state: recordsState,
    handleApiCall,
    reset
  } = useApiState<MedicalRecordsData>({ medical_records: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false } });

  // Cargar expedientes
  const loadMedicalRecords = useCallback(async () => {
    if (!user) return;

    // Aplicar filtros según el rol
    const roleFilters = { ...filters };
    
    if (isPatient) {
      roleFilters.patient_id = user.id;
    } else if (isDoctor) {
      roleFilters.doctor_id = user.id;
    } else if (isNurse) {
      // Enfermeras pueden ver expedientes asignados
      roleFilters.doctor_id = user.id;
    }
    // Admin puede ver todos los expedientes

    return medicalRecordService.getMedicalRecords(roleFilters, page, limit, sort);
  }, [user, isPatient, isDoctor, isNurse, isAdmin, filters, page, limit, sort]);

  useEffect(() => {
    if (user) {
      handleApiCall(loadMedicalRecords);
    }
  }, [user, filters, page, limit, sort, loadMedicalRecords, handleApiCall]);

  // Crear expediente
  const createMedicalRecord = useCallback(async (recordData: Partial<MedicalRecord>) => {
    try {
      const response = await medicalRecordService.createMedicalRecord(recordData);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadMedicalRecords);
        return response.data;
      }
      throw new Error(response.message || 'Error al crear expediente');
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  }, [loadMedicalRecords, handleApiCall]);

  // Actualizar expediente
  const updateMedicalRecord = useCallback(async (id: string, recordData: Partial<MedicalRecord>) => {
    try {
      const response = await medicalRecordService.updateMedicalRecord(id, recordData);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadMedicalRecords);
        return response.data;
      }
      throw new Error(response.message || 'Error al actualizar expediente');
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  }, [loadMedicalRecords, handleApiCall]);

  // Eliminar expediente
  const deleteMedicalRecord = useCallback(async (id: string) => {
    try {
      const response = await medicalRecordService.deleteMedicalRecord(id);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadMedicalRecords);
        return true;
      }
      throw new Error(response.message || 'Error al eliminar expediente');
    } catch (error) {
      console.error('Error deleting medical record:', error);
      throw error;
    }
  }, [loadMedicalRecords, handleApiCall]);

  // Archivar expediente
  const archiveMedicalRecord = useCallback(async (id: string) => {
    try {
      const response = await medicalRecordService.archiveMedicalRecord(id);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadMedicalRecords);
        return response.data;
      }
      throw new Error(response.message || 'Error al archivar expediente');
    } catch (error) {
      console.error('Error archiving medical record:', error);
      throw error;
    }
  }, [loadMedicalRecords, handleApiCall]);

  // Restaurar expediente
  const restoreMedicalRecord = useCallback(async (id: string) => {
    try {
      const response = await medicalRecordService.restoreMedicalRecord(id);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadMedicalRecords);
        return response.data;
      }
      throw new Error(response.message || 'Error al restaurar expediente');
    } catch (error) {
      console.error('Error restoring medical record:', error);
      throw error;
    }
  }, [loadMedicalRecords, handleApiCall]);

  return {
    ...recordsState,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    archiveMedicalRecord,
    restoreMedicalRecord,
    refresh: () => handleApiCall(loadMedicalRecords),
    reset
  };
}

// ===== HOOK PARA EXPEDIENTE ESPECÍFICO =====
export function useMedicalRecord(id: string) {
  const {
    state: recordState,
    handleApiCall,
    reset
  } = useApiState<MedicalRecord | null>(null);

  const loadMedicalRecord = useCallback(async () => {
    if (!id) return;
    return medicalRecordService.getMedicalRecordById(id);
  }, [id]);

  useEffect(() => {
    if (id) {
      handleApiCall(loadMedicalRecord);
    }
  }, [id, loadMedicalRecord, handleApiCall]);

  return {
    ...recordState,
    refresh: () => handleApiCall(loadMedicalRecord),
    reset
  };
}

// ===== HOOK PARA SIGNOS VITALES =====
export function useVitalSigns(recordId: string) {
  const {
    state: vitalSignsState,
    handleApiCall,
    reset
  } = useApiState<VitalSigns | null>(null);

  const loadVitalSigns = useCallback(async () => {
    if (!recordId) return;
    return medicalRecordService.getVitalSigns(recordId);
  }, [recordId]);

  const updateVitalSigns = useCallback(async (vitalSigns: Partial<VitalSigns>) => {
    try {
      const response = await medicalRecordService.updateVitalSigns(recordId, vitalSigns);
      if (response.success) {
        // Refrescar signos vitales
        handleApiCall(loadVitalSigns);
        return response.data;
      }
      throw new Error(response.message || 'Error al actualizar signos vitales');
    } catch (error) {
      console.error('Error updating vital signs:', error);
      throw error;
    }
  }, [recordId, loadVitalSigns, handleApiCall]);

  useEffect(() => {
    if (recordId) {
      handleApiCall(loadVitalSigns);
    }
  }, [recordId, loadVitalSigns, handleApiCall]);

  return {
    ...vitalSignsState,
    updateVitalSigns,
    refresh: () => handleApiCall(loadVitalSigns),
    reset
  };
}

// ===== HOOK PARA ARCHIVOS ADJUNTOS =====
export function useAttachments(recordId: string) {
  const {
    state: attachmentsState,
    handleApiCall,
    reset
  } = useApiState<Attachment[]>([]);

  const loadAttachments = useCallback(async () => {
    if (!recordId) return;
    // Los archivos adjuntos vienen con el expediente médico
    return medicalRecordService.getMedicalRecordById(recordId);
  }, [recordId]);

  const uploadAttachment = useCallback(async (file: File, description?: string) => {
    try {
      const response = await medicalRecordService.uploadAttachment(recordId, file, description);
      if (response.success) {
        // Refrescar archivos adjuntos
        handleApiCall(loadAttachments);
        return response.data;
      }
      throw new Error(response.message || 'Error al subir archivo');
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }, [recordId, loadAttachments, handleApiCall]);

  const deleteAttachment = useCallback(async (attachmentId: string) => {
    try {
      const response = await medicalRecordService.deleteAttachment(recordId, attachmentId);
      if (response.success) {
        // Refrescar archivos adjuntos
        handleApiCall(loadAttachments);
        return true;
      }
      throw new Error(response.message || 'Error al eliminar archivo');
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  }, [recordId, loadAttachments, handleApiCall]);

  const downloadAttachment = useCallback(async (attachmentId: string) => {
    try {
      await medicalRecordService.downloadAttachment(recordId, attachmentId);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      throw error;
    }
  }, [recordId]);

  useEffect(() => {
    if (recordId) {
      handleApiCall(loadAttachments);
    }
  }, [recordId, loadAttachments, handleApiCall]);

  return {
    ...attachmentsState,
    uploadAttachment,
    deleteAttachment,
    downloadAttachment,
    refresh: () => handleApiCall(loadAttachments),
    reset
  };
}

// ===== HOOK PARA RESULTADOS DE LABORATORIO =====
export function useLabResults(recordId: string) {
  const {
    state: labResultsState,
    handleApiCall,
    reset
  } = useApiState<LabResult[]>([]);

  const loadLabResults = useCallback(async () => {
    if (!recordId) return;
    return medicalRecordService.getLabResults(recordId);
  }, [recordId]);

  const addLabResult = useCallback(async (labResult: Partial<LabResult>) => {
    try {
      const response = await medicalRecordService.addLabResult(recordId, labResult);
      if (response.success) {
        // Refrescar resultados
        handleApiCall(loadLabResults);
        return response.data;
      }
      throw new Error(response.message || 'Error al agregar resultado de laboratorio');
    } catch (error) {
      console.error('Error adding lab result:', error);
      throw error;
    }
  }, [recordId, loadLabResults, handleApiCall]);

  useEffect(() => {
    if (recordId) {
      handleApiCall(loadLabResults);
    }
  }, [recordId, loadLabResults, handleApiCall]);

  return {
    ...labResultsState,
    addLabResult,
    refresh: () => handleApiCall(loadLabResults),
    reset
  };
}

// ===== HOOK PARA RESULTADOS DE IMAGEN =====
export function useImagingResults(recordId: string) {
  const {
    state: imagingResultsState,
    handleApiCall,
    reset
  } = useApiState<ImagingResult[]>([]);

  const loadImagingResults = useCallback(async () => {
    if (!recordId) return;
    return medicalRecordService.getImagingResults(recordId);
  }, [recordId]);

  const addImagingResult = useCallback(async (imagingResult: Partial<ImagingResult>) => {
    try {
      const response = await medicalRecordService.addImagingResult(recordId, imagingResult);
      if (response.success) {
        // Refrescar resultados
        handleApiCall(loadImagingResults);
        return response.data;
      }
      throw new Error(response.message || 'Error al agregar resultado de imagen');
    } catch (error) {
      console.error('Error adding imaging result:', error);
      throw error;
    }
  }, [recordId, loadImagingResults, handleApiCall]);

  useEffect(() => {
    if (recordId) {
      handleApiCall(loadImagingResults);
    }
  }, [recordId, loadImagingResults, handleApiCall]);

  return {
    ...imagingResultsState,
    addImagingResult,
    refresh: () => handleApiCall(loadImagingResults),
    reset
  };
}

// ===== HOOK PARA HISTORIAL MÉDICO COMPLETO =====
export function useCompleteMedicalHistory(patientId: string) {
  const {
    state: historyState,
    handleApiCall,
    reset
  } = useApiState<any>(null);

  const loadCompleteHistory = useCallback(async () => {
    if (!patientId) return;
    return medicalRecordService.getCompleteMedicalHistory(patientId);
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      handleApiCall(loadCompleteHistory);
    }
  }, [patientId, loadCompleteHistory, handleApiCall]);

  return {
    ...historyState,
    refresh: () => handleApiCall(loadCompleteHistory),
    reset
  };
}
