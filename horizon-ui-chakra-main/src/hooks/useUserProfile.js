import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService';
import { useToast } from '@chakra-ui/react';

export const useUserProfile = () => {
  const { token, getUserProfile, updateUserProfile, getUserNotifications } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Cargar perfil del usuario
  const loadProfile = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const profileData = await getUserProfile();
      if (profileData) {
        setProfile(profileData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, [token, getUserProfile]);

  // Cargar notificaciones del usuario
  const loadNotifications = useCallback(async (params = {}) => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getUserNotifications(params);
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [token, getUserNotifications]);

  // Actualizar perfil del usuario
  const updateProfile = useCallback(async (profileData) => {
    if (!token) return { success: false, error: 'No token available' };
    
    try {
      setLoading(true);
      setError(null);
      const response = await updateUserProfile(profileData);
      
      if (response.success) {
        setProfile(prevProfile => ({ ...prevProfile, ...profileData }));
        toast({
          title: 'Perfil actualizado',
          description: 'Tu perfil se ha actualizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: response.error || 'No se pudo actualizar el perfil',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Error al actualizar el perfil';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [token, updateUserProfile, toast]);

  // Cargar datos iniciales
  useEffect(() => {
    if (token) {
      loadProfile();
      loadNotifications();
    }
  }, [token, loadProfile, loadNotifications]);

  return {
    profile,
    notifications,
    unreadCount,
    loading,
    error,
    loadProfile,
    loadNotifications,
    updateProfile,
    setProfile,
    setNotifications,
    setUnreadCount,
  };
};

export default useUserProfile;
