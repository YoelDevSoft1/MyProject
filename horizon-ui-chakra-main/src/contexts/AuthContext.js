// SMD VITAL - Authentication Context
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import userService from '../services/userService';

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

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('smd_vital_token');
  };

  const verifyToken = useCallback(async () => {
    try {
      setIsLoading(true);
      // Establecer el token en el apiService antes de hacer la petición
      apiService.setAuthToken(token);
      const response = await apiService.getProfile();
      
      if (response.success) {
        // El endpoint /me devuelve los datos directamente, no envueltos en 'data'
        const userData = response.data;
        // Transformar los datos del usuario para consistencia
        const transformedUser = userService.transformUserProfile(userData);
        setUser(transformedUser);
        setIsAuthenticated(true);
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
      // Establecer el token en el apiService antes de verificar
      apiService.setAuthToken(token);
      verifyToken();
    }
  }, [token, verifyToken]);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials);
      
      if (response.success) {
        const { access_token: newToken } = response.data;
        setToken(newToken);
        setIsAuthenticated(true);
        localStorage.setItem('smd_vital_token', newToken);
        
        // Establecer el token en el apiService y obtener datos del usuario
        apiService.setAuthToken(newToken);
        const userResponse = await apiService.getProfile();
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
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      
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

  const loginWithGoogle = async (googleUserData) => {
    try {
      setIsLoading(true);
      const response = await apiService.loginWithGoogle(googleUserData);
      
      if (response.success) {
        const { access_token: newToken } = response.data;
        setToken(newToken);
        setIsAuthenticated(true);
        localStorage.setItem('smd_vital_token', newToken);
        
        // Establecer el token en el apiService y obtener datos del usuario
        apiService.setAuthToken(newToken);
        const userResponse = await apiService.getProfile();
        
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
    login,
    register,
    logout,
    updateUser,
    verifyToken,
    loginWithGoogle,
    getUserProfile,
    updateUserProfile,
    getUserNotifications,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
