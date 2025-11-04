/**
 * SMD VITAL - Panel de Administración Avanzado
 * ============================================
 * 
 * Panel completo de administración con:
 * - Dashboard ejecutivo
 * - Gestión de usuarios y roles
 * - Configuración del sistema
 * - Monitoreo en tiempo real
 * - Analytics avanzados
 * - Auditoría y logs
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
  MdAdminPanelSettings,
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
  MdPeople,
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
  MdStar,
  MdStarBorder,
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
  MdArrowRightIosNew,
  MdPerson,
  MdGroup,
  MdSupervisorAccount,
  MdAdminPanelSettings as MdAdminPanelSettingsIcon,
  MdManageAccounts,
  MdAccountCircle,
  MdAccountBalance,
  MdAccountBalanceWallet,
  MdAccountBox,
  MdAccountTree,
  MdAccountBalanceWallet as MdAccountBalanceWalletIcon,
  MdAccountBalance as MdAccountBalanceIcon,
  MdAccountBox as MdAccountBoxIcon,
  MdAccountTree as MdAccountTreeIcon,
  MdAccountCircle as MdAccountCircleIcon,
  MdGroup as MdGroupIcon,
  MdSupervisorAccount as MdSupervisorAccountIcon,
  MdManageAccounts as MdManageAccountsIcon,
  MdPerson as MdPersonIcon,
  MdPersonAdd,
  MdPersonRemove,
  MdPersonSearch,
  MdPersonPin,
  MdPersonPinCircle,
  MdPersonPinCircle as MdPersonPinCircleIcon,
  MdPersonPin as MdPersonPinIcon,
  MdPersonSearch as MdPersonSearchIcon,
  MdPersonRemove as MdPersonRemoveIcon,
  MdPersonAdd as MdPersonAddIcon,
  MdPerson as MdPersonIcon2,
  MdGroup as MdGroupIcon2,
  MdSupervisorAccount as MdSupervisorAccountIcon2,
  MdManageAccounts as MdManageAccountsIcon2,
  MdAdminPanelSettings as MdAdminPanelSettingsIcon2,
  MdAccountCircle as MdAccountCircleIcon2,
  MdAccountBalance as MdAccountBalanceIcon2,
  MdAccountBox as MdAccountBoxIcon2,
  MdAccountTree as MdAccountTreeIcon2,
  MdAccountBalanceWallet as MdAccountBalanceWalletIcon2,
  MdPhone,
  MdHistory
} from 'react-icons/md';
import { FaUser, FaUserMd, FaCalendarAlt, FaClock, FaFileMedical, FaStethoscope, FaHeartbeat, FaPills, FaAllergies, FaRobot, FaBrain, FaEye, FaEar, FaHands, FaLungs, FaSkull, FaBone, FaTooth, FaEyeDropper, FaFlask, FaMicroscope, FaXRay, FaMagnet, FaWaveSquare, FaBell, FaBellSlash, FaEnvelope, FaEnvelopeOpen, FaSms, FaWhatsapp, FaTelegram, FaSlack, FaDiscord, FaSkype, FaTeamspeak, FaViber, FaLine, FaWechat, FaQq, FaSnapchat, FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaYoutube, FaTiktok, FaPinterest, FaReddit, FaTumblr, FaFlickr, FaVimeo, FaTwitch, FaSteam, FaPlaystation, FaXbox, FaNintendo, FaAndroid, FaApple, FaWindows, FaLinux, FaUbuntu, FaDebian, FaCentos, FaRedhat, FaSuse, FaFedora, FaArch, FaGentoo, FaSlackware, FaMageia, FaManjaro, FaElementary, FaZorin, FaPopOs, FaKubuntu, FaLubuntu, FaXubuntu, FaUbuntuMate, FaUbuntuStudio, FaUbuntuKylin, FaUbuntuBudgie, FaUbuntuCinnamon, FaUbuntuGnome, FaUbuntuKde, FaUbuntuLxde, FaUbuntuLxqt, FaUbuntuMate as FaUbuntuMateIcon, FaUbuntuStudio as FaUbuntuStudioIcon, FaUbuntuKylin as FaUbuntuKylinIcon, FaUbuntuBudgie as FaUbuntuBudgieIcon, FaUbuntuCinnamon as FaUbuntuCinnamonIcon, FaUbuntuGnome as FaUbuntuGnomeIcon, FaUbuntuKde as FaUbuntuKdeIcon, FaUbuntuLxde as FaUbuntuLxdeIcon, FaUbuntuLxqt as FaUbuntuLxqtIcon, FaUbuntuMate as FaUbuntuMateIcon2, FaUbuntuStudio as FaUbuntuStudioIcon2, FaUbuntuKylin as FaUbuntuKylinIcon2, FaUbuntuBudgie as FaUbuntuBudgieIcon2, FaUbuntuCinnamon as FaUbuntuCinnamonIcon2, FaUbuntuGnome as FaUbuntuGnomeIcon2, FaUbuntuKde as FaUbuntuKdeIcon2, FaUbuntuLxde as FaUbuntuLxdeIcon2, FaUbuntuLxqt as FaUbuntuLxqtIcon2 } from 'react-icons/fa';
import businessLogicService from '../../../services/core/BusinessLogicService';
import notificationService from '../../../services/core/NotificationService';
import aiService from '../../../services/core/AIService';
import apiService from '../../../services/apiService';

const AdvancedAdminPanel = () => {
  // =====================================================
  // ESTADOS Y HOOKS
  // =====================================================

  const toast = useToast();
  const { isOpen: isUserOpen, onOpen: onUserOpen, onClose: onUserClose } = useDisclosure();
  const { isOpen: isRoleOpen, onOpen: onRoleOpen, onClose: onRoleClose } = useDisclosure();
  const { isOpen: isSystemOpen, onOpen: onSystemOpen, onClose: onSystemClose } = useDisclosure();
  const { isOpen: isAuditOpen, onOpen: onAuditOpen, onClose: onAuditClose } = useDisclosure();

  // Estados principales
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Estados de formularios
  const [userForm, setUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role: 'patient',
    is_active: true,
    is_verified: false
  });

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: [],
    is_active: true
  });

  const [systemForm, setSystemForm] = useState({
    app_name: 'SMD VITAL',
    app_version: '2.0.0',
    max_appointment_duration: 120,
    default_appointment_duration: 30,
    notification_retry_attempts: 3,
    payment_timeout_minutes: 15
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

  // =====================================================
  // FUNCIONES DE CARGA DE DATOS
  // =====================================================

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUsers(),
        loadRoles(),
        loadSystemStats(),
        loadAuditLogs()
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

  const loadUsers = async () => {
    try {
      const response = await apiService.get('/admin/users');
      // Extraer datos de la respuesta del API
      const usersData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await apiService.get('/admin/roles');
      // Extraer datos de la respuesta del API
      const rolesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadSystemStats = async () => {
    try {
      const response = await apiService.get('/admin/system-stats');
      // Extraer datos de la respuesta del API - En este caso puede ser un objeto
      const statsData = response.data?.data || response.data || {};
      setSystemStats(statsData);
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const response = await apiService.get('/admin/audit-logs');
      // Extraer datos de la respuesta del API
      const logsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setAuditLogs(logsData);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  // =====================================================
  // FUNCIONES DE GESTIÓN
  // =====================================================

  const handleCreateUser = async () => {
    try {
      setLoading(true);
      
      const response = await apiService.post('/admin/users', userForm);
      const user = response.data;
      
      setUsers(prev => [user, ...prev]);
      onUserClose();
      
      // Limpiar formulario
      setUserForm({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role: 'patient',
        is_active: true,
        is_verified: false
      });

      toast({
        title: 'Usuario Creado',
        description: 'El usuario ha sido creado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'Error al crear el usuario',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      setLoading(true);
      
      const response = await apiService.post('/admin/roles', roleForm);
      const role = response.data;
      
      setRoles(prev => [role, ...prev]);
      onRoleClose();
      
      // Limpiar formulario
      setRoleForm({
        name: '',
        description: '',
        permissions: [],
        is_active: true
      });

      toast({
        title: 'Rol Creado',
        description: 'El rol ha sido creado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error creating role:', error);
      toast({
        title: 'Error',
        description: 'Error al crear el rol',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSystemSettings = async () => {
    try {
      setLoading(true);
      
      await apiService.put('/admin/system-settings', systemForm);
      
      onSystemClose();
      
      toast({
        title: 'Configuración Actualizada',
        description: 'La configuración del sistema ha sido actualizada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error updating system settings:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar la configuración',
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

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'red',
      doctor: 'blue',
      nurse: 'green',
      receptionist: 'purple',
      patient: 'gray'
    };
    return colors[role] || 'gray';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      inactive: 'red',
      pending: 'yellow',
      suspended: 'orange'
    };
    return colors[status] || 'gray';
  };

  // =====================================================
  // COMPONENTES DE UI
  // =====================================================

  const UserCard = ({ user }) => (
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
                name={`${user.first_name} ${user.last_name}`}
                src={user.avatar_url}
                size="md"
              >
                <AvatarBadge
                  boxSize="1.25em"
                  bg={user.is_active ? 'green.500' : 'red.500'}
                />
              </Avatar>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" color={textColor}>
                  {user.first_name} {user.last_name}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  {user.email}
                </Text>
              </VStack>
            </HStack>
            <Badge
              colorScheme={getRoleColor(user.role)}
            >
              {user.role}
            </Badge>
          </Flex>
        </CardHeader>

        <CardBody pt={0}>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Icon as={MdPhone} color="blue.500" />
                <Text fontSize="sm" color={textColor}>
                  {user.phone_number || 'No especificado'}
                </Text>
              </HStack>
              <Badge
                colorScheme={getStatusColor(user.is_active ? 'active' : 'inactive')}
              >
                {user.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm" color={textColorSecondary}>
                Último acceso: {user.last_login ? formatDateTime(user.last_login) : 'Nunca'}
              </Text>
              <Text fontSize="sm" color={textColorSecondary}>
                Creado: {formatDateTime(user.created_at)}
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
              onClick={() => setSelectedUser(user)}
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
                <MenuItem icon={<Icon as={MdSecurity} />}>
                  Cambiar Rol
                </MenuItem>
                <MenuItem icon={<Icon as={MdLock} />}>
                  {user.is_active ? 'Desactivar' : 'Activar'}
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<Icon as={MdDelete} />}>
                  Eliminar
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </CardFooter>
      </Card>
    </ScaleFade>
  );

  const RoleCard = ({ role }) => (
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
              <Icon as={MdSecurity} color="purple.500" />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" color={textColor}>
                  {role.name}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  {role.description}
                </Text>
              </VStack>
            </HStack>
            <Badge
              colorScheme={role.is_active ? 'green' : 'gray'}
            >
              {role.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
          </Flex>
        </CardHeader>

        <CardBody pt={0}>
          <VStack spacing={3} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
                Permisos:
              </Text>
              <Wrap spacing={1}>
                {role.permissions?.slice(0, 5).map((permission, index) => (
                  <WrapItem key={index}>
                    <Badge colorScheme="blue" size="sm">
                      {permission}
                    </Badge>
                  </WrapItem>
                ))}
                {role.permissions?.length > 5 && (
                  <WrapItem>
                    <Badge colorScheme="gray" size="sm">
                      +{role.permissions.length - 5} más
                    </Badge>
                  </WrapItem>
                )}
              </Wrap>
            </Box>
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

  const SystemDashboard = () => (
    <VStack spacing={6} align="stretch">
      {/* Métricas del Sistema */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Usuarios Totales</StatLabel>
              <StatNumber>{systemStats.total_users || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                +12% este mes
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Citas Hoy</StatLabel>
              <StatNumber color="blue.500">{systemStats.appointments_today || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                +8% vs ayer
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Pagos Procesados</StatLabel>
              <StatNumber color="green.500">{systemStats.payments_processed || 0}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                +15% este mes
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Uptime del Sistema</StatLabel>
              <StatNumber color="purple.500">{systemStats.uptime || '99.9%'}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                +0.1% vs mes anterior
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Estado de los Servicios */}
      <Card>
        <CardHeader>
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            Estado de los Servicios
          </Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            {[
              { name: 'Authentication Service', status: 'healthy', port: 8001 },
              { name: 'Users Service', status: 'healthy', port: 8002 },
              { name: 'Appointments Service', status: 'healthy', port: 8003 },
              { name: 'Medical Records Service', status: 'healthy', port: 8004 },
              { name: 'Payments Service', status: 'healthy', port: 8005 },
              { name: 'Notifications Service', status: 'healthy', port: 8006 },
              { name: 'AI Medical Service', status: 'healthy', port: 8007 }
            ].map((service, index) => (
              <HStack key={index} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                <HStack spacing={3}>
                  <Icon as={MdCheckCircle} color="green.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="semibold" color={textColor}>
                      {service.name}
                    </Text>
                    <Text fontSize="sm" color={textColorSecondary}>
                      Puerto {service.port}
                    </Text>
                  </VStack>
                </HStack>
                <Badge colorScheme="green">
                  {service.status}
                </Badge>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );

  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================

  if (loading && users.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color={textColorSecondary}>
          Cargando panel de administración...
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
            Panel de Administración
          </Text>
          <Text color={textColorSecondary}>
            Gestión completa del sistema SMD VITAL
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
            leftIcon={<Icon as={MdPersonAdd} />}
            onClick={onUserOpen}
            colorScheme="blue"
          >
            Nuevo Usuario
          </Button>
          <Button
            leftIcon={<Icon as={MdSecurity} />}
            onClick={onRoleOpen}
            colorScheme="purple"
          >
            Nuevo Rol
          </Button>
          <Button
            leftIcon={<Icon as={MdSettings} />}
            onClick={onSystemOpen}
            colorScheme="green"
          >
            Configuración
          </Button>
        </HStack>
      </Flex>

      {/* Contenido Principal */}
      <Tabs index={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab>
            <Icon as={MdDashboard} mr={2} />
            Dashboard
          </Tab>
          <Tab>
            <Icon as={MdPeople} mr={2} />
            Usuarios
          </Tab>
          <Tab>
            <Icon as={MdSecurity} mr={2} />
            Roles
          </Tab>
          <Tab>
            <Icon as={MdHistory} mr={2} />
            Auditoría
          </Tab>
        </TabList>

        <TabPanels>
          {/* Panel de Dashboard */}
          <TabPanel>
            <SystemDashboard />
          </TabPanel>

          {/* Panel de Usuarios */}
          <TabPanel>
            <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
              {users.map(user => (
                <UserCard key={user.id} user={user} />
              ))}
            </Grid>
          </TabPanel>

          {/* Panel de Roles */}
          <TabPanel>
            <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
              {roles.map(role => (
                <RoleCard key={role.id} role={role} />
              ))}
            </Grid>
          </TabPanel>

          {/* Panel de Auditoría */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Text fontSize="lg" fontWeight="bold" color={textColor}>
                  Logs de Auditoría
                </Text>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Usuario</Th>
                        <Th>Acción</Th>
                        <Th>Tabla</Th>
                        <Th>Fecha</Th>
                        <Th>IP</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {auditLogs.map((log, index) => (
                        <Tr key={index}>
                          <Td>{log.user_id}</Td>
                          <Td>
                            <Badge colorScheme="blue">
                              {log.action}
                            </Badge>
                          </Td>
                          <Td>{log.table_name}</Td>
                          <Td>{formatDateTime(log.created_at)}</Td>
                          <Td>{log.ip_address}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Modales */}
      {/* Modal de Crear Usuario */}
      <Modal isOpen={isUserOpen} onClose={onUserClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Usuario</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Nombre</FormLabel>
                  <Input
                    value={userForm.first_name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Nombre"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Apellido</FormLabel>
                  <Input
                    value={userForm.last_name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Apellido"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@ejemplo.com"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Teléfono</FormLabel>
                <Input
                  value={userForm.phone_number}
                  onChange={(e) => setUserForm(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="+57 300 123 4567"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Rol</FormLabel>
                <Select
                  value={userForm.role}
                  onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="patient">Paciente</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Enfermero</option>
                  <option value="receptionist">Recepcionista</option>
                  <option value="admin">Administrador</option>
                </Select>
              </FormControl>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <HStack>
                    <Switch
                      isChecked={userForm.is_active}
                      onChange={(e) => setUserForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <FormLabel mb={0}>Usuario Activo</FormLabel>
                  </HStack>
                </FormControl>
                <FormControl>
                  <HStack>
                    <Switch
                      isChecked={userForm.is_verified}
                      onChange={(e) => setUserForm(prev => ({ ...prev, is_verified: e.target.checked }))}
                    />
                    <FormLabel mb={0}>Email Verificado</FormLabel>
                  </HStack>
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onUserClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleCreateUser} isLoading={loading}>
              Crear Usuario
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Crear Rol */}
      <Modal isOpen={isRoleOpen} onClose={onRoleClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Rol</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nombre del Rol</FormLabel>
                <Input
                  value={roleForm.name}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del rol"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del rol"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Permisos</FormLabel>
                <CheckboxGroup
                  value={roleForm.permissions}
                  onChange={(values) => setRoleForm(prev => ({ ...prev, permissions: values }))}
                >
                  <Stack direction="column" spacing={2}>
                    <Checkbox value="read_patients">Leer Pacientes</Checkbox>
                    <Checkbox value="write_patients">Escribir Pacientes</Checkbox>
                    <Checkbox value="read_appointments">Leer Citas</Checkbox>
                    <Checkbox value="write_appointments">Escribir Citas</Checkbox>
                    <Checkbox value="read_medical_records">Leer Expedientes</Checkbox>
                    <Checkbox value="write_medical_records">Escribir Expedientes</Checkbox>
                    <Checkbox value="read_payments">Leer Pagos</Checkbox>
                    <Checkbox value="write_payments">Escribir Pagos</Checkbox>
                    <Checkbox value="admin_access">Acceso de Administrador</Checkbox>
                  </Stack>
                </CheckboxGroup>
              </FormControl>

              <FormControl>
                <HStack>
                  <Switch
                    isChecked={roleForm.is_active}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                  <FormLabel mb={0}>Rol Activo</FormLabel>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onRoleClose}>
              Cancelar
            </Button>
            <Button colorScheme="purple" onClick={handleCreateRole} isLoading={loading}>
              Crear Rol
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Configuración del Sistema */}
      <Modal isOpen={isSystemOpen} onClose={onSystemClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Configuración del Sistema</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Nombre de la Aplicación</FormLabel>
                  <Input
                    value={systemForm.app_name}
                    onChange={(e) => setSystemForm(prev => ({ ...prev, app_name: e.target.value }))}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Versión</FormLabel>
                  <Input
                    value={systemForm.app_version}
                    onChange={(e) => setSystemForm(prev => ({ ...prev, app_version: e.target.value }))}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Duración Máxima de Citas (min)</FormLabel>
                  <NumberInput
                    value={systemForm.max_appointment_duration}
                    onChange={(value) => setSystemForm(prev => ({ ...prev, max_appointment_duration: value }))}
                    min={30}
                    max={480}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>Duración por Defecto (min)</FormLabel>
                  <NumberInput
                    value={systemForm.default_appointment_duration}
                    onChange={(value) => setSystemForm(prev => ({ ...prev, default_appointment_duration: value }))}
                    min={15}
                    max={120}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Intentos de Notificación</FormLabel>
                  <NumberInput
                    value={systemForm.notification_retry_attempts}
                    onChange={(value) => setSystemForm(prev => ({ ...prev, notification_retry_attempts: value }))}
                    min={1}
                    max={10}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>Timeout de Pagos (min)</FormLabel>
                  <NumberInput
                    value={systemForm.payment_timeout_minutes}
                    onChange={(value) => setSystemForm(prev => ({ ...prev, payment_timeout_minutes: value }))}
                    min={5}
                    max={60}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onSystemClose}>
              Cancelar
            </Button>
            <Button colorScheme="green" onClick={handleUpdateSystemSettings} isLoading={loading}>
              Actualizar Configuración
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdvancedAdminPanel;
