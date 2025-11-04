import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  systemUptime: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  status: 'success' | 'failed';
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="admin-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>admin_panel_settings</mat-icon>
            Panel de Administración
          </mat-card-title>
          <mat-card-subtitle>Gestión del sistema SMD VITAL</mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <div class="stats-grid">
        <mat-card class="stat-card" *ngFor="let stat of statsArray">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">{{ stat.icon }}</mat-icon>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="admin-content">
        <mat-tab-group>
          <mat-tab label="Usuarios">
            <div class="tab-content">
              <div class="table-header">
                <mat-form-field appearance="outline">
                  <mat-label>Buscar usuarios</mat-label>
                  <input matInput placeholder="Nombre o email">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                <button mat-raised-button color="primary">
                  <mat-icon>person_add</mat-icon>
                  Nuevo Usuario
                </button>
              </div>

              <table mat-table [dataSource]="users" class="admin-table">
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let user">{{ user.name }}</td>
                </ng-container>

                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let user">{{ user.email }}</td>
                </ng-container>

                <ng-container matColumnDef="role">
                  <th mat-header-cell *matHeaderCellDef>Rol</th>
                  <td mat-cell *matCellDef="let user">
                    <mat-chip [color]="getRoleColor(user.role)">{{ user.role }}</mat-chip>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let user">
                    <span class="status-badge" [ngClass]="'status-' + user.status">
                      {{ getStatusText(user.status) }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="lastLogin">
                  <th mat-header-cell *matHeaderCellDef>Último Acceso</th>
                  <td mat-cell *matCellDef="let user">{{ user.lastLogin }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let user">
                    <button mat-icon-button color="primary" title="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button [color]="user.status === 'active' ? 'warn' : 'accent'" 
                            [title]="user.status === 'active' ? 'Desactivar' : 'Activar'">
                      <mat-icon>{{ user.status === 'active' ? 'block' : 'check_circle' }}</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" title="Eliminar">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: userColumns;"></tr>
              </table>

              <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" showFirstLastButtons></mat-paginator>
            </div>
          </mat-tab>

          <mat-tab label="Auditoría">
            <div class="tab-content">
              <div class="table-header">
                <mat-form-field appearance="outline">
                  <mat-label>Filtrar logs</mat-label>
                  <input matInput placeholder="Usuario o acción">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                <button mat-button>
                  <mat-icon>download</mat-icon>
                  Exportar
                </button>
              </div>

              <table mat-table [dataSource]="auditLogs" class="admin-table">
                <ng-container matColumnDef="timestamp">
                  <th mat-header-cell *matHeaderCellDef>Fecha/Hora</th>
                  <td mat-cell *matCellDef="let log">{{ log.timestamp }}</td>
                </ng-container>

                <ng-container matColumnDef="user">
                  <th mat-header-cell *matHeaderCellDef>Usuario</th>
                  <td mat-cell *matCellDef="let log">{{ log.user }}</td>
                </ng-container>

                <ng-container matColumnDef="action">
                  <th mat-header-cell *matHeaderCellDef>Acción</th>
                  <td mat-cell *matCellDef="let log">{{ log.action }}</td>
                </ng-container>

                <ng-container matColumnDef="resource">
                  <th mat-header-cell *matHeaderCellDef>Recurso</th>
                  <td mat-cell *matCellDef="let log">{{ log.resource }}</td>
                </ng-container>

                <ng-container matColumnDef="ipAddress">
                  <th mat-header-cell *matHeaderCellDef>IP</th>
                  <td mat-cell *matCellDef="let log">{{ log.ipAddress }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let log">
                    <span class="status-badge" [ngClass]="'status-' + log.status">
                      {{ log.status === 'success' ? 'Éxito' : 'Fallido' }}
                    </span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="auditColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: auditColumns;"></tr>
              </table>

              <mat-paginator [pageSizeOptions]="[10, 25, 50, 100]" showFirstLastButtons></mat-paginator>
            </div>
          </mat-tab>

          <mat-tab label="Sistema">
            <div class="tab-content">
              <div class="system-info">
                <mat-card class="info-card">
                  <mat-card-header>
                    <mat-card-title>Información del Sistema</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-label">Versión:</span>
                        <span class="info-value">SMD VITAL v1.0.0</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Tiempo de actividad:</span>
                        <span class="info-value">{{ systemStats.systemUptime }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Base de datos:</span>
                        <span class="info-value">PostgreSQL 14.5</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Servidor:</span>
                        <span class="info-value">Ubuntu 20.04 LTS</span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="actions-card">
                  <mat-card-header>
                    <mat-card-title>Acciones del Sistema</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="action-buttons">
                      <button mat-raised-button color="primary">
                        <mat-icon>backup</mat-icon>
                        Backup del Sistema
                      </button>
                      <button mat-raised-button color="accent">
                        <mat-icon>refresh</mat-icon>
                        Reiniciar Servicios
                      </button>
                      <button mat-raised-button color="warn">
                        <mat-icon>warning</mat-icon>
                        Mantenimiento
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-container {
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 2.5rem;
      width: 2.5rem;
      height: 2.5rem;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: bold;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .admin-content {
      margin-bottom: 20px;
    }

    .tab-content {
      padding: 20px 0;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 16px;
    }

    .table-header mat-form-field {
      flex: 1;
      max-width: 400px;
    }

    .admin-table {
      width: 100%;
      margin-bottom: 20px;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-active {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-inactive {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-suspended {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-success {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-failed {
      background-color: #ffebee;
      color: #c62828;
    }

    .system-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--border-color);
    }

    .info-label {
      font-weight: 500;
      color: var(--text-color);
    }

    .info-value {
      color: var(--text-secondary);
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .action-buttons button {
      justify-content: flex-start;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .table-header {
        flex-direction: column;
        align-items: stretch;
      }

      .table-header mat-form-field {
        max-width: 100%;
      }

      .system-info {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  userColumns: string[] = ['name', 'email', 'role', 'status', 'lastLogin', 'actions'];
  auditColumns: string[] = ['timestamp', 'user', 'action', 'resource', 'ipAddress', 'status'];

  systemStats: SystemStats = {
    totalUsers: 156,
    activeUsers: 142,
    totalAppointments: 1247,
    completedAppointments: 1189,
    totalRevenue: 45680.50,
    systemUptime: '15 días, 8 horas'
  };

  statsArray = [
    { icon: 'people', value: this.systemStats.totalUsers, label: 'Total Usuarios' },
    { icon: 'person', value: this.systemStats.activeUsers, label: 'Usuarios Activos' },
    { icon: 'event', value: this.systemStats.totalAppointments, label: 'Total Citas' },
    { icon: 'euro', value: '€' + this.systemStats.totalRevenue.toFixed(2), label: 'Ingresos' }
  ];

  users: User[] = [
    {
      id: '1',
      name: 'Dr. María García',
      email: 'maria.garcia@smdvital.com',
      role: 'Médico',
      status: 'active',
      lastLogin: '2025-10-07 09:30',
      createdAt: '2025-01-15'
    },
    {
      id: '2',
      name: 'Ana López',
      email: 'ana.lopez@smdvital.com',
      role: 'Enfermera',
      status: 'active',
      lastLogin: '2025-10-07 08:45',
      createdAt: '2025-02-20'
    },
    {
      id: '3',
      name: 'Carlos Ruiz',
      email: 'carlos.ruiz@smdvital.com',
      role: 'Administrador',
      status: 'active',
      lastLogin: '2025-10-07 10:15',
      createdAt: '2025-01-01'
    }
  ];

  auditLogs: AuditLog[] = [
    {
      id: '1',
      user: 'Dr. María García',
      action: 'LOGIN',
      resource: 'Sistema',
      timestamp: '2025-10-07 09:30:15',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: '2',
      user: 'Ana López',
      action: 'CREATE_APPOINTMENT',
      resource: 'Cita #1234',
      timestamp: '2025-10-07 08:45:22',
      ipAddress: '192.168.1.101',
      status: 'success'
    },
    {
      id: '3',
      user: 'Usuario Desconocido',
      action: 'LOGIN',
      resource: 'Sistema',
      timestamp: '2025-10-07 07:20:10',
      ipAddress: '192.168.1.200',
      status: 'failed'
    }
  ];

  ngOnInit() {
    console.log('Admin component initialized');
  }

  getRoleColor(role: string): string {
    const colorMap: { [key: string]: string } = {
      'Administrador': 'warn',
      'Médico': 'primary',
      'Enfermera': 'accent',
      'Paciente': 'primary'
    };
    return colorMap[role] || 'primary';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Activo',
      'inactive': 'Inactivo',
      'suspended': 'Suspendido'
    };
    return statusMap[status] || status;
  }
}
