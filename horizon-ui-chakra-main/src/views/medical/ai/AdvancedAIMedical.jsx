/**
 * SMD VITAL - Módulo de IA Médica Avanzado
 * =========================================
 * 
 * Módulo completo de inteligencia artificial médica con:
 * - Chat médico inteligente
 * - Análisis de síntomas
 * - Diagnósticos asistidos
 * - Recomendaciones de tratamiento
 * - Análisis de imágenes médicas
 * - Predicción de riesgos
 * - Educación médica personalizada
 * 
 * Author: Senior Developer Team
 * Version: 2.0.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  InputRightElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  RadioGroup,
  Stack,
  Radio,
  Checkbox,
  CheckboxGroup,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure as useDrawerDisclosure
} from '@chakra-ui/react';
import {
  MdPsychology,
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
  MdCheckCircle,
  MdCancel,
  MdWarning,
  MdRefresh,
  MdTrendingUp,
  MdAnalytics,
  MdDashboard,
  MdChat,
  MdSend,
  MdAttachFile,
  MdImage,
  MdCameraAlt,
  MdScience,
  MdLocalHospital,
  MdMedication,
  MdFavorite,
  MdThermostat,
  MdBloodtype,
  MdDescription,
  MdHistory,
  MdTimeline,
  MdInsights,
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
  MdTrendingDown,
  MdTrendingFlat,
  MdShowChart,
  MdPieChart,
  MdBarChart,
  MdNotifications,
  MdError,
  MdDone,
  MdPending,
  MdHourglassEmpty,
  MdQuestionAnswer,
  MdLightbulb,
  MdSchool,
  MdBook,
  MdVideoLibrary,
  MdArticle,
  MdQuiz,
  MdAssessment,
  MdTrendingUp as MdTrendingUpIcon,
  MdSpeed,
  MdPrecision,
  MdVerified,
  MdAutoFixHigh,
  MdSmartToy,
  MdMemory,
  MdCloudUpload,
  MdCloudDownload,
  MdSync,
  MdUpdate,
  MdBuild,
  MdTune,
  MdPalette,
  MdLanguage,
  MdTranslate,
  MdVolumeUp,
  MdVolumeOff,
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
  MdScreenShare,
  MdStopScreenShare,
  MdClose
} from 'react-icons/md';
import { FaUser, FaUserMd, FaCalendarAlt, FaClock, FaFileMedical, FaStethoscope, FaHeartbeat, FaPills, FaAllergies, FaRobot, FaBrain, FaEye, FaEar, FaHands, FaLungs, FaSkull, FaBone, FaTooth, FaEyeDropper, FaFlask, FaMicroscope, FaXRay, FaMagnet, FaWaveSquare } from 'react-icons/fa';
import businessLogicService from '../../../services/core/BusinessLogicService';
import notificationService from '../../../services/core/NotificationService';
import aiService from '../../../services/core/AIService';
import apiService from '../../../services/apiService';

const AdvancedAIMedical = () => {
  // =====================================================
  // ESTADOS Y HOOKS
  // =====================================================

  const toast = useToast();
  const { isOpen: isAnalysisOpen, onOpen: onAnalysisOpen, onClose: onAnalysisClose } = useDisclosure();
  const { isOpen: isImageAnalysisOpen, onOpen: onImageAnalysisOpen, onClose: onImageAnalysisClose } = useDisclosure();
  const { isOpen: isEducationOpen, onOpen: onEducationOpen, onClose: onEducationClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDrawerDisclosure();

  // Estados principales
  const [aiSessions, setAiSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Estados de formularios
  const [symptomAnalysisForm, setSymptomAnalysisForm] = useState({
    patient_id: '',
    symptoms: [],
    duration: '',
    severity: 'mild',
    additional_info: '',
    context: {}
  });

  const [imageAnalysisForm, setImageAnalysisForm] = useState({
    patient_id: '',
    image_type: 'xray',
    image_data: null,
    analysis_type: 'general',
    additional_info: ''
  });

  const [educationForm, setEducationForm] = useState({
    patient_id: '',
    topics: [],
    level: 'patient',
    language: 'es',
    format: 'text'
  });

  // Estados de chat
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Referencias
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Colores del tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const textColorSecondary = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.600');
  const chatBg = useColorModeValue('gray.50', 'gray.800');

  // =====================================================
  // EFECTOS
  // =====================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentSession) {
      loadChatHistory(currentSession.id);
    }
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // =====================================================
  // FUNCIONES DE CARGA DE DATOS
  // =====================================================

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAiSessions(),
        loadPatients()
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

  const loadAiSessions = async () => {
    try {
      const response = await apiService.get('/ai/sessions');
      // Extraer datos de la respuesta del API
      const sessionsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setAiSessions(sessionsData);
    } catch (error) {
      console.error('Error loading AI sessions:', error);
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

  const loadChatHistory = async (sessionId) => {
    try {
      const response = await apiService.get(`/ai/chat/sessions/${sessionId}/history`);
      // Extraer datos de la respuesta del API
      const historyData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setChatHistory(historyData);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // =====================================================
  // FUNCIONES DE IA
  // =====================================================

  const handleStartChat = async () => {
    try {
      setLoading(true);
      
      const sessionData = {
        patient_id: selectedPatient?.id,
        session_type: 'medical_consultation',
        initial_context: {
          patient_info: selectedPatient,
          session_purpose: 'general_consultation'
        }
      };

      const session = await aiService.startMedicalChat(sessionData.patient_id, sessionData.initial_context);
      
      setCurrentSession(session);
      setAiSessions(prev => [session, ...prev]);
      onChatOpen();
      
      toast({
        title: 'Chat Iniciado',
        description: 'Sesión de chat médico iniciada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: 'Error',
        description: 'Error al iniciar el chat médico',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !currentSession) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);
    setIsChatLoading(true);

    try {
      const response = await aiService.sendChatMessage(currentSession.id, chatInput);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response_text,
        confidence: response.confidence_score,
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.',
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsChatLoading(false);
    }
  };

  const handleAnalyzeSymptoms = async () => {
    try {
      setLoading(true);
      
      const analysis = await aiService.analyzeSymptoms(
        symptomAnalysisForm.symptoms,
        {
          age: selectedPatient?.age,
          gender: selectedPatient?.gender,
          medical_history: selectedPatient?.medical_history || [],
          current_medications: selectedPatient?.current_medications || [],
          allergies: selectedPatient?.allergies || []
        }
      );
      
      toast({
        title: 'Análisis Completado',
        description: 'El análisis de síntomas ha sido completado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      // Mostrar resultados en un modal o panel
      console.log('Symptom analysis results:', analysis);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      toast({
        title: 'Error',
        description: 'Error al analizar los síntomas',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeImage = async () => {
    try {
      setLoading(true);
      
      const analysis = await aiService.analyzeMedicalImage(
        imageAnalysisForm.image_data,
        imageAnalysisForm.image_type,
        imageAnalysisForm.analysis_type
      );
      
      toast({
        title: 'Análisis de Imagen Completado',
        description: 'El análisis de la imagen médica ha sido completado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      console.log('Image analysis results:', analysis);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: 'Error',
        description: 'Error al analizar la imagen médica',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEducation = async () => {
    try {
      setLoading(true);
      
      const education = await aiService.generateEducationalContent(
        selectedPatient,
        educationForm.topics
      );
      
      toast({
        title: 'Contenido Educativo Generado',
        description: 'El contenido educativo personalizado ha sido generado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      console.log('Educational content:', education);
    } catch (error) {
      console.error('Error generating education:', error);
      toast({
        title: 'Error',
        description: 'Error al generar el contenido educativo',
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

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'green';
    if (confidence >= 0.6) return 'yellow';
    return 'red';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Media';
    return 'Baja';
  };

  // =====================================================
  // COMPONENTES DE UI
  // =====================================================

  const ChatMessage = ({ message }) => {
    const isUser = message.type === 'user';
    const isAI = message.type === 'ai';
    const isError = message.type === 'error';

    return (
      <Box
        alignSelf={isUser ? 'flex-end' : 'flex-start'}
        maxW="80%"
        mb={4}
      >
        <HStack spacing={3} align="start">
          {!isUser && (
            <Avatar size="sm" bg="blue.500">
              <Icon as={FaRobot} />
            </Avatar>
          )}
          <VStack align={isUser ? 'end' : 'start'} spacing={1}>
            <Box
              bg={isUser ? 'blue.500' : isError ? 'red.500' : 'gray.100'}
              color={isUser ? 'white' : 'black'}
              px={4}
              py={2}
              borderRadius="lg"
              maxW="100%"
            >
              <Text fontSize="sm" whiteSpace="pre-wrap">
                {message.content}
              </Text>
            </Box>
            <HStack spacing={2}>
              <Text fontSize="xs" color={textColorSecondary}>
                {formatDateTime(message.timestamp)}
              </Text>
              {isAI && message.confidence && (
                <Badge
                  colorScheme={getConfidenceColor(message.confidence)}
                  size="sm"
                >
                  Confianza: {getConfidenceText(message.confidence)}
                </Badge>
              )}
            </HStack>
          </VStack>
          {isUser && (
            <Avatar size="sm" bg="green.500">
              <Icon as={FaUser} />
            </Avatar>
          )}
        </HStack>
      </Box>
    );
  };

  const ChatInterface = () => (
    <VStack h="100%" spacing={0}>
      {/* Header del Chat */}
      <Box w="100%" p={4} borderBottom="1px solid" borderColor={borderColor} bg={headerBg}>
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Avatar size="sm" bg="blue.500">
              <Icon as={FaRobot} />
            </Avatar>
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" color={textColor}>
                Asistente Médico IA
              </Text>
              <Text fontSize="sm" color={textColorSecondary}>
                {currentSession ? 'Sesión activa' : 'Sin sesión activa'}
              </Text>
            </VStack>
          </HStack>
          <Button size="sm" variant="outline" onClick={onChatClose}>
            <Icon as={MdClose} />
          </Button>
        </HStack>
      </Box>

      {/* Mensajes del Chat */}
      <Box flex="1" p={4} overflowY="auto" bg={chatBg}>
        <VStack spacing={0} align="stretch">
          {chatMessages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && (
            <Box alignSelf="flex-start" mb={4}>
              <HStack spacing={3} align="start">
                <Avatar size="sm" bg="blue.500">
                  <Icon as={FaRobot} />
                </Avatar>
                <Box bg="gray.100" px={4} py={2} borderRadius="lg">
                  <HStack spacing={1}>
                    <Text fontSize="sm">El asistente está escribiendo</Text>
                    <Spinner size="xs" />
                  </HStack>
                </Box>
              </HStack>
            </Box>
          )}
          <div ref={chatEndRef} />
        </VStack>
      </Box>

      {/* Input del Chat */}
      <Box w="100%" p={4} borderTop="1px solid" borderColor={borderColor} bg={bgColor}>
        <HStack spacing={2}>
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            isDisabled={!currentSession || isChatLoading}
          />
          <Button
            onClick={handleSendMessage}
            colorScheme="blue"
            isDisabled={!chatInput.trim() || !currentSession || isChatLoading}
            isLoading={isChatLoading}
          >
            <Icon as={MdSend} />
          </Button>
        </HStack>
      </Box>
    </VStack>
  );

  const SymptomAnalysisCard = ({ analysis }) => (
    <Card>
      <CardHeader>
        <HStack spacing={3}>
          <Icon as={MdScience} color="blue.500" />
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" color={textColor}>
              Análisis de Síntomas
            </Text>
            <Text fontSize="sm" color={textColorSecondary}>
              {formatDateTime(analysis.created_at)}
            </Text>
          </VStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {analysis.possible_diagnoses && analysis.possible_diagnoses.length > 0 && (
            <Box>
              <Text fontWeight="semibold" color={textColor} mb={2}>
                Posibles Diagnósticos:
              </Text>
              <VStack spacing={2} align="stretch">
                {analysis.possible_diagnoses.map((diagnosis, index) => (
                  <HStack key={index} justify="space-between" p={2} bg="blue.50" borderRadius="md">
                    <Text fontSize="sm">{diagnosis.name}</Text>
                    <Badge colorScheme="blue">
                      {(diagnosis.confidence * 100).toFixed(1)}%
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Box>
              <Text fontWeight="semibold" color={textColor} mb={2}>
                Recomendaciones:
              </Text>
              <List spacing={1}>
                {analysis.recommendations.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    {recommendation}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {analysis.urgency_level && (
            <Box>
              <Text fontWeight="semibold" color={textColor} mb={2}>
                Nivel de Urgencia:
              </Text>
              <Badge
                colorScheme={
                  analysis.urgency_level === 'high' ? 'red' :
                  analysis.urgency_level === 'medium' ? 'yellow' : 'green'
                }
                size="lg"
              >
                {analysis.urgency_level === 'high' ? 'Alta' :
                 analysis.urgency_level === 'medium' ? 'Media' : 'Baja'}
              </Badge>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  const ImageAnalysisCard = ({ analysis }) => (
    <Card>
      <CardHeader>
        <HStack spacing={3}>
          <Icon as={MdCameraAlt} color="purple.500" />
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold" color={textColor}>
              Análisis de Imagen Médica
            </Text>
            <Text fontSize="sm" color={textColorSecondary}>
              {formatDateTime(analysis.created_at)}
            </Text>
          </VStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {analysis.anomalies_detected && analysis.anomalies_detected.length > 0 && (
            <Box>
              <Text fontWeight="semibold" color={textColor} mb={2}>
                Anomalías Detectadas:
              </Text>
              <VStack spacing={2} align="stretch">
                {analysis.anomalies_detected.map((anomaly, index) => (
                  <HStack key={index} justify="space-between" p={2} bg="red.50" borderRadius="md">
                    <Text fontSize="sm">{anomaly.description}</Text>
                    <Badge colorScheme="red">
                      {(anomaly.confidence * 100).toFixed(1)}%
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Box>
              <Text fontWeight="semibold" color={textColor} mb={2}>
                Recomendaciones:
              </Text>
              <List spacing={1}>
                {analysis.recommendations.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    {recommendation}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  if (loading && aiSessions.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color={textColorSecondary}>
          Cargando módulo de IA médica...
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
            IA Médica Avanzada
          </Text>
          <Text color={textColorSecondary}>
            Inteligencia artificial para diagnóstico y asistencia médica
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            onClick={loadInitialData}
            isLoading={loading}
            variant="outline"
          >
            Actualizar
          </Button>
          <Button
            leftIcon={<Icon as={MdChat} />}
            onClick={handleStartChat}
            colorScheme="blue"
            isDisabled={!selectedPatient}
          >
            Iniciar Chat
          </Button>
          <Button
            leftIcon={<Icon as={MdSettings} />}
            onClick={onSettingsOpen}
            variant="outline"
          >
            Configuración
          </Button>
        </HStack>
      </Flex>

      {/* Selector de Paciente */}
      <Card mb={6} bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Seleccionar Paciente</FormLabel>
              <Select
                value={selectedPatient?.id || ''}
                onChange={(e) => {
                  const patient = patients.find(p => p.id === e.target.value);
                  setSelectedPatient(patient);
                }}
              >
                <option value="">Seleccionar paciente</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.patient_code}
                  </option>
                ))}
              </Select>
            </FormControl>
            {selectedPatient && (
              <Badge colorScheme="green" size="lg">
                Paciente Seleccionado: {selectedPatient.name}
              </Badge>
            )}
          </HStack>
        </CardBody>
      </Card>

      {/* Contenido Principal */}
      <Tabs index={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab>
            <Icon as={MdChat} mr={2} />
            Chat Médico
          </Tab>
          <Tab>
            <Icon as={MdScience} mr={2} />
            Análisis de Síntomas
          </Tab>
          <Tab>
            <Icon as={MdCameraAlt} mr={2} />
            Análisis de Imágenes
          </Tab>
          <Tab>
            <Icon as={MdSchool} mr={2} />
            Educación Médica
          </Tab>
          <Tab>
            <Icon as={MdAnalytics} mr={2} />
            Analytics
          </Tab>
        </TabList>

        <TabPanels>
          {/* Panel de Chat Médico */}
          <TabPanel>
            <Card h="600px">
              <CardBody p={0}>
                {currentSession ? (
                  <ChatInterface />
                ) : (
                  <VStack h="100%" justify="center" spacing={4}>
                    <Icon as={MdChat} fontSize="4xl" color="gray.400" />
                    <Text fontSize="lg" color={textColorSecondary}>
                      Selecciona un paciente e inicia una sesión de chat
                    </Text>
                    <Button
                      onClick={handleStartChat}
                      colorScheme="blue"
                      isDisabled={!selectedPatient}
                    >
                      Iniciar Chat Médico
                    </Button>
                  </VStack>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Panel de Análisis de Síntomas */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Análisis de Síntomas con IA
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Síntomas</FormLabel>
                      <Textarea
                        placeholder="Describe los síntomas del paciente..."
                        value={symptomAnalysisForm.additional_info}
                        onChange={(e) => setSymptomAnalysisForm(prev => ({ ...prev, additional_info: e.target.value }))}
                        rows={4}
                      />
                    </FormControl>

                    <HStack spacing={4} w="100%">
                      <FormControl>
                        <FormLabel>Duración</FormLabel>
                        <Select
                          value={symptomAnalysisForm.duration}
                          onChange={(e) => setSymptomAnalysisForm(prev => ({ ...prev, duration: e.target.value }))}
                        >
                          <option value="">Seleccionar duración</option>
                          <option value="hours">Horas</option>
                          <option value="days">Días</option>
                          <option value="weeks">Semanas</option>
                          <option value="months">Meses</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Severidad</FormLabel>
                        <Select
                          value={symptomAnalysisForm.severity}
                          onChange={(e) => setSymptomAnalysisForm(prev => ({ ...prev, severity: e.target.value }))}
                        >
                          <option value="mild">Leve</option>
                          <option value="moderate">Moderada</option>
                          <option value="severe">Severa</option>
                        </Select>
                      </FormControl>
                    </HStack>

                    <Button
                      onClick={handleAnalyzeSymptoms}
                      colorScheme="blue"
                      isLoading={loading}
                      isDisabled={!selectedPatient}
                    >
                      Analizar Síntomas
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Resultados de Análisis */}
              <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
                {/* Aquí se mostrarían los resultados de análisis */}
              </Grid>
            </VStack>
          </TabPanel>

          {/* Panel de Análisis de Imágenes */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Análisis de Imágenes Médicas
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Tipo de Imagen</FormLabel>
                      <Select
                        value={imageAnalysisForm.image_type}
                        onChange={(e) => setImageAnalysisForm(prev => ({ ...prev, image_type: e.target.value }))}
                      >
                        <option value="xray">Radiografía</option>
                        <option value="ct">Tomografía</option>
                        <option value="mri">Resonancia Magnética</option>
                        <option value="ultrasound">Ultrasonido</option>
                        <option value="photo">Foto Médica</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Subir Imagen</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setImageAnalysisForm(prev => ({ ...prev, image_data: e.target.result }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </FormControl>

                    <Button
                      onClick={handleAnalyzeImage}
                      colorScheme="purple"
                      isLoading={loading}
                      isDisabled={!imageAnalysisForm.image_data}
                    >
                      Analizar Imagen
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Resultados de Análisis de Imagen */}
              <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
                {/* Aquí se mostrarían los resultados de análisis de imagen */}
              </Grid>
            </VStack>
          </TabPanel>

          {/* Panel de Educación Médica */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Educación Médica Personalizada
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Temas de Interés</FormLabel>
                      <CheckboxGroup
                        value={educationForm.topics}
                        onChange={(values) => setEducationForm(prev => ({ ...prev, topics: values }))}
                      >
                        <Stack direction="row" spacing={4}>
                          <Checkbox value="prevention">Prevención</Checkbox>
                          <Checkbox value="treatment">Tratamiento</Checkbox>
                          <Checkbox value="medications">Medicamentos</Checkbox>
                          <Checkbox value="lifestyle">Estilo de Vida</Checkbox>
                          <Checkbox value="symptoms">Síntomas</Checkbox>
                        </Stack>
                      </CheckboxGroup>
                    </FormControl>

                    <HStack spacing={4} w="100%">
                      <FormControl>
                        <FormLabel>Nivel</FormLabel>
                        <Select
                          value={educationForm.level}
                          onChange={(e) => setEducationForm(prev => ({ ...prev, level: e.target.value }))}
                        >
                          <option value="patient">Paciente</option>
                          <option value="professional">Profesional</option>
                          <option value="student">Estudiante</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Formato</FormLabel>
                        <Select
                          value={educationForm.format}
                          onChange={(e) => setEducationForm(prev => ({ ...prev, format: e.target.value }))}
                        >
                          <option value="text">Texto</option>
                          <option value="video">Video</option>
                          <option value="interactive">Interactivo</option>
                        </Select>
                      </FormControl>
                    </HStack>

                    <Button
                      onClick={handleGenerateEducation}
                      colorScheme="green"
                      isLoading={loading}
                      isDisabled={!selectedPatient || educationForm.topics.length === 0}
                    >
                      Generar Contenido Educativo
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Contenido Educativo Generado */}
              <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
                {/* Aquí se mostraría el contenido educativo generado */}
              </Grid>
            </VStack>
          </TabPanel>

          {/* Panel de Analytics */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} mb={6}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Sesiones de IA</StatLabel>
                    <StatNumber>{aiSessions.length}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Análisis Completados</StatLabel>
                    <StatNumber color="blue.500">0</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Imágenes Analizadas</StatLabel>
                    <StatNumber color="purple.500">0</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Contenido Educativo</StatLabel>
                    <StatNumber color="green.500">0</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Drawer de Chat */}
      <Drawer isOpen={isChatOpen} onClose={onChatClose} size="lg" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <HStack spacing={3}>
              <Icon as={FaRobot} color="blue.500" />
              <Text>Chat Médico IA</Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={0}>
            <ChatInterface />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default AdvancedAIMedical;
