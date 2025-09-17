// ========================================
// SERVICIO DE NOTIFICACIONES
// ========================================

import { apiService } from './apiService';
import type { 
  Notification,
  PaginationInfo
} from '../types/models';
import type { ApiResponse } from '../types/api-new';

export class NotificationService {
  private baseEndpoint = '/notifications';

  // ===== OBTENER NOTIFICACIONES =====
  async getNotifications(
    filters?: {
      type?: string;
      priority?: string;
      is_read?: boolean;
      date_from?: string;
      date_to?: string;
    },
    page: number = 1,
    limit: number = 10,
    sort?: { field: string; direction: 'asc' | 'desc' }
  ): Promise<ApiResponse<{ notifications: Notification[]; pagination: PaginationInfo }>> {
    const params = {
      page,
      limit,
      ...filters,
      ...(sort && { sort_by: sort.field, sort_order: sort.direction }),
    };

    return apiService.get<{ notifications: Notification[]; pagination: PaginationInfo }>(
      this.baseEndpoint,
      params
    );
  }

  // ===== OBTENER NOTIFICACIÓN POR ID =====
  async getNotificationById(id: string): Promise<ApiResponse<Notification>> {
    return apiService.get<Notification>(`${this.baseEndpoint}/${id}`);
  }

  // ===== CREAR NOTIFICACIÓN =====
  async createNotification(notificationData: Partial<Notification>): Promise<ApiResponse<Notification>> {
    return apiService.post<Notification>(this.baseEndpoint, notificationData);
  }

  // ===== ACTUALIZAR NOTIFICACIÓN =====
  async updateNotification(id: string, notificationData: Partial<Notification>): Promise<ApiResponse<Notification>> {
    return apiService.put<Notification>(`${this.baseEndpoint}/${id}`, notificationData);
  }

  // ===== ELIMINAR NOTIFICACIÓN =====
  async deleteNotification(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // ===== MARCAR COMO LEÍDA =====
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return apiService.patch<Notification>(`${this.baseEndpoint}/${id}/read`);
  }

  // ===== MARCAR COMO NO LEÍDA =====
  async markAsUnread(id: string): Promise<ApiResponse<Notification>> {
    return apiService.patch<Notification>(`${this.baseEndpoint}/${id}/unread`);
  }

