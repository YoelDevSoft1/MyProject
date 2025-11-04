/**
 * SMD VITAL - Módulo de Gestión de Pacientes Avanzado
 * ====================================================
 * 
 * Módulo completo para gestión de pacientes con:
 * - Perfiles médicos completos
 * - Historial médico
 * - Contactos de emergencia
 * - Alergias y condiciones
 * - Seguimiento de salud
 * - Integración con IA
 * 
 * Author: Senior Developer Team
 * Version: 2.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Icon,
  useColorModeValue,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Flex,
  Spacer,
  Grid,
  GridItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Switch,
  Divider,
  Wrap,
  WrapItem,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  ScaleFade,
  Fade,
  SlideFade,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Image,
  Link,
  Code,
  List,
  ListItem,
  ListIcon,
  Avatar,
  AvatarBadge,
  AvatarGroup,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputLeftElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import {
  MdPerson,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdDownload,
  MdPrint,
  MdShare,
  MdSettings,
  MdLocalHospital,
  MdCheckCircle,
  MdCancel,
  MdWarning,
  MdRefresh,
  MdTrendingUp,
  MdAnalytics,
  MdDashboard,
  MdMedication,
  MdFavorite,
  MdThermostat,
  MdBloodtype,
  MdImage,
  MdDescription,
  MdHistory,
  MdTimeline,
  MdInsights,
  MdCameraAlt,
  MdAttachFile,
  MdSecurity,
  MdLock,
  MdPublic,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdCalendarToday,
  MdAccessTime,
  MdEmergency,
  MdHealthAndSafety,
  MdMonitorHeart,
  MdVaccines,
  MdLocalPharmacy,
  MdAssignment,
  MdNote,
  MdFlag,
  MdInfo,
  MdStar,
  MdStarBorder,
  MdFileCopy
} from 'react-icons/md';
import { FaUser, FaUserMd, FaCalendarAlt, FaClock, FaFileMedical, FaStethoscope, FaHeartbeat, FaPills, FaAllergies } from 'react-icons/fa';
import businessLogicService from '../../../services/core/BusinessLogicService';
import notificationService from '../../../services/core/NotificationService';
import aiService from '../../../services/core/AIService';
import apiService from '../../../services/apiService';

const AdvancedPatients = () => {
  // =====================================================
  // ESTADOS Y HOOKS
  // =====================================================

  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isEmergencyOpen, onOpen: onEmergencyOpen, onClose: onEmergencyClose } = useDisclosure();

  // Estados principales
  const [patients, setPatients] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Estados de filtros
  const [filters, setFilters] = useState({
    status: 'all',
    ageRange: 'all',
    gender: 'all',
    bloodType: 'all',
    hasAllergies: 'all'
  });

  // Estados de formularios
  const [patientForm, setPatientForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_primary: '',
    date_of_birth: '',
    gender: '',
    blood_type: '',
    rh_factor: '',
    allergies: [],
    chronic_conditions: [],
    current_medications: [],
    emergency_contacts: [],
    medical_notes: '',
    insurance_info: {}
  });

  const [emergencyContactForm, setEmergencyContactForm] = useState({
    name: '',
    relationship: '',
    phone_primary: '',
    phone_secondary: '',
    email: '',
    address: '',
    is_primary: false
  });

  // Colores del tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const textColorSecondary = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.600');

  // =====================================================
  // EFECTOS
  // =====================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadPatients();
  }, [filters, searchTerm]);

  // =====================================================
  // FUNCIONES DE CARGA DE DATOS
  // =====================================================

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPatients(),
        loadMedicalRecords(),
        loadAppointments(),
        loadVitalSigns(),
        loadAllergies()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los datos iniciales',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const params = {
        ...filters,
        search: searchTerm
      };

      const response = await apiService.get('/patients', { params });
      // Extraer datos de la respuesta del API
      const patientsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los pacientes',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const loadMedicalRecords = async () => {
    try {
      const response = await apiService.get('/medical-records');
      // Extraer datos de la respuesta del API
      const recordsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setMedicalRecords(recordsData);
    } catch (error) {
      console.error('Error loading medical records:', error);
    }
  };

  const loadAppointments = async () => {
    try {
      const response = await apiService.get('/appointments');
      // Extraer datos de la respuesta del API
      const appointmentsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadVitalSigns = async () => {
    try {
      const response = await apiService.get('/vital-signs');
      // Extraer datos de la respuesta del API
      const vitalSignsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setVitalSigns(vitalSignsData);
    } catch (error) {
      console.error('Error loading vital signs:', error);
    }
  };

  const loadAllergies = async () => {
    try {
      const response = await apiService.get('/allergies');
      // Extraer datos de la respuesta del API
      const allergiesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setAllergies(allergiesData);
    } catch (error) {
      console.error('Error loading allergies:', error);
    }
  };

  // =====================================================
  // FUNCIONES DE GESTIÓN DE PACIENTES
  // =====================================================

  const handleCreatePatient = async () => {
    try {
      setLoading(true);
      
      // Usar lógica de negocio para crear paciente
      const patient = await businessLogicService.createPatient(patientForm);
      
      setPatients(prev => [patient, ...prev]);
      onCreateClose();
      
      // Limpiar formulario
      setPatientForm({
        first_name: '',
        last_name: '',
        email: '',
        phone_primary: '',
        date_of_birth: '',
        gender: '',
        blood_type: '',
        rh_factor: '',
        allergies: [],
        chronic_conditions: [],
        current_medications: [],
        emergency_contacts: [],
        medical_notes: '',
        insurance_info: {}
      });

      toast({
        title: 'Paciente Creado',
        description: 'El paciente ha sido creado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al crear el paciente',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async (patientId, updates) => {
    try {
      setLoading(true);
      
      const response = await apiService.put(`/patients/${patientId}`, updates);
      const updatedPatient = response.data;
      
      setPatients(prev => 
        prev.map(patient => patient.id === patientId ? updatedPatient : patient)
      );
      
      onEditClose();
      
      toast({
        title: 'Paciente Actualizado',
        description: 'El paciente ha sido actualizado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar el paciente',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmergencyContact = async () => {
    try {
      if (!selectedPatient) return;

      const response = await apiService.post(`/patients/${selectedPatient.id}/emergency-contacts`, emergencyContactForm);
      
      // Actualizar paciente local
      setSelectedPatient(prev => ({
        ...prev,
        emergency_contacts: [...(prev.emergency_contacts || []), response.data]
      }));
      
      onEmergencyClose();
      
      // Limpiar formulario
      setEmergencyContactForm({
        name: '',
        relationship: '',
        phone_primary: '',
        phone_secondary: '',
        email: '',
        address: '',
        is_primary: false
      });

      toast({
        title: 'Contacto Agregado',
        description: 'El contacto de emergencia ha sido agregado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      toast({
        title: 'Error',
        description: 'Error al agregar el contacto de emergencia',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  // =====================================================
  // FUNCIONES DE UTILIDAD
  // =====================================================

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getGenderIcon = (gender) => {
    return gender === 'male' ? '♂' : gender === 'female' ? '♀' : '⚥';
  };

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'A+': 'red',
      'A-': 'red',
      'B+': 'blue',
      'B-': 'blue',
      'AB+': 'purple',
      'AB-': 'purple',
      'O+': 'green',
      'O-': 'green'
    };
    return colors[bloodType] || 'gray';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPatientStats = (patientId) => {
    const patientRecords = medicalRecords.filter(record => record.patient_id === patientId);
    const patientAppointments = appointments.filter(apt => apt.patient_id === patientId);
    const patientVitals = vitalSigns.filter(vs => vs.patient_id === patientId);

    return {
      totalRecords: patientRecords.length,
      totalAppointments: patientAppointments.length,
      lastAppointment: patientAppointments.length > 0 ? patientAppointments[0].scheduled_date : null,
      lastVitals: patientVitals.length > 0 ? patientVitals[0].recorded_at : null
    };
  };

  // =====================================================
  // COMPONENTES DE UI
  // =====================================================

  const PatientCard = ({ patient }) => {
    const stats = getPatientStats(patient.id);
    const age = patient.date_of_birth ? calculateAge(patient.date_of_birth) : 'N/A';

    return (
      <ScaleFade in={true} initialScale={0.95}>
        <Card
          bg={cardBg}
          borderColor={borderColor}
          _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
          transition="all 0.2s"
        >
          <CardHeader pb={2}>
            <Flex align="center" justify="space-between">
              <HStack spacing={3}>
                <Avatar
                  name={`${patient.first_name} ${patient.last_name}`}
                  src={patient.avatar_url}
                  size="md"
                >
                  <AvatarBadge
                    boxSize="1.25em"
                    bg={patient.status === 'active' ? 'green.500' : 'red.500'}
                  />
                </Avatar>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color={textColor}>
                    {patient.first_name} {patient.last_name}
                  </Text>
                  <Text fontSize="sm" color={textColorSecondary}>
                    {patient.patient_code} • {age} años • {getGenderIcon(patient.gender)}
                  </Text>
                </VStack>
              </HStack>
              <Badge
                colorScheme={patient.status === 'active' ? 'green' : 'red'}
              >
                {patient.status}
              </Badge>
            </Flex>
          </CardHeader>

          <CardBody pt={0}>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={MdBloodtype} color="red.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient.blood_type || 'No especificado'}
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={MdEmail} color="blue.500" />
                  <Text fontSize="sm" color={textColor} noOfLines={1}>
                    {patient.email}
                  </Text>
                </HStack>
              </HStack>

              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={MdPhone} color="green.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient.phone_primary || 'No especificado'}
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={MdCalendarToday} color="purple.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient.date_of_birth ? formatDate(patient.date_of_birth) : 'No especificado'}
                  </Text>
                </HStack>
              </HStack>

              {patient.allergies && patient.allergies.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={1}>
                    Alergias:
                  </Text>
                  <Wrap spacing={1}>
                    {patient.allergies.slice(0, 3).map((allergy, index) => (
                      <WrapItem key={index}>
                        <Badge colorScheme="red" size="sm">
                          <Icon as={FaAllergies} mr={1} />
                          {allergy}
                        </Badge>
                      </WrapItem>
                    ))}
                    {patient.allergies.length > 3 && (
                      <WrapItem>
                        <Badge colorScheme="gray" size="sm">
                          +{patient.allergies.length - 3} más
                        </Badge>
                      </WrapItem>
                    )}
                  </Wrap>
                </Box>
              )}

              <Divider />

              <SimpleGrid columns={3} spacing={2}>
                <Stat textAlign="center">
                  <StatLabel fontSize="xs">Expedientes</StatLabel>
                  <StatNumber fontSize="sm">{stats.totalRecords}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel fontSize="xs">Citas</StatLabel>
                  <StatNumber fontSize="sm">{stats.totalAppointments}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel fontSize="xs">Signos Vitales</StatLabel>
                  <StatNumber fontSize="sm">{vitalSigns.filter(vs => vs.patient_id === patient.id).length}</StatNumber>
                </Stat>
              </SimpleGrid>
            </VStack>
          </CardBody>

          <CardFooter pt={0}>
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdVisibility} />}
                onClick={() => {
                  setSelectedPatient(patient);
                  onDetailsOpen();
                }}
              >
                Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdEdit} />}
                onClick={() => {
                  setSelectedPatient(patient);
                  onEditOpen();
                }}
              >
                Editar
              </Button>
              <Menu>
                <MenuButton as={Button} size="sm" variant="outline">
                  <Icon as={MdMoreVert} />
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<Icon as={MdFileCopy} />}>
                    Ver Expedientes
                  </MenuItem>
                  <MenuItem icon={<Icon as={MdCalendarToday} />}>
                    Ver Citas
                  </MenuItem>
                  <MenuItem icon={<Icon as={MdFavorite} />}>
                    Ver Signos Vitales
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<Icon as={MdEmergency} />}>
                    Contactos de Emergencia
                  </MenuItem>
                  <MenuItem icon={<Icon as={MdDownload} />}>
                    Descargar PDF
                  </MenuItem>
                  <MenuItem icon={<Icon as={MdPrint} />}>
                    Imprimir
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </CardFooter>
        </Card>
      </ScaleFade>
    );
  };

  const PatientDetails = ({ patient }) => {
    if (!patient) return null;

    const stats = getPatientStats(patient.id);
    const age = patient.date_of_birth ? calculateAge(patient.date_of_birth) : 'N/A';

    return (
      <VStack spacing={6} align="stretch">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <HStack spacing={3}>
              <Avatar
                name={`${patient.first_name} ${patient.last_name}`}
                src={patient.avatar_url}
                size="lg"
              />
              <VStack align="start" spacing={1}>
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                  {patient.first_name} {patient.last_name}
                </Text>
                <Text color={textColorSecondary}>
                  {patient.patient_code} • {age} años • {getGenderIcon(patient.gender)}
                </Text>
                <Badge
                  colorScheme={patient.status === 'active' ? 'green' : 'red'}
                >
                  {patient.status}
                </Badge>
              </VStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={MdEmail} color="blue.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient.email}
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={MdPhone} color="green.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient.phone_primary || 'No especificado'}
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={MdBloodtype} color="red.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient.blood_type || 'No especificado'}
                  </Text>
                </HStack>
              </VStack>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={MdCalendarToday} color="purple.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient.date_of_birth ? formatDate(patient.date_of_birth) : 'No especificado'}
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={MdLocationOn} color="orange.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient.nationality || 'No especificado'}
                  </Text>
                </HStack>
                <HStack>
                  <Icon as={MdAssignment} color="teal.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient.document_number || 'No especificado'}
                  </Text>
                </HStack>
              </VStack>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Estadísticas Médicas */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Estadísticas Médicas
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
              <Stat textAlign="center">
                <StatLabel>Expedientes</StatLabel>
                <StatNumber color="blue.500">{stats.totalRecords}</StatNumber>
              </Stat>
              <Stat textAlign="center">
                <StatLabel>Citas</StatLabel>
                <StatNumber color="green.500">{stats.totalAppointments}</StatNumber>
              </Stat>
              <Stat textAlign="center">
                <StatLabel>Alergias</StatLabel>
                <StatNumber color="red.500">{patient.allergies?.length || 0}</StatNumber>
              </Stat>
              <Stat textAlign="center">
                <StatLabel>Medicamentos</StatLabel>
                <StatNumber color="purple.500">{patient.current_medications?.length || 0}</StatNumber>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Alergias y Condiciones */}
        {(patient.allergies?.length > 0 || patient.chronic_conditions?.length > 0) && (
          <Card>
            <CardHeader>
              <Text fontSize="lg" fontWeight="bold" color={textColor}>
                Alergias y Condiciones
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {patient.allergies?.length > 0 && (
                  <Box>
                    <Text fontWeight="semibold" color={textColor} mb={2}>
                      Alergias:
                    </Text>
                    <Wrap spacing={2}>
                      {patient.allergies.map((allergy, index) => (
                        <WrapItem key={index}>
                          <Badge colorScheme="red" size="lg">
                            <Icon as={FaAllergies} mr={1} />
                            {allergy}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}
                {patient.chronic_conditions?.length > 0 && (
                  <Box>
                    <Text fontWeight="semibold" color={textColor} mb={2}>
                      Condiciones Crónicas:
                    </Text>
                    <Wrap spacing={2}>
                      {patient.chronic_conditions.map((condition, index) => (
                        <WrapItem key={index}>
                          <Badge colorScheme="orange" size="lg">
                            <Icon as={MdHealthAndSafety} mr={1} />
                            {condition}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Contactos de Emergencia */}
        {patient.emergency_contacts?.length > 0 && (
          <Card>
            <CardHeader>
              <Flex align="center" justify="space-between">
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  Contactos de Emergencia
                </Text>
                <Button
                  size="sm"
                  leftIcon={<Icon as={MdAdd} />}
                  onClick={onEmergencyOpen}
                >
                  Agregar
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {patient.emergency_contacts.map((contact, index) => (
                  <Box
                    key={index}
                    p={3}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="md"
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold" color={textColor}>
                          {contact.name}
                        </Text>
                        <Text fontSize="sm" color={textColorSecondary}>
                          {contact.relationship}
                        </Text>
                        <HStack spacing={4}>
                          <HStack spacing={1}>
                            <Icon as={MdPhone} color="green.500" />
                            <Text fontSize="sm" color={textColor}>
                              {contact.phone_primary}
                            </Text>
                          </HStack>
                          {contact.email && (
                            <HStack spacing={1}>
                              <Icon as={MdEmail} color="blue.500" />
                              <Text fontSize="sm" color={textColor}>
                                {contact.email}
                              </Text>
                            </HStack>
                          )}
                        </HStack>
                      </VStack>
                      {contact.is_primary && (
                        <Badge colorScheme="green">Principal</Badge>
                      )}
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    );
  };

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  if (loading && patients.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color={textColorSecondary}>
          Cargando pacientes...
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex align="center" justify="space-between" mb={6}>
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold" color={textColor}>
            Gestión de Pacientes Avanzada
          </Text>
          <Text color={textColorSecondary}>
            Gestión completa de perfiles médicos con IA
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            onClick={loadPatients}
            isLoading={loading}
            variant="outline"
          >
            Actualizar
          </Button>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            onClick={onCreateOpen}
            colorScheme="blue"
          >
            Nuevo Paciente
          </Button>
        </HStack>
      </Flex>

      {/* Filtros y Búsqueda */}
      <Card mb={6} bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <InputGroup maxW="300px">
              <InputLeftElement>
                <Icon as={MdSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Buscar pacientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              maxW="150px"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </Select>

            <Select
              value={filters.gender}
              onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              maxW="150px"
            >
              <option value="all">Todos los géneros</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </Select>

            <Select
              value={filters.bloodType}
              onChange={(e) => setFilters(prev => ({ ...prev, bloodType: e.target.value }))}
              maxW="150px"
            >
              <option value="all">Todos los tipos</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </Select>
          </HStack>
        </CardBody>
      </Card>

      {/* Contenido Principal */}
      <Tabs index={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab>
            <Icon as={MdDashboard} mr={2} />
            Lista de Pacientes
          </Tab>
          <Tab>
            <Icon as={MdAnalytics} mr={2} />
            Analytics
          </Tab>
        </TabList>

        <TabPanels>
          {/* Panel de Lista de Pacientes */}
          <TabPanel>
            <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
              {patients.map(patient => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </Grid>
          </TabPanel>

          {/* Panel de Analytics */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} mb={6}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Pacientes</StatLabel>
                    <StatNumber>{patients.length}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Pacientes Activos</StatLabel>
                    <StatNumber color="green.500">
                      {patients.filter(p => p.status === 'active').length}
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Con Alergias</StatLabel>
                    <StatNumber color="red.500">
                      {patients.filter(p => p.allergies && p.allergies.length > 0).length}
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Con Condiciones Crónicas</StatLabel>
                    <StatNumber color="orange.500">
                      {patients.filter(p => p.chronic_conditions && p.chronic_conditions.length > 0).length}
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modales */}
      {/* Modal de Crear Paciente */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Paciente</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Nombre</FormLabel>
                  <Input
                    value={patientForm.first_name}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Nombre"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Apellido</FormLabel>
                  <Input
                    value={patientForm.last_name}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Apellido"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={patientForm.email}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@ejemplo.com"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Teléfono</FormLabel>
                  <Input
                    value={patientForm.phone_primary}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, phone_primary: e.target.value }))}
                    placeholder="+57 300 123 4567"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Fecha de Nacimiento</FormLabel>
                  <Input
                    type="date"
                    value={patientForm.date_of_birth}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Género</FormLabel>
                  <Select
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="">Seleccionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Tipo de Sangre</FormLabel>
                  <Select
                    value={patientForm.blood_type}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, blood_type: e.target.value }))}
                  >
                    <option value="">Seleccionar</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Factor RH</FormLabel>
                  <Select
                    value={patientForm.rh_factor}
                    onChange={(e) => setPatientForm(prev => ({ ...prev, rh_factor: e.target.value }))}
                  >
                    <option value="">Seleccionar</option>
                    <option value="+">Positivo (+)</option>
                    <option value="-">Negativo (-)</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Notas Médicas</FormLabel>
                <Textarea
                  value={patientForm.medical_notes}
                  onChange={(e) => setPatientForm(prev => ({ ...prev, medical_notes: e.target.value }))}
                  placeholder="Notas médicas adicionales..."
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onCreateClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleCreatePatient} isLoading={loading}>
              Crear Paciente
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Detalles del Paciente */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Detalles del Paciente
            {selectedPatient && (
              <Badge
                colorScheme={selectedPatient.status === 'active' ? 'green' : 'red'}
                ml={3}
              >
                {selectedPatient.status}
              </Badge>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPatient && <PatientDetails patient={selectedPatient} />}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onDetailsClose}>
              Cerrar
            </Button>
            <Button colorScheme="blue" onClick={() => {
              onDetailsClose();
              onEditOpen();
            }}>
              Editar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Contacto de Emergencia */}
      <Modal isOpen={isEmergencyOpen} onClose={onEmergencyClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Agregar Contacto de Emergencia</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nombre Completo</FormLabel>
                <Input
                  value={emergencyContactForm.name}
                  onChange={(e) => setEmergencyContactForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre completo"
                />
              </FormControl>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Relación</FormLabel>
                  <Select
                    value={emergencyContactForm.relationship}
                    onChange={(e) => setEmergencyContactForm(prev => ({ ...prev, relationship: e.target.value }))}
                  >
                    <option value="">Seleccionar</option>
                    <option value="spouse">Cónyuge</option>
                    <option value="parent">Padre/Madre</option>
                    <option value="child">Hijo/Hija</option>
                    <option value="sibling">Hermano/Hermana</option>
                    <option value="friend">Amigo/Amiga</option>
                    <option value="other">Otro</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Teléfono Principal</FormLabel>
                  <Input
                    value={emergencyContactForm.phone_primary}
                    onChange={(e) => setEmergencyContactForm(prev => ({ ...prev, phone_primary: e.target.value }))}
                    placeholder="+57 300 123 4567"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Teléfono Secundario</FormLabel>
                  <Input
                    value={emergencyContactForm.phone_secondary}
                    onChange={(e) => setEmergencyContactForm(prev => ({ ...prev, phone_secondary: e.target.value }))}
                    placeholder="+57 300 123 4567"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={emergencyContactForm.email}
                    onChange={(e) => setEmergencyContactForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@ejemplo.com"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Dirección</FormLabel>
                <Textarea
                  value={emergencyContactForm.address}
                  onChange={(e) => setEmergencyContactForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Dirección completa"
                  rows={2}
                />
              </FormControl>

              <FormControl>
                <HStack>
                  <Switch
                    isChecked={emergencyContactForm.is_primary}
                    onChange={(e) => setEmergencyContactForm(prev => ({ ...prev, is_primary: e.target.checked }))}
                  />
                  <FormLabel mb={0}>Contacto Principal</FormLabel>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onEmergencyClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleAddEmergencyContact}>
              Agregar Contacto
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdvancedPatients;
