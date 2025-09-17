import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Icon,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider
} from '@chakra-ui/react';
import { 
  BellIcon, 
  ChevronDownIcon,
  CheckIcon,
  TimeIcon,
  InfoIcon,
  WarningIcon,
  CheckCircleIcon
} from '@chakra-ui/icons';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';

const UserNotifications = ({ maxHeight = "400px" }) => {
  const { token } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chakra Color Mode
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const textColor = useColorModeValue("gray.700", "white");
  const textColorSecondary = useColorModeValue("gray.500", "gray.400");

  useEffect(() => {
    if (token) {
      loadNotifications();
    }
  }, [token]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getUserNotifications(token, { limit: 10 });
      
      if (response.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unread_count || 0);
      } else {
        // Solo mostrar error si no es un error de red común
        if (response.error && !response.error.includes('Failed to fetch')) {
          setError(response.error);
        } else {
          // Para errores de red, usar datos mock o vacíos
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    } catch (err) {
      // Solo mostrar error si no es un error de red común
      if (err.message && !err.message.includes('Failed to fetch')) {
        setError(err.message);
      } else {
        // Para errores de red, usar datos mock o vacíos
        setNotifications([]);
        setUnreadCount(0);
      }
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await userService.markNotificationAsRead(notificationId, token);
      
      if (response.success) {
        // Actualizar el estado local
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        toast({
          title: 'Notificación marcada como leída',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'No se pudo marcar la notificación como leída',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast({
        title: 'Error',
        description: 'Error al marcar la notificación como leída',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      info: InfoIcon,
      warning: WarningIcon,
      success: CheckCircleIcon,
      error: WarningIcon,
      appointment: TimeIcon,
      payment: CheckIcon,
      medical: InfoIcon
    };
    return iconMap[type] || InfoIcon;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      info: 'blue',
      warning: 'orange',
      success: 'green',
      error: 'red',
      appointment: 'purple',
      payment: 'green',
      medical: 'blue'
    };
    return colorMap[type] || 'gray';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES');
    }
  };

  if (loading) {
    return (
      <Box>
        <HStack justify="center" py={4}>
          <Spinner size="sm" color="brand.500" />
          <Text fontSize="sm" color={textColorSecondary}>
            Cargando notificaciones...
          </Text>
        </HStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Menu>
        <MenuButton
          as={Button}
          variant="ghost"
          colorScheme="gray"
          _hover={{ bg: 'gray.100' }}
          _dark={{ _hover: { bg: 'gray.700' } }}
          position="relative"
        >
          <HStack spacing={2}>
            <Icon as={BellIcon} />
            <Text display={{ base: 'none', md: 'block' }}>Notificaciones</Text>
            <Badge
              colorScheme="red"
              variant="solid"
              borderRadius="full"
              fontSize="xs"
              px={2}
              py={1}
              minW="20px"
              textAlign="center"
            >
              !
            </Badge>
            <Icon as={ChevronDownIcon} />
          </HStack>
        </MenuButton>

        <MenuList
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
          boxShadow="xl"
          minW="320px"
          maxW="400px"
        >
          <Box px={4} py={3}>
            <Alert status="error" borderRadius="md" size="sm">
              <AlertIcon />
              <Box>
                <Text fontSize="xs" fontWeight="bold">Error al cargar notificaciones</Text>
                <Text fontSize="xs">{error}</Text>
              </Box>
            </Alert>
          </Box>
        </MenuList>
      </Menu>
    );
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        colorScheme="gray"
        _hover={{ bg: 'gray.100' }}
        _dark={{ _hover: { bg: 'gray.700' } }}
        position="relative"
      >
        <HStack spacing={2}>
          <Icon as={BellIcon} />
          <Text display={{ base: 'none', md: 'block' }}>Notificaciones</Text>
          {unreadCount > 0 && (
            <Badge
              colorScheme="red"
              variant="solid"
              borderRadius="full"
              fontSize="xs"
              px={2}
              py={1}
              minW="20px"
              textAlign="center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <Icon as={ChevronDownIcon} />
        </HStack>
      </MenuButton>

      <MenuList
        bg={cardBg}
        border="1px"
        borderColor={borderColor}
        boxShadow="xl"
        minW="320px"
        maxW="400px"
        maxH={maxHeight}
        overflowY="auto"
      >
        <Box pb={2} px={4} pt={4}>
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="semibold" color={textColor}>
              Notificaciones
            </Text>
            {unreadCount > 0 && (
              <Badge colorScheme="red" variant="subtle" fontSize="xs">
                {unreadCount} sin leer
              </Badge>
            )}
          </HStack>
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <Box px={4} py={4}>
            <Text fontSize="sm" color={textColorSecondary} textAlign="center" py={4}>
              No hay notificaciones
            </Text>
          </Box>
        ) : (
          <VStack spacing={0} align="stretch" maxH="300px" overflowY="auto">
            {notifications.map((notification, index) => (
              <Box key={notification.id || index}>
                <MenuItem
                  as={Box}
                  p={0}
                  _hover={{ bg: 'gray.50' }}
                  _dark={{ _hover: { bg: 'gray.700' } }}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <Box py={3} px={4}>
                    <HStack spacing={3} align="start">
                      <Icon
                        as={getNotificationIcon(notification.type)}
                        color={`${getNotificationColor(notification.type)}.500`}
                        boxSize={4}
                        mt={0.5}
                      />
                      
                      <VStack align="start" spacing={1} flex={1}>
                        <Text
                          fontSize="sm"
                          fontWeight={notification.is_read ? "normal" : "semibold"}
                          color={textColor}
                          noOfLines={2}
                        >
                          {notification.title || notification.message}
                        </Text>
                        
                        {notification.message && notification.title && (
                          <Text
                            fontSize="xs"
                            color={textColorSecondary}
                            noOfLines={2}
                          >
                            {notification.message}
                          </Text>
                        )}
                        
                        <HStack spacing={2} fontSize="xs" color={textColorSecondary}>
                          <Text>{formatDate(notification.created_at)}</Text>
                          {!notification.is_read && (
                            <Badge
                              colorScheme="blue"
                              variant="subtle"
                              size="sm"
                            >
                              Nuevo
                            </Badge>
                          )}
                        </HStack>
                      </VStack>
                    </HStack>
                  </Box>
                </MenuItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </VStack>
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <MenuItem
              as={Button}
              variant="ghost"
              size="sm"
              onClick={loadNotifications}
              justifyContent="center"
            >
              Ver todas las notificaciones
            </MenuItem>
          </>
        )}
      </MenuList>
    </Menu>
  );
};

export default UserNotifications;
