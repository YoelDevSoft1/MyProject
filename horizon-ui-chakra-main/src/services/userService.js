// SMD VITAL - User Service
// Servicio especializado para gestión de usuarios y perfiles

import apiService from './apiService';

class UserService {
  constructor() {
    this.apiService = apiService;
  }

  // ===== USER PROFILE METHODS =====
  
  /**
   * Obtener perfil completo del usuario
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} Datos del perfil del usuario
   */
  async getUserProfile(token) {
    try {
      // Usar el endpoint /api/auth/me que ya funciona correctamente
      const response = await this.apiService.request('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.success) {
        return {
          success: true,
          data: this.transformUserProfile(response.data)
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error getting user profile:', error);
      
      // Manejo específico de errores de conectividad
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
        return {
          success: false,
          error: 'No se puede conectar con el servidor. Verifica que el backend esté ejecutándose en http://localhost:8000'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Error al obtener el perfil del usuario'
      };
    }
  }

  /**
   * Actualizar perfil del usuario
   * @param {Object} profileData - Datos del perfil a actualizar
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} Resultado de la actualización
   */
  async updateUserProfile(profileData, token) {
    try {
      // Usar el endpoint de perfil que existe
      const response = await this.apiService.request('/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      if (response.success) {
        return {
          success: true,
          data: this.transformUserProfile(response.data),
          message: 'Perfil actualizado correctamente'
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: error.message || 'Error al actualizar el perfil'
      };
    }
  }

  /**
   * Obtener notificaciones del usuario
   * @param {string} token - Token de autenticación
   * @param {Object} params - Parámetros de consulta (limit, offset, etc.)
   * @returns {Promise<Object>} Lista de notificaciones
   */
  async getUserNotifications(token, params = {}) {
    try {
      // Usar el endpoint de notificaciones que existe
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
      
      const response = await this.apiService.request(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.success) {
        return {
          success: true,
          data: {
            notifications: response.data.notifications || [],
            unread_count: response.data.unread_count || 0,
            total: response.data.total || 0
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener las notificaciones'
      };
    }
  }

  /**
   * Marcar notificación como leída
   * @param {string} notificationId - ID de la notificación
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} Resultado de la operación
   */
  async markNotificationAsRead(notificationId, token) {
    try {
      const response = await this.apiService.request(`/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        error: error.message || 'Error al marcar la notificación como leída'
      };
    }
  }

  /**
   * Actualizar configuración de notificaciones
   * @param {Object} settings - Configuración de notificaciones
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} Resultado de la actualización
   */
  async updateNotificationSettings(settings, token) {
    try {
      const response = await this.apiService.request('/notifications/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      
      return response;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return {
        success: false,
        error: error.message || 'Error al actualizar la configuración de notificaciones'
      };
    }
  }

  // ===== USER MANAGEMENT METHODS =====

  /**
   * Obtener lista de usuarios (solo para administradores)
   * @param {string} token - Token de autenticación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de usuarios
   */
  async getUsers(token, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/users?${queryString}` : '/users';
      
      const response = await this.apiService.request(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response;
    } catch (error) {
      console.error('Error getting users:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener la lista de usuarios'
      };
    }
  }

  /**
   * Obtener usuario por ID
   * @param {string} userId - ID del usuario
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} Datos del usuario
   */
  async getUserById(userId, token) {
    try {
      const response = await this.apiService.request(`/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.success) {
        return {
          success: true,
          data: this.transformUserProfile(response.data)
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener el usuario'
      };
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Transformar datos del perfil de usuario para consistencia
   * @param {Object} userData - Datos del usuario del backend
   * @returns {Object} Datos transformados
   */
  transformUserProfile(userData) {
    if (!userData) return null;

    // Construir el nombre completo con múltiples fuentes de datos
    let fullName = '';
    
    // 1. Prioridad: first_name + last_name (autenticación tradicional)
    if (userData.first_name || userData.last_name) {
      fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
    }
    // 2. Prioridad: given_name + family_name (Google Auth)
    else if (userData.given_name || userData.family_name) {
      fullName = `${userData.given_name || ''} ${userData.family_name || ''}`.trim();
    }
    // 3. Prioridad: campo name directo (Google Auth o datos existentes)
    else if (userData.name) {
      fullName = userData.name;
    }
    // 4. Fallback: username
    else if (userData.username) {
      fullName = userData.username;
    }
    // 5. Fallback: email sin dominio
    else if (userData.email) {
      fullName = userData.email.split('@')[0];
    }

    // Si aún no hay nombre, usar un fallback más descriptivo
    if (!fullName || fullName.trim() === '') {
      fullName = userData.email ? 
        `Usuario ${userData.email.split('@')[0]}` : 
        'Usuario';
    }

    return {
      id: userData.id || userData.user_id,
      email: userData.email,
      name: fullName,
      first_name: userData.first_name || userData.given_name || '',
      last_name: userData.last_name || userData.family_name || '',
      username: userData.username || userData.email?.split('@')[0] || '',
      role: userData.role || 'user',
      specialty: userData.specialty || '',
      phone: userData.phone || '',
      avatar: userData.avatar || userData.profile_picture || '',
      profile_picture: userData.profile_picture || userData.avatar || '',
      bio: userData.bio || '',
      is_active: userData.is_active !== false,
      is_verified: userData.is_verified || userData.email_verified || false,
      email_verified: userData.email_verified || userData.is_verified || false,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      last_login: userData.last_login,
      profile_complete: userData.profile_complete || false,
      notifications_enabled: userData.notifications_enabled !== false,
      email_notifications: userData.email_notifications !== false,
      sms_notifications: userData.sms_notifications || false,
      push_notifications: userData.push_notifications !== false,
      google_id: userData.google_id || ''
    };
  }

  /**
   * Validar datos del perfil antes de enviar
   * @param {Object} profileData - Datos del perfil
   * @returns {Object} Resultado de la validación
   */
  validateProfileData(profileData) {
    const errors = {};

    if (profileData.email && !/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'El email no es válido';
    }

    if (profileData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone.replace(/\s/g, ''))) {
      errors.phone = 'El número de teléfono no es válido';
    }

    if (profileData.first_name && profileData.first_name.length < 2) {
      errors.first_name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (profileData.last_name && profileData.last_name.length < 2) {
      errors.last_name = 'El apellido debe tener al menos 2 caracteres';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Crear instancia singleton
const userService = new UserService();

export default userService;
