/**
 * SMD VITAL - Módulo de Expedientes Médicos Avanzado
 * ===================================================
 * 
 * Módulo completo para gestión de expedientes médicos con:
 * - Historial médico completo
 * - Prescripciones médicas
 * - Signos vitales
 * - Resultados de laboratorio
 * - Imágenes médicas
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
  ListIcon
} from '@chakra-ui/react';
import {
  MdFileCopy,
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
  MdPerson,
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
  MdScience,
  MdCameraAlt,
  MdAttachFile,
  MdSecurity,
  MdLock,
  MdPublic
} from 'react-icons/md';
import { FaUser, FaUserMd, FaCalendarAlt, FaClock, FaFileMedical, FaStethoscope } from 'react-icons/fa';
import businessLogicService from '../../../services/core/BusinessLogicService';
import notificationService from '../../../services/core/NotificationService';
import aiService from '../../../services/core/AIService';
import apiService from '../../../services/apiService';

const AdvancedMedicalRecords = () => {
  // =====================================================
  // ESTADOS Y HOOKS
  // =====================================================

  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isPrescriptionOpen, onOpen: onPrescriptionOpen, onClose: onPrescriptionClose } = useDisclosure();

  // Estados principales
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [patients, setPatients] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Estados de filtros
  const [filters, setFilters] = useState({
    patient: 'all',
    professional: 'all',
    recordType: 'all',
    dateRange: 'all',
    status: 'all'
  });

  // Estados de formularios
  const [recordForm, setRecordForm] = useState({
    patient_id: '',
    professional_id: '',
    record_type: 'consultation',
    title: '',
    content: '',
    diagnosis: [],
    treatment_plan: [],
    medications: [],
    vital_signs: {},
    lab_results: [],
    imaging_results: [],
    notes: ''
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    patient_id: '',
    professional_id: '',
    medical_record_id: '',
    medications: [],
    instructions: '',
    start_date: '',
    end_date: '',
    refills_allowed: 0
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
    loadMedicalRecords();
  }, [filters, selectedPatient]);

  // =====================================================
  // FUNCIONES DE CARGA DE DATOS
  // =====================================================

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPatients(),
        loadProfessionals(),
        loadMedicalRecords(),
        loadPrescriptions(),
        loadVitalSigns()
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

  const loadMedicalRecords = async () => {
    try {
      const params = {
        ...filters,
        patient_id: selectedPatient?.id
      };

      const response = await apiService.get('/medical-records', { params });
      // Extraer datos de la respuesta del API
      const recordsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setMedicalRecords(recordsData);
    } catch (error) {
      console.error('Error loading medical records:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar los expedientes médicos',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const loadPrescriptions = async () => {
    try {
      const response = await apiService.get('/prescriptions');
      // Extraer datos de la respuesta del API
      const prescriptionsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
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

  const loadPatients = async () => {
    try {
      const response = await apiService.get('/patients');
      // Extraer datos de la respuesta del API
      const patientsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadProfessionals = async () => {
    try {
      const response = await apiService.get('/professionals');
      // Extraer datos de la respuesta del API
      const professionalsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setProfessionals(professionalsData);
    } catch (error) {
      console.error('Error loading professionals:', error);
    }
  };

  // =====================================================
  // FUNCIONES DE GESTIÓN DE EXPEDIENTES
  // =====================================================

  const handleCreateRecord = async () => {
    try {
      setLoading(true);
      
      // Usar lógica de negocio para crear expediente
      const record = await businessLogicService.createMedicalRecord(recordForm);
      
      setMedicalRecords(prev => [record, ...prev]);
      onCreateClose();
      
      // Limpiar formulario
      setRecordForm({
        patient_id: '',
        professional_id: '',
        record_type: 'consultation',
        title: '',
        content: '',
        diagnosis: [],
        treatment_plan: [],
        medications: [],
        vital_signs: {},
        lab_results: [],
        imaging_results: [],
        notes: ''
      });

      toast({
        title: 'Expediente Creado',
        description: 'El expediente médico ha sido creado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error creating medical record:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al crear el expediente médico',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = async () => {
    try {
      setLoading(true);
      
      const response = await apiService.post('/prescriptions', prescriptionForm);
      const prescription = response.data;
      
      setPrescriptions(prev => [prescription, ...prev]);
      onPrescriptionClose();
      
      toast({
        title: 'Receta Creada',
        description: 'La receta médica ha sido creada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast({
        title: 'Error',
        description: 'Error al crear la receta médica',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FUNCIONES DE UTILIDAD
  // =====================================================

  const getRecordTypeColor = (type) => {
    const colors = {
      consultation: 'blue',
      diagnosis: 'green',
      treatment: 'purple',
      follow_up: 'orange',
      emergency: 'red',
      lab_result: 'teal',
      imaging: 'pink'
    };
    return colors[type] || 'gray';
  };

  const getRecordTypeIcon = (type) => {
    const icons = {
      consultation: FaStethoscope,
      diagnosis: MdLocalHospital,
      treatment: MdMedication,
      follow_up: MdHistory,
      emergency: MdWarning,
      lab_result: MdScience,
      imaging: MdCameraAlt
    };
    return icons[type] || MdFileCopy;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // =====================================================
  // COMPONENTES DE UI
  // =====================================================

  const MedicalRecordCard = ({ record }) => {
    const patient = patients.find(p => p.id === record.patient_id);
    const professional = professionals.find(p => p.id === record.professional_id);
    const RecordIcon = getRecordTypeIcon(record.record_type);

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
                <Icon as={RecordIcon} color={`${getRecordTypeColor(record.record_type)}.500`} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color={textColor}>
                    {record.title || record.record_number}
                  </Text>
                  <Text fontSize="sm" color={textColorSecondary}>
                    {formatDateTime(record.created_at)}
                  </Text>
                </VStack>
              </HStack>
              <Badge
                colorScheme={getRecordTypeColor(record.record_type)}
              >
                {record.record_type}
              </Badge>
            </Flex>
          </CardHeader>

          <CardBody pt={0}>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FaUser} color="blue.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient?.name || 'Paciente no encontrado'}
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaUserMd} color="green.500" />
                  <Text fontSize="sm" color={textColor}>
                    {professional?.name || 'Profesional no encontrado'}
                  </Text>
                </HStack>
              </HStack>

              {record.content && (
                <Text fontSize="sm" color={textColorSecondary} noOfLines={3}>
                  {record.content}
                </Text>
              )}

              {record.diagnosis && record.diagnosis.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={1}>
                    Diagnósticos:
                  </Text>
                  <Wrap spacing={1}>
                    {record.diagnosis.slice(0, 3).map((diag, index) => (
                      <WrapItem key={index}>
                        <Badge colorScheme="red" size="sm">
                          {diag}
                        </Badge>
                      </WrapItem>
                    ))}
                    {record.diagnosis.length > 3 && (
                      <WrapItem>
                        <Badge colorScheme="gray" size="sm">
                          +{record.diagnosis.length - 3} más
                        </Badge>
                      </WrapItem>
                    )}
                  </Wrap>
                </Box>
              )}

              {record.medications && record.medications.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={1}>
                    Medicamentos:
                  </Text>
                  <Wrap spacing={1}>
                    {record.medications.slice(0, 2).map((med, index) => (
                      <WrapItem key={index}>
                        <Badge colorScheme="purple" size="sm">
                          {med.name}
                        </Badge>
                      </WrapItem>
                    ))}
                    {record.medications.length > 2 && (
                      <WrapItem>
                        <Badge colorScheme="gray" size="sm">
                          +{record.medications.length - 2} más
                        </Badge>
                      </WrapItem>
                    )}
                  </Wrap>
                </Box>
              )}
            </VStack>
          </CardBody>

          <CardFooter pt={0}>
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdVisibility} />}
                onClick={() => {
                  setSelectedRecord(record);
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
                  setSelectedRecord(record);
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
                  <MenuItem icon={<Icon as={MdDownload} />}>
                    Descargar PDF
                  </MenuItem>
                  <MenuItem icon={<Icon as={MdPrint} />}>
                    Imprimir
                  </MenuItem>
                  <MenuItem icon={<Icon as={MdShare} />}>
                    Compartir
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<Icon as={MdMedication} />}>
                    Crear Receta
                  </MenuItem>
                  <MenuItem icon={<Icon as={MdScience} />}>
                    Agregar Laboratorio
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </CardFooter>
        </Card>
      </ScaleFade>
    );
  };

  const PrescriptionCard = ({ prescription }) => {
    const patient = patients.find(p => p.id === prescription.patient_id);
    const professional = professionals.find(p => p.id === prescription.professional_id);

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
                <Icon as={MdMedication} color="purple.500" />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color={textColor}>
                    {prescription.prescription_number}
                  </Text>
                  <Text fontSize="sm" color={textColorSecondary}>
                    {formatDateTime(prescription.created_at)}
                  </Text>
                </VStack>
              </HStack>
              <Badge
                colorScheme={prescription.status === 'active' ? 'green' : 'gray'}
              >
                {prescription.status}
              </Badge>
            </Flex>
          </CardHeader>

          <CardBody pt={0}>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FaUser} color="blue.500" />
                  <Text fontSize="sm" color={textColor}>
                    {patient?.name || 'Paciente no encontrado'}
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaUserMd} color="green.500" />
                  <Text fontSize="sm" color={textColor}>
                    {professional?.name || 'Profesional no encontrado'}
                  </Text>
                </HStack>
              </HStack>

              {prescription.medications && prescription.medications.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                    Medicamentos:
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {prescription.medications.map((med, index) => (
                      <Box key={index} p={2} bg="purple.50" borderRadius="md">
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="medium">
                            {med.name}
                          </Text>
                          <Text fontSize="sm" color={textColorSecondary}>
                            {med.dosage} - {med.frequency}
                          </Text>
                        </HStack>
                        {med.instructions && (
                          <Text fontSize="xs" color={textColorSecondary} mt={1}>
                            {med.instructions}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}

              {prescription.instructions && (
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={1}>
                    Instrucciones:
                  </Text>
                  <Text fontSize="sm" color={textColorSecondary}>
                    {prescription.instructions}
                  </Text>
                </Box>
              )}

              <HStack justify="space-between">
                <Text fontSize="sm" color={textColorSecondary}>
                  Refills: {prescription.refills_used}/{prescription.refills_allowed}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  Válida hasta: {formatDate(prescription.end_date)}
                </Text>
              </HStack>
            </VStack>
          </CardBody>

          <CardFooter pt={0}>
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdVisibility} />}
              >
                Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdDownload} />}
              >
                Descargar
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdPrint} />}
              >
                Imprimir
              </Button>
            </HStack>
          </CardFooter>
        </Card>
      </ScaleFade>
    );
  };

  const VitalSignsChart = ({ patientId }) => {
    const patientVitals = vitalSigns.filter(vs => vs.patient_id === patientId);
    
    if (patientVitals.length === 0) {
      return (
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>No hay signos vitales registrados</AlertTitle>
        </Alert>
      );
    }

    const latestVitals = patientVitals[0];
    const previousVitals = patientVitals[1];

    const getTrend = (current, previous) => {
      if (!previous) return 'neutral';
      return current > previous ? 'increase' : current < previous ? 'decrease' : 'neutral';
    };

    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Presión Arterial</StatLabel>
              <StatNumber fontSize="lg">
                {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic}
              </StatNumber>
              <StatHelpText>
                <StatArrow type={getTrend(latestVitals.blood_pressure_systolic, previousVitals?.blood_pressure_systolic)} />
                mmHg
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Frecuencia Cardíaca</StatLabel>
              <StatNumber fontSize="lg">
                {latestVitals.heart_rate}
              </StatNumber>
              <StatHelpText>
                <StatArrow type={getTrend(latestVitals.heart_rate, previousVitals?.heart_rate)} />
                bpm
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Temperatura</StatLabel>
              <StatNumber fontSize="lg">
                {latestVitals.temperature}°C
              </StatNumber>
              <StatHelpText>
                <StatArrow type={getTrend(latestVitals.temperature, previousVitals?.temperature)} />
                Celsius
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Peso</StatLabel>
              <StatNumber fontSize="lg">
                {latestVitals.weight} kg
              </StatNumber>
              <StatHelpText>
                <StatArrow type={getTrend(latestVitals.weight, previousVitals?.weight)} />
                Kilogramos
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
    );
  };

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  if (loading && medicalRecords.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color={textColorSecondary}>
          Cargando expedientes médicos...
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
            Expedientes Médicos Avanzados
          </Text>
          <Text color={textColorSecondary}>
            Gestión completa de historiales médicos con IA
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            onClick={loadMedicalRecords}
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
            Nuevo Expediente
          </Button>
          <Button
            leftIcon={<Icon as={MdMedication} />}
            onClick={onPrescriptionOpen}
            colorScheme="purple"
          >
            Nueva Receta
          </Button>
        </HStack>
      </Flex>

      {/* Filtros y Controles */}
      <Card mb={6} bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <Select
              value={filters.patient}
              onChange={(e) => {
                const patientId = e.target.value;
                setSelectedPatient(patients.find(p => p.id === patientId));
                setFilters(prev => ({ ...prev, patient: patientId }));
              }}
              maxW="200px"
            >
              <option value="all">Todos los pacientes</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </Select>
            
            <Select
              value={filters.recordType}
              onChange={(e) => setFilters(prev => ({ ...prev, recordType: e.target.value }))}
              maxW="200px"
            >
              <option value="all">Todos los tipos</option>
              <option value="consultation">Consulta</option>
              <option value="diagnosis">Diagnóstico</option>
              <option value="treatment">Tratamiento</option>
              <option value="follow_up">Seguimiento</option>
              <option value="emergency">Emergencia</option>
              <option value="lab_result">Laboratorio</option>
              <option value="imaging">Imágenes</option>
            </Select>

            <Select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              maxW="200px"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="year">Este año</option>
            </Select>
          </HStack>
        </CardBody>
      </Card>

      {/* Contenido Principal */}
      <Tabs index={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab>
            <Icon as={MdFileCopy} mr={2} />
            Expedientes
          </Tab>
          <Tab>
            <Icon as={MdMedication} mr={2} />
            Recetas
          </Tab>
          <Tab>
            <Icon as={MdFavorite} mr={2} />
            Signos Vitales
          </Tab>
          <Tab>
            <Icon as={MdAnalytics} mr={2} />
            Analytics
          </Tab>
        </TabList>

        <TabPanels>
          {/* Panel de Expedientes */}
          <TabPanel>
            <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
              {medicalRecords.map(record => (
                <MedicalRecordCard key={record.id} record={record} />
              ))}
            </Grid>
          </TabPanel>

          {/* Panel de Recetas */}
          <TabPanel>
            <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
              {prescriptions.map(prescription => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))}
            </Grid>
          </TabPanel>

          {/* Panel de Signos Vitales */}
          <TabPanel>
            {selectedPatient ? (
              <VitalSignsChart patientId={selectedPatient.id} />
            ) : (
              <Alert status="info">
                <AlertIcon />
                <AlertTitle>Selecciona un paciente para ver sus signos vitales</AlertTitle>
              </Alert>
            )}
          </TabPanel>

          {/* Panel de Analytics */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} mb={6}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Expedientes</StatLabel>
                    <StatNumber>{medicalRecords.length}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Recetas Activas</StatLabel>
                    <StatNumber>{prescriptions.filter(p => p.status === 'active').length}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Pacientes Únicos</StatLabel>
                    <StatNumber>{new Set(medicalRecords.map(r => r.patient_id)).size}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Profesionales</StatLabel>
                    <StatNumber>{new Set(medicalRecords.map(r => r.professional_id)).size}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modales */}
      {/* Modal de Crear Expediente */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Expediente Médico</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Paciente</FormLabel>
                  <Select
                    value={recordForm.patient_id}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, patient_id: e.target.value }))}
                  >
                    <option value="">Seleccionar paciente</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Profesional</FormLabel>
                  <Select
                    value={recordForm.professional_id}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, professional_id: e.target.value }))}
                  >
                    <option value="">Seleccionar profesional</option>
                    {professionals.map(prof => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name} - {prof.specialty}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Tipo de Expediente</FormLabel>
                  <Select
                    value={recordForm.record_type}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, record_type: e.target.value }))}
                  >
                    <option value="consultation">Consulta</option>
                    <option value="diagnosis">Diagnóstico</option>
                    <option value="treatment">Tratamiento</option>
                    <option value="follow_up">Seguimiento</option>
                    <option value="emergency">Emergencia</option>
                    <option value="lab_result">Laboratorio</option>
                    <option value="imaging">Imágenes</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Título</FormLabel>
                  <Input
                    value={recordForm.title}
                    onChange={(e) => setRecordForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título del expediente"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Contenido</FormLabel>
                <Textarea
                  value={recordForm.content}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Descripción detallada del expediente..."
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notas Adicionales</FormLabel>
                <Textarea
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notas adicionales..."
                  rows={2}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onCreateClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleCreateRecord} isLoading={loading}>
              Crear Expediente
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Crear Receta */}
      <Modal isOpen={isPrescriptionOpen} onClose={onPrescriptionClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nueva Receta Médica</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Paciente</FormLabel>
                  <Select
                    value={prescriptionForm.patient_id}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, patient_id: e.target.value }))}
                  >
                    <option value="">Seleccionar paciente</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Profesional</FormLabel>
                  <Select
                    value={prescriptionForm.professional_id}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, professional_id: e.target.value }))}
                  >
                    <option value="">Seleccionar profesional</option>
                    {professionals.map(prof => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name} - {prof.specialty}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Instrucciones</FormLabel>
                <Textarea
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Instrucciones para el paciente..."
                  rows={3}
                />
              </FormControl>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Fecha de Inicio</FormLabel>
                  <Input
                    type="date"
                    value={prescriptionForm.start_date}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Fecha de Fin</FormLabel>
                  <Input
                    type="date"
                    value={prescriptionForm.end_date}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Refills Permitidos</FormLabel>
                <Input
                  type="number"
                  value={prescriptionForm.refills_allowed}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, refills_allowed: parseInt(e.target.value) }))}
                  min="0"
                  max="10"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onPrescriptionClose}>
              Cancelar
            </Button>
            <Button colorScheme="purple" onClick={handleCreatePrescription} isLoading={loading}>
              Crear Receta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdvancedMedicalRecords;
