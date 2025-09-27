// SMD VITAL - AppointmentCard Component
// Componente optimizado para mostrar tarjeta de cita médica

import React, { memo, useCallback } from 'react';
import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  Checkbox,
  Flex,
  Tooltip,
  useColorModeValue,
  Box,
  Divider
} from '@chakra-ui/react';
import {
  MdMoreVert,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdCalendarToday,
  MdPerson,
  MdLocalHospital,
  MdVideoCall,
  MdPhone,
  MdAccessTime,
  MdAttachMoney
} from 'react-icons/md';

/**
 * Componente de tarjeta de cita médica optimizado
 * 
 * @param {Object} props - Props del componente
 * @param {Object} props.appointment - Datos de la cita
 * @param {Function} props.onEdit - Función para editar cita
 * @param {Function} props.onDelete - Función para eliminar cita
 * @param {Function} props.onView - Función para ver detalles
 * @param {boolean} props.isSelected - Si la cita está seleccionada
 * @param {Function} props.onSelect - Función para seleccionar/deseleccionar
 * @param {Function} props.onDragStart - Función para iniciar drag
 * @param {boolean} props.isDragging - Si se está arrastrando
 * @param {boolean} props.showActions - Si mostrar acciones (default: true)
 * @param {boolean} props.showSelection - Si mostrar checkbox (default: true)
 * @param {string} props.size - Tamaño de la tarjeta ('sm', 'md', 'lg')
 */
