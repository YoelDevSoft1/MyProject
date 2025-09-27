// SMD VITAL - useAppointments Hook
// Hook personalizado para gestión completa de citas médicas

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import robustApiService from '../services/robustApiService';

/**
 * Hook personalizado para gestión de citas médicas
 * Maneja filtros, paginación, estados de carga y operaciones CRUD
 * 
 * @param {Object} initialFilters - Filtros iniciales
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones para gestión de citas
 */
export const useAppointments = (initialFilters = {}, options = {}) => {
  const { token, isAuthenticated } = useAuth();
  const toast = useToast();
  
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    enableRealtime = true,
    pageSize = 10
  } = options;

  // Estados principales
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

  // Filtros activos derivados
  const activeFilters = useMemo(() => {
    return Object.entries(filters)
      .filter(([key, value]) => value && value !== '' && value !== null)
      .map(([key, value]) => ({
        key,
        value,
        label: getFilterLabel(key, value)
      }));
  }, [filters]);

  // Función para obtener etiquetas de filtros
  const getFilterLabel = useCallback((key, value) => {
    const labels = {
      status: `Estado: ${value}`,
      doctor: `Doctor: ${value}`,
      patient: `Paciente: ${value}`,
      priority: `Prioridad: ${value}`,
      appointmentType: `Tipo: ${value}`,
      isTelemedicine: value ? 'Telemedicina' : 'Presencial',
      dateFrom: `Desde: ${value}`,
      dateTo: `Hasta: ${value}`,
      search: `Búsqueda: ${value}`
    };
    return labels[key] || `${key}: ${value}`;
  }, []);

  // Cargar citas con filtros aplicados
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
        // Asegurar que siempre obtenemos un array válido
        let appointmentsArray = [];
        if (Array.isArray(response.data?.appointments)) {
          appointmentsArray = response.data.appointments;
        } else if (Array.isArray(response.data)) {
          appointmentsArray = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          appointmentsArray = response.data.data;
        } else {
          console.warn('Estructura de datos inesperada:', response.data);
          appointmentsArray = [];
        }

        setAppointmentsData({
          appointments: appointmentsArray,
          loading: false,
          error: null,
          pagination: {
            page: response.data?.page || page,
            size: response.data?.size || size,
            total: response.data?.total || appointmentsArray.length,
            has_next: response.data?.has_next || false,
            has_prev: response.data?.has_prev || false,
          },
        });

        setLastRefresh(new Date());
        return { success: true, data: appointmentsArray };
      } else {
        const error = response.error || 'Error desconocido';
        setAppointmentsData(prev => ({ 
          ...prev, 
          appointments: [],
          loading: false, 
          error 
        }));
        return { success: false, error };
      }
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

  // Actualizar filtro específico
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Limpiar filtro específico
  const clearFilter = useCallback((key) => {
    setFilters(prev => ({ ...prev, [key]: key === 'isTelemedicine' ? null : '' }));
  }, []);

  // Limpiar todos los filtros
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

  // Cambiar página
  const changePage = useCallback((newPage) => {
    loadAppointments(newPage, appointmentsData.pagination.size);
  }, [loadAppointments, appointmentsData.pagination.size]);

  // Cambiar ordenamiento
  const changeSort = useCallback((newSortBy, newSortOrder = 'asc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  // Refrescar datos
  const refresh = useCallback(async (showToast = true) => {
    const result = await loadAppointments(
      appointmentsData.pagination.page, 
      appointmentsData.pagination.size,
      false // No mostrar loading en refresh
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

  // Operaciones CRUD
  const createAppointment = useCallback(async (appointmentData) => {
    try {
      const response = await robustApiService.createAppointment(appointmentData, token);
      if (response.success) {
        await refresh(false);
        toast({
          title: "Cita creada",
          description: "La cita se ha creado exitosamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      return response;
    } catch (error) {
      toast({
        title: "Error",
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
          title: "Cita actualizada",
          description: "La cita se ha actualizado exitosamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      return response;
    } catch (error) {
      toast({
        title: "Error",
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
          title: "Cita eliminada",
          description: "La cita se ha eliminado exitosamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      return response;
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    }
  }, [token, refresh, toast]);

  // Operaciones masivas
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
        title: "Error",
        description: "Error en operación masiva",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    }
  }, [token, refresh, toast]);

  // Gestión de selección
  const selectAppointment = useCallback((appointmentId, isSelected) => {
    if (isSelected) {
      setSelectedAppointments(prev => [...prev, appointmentId]);
    } else {
      setSelectedAppointments(prev => prev.filter(id => id !== appointmentId));
    }
  }, []);

  const selectAllAppointments = useCallback(() => {
    const allIds = appointmentsData.appointments.map(apt => apt.id);
    if (selectedAppointments.length === allIds.length) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(allIds);
    }
  }, [appointmentsData.appointments, selectedAppointments]);

  const clearSelection = useCallback(() => {
    setSelectedAppointments([]);
  }, []);

  // Efecto para carga inicial
  useEffect(() => {
    if (isAuthenticated && token) {
      loadAppointments();
    }
  }, [isAuthenticated, token]); // Solo depende de autenticación

  // Efecto para cambios de filtros
  useEffect(() => {
    if (isAuthenticated && token) {
      loadAppointments();
    }
  }, [filters, sortBy, sortOrder]); // Solo cuando cambian filtros

  // Auto-refresh reactivado - CORS funcionando
  useEffect(() => {
    if (!autoRefresh || !enableRealtime) return;
    
    const interval = setInterval(() => {
      refresh(false);
    }, Math.max(refreshInterval, 30000)); // Mínimo 30 segundos
    
    return () => clearInterval(interval);
  }, [autoRefresh, enableRealtime, refreshInterval]); // Reactivado con CORS

  return {
    // Estados
    ...appointmentsData,
    filters,
    activeFilters,
    sortBy,
    sortOrder,
    selectedAppointments,
    lastRefresh,
    
    // Funciones de filtrado
    updateFilter,
    clearFilter,
    clearAllFilters,
    getFilterLabel,
    
    // Funciones de paginación y ordenamiento
    changePage,
    changeSort,
    
    // Funciones de datos
    loadAppointments,
    refresh,
    
    // Operaciones CRUD
    createAppointment,
    updateAppointment,
    deleteAppointment,
    bulkUpdateAppointments,
    
    // Funciones de selección
    selectAppointment,
    selectAllAppointments,
    clearSelection,
    
    // Utilidades
    isSelected: (appointmentId) => selectedAppointments.includes(appointmentId),
    hasSelection: selectedAppointments.length > 0,
    selectionCount: selectedAppointments.length,
    totalAppointments: appointmentsData.appointments.length,
    hasFilters: activeFilters.length > 0,
  };
};

export default useAppointments;
