// SMD VITAL - AppointmentTable Component
// Tabla optimizada de citas médicas con accesibilidad mejorada

import React, { memo, useCallback, useMemo } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Badge,
  HStack,
  VStack,
  IconButton,
  Tooltip,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Icon,
  useColorModeValue,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Flex,
  Spacer
} from '@chakra-ui/react';
import {
  MdVisibility,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdVideoCall,
  MdPhone,
  MdCalendarToday,
  MdPerson,
  MdLocalHospital,
  MdArrowUpward,
  MdArrowDownward,
  MdUnfoldMore
} from 'react-icons/md';

/**
 * Componente de tabla de citas médicas optimizado
 * 
 * @param {Object} props - Props del componente
 * @param {Array} props.appointments - Lista de citas
 * @param {boolean} props.loading - Estado de carga
 * @param {string} props.error - Mensaje de error
 * @param {Array} props.selectedAppointments - Citas seleccionadas
 * @param {Function} props.onSelectAppointment - Función para seleccionar cita
 * @param {Function} props.onSelectAll - Función para seleccionar todas
 * @param {Function} props.onView - Función para ver detalles
 * @param {Function} props.onEdit - Función para editar
 * @param {Function} props.onDelete - Función para eliminar
 * @param {Function} props.onSort - Función para ordenar
 * @param {string} props.sortBy - Campo de ordenamiento
 * @param {string} props.sortOrder - Orden actual
 * @param {Object} props.userDetection - Información del tipo de usuario
 * @param {boolean} props.responsive - Si usar diseño responsive (default: true)
 */
