import React, { useState, useEffect } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Text,
  VStack,
  HStack,
  Badge,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Textarea,
  Select,
  Spinner,
  Box
} from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  SettingsIcon, 
  BellIcon, 
  EditIcon,
  InfoIcon
} from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';

const UserProfileDropdown = () => {
  const { user, token, logout } = useAuth();
  const toast = useToast();
  const [userProfile, setUserProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Modales
  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } = useDisclosure();
  
  // Función para abrir el modal y cargar datos actualizados
  const handleProfileOpen = () => {
    onProfileOpen();
    if (token) {
      loadUserProfile();
    }
  };
  const { isOpen: isNotificationsOpen, onOpen: onNotificationsOpen, onClose: onNotificationsClose } = useDisclosure();
  
  // Estados para formularios
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    bio: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true
  });

  // Cargar datos del perfil
  useEffect(() => {
    if (token) {
      loadUserProfile();
      loadNotifications();
    }
  }, [token]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserProfile(token);
      if (response.success) {
        // Transformar los datos del usuario para consistencia
        const transformedProfile = userService.transformUserProfile(response.data);
        setUserProfile(transformedProfile);
        
        // Actualizar el formulario con los datos del backend
        setProfileForm({
          name: transformedProfile.name || '',
          email: transformedProfile.email || '',
          phone: transformedProfile.phone || '',
          specialty: transformedProfile.specialty || '',
          bio: transformedProfile.bio || ''
        });
        
        // Actualizar configuración de notificaciones
        setNotificationSettings({
          email_notifications: transformedProfile.email_notifications !== false,
          sms_notifications: transformedProfile.sms_notifications || false,
          push_notifications: transformedProfile.push_notifications !== false
        });
        
        console.log('Perfil cargado desde backend:', transformedProfile);
      } else {
        toast({
          title: 'Error',
          description: response.error || 'No se pudo cargar el perfil del usuario',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el perfil del usuario',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await userService.getUserNotifications(token, { limit: 5 });
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      const response = await userService.updateUserProfile(profileForm, token);
      if (response.success) {
        setUserProfile({ ...userProfile, ...profileForm });
        toast({
          title: 'Perfil actualizado',
          description: 'Tu perfil se ha actualizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onProfileClose();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingsUpdate = async () => {
    try {
      setLoading(true);
      const response = await userService.updateNotificationSettings(notificationSettings, token);
      if (response.success) {
        toast({
          title: 'Configuración actualizada',
          description: 'Las preferencias de notificación se han actualizado',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onNotificationsClose();
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la configuración',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await userService.markNotificationAsRead(notificationId, token);
      loadNotifications(); // Recargar notificaciones
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  if (loading && !userProfile) {
    return (
      <HStack>
        <Spinner size="sm" />
        <Text>Cargando...</Text>
      </HStack>
    );
  }

  return (
    <>
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          variant="ghost"
          colorScheme="gray"
          _hover={{ bg: 'gray.100' }}
          _dark={{ _hover: { bg: 'gray.700' } }}
        >
          <HStack spacing={3}>
            <Avatar
              size="sm"
              name={userProfile?.name || user?.name || 'Usuario'}
              src={userProfile?.avatar}
              bg="purple.500"
            />
            <VStack spacing={0} align="start" display={{ base: 'none', md: 'flex' }}>
              <Text fontSize="sm" fontWeight="bold">
                {userProfile?.name || user?.name || 'Usuario'}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {userProfile?.role || 'Usuario'}
              </Text>
            </VStack>
          </HStack>
        </MenuButton>
        
        <MenuList>
          {/* Saludo */}
          <Box px={4} py={2} borderBottom="1px" borderColor="gray.200">
            <Text fontSize="sm" color="gray.600">
              👋 Hola, {userProfile?.name || user?.name || 'Usuario'}
            </Text>
          </Box>
          
          {/* Configuración de Perfil */}
          <MenuItem icon={<EditIcon />} onClick={handleProfileOpen}>
            Configuración de Perfil
          </MenuItem>
          
          {/* Notificaciones */}
          <MenuItem icon={<BellIcon />} onClick={onNotificationsOpen}>
            <HStack justify="space-between" w="100%">
              <Text>Configuración de Notificaciones</Text>
              {unreadCount > 0 && (
                <Badge colorScheme="red" borderRadius="full">
                  {unreadCount}
                </Badge>
              )}
            </HStack>
          </MenuItem>
          
          <MenuDivider />
          
          {/* Cerrar Sesión */}
          <MenuItem 
            icon={<InfoIcon />} 
            onClick={handleLogout}
            color="red.500"
            _hover={{ bg: 'red.50' }}
          >
            Cerrar Sesión
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Modal de Configuración de Perfil */}
      <Modal isOpen={isProfileOpen} onClose={onProfileClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Configuración de Perfil</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {loading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="brand.500" />
                <Text mt={4} color="gray.500">Cargando datos del perfil...</Text>
              </Box>
            ) : (
              <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nombre completo</FormLabel>
                <Input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Tu nombre completo"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="tu@email.com"
                  type="email"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Teléfono</FormLabel>
                <Input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+57 300 123 4567"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Especialidad</FormLabel>
                <Select
                  value={profileForm.specialty}
                  onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })}
                  placeholder="Selecciona tu especialidad"
                >
                  <option value="Medicina General">Medicina General</option>
                  <option value="Cardiología">Cardiología</option>
                  <option value="Neurología">Neurología</option>
                  <option value="Pediatría">Pediatría</option>
                  <option value="Ginecología">Ginecología</option>
                  <option value="Dermatología">Dermatología</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Biografía</FormLabel>
                <Textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Cuéntanos sobre ti..."
                  rows={3}
                />
              </FormControl>
              
              <HStack spacing={4} w="100%" justify="flex-end">
                <Button variant="ghost" onClick={onProfileClose}>
                  Cancelar
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleProfileUpdate}
                  isLoading={loading}
                >
                  Guardar Cambios
                </Button>
              </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Modal de Configuración de Notificaciones */}
      <Modal isOpen={isNotificationsOpen} onClose={onNotificationsClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Configuración de Notificaciones</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6}>
              {/* Configuración de Notificaciones */}
              <VStack spacing={4} w="100%">
                <Text fontWeight="bold" fontSize="lg">Preferencias de Notificación</Text>
                
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0">Notificaciones por Email</FormLabel>
                  <Switch
                    isChecked={notificationSettings.email_notifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      email_notifications: e.target.checked
                    })}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0">Notificaciones por SMS</FormLabel>
                  <Switch
                    isChecked={notificationSettings.sms_notifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      sms_notifications: e.target.checked
                    })}
                  />
                </FormControl>
                
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0">Notificaciones Push</FormLabel>
                  <Switch
                    isChecked={notificationSettings.push_notifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      push_notifications: e.target.checked
                    })}
                  />
                </FormControl>
              </VStack>
              
              {/* Lista de Notificaciones Recientes */}
              <VStack spacing={3} w="100%">
                <Text fontWeight="bold" fontSize="lg">Notificaciones Recientes</Text>
                {notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    p={3}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    w="100%"
                    bg={notification.read ? 'gray.50' : 'blue.50'}
                    cursor="pointer"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="sm">
                          {notification.title}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {notification.message}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(notification.created_at).toLocaleString()}
                        </Text>
                      </VStack>
                      {!notification.read && (
                        <Badge colorScheme="blue" size="sm">
                          Nuevo
                        </Badge>
                      )}
                    </HStack>
                  </Box>
                ))}
              </VStack>
              
              <HStack spacing={4} w="100%" justify="flex-end">
                <Button variant="ghost" onClick={onNotificationsClose}>
                  Cancelar
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleNotificationSettingsUpdate}
                  isLoading={loading}
                >
                  Guardar Configuración
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UserProfileDropdown;
