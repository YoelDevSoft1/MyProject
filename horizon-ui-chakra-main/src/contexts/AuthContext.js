// SMD VITAL - Authentication Context
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import robustApiService from '../services/robustApiService';
import userService from '../services/userService';
import userDetectionService from '../services/userDetectionService';
import dashboardService from '../services/dashboardService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smd_vital_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userDetection, setUserDetection] = useState(null);
  const [detectionLoading, setDetectionLoading] = useState(false);

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setUserDetection(null);
    localStorage.removeItem('smd_vital_token');
  };

  const verifyToken = useCallback(async () => {
    try {
      setIsLoading(true);
      // Establecer el token en el robustApiService antes de hacer la petición
      robustApiService.setAuthToken(token);
      const response = await robustApiService.getProfile();
      
      if (response.success) {
        // El endpoint /me devuelve los datos directamente, no envueltos en 'data'
        const userData = response.data;
        // Transformar los datos del usuario para consistencia
        const transformedUser = userService.transformUserProfile(userData);
        setUser(transformedUser);
        setIsAuthenticated(true);
        
        // Realizar detección automática del tipo de usuario
        setTimeout(() => {
          detectUserType();
        }, 1000);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Verificar token al cargar la aplicación
  useEffect(() => {
    if (token) {
      // Establecer el token en el robustApiService antes de verificar
      robustApiService.setAuthToken(token);
      verifyToken();
    }
  }, [token, verifyToken]);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await robustApiService.login(credentials);
      
      if (response.success) {
        const { access_token: newToken } = response.data;
        setToken(newToken);
        setIsAuthenticated(true);
        localStorage.setItem('smd_vital_token', newToken);
        
        // Establecer el token en el robustApiService y obtener datos del usuario
        robustApiService.setAuthToken(newToken);
        const userResponse = await robustApiService.getProfile();
        if (userResponse.success) {
          // El endpoint /me devuelve los datos directamente, no envueltos en 'data'
          const userData = userResponse.data;
          const transformedUser = userService.transformUserProfile(userData);
          setUser(transformedUser);
          
          // Realizar detección automática del tipo de usuario
          setTimeout(() => {
            detectUserType();
          }, 1000); // Pequeño delay para asegurar que el usuario esté establecido
        }
        
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await robustApiService.register(userData);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  // ===== USER DETECTION METHODS =====
  
  const detectUserType = useCallback(async () => {
    if (!token || !isAuthenticated) return;
    
    try {
      setDetectionLoading(true);
      const response = await userDetectionService.getUserDetectionInfo(token);
      
      if (response.success) {
        setUserDetection(response.data);
        return response.data;
      } else {
        console.error('Error detecting user type:', response.error);
        return null;
      }
    } catch (error) {
      console.error('Error in user detection:', error);
      return null;
    } finally {
      setDetectionLoading(false);
    }
  }, [token, isAuthenticated]);

  const getRouteConfig = useCallback(() => {
    if (!userDetection) return null;
    return userDetectionService.getRouteConfig(userDetection);
  }, [userDetection]);

  const getWelcomeMessage = useCallback(() => {
    if (!userDetection) return null;
    return userDetectionService.getWelcomeMessage(userDetection);
  }, [userDetection]);

  const hasPermission = useCallback((action) => {
    if (!userDetection) return false;
    return userDetectionService.hasPermission(userDetection, action);
  }, [userDetection]);

  const getRecommendedWidgets = useCallback(() => {
    if (!userDetection) return [];
    return userDetectionService.getRecommendedWidgets(userDetection);
  }, [userDetection]);

  const getThemeConfig = useCallback(() => {
    if (!userDetection) return null;
    return userDetectionService.getThemeConfig(userDetection);
  }, [userDetection]);

  // ===== DASHBOARD METHODS =====
  
  const getContextualDashboard = useCallback(async (context = {}) => {
    if (!userDetection || !token) return null;
    
    try {
      const response = await dashboardService.getContextualDashboard(token, userDetection, context);
      return response;
    } catch (error) {
      console.error('Error getting contextual dashboard:', error);
      return { success: false, error: error.message };
    }
  }, [userDetection, token]);

  const refreshDashboard = useCallback(async () => {
    if (!userDetection) return;
    
    try {
      const response = await getContextualDashboard({ force_refresh: true });
      if (response.success) {
        // El dashboard se actualizará automáticamente
        return response;
      }
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    }
  }, [userDetection, getContextualDashboard]);

  const loginWithGoogle = async (googleUserData) => {
    try {
      setIsLoading(true);
      const response = await robustApiService.loginWithGoogle(googleUserData);
      
      if (response.success) {
        const { access_token: newToken } = response.data;
        setToken(newToken);
        setIsAuthenticated(true);
        localStorage.setItem('smd_vital_token', newToken);
        
        // Establecer el token en el robustApiService y obtener datos del usuario
        robustApiService.setAuthToken(newToken);
        const userResponse = await robustApiService.getProfile();
        
        if (userResponse.success) {
          // El endpoint /me devuelve los datos directamente, no envueltos en 'data'
          const userData = userResponse.data;
          const transformedUser = userService.transformUserProfile(userData);
          setUser(transformedUser);
        }
        
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getUserProfile = async () => {
    if (!token) return null;
    try {
      const response = await userService.getUserProfile(token);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!token) return { success: false, error: 'No token available' };
    try {
      const response = await userService.updateUserProfile(profileData, token);
      if (response.success) {
        // Actualizar el estado del usuario con los nuevos datos
        setUser(prevUser => ({ ...prevUser, ...response.data }));
      }
      return response;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  };

  const getUserNotifications = async (params = {}) => {
    if (!token) return { success: false, error: 'No token available' };
    try {
      return await userService.getUserNotifications(token, params);
    } catch (error) {
      console.error('Error getting notifications:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    userDetection,
    detectionLoading,
    login,
    register,
    logout,
    updateUser,
    verifyToken,
    loginWithGoogle,
    getUserProfile,
    updateUserProfile,
    getUserNotifications,
    // User Detection Methods
    detectUserType,
    getRouteConfig,
    getWelcomeMessage,
    hasPermission,
    getRecommendedWidgets,
    getThemeConfig,
    // Dashboard Methods
    getContextualDashboard,
    refreshDashboard,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
