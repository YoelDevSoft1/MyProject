// SMD VITAL - Appointments Page (Professional & Optimized)
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
  ButtonGroup,
  Tooltip,
  ScaleFade,
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
  useBreakpointValue,
  Spinner,
  Center
} from '@chakra-ui/react';
import {
  MdAdd,
  MdRefresh,
  MdViewList,
  MdGridView,
  MdCalendarToday,
  MdDownload,
  MdFullscreen,
  MdFullscreenExit,
  MdClose,
  MdCheckCircle,
  MdCancel,
  MdDelete
} from 'react-icons/md';

// Custom hooks
import useAppointments from '../../../hooks/useAppointments';
import { useAuth } from '../../../contexts/AuthContext';

// Optimized components
import AppointmentFilters from '../../../components/appointments/AppointmentFilters';
import AppointmentTable from '../../../components/appointments/AppointmentTable';
import AppointmentCard from '../../../components/appointments/AppointmentCard';
import RealtimeDashboard from '../../../components/appointments/RealtimeDashboard';

// Skeleton loaders
import {
  PageSkeleton,
  AppointmentCardSkeleton,
  StatsDashboardSkeleton
} from '../../../components/ui/SkeletonLoader';

// Error handling
import AppointmentErrorBoundary from '../../../components/error/AppointmentErrorBoundary';

// Lazy loaded components
const IntelligentAppointmentBooking = lazy(() => 
  import('../../../components/IntelligentAppointmentBooking')
);
const CalendarView = lazy(() => 
  import('../../../components/appointments/CalendarView')
);

const LoadingFallback = () => (
  <Center h="200px">
    <VStack spacing={3}>
      <Spinner size="xl" color="blue.500" thickness="3px" />
      <Text fontSize="sm" color="gray.500">Cargando...</Text>
    </VStack>
  </Center>
);

