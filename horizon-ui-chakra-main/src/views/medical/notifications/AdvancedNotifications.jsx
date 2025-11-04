/**
 * SMD VITAL - Sistema de Notificaciones en Tiempo Real
 * =====================================================
 * 
 * Sistema completo de notificaciones con:
 * - Notificaciones multi-canal (Email, SMS, Push, WhatsApp)
 * - Templates personalizables
 * - Programación de notificaciones
 * - Analytics y métricas
 * - Notificaciones en tiempo real
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
  DrawerContent,
  DrawerCloseButton,
  useDisclosure as useDrawerDisclosure
} from '@chakra-ui/react';
import {
  MdNotifications,
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
  MdEmail,
  MdSms,
  MdPhone,
  MdChat,
  MdSchedule,
  MdSend,
  MdPeople,
  MdMessage,
  MdInbox,
  MdOutbox,
  MdDrafts,
  MdArchive,
  MdStar,
  MdStarBorder,
  MdMarkAsUnread,
  MdMarkAsRead,
  MdDeleteForever,
  MdReply,
  MdForward,
  MdAttachFile,
  MdImage,
  MdVideoLibrary,
  MdAudioFile,
  MdDescription,
  MdHistory,
  MdTimeline,
  MdInsights,
  MdSecurity,
  MdLock,
  MdPublic,
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
  MdTrendingDown,
  MdTrendingFlat,
  MdShowChart,
  MdPieChart,
  MdBarChart,
  MdError,
  MdDone,
  MdPending,
  MdHourglassEmpty,
  MdQuestionAnswer,
  MdLightbulb,
  MdSchool,
  MdBook,
  MdVideoLibrary as MdVideoLibraryIcon,
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
  MdClose,
  MdExpandMore,
  MdExpandLess,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdFirstPage,
  MdLastPage,
  MdChevronLeft,
  MdChevronRight,
  MdChevronUp,
  MdChevronDown,
  MdArrowBack,
  MdArrowForward,
  MdArrowUpward,
  MdArrowDownward,
  MdArrowLeft,
  MdArrowRight,
  MdArrowDropDown,
  MdArrowDropUp,
  MdArrowDropDownCircle,
  MdArrowDropUpCircle,
  MdArrowBackIos,
  MdArrowForwardIos,
  MdArrowUpwardIos,
  MdArrowDownwardIos,
  MdArrowLeftIos,
  MdArrowRightIos,
  MdArrowBackIosNew,
  MdArrowForwardIosNew,
  MdArrowUpwardIosNew,
  MdArrowDownwardIosNew,
  MdArrowLeftIosNew,
  MdArrowRightIosNew
} from 'react-icons/md';
import { FaUser, FaUserMd, FaCalendarAlt, FaClock, FaFileMedical, FaStethoscope, FaHeartbeat, FaPills, FaAllergies, FaRobot, FaBrain, FaEye, FaEar, FaHands, FaLungs, FaSkull, FaBone, FaTooth, FaEyeDropper, FaFlask, FaMicroscope, FaXRay, FaMagnet, FaWaveSquare, FaBell, FaBellSlash, FaEnvelope, FaEnvelopeOpen, FaSms, FaWhatsapp, FaTelegram, FaSlack, FaDiscord, FaSkype, FaTeamspeak, FaViber, FaLine, FaWechat, FaQq, FaSnapchat, FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaTiktok, FaPinterest, FaReddit, FaTumblr, FaFlickr, FaVimeo, FaTwitch, FaSteam, FaPlaystation, FaXbox, FaNintendo, FaAndroid, FaApple, FaWindows, FaLinux, FaUbuntu, FaDebian, FaCentos, FaRedhat, FaSuse, FaFedora, FaArch, FaGentoo, FaSlackware, FaMageia, FaManjaro, FaElementary, FaZorin, FaPopOs, FaKubuntu, FaLubuntu, FaXubuntu, FaUbuntuMate, FaUbuntuStudio, FaUbuntuKylin, FaUbuntuBudgie, FaUbuntuCinnamon, FaUbuntuGnome, FaUbuntuKde, FaUbuntuLxde, FaUbuntuLxqt } from 'react-icons/fa';
import businessLogicService from '../../../services/core/BusinessLogicService';
import notificationService from '../../../services/core/NotificationService';
import aiService from '../../../services/core/AIService';
import apiService from '../../../services/apiService';

const AdvancedNotifications = () => {
  // =====================================================
  // ESTADOS Y HOOKS
  // =====================================================

  const toast = useToast();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isTemplateOpen, onOpen: onTemplateOpen, onClose: onTemplateClose } = useDisclosure();
  const { isOpen: isBulkOpen, onOpen: onBulkOpen, onClose: onBulkClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();

  // Estados principales
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Estados de filtros
  const [filters, setFilters] = useState({
    status: 'all',
    channel: 'all',
    type: 'all',
    dateRange: 'all',
    user: 'all'
  });

  // Estados de formularios
  const [notificationForm, setNotificationForm] = useState({
    recipient_id: '',
    type: 'appointment',
    channel: 'email',
    subject: '',
    content: '',
    template: '',
    priority: 'normal',
    scheduled_at: '',
    metadata: {}
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'appointment',
    channel: 'email',
    subject: '',
    content: '',
    variables: [],
    is_active: true
  });

  const [bulkForm, setBulkForm] = useState({
    recipients: [],
    type: 'appointment',
    channel: 'email',
    template: '',
    subject: '',
    content: '',
    priority: 'normal',
    scheduled_at: ''
  });

  // Colores del tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const textColorSecondary = useColorModeValue('gray.500', 'gray.400');
  const cardBg = useColorModeValue('white', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.600');

  // =====================================================
  // FUNCIONES DE CARGA DE DATOS
  // =====================================================

  const loadNotifications = useCallback(async () => {
    try {
      const params = { ...filters };
      const response = await apiService.get('/notifications', { params });
      // Extraer datos de la respuesta del API
      const notificationsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar las notificaciones',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  }, [filters, toast]);

  const loadTemplates = useCallback(async () => {
    try {
      const response = await apiService.get('/notifications/templates');
      // Extraer datos de la respuesta del API
      const templatesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const response = await apiService.get('/users');
      // Extraer datos de la respuesta del API
      const usersData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadNotifications(),
        loadTemplates(),
        loadUsers()
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
  }, [loadNotifications, loadTemplates, loadUsers, toast]);

  // =====================================================
  // EFECTOS
  // =====================================================

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      loadNotifications();
    }
  }, [filters, loadNotifications]);

  // =====================================================
  // FUNCIONES DE GESTIÓN DE NOTIFICACIONES
  // =====================================================

  const handleSendNotification = async () => {
    try {
      setLoading(true);
      
      const notification = await notificationService.sendNotification(notificationForm);
      
      setNotifications(prev => [notification, ...prev]);
      onCreateClose();
      
      // Limpiar formulario
      setNotificationForm({
        recipient_id: '',
        type: 'appointment',
        channel: 'email',
        subject: '',
        content: '',
        template: '',
        priority: 'normal',
        scheduled_at: '',
        metadata: {}
      });

      toast({
        title: 'Notificación Enviada',
        description: 'La notificación ha sido enviada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: error.message || 'Error al enviar la notificación',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setLoading(true);
      
      const response = await apiService.post('/notifications/templates', templateForm);
      // Extraer datos de la respuesta del API
      const template = response.data?.data || response.data;
      
      setTemplates(prev => [template, ...prev]);
      onTemplateClose();
      
      // Limpiar formulario
      setTemplateForm({
        name: '',
        type: 'appointment',
        channel: 'email',
        subject: '',
        content: '',
        variables: [],
        is_active: true
      });

      toast({
        title: 'Template Creado',
        description: 'El template ha sido creado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: 'Error',
        description: 'Error al crear el template',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulkNotification = async () => {
    try {
      setLoading(true);
      
      const result = await notificationService.sendBulkNotification(
        bulkForm.recipients,
        {
          type: bulkForm.type,
          channel: bulkForm.channel,
          template: bulkForm.template,
          subject: bulkForm.subject,
          content: bulkForm.content,
          priority: bulkForm.priority,
          scheduled_at: bulkForm.scheduled_at
        }
      );
      
      onBulkClose();
      
      toast({
        title: 'Notificación Masiva Enviada',
        description: `${result.sent} notificaciones enviadas exitosamente`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      toast({
        title: 'Error',
        description: 'Error al enviar la notificación masiva',
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      sent: 'green',
      delivered: 'blue',
      failed: 'red',
      cancelled: 'gray'
    };
    return colors[status] || 'gray';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: MdHourglassEmpty,
      sent: MdSend,
      delivered: MdCheckCircle,
      failed: MdError,
      cancelled: MdCancel
    };
    return icons[status] || MdInfo;
  };

  const getChannelIcon = (channel) => {
    const icons = {
      email: MdEmail,
      sms: MdSms,
      push: MdNotifications,
      whatsapp: FaWhatsapp
    };
    return icons[channel] || MdMessage;
  };

  const getChannelColor = (channel) => {
    const colors = {
      email: 'blue',
      sms: 'green',
      push: 'purple',
      whatsapp: 'green'
    };
    return colors[channel] || 'gray';
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

  const getNotificationStats = () => {
    const total = notifications.length;
    const sent = notifications.filter(n => n.status === 'sent').length;
    const delivered = notifications.filter(n => n.status === 'delivered').length;
    const failed = notifications.filter(n => n.status === 'failed').length;
    const pending = notifications.filter(n => n.status === 'pending').length;

    return {
      total,
      sent,
      delivered,
      failed,
      pending,
      deliveryRate: total > 0 ? (delivered / total) * 100 : 0
    };
  };

  // =====================================================
  // COMPONENTES DE UI
  // =====================================================

  const NotificationCard = ({ notification }) => {
    const user = users.find(u => u.id === notification.recipient_id);
    const StatusIcon = getStatusIcon(notification.status);
    const ChannelIcon = getChannelIcon(notification.channel);

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
                <Icon as={ChannelIcon} color={`${getChannelColor(notification.channel)}.500`} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold" color={textColor}>
                    {notification.subject}
                  </Text>
                  <Text fontSize="sm" color={textColorSecondary}>
                    {formatDateTime(notification.created_at)}
                  </Text>
                </VStack>
              </HStack>
              <Badge colorScheme={getStatusColor(notification.status)}>
                <Icon as={StatusIcon} mr={1} />
                {notification.status}
              </Badge>
            </Flex>
          </CardHeader>

          <CardBody pt={0}>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FaUser} color="blue.500" />
                  <Text fontSize="sm" color={textColor}>
                    {user?.name || 'Usuario no encontrado'}
                  </Text>
                </HStack>
                <Text fontSize="sm" color={textColorSecondary} textTransform="capitalize">
                  {notification.channel}
                </Text>
              </HStack>

              <Text fontSize="sm" color={textColorSecondary} noOfLines={3}>
                {notification.content}
              </Text>

              {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={1}>
                    Metadatos:
                  </Text>
                  <Code fontSize="xs" colorScheme="gray">
                    {JSON.stringify(notification.metadata, null, 2)}
                  </Code>
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
                onClick={() => setSelectedNotification(notification)}
              >
                Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Icon as={MdEdit} />}
              >
                Editar
              </Button>
              <Menu>
                <MenuButton as={Button} size="sm" variant="outline">
                  <Icon as={MdMoreVert} />
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<Icon as={MdSend} />}>
                    Reenviar
                  </MenuItem>
                  <MenuItem icon={<Icon as={MdDelete} />}>
                    Eliminar
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<Icon as={MdDownload} />}>
                    Descargar
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

  const TemplateCard = ({ template }) => (
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
              <Icon as={MdDescription} color="purple.500" />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" color={textColor}>
                  {template.name}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  {template.type} • {template.channel}
                </Text>
              </VStack>
            </HStack>
            <Badge
              colorScheme={template.is_active ? 'green' : 'gray'}
            >
              {template.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
          </Flex>
        </CardHeader>

        <CardBody pt={0}>
          <VStack spacing={3} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={1}>
                Asunto:
              </Text>
              <Text fontSize="sm" color={textColorSecondary}>
                {template.subject}
              </Text>
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={1}>
                Contenido:
              </Text>
              <Text fontSize="sm" color={textColorSecondary} noOfLines={3}>
                {template.content}
              </Text>
            </Box>

            {template.variables && template.variables.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={1}>
                  Variables:
                </Text>
                <Wrap spacing={1}>
                  {template.variables.map((variable, index) => (
                    <WrapItem key={index}>
                      <Badge colorScheme="blue" size="sm">
                        {variable}
                      </Badge>
                    </WrapItem>
                  ))}
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
            >
              Ver
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon as={MdEdit} />}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Icon as={MdDelete} />}
            >
              Eliminar
            </Button>
          </HStack>
        </CardFooter>
      </Card>
    </ScaleFade>
  );

  const NotificationAnalytics = () => {
    const stats = getNotificationStats();

    return (
      <VStack spacing={6} align="stretch">
        {/* Métricas Principales */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Notificaciones</StatLabel>
                <StatNumber>{stats.total}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Este mes
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Enviadas</StatLabel>
                <StatNumber color="green.500">{stats.sent}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +12% vs mes anterior
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Entregadas</StatLabel>
                <StatNumber color="blue.500">{stats.delivered}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +8% vs mes anterior
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Tasa de Entrega</StatLabel>
                <StatNumber color="purple.500">
                  {stats.deliveryRate.toFixed(1)}%
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  +2.3% vs mes anterior
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Distribución por Canal */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Distribución por Canal
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
              {Object.entries(
                notifications.reduce((acc, notification) => {
                  acc[notification.channel] = (acc[notification.channel] || 0) + 1;
                  return acc;
                }, {})
              ).map(([channel, count]) => (
                <Box key={channel} textAlign="center">
                  <Icon
                    as={getChannelIcon(channel)}
                    fontSize="2xl"
                    color={`${getChannelColor(channel)}.500`}
                    mb={2}
                  />
                  <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                    {count}
                  </Text>
                  <Text fontSize="sm" color={textColorSecondary} textTransform="capitalize">
                    {channel}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Distribución por Estado */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Distribución por Estado
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {stats.sent}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  Enviadas
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {stats.delivered}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  Entregadas
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                  {stats.pending}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  Pendientes
                </Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {stats.failed}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  Fallidas
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>
    );
  };

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  if (loading && notifications.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color={textColorSecondary}>
          Cargando sistema de notificaciones...
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
            Sistema de Notificaciones
          </Text>
          <Text color={textColorSecondary}>
            Gestión completa de notificaciones multi-canal en tiempo real
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            onClick={loadNotifications}
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
            Nueva Notificación
          </Button>
          <Button
            leftIcon={<Icon as={MdDescription} />}
            onClick={onTemplateOpen}
            colorScheme="purple"
          >
            Crear Template
          </Button>
          <Button
            leftIcon={<Icon as={MdPeople} />}
            onClick={onBulkOpen}
            colorScheme="green"
          >
            Notificación Masiva
          </Button>
        </HStack>
      </Flex>

      {/* Filtros y Búsqueda */}
      <Card mb={6} bg={cardBg} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <Select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              maxW="150px"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="sent">Enviadas</option>
              <option value="delivered">Entregadas</option>
              <option value="failed">Fallidas</option>
            </Select>

            <Select
              value={filters.channel}
              onChange={(e) => setFilters(prev => ({ ...prev, channel: e.target.value }))}
              maxW="150px"
            >
              <option value="all">Todos los canales</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
              <option value="whatsapp">WhatsApp</option>
            </Select>

            <Select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              maxW="150px"
            >
              <option value="all">Todos los tipos</option>
              <option value="appointment">Cita</option>
              <option value="payment">Pago</option>
              <option value="prescription">Receta</option>
              <option value="reminder">Recordatorio</option>
            </Select>

            <Select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              maxW="150px"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </Select>
          </HStack>
        </CardBody>
      </Card>

      {/* Contenido Principal */}
      <Tabs index={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab>
            <Icon as={MdInbox} mr={2} />
            Notificaciones
          </Tab>
          <Tab>
            <Icon as={MdDescription} mr={2} />
            Templates
          </Tab>
          <Tab>
            <Icon as={MdAnalytics} mr={2} />
            Analytics
          </Tab>
        </TabList>

        <TabPanels>
          {/* Panel de Notificaciones */}
          <TabPanel>
            <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
              {notifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </Grid>
          </TabPanel>

          {/* Panel de Templates */}
          <TabPanel>
            <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
              {templates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </Grid>
          </TabPanel>

          {/* Panel de Analytics */}
          <TabPanel>
            <NotificationAnalytics />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modales */}
      {/* Modal de Crear Notificación */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nueva Notificación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Destinatario</FormLabel>
                  <Select
                    value={notificationForm.recipient_id}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, recipient_id: e.target.value }))}
                  >
                    <option value="">Seleccionar destinatario</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="appointment">Cita</option>
                    <option value="payment">Pago</option>
                    <option value="prescription">Receta</option>
                    <option value="reminder">Recordatorio</option>
                    <option value="alert">Alerta</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Canal</FormLabel>
                  <Select
                    value={notificationForm.channel}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, channel: e.target.value }))}
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push</option>
                    <option value="whatsapp">WhatsApp</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Prioridad</FormLabel>
                  <Select
                    value={notificationForm.priority}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Asunto</FormLabel>
                <Input
                  value={notificationForm.subject}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Asunto de la notificación"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Contenido</FormLabel>
                <Textarea
                  value={notificationForm.content}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenido de la notificación..."
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Programar (Opcional)</FormLabel>
                <Input
                  type="datetime-local"
                  value={notificationForm.scheduled_at}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, scheduled_at: e.target.value }))}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onCreateClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleSendNotification} isLoading={loading}>
              Enviar Notificación
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdvancedNotifications;
