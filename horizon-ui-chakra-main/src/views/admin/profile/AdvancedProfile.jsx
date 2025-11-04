/**
 * SMD VITAL - Sistema de Perfiles Avanzados
 * ==========================================
 * 
 * Módulo completo de gestión de perfiles médicos con configuración
 * personalizada, preferencias de usuario, historial de actividad
 * y configuración de seguridad avanzada.
 * 
 * Features:
 * - Perfil médico completo con información profesional
 * - Configuraciones personalizadas por rol
 * - Preferencias de notificaciones avanzadas
 * - Historial de actividad detallado
 * - Configuración de seguridad y privacidad
 * - Integración con sistemas de autenticación
 * - Gestión de permisos y accesos
 * 
 * Author: Senior Developer Team
 * Version: 2.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  Button,
  Input,
  Textarea,
  Select,
  Switch,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Avatar,
  Badge,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  VStack,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  useColorModeValue,
  Container,
  Heading,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Code,
  Tag,
  TagLabel,
  TagCloseButton,
  Editable,
  EditableInput,
  EditablePreview,
  useEditableControls,
  ButtonGroup,
  IconButton as ChakraIconButton,
  Spinner
} from '@chakra-ui/react';

// Icons
import {
  MdPerson,
  MdEdit,
  MdSave,
  MdCancel,
  MdDelete,
  MdAdd,
  MdSecurity,
  MdNotifications,
  MdSettings,
  MdHistory,
  MdVisibility,
  MdVisibilityOff,
  MdLock,
  MdLockOpen,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdWork,
  MdSchool,
  MdLocalHospital,
  MdCalendarToday,
  MdAccessTime,
  MdLanguage,
  MdPalette,
  MdDashboard,
  MdAnalytics,
  MdTrendingUp,
  MdWarning,
  MdInfo,
  MdCheckCircle,
  MdCancel as MdCancelIcon,
  MdRefresh,
  MdUpload,
  MdDownload,
  MdShare,
  MdMoreVert,
  MdVerified,
  MdStar,
  MdStarBorder,
  MdFavorite,
  MdFavoriteBorder,
  MdThumbUp,
  MdThumbDown,
  MdComment,
  MdReply,
  MdFlag,
  MdReport,
  MdBlock,
  MdUnblock,
  MdKey,
  MdFingerprint,
  MdShield,
  MdVpnKey,
  MdDeviceHub,
  MdComputer,
  MdPhoneAndroid,
  MdTablet,
  MdWatch,
  MdHeadset,
  MdCamera,
  MdMic,
  MdVolumeUp,
  MdVolumeOff,
  MdBrightness4,
  MdBrightness7,
  MdWbSunny,
  MdNightlightRound,
  MdAutoAwesome,
  MdAutoFixHigh,
  MdAutoFixNormal,
  MdAutoFixOff,
  MdBuild,
  MdConstruction,
  MdEngineering,
  MdScience,
  MdBiotech,
  MdPsychology,
  MdHealthAndSafety,
  MdLocalPharmacy,
  MdMedication,
  MdHealing,
  MdSick,
  MdEmergency,
  MdAmbulance,
  MdLocalFireDepartment,
  MdPolice,
  MdSecurity as MdSecurityIcon,
  MdAdminPanelSettings,
  MdSupervisorAccount,
  MdGroup,
  MdPersonAdd,
  MdPersonRemove,
  MdPersonSearch,
  MdPersonPin,
  MdPersonPinCircle,
  MdPersonOutline,
  MdPersonOff,
  MdPersonAddAlt1,
  MdPersonAddAlt,
  MdPersonRemoveAlt1,
  MdPersonRemoveAlt,
  MdPersonSearchAlt1,
  MdPersonSearchAlt,
  MdPersonPinAlt1,
  MdPersonPinAlt,
  MdPersonPinCircleAlt1,
  MdPersonPinCircleAlt,
  MdPersonOutlineAlt1,
  MdPersonOutlineAlt,
  MdPersonOffAlt1,
  MdPersonOffAlt
} from 'react-icons/md';

// Services
import apiService from '../../../services/apiService';
import businessLogicService from '../../../services/core/BusinessLogicService';
import notificationService from '../../../services/core/NotificationService';

// Utils
import { formatDate, formatTime } from '../../../utils/formatters';

const AdvancedProfile = () => {
  // =====================================================
  // STATE MANAGEMENT
  // =====================================================
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({});
  const [activityHistory, setActivityHistory] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [notifications, setNotifications] = useState({});
  const [permissions, setPermissions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  // Modals
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();
  const { isOpen: isSecurityOpen, onOpen: onSecurityOpen, onClose: onSecurityClose } = useDisclosure();
  const { isOpen: isDeviceOpen, onOpen: onDeviceOpen, onClose: onDeviceClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // =====================================================
  // DATA FETCHING
  // =====================================================

  useEffect(() => {
    loadProfileData();
    loadActivityHistory();
    loadSecurityLogs();
    loadPreferences();
    loadNotifications();
    loadPermissions();
    loadDevices();
    loadSessions();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/profile/medical');
      // Extraer datos de la respuesta del API - Es un objeto de perfil
      const profileData = response.data?.data || response.data || {};
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar el perfil',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActivityHistory = async () => {
    try {
      const response = await apiService.get('/profile/activity-history');
      // Extraer datos de la respuesta del API
      const historyData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setActivityHistory(historyData);
    } catch (error) {
      console.error('Error loading activity history:', error);
    }
  };

  const loadSecurityLogs = async () => {
    try {
      const response = await apiService.get('/profile/security-logs');
      // Extraer datos de la respuesta del API
      const logsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setSecurityLogs(logsData);
    } catch (error) {
      console.error('Error loading security logs:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await apiService.get('/profile/preferences');
      // Extraer datos de la respuesta del API - Es un objeto de preferencias
      const preferencesData = response.data?.data || response.data || {};
      setPreferences(preferencesData);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await apiService.get('/profile/notifications');
      // Extraer datos de la respuesta del API - Puede ser array u objeto
      const notificationsData = response.data?.data || response.data || {};
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await apiService.get('/profile/permissions');
      // Extraer datos de la respuesta del API
      const permissionsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const loadDevices = async () => {
    try {
      const response = await apiService.get('/profile/devices');
      // Extraer datos de la respuesta del API
      const devicesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setDevices(devicesData);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const response = await apiService.get('/profile/sessions');
      // Extraer datos de la respuesta del API
      const sessionsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  // =====================================================
  // PROFILE MANAGEMENT
  // =====================================================

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await apiService.put('/profile/medical', profile);
      setIsEditing(false);
      toast({
        title: 'Éxito',
        description: 'Perfil actualizado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar el perfil',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await apiService.put('/profile/change-password', passwordData);
      setPasswordData({ current: '', new: '', confirm: '' });
      onPasswordClose();
      toast({
        title: 'Éxito',
        description: 'Contraseña actualizada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: 'Error al cambiar la contraseña',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdatePreferences = async (newPreferences) => {
    try {
      await apiService.put('/profile/preferences', newPreferences);
      setPreferences(newPreferences);
      toast({
        title: 'Éxito',
        description: 'Preferencias actualizadas exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar las preferencias',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateNotifications = async (newNotifications) => {
    try {
      await apiService.put('/profile/notifications', newNotifications);
      setNotifications(newNotifications);
      toast({
        title: 'Éxito',
        description: 'Configuración de notificaciones actualizada',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast({
        title: 'Error',
        description: 'Error al actualizar las notificaciones',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // =====================================================
  // RENDER FUNCTIONS
  // =====================================================

  const renderProfileHeader = () => (
    <Card mb={6}>
      <CardBody>
        <Flex align="center" gap={6}>
          <Avatar
            size="2xl"
            src={profile.avatar}
            name={`${profile.first_name} ${profile.last_name}`}
            bg="blue.500"
          />
          <Box flex="1">
            <HStack spacing={4} mb={2}>
              <Heading size="lg">
                {profile.first_name} {profile.last_name}
              </Heading>
              <Badge colorScheme="blue" variant="subtle">
                {profile.role}
              </Badge>
              {profile.verified && (
                <Badge colorScheme="green" variant="subtle" leftIcon={<MdVerified />}>
                  Verificado
                </Badge>
              )}
            </HStack>
            <Text color="gray.600" mb={2}>
              {profile.specialty} • {profile.department}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Miembro desde {formatDate(profile.created_at)}
            </Text>
          </Box>
          <VStack spacing={2}>
            <Button
              leftIcon={isEditing ? <MdSave /> : <MdEdit />}
              colorScheme={isEditing ? 'green' : 'blue'}
              onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              isLoading={saving}
            >
              {isEditing ? 'Guardar' : 'Editar'}
            </Button>
            {isEditing && (
              <Button
                leftIcon={<MdCancel />}
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  loadProfileData();
                }}
              >
                Cancelar
              </Button>
            )}
          </VStack>
        </Flex>
      </CardBody>
    </Card>
  );

  const renderPersonalInfo = () => (
    <Card>
      <CardHeader>
        <Heading size="md">Información Personal</Heading>
      </CardHeader>
      <CardBody>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
          <FormControl>
            <FormLabel>Nombre</FormLabel>
            {isEditing ? (
              <Input
                value={profile.first_name || ''}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              />
            ) : (
              <Text>{profile.first_name}</Text>
            )}
          </FormControl>
          
          <FormControl>
            <FormLabel>Apellido</FormLabel>
            {isEditing ? (
              <Input
                value={profile.last_name || ''}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              />
            ) : (
              <Text>{profile.last_name}</Text>
            )}
          </FormControl>
          
          <FormControl>
            <FormLabel>Email</FormLabel>
            {isEditing ? (
              <Input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            ) : (
              <Text>{profile.email}</Text>
            )}
          </FormControl>
          
          <FormControl>
            <FormLabel>Teléfono</FormLabel>
            {isEditing ? (
              <Input
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            ) : (
              <Text>{profile.phone}</Text>
            )}
          </FormControl>
          
          <FormControl>
            <FormLabel>Fecha de Nacimiento</FormLabel>
            {isEditing ? (
              <Input
                type="date"
                value={profile.date_of_birth || ''}
                onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
              />
            ) : (
              <Text>{formatDate(profile.date_of_birth)}</Text>
            )}
          </FormControl>
          
          <FormControl>
            <FormLabel>Género</FormLabel>
            {isEditing ? (
              <Select
                value={profile.gender || ''}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </Select>
            ) : (
              <Text>{profile.gender}</Text>
            )}
          </FormControl>
        </Grid>
      </CardBody>
    </Card>
  );

  const renderProfessionalInfo = () => (
    <Card>
      <CardHeader>
        <Heading size="md">Información Profesional</Heading>
      </CardHeader>
      <CardBody>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
          <FormControl>
            <FormLabel>Especialidad</FormLabel>
            {isEditing ? (
              <Select
                value={profile.specialty || ''}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
              >
                <option value="general">Medicina General</option>
                <option value="cardiology">Cardiología</option>
                <option value="neurology">Neurología</option>
                <option value="pediatrics">Pediatría</option>
                <option value="surgery">Cirugía</option>
                <option value="dermatology">Dermatología</option>
                <option value="psychiatry">Psiquiatría</option>
                <option value="radiology">Radiología</option>
              </Select>
            ) : (
              <Text>{profile.specialty}</Text>
            )}
          </FormControl>
          
          <FormControl>
            <FormLabel>Departamento</FormLabel>
            {isEditing ? (
              <Input
                value={profile.department || ''}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              />
            ) : (
              <Text>{profile.department}</Text>
            )}
          </FormControl>
          
          <FormControl>
            <FormLabel>Número de Licencia</FormLabel>
            {isEditing ? (
              <Input
                value={profile.license_number || ''}
                onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
              />
            ) : (
              <Text>{profile.license_number}</Text>
            )}
          </FormControl>
          
          <FormControl>
            <FormLabel>Universidad</FormLabel>
            {isEditing ? (
              <Input
                value={profile.university || ''}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
              />
            ) : (
              <Text>{profile.university}</Text>
            )}
          </FormControl>
          
          <FormControl>
            <FormLabel>Años de Experiencia</FormLabel>
            {isEditing ? (
              <Input
                type="number"
                value={profile.years_experience || ''}
                onChange={(e) => setProfile({ ...profile, years_experience: e.target.value })}
              />
            ) : (
              <Text>{profile.years_experience} años</Text>
            )}
          </FormControl>
          
          <FormControl>
            <FormLabel>Biografía</FormLabel>
            {isEditing ? (
              <Textarea
                value={profile.biography || ''}
                onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
                rows={4}
              />
            ) : (
              <Text>{profile.biography}</Text>
            )}
          </FormControl>
        </Grid>
      </CardBody>
    </Card>
  );

  const renderSecuritySettings = () => (
    <Card>
      <CardHeader>
        <Heading size="md">Configuración de Seguridad</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontWeight="bold">Contraseña</Text>
              <Text fontSize="sm" color="gray.500">
                Última actualización: {formatDate(profile.password_updated_at)}
              </Text>
            </Box>
            <Button leftIcon={<MdKey />} onClick={onPasswordOpen}>
              Cambiar Contraseña
            </Button>
          </Flex>
          
          <Divider />
          
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontWeight="bold">Autenticación de Dos Factores</Text>
              <Text fontSize="sm" color="gray.500">
                Añade una capa extra de seguridad
              </Text>
            </Box>
            <Switch
              isChecked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
            />
          </Flex>
          
          <Divider />
          
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontWeight="bold">Autenticación Biométrica</Text>
              <Text fontSize="sm" color="gray.500">
                Usa tu huella dactilar o reconocimiento facial
              </Text>
            </Box>
            <Switch
              isChecked={biometricEnabled}
              onChange={(e) => setBiometricEnabled(e.target.checked)}
            />
          </Flex>
          
          <Divider />
          
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontWeight="bold">Sesiones Activas</Text>
              <Text fontSize="sm" color="gray.500">
                {sessions.length} dispositivos conectados
              </Text>
            </Box>
            <Button leftIcon={<MdDeviceHub />} onClick={onDeviceOpen}>
              Gestionar
            </Button>
          </Flex>
        </VStack>
      </CardBody>
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card>
      <CardHeader>
        <Heading size="md">Configuración de Notificaciones</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Email</FormLabel>
            <VStack spacing={2} align="stretch">
              <Flex justify="space-between" align="center">
                <Text>Nuevas citas</Text>
                <Switch
                  isChecked={notifications.email_appointments}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    email_appointments: e.target.checked
                  })}
                />
              </Flex>
              <Flex justify="space-between" align="center">
                <Text>Recordatorios</Text>
                <Switch
                  isChecked={notifications.email_reminders}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    email_reminders: e.target.checked
                  })}
                />
              </Flex>
              <Flex justify="space-between" align="center">
                <Text>Actualizaciones del sistema</Text>
                <Switch
                  isChecked={notifications.email_system}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    email_system: e.target.checked
                  })}
                />
              </Flex>
            </VStack>
          </FormControl>
          
          <Divider />
          
          <FormControl>
            <FormLabel>SMS</FormLabel>
            <VStack spacing={2} align="stretch">
              <Flex justify="space-between" align="center">
                <Text>Recordatorios urgentes</Text>
                <Switch
                  isChecked={notifications.sms_urgent}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    sms_urgent: e.target.checked
                  })}
                />
              </Flex>
              <Flex justify="space-between" align="center">
                <Text>Confirmaciones de pago</Text>
                <Switch
                  isChecked={notifications.sms_payments}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    sms_payments: e.target.checked
                  })}
                />
              </Flex>
            </VStack>
          </FormControl>
          
          <Divider />
          
          <FormControl>
            <FormLabel>Push</FormLabel>
            <VStack spacing={2} align="stretch">
              <Flex justify="space-between" align="center">
                <Text>Notificaciones en tiempo real</Text>
                <Switch
                  isChecked={notifications.push_realtime}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    push_realtime: e.target.checked
                  })}
                />
              </Flex>
              <Flex justify="space-between" align="center">
                <Text>Actualizaciones de estado</Text>
                <Switch
                  isChecked={notifications.push_status}
                  onChange={(e) => setNotifications({
                    ...notifications,
                    push_status: e.target.checked
                  })}
                />
              </Flex>
            </VStack>
          </FormControl>
          
          <Button
            colorScheme="blue"
            onClick={() => handleUpdateNotifications(notifications)}
            mt={4}
          >
            Guardar Configuración
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );

  const renderActivityHistory = () => (
    <Card>
      <CardHeader>
        <Heading size="md">Historial de Actividad</Heading>
      </CardHeader>
      <CardBody>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Fecha</Th>
              <Th>Actividad</Th>
              <Th>IP</Th>
              <Th>Dispositivo</Th>
              <Th>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activityHistory.map((activity, index) => (
              <Tr key={index}>
                <Td>{formatDate(activity.timestamp)}</Td>
                <Td>{activity.description}</Td>
                <Td>{activity.ip_address}</Td>
                <Td>{activity.device}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      activity.status === 'success' ? 'green' :
                      activity.status === 'warning' ? 'yellow' : 'red'
                    }
                  >
                    {activity.status}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );

  // =====================================================
  // MAIN RENDER
  // =====================================================

  if (loading) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Cargando perfil...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={2}>
            <Heading size="lg" color="blue.600">
              Perfil SMD VITAL
            </Heading>
            <Text color="gray.600">
              Gestión completa de perfil médico y configuraciones
            </Text>
          </VStack>
          <HStack>
            <Button
              leftIcon={<MdRefresh />}
              onClick={loadProfileData}
              isLoading={loading}
            >
              Actualizar
            </Button>
            <Button
              leftIcon={<MdSecurity />}
              onClick={onSecurityOpen}
            >
              Seguridad
            </Button>
          </HStack>
        </Flex>

        {/* Profile Header */}
        {renderProfileHeader()}

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Información Personal</Tab>
            <Tab>Información Profesional</Tab>
            <Tab>Notificaciones</Tab>
            <Tab>Actividad</Tab>
            <Tab>Seguridad</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              {renderPersonalInfo()}
            </TabPanel>
            
            <TabPanel px={0}>
              {renderProfessionalInfo()}
            </TabPanel>
            
            <TabPanel px={0}>
              {renderNotificationSettings()}
            </TabPanel>
            
            <TabPanel px={0}>
              {renderActivityHistory()}
            </TabPanel>
            
            <TabPanel px={0}>
              {renderSecuritySettings()}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cambiar Contraseña</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Contraseña Actual</FormLabel>
                <Input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Nueva Contraseña</FormLabel>
                <Input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                <Input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                />
              </FormControl>
              
              <Button
                colorScheme="blue"
                onClick={handleChangePassword}
                w="full"
              >
                Cambiar Contraseña
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdvancedProfile;
