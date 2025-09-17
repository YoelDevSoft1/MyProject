// ========================================
// HOOK PARA USUARIOS
// ========================================

import { useEffect, useCallback } from 'react';
import { useApiState } from './useApiState';
import { userService } from '../services/userService';
import { useAuth } from './useAuth';
import { useRolePermissions } from './useRolePermissions';
import type { 
  User, 
  UserFilters, 
  PaginationInfo,
  UserStatus 
} from '../types/models';

// ===== TIPOS =====
interface UsersData {
  users: User[];
  pagination: PaginationInfo;
}

// ===== HOOK PRINCIPAL =====
export function useUsers(
  filters?: UserFilters,
  page: number = 1,
  limit: number = 10,
  sort?: { field: string; direction: 'asc' | 'desc' }
) {
  const { user } = useAuth();
  const { isAdmin } = useRolePermissions();
  
  const {
    state: usersState,
    handleApiCall,
    reset
  } = useApiState<UsersData>({ users: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false } });

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
    if (!isAdmin) {
      throw new Error('No tienes permisos para ver usuarios');
    }

    return userService.getUsers(filters, page, limit, sort);
  }, [isAdmin, filters, page, limit, sort]);

  useEffect(() => {
    if (isAdmin) {
      handleApiCall(loadUsers);
    }
  }, [isAdmin, filters, page, limit, sort, loadUsers, handleApiCall]);

  // Crear usuario
  const createUser = useCallback(async (userData: Partial<User>) => {
    try {
      const response = await userService.createUser(userData);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadUsers);
        return response.data;
      }
      throw new Error(response.message || 'Error al crear usuario');
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }, [loadUsers, handleApiCall]);

  // Actualizar usuario
  const updateUser = useCallback(async (id: string, userData: Partial<User>) => {
    try {
      const response = await userService.updateUser(id, userData);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadUsers);
        return response.data;
      }
      throw new Error(response.message || 'Error al actualizar usuario');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }, [loadUsers, handleApiCall]);

  // Eliminar usuario
  const deleteUser = useCallback(async (id: string) => {
    try {
      const response = await userService.deleteUser(id);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadUsers);
        return true;
      }
      throw new Error(response.message || 'Error al eliminar usuario');
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }, [loadUsers, handleApiCall]);

  // Cambiar estado del usuario
  const toggleUserStatus = useCallback(async (id: string, status: UserStatus) => {
    try {
      const response = await userService.toggleUserStatus(id, status);
      if (response.success) {
        // Refrescar lista
        handleApiCall(loadUsers);
        return response.data;
      }
      throw new Error(response.message || 'Error al cambiar estado del usuario');
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }, [loadUsers, handleApiCall]);

  return {
    ...usersState,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    refresh: () => handleApiCall(loadUsers),
    reset
  };
}

// ===== HOOK PARA USUARIO ESPECÍFICO =====
export function useUser(id: string) {
  const {
    state: userState,
    handleApiCall,
    reset
  } = useApiState<User | null>(null);

  const loadUser = useCallback(async () => {
    if (!id) return;
    return userService.getUserById(id);
  }, [id]);

  useEffect(() => {
    if (id) {
      handleApiCall(loadUser);
    }
  }, [id, loadUser, handleApiCall]);

  return {
    ...userState,
    refresh: () => handleApiCall(loadUser),
    reset
  };
}

// ===== HOOK PARA PERFIL DEL USUARIO ACTUAL =====
export function useProfile() {
  const { user } = useAuth();
  const {
    state: profileState,
    handleApiCall,
    reset
  } = useApiState<User | null>(user || null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    return userService.getUserById(user.id);
  }, [user]);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    try {
      const response = await userService.updateProfile(profileData);
      if (response.success) {
        // Refrescar perfil
        handleApiCall(loadProfile);
        return response.data;
      }
      throw new Error(response.message || 'Error al actualizar perfil');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [loadProfile, handleApiCall]);

  const uploadProfilePicture = useCallback(async (file: File) => {
    try {
      const response = await userService.uploadProfilePicture(file);
      if (response.success) {
        // Refrescar perfil
        handleApiCall(loadProfile);
        return response.data;
      }
      throw new Error(response.message || 'Error al subir foto de perfil');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }, [loadProfile, handleApiCall]);

  const deleteProfilePicture = useCallback(async () => {
    try {
      const response = await userService.deleteProfilePicture();
      if (response.success) {
        // Refrescar perfil
        handleApiCall(loadProfile);
        return true;
      }
      throw new Error(response.message || 'Error al eliminar foto de perfil');
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  }, [loadProfile, handleApiCall]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      const response = await userService.changePassword(currentPassword, newPassword);
      if (response.success) {
        return true;
      }
      throw new Error(response.message || 'Error al cambiar contraseña');
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (user) {
      handleApiCall(loadProfile);
    }
  }, [user, loadProfile, handleApiCall]);

  return {
    ...profileState,
    updateProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    changePassword,
    refresh: () => handleApiCall(loadProfile),
    reset
  };
}

// ===== HOOK PARA USUARIOS POR ROL =====
export function useUsersByRole(role: string) {
  const {
    state: usersState,
    handleApiCall,
    reset
  } = useApiState<User[]>([]);

  const loadUsersByRole = useCallback(async () => {
    if (!role) return;
    return userService.getUsersByRole(role);
  }, [role]);

  useEffect(() => {
    if (role) {
      handleApiCall(loadUsersByRole);
    }
  }, [role, loadUsersByRole, handleApiCall]);

  return {
    ...usersState,
    refresh: () => handleApiCall(loadUsersByRole),
    reset
  };
}

// ===== HOOK PARA ESTADÍSTICAS DE USUARIOS =====
export function useUserStats() {
  const {
    state: statsState,
    handleApiCall,
    reset
  } = useApiState<any>(null);

  const loadStats = useCallback(async () => {
    return userService.getUserStats();
  }, []);

  useEffect(() => {
    handleApiCall(loadStats);
  }, [loadStats, handleApiCall]);

  return {
    ...statsState,
    refresh: () => handleApiCall(loadStats),
    reset
  };
}

// ===== HOOK PARA BÚSQUEDA DE USUARIOS =====
export function useUserSearch(query: string, filters?: UserFilters) {
  const {
    state: searchState,
    handleApiCall,
    reset
  } = useApiState<UsersData>({ users: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false } });

  const searchUsers = useCallback(async () => {
    if (!query.trim()) return;
    
    return userService.searchUsers({
      query,
      fields: ['first_name', 'last_name', 'email'],
      filters,
      pagination: { page: 1, limit: 20 }
    });
  }, [query, filters]);

  useEffect(() => {
    if (query.trim()) {
      handleApiCall(searchUsers);
    }
  }, [query, filters, searchUsers, handleApiCall]);

  return {
    ...searchState,
    refresh: () => handleApiCall(searchUsers),
    reset
  };
}
