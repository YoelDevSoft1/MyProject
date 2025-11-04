// SMD VITAL - useAppointments Hook (Optimized)
// Custom hook for complete medical appointments management

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import robustApiService from '../services/robustApiService';

const FILTER_LABELS = {
  status: (v) => `Estado: ${v}`,
  doctor: (v) => `Doctor: ${v}`,
  patient: (v) => `Paciente: ${v}`,
  priority: (v) => `Prioridad: ${v}`,
  appointmentType: (v) => `Tipo: ${v}`,
  isTelemedicine: (v) => v ? 'Telemedicina' : 'Presencial',
  dateFrom: (v) => `Desde: ${v}`,
  dateTo: (v) => `Hasta: ${v}`,
  search: (v) => `Búsqueda: ${v}`
};

export const useAppointments = (initialFilters = {}, options = {}) => {
  const { token, isAuthenticated } = useAuth();
  const toast = useToast();
  
  const {
    autoRefresh = false,
    refreshInterval = 60000,
    enableRealtime = true,
    pageSize = 10
  } = options;

  // Refs to prevent unnecessary effects
  const isInitialMount = useRef(true);
  const lastFiltersRef = useRef(initialFilters);

  // Main state
  const [appointmentsData, setAppointmentsData] = useState({
    appointments: [],
    loading: true,
    error: null,
    pagination: {
      page: 1,
      size: pageSize,
      total: 0,
      has_next: false,
      has_prev: false,
    },
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    doctor: '',
    patient: '',
    dateFrom: '',
    dateTo: '',
    priority: '',
    appointmentType: '',
    isTelemedicine: null,
    ...initialFilters
  });

  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Active filters derived
  const activeFilters = useMemo(() => {
    return Object.entries(filters)
      .filter(([, value]) => value && value !== '' && value !== null)
      .map(([key, value]) => ({
        key,
        value,
        label: FILTER_LABELS[key] ? FILTER_LABELS[key](value) : `${key}: ${value}`
      }));
  }, [filters]);

  // Load appointments with filters
  const loadAppointments = useCallback(async (page = 1, size = pageSize, showLoading = true) => {
    if (!isAuthenticated || !token) {
      setAppointmentsData(prev => ({ ...prev, loading: false, error: "No autenticado" }));
      return { success: false, error: "No autenticado" };
    }

    if (showLoading) {
      setAppointmentsData(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const queryParams = {
        skip: (page - 1) * size,
        limit: size,
        ...filters,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const response = await robustApiService.getAppointments(token, queryParams);
      
      if (response.success) {
        // Extract appointments array from various possible structures
        let appointmentsArray = [];
        const data = response.data;
        
        if (Array.isArray(data?.appointments)) {
          appointmentsArray = data.appointments;
        } else if (Array.isArray(data)) {
          appointmentsArray = data;
        } else if (Array.isArray(data?.data)) {
          appointmentsArray = data.data;
        }

        setAppointmentsData({
          appointments: appointmentsArray,
          loading: false,
          error: null,
          pagination: {
            page: data?.page || page,
            size: data?.size || size,
            total: data?.total || appointmentsArray.length,
            has_next: data?.has_next || false,
            has_prev: data?.has_prev || false,
          },
        });

        setLastRefresh(new Date());
        return { success: true, data: appointmentsArray };
      }

      const error = response.error || 'Error desconocido';
      setAppointmentsData(prev => ({ 
        ...prev, 
        appointments: [],
        loading: false, 
        error 
      }));
      return { success: false, error };
    } catch (error) {
      const errorMessage = error.message || 'Error al cargar citas';
      setAppointmentsData(prev => ({ 
        ...prev, 
        appointments: [],
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  }, [isAuthenticated, token, filters, sortBy, sortOrder, pageSize]);

  // Filter management
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilter = useCallback((key) => {
    setFilters(prev => ({ ...prev, [key]: key === 'isTelemedicine' ? null : '' }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      doctor: '',
      patient: '',
      dateFrom: '',
      dateTo: '',
      priority: '',
      appointmentType: '',
      isTelemedicine: null,
    });
  }, []);

  // Pagination
  const changePage = useCallback((newPage) => {
    loadAppointments(newPage, appointmentsData.pagination.size);
  }, [loadAppointments, appointmentsData.pagination.size]);

  // Sorting
  const changeSort = useCallback((newSortBy, newSortOrder = 'asc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  // Refresh
  const refresh = useCallback(async (showToast = false) => {
    const result = await loadAppointments(
      appointmentsData.pagination.page, 
      appointmentsData.pagination.size,
      false
    );
    
    if (showToast && result.success) {
      toast({
        title: "Datos actualizados",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
    
    return result;
  }, [loadAppointments, appointmentsData.pagination, toast]);

  // CRUD operations
  const createAppointment = useCallback(async (appointmentData) => {
    try {
      const response = await robustApiService.createAppointment(appointmentData, token);
      if (response.success) {
        await refresh(false);
        toast({
          title: "Cita creada exitosamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      return response;
    } catch (error) {
      toast({
        title: "Error al crear cita",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    }
  }, [token, refresh, toast]);

  const updateAppointment = useCallback(async (id, appointmentData) => {
    try {
      const response = await robustApiService.updateAppointment(id, appointmentData, token);
      if (response.success) {
        await refresh(false);
        toast({
          title: "Cita actualizada exitosamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      return response;
    } catch (error) {
      toast({
        title: "Error al actualizar cita",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    }
  }, [token, refresh, toast]);

  const deleteAppointment = useCallback(async (id) => {
    try {
      const response = await robustApiService.deleteAppointment(id, token);
      if (response.success) {
        await refresh(false);
        toast({
          title: "Cita eliminada exitosamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      return response;
    } catch (error) {
      toast({
        title: "Error al eliminar cita",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    }
  }, [token, refresh, toast]);

  // Bulk operations
  const bulkUpdateAppointments = useCallback(async (appointmentIds, updateData) => {
    try {
      const results = await Promise.all(
        appointmentIds.map(id => robustApiService.updateAppointment(id, updateData, token))
      );
      
      const successCount = results.filter(r => r.success).length;
      await refresh(false);
      
      toast({
        title: "Operación completada",
        description: `${successCount} de ${appointmentIds.length} citas actualizadas`,
        status: successCount === appointmentIds.length ? "success" : "warning",
        duration: 3000,
        isClosable: true,
      });

      return { success: true, successCount, total: appointmentIds.length };
    } catch (error) {
      toast({
        title: "Error en operación masiva",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    }
  }, [token, refresh, toast]);

  // Selection management
  const selectAppointment = useCallback((appointmentId, isSelected) => {
    setSelectedAppointments(prev => 
      isSelected 
        ? [...prev, appointmentId]
        : prev.filter(id => id !== appointmentId)
    );
  }, []);

  const selectAllAppointments = useCallback(() => {
    const allIds = appointmentsData.appointments.map(apt => apt.id);
    setSelectedAppointments(prev => 
      prev.length === allIds.length ? [] : allIds
    );
  }, [appointmentsData.appointments]);

  const clearSelection = useCallback(() => {
    setSelectedAppointments([]);
  }, []);

  // Initial load effect
  useEffect(() => {
    if (isAuthenticated && token && isInitialMount.current) {
      loadAppointments();
      isInitialMount.current = false;
    }
  }, [isAuthenticated, token]);

  // Filters change effect (optimized)
  useEffect(() => {
    if (isInitialMount.current) return;

    const filtersChanged = JSON.stringify(lastFiltersRef.current) !== JSON.stringify(filters);
    
    if (filtersChanged && isAuthenticated && token) {
      lastFiltersRef.current = filters;
      loadAppointments(1); // Reset to page 1 on filter change
    }
  }, [filters, isAuthenticated, token]);

  // Sort change effect
  useEffect(() => {
    if (isInitialMount.current) return;
    
    if (isAuthenticated && token) {
      loadAppointments(1);
    }
  }, [sortBy, sortOrder]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !enableRealtime || !isAuthenticated) return;
    
    const interval = setInterval(() => {
      refresh(false);
    }, Math.max(refreshInterval, 30000));
    
    return () => clearInterval(interval);
  }, [autoRefresh, enableRealtime, refreshInterval, refresh, isAuthenticated]);

  return {
    // State
    ...appointmentsData,
    filters,
    activeFilters,
    sortBy,
    sortOrder,
    selectedAppointments,
    lastRefresh,
    
    // Filter functions
    updateFilter,
    clearFilter,
    clearAllFilters,
    
    // Pagination & sorting
    changePage,
    changeSort,
    
    // Data functions
    loadAppointments,
    refresh,
    
    // CRUD operations
    createAppointment,
    updateAppointment,
    deleteAppointment,
    bulkUpdateAppointments,
    
    // Selection functions
    selectAppointment,
    selectAllAppointments,
    clearSelection,
    
    // Utilities
    isSelected: (appointmentId) => selectedAppointments.includes(appointmentId),
    hasSelection: selectedAppointments.length > 0,
    selectionCount: selectedAppointments.length,
    totalAppointments: appointmentsData.appointments.length,
    hasFilters: activeFilters.length > 0,
  };
};

export default useAppointments;