const AppointmentsOptimized = () => {
  // Context hooks
  const { userDetection, user } = useAuth();
  const toast = useToast();

  // Local state
  const [viewMode, setViewMode] = useState('table');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Custom appointments hook
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
    updateFilter,
    clearFilter,
    clearAllFilters,
    changePage,
    changeSort,
    refresh,
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
    {},
    {
      autoRefresh: true,
      refreshInterval: 60000,
      enableRealtime: true,
      pageSize: 20
    }
  );

  // Modals
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isBookingOpen, onOpen: onBookingOpen, onClose: onBookingClose } = useDisclosure();

  // Theme colors
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Responsive
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Memoized handlers
  const handleViewAppointment = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    toast({
      title: "Vista de detalles",
      description: `Cita: ${appointment.appointment_number}`,
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const handleEditAppointment = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    toast({
      title: "Edición en desarrollo",
      description: "Esta funcionalidad estará disponible pronto",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const handleDeleteAppointment = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    onDeleteOpen();
  }, [onDeleteOpen]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedAppointment) return;
    
    const result = await deleteAppointment(selectedAppointment.id);
    if (result.success) {
      onDeleteClose();
      setSelectedAppointment(null);
      toast({
        title: "Cita eliminada",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [selectedAppointment, deleteAppointment, onDeleteClose, toast]);

  const handleCreateAppointment = useCallback(() => {
    setSelectedAppointment(null);
    onBookingOpen();
  }, [onBookingOpen]);

  const handleBookingSuccess = useCallback(() => {
    onBookingClose();
    refresh();
    toast({
      title: "Cita creada exitosamente",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }, [onBookingClose, refresh, toast]);

  // Bulk actions
  const handleBulkAction = useCallback(async (action) => {
    if (!hasSelection) return;

    const actionMap = {
      confirm: { status: 'CONFIRMED' },
      cancel: { status: 'CANCELLED' },
      complete: { status: 'COMPLETED' }
    };

    if (action === 'delete') {
      const results = await Promise.all(
        selectedAppointments.map(id => deleteAppointment(id))
      );
      const successCount = results.filter(r => r.success).length;
      
      toast({
        title: "Operación completada",
        description: `${successCount} de ${selectedAppointments.length} citas eliminadas`,
        status: successCount === selectedAppointments.length ? "success" : "warning",
        duration: 3000,
        isClosable: true,
      });
      clearSelection();
    } else {
      const result = await bulkUpdateAppointments(selectedAppointments, actionMap[action]);
      if (result.success) {
        clearSelection();
        toast({
          title: "Actualización masiva exitosa",
          description: `${selectedAppointments.length} citas actualizadas`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [hasSelection, selectedAppointments, bulkUpdateAppointments, deleteAppointment, clearSelection, toast]);

  // Content view memoized
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
        <Alert status="error" borderRadius="lg" variant="left-accent">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Error al cargar las citas</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
          <Button size="sm" onClick={refresh} variant="outline" colorScheme="red">
            Reintentar
          </Button>
        </Alert>
      );
    }

    if (appointments.length === 0) {
      return (
        <Box 
          p={12} 
          textAlign="center" 
          bg={cardBg} 
          borderRadius="xl" 
          borderWidth="1px" 
          borderColor={borderColor}
        >
          <Icon as={MdCalendarToday} w={16} h={16} color="gray.300" mb={4} />
          <Text fontSize="xl" fontWeight="600" color={textColor} mb={2}>
            No hay citas registradas
          </Text>
          <Text fontSize="sm" color={textColorSecondary} mb={6}>
            Comienza creando tu primera cita médica
          </Text>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            colorScheme="blue"
            onClick={handleCreateAppointment}
          >
            Nueva Cita
          </Button>
        </Box>
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
          <Suspense fallback={<LoadingFallback />}>
            <CalendarView
              appointments={appointments}
              onAppointmentClick={handleViewAppointment}
              loading={loading}
            />
          </Suspense>
        );
      
      default:
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
    userDetection, isFullscreen, isMobile, cardBg, borderColor, textColor, 
    textColorSecondary, handleCreateAppointment, refresh
  ]);

  // First load skeleton
  if (loading && appointments.length === 0 && !error) {
    return <PageSkeleton />;
  }

  return (
    <AppointmentErrorBoundary>
      <Box 
        pt={{ base: "140px", md: "120px", xl: "120px" }}
        px={{ base: "20px", md: "30px", xl: "40px" }}
        pb="40px"
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
          {/* Header */}
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
                  fontWeight="700" 
                  color={textColor}
                >
                  Gestión de Citas Médicas
                </Text>
                
                {userDetection && (
                  <Badge 
                    colorScheme="blue"
                    variant="subtle"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {userDetection.detection?.detected_type || 'usuario'}
                  </Badge>
                )}
                
                {hasFilters && (
                  <Badge 
                    colorScheme="purple" 
                    variant="subtle"
                    fontSize="xs"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
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
                Sistema completo de gestión y administración de citas médicas
              </Text>
            </VStack>
            
            <HStack spacing={2} wrap="wrap" justify={{ base: "center", lg: "flex-end" }}>
              <Button
                leftIcon={<Icon as={MdAdd} />}
                colorScheme="blue"
                size="lg"
                onClick={handleCreateAppointment}
                isDisabled={loading}
                shadow="sm"
                borderRadius="xl"
              >
                Nueva Cita
              </Button>
              
              <Tooltip label="Actualizar datos">
                <Button
                  leftIcon={<Icon as={MdRefresh} />}
                  variant="outline"
                  size="lg"
                  onClick={() => refresh()}
                  isLoading={loading}
                  borderRadius="xl"
                />
              </Tooltip>
            </HStack>
          </Flex>

          {/* Real-time Dashboard */}
          <RealtimeDashboard
            enabled={true}
            refreshInterval={60000}
            showAlerts={true}
            showTrends={true}
          />

          {/* Filters */}
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
            loading={loading}
          />

          {/* View Controls */}
          <Flex 
            direction={{ base: "column", md: "row" }} 
            justify="space-between" 
            align={{ base: "stretch", md: "center" }}
            gap={4}
            wrap="wrap"
          >
            <HStack spacing={4} wrap="wrap">
              <Text fontSize="sm" fontWeight="600" color={textColor}>
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

            <HStack spacing={2} wrap="wrap">
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

          {/* Bulk Actions */}
          {hasSelection && (
            <ScaleFade in={true}>
              <Alert 
                status="info" 
                borderRadius="xl" 
                variant="left-accent"
                bg={cardBg}
                borderWidth="1px"
                borderColor="blue.200"
              >
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle fontSize="sm" fontWeight="600">
                    {selectionCount} cita{selectionCount !== 1 ? 's' : ''} seleccionada{selectionCount !== 1 ? 's' : ''}
                  </AlertTitle>
                </Box>
                <HStack spacing={2} wrap="wrap">
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
                    colorScheme="orange"
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

          {/* Main Content */}
          {ContentView}

          {/* Pagination */}
          {appointments.length > 0 && (
            <Flex 
              direction={{ base: "column", sm: "row" }}
              justify="space-between" 
              align="center" 
              gap={4}
              p={4}
              bg={cardBg}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Button
                onClick={() => changePage(pagination.page - 1)}
                isDisabled={!pagination.has_prev || loading}
                size="md"
                variant="outline"
                width={{ base: "full", sm: "auto" }}
              >
                Anterior
              </Button>
              
              <Text 
                fontSize="sm"
                color={textColorSecondary}
                textAlign="center"
                fontWeight="500"
              >
                Página {pagination.page} de {Math.ceil(pagination.total / pagination.size)} 
                <Text as="span" color={textColor} fontWeight="600" ml={2}>
                  ({pagination.total} citas)
                </Text>
              </Text>
              
              <Button
                onClick={() => changePage(pagination.page + 1)}
                isDisabled={!pagination.has_next || loading}
                size="md"
                variant="outline"
                width={{ base: "full", sm: "auto" }}
              >
                Siguiente
              </Button>
            </Flex>
          )}
        </VStack>

        {/* Modals */}
        <Suspense fallback={null}>
          {/* Delete Confirmation Modal */}
          <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent borderRadius="xl">
              <ModalHeader>Confirmar Eliminación</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>
                  ¿Estás seguro de eliminar la cita{' '}
                  <Text as="span" fontWeight="700" color={textColor}>
                    {selectedAppointment?.appointment_number}
                  </Text>?
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

          {/* Appointment Booking Modal */}
          {isBookingOpen && (
            <IntelligentAppointmentBooking
              isOpen={isBookingOpen}
              onClose={onBookingClose}
              onSuccess={handleBookingSuccess}
            />
          )}
        </Suspense>
      </Box>
    </AppointmentErrorBoundary>
  );
};

export default AppointmentsOptimized;