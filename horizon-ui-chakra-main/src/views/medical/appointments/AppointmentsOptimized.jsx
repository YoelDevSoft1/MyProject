// SMD VITAL - Appointments Page (OPTIMIZED)
// Página de citas médicas completamente optimizada con todos los componentes reutilizables

import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Badge,
  useDisclosure,
  useToast,
  useColorModeValue,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  ButtonGroup,
  Tooltip,
  ScaleFade,
  Fade,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useBreakpointValue
} from '@chakra-ui/react';
import {
  MdAdd,
  MdRefresh,
  MdViewList,
  MdGridView,
  MdCalendarToday,
  MdSettings,
  MdDownload,
  MdPrint,
  MdFullscreen,
  MdFullscreenExit,
  MdUndo,
  MdRedo,
  MdClose,
  MdCheckCircle,
  MdCancel,
  MdDelete
} from 'react-icons/md';

// Importaciones de hooks personalizados
import useAppointments from '../../../hooks/useAppointments';
import { useAuth } from '../../../contexts/AuthContext';

// Importaciones de componentes optimizados
import AppointmentFilters from '../../../components/appointments/AppointmentFilters';
import AppointmentTable from '../../../components/appointments/AppointmentTable';
import AppointmentCard from '../../../components/appointments/AppointmentCard';
import RealtimeDashboard from '../../../components/appointments/RealtimeDashboard';

// Importaciones de skeleton loaders
import {
  PageSkeleton,
  AppointmentCardSkeleton,
  StatsDashboardSkeleton,
  FiltersSkeleton
} from '../../../components/ui/SkeletonLoader';

// Importaciones de error handling
import AppointmentErrorBoundary from '../../../components/error/AppointmentErrorBoundary';
import DataDebugger from '../../../components/debug/DataDebugger';
import RobustCorsStatus from '../../../components/system/RobustCorsStatus';

// Lazy loading de componentes pesados
const IntelligentAppointmentBooking = lazy(() => 
  import('../../../components/IntelligentAppointmentBooking')
);
const MedicalConsultationModal = lazy(() => 
  import('../../../components/MedicalConsultationModal')
);
const PrescriptionViewer = lazy(() => 
  import('../../../components/PrescriptionViewer')
);
const CalendarView = lazy(() => 
  import('../../../components/appointments/CalendarView')
);

/**
 * Componente principal de citas médicas optimizado
 * Utiliza todos los hooks personalizados y componentes reutilizables
 */
