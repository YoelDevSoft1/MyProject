// SMD VITAL - Intelligent Appointment Booking Component
// Componente de agendamiento inteligente integrado con detección de usuarios

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  SimpleGrid,
  Divider,
  Progress,
  Tooltip,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import {
  MdAdd,
  MdSearch,
  MdSchedule,
  MdPerson,
  MdLocalHospital,
  MdCheckCircle,
  MdWarning,
  MdRefresh,
  MdClose
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import appointmentBookingService from '../services/appointmentBookingService';

const IntelligentAppointmentBooking = ({ isOpen, onClose, onSuccess }) => {
  const { userDetection, hasPermission } = useAuth();
  const [step, setStep] = useState('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [formData, setFormData] = useState({
    chief_complaint: '',
    symptoms: '',
    notes: '',
    appointment_type: 'CONSULTATION'
  });
  const [timeLeft, setTimeLeft] = useState(0);
  
  const toast = useToast();
  
  // Colores del tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const doctorNameColor = useColorModeValue('gray.800', 'white');
  const doctorSpecialtyColor = useColorModeValue('gray.600', 'gray.300');
  const doctorDeptColor = useColorModeValue('gray.500', 'gray.400');

  // Detectar tipo de usuario y configurar interfaz
  const userType = userDetection?.detection?.detected_type || 'patient';
  // Permitir búsqueda de doctores para cualquier usuario activo
  const canBookAppointments = true; // Simplificado para permitir a todos los usuarios

  // Efecto para countdown de reserva
  useEffect(() => {
    if (reservation && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setReservation(null);
            setStep('search');
            toast({
              title: "Reserva expirada",
              description: "La reserva temporal ha expirado. Por favor, selecciona otro horario.",
              status: "warning",
              duration: 5000,
              isClosable: true,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [reservation, timeLeft, toast]);

  // Buscar doctores por especialidad
  const searchDoctors = async (specialty = '') => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Buscando doctores con especialidad:', specialty);
      const response = await appointmentBookingService.searchAvailableDoctors(
        specialty,
        localStorage.getItem('smd_vital_token'),
        { is_active: true }
      );
      
      console.log('📋 Respuesta del servicio:', response);
      
      if (response.success) {
        console.log('✅ Doctores encontrados:', response.data);
        // Asegurar que siempre sea un array
        const doctorsArray = Array.isArray(response.data) ? response.data : [];
        setDoctors(doctorsArray);
        setStep('select_doctor');
      } else {
        console.error('❌ Error en la respuesta:', response.error);
        setError(response.error);
        setDoctors([]); // Asegurar que sea un array vacío en caso de error
      }
    } catch (err) {
      console.error('💥 Error en la búsqueda:', err);
      setError(err.message);
      setDoctors([]); // Asegurar que sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Obtener horarios disponibles
  const getAvailableSlots = async (doctorId, date) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔧 [IntelligentAppointmentBooking] Doctor ID recibido:', doctorId);
      console.log('🔧 [IntelligentAppointmentBooking] Fecha recibida:', date);
      
      // Generar UUID temporal directamente aquí para evitar problemas de cache
      const generateUUID = (id) => {
        const paddedId = String(id).padStart(4, '0');
        return `550e8400-e29b-41d4-a716-${paddedId}${paddedId}${paddedId}`;
      };
      
      const uuid = generateUUID(doctorId);
      console.log('🔧 [IntelligentAppointmentBooking] UUID generado:', uuid);
      
      // Formatear fecha
      let formattedDate = date;
      if (date.includes('T')) {
        formattedDate = date.split('T')[0];
      }
      console.log('🔧 [IntelligentAppointmentBooking] Fecha formateada:', formattedDate);
      
      const response = await appointmentBookingService.getAvailableSlots(
        uuid, // Usar UUID en lugar del ID original
        formattedDate,
        localStorage.getItem('smd_vital_token')
      );
      
      console.log('🔧 [IntelligentAppointmentBooking] Respuesta:', response);
      
      if (response.success) {
        setAvailableSlots(response.data);
        setStep('select_slot');
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('🔧 [IntelligentAppointmentBooking] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear reserva temporal
  const createReservation = async (doctorId, slot) => {
    setLoading(true);
    
    try {
      const response = await appointmentBookingService.createTemporaryReservation({
        doctor_id: doctorId,
        slot_datetime: slot,
        patient_id: userDetection?.user_id,
        medical_service_id: 'default-service', // TODO: Obtener del formulario
        appointment_type: formData.appointment_type
      }, localStorage.getItem('smd_vital_token'));
      
      if (response.success) {
        setReservation(response.data);
        setTimeLeft(Math.floor(response.data.time_left_seconds || 300));
        setStep('confirm');
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Confirmar cita
  const confirmAppointment = async () => {
    if (!reservation) return;
    
    setLoading(true);
    
    try {
      const response = await appointmentBookingService.confirmReservation(
        reservation.reservation_id,
        formData,
        localStorage.getItem('smd_vital_token')
      );
      
      if (response.success) {
        toast({
          title: "¡Cita agendada exitosamente!",
          description: `Tu cita ha sido confirmada. Número: ${response.data.appointment_number}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        onSuccess?.(response.data);
        handleClose();
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal y resetear estado
  const handleClose = () => {
    setStep('search');
    setError(null);
    setDoctors([]);
    setSelectedDoctor(null);
    setAvailableSlots([]);
    setSelectedSlot(null);
    setReservation(null);
    setTimeLeft(0);
    setFormData({
      chief_complaint: '',
      symptoms: '',
      notes: '',
      appointment_type: 'CONSULTATION'
    });
    onClose();
  };

  // Formatear tiempo restante
  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Renderizar paso de búsqueda
  const renderSearchStep = () => (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="semibold" color={textColor}>
        Buscar Doctor por Especialidad
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {[
          'Medicina General',
          'Cardiología',
          'Pediatría',
          'Ginecología',
          'Neurología',
          'Dermatología'
        ].map(specialty => (
          <Button
            key={specialty}
            variant="outline"
            onClick={() => searchDoctors(specialty)}
            leftIcon={<Icon as={MdSearch} />}
          >
            {specialty}
          </Button>
        ))}
      </SimpleGrid>
      
      <Button
        colorScheme="blue"
        onClick={() => searchDoctors()}
        leftIcon={<Icon as={MdSearch} />}
      >
        Ver Todos los Doctores
      </Button>
    </VStack>
  );

  // Renderizar paso de selección de doctor
  const renderDoctorSelection = () => {
    console.log('🔍 Renderizando selección de doctores, paso actual:', step);
    console.log('🔍 Doctores disponibles:', doctors);
    
    return (
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="semibold" color={textColor}>
            Seleccionar Doctor
          </Text>
          <Button size="sm" variant="outline" onClick={() => setStep('search')}>
            <Icon as={MdClose} />
          </Button>
        </HStack>
      
      <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
        {console.log('🔍 Renderizando doctores:', doctors, 'Tipo:', typeof doctors, 'Es array:', Array.isArray(doctors))}
        {!Array.isArray(doctors) || doctors.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={4}>
            {!Array.isArray(doctors) ? 'Error: Los doctores no son un array' : 'No se encontraron doctores'}
          </Text>
        ) : (
          doctors.map(doctor => (
          <Card
            key={doctor.id}
            cursor="pointer"
            onClick={() => {
              setSelectedDoctor(doctor);
              getAvailableSlots(doctor.id, new Date().toISOString().split('T')[0]);
            }}
            _hover={{ 
              bg: cardHoverBg,
              transform: 'translateY(-2px)',
              shadow: 'md'
            }}
            transition="all 0.2s"
          >
            <CardBody>
              <HStack justify="space-between">
                <VStack align="flex-start" spacing={1}>
                  <Text 
                    fontWeight="semibold" 
                    color={doctorNameColor}
                  >
                    {doctor.name}
                  </Text>
                  <Text 
                    fontSize="sm" 
                    color={doctorSpecialtyColor}
                  >
                    {doctor.specialty}
                  </Text>
                  <Text 
                    fontSize="xs" 
                    color={doctorDeptColor}
                  >
                    {doctor.department}
                  </Text>
                </VStack>
                <Icon as={MdLocalHospital} color="blue.500" />
              </HStack>
            </CardBody>
          </Card>
          ))
        )}
      </VStack>
    </VStack>
    );
  };

  // Renderizar paso de selección de horario
  const renderSlotSelection = () => (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <VStack align="flex-start" spacing={1}>
          <Text fontSize="lg" fontWeight="semibold" color={textColor}>
            Seleccionar Horario
          </Text>
          <Text fontSize="sm" color="gray.600">
            Dr. {selectedDoctor?.name} - {selectedDoctor?.specialty}
          </Text>
        </VStack>
        <Button size="sm" variant="outline" onClick={() => setStep('select_doctor')}>
          <Icon as={MdClose} />
        </Button>
      </HStack>
      
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
        {availableSlots.map(slot => (
          <Button
            key={slot.datetime}
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedSlot(slot);
              createReservation(selectedDoctor.id, slot.datetime);
            }}
            isDisabled={!slot.available}
          >
            {slot.time}
          </Button>
        ))}
      </SimpleGrid>
    </VStack>
  );

  // Renderizar paso de confirmación
  const renderConfirmation = () => (
    <VStack spacing={4} align="stretch">
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Reserva Temporal Activa</AlertTitle>
          <AlertDescription fontSize="sm">
            Tienes {formatTimeLeft(timeLeft)} para completar tu reserva
          </AlertDescription>
        </Box>
      </Alert>
      
      <Progress value={(timeLeft / 300) * 100} colorScheme="orange" size="sm" />
      
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="semibold" color={textColor}>
          Confirmar Cita
        </Text>
        
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={2}>
              <HStack justify="space-between">
                <Text fontWeight="medium">Doctor:</Text>
                <Text>{selectedDoctor?.name}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="medium">Especialidad:</Text>
                <Text>{selectedDoctor?.specialty}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="medium">Fecha y Hora:</Text>
                <Text>{new Date(selectedSlot?.datetime).toLocaleString()}</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
        
        <FormControl>
          <FormLabel>Motivo de Consulta</FormLabel>
          <Input
            value={formData.chief_complaint}
            onChange={(e) => setFormData(prev => ({ ...prev, chief_complaint: e.target.value }))}
            placeholder="Describe brevemente el motivo de tu consulta"
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Síntomas (Opcional)</FormLabel>
          <Textarea
            value={formData.symptoms}
            onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
            placeholder="Describe los síntomas que experimentas"
            rows={3}
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Tipo de Cita</FormLabel>
          <Select
            value={formData.appointment_type}
            onChange={(e) => setFormData(prev => ({ ...prev, appointment_type: e.target.value }))}
          >
            <option value="CONSULTATION">Consulta General</option>
            <option value="FOLLOW_UP">Seguimiento</option>
            <option value="PREVENTIVE">Preventiva</option>
            <option value="SPECIALIST">Especialista</option>
          </Select>
        </FormControl>
      </VStack>
    </VStack>
  );

  if (!canBookAppointments) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Acceso Restringido</AlertTitle>
          <AlertDescription>
            No tienes permisos para agendar citas. Contacta al administrador.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={2}>
            <Icon as={MdAdd} color="brand.500" />
            <Text>Agendar Nueva Cita</Text>
            {userType !== 'patient' && (
              <Badge colorScheme="blue" variant="subtle">
                {userType}
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <VStack spacing={4} py={8}>
              <Spinner size="xl" color="brand.500" />
              <Text color={textColor}>Cargando...</Text>
            </VStack>
          ) : (
            <>
              {step === 'search' && renderSearchStep()}
              {step === 'select_doctor' && renderDoctorSelection()}
              {step === 'select_slot' && renderSlotSelection()}
              {step === 'confirm' && renderConfirmation()}
            </>
          )}
        </ModalBody>
        
        <ModalFooter>
          <HStack spacing={2}>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            {step === 'confirm' && (
              <Button
                colorScheme="green"
                onClick={confirmAppointment}
                isLoading={loading}
                leftIcon={<Icon as={MdCheckCircle} />}
              >
                Confirmar Cita
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default IntelligentAppointmentBooking;