  // ===== MARCAR TODAS COMO LEÍDAS =====
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiService.patch<void>(`${this.baseEndpoint}/read-all`);
  }

  // ===== MARCAR TODAS COMO NO LEÍDAS =====
  async markAllAsUnread(): Promise<ApiResponse<void>> {
    return apiService.patch<void>(`${this.baseEndpoint}/unread-all`);
  }

  // ===== OBTENER NOTIFICACIONES NO LEÍDAS =====
  async getUnreadNotifications(limit: number = 10): Promise<ApiResponse<Notification[]>> {
    return apiService.get<Notification[]>(`${this.baseEndpoint}/unread`, { limit });
  }

  // ===== OBTENER NOTIFICACIONES RECIENTES =====
  async getRecentNotifications(limit: number = 10): Promise<ApiResponse<Notification[]>> {
    return apiService.get<Notification[]>(`${this.baseEndpoint}/recent`, { limit });
  }

  // ===== OBTENER NOTIFICACIONES POR TIPO =====
  async getNotificationsByType(type: string, limit: number = 10): Promise<ApiResponse<Notification[]>> {
    return apiService.get<Notification[]>(`${this.baseEndpoint}/type/${type}`, { limit });
  }

  // ===== OBTENER NOTIFICACIONES POR PRIORIDAD =====
  async getNotificationsByPriority(priority: string, limit: number = 10): Promise<ApiResponse<Notification[]>> {
    return apiService.get<Notification[]>(`${this.baseEndpoint}/priority/${priority}`, { limit });
  }

  // ===== OBTENER CONTADOR DE NOTIFICACIONES =====
  async getNotificationCount(): Promise<ApiResponse<{
    total: number;
    unread: number;
    by_type: Record<string, number>;
    by_priority: Record<string, number>;
  }>> {
    return apiService.get<{
      total: number;
      unread: number;
      by_type: Record<string, number>;
      by_priority: Record<string, number>;
    }>(`${this.baseEndpoint}/count`);
  }

  // ===== ENVIAR NOTIFICACIÓN =====
  async sendNotification(notificationData: {
    user_id: string;
    title: string;
    message: string;
    type: string;
    priority: string;
    action_url?: string;
    action_text?: string;
    data?: Record<string, any>;
  }): Promise<ApiResponse<Notification>> {
    return apiService.post<Notification>(`${this.baseEndpoint}/send`, notificationData);
  }

  // ===== ENVIAR NOTIFICACIÓN MASIVA =====
  async sendBulkNotification(notificationData: {
    user_ids: string[];
    title: string;
    message: string;
    type: string;
    priority: string;
    action_url?: string;
    action_text?: string;
    data?: Record<string, any>;
  }): Promise<ApiResponse<{ sent: number; failed: number; notifications: Notification[] }>> {
    return apiService.post<{ sent: number; failed: number; notifications: Notification[] }>(
      `${this.baseEndpoint}/send-bulk`,
      notificationData
    );
  }

  // ===== ENVIAR NOTIFICACIÓN POR ROL =====
  async sendNotificationByRole(notificationData: {
    role: string;
    title: string;
    message: string;
    type: string;
    priority: string;
    action_url?: string;
    action_text?: string;
    data?: Record<string, any>;
  }): Promise<ApiResponse<{ sent: number; failed: number; notifications: Notification[] }>> {
    return apiService.post<{ sent: number; failed: number; notifications: Notification[] }>(
      `${this.baseEndpoint}/send-by-role`,
      notificationData
    );
  }

  // ===== ARCHIVAR NOTIFICACIÓN =====
  async archiveNotification(id: string): Promise<ApiResponse<Notification>> {
    return apiService.patch<Notification>(`${this.baseEndpoint}/${id}/archive`);
  }

  // ===== DESARCHIVAR NOTIFICACIÓN =====
  async unarchiveNotification(id: string): Promise<ApiResponse<Notification>> {
    return apiService.patch<Notification>(`${this.baseEndpoint}/${id}/unarchive`);
  }

  // ===== OBTENER NOTIFICACIONES ARCHIVADAS =====
  async getArchivedNotifications(page: number = 1, limit: number = 10): Promise<ApiResponse<{ notifications: Notification[]; pagination: PaginationInfo }>> {
    return apiService.get<{ notifications: Notification[]; pagination: PaginationInfo }>(
      `${this.baseEndpoint}/archived`,
      { page, limit }
    );
  }

  // ===== ELIMINAR NOTIFICACIONES ANTIGUAS =====
  async deleteOldNotifications(days: number = 30): Promise<ApiResponse<{ deleted: number }>> {
    return apiService.delete<{ deleted: number }>(`${this.baseEndpoint}/old`, { days });
  }

  // ===== OBTENER ESTADÍSTICAS DE NOTIFICACIONES =====
  async getNotificationStats(period: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    total_notifications: number;
    sent_notifications: number;
    read_notifications: number;
    unread_notifications: number;
    archived_notifications: number;
    notifications_by_type: Record<string, number>;
    notifications_by_priority: Record<string, number>;
    delivery_rate: number;
    read_rate: number;
  }>> {
    return apiService.get<{
      total_notifications: number;
      sent_notifications: number;
      read_notifications: number;
      unread_notifications: number;
      archived_notifications: number;
      notifications_by_type: Record<string, number>;
      notifications_by_priority: Record<string, number>;
      delivery_rate: number;
      read_rate: number;
    }>(`${this.baseEndpoint}/stats`, { period });
  }

  // ===== CONFIGURAR PREFERENCIAS DE NOTIFICACIÓN =====
  async setNotificationPreferences(preferences: {
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    types: Record<string, boolean>;
    quiet_hours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  }): Promise<ApiResponse<void>> {
    return apiService.post<void>(`${this.baseEndpoint}/preferences`, preferences);
  }

  // ===== OBTENER PREFERENCIAS DE NOTIFICACIÓN =====
  async getNotificationPreferences(): Promise<ApiResponse<{
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    types: Record<string, boolean>;
    quiet_hours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  }>> {
    return apiService.get<{
      email_enabled: boolean;
      sms_enabled: boolean;
      push_enabled: boolean;
      types: Record<string, boolean>;
      quiet_hours: {
        enabled: boolean;
        start: string;
        end: string;
      };
    }>(`${this.baseEndpoint}/preferences`);
  }
}

// ===== INSTANCIA SINGLETON =====
export const notificationService = new NotificationService();
