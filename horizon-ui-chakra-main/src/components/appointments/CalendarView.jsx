// SMD VITAL - CalendarView Component
// Componente de vista calendario para citas médicas

import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Badge,
  Card,
  CardBody,
  Flex,
  useColorModeValue,
  Tooltip,
  SimpleGrid
} from '@chakra-ui/react';
import {
  MdChevronLeft,
  MdChevronRight,
  MdToday,
  MdEvent,
  MdVideoCall,
  MdWarning
} from 'react-icons/md';

/**
 * Componente de vista calendario para citas médicas
 * 
 * @param {Object} props - Props del componente
 * @param {Array} props.appointments - Lista de citas
 * @param {Function} props.onAppointmentClick - Función para click en cita
 * @param {boolean} props.loading - Estado de carga
 * @param {string} props.view - Tipo de vista ('month', 'week', 'day')
 * @param {Date} props.selectedDate - Fecha seleccionada
 * @param {Function} props.onDateChange - Función para cambio de fecha
 */
export const CalendarView = memo(({
  appointments = [],
  onAppointmentClick,
  loading = false,
  view = 'month',
  selectedDate = new Date(),
  onDateChange
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [calendarView, setCalendarView] = useState(view);

  // Colores del tema
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');
  const todayBg = useColorModeValue('blue.50', 'blue.900');
  const todayBorder = useColorModeValue('blue.200', 'blue.600');

  // Convertir citas a eventos del calendario
  const calendarEvents = useMemo(() => {
    return appointments.map(appointment => ({
      id: appointment.id,
      title: `${appointment.patient_name || appointment.patient_id}`,
      start: new Date(appointment.scheduled_date),
      end: new Date(new Date(appointment.scheduled_date).getTime() + (appointment.estimated_duration_minutes || 30) * 60000),
      color: getAppointmentColor(appointment.status, appointment.priority),
      status: appointment.status,
      priority: appointment.priority,
      isTelemedicine: appointment.is_telemedicine,
      originalData: appointment
    }));
  }, [appointments]);

  // Obtener color de la cita
  const getAppointmentColor = useCallback((status, priority) => {
    if (priority === 'URGENT') return 'red.500';
    if (priority === 'HIGH') return 'orange.500';
    if (status === 'COMPLETED') return 'green.500';
    if (status === 'CONFIRMED') return 'blue.500';
    if (status === 'PENDING') return 'yellow.500';
    if (status === 'CANCELLED') return 'gray.500';
    return 'gray.400';
  }, []);

  // Obtener días del mes
  const getDaysInMonth = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días del mes anterior para completar la primera semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, new Date(year, month, 0).getDate() - i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    
    // Días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  }, []);

  // Obtener eventos para una fecha específica
  const getEventsForDate = useCallback((date) => {
    if (!date) return [];
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  }, [calendarEvents]);

  // Navegar mes anterior
  const goToPreviousMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  }, [currentDate, onDateChange]);

  // Navegar mes siguiente
  const goToNextMonth = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  }, [currentDate, onDateChange]);

  // Ir a hoy
  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    onDateChange?.(today);
  }, [onDateChange]);

  // Verificar si es hoy
  const isToday = useCallback((date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  // Renderizar evento de cita
  const renderAppointmentEvent = useCallback((event) => (
    <Tooltip
      key={event.id}
      label={`${event.title} - ${event.start.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`}
    >
      <Box
        p={1}
        mb={1}
        bg={event.color}
        color="white"
        borderRadius="sm"
        fontSize="xs"
        cursor="pointer"
        onClick={() => onAppointmentClick?.(event.originalData)}
        _hover={{ opacity: 0.8 }}
        position="relative"
      >
        <HStack spacing={1} align="center">
          {event.isTelemedicine && (
            <Icon as={MdVideoCall} boxSize={3} />
          )}
          {event.priority === 'URGENT' && (
            <Icon as={MdWarning} boxSize={3} />
          )}
          <Text isTruncated flex="1">
            {event.title}
          </Text>
        </HStack>
      </Box>
    </Tooltip>
  ), [onAppointmentClick]);

  // Renderizar día del calendario
  const renderCalendarDay = useCallback((dayInfo) => {
    const { date, isCurrentMonth } = dayInfo;
    const dayEvents = getEventsForDate(date);
    const isCurrentDay = isToday(date);
    
    return (
      <Card
        key={date.toDateString()}
        minH="120px"
        bg={isCurrentDay ? todayBg : cardBg}
        borderColor={isCurrentDay ? todayBorder : borderColor}
        border="1px solid"
        opacity={isCurrentMonth ? 1 : 0.5}
        _hover={{ shadow: 'sm' }}
        cursor="pointer"
        onClick={() => onDateChange?.(date)}
      >
        <CardBody p={2}>
          <VStack align="stretch" spacing={2} h="full">
            <Text 
              fontSize="sm" 
              fontWeight={isCurrentDay ? "bold" : "medium"}
              color={isCurrentMonth ? textColor : mutedTextColor}
              textAlign="center"
            >
              {date.getDate()}
            </Text>
            
            <VStack align="stretch" spacing={1} flex="1" overflow="hidden">
              {dayEvents.slice(0, 3).map(renderAppointmentEvent)}
              
              {dayEvents.length > 3 && (
                <Text fontSize="xs" color={mutedTextColor} textAlign="center">
                  +{dayEvents.length - 3} más
                </Text>
              )}
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    );
  }, [
    getEventsForDate, isToday, todayBg, cardBg, todayBorder, 
    borderColor, textColor, mutedTextColor, onDateChange, renderAppointmentEvent
  ]);

  // Días de la semana
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const days = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <Box p={4}>
        <Text>Cargando calendario...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Header del calendario */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <HStack spacing={4}>
          <Button
            leftIcon={<Icon as={MdChevronLeft} />}
            size="sm"
            variant="outline"
            onClick={goToPreviousMonth}
            aria-label="Mes anterior"
          >
            Anterior
          </Button>
          
          <Text fontSize="xl" fontWeight="bold" color={textColor} minW="200px" textAlign="center">
            {currentDate.toLocaleDateString('es-CO', { 
              year: 'numeric', 
              month: 'long' 
            })}
          </Text>
          
          <Button
            rightIcon={<Icon as={MdChevronRight} />}
            size="sm"
            variant="outline"
            onClick={goToNextMonth}
            aria-label="Mes siguiente"
          >
            Siguiente
          </Button>
        </HStack>
        
        <HStack spacing={2}>
          <Button
            leftIcon={<Icon as={MdToday} />}
            size="sm"
            variant="outline"
            onClick={goToToday}
          >
            Hoy
          </Button>
          
          <Badge colorScheme="blue" variant="subtle">
            {calendarEvents.length} citas
          </Badge>
        </HStack>
      </Flex>

      {/* Días de la semana */}
      <SimpleGrid columns={7} gap={1} bg={cardBg} p={2} borderRadius="md">
        {weekDays.map(day => (
          <Text 
            key={day} 
            textAlign="center" 
            fontWeight="bold" 
            fontSize="sm"
            color={textColor}
            p={2}
          >
            {day}
          </Text>
        ))}
      </SimpleGrid>

      {/* Grid del calendario */}
      <SimpleGrid columns={7} gap={2}>
        {days.map(renderCalendarDay)}
      </SimpleGrid>

      {/* Leyenda */}
      <Card bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <VStack align="stretch" spacing={3}>
            <Text fontSize="sm" fontWeight="bold" color={textColor}>
              Leyenda
            </Text>
            
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
              <HStack spacing={2}>
                <Box w={3} h={3} bg="green.500" borderRadius="sm" />
                <Text fontSize="xs" color={mutedTextColor}>Completada</Text>
              </HStack>
              
              <HStack spacing={2}>
                <Box w={3} h={3} bg="blue.500" borderRadius="sm" />
                <Text fontSize="xs" color={mutedTextColor}>Confirmada</Text>
              </HStack>
              
              <HStack spacing={2}>
                <Box w={3} h={3} bg="yellow.500" borderRadius="sm" />
                <Text fontSize="xs" color={mutedTextColor}>Pendiente</Text>
              </HStack>
              
              <HStack spacing={2}>
                <Box w={3} h={3} bg="red.500" borderRadius="sm" />
                <Text fontSize="xs" color={mutedTextColor}>Urgente</Text>
              </HStack>
            </SimpleGrid>
            
            <HStack spacing={4}>
              <HStack spacing={2}>
                <Icon as={MdVideoCall} color="purple.500" boxSize={4} />
                <Text fontSize="xs" color={mutedTextColor}>Telemedicina</Text>
              </HStack>
              
              <HStack spacing={2}>
                <Icon as={MdWarning} color="red.500" boxSize={4} />
                <Text fontSize="xs" color={mutedTextColor}>Prioridad Urgente</Text>
              </HStack>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
});

CalendarView.displayName = 'CalendarView';

export default CalendarView;
