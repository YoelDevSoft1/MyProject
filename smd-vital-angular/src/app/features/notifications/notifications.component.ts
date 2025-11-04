import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="notifications-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>notifications</mat-icon>
            Notificaciones
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Buscar notificaciones</mat-label>
              <input matInput placeholder="Título o mensaje">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            Nueva Notificación
          </button>
          <button mat-button color="accent">
            <mat-icon>mark_email_read</mat-icon>
            Marcar Todas como Leídas
          </button>
        </mat-card-actions>
      </mat-card>

      <div class="notifications-grid">
        <mat-card class="notifications-card">
          <mat-card-header>
            <mat-card-title>Notificaciones Recientes</mat-card-title>
            <mat-card-subtitle>{{ unreadCount }} sin leer</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <mat-list>
              <mat-list-item *ngFor="let notification of notifications" 
                            [class.unread]="!notification.read"
                            class="notification-item">
                <mat-icon matListIcon [ngClass]="'notification-icon-' + notification.type">
                  {{ getNotificationIcon(notification.type) }}
                </mat-icon>
                
                <div matLine class="notification-content">
                  <div class="notification-header">
                    <span class="notification-title">{{ notification.title }}</span>
                    <span class="notification-date">{{ notification.date }}</span>
                  </div>
                  <div class="notification-message">{{ notification.message }}</div>
                </div>

                <div class="notification-actions">
                  <mat-chip [color]="getPriorityColor(notification.priority)" 
                           [class]="'priority-' + notification.priority">
                    {{ getPriorityText(notification.priority) }}
                  </mat-chip>
                  
                  <button mat-icon-button 
                          [color]="notification.read ? 'primary' : 'accent'"
                          (click)="toggleRead(notification)">
                    <mat-icon>{{ notification.read ? 'mark_email_read' : 'mark_email_unread' }}</mat-icon>
                  </button>
                  
                  <button mat-icon-button color="warn" (click)="deleteNotification(notification)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>

        <mat-card class="stats-card">
          <mat-card-header>
            <mat-card-title>Estadísticas</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <mat-icon class="stat-icon info">info</mat-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ getCountByType('info') }}</div>
                  <div class="stat-label">Informativas</div>
                </div>
              </div>
              
              <div class="stat-item">
                <mat-icon class="stat-icon warning">warning</mat-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ getCountByType('warning') }}</div>
                  <div class="stat-label">Advertencias</div>
                </div>
              </div>
              
              <div class="stat-item">
                <mat-icon class="stat-icon error">error</mat-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ getCountByType('error') }}</div>
                  <div class="stat-label">Errores</div>
                </div>
              </div>
              
              <div class="stat-item">
                <mat-icon class="stat-icon success">check_circle</mat-icon>
                <div class="stat-info">
                  <div class="stat-value">{{ getCountByType('success') }}</div>
                  <div class="stat-label">Éxito</div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      padding: 20px;
    }

    .header-card {
      margin-bottom: 20px;
    }

    .header-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--primary-color);
    }

    .filters {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filters mat-form-field {
      min-width: 300px;
    }

    .notifications-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }

    .notifications-card {
      margin-bottom: 20px;
    }

    .notification-item {
      border-bottom: 1px solid var(--border-color);
      padding: 16px 0;
    }

    .notification-item.unread {
      background-color: #f8f9fa;
      border-left: 4px solid var(--primary-color);
      padding-left: 12px;
    }

    .notification-content {
      flex: 1;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .notification-title {
      font-weight: 500;
      color: var(--text-color);
    }

    .notification-date {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .notification-message {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .notification-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .notification-icon-info {
      color: #1976d2;
    }

    .notification-icon-warning {
      color: #f57c00;
    }

    .notification-icon-error {
      color: #d32f2f;
    }

    .notification-icon-success {
      color: #388e3c;
    }

    .priority-low {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .priority-medium {
      background-color: #fff3cd;
      color: #856404;
    }

    .priority-high {
      background-color: #ffebee;
      color: #c62828;
    }

    .stats-card {
      height: fit-content;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      background-color: #f8f9fa;
    }

    .stat-icon {
      font-size: 1.5rem;
    }

    .stat-icon.info {
      color: #1976d2;
    }

    .stat-icon.warning {
      color: #f57c00;
    }

    .stat-icon.error {
      color: #d32f2f;
    }

    .stat-icon.success {
      color: #388e3c;
    }

    .stat-value {
      font-size: 1.2rem;
      font-weight: bold;
      color: var(--text-color);
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .notifications-grid {
        grid-template-columns: 1fr;
      }

      .filters {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filters mat-form-field {
        min-width: 100%;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [
    {
      id: '1',
      title: 'Nueva cita programada',
      message: 'Se ha programado una nueva cita para el paciente Juan Pérez el 10 de octubre a las 10:00 AM.',
      type: 'info',
      date: '2025-10-07 09:30',
      read: false,
      priority: 'medium'
    },
    {
      id: '2',
      title: 'Pago pendiente',
      message: 'El pago de la consulta del paciente Ana López está pendiente de confirmación.',
      type: 'warning',
      date: '2025-10-07 08:15',
      read: false,
      priority: 'high'
    },
    {
      id: '3',
      title: 'Sistema actualizado',
      message: 'El sistema se ha actualizado correctamente. Todas las funcionalidades están disponibles.',
      type: 'success',
      date: '2025-10-06 16:45',
      read: true,
      priority: 'low'
    },
    {
      id: '4',
      title: 'Error en backup',
      message: 'Se ha detectado un error en el proceso de backup automático. Revisar configuración.',
      type: 'error',
      date: '2025-10-06 14:20',
      read: true,
      priority: 'high'
    }
  ];

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  ngOnInit() {
    console.log('Notifications component initialized');
  }

  getNotificationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'info': 'info',
      'warning': 'warning',
      'error': 'error',
      'success': 'check_circle'
    };
    return iconMap[type] || 'info';
  }

  getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta'
    };
    return priorityMap[priority] || priority;
  }

  getPriorityColor(priority: string): string {
    const colorMap: { [key: string]: string } = {
      'low': 'primary',
      'medium': 'accent',
      'high': 'warn'
    };
    return colorMap[priority] || 'primary';
  }

  getCountByType(type: string): number {
    return this.notifications.filter(n => n.type === type).length;
  }

  toggleRead(notification: Notification): void {
    notification.read = !notification.read;
  }

  deleteNotification(notification: Notification): void {
    const index = this.notifications.findIndex(n => n.id === notification.id);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }
}