export const AppointmentCard = memo(({
  appointment,
  onEdit,
  onDelete,
  onView,
  isSelected = false,
  onSelect,
  onDragStart,
  isDragging = false,
  showActions = true,
  showSelection = true,
  size = 'md'
}) => {
  // Colores del tema
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const selectedBorderColor = useColorModeValue('blue.500', 'blue.300');

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

  const getPriorityColor = useCallback((priority) => {
    const colors = {
      URGENT: 'red',
      HIGH: 'orange',
      MEDIUM: 'yellow',
      LOW: 'green'
    };
    return colors[priority] || 'gray';
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

  const getPriorityLabel = useCallback((priority) => {
    const labels = {
      URGENT: 'Urgente',
      HIGH: 'Alta',
      MEDIUM: 'Media',
      LOW: 'Baja'
    };
    return labels[priority] || priority;
  }, []);

  // Handlers memoizados
  const handleSelect = useCallback((e) => {
    e.stopPropagation();
    onSelect?.(e.target.checked);
  }, [onSelect]);

  const handleDragStart = useCallback((e) => {
    onDragStart?.(appointment);
  }, [onDragStart, appointment]);

  const handleView = useCallback((e) => {
    e.stopPropagation();
    onView?.(appointment);
  }, [onView, appointment]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    onEdit?.(appointment);
  }, [onEdit, appointment]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete?.(appointment);
  }, [onDelete, appointment]);

  // Formateo de fecha y hora
  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const formatTime = useCallback((date) => {
    return new Date(date).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  // Tamaños según prop size
  const sizes = {
    sm: {
      padding: 3,
      fontSize: 'xs',
      spacing: 2,
      iconSize: 4
    },
    md: {
      padding: 4,
      fontSize: 'sm',
      spacing: 3,
      iconSize: 5
    },
    lg: {
      padding: 5,
      fontSize: 'md',
      spacing: 4,
      iconSize: 6
    }
  };

  const currentSize = sizes[size];

  if (!appointment) {
    return null;
  }

  return (
    <Card
      cursor="pointer"
      draggable={!!onDragStart}
      onDragStart={handleDragStart}
      opacity={isDragging ? 0.5 : 1}
      border="2px solid"
      borderColor={isSelected ? selectedBorderColor : borderColor}
      bg={isSelected ? selectedBg : cardBg}
      _hover={{ 
        shadow: 'md', 
        borderColor: isSelected ? selectedBorderColor : 'blue.300',
        transform: 'translateY(-2px)',
        transition: 'all 0.2s'
      }}
      transition="all 0.2s"
      role="article"
      aria-label={`Cita médica ${appointment.appointment_number}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleView(e);
        }
      }}
    >
      <CardBody p={currentSize.padding}>
        {/* Header con selección y menú */}
        <Flex justify="space-between" align="flex-start" mb={currentSize.spacing}>
          {showSelection && (
            <Checkbox
              isChecked={isSelected}
              onChange={handleSelect}
              colorScheme="blue"
              size={size}
              aria-label="Seleccionar cita"
            />
          )}
          
          <VStack align="flex-end" spacing={1}>
            <Text 
              fontSize="xs" 
              color={mutedTextColor}
              fontWeight="medium"
            >
              #{appointment.appointment_number}
            </Text>
            
            {showActions && (
              <Menu placement="bottom-end">
                <MenuButton
                  as={Button}
                  size="xs"
                  variant="ghost"
                  aria-label="Opciones de cita"
                  _hover={{ bg: 'gray.100' }}
                >
                  <Icon as={MdMoreVert} boxSize={currentSize.iconSize} />
                </MenuButton>
                <MenuList>
                  <MenuItem 
                    onClick={handleView} 
                    icon={<Icon as={MdVisibility} />}
                  >
                    Ver Detalles
                  </MenuItem>
                  <MenuItem 
                    onClick={handleEdit} 
                    icon={<Icon as={MdEdit} />}
                  >
                    Editar
                  </MenuItem>
                  <MenuItem 
                    onClick={handleDelete} 
                    icon={<Icon as={MdDelete} />}
                    color="red.500"
                    _hover={{ bg: 'red.50' }}
                  >
                    Eliminar
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </VStack>
        </Flex>

        <VStack align="stretch" spacing={currentSize.spacing}>
          {/* Información del paciente */}
          <Box>
            <HStack spacing={2} mb={1}>
              <Icon as={MdPerson} color="blue.500" boxSize={currentSize.iconSize} />
              <Text 
                fontSize={currentSize.fontSize} 
                fontWeight="bold" 
                color={textColor}
                isTruncated
                title={appointment.patient_name || appointment.patient_id}
              >
                {appointment.patient_name || appointment.patient_id}
              </Text>
            </HStack>
            
            <HStack spacing={2} mb={1}>
              <Icon as={MdLocalHospital} color="green.500" boxSize={currentSize.iconSize} />
              <Text 
                fontSize="xs" 
                color={mutedTextColor}
                isTruncated
                title={appointment.professional_name || appointment.professional_id}
              >
                Dr. {appointment.professional_name || appointment.professional_id}
              </Text>
            </HStack>
          </Box>

          <Divider />

          {/* Fecha y hora */}
          <HStack spacing={2}>
            <Icon as={MdCalendarToday} color="purple.500" boxSize={currentSize.iconSize} />
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="xs" color={textColor} fontWeight="medium">
                {formatDate(appointment.scheduled_date)}
              </Text>
              <Text fontSize="xs" color={mutedTextColor}>
                {formatTime(appointment.scheduled_date)}
              </Text>
            </VStack>
          </HStack>

          {/* Duración estimada */}
          {appointment.estimated_duration_minutes && (
            <HStack spacing={2}>
              <Icon as={MdAccessTime} color="orange.500" boxSize={currentSize.iconSize} />
              <Text fontSize="xs" color={mutedTextColor}>
                {appointment.estimated_duration_minutes} min
              </Text>
            </HStack>
          )}

          {/* Costo estimado */}
          {appointment.estimated_cost && (
            <HStack spacing={2}>
              <Icon as={MdAttachMoney} color="green.600" boxSize={currentSize.iconSize} />
              <Text fontSize="xs" color={mutedTextColor} fontWeight="medium">
                ${appointment.estimated_cost.toLocaleString()}
              </Text>
            </HStack>
          )}

          <Divider />

          {/* Badges de estado y prioridad */}
          <HStack spacing={2} wrap="wrap">
            <Badge 
              colorScheme={getStatusColor(appointment.status)} 
              size={size}
              variant="subtle"
            >
              {getStatusLabel(appointment.status)}
            </Badge>
            
            {appointment.priority && (
              <Badge 
                colorScheme={getPriorityColor(appointment.priority)} 
                size={size}
                variant="outline"
              >
                {getPriorityLabel(appointment.priority)}
              </Badge>
            )}
            
            {appointment.is_telemedicine && (
              <Tooltip label="Consulta virtual">
                <Badge colorScheme="purple" size={size} variant="solid">
                  <HStack spacing={1}>
                    <Icon as={MdVideoCall} boxSize={3} />
                    <Text>Virtual</Text>
                  </HStack>
                </Badge>
              </Tooltip>
            )}
            
            {appointment.appointment_type && (
              <Badge colorScheme="gray" size={size} variant="subtle">
                {appointment.appointment_type}
              </Badge>
            )}
          </HStack>

          {/* Notas si existen */}
          {appointment.notes && (
            <Box>
              <Text fontSize="xs" color={mutedTextColor} noOfLines={2}>
                {appointment.notes}
              </Text>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
});

AppointmentCard.displayName = 'AppointmentCard';

export default AppointmentCard;
