// SMD VITAL - Profile Configuration Page
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Divider,
  Badge,
  Avatar,
  Icon,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid
} from '@chakra-ui/react';
import { 
  EditIcon, 
  SettingsIcon,
  CheckCircleIcon
} from '@chakra-ui/icons';
import { useAuth } from 'contexts/AuthContext';
import userService from 'services/userService';

export default function ProfileSettings() {
  const { user, token, updateUser } = useAuth();
  const toast = useToast();
  
  // Estados del formulario
  const [profileForm, setProfileForm] = useState({
    name: '',
    first_name: '',
    last_name: '',
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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  // Chakra Color Mode
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.700", "white");
  const textColorSecondary = useColorModeValue("gray.500", "gray.400");

  // Cargar datos del perfil
  useEffect(() => {
    if (token) {
      loadUserProfile();
    }
  }, [token]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getUserProfile(token);
      
      if (response.success) {
        // Transformar los datos del usuario para consistencia
        const transformedProfile = userService.transformUserProfile(response.data);
        setProfile(transformedProfile);
        
        // Actualizar el formulario con los datos del backend
        setProfileForm({
          name: transformedProfile.name || '',
          first_name: transformedProfile.first_name || '',
          last_name: transformedProfile.last_name || '',
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
        setError(response.error || 'No se pudo cargar el perfil del usuario');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar el perfil del usuario');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await userService.updateUserProfile(profileForm, token);
      
      if (response.success) {
        // Actualizar el contexto de autenticación
        updateUser(profileForm);
        
        toast({
          title: 'Perfil actualizado',
          description: 'Tu perfil se ha actualizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Recargar datos del perfil
        await loadUserProfile();
      } else {
        setError(response.error || 'No se pudo actualizar el perfil');
        toast({
          title: 'Error',
          description: response.error || 'No se pudo actualizar el perfil',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil');
      toast({
        title: 'Error',
        description: err.message || 'Error al actualizar el perfil',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSettingsUpdate = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await userService.updateNotificationSettings(notificationSettings, token);
      
      if (response.success) {
        toast({
          title: 'Configuración actualizada',
          description: 'Las preferencias de notificación se han actualizado',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        setError(response.error || 'No se pudo actualizar la configuración');
        toast({
          title: 'Error',
          description: response.error || 'No se pudo actualizar la configuración',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar la configuración');
      toast({
        title: 'Error',
        description: err.message || 'Error al actualizar la configuración',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role) => {
    const roleColors = {
      admin: 'purple',
      doctor: 'blue',
      nurse: 'green',
      patient: 'orange',
      user: 'gray'
    };
    return roleColors[role] || 'gray';
  };

  const getRoleLabel = (role) => {
    const roleLabels = {
      admin: 'Administrador',
      doctor: 'Médico',
      nurse: 'Enfermero/a',
      patient: 'Paciente',
      user: 'Usuario'
    };
    return roleLabels[role] || 'Usuario';
  };

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="brand.500" />
        <Text mt={4} color="gray.500">Cargando configuración del perfil...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Error al cargar el perfil</Text>
          <Text fontSize="sm">{error}</Text>
        </Box>
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={2}>
            Configuración de Perfil
          </Text>
          <Text color={textColorSecondary}>
            Gestiona tu información personal y preferencias de notificación
          </Text>
        </Box>

        {/* Información del Usuario Actual */}
        <Card bg={cardBg} border="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack spacing={4}>
              <Avatar 
                size="lg" 
                name={profile?.name || 'Usuario'} 
                src={profile?.profile_picture || profile?.avatar}
              />
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                  {profile?.name || 'Usuario'}
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  {profile?.email || 'No disponible'}
                </Text>
                <Badge colorScheme={getRoleColor(profile?.role)} size="sm">
                  {getRoleLabel(profile?.role)}
                </Badge>
              </VStack>
            </HStack>
          </CardHeader>
        </Card>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Información Personal */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack>
                <Icon as={EditIcon} color="brand.500" />
                <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                  Información Personal
                </Text>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Nombre completo</FormLabel>
                  <Input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Tu nombre completo"
                  />
                </FormControl>
                
                <HStack spacing={4} w="100%">
                  <FormControl>
                    <FormLabel>Primer nombre</FormLabel>
                    <Input
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      placeholder="Primer nombre"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Apellido</FormLabel>
                    <Input
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      placeholder="Apellido"
                    />
                  </FormControl>
                </HStack>
                
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
                
                <Button 
                  colorScheme="blue" 
                  onClick={handleProfileUpdate}
                  isLoading={saving}
                  loadingText="Guardando..."
                  leftIcon={<CheckCircleIcon />}
                  w="100%"
                >
                  Guardar Cambios
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Configuración de Notificaciones */}
          <Card bg={cardBg} border="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack>
                <Icon as={SettingsIcon} color="brand.500" />
                <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                  Notificaciones
                </Text>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0">Notificaciones por email</FormLabel>
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
                  <FormLabel mb="0">Notificaciones push</FormLabel>
                  <Switch
                    isChecked={notificationSettings.push_notifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      push_notifications: e.target.checked
                    })}
                  />
                </FormControl>
                
                <Divider />
                
                <Button 
                  colorScheme="green" 
                  onClick={handleNotificationSettingsUpdate}
                  isLoading={saving}
                  loadingText="Guardando..."
                  leftIcon={<SettingsIcon />}
                  w="100%"
                >
                  Guardar Configuración
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
