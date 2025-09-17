import { apiService } from './api';
import type { 
  Notification, 
  NotificationPreferences, 
  PaginatedResponse 
} from '../types/api';

export class NotificationsService {
  private baseUrl = '/api/notifications';

  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    priority?: string;
  }): Promise<PaginatedResponse<Notification>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.priority) queryParams.append('priority', params.priority);

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      return await apiService.get<PaginatedResponse<Notification>>(url);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async getNotification(id: string): Promise<Notification> {
    try {
      return await apiService.get<Notification>(`${this.baseUrl}/${id}`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async markAsRead(id: string): Promise<Notification> {
    try {
      return await apiService.patch<Notification>(`${this.baseUrl}/${id}/read`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await apiService.patch(`${this.baseUrl}/mark-all-read`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async deleteAllNotifications(): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/delete-all`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Notification Preferences
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      return await apiService.get<NotificationPreferences>(`${this.baseUrl}/preferences`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async updateNotificationPreferences(data: {
    email_enabled?: boolean;
    sms_enabled?: boolean;
    push_enabled?: boolean;
    whatsapp_enabled?: boolean;
    notification_types?: string[];
  }): Promise<NotificationPreferences> {
    try {
      return await apiService.put<NotificationPreferences>(`${this.baseUrl}/preferences`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Send Notifications (for staff)
  async sendNotification(data: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    channels: string[];
    priority?: string;
  }): Promise<Notification> {
    try {
      return await apiService.post<Notification>(`${this.baseUrl}/send`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async sendBulkNotification(data: {
    user_ids: string[];
    type: string;
    title: string;
    message: string;
    channels: string[];
    priority?: string;
  }): Promise<{ sent: number; failed: number }> {
    try {
      return await apiService.post<{ sent: number; failed: number }>(`${this.baseUrl}/send-bulk`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Notification Statistics
  async getNotificationStats(): Promise<{
    total: number;
    unread: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
  }> {
    try {
      return await apiService.get(`${this.baseUrl}/stats`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  // Template Management
  async getNotificationTemplates(): Promise<Array<{
    id: string;
    name: string;
    type: string;
    subject: string;
    body: string;
    variables: string[];
  }>> {
    try {
      return await apiService.get(`${this.baseUrl}/templates`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async createNotificationTemplate(data: {
    name: string;
    type: string;
    subject: string;
    body: string;
    variables: string[];
  }): Promise<any> {
    try {
      return await apiService.post(`${this.baseUrl}/templates`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async updateNotificationTemplate(id: string, data: {
    name?: string;
    subject?: string;
    body?: string;
    variables?: string[];
  }): Promise<any> {
    try {
      return await apiService.put(`${this.baseUrl}/templates/${id}`, data);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }

  async deleteNotificationTemplate(id: string): Promise<void> {
    try {
      await apiService.delete(`${this.baseUrl}/templates/${id}`);
    } catch (error) {
      throw new Error(apiService.handleApiError(error));
    }
  }
}

export const notificationsService = new NotificationsService();