export const AppointmentTable = memo(({
  appointments = [],
  loading = false,
  error = null,
  selectedAppointments = [],
  onSelectAppointment,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onSort,
  sortBy = 'date',
  sortOrder = 'asc',
  userDetection = null,
  responsive = true
}) => {
  // Colores del tema
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const textColorSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  // Funciones de utilidad memoizadas
  const getStatusColor = useCallback((status) => {
    const colors = {
      PENDING: 'yellow',
      CONFIRMED: 'blue',
      IN_PROGRESS: 'purple',
      COMPLETED: 'green',
      CANCELLED: 'red',
      NO_SHOW: 'gray',
      RESCHEDULED: 'orange'
    };
    return colors[status] || 'gray';
  }, []);

  const getStatusLabel = useCallback((status) => {
    const labels = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmada',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      NO_SHOW: 'No Asistió',
      RESCHEDULED: 'Reprogramada'
    };
    return labels[status] || status;
  }, []);

  const getPriorityColor = useCallback((priority) => {
    const colors = {
      URGENT: 'red',
      HIGH: 'orange',
      MEDIUM: 'yellow',
      LOW: 'green'
    };
    return colors[priority] || 'gray';
  }, []);

  // Handlers memoizados
  const handleSelectAll = useCallback(() => {
    onSelectAll?.();
  }, [onSelectAll]);

  const handleSelectAppointment = useCallback((appointmentId, isSelected) => {
    onSelectAppointment?.(appointmentId, isSelected);
  }, [onSelectAppointment]);

  const handleSort = useCallback((field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort?.(field, newOrder);
  }, [sortBy, sortOrder, onSort]);

  // Funciones de acción memoizadas
  const createActionHandler = useCallback((action, appointment) => {
    return (e) => {
      e.stopPropagation();
      action?.(appointment);
    };
  }, []);

  // Columnas de la tabla
  const columns = useMemo(() => [
    {
      key: 'select',
      label: '',
      width: '50px',
      sortable: false,
      responsive: false
    },
    {
      key: 'appointment_number',
      label: 'Número',
      sortable: true,
      responsive: false
    },
    {
      key: 'patient',
      label: 'Paciente',
      sortable: true,
      responsive: false
    },
    {
      key: 'professional',
      label: 'Profesional',
      sortable: true,
      responsive: responsive ? { base: false, md: true } : false
    },
    {
      key: 'service',
      label: 'Servicio',
      sortable: false,
      responsive: responsive ? { base: false, lg: true } : false
    },
    {
      key: 'date',
      label: 'Fecha',
      sortable: true,
      responsive: false
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      responsive: false
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      responsive: false,
      width: '150px'
    }
  ], [responsive]);

  // Renderizar header de columna con ordenamiento
  const renderColumnHeader = useCallback((column) => {
    if (!column.sortable) {
      return (
        <Text fontSize="sm" fontWeight="semibold" color={textColor}>
          {column.label}
        </Text>
      );
    }

    const isActive = sortBy === column.key;
    const icon = isActive
      ? sortOrder === 'asc' ? MdArrowUpward : MdArrowDownward
      : MdUnfoldMore;

    return (
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Icon as={icon} />}
        onClick={() => handleSort(column.key)}
        fontWeight="semibold"
        color={isActive ? 'blue.500' : textColor}
        _hover={{ bg: 'transparent', color: 'blue.500' }}
        p={0}
        h="auto"
        aria-label={`Ordenar por ${column.label}`}
      >
        {column.label}
      </Button>
    );
  }, [sortBy, sortOrder, textColor, handleSort]);

  // Renderizar celda de selección
  const renderSelectCell = useCallback((appointment) => (
    <Checkbox
      isChecked={selectedAppointments.includes(appointment.id)}
      onChange={(e) => handleSelectAppointment(appointment.id, e.target.checked)}
      colorScheme="blue"
      aria-label={`Seleccionar cita ${appointment.appointment_number}`}
    />
  ), [selectedAppointments, handleSelectAppointment]);

  // Renderizar acciones
  const renderActions = useCallback((appointment) => (
    <HStack spacing={1}>
      <Tooltip label="Ver Detalles">
        <IconButton
          aria-label="Ver Detalles"
          icon={<Icon as={MdVisibility} />}
          size="sm"
          variant="ghost"
          onClick={createActionHandler(onView, appointment)}
        />
      </Tooltip>
      
      <Tooltip label="Editar">
        <IconButton
          aria-label="Editar"
          icon={<Icon as={MdEdit} />}
          size="sm"
          variant="ghost"
          onClick={createActionHandler(onEdit, appointment)}
        />
      </Tooltip>
      
      <Tooltip label="Eliminar">
        <IconButton
          aria-label="Eliminar"
          icon={<Icon as={MdDelete} />}
          size="sm"
          variant="ghost"
          colorScheme="red"
          onClick={createActionHandler(onDelete, appointment)}
        />
      </Tooltip>

      {appointment.is_telemedicine && (
        <Tooltip label="Consulta Virtual">
          <IconButton
            aria-label="Consulta Virtual"
            icon={<Icon as={MdVideoCall} />}
            size="sm"
            variant="ghost"
            colorScheme="purple"
          />
        </Tooltip>
      )}
    </HStack>
  ), [onView, onEdit, onDelete, createActionHandler]);

  // Skeleton loader para filas
  const renderSkeletonRows = useCallback(() => (
    Array.from({ length: 5 }).map((_, index) => (
      <Tr key={`skeleton-${index}`}>
        {columns.map((column) => (
          <Td 
            key={column.key}
            display={column.responsive ? column.responsive : 'table-cell'}
          >
            <Skeleton height="20px" />
          </Td>
        ))}
      </Tr>
    ))
  ), [columns]);

  // Si hay error, mostrar alerta
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

  return (
    <TableContainer 
      maxW="100%"
      overflowX="auto"
      borderRadius="md"
      border="1px solid"
      borderColor={borderColor}
    >
      <Table 
        variant="simple" 
        size={{ base: 'sm', md: 'md' }}
        role="table"
        aria-label="Tabla de citas médicas"
      >
        <Thead bg={hoverBg}>
          <Tr>
            {columns.map((column) => (
              <Th
                key={column.key}
                width={column.width}
                display={column.responsive ? column.responsive : 'table-cell'}
                borderColor={borderColor}
              >
                {column.key === 'select' ? (
                  <Checkbox
                    isChecked={
                      appointments.length > 0 && 
                      selectedAppointments.length === appointments.length
                    }
                    isIndeterminate={
                      selectedAppointments.length > 0 && 
                      selectedAppointments.length < appointments.length
                    }
                    onChange={handleSelectAll}
                    colorScheme="blue"
                    aria-label="Seleccionar todas las citas"
                  />
                ) : (
                  renderColumnHeader(column)
                )}
              </Th>
            ))}
          </Tr>
        </Thead>
        
        <Tbody>
          {loading ? (
            renderSkeletonRows()
          ) : appointments.length === 0 ? (
            <Tr>
              <Td colSpan={columns.length} textAlign="center" py={10}>
                <VStack spacing={3}>
                  <Icon as={MdCalendarToday} boxSize={12} color="gray.300" />
                  <Text color={textColorSecondary} fontSize="lg">
                    No hay citas para mostrar
                  </Text>
                  <Text color={textColorSecondary} fontSize="sm">
                    Intenta ajustar los filtros o crear una nueva cita
                  </Text>
                </VStack>
              </Td>
            </Tr>
          ) : (
            appointments.map((appointment) => (
              <Tr
                key={appointment.id}
                _hover={{ bg: hoverBg }}
                cursor="pointer"
                onClick={createActionHandler(onView, appointment)}
                role="row"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onView?.(appointment);
                  }
                }}
              >
                {/* Selección */}
                <Td onClick={(e) => e.stopPropagation()}>
                  {renderSelectCell(appointment)}
                </Td>

                {/* Número de cita */}
                <Td>
                  <Text fontWeight="bold" color={textColor} fontSize="sm">
                    {appointment.appointment_number}
                  </Text>
                </Td>

                {/* Paciente */}
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium" isTruncated maxW="150px">
                      {appointment.patient_name || appointment.patient_id}
                    </Text>
                    {appointment.patient_phone && (
                      <Text fontSize="xs" color={textColorSecondary}>
                        {appointment.patient_phone}
                      </Text>
                    )}
                  </VStack>
                </Td>

                {/* Profesional */}
                <Td display={{ base: 'none', md: responsive ? 'table-cell' : 'table-cell' }}>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium" isTruncated maxW="150px">
                      Dr. {appointment.professional_name || appointment.professional_id}
                    </Text>
                    <Text fontSize="xs" color={textColorSecondary}>
                      {appointment.specialty || 'Medicina General'}
                    </Text>
                  </VStack>
                </Td>

                {/* Servicio */}
                <Td display={{ base: 'none', lg: responsive ? 'table-cell' : 'table-cell' }}>
                  <Text fontSize="sm" isTruncated maxW="120px">
                    {appointment.service_name || appointment.medical_service_id}
                  </Text>
                </Td>

                {/* Fecha */}
                <Td>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium">
                      {new Date(appointment.scheduled_date).toLocaleDateString('es-CO')}
                    </Text>
                    <Text fontSize="xs" color={textColorSecondary}>
                      {new Date(appointment.scheduled_date).toLocaleTimeString('es-CO', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </VStack>
                </Td>

                {/* Estado */}
                <Td>
                  <VStack align="start" spacing={1}>
                    <Badge
                      colorScheme={getStatusColor(appointment.status)}
                      size="sm"
                      variant="subtle"
                    >
                      {getStatusLabel(appointment.status)}
                    </Badge>
                    
                    {appointment.priority && (
                      <Badge
                        colorScheme={getPriorityColor(appointment.priority)}
                        size="sm"
                        variant="outline"
                      >
                        {appointment.priority}
                      </Badge>
                    )}
                    
                    {appointment.is_telemedicine && (
                      <Badge colorScheme="purple" size="sm">
                        Virtual
                      </Badge>
                    )}
                  </VStack>
                </Td>

                {/* Acciones */}
                <Td onClick={(e) => e.stopPropagation()}>
                  {renderActions(appointment)}
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
});

AppointmentTable.displayName = 'AppointmentTable';

export default AppointmentTable;
