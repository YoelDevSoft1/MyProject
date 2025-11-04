/**
 * SMD VITAL - Servicio de Notificaciones Avanzado
 * ================================================
 * 
 * Servicio completo para manejo de notificaciones multi-canal
 * con templates, programación y analytics.
 * 
 * Author: Senior Developer Team
 * Version: 2.0.0
 */

import apiService from '../apiService';

class NotificationService {
  constructor() {
    this.templates = new Map();
    this.channels = {
      email: this.sendEmail.bind(this),
      sms: this.sendSMS.bind(this),
      push: this.sendPush.bind(this),
      whatsapp: this.sendWhatsApp.bind(this)
    };
    this.retryAttempts = 3;
    this.retryDelay = 5000; // 5 segundos
  }

  // =====================================================
  // 1. ENVÍO DE NOTIFICACIONES
  // =====================================================

  /**
   * Enviar notificación multi-canal
   */
  async sendNotification(notificationData) {
    try {
      const {
        recipient_id,
        type,
        channel,
        template,
        data = {},
        priority = 'normal',
        scheduled_at = null
      } = notificationData;

      // Validar datos requeridos
      if (!recipient_id || !type || !channel) {
        throw new Error('Datos de notificación incompletos');
      }

      // Obtener template si se especifica
      let content = notificationData.content;
      let subject = notificationData.subject;

      if (template) {
        const templateData = await this.getTemplate(template);
        if (templateData) {
          content = this.processTemplate(templateData.content, data);
          subject = this.processTemplate(templateData.subject, data);
        }
      }

      // Crear registro de notificación
      const notification = {
        recipient_id,
        type,
        channel,
        subject,
        content,
        priority,
        status: 'pending',
        scheduled_at,
        metadata: {
          template,
          data,
          created_at: new Date().toISOString()
        }
      };

      // Si está programada, guardar para envío posterior
      if (scheduled_at && new Date(scheduled_at) > new Date()) {
        return await this.scheduleNotification(notification);
      }

      // Enviar inmediatamente
      return await this.deliverNotification(notification);
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Entregar notificación
   */
  async deliverNotification(notification) {
    try {
      // Obtener función del canal
      const channelFunction = this.channels[notification.channel];
      if (!channelFunction) {
        throw new Error(`Canal de notificación no soportado: ${notification.channel}`);
      }

      // Enviar a través del canal específico
      const result = await channelFunction(notification);

      // Actualizar estado en base de datos
      await this.updateNotificationStatus(notification.id, 'sent', result);

      // Emitir evento de notificación enviada
      this.emit('notification:sent', {
        notification,
        result
      });

      return result;
    } catch (error) {
      console.error('Error delivering notification:', error);
      
      // Marcar como fallida
      await this.updateNotificationStatus(notification.id, 'failed', {
        error: error.message,
        failed_at: new Date().toISOString()
      });

      // Reintentar si es necesario
      if (notification.retry_count < this.retryAttempts) {
        await this.retryNotification(notification);
      }

      throw error;
    }
  }

  // =====================================================
  // 2. CANALES DE NOTIFICACIÓN
  // =====================================================

  /**
   * Enviar email
   */
  async sendEmail(notification) {
    try {
      const response = await apiService.post('/notifications/email', {
        to: notification.recipient_email,
        subject: notification.subject,
        content: notification.content,
        template: notification.metadata?.template,
        data: notification.metadata?.data
      });

      return {
        channel: 'email',
        message_id: response.data.message_id,
        status: 'sent',
        sent_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Enviar SMS
   */
  async sendSMS(notification) {
    try {
      const response = await apiService.post('/notifications/sms', {
        to: notification.recipient_phone,
        message: notification.content,
        template: notification.metadata?.template
      });

      return {
        channel: 'sms',
        message_id: response.data.message_id,
        status: 'sent',
        sent_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  /**
   * Enviar notificación push
   */
  async sendPush(notification) {
    try {
      const response = await apiService.post('/notifications/push', {
        user_id: notification.recipient_id,
        title: notification.subject,
        body: notification.content,
        data: notification.metadata?.data
      });

      return {
        channel: 'push',
        message_id: response.data.message_id,
        status: 'sent',
        sent_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  /**
   * Enviar WhatsApp
   */
  async sendWhatsApp(notification) {
    try {
      const response = await apiService.post('/notifications/whatsapp', {
        to: notification.recipient_phone,
        message: notification.content,
        template: notification.metadata?.template
      });

      return {
        channel: 'whatsapp',
        message_id: response.data.message_id,
        status: 'sent',
        sent_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      throw error;
    }
  }

  // =====================================================
  // 3. GESTIÓN DE TEMPLATES
  // =====================================================

  /**
   * Obtener template
   */
  async getTemplate(templateName) {
    try {
      // Verificar cache primero
      if (this.templates.has(templateName)) {
        return this.templates.get(templateName);
      }

      // Obtener de la base de datos
      const response = await apiService.get(`/notifications/templates/${templateName}`);
      const template = response.data;

      // Cachear template
      this.templates.set(templateName, template);

      return template;
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  }

  /**
   * Procesar template con datos
   */
  processTemplate(template, data) {
    if (!template || !data) return template;

    let processed = template;
    
    // Reemplazar variables {{variable}}
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, data[key] || '');
    });

    return processed;
  }

  /**
   * Cargar todos los templates
   */
  async loadTemplates() {
    try {
      const response = await apiService.get('/notifications/templates');
      const templates = response.data;

      templates.forEach(template => {
        this.templates.set(template.name, template);
      });

      return templates;
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  }

  // =====================================================
  // 4. NOTIFICACIONES PROGRAMADAS
  // =====================================================

  /**
   * Programar notificación
   */
  async scheduleNotification(notification) {
    try {
      const response = await apiService.post('/notifications/schedule', notification);
      
      // Programar en el cliente si es necesario
      if (notification.scheduled_at) {
        const delay = new Date(notification.scheduled_at) - new Date();
        if (delay > 0) {
          setTimeout(() => {
            this.deliverNotification(notification);
          }, delay);
        }
      }

      return response.data;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Procesar notificaciones programadas
   */
  async processScheduledNotifications() {
    try {
      const response = await apiService.get('/notifications/scheduled');
      const notifications = response.data;

      for (const notification of notifications) {
        if (new Date(notification.scheduled_at) <= new Date()) {
          await this.deliverNotification(notification);
        }
      }

      return notifications.length;
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
      return 0;
    }
  }

  // =====================================================
  // 5. NOTIFICACIONES MASIVAS
  // =====================================================

  /**
   * Enviar notificación masiva
   */
  async sendBulkNotification(recipients, notificationData) {
    try {
      const results = [];
      const batchSize = 10; // Procesar en lotes de 10

      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        const batchPromises = batch.map(recipient => 
          this.sendNotification({
            ...notificationData,
            recipient_id: recipient.id,
            recipient_email: recipient.email,
            recipient_phone: recipient.phone
          })
        );

        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);
      }

      return {
        total: recipients.length,
        sent: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length,
        results
      };
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      throw error;
    }
  }

  // =====================================================
  // 6. PREFERENCIAS DE USUARIO
  // =====================================================

  /**
   * Obtener preferencias de notificación del usuario
   */
  async getUserPreferences(userId) {
    try {
      const response = await apiService.get(`/notifications/preferences/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        email: true,
        sms: false,
        push: true,
        whatsapp: false
      };
    }
  }

  /**
   * Actualizar preferencias de notificación
   */
  async updateUserPreferences(userId, preferences) {
    try {
      const response = await apiService.put(`/notifications/preferences/${userId}`, preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // =====================================================
  // 7. ANALYTICS Y MÉTRICAS
  // =====================================================

  /**
   * Obtener estadísticas de notificaciones
   */
  async getNotificationStats(period = '30d') {
    try {
      const response = await apiService.get(`/notifications/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        total_sent: 0,
        total_delivered: 0,
        total_failed: 0,
        delivery_rate: 0,
        by_channel: {},
        by_type: {}
      };
    }
  }

  /**
   * Obtener historial de notificaciones
   */
  async getNotificationHistory(userId, filters = {}) {
    try {
      const response = await apiService.get(`/notifications/history/${userId}`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  }

  // =====================================================
  // 8. REINTENTOS Y RECUPERACIÓN
  // =====================================================

  /**
   * Reintentar notificación fallida
   */
  async retryNotification(notification) {
    try {
      const retryCount = (notification.retry_count || 0) + 1;
      
      // Actualizar contador de reintentos
      await this.updateNotificationStatus(notification.id, 'retrying', {
        retry_count: retryCount,
        retry_at: new Date().toISOString()
      });

      // Esperar antes del reintento
      await new Promise(resolve => setTimeout(resolve, this.retryDelay * retryCount));

      // Reintentar envío
      return await this.deliverNotification({
        ...notification,
        retry_count: retryCount
      });
    } catch (error) {
      console.error('Error retrying notification:', error);
      throw error;
    }
  }

  /**
   * Procesar notificaciones fallidas
   */
  async processFailedNotifications() {
    try {
      const response = await apiService.get('/notifications/failed');
      const failedNotifications = response.data;

      for (const notification of failedNotifications) {
        if (notification.retry_count < this.retryAttempts) {
          await this.retryNotification(notification);
        } else {
          // Marcar como definitivamente fallida
          await this.updateNotificationStatus(notification.id, 'permanently_failed', {
            final_failure_at: new Date().toISOString()
          });
        }
      }

      return failedNotifications.length;
    } catch (error) {
      console.error('Error processing failed notifications:', error);
      return 0;
    }
  }

  // =====================================================
  // 9. UTILIDADES
  // =====================================================

  /**
   * Actualizar estado de notificación
   */
  async updateNotificationStatus(notificationId, status, metadata = {}) {
    try {
      await apiService.put(`/notifications/${notificationId}/status`, {
        status,
        metadata
      });
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  }

  /**
   * Emitir evento
   */
  emit(event, data) {
    // Implementar sistema de eventos si es necesario
    console.log(`Notification event: ${event}`, data);
  }

  /**
   * Limpiar cache de templates
   */
  clearTemplateCache() {
    this.templates.clear();
  }

  /**
   * Obtener canales disponibles
   */
  getAvailableChannels() {
    return Object.keys(this.channels);
  }
}

// Instancia singleton
const notificationService = new NotificationService();

export default notificationService;
