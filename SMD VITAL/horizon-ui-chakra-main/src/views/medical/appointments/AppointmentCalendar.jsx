import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  Badge,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Grid,
  GridItem,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  MdChevronLeft,
  MdChevronRight,
  MdToday,
  MdCalendarToday,
  MdAccessTime,
  MdPerson,
  MdLocalHospital,
  MdAttachMoney,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdVisibility,
  MdEdit,
  MdDelete,
} from "react-icons/md";
import { useAuth } from "contexts/AuthContext";
import apiService from "services/apiService";

const AppointmentCalendar = () => {
  const { token, isAuthenticated } = useAuth();
  
  // State
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  
  // Modals
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  
  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "secondaryGray.400");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const bgColor = useColorModeValue("white", "navy.800");
  const boxShadow = useColorModeValue("14px 17px 40px 4px rgba(112, 144, 176, 0.08)", "14px 17px 40px 4px rgba(112, 144, 176, 0.08)");
  const brandColor = useColorModeValue("brand.500", "brand.500");
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.100");

  // Load appointments
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      
      if (viewMode === 'month') {
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      } else if (viewMode === 'week') {
        const day = startDate.getDay();
        startDate.setDate(startDate.getDate() - day);
        endDate.setDate(startDate.getDate() + 6);
      } else if (viewMode === 'day') {
        endDate.setDate(startDate.getDate() + 1);
      }
      
      const response = await apiService.getAppointments(token, {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        limit: 1000,
      });
      
      if (response.success) {
        setAppointments(response.data.appointments);
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setError('Error al cargar las citas');
    } finally {
      setLoading(false);
    }
  }, [token, currentDate, viewMode]);

  // Load data on mount
  useEffect(() => {
    if (isAuthenticated && token) {
      loadAppointments();
    }
  }, [isAuthenticated, token, loadAppointments]);

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.scheduled_date);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      PENDING: "yellow",
      CONFIRMED: "blue",
      IN_PROGRESS: "purple",
      COMPLETED: "green",
      CANCELLED: "red",
      NO_SHOW: "gray",
      RESCHEDULED: "orange",
    };
    return colors[status] || "gray";
  };

  // Get status text in Spanish
  const getStatusText = (status) => {
    const texts = {
      PENDING: "Pendiente",
      CONFIRMED: "Confirmada",
      IN_PROGRESS: "En Progreso",
      COMPLETED: "Completada",
      CANCELLED: "Cancelada",
      NO_SHOW: "No Asistió",
      RESCHEDULED: "Reprogramada",
    };
    return texts[status] || status;
  };

  // Get appointment type text in Spanish
  const getAppointmentTypeText = (type) => {
    const texts = {
      CONSULTATION: "Consulta",
      FOLLOW_UP: "Seguimiento",
      EMERGENCY: "Emergencia",
      PROCEDURE: "Procedimiento",
      PREVENTIVE: "Preventivo",
      SPECIALIST: "Especialista",
      TELEMEDICINE: "Telemedicina",
    };
    return texts[type] || type;
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    onDetailsOpen();
  };

  // Render month view
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return (
      <Grid templateColumns="repeat(7, 1fr)" gap={1}>
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <GridItem key={day} p={2} textAlign="center" fontWeight="bold" color={textColorSecondary}>
            {day}
          </GridItem>
        ))}
        {days.map((date, index) => {
          const dayAppointments = getAppointmentsForDate(date);
          const isCurrentMonth = date.getMonth() === month;
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <GridItem
              key={index}
              minH="120px"
              p={2}
              border="1px solid"
              borderColor={borderColor}
              bg={isCurrentMonth ? bgColor : hoverBg}
              opacity={isCurrentMonth ? 1 : 0.5}
            >
              <VStack align="stretch" spacing={1}>
                <Text
                  fontSize="sm"
                  fontWeight={isToday ? "bold" : "normal"}
                  color={isToday ? brandColor : textColor}
                >
                  {date.getDate()}
                </Text>
                {dayAppointments.slice(0, 3).map(appointment => (
                  <Box
                    key={appointment.id}
                    p={1}
                    bg={getStatusBadgeColor(appointment.status) + ".100"}
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => handleAppointmentClick(appointment)}
                    _hover={{ bg: getStatusBadgeColor(appointment.status) + ".200" }}
                  >
                    <Text fontSize="xs" fontWeight="medium" noOfLines={1}>
                      {formatTime(appointment.scheduled_date)}
                    </Text>
                    <Text fontSize="xs" noOfLines={1}>
                      {appointment.appointment_number}
                    </Text>
                  </Box>
                ))}
                {dayAppointments.length > 3 && (
                  <Text fontSize="xs" color={textColorSecondary}>
                    +{dayAppointments.length - 3} más
                  </Text>
                )}
              </VStack>
            </GridItem>
          );
        })}
      </Grid>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const startDate = new Date(currentDate);
    const day = startDate.getDay();
    startDate.setDate(startDate.getDate() - day);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return (
      <Grid templateColumns="repeat(7, 1fr)" gap={4}>
        {days.map((date, index) => {
          const dayAppointments = getAppointmentsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <GridItem key={index}>
              <Card>
                <CardHeader pb={2}>
                  <Text
                    fontSize="sm"
                    fontWeight={isToday ? "bold" : "normal"}
                    color={isToday ? brandColor : textColor}
                    textAlign="center"
                  >
                    {date.toLocaleDateString('es-CO', { weekday: 'short' })}
                  </Text>
                  <Text
                    fontSize="lg"
                    fontWeight={isToday ? "bold" : "normal"}
                    color={isToday ? brandColor : textColor}
                    textAlign="center"
                  >
                    {date.getDate()}
                  </Text>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={2} align="stretch">
                    {dayAppointments.map(appointment => (
                      <Box
                        key={appointment.id}
                        p={2}
                        bg={getStatusBadgeColor(appointment.status) + ".100"}
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => handleAppointmentClick(appointment)}
                        _hover={{ bg: getStatusBadgeColor(appointment.status) + ".200" }}
                      >
                        <Text fontSize="xs" fontWeight="medium">
                          {formatTime(appointment.scheduled_date)}
                        </Text>
                        <Text fontSize="xs" noOfLines={1}>
                          {appointment.appointment_number}
                        </Text>
                        <Badge
                          size="sm"
                          colorScheme={getStatusBadgeColor(appointment.status)}
                        >
                          {getStatusText(appointment.status)}
                        </Badge>
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          );
        })}
      </Grid>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate);
    
    return (
      <VStack spacing={4} align="stretch">
        {dayAppointments.length === 0 ? (
          <Text textAlign="center" color={textColorSecondary} py={8}>
            No hay citas programadas para este día
          </Text>
        ) : (
          dayAppointments.map(appointment => (
            <Card
              key={appointment.id}
              cursor="pointer"
              onClick={() => handleAppointmentClick(appointment)}
              _hover={{ boxShadow: "lg" }}
            >
              <CardBody>
                <HStack justify="space-between" align="start">
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Text fontWeight="bold" color={brandColor}>
                        {appointment.appointment_number}
                      </Text>
                      <Badge colorScheme={getStatusBadgeColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color={textColorSecondary}>
                      {formatTime(appointment.scheduled_date)} - {appointment.estimated_duration_minutes} min
                    </Text>
                    <Text fontSize="sm">
                      {getAppointmentTypeText(appointment.appointment_type)}
                    </Text>
                    {appointment.chief_complaint && (
                      <Text fontSize="sm" color={textColorSecondary} noOfLines={2}>
                        {appointment.chief_complaint}
                      </Text>
                    )}
                  </VStack>
                  <VStack align="end" spacing={2}>
                    <Text fontSize="sm" fontWeight="medium">
                      {appointment.estimated_cost ? formatCurrency(appointment.estimated_cost) : 'N/A'}
                    </Text>
                    {appointment.is_telemedicine && (
                      <Badge colorScheme="purple" variant="subtle">
                        Virtual
                      </Badge>
                    )}
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))
        )}
      </VStack>
    );
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color={brandColor} />
          <Text color={textColorSecondary}>Cargando calendario...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={1}>
          <Text color={textColor} fontSize="2xl" fontWeight="bold">
            Calendario de Citas
          </Text>
          <Text color={textColorSecondary} fontSize="md">
            {formatDate(currentDate)}
          </Text>
        </VStack>
        
        <HStack spacing={2}>
          <Button
            size="sm"
            variant={viewMode === 'month' ? 'solid' : 'outline'}
            onClick={() => setViewMode('month')}
          >
            Mes
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'week' ? 'solid' : 'outline'}
            onClick={() => setViewMode('week')}
          >
            Semana
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'day' ? 'solid' : 'outline'}
            onClick={() => setViewMode('day')}
          >
            Día
          </Button>
        </HStack>
      </Flex>

      {/* Navigation */}
      <Flex justify="space-between" align="center" mb={4}>
        <HStack spacing={2}>
          <IconButton
            icon={<Icon as={MdChevronLeft} />}
            onClick={goToPrevious}
            size="sm"
            variant="outline"
          />
          <Button
            leftIcon={<Icon as={MdToday} />}
            onClick={goToToday}
            size="sm"
            variant="outline"
          >
            Hoy
          </Button>
          <IconButton
            icon={<Icon as={MdChevronRight} />}
            onClick={goToNext}
            size="sm"
            variant="outline"
          />
        </HStack>
        
        <Text color={textColor} fontSize="lg" fontWeight="medium">
          {formatDate(currentDate)}
        </Text>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert status="error" borderRadius="lg" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>Error al cargar el calendario</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Calendar Content */}
      <Card>
        <CardBody>
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </CardBody>
      </Card>

      {/* Appointment Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalles de la Cita</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAppointment && (
              <VStack align="stretch" spacing={4}>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontWeight="bold" color={textColorSecondary} fontSize="sm">
                      Número de Cita
                    </Text>
                    <Text color={brandColor} fontWeight="bold">
                      {selectedAppointment.appointment_number}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color={textColorSecondary} fontSize="sm">
                      Estado
                    </Text>
                    <Badge colorScheme={getStatusBadgeColor(selectedAppointment.status)}>
                      {getStatusText(selectedAppointment.status)}
                    </Badge>
                  </Box>
                </Grid>
                
                <Divider />
                
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontWeight="bold" color={textColorSecondary} fontSize="sm">
                      Fecha y Hora
                    </Text>
                    <Text>{formatDate(new Date(selectedAppointment.scheduled_date))}</Text>
                    <Text fontSize="sm" color={textColorSecondary}>
                      {formatTime(selectedAppointment.scheduled_date)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color={textColorSecondary} fontSize="sm">
                      Duración
                    </Text>
                    <Text>{selectedAppointment.estimated_duration_minutes} minutos</Text>
                  </Box>
                </Grid>
                
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontWeight="bold" color={textColorSecondary} fontSize="sm">
                      Tipo de Cita
                    </Text>
                    <Text>{getAppointmentTypeText(selectedAppointment.appointment_type)}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color={textColorSecondary} fontSize="sm">
                      Costo
                    </Text>
                    <Text>
                      {selectedAppointment.estimated_cost ? formatCurrency(selectedAppointment.estimated_cost) : 'N/A'}
                    </Text>
                  </Box>
                </Grid>
                
                {selectedAppointment.chief_complaint && (
                  <Box>
                    <Text fontWeight="bold" color={textColorSecondary} fontSize="sm">
                      Motivo de Consulta
                    </Text>
                    <Text>{selectedAppointment.chief_complaint}</Text>
                  </Box>
                )}
                
                {selectedAppointment.symptoms && (
                  <Box>
                    <Text fontWeight="bold" color={textColorSecondary} fontSize="sm">
                      Síntomas
                    </Text>
                    <Text>{selectedAppointment.symptoms}</Text>
                  </Box>
                )}
                
                {selectedAppointment.notes && (
                  <Box>
                    <Text fontWeight="bold" color={textColorSecondary} fontSize="sm">
                      Notas
                    </Text>
                    <Text>{selectedAppointment.notes}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailsClose}>
              Cerrar
            </Button>
            <Button colorScheme="blue">
              Editar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AppointmentCalendar;