const AppointmentsOptimized = () => {
  // Hooks de contexto
  const { userDetection, detectUserType, user, token } = useAuth();
  const toast = useToast();

  // Estados locales
  const [viewMode, setViewMode] = useState('table'); // table, grid, calendar
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [savedFilters, setSavedFilters] = useState([]);

  // Hook personalizado de citas
  const {
    appointments,
    loading,
    error,
    pagination,
    filters,
    activeFilters,
    sortBy,
    sortOrder,
    selectedAppointments,
    lastRefresh,
    updateFilter,
    clearFilter,
    clearAllFilters,
    changePage,
    changeSort,
    refresh,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    bulkUpdateAppointments,
    selectAppointment,
    selectAllAppointments,
    clearSelection,
    isSelected,
    hasSelection,
    selectionCount,
    hasFilters,
    loadAppointments
  } = useAppointments(
    {}, // filtros iniciales
    {
      autoRefresh: true,
      refreshInterval: 30000,
      enableRealtime: true,
      pageSize: 20
    }
  );

  // Modals
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isBookingOpen, onOpen: onBookingOpen, onClose: onBookingClose } = useDisclosure();
  const { isOpen: isConsultationOpen, onOpen: onConsultationOpen, onClose: onConsultationClose } = useDisclosure();
  const { isOpen: isPrescriptionOpen, onOpen: onPrescriptionOpen, onClose: onPrescriptionClose } = useDisclosure();

  // Colores del tema
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const pageBg = useColorModeValue('gray.50', 'gray.900');

  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

  // Handlers memoizados para mejor rendimiento
  const handleViewAppointment = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    onDetailsOpen();
  }, [onDetailsOpen]);

  const handleEditAppointment = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    // Aquí iría la lógica de edición
    toast({
      title: "Función en desarrollo",
      description: "La edición de citas estará disponible pronto",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const handleDeleteAppointment = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    onDeleteOpen();
  }, [onDeleteOpen]);

  const handleCreateAppointment = useCallback(() => {
    setSelectedAppointment(null);
    onBookingOpen();
  }, [onBookingOpen]);

  const handleStartConsultation = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    setSelectedPatient(appointment.patient);
    onConsultationOpen();
  }, [onConsultationOpen]);

  const handleViewPrescriptions = useCallback((appointment) => {
    setSelectedPatient(appointment.patient);
    onPrescriptionOpen();
  }, [onPrescriptionOpen]);

  // Handlers de acciones masivas
  const handleBulkAction = useCallback(async (action) => {
    if (!hasSelection) return;

    const actionMap = {
      confirm: { status: 'CONFIRMED' },
      cancel: { status: 'CANCELLED' },
      complete: { status: 'COMPLETED' }
    };

    if (action === 'delete') {
      // Lógica especial para eliminación
      const results = await Promise.all(
        selectedAppointments.map(id => deleteAppointment(id))
      );
      const successCount = results.filter(r => r.success).length;
      
      toast({
        title: "Eliminación completada",
        description: `${successCount} de ${selectedAppointments.length} citas eliminadas`,
        status: successCount === selectedAppointments.length ? "success" : "warning",
        duration: 3000,
        isClosable: true,
      });
    } else {
      const result = await bulkUpdateAppointments(selectedAppointments, actionMap[action]);
      if (result.success) {
        clearSelection();
      }
    }
  }, [hasSelection, selectedAppointments, bulkUpdateAppointments, deleteAppointment, clearSelection, toast]);

  // Handlers de filtros
  const handleSaveFilter = useCallback((name) => {
    const newFilter = {
      id: Date.now(),
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };
    setSavedFilters(prev => [...prev, newFilter]);
  }, [filters]);

  const handleLoadSavedFilter = useCallback((savedFilter) => {
    Object.entries(savedFilter.filters).forEach(([key, value]) => {
      updateFilter(key, value);
    });
  }, [updateFilter]);

  // Handlers de undo/redo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const lastAction = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, lastAction]);
    setUndoStack(prev => prev.slice(0, -1));
    
    // Aplicar la acción inversa
    if (lastAction.type === 'update') {
      updateAppointment(lastAction.appointmentId, lastAction.previousData);
    }
  }, [undoStack, updateAppointment]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const action = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, action]);
    setRedoStack(prev => prev.slice(0, -1));
    
    // Aplicar la acción
    if (action.type === 'update') {
      updateAppointment(action.appointmentId, action.newData);
    }
  }, [redoStack, updateAppointment]);

  // Handler de confirmación de eliminación
  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedAppointment) return;
    
    const result = await deleteAppointment(selectedAppointment.id);
    if (result.success) {
      onDeleteClose();
      setSelectedAppointment(null);
    }
  }, [selectedAppointment, deleteAppointment, onDeleteClose]);

  // Handlers de éxito de modals
  const handleBookingSuccess = useCallback(() => {
    onBookingClose();
    refresh();
  }, [onBookingClose, refresh]);

  const handleConsultationSuccess = useCallback(() => {
    onConsultationClose();
    refresh();
  }, [onConsultationClose, refresh]);

  // Componente de vista de contenido memoizado
  const ContentView = useMemo(() => {
    if (loading && appointments.length === 0) {
      return viewMode === 'grid' ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
          <AppointmentCardSkeleton count={8} />
        </SimpleGrid>
      ) : (
        <StatsDashboardSkeleton />
      );
    }

    if (error) {
      return (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error al cargar las citas</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      );
    }

    switch (viewMode) {
      case 'grid':
        return (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onView={handleViewAppointment}
                onEdit={handleEditAppointment}
                onDelete={handleDeleteAppointment}
                isSelected={isSelected(appointment.id)}
                onSelect={(selected) => selectAppointment(appointment.id, selected)}
                size={isMobile ? 'sm' : 'md'}
              />
            ))}
          </SimpleGrid>
        );
      
      case 'calendar':
        return (
          <Suspense fallback={<StatsDashboardSkeleton />}>
            <CalendarView
              appointments={appointments}
              onAppointmentClick={handleViewAppointment}
              loading={loading}
            />
          </Suspense>
        );
      
      default: // table
        return (
          <AppointmentTable
            appointments={appointments}
            loading={loading}
            error={error}
            selectedAppointments={selectedAppointments}
            onSelectAppointment={selectAppointment}
            onSelectAll={selectAllAppointments}
            onView={handleViewAppointment}
            onEdit={handleEditAppointment}
            onDelete={handleDeleteAppointment}
            onSort={changeSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            userDetection={userDetection}
            responsive={!isFullscreen}
          />
        );
    }
  }, [
    viewMode, loading, appointments, error, selectedAppointments, isSelected,
    handleViewAppointment, handleEditAppointment, handleDeleteAppointment,
    selectAppointment, selectAllAppointments, changeSort, sortBy, sortOrder,
    userDetection, isFullscreen, isMobile
  ]);

  // Si está cargando por primera vez, mostrar skeleton completo
  if (loading && appointments.length === 0 && !error) {
    return <PageSkeleton />;
  }

  return (
    <AppointmentErrorBoundary>
      {/* Debug info en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <DataDebugger 
          data={{
            appointments: appointments.slice(0, 2), // Solo primeras 2 para evitar spam
            loading,
            error,
            pagination,
            filters,
            activeFilters,
            selectedAppointments,
            hasSelection,
            selectionCount
          }}
          title="Appointments Data Debug"
        />
      )}
      
      <Box 
        pt={{ base: "120px", md: "80px" }}
        px={{ base: 4, md: 6, lg: 8 }}
        pb={8}
        minH="100vh"
        bg={pageBg}
        position={isFullscreen ? "fixed" : "relative"}
        top={isFullscreen ? 0 : "auto"}
        left={isFullscreen ? 0 : "auto"}
        right={isFullscreen ? 0 : "auto"}
        bottom={isFullscreen ? 0 : "auto"}
        zIndex={isFullscreen ? 9999 : "auto"}
      >
      <VStack spacing={6} align="stretch">
        {/* Estado de CORS exitoso */}
        <RobustCorsStatus />
        
        {/* Header optimizado */}
        <Flex 
          direction={{ base: "column", lg: "row" }} 
          justify="space-between" 
          align={{ base: "stretch", lg: "center" }}
          gap={4}
        >
          <VStack align={{ base: "center", lg: "start" }} spacing={2}>
            <HStack spacing={3} wrap="wrap" justify={{ base: "center", lg: "start" }}>
              <Text 
                fontSize={{ base: "xl", md: "2xl", lg: "3xl" }} 
                fontWeight="bold" 
                color={textColor}
              >
                Gestión de Citas Médicas
              </Text>
              
              {userDetection && (
                <Badge 
                  colorScheme={userDetection.detection?.confidence > 0.7 ? "green" : "yellow"} 
                  variant="subtle"
                  fontSize="xs"
                >
                  {userDetection.detection?.detected_type || 'usuario'}
                </Badge>
              )}
              
              {hasFilters && (
                <Badge colorScheme="blue" variant="subtle">
                  {activeFilters.length} filtro{activeFilters.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </HStack>
            
            <Text 
              color={textColorSecondary} 
              fontSize={{ base: "sm", md: "md" }}
              textAlign={{ base: "center", lg: "left" }}
              maxW="600px"
            >
              {userDetection?.detection?.detected_type === 'patient' 
                ? "Gestiona tus citas médicas y agenda nuevas consultas"
                : userDetection?.detection?.detected_type === 'doctor'
                ? "Administra tu agenda médica y atiende a tus pacientes"
                : "Sistema completo de gestión de citas médicas SMD VITAL"
              }
            </Text>
          </VStack>
          
          <HStack spacing={2} wrap="wrap" justify={{ base: "center", lg: "flex-end" }}>
            <Button
              leftIcon={<Icon as={MdAdd} />}
              colorScheme="blue"
              size={{ base: "md", lg: "lg" }}
              onClick={handleCreateAppointment}
              isDisabled={loading}
            >
              Nueva Cita
            </Button>
            
            <Tooltip label="Actualizar datos">
              <Button
                leftIcon={<Icon as={MdRefresh} />}
                variant="outline"
                size={{ base: "md", lg: "lg" }}
                onClick={() => refresh()}
                isLoading={loading}
              />
            </Tooltip>
          </HStack>
        </Flex>

        {/* Dashboard en tiempo real - CORS funcionando! */}
        <RealtimeDashboard
          enabled={true} // ¡Reactivado con CORS funcionando!
          refreshInterval={60000} // 1 minuto - CORS resuelto
          showAlerts={true}
          showTrends={true}
        />

        {/* Filtros inteligentes */}
        <AppointmentFilters
          filters={filters}
          activeFilters={activeFilters}
          updateFilter={updateFilter}
          clearFilter={clearFilter}
          clearAllFilters={clearAllFilters}
          onApplyFilters={loadAppointments}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={changeSort}
          savedFilters={savedFilters}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={handleLoadSavedFilter}
          loading={loading}
        />

        {/* Controles avanzados */}
        <Flex 
          direction={{ base: "column", md: "row" }} 
          justify="space-between" 
          align={{ base: "stretch", md: "center" }}
          gap={4}
          wrap="wrap"
        >
          {/* Controles de vista */}
          <HStack spacing={4} wrap="wrap">
            <Text fontSize="sm" fontWeight="medium" color={textColor}>
              Vista:
            </Text>
            <ButtonGroup size="sm" isAttached variant="outline">
              <Button
                leftIcon={<Icon as={MdViewList} />}
                colorScheme={viewMode === 'table' ? 'blue' : 'gray'}
                variant={viewMode === 'table' ? 'solid' : 'outline'}
                onClick={() => setViewMode('table')}
              >
                Tabla
              </Button>
              <Button
                leftIcon={<Icon as={MdGridView} />}
                colorScheme={viewMode === 'grid' ? 'blue' : 'gray'}
                variant={viewMode === 'grid' ? 'solid' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                Cuadrícula
              </Button>
              <Button
                leftIcon={<Icon as={MdCalendarToday} />}
                colorScheme={viewMode === 'calendar' ? 'blue' : 'gray'}
                variant={viewMode === 'calendar' ? 'solid' : 'outline'}
                onClick={() => setViewMode('calendar')}
              >
                Calendario
              </Button>
            </ButtonGroup>
          </HStack>

          {/* Controles de acción */}
          <HStack spacing={2} wrap="wrap">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon as={MdUndo} />}
              onClick={handleUndo}
              isDisabled={undoStack.length === 0}
              title="Deshacer última acción"
            >
              Deshacer
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon as={MdRedo} />}
              onClick={handleRedo}
              isDisabled={redoStack.length === 0}
              title="Rehacer acción"
            >
              Rehacer
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon as={isFullscreen ? MdFullscreenExit : MdFullscreen} />}
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? 'Salir' : 'Pantalla Completa'}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon as={MdDownload} />}
              title="Exportar datos"
            >
              Exportar
            </Button>
          </HStack>
        </Flex>

        {/* Acciones masivas */}
        {hasSelection && (
          <ScaleFade in={true}>
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle fontSize="sm">
                  {selectionCount} cita{selectionCount !== 1 ? 's' : ''} seleccionada{selectionCount !== 1 ? 's' : ''}
                </AlertTitle>
              </Box>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  leftIcon={<Icon as={MdCheckCircle} />}
                  colorScheme="green"
                  onClick={() => handleBulkAction('confirm')}
                >
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Icon as={MdCancel} />}
                  colorScheme="red"
                  onClick={() => handleBulkAction('cancel')}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Icon as={MdDelete} />}
                  colorScheme="red"
                  variant="outline"
                  onClick={() => handleBulkAction('delete')}
                >
                  Eliminar
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Icon as={MdClose} />}
                  variant="ghost"
                  onClick={clearSelection}
                >
                  Cancelar
                </Button>
              </HStack>
            </Alert>
          </ScaleFade>
        )}

        {/* Contenido principal */}
        <Fade in={true}>
          {ContentView}
        </Fade>

        {/* Paginación */}
        {appointments.length > 0 && (
          <Flex 
            direction={{ base: "column", sm: "row" }}
            justify="space-between" 
            align="center" 
            gap={4}
          >
            <Button
              onClick={() => changePage(pagination.page - 1)}
              isDisabled={!pagination.has_prev || loading}
              size={{ base: "sm", md: "md" }}
              width={{ base: "full", sm: "auto" }}
            >
              Anterior
            </Button>
            
            <Text 
              fontSize={{ base: "sm", md: "md" }}
              color={textColorSecondary}
              textAlign="center"
            >
              Página {pagination.page} de {Math.ceil(pagination.total / pagination.size)} 
              ({pagination.total} citas en total)
            </Text>
            
            <Button
              onClick={() => changePage(pagination.page + 1)}
              isDisabled={!pagination.has_next || loading}
              size={{ base: "sm", md: "md" }}
              width={{ base: "full", sm: "auto" }}
            >
              Siguiente
            </Button>
          </Flex>
        )}
      </VStack>

      {/* Modals con lazy loading */}
      <Suspense fallback={<div>Cargando...</div>}>
        {/* Modal de detalles */}
        <Modal 
          isOpen={isDetailsOpen} 
          onClose={onDetailsClose} 
          size={{ base: "full", md: "xl" }}
          scrollBehavior="inside"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Detalles de la Cita</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedAppointment && (
                <VStack align="start" spacing={4}>
                  {/* Aquí iría el contenido de detalles */}
                  <Text>Cita: {selectedAppointment.appointment_number}</Text>
                  <Text>Paciente: {selectedAppointment.patient_id}</Text>
                  <Text>Estado: {selectedAppointment.status}</Text>
                  {/* ... más detalles */}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onDetailsClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de confirmación de eliminación */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirmar Eliminación</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                ¿Estás seguro de que quieres eliminar la cita{' '}
                <strong>{selectedAppointment?.appointment_number}</strong>?
                Esta acción no se puede deshacer.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm}>
                Eliminar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de creación de cita */}
        {isBookingOpen && (
          <IntelligentAppointmentBooking
            isOpen={isBookingOpen}
            onClose={onBookingClose}
            onSuccess={handleBookingSuccess}
          />
        )}

        {/* Modal de consulta médica */}
        {isConsultationOpen && (
          <MedicalConsultationModal
            isOpen={isConsultationOpen}
            onClose={onConsultationClose}
            appointment={selectedAppointment}
            onSuccess={handleConsultationSuccess}
          />
        )}

        {/* Modal de recetas */}
        {isPrescriptionOpen && (
          <Modal isOpen={isPrescriptionOpen} onClose={onPrescriptionClose} size="6xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Recetas Médicas</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {selectedPatient && (
                  <PrescriptionViewer
                    patientId={selectedPatient.id}
                    showAll={true}
                    limit={20}
                  />
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </Suspense>
      </Box>
    </AppointmentErrorBoundary>
  );
};

export default AppointmentsOptimized;
