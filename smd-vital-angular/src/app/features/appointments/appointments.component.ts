import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipListbox } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
  type: string;
  reason: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  room?: string;
  cost?: number;
}

export interface AppointmentFilter {
  search: string;
  status: string;
  date: Date | null;
  doctor: string;
  type: string;
  priority: string;
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="appointments-container">
      <!-- Animated Background -->
      <div class="dashboard-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <div class="dashboard-container">
        <!-- Header with Stats -->
        <div class="stats-grid">
          <div class="stat-card" [style.--delay]="'0.1s'">
            <div class="stat-glass">
              <div class="stat-header">
                <div class="stat-icon-wrapper icon-0">
                  <mat-icon>event</mat-icon>
                  <div class="icon-glow"></div>
                </div>
                <div class="stat-trend positive">
                  <mat-icon>trending_up</mat-icon>
                  <span>+12%</span>
                </div>
              </div>
              <div class="stat-body">
                <div class="stat-value">{{ getTodayAppointments() }}</div>
                <div class="stat-label">Citas Hoy</div>
              </div>
              <div class="stat-footer">
                <div class="progress-bar">
                  <div class="progress-fill" [style.--progress]="'75%'"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="stat-card" [style.--delay]="'0.2s'">
            <div class="stat-glass">
              <div class="stat-header">
                <div class="stat-icon-wrapper icon-1">
                  <mat-icon>check_circle</mat-icon>
                  <div class="icon-glow"></div>
                </div>
                <div class="stat-trend positive">
                  <mat-icon>trending_up</mat-icon>
                  <span>+8%</span>
                </div>
              </div>
              <div class="stat-body">
                <div class="stat-value">{{ getCompletedAppointments() }}</div>
                <div class="stat-label">Completadas</div>
              </div>
              <div class="stat-footer">
                <div class="progress-bar">
                  <div class="progress-fill" [style.--progress]="'90%'"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="stat-card" [style.--delay]="'0.3s'">
            <div class="stat-glass">
              <div class="stat-header">
                <div class="stat-icon-wrapper icon-2">
                  <mat-icon>schedule</mat-icon>
                  <div class="icon-glow"></div>
                </div>
                <div class="stat-trend neutral">
                  <mat-icon>trending_flat</mat-icon>
                  <span>0%</span>
                </div>
              </div>
              <div class="stat-body">
                <div class="stat-value">{{ getPendingAppointments() }}</div>
                <div class="stat-label">Pendientes</div>
              </div>
              <div class="stat-footer">
                <div class="progress-bar">
                  <div class="progress-fill" [style.--progress]="'60%'"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="stat-card" [style.--delay]="'0.4s'">
            <div class="stat-glass">
              <div class="stat-header">
                <div class="stat-icon-wrapper icon-3">
                  <mat-icon>calendar_today</mat-icon>
                  <div class="icon-glow"></div>
                </div>
                <div class="stat-trend positive">
                  <mat-icon>trending_up</mat-icon>
                  <span>+15%</span>
                </div>
              </div>
              <div class="stat-body">
                <div class="stat-value">{{ getTotalAppointments() }}</div>
                <div class="stat-label">Total</div>
              </div>
              <div class="stat-footer">
                <div class="progress-bar">
                  <div class="progress-fill" [style.--progress]="'85%'"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <mat-card class="main-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>event</mat-icon>
            Gestión de Citas Médicas
          </mat-card-title>
          <mat-card-subtitle>Administra y programa citas médicas</mat-card-subtitle>
        </mat-card-header>

        <!-- Tabs -->
        <mat-tab-group [(selectedIndex)]="selectedTab" class="appointment-tabs">
          <mat-tab label="Lista de Citas">
            <div class="tab-content">
              <!-- Filters -->
              <div class="filters-section">
                <mat-card class="filters-card">
        <mat-card-content>
                    <div class="filters-grid">
                      <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar</mat-label>
                        <input matInput 
                               [(ngModel)]="filter.search" 
                               (input)="applyFilters()"
                               placeholder="Paciente, doctor, teléfono...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
                        <mat-select [(ngModel)]="filter.status" (selectionChange)="applyFilters()">
                          <mat-option value="">Todos</mat-option>
                <mat-option value="scheduled">Programadas</mat-option>
                <mat-option value="completed">Completadas</mat-option>
                <mat-option value="cancelled">Canceladas</mat-option>
                          <mat-option value="rescheduled">Reprogramadas</mat-option>
                          <mat-option value="no_show">No se presentó</mat-option>
                        </mat-select>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Doctor</mat-label>
                        <mat-select [(ngModel)]="filter.doctor" (selectionChange)="applyFilters()">
                          <mat-option value="">Todos</mat-option>
                          <mat-option *ngFor="let doctor of doctors" [value]="doctor.id">
                            {{ doctor.name }}
                          </mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Fecha</mat-label>
                        <input matInput 
                               [matDatepicker]="picker" 
                               [(ngModel)]="filter.date"
                               (dateChange)="applyFilters()">
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Prioridad</mat-label>
                        <mat-select [(ngModel)]="filter.priority" (selectionChange)="applyFilters()">
                          <mat-option value="">Todas</mat-option>
                          <mat-option value="urgent">Urgente</mat-option>
                          <mat-option value="high">Alta</mat-option>
                          <mat-option value="medium">Media</mat-option>
                          <mat-option value="low">Baja</mat-option>
                        </mat-select>
                      </mat-form-field>
          </div>
        </mat-card-content>
                </mat-card>
              </div>

              <!-- Actions Bar -->
              <div class="actions-bar">
                <button mat-raised-button color="primary" (click)="openNewAppointmentDialog()">
            <mat-icon>add</mat-icon>
            Nueva Cita
          </button>
                <button mat-stroked-button (click)="exportAppointments()">
                  <mat-icon>download</mat-icon>
                  Exportar
                </button>
                <button mat-stroked-button (click)="refreshData()">
                  <mat-icon>refresh</mat-icon>
                  Actualizar
                </button>
              </div>

              <!-- Appointments Table -->
      <mat-card class="table-card">
        <mat-card-content>
                  <div class="table-container" *ngIf="!loading; else loadingTemplate">
                    <table mat-table [dataSource]="filteredAppointments" class="appointments-table">
                      <ng-container matColumnDef="patient">
              <th mat-header-cell *matHeaderCellDef>Paciente</th>
                        <td mat-cell *matCellDef="let appointment">
                          <div class="patient-info">
                            <div class="patient-name">{{ appointment.patientName }}</div>
                            <div class="patient-details">
                              <mat-icon class="detail-icon">phone</mat-icon>
                              {{ appointment.patientPhone }}
                            </div>
                          </div>
                        </td>
            </ng-container>

                      <ng-container matColumnDef="doctor">
              <th mat-header-cell *matHeaderCellDef>Doctor</th>
                        <td mat-cell *matCellDef="let appointment">
                          <div class="doctor-info">
                            <div class="doctor-name">{{ appointment.doctorName }}</div>
                            <div class="doctor-specialty">{{ appointment.doctorSpecialty }}</div>
                          </div>
                        </td>
            </ng-container>

                      <ng-container matColumnDef="datetime">
                        <th mat-header-cell *matHeaderCellDef>Fecha y Hora</th>
                        <td mat-cell *matCellDef="let appointment">
                          <div class="datetime-info">
                            <div class="date">{{ formatDate(appointment.date) }}</div>
                            <div class="time">{{ appointment.time }} ({{ appointment.duration }}min)</div>
                          </div>
                        </td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
                        <td mat-cell *matCellDef="let appointment">
                          <mat-chip class="type-chip">{{ appointment.type }}</mat-chip>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="priority">
                        <th mat-header-cell *matHeaderCellDef>Prioridad</th>
                        <td mat-cell *matCellDef="let appointment">
                          <mat-chip class="priority-chip" [ngClass]="'priority-' + appointment.priority">
                            {{ getPriorityText(appointment.priority) }}
                          </mat-chip>
                        </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let appointment">
                          <mat-chip class="status-chip" [ngClass]="'status-' + appointment.status">
                  {{ getStatusText(appointment.status) }}
                          </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let appointment">
                          <button mat-icon-button [matMenuTriggerFor]="actionMenu" [matMenuTriggerData]="{appointment: appointment}">
                            <mat-icon>more_vert</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                          [class.selected-row]="selectedAppointment?.id === row.id"
                          (click)="selectAppointment(row)"></tr>
          </table>

                    <mat-paginator 
                      [pageSizeOptions]="[10, 25, 50, 100]" 
                      showFirstLastButtons
                      [length]="totalAppointments"
                      [pageSize]="pageSize"
                      (page)="onPageChange($event)">
                    </mat-paginator>
                  </div>

                  <ng-template #loadingTemplate>
                    <div class="loading-container">
                      <mat-spinner diameter="50"></mat-spinner>
                      <p>Cargando citas...</p>
                    </div>
                  </ng-template>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <mat-tab label="Calendario">
            <div class="tab-content">
              <mat-card class="calendar-card">
                <mat-card-content>
                  <div class="calendar-placeholder">
                    <mat-icon>calendar_month</mat-icon>
                    <h3>Vista de Calendario</h3>
                    <p>Aquí se mostrará el calendario de citas médicas</p>
                    <button mat-raised-button color="primary">
                      <mat-icon>add</mat-icon>
                      Implementar Calendario
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <mat-tab label="Estadísticas">
            <div class="tab-content">
              <mat-card class="stats-card">
                <mat-card-content>
                  <div class="stats-placeholder">
                    <mat-icon>analytics</mat-icon>
                    <h3>Estadísticas de Citas</h3>
                    <p>Aquí se mostrarán las estadísticas y gráficos de citas</p>
                    <button mat-raised-button color="primary">
                      <mat-icon>add</mat-icon>
                      Implementar Estadísticas
                    </button>
                  </div>
        </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>

      <!-- Action Menu -->
      <mat-menu #actionMenu="matMenu" class="action-menu">
        <ng-template matMenuContent let-appointment="appointment">
          <button mat-menu-item (click)="viewAppointment(appointment)">
            <mat-icon>visibility</mat-icon>
            <span>Ver Detalles</span>
          </button>
          <button mat-menu-item (click)="editAppointment(appointment)">
            <mat-icon>edit</mat-icon>
            <span>Editar</span>
          </button>
          <button mat-menu-item (click)="rescheduleAppointment(appointment)">
            <mat-icon>schedule</mat-icon>
            <span>Reprogramar</span>
          </button>
          <button mat-menu-item (click)="completeAppointment(appointment)" 
                  *ngIf="appointment.status === 'scheduled'">
            <mat-icon>check_circle</mat-icon>
            <span>Marcar Completada</span>
          </button>
          <button mat-menu-item (click)="cancelAppointment(appointment)" 
                  *ngIf="appointment.status === 'scheduled'">
            <mat-icon>cancel</mat-icon>
            <span>Cancelar</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="deleteAppointment(appointment)" class="delete-action">
            <mat-icon>delete</mat-icon>
            <span>Eliminar</span>
          </button>
        </ng-template>
      </mat-menu>
      </div>
    </div>
  `,
  styles: [`
    /* ========================================
       VARIABLES & FOUNDATIONS
       ======================================== */
    :host {
      --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      --success-gradient: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
      --info-gradient: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
      --warning-gradient: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      --error-gradient: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
      --glass-bg: rgba(255, 255, 255, 0.08);
      --glass-border: rgba(255, 255, 255, 0.15);
      --text-primary: #ffffff;
      --text-secondary: rgba(255, 255, 255, 0.8);
      --text-tertiary: rgba(255, 255, 255, 0.6);
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
      --shadow-md: 0 8px 32px rgba(0, 0, 0, 0.15);
      --shadow-lg: 0 16px 64px rgba(0, 0, 0, 0.2);
      --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
      --transition-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* ========================================
       MAIN WRAPPER & BACKGROUND
       ======================================== */
    .appointments-container {
      position: relative;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      overflow-x: hidden;
    }

    .appointments-container::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
    }

    .dashboard-background {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
    }

    .gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.4;
      animation: floatOrb 20s ease-in-out infinite;
    }

    .orb-1 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.3), transparent);
      top: -250px;
      left: -250px;
      animation-delay: 0s;
    }

    .orb-2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(118, 75, 162, 0.3), transparent);
      bottom: -200px;
      right: -200px;
      animation-delay: 7s;
    }

    .orb-3 {
      width: 350px;
      height: 350px;
      background: radial-gradient(circle, rgba(74, 222, 128, 0.2), transparent);
      top: 40%;
      right: 10%;
      animation-delay: 14s;
    }

    @keyframes floatOrb {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(50px, -50px) scale(1.1); }
      66% { transform: translate(-50px, 50px) scale(0.9); }
    }

    /* ========================================
       CONTAINER
       ======================================== */
    .dashboard-container {
      position: relative;
      z-index: 1;
      max-width: 1600px;
      margin: 0 auto;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* ========================================
       STATS GRID
       ======================================== */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      animation: fadeInUp 0.6s var(--transition-smooth);
      animation-delay: var(--delay);
      animation-fill-mode: backwards;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .stat-glass {
      background: var(--glass-bg);
      backdrop-filter: blur(30px);
      border-radius: 24px;
      border: 1px solid var(--glass-border);
      padding: 1.5rem;
      transition: all 0.3s var(--transition-smooth);
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .stat-glass:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-lg);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-icon-wrapper {
      position: relative;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      box-shadow: var(--shadow-md);
    }

    .stat-icon-wrapper.icon-0 {
      background: var(--success-gradient);
    }

    .stat-icon-wrapper.icon-1 {
      background: var(--info-gradient);
    }

    .stat-icon-wrapper.icon-2 {
      background: var(--warning-gradient);
    }

    .stat-icon-wrapper.icon-3 {
      background: var(--error-gradient);
    }

    .stat-icon-wrapper mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--text-primary);
      z-index: 2;
    }

    .icon-glow {
      position: absolute;
      inset: -4px;
      border-radius: 20px;
      background: inherit;
      opacity: 0.3;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.1); opacity: 0.1; }
      100% { transform: scale(1); opacity: 0.3; }
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .stat-trend.positive {
      color: #4ade80;
    }

    .stat-trend.negative {
      color: #f87171;
    }

    .stat-trend.neutral {
      color: var(--text-tertiary);
    }

    .stat-body {
      flex: 1;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .stat-footer {
      margin-top: auto;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary-gradient);
      border-radius: 2px;
      width: var(--progress);
      transition: width 0.3s var(--transition-smooth);
    }

    /* ========================================
       MAIN CARD
       ======================================== */
    .main-card {
      background: var(--glass-bg);
      backdrop-filter: blur(30px);
      border-radius: 32px;
      border: 1px solid var(--glass-border);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      position: relative;
    }

    .main-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary-gradient);
    }

    .main-card mat-card-header {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      color: var(--text-primary);
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .main-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      position: relative;
      z-index: 2;
    }

    .main-card mat-card-subtitle {
      color: var(--text-secondary);
      margin-top: 0.5rem;
      font-size: 1rem;
      position: relative;
      z-index: 2;
    }

    /* ========================================
       TABS
       ======================================== */
    .appointment-tabs {
      background: transparent;
    }

    .appointment-tabs .mat-tab-group {
      background: transparent;
    }

    .appointment-tabs .mat-tab-header {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
      border-bottom: 1px solid var(--glass-border);
      border-radius: 32px 32px 0 0;
    }

    .appointment-tabs .mat-tab-label {
      color: var(--text-secondary);
      font-weight: 600;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s var(--transition-smooth);
      border-radius: 32px 32px 0 0;
      margin-right: 0.5rem;
    }

    .appointment-tabs .mat-tab-label:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .appointment-tabs .mat-tab-label.mat-tab-label-active {
      color: var(--text-primary);
      background: rgba(102, 126, 234, 0.1);
      border-bottom: 2px solid rgba(102, 126, 234, 0.6);
    }

    .appointment-tabs .mat-ink-bar {
      background: var(--primary-gradient);
      height: 3px;
      border-radius: 2px;
    }

    .tab-content {
      padding: 2rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 0 0 32px 32px;
    }

    /* ========================================
       FILTERS
       ======================================== */
    .filters-section {
      margin-bottom: 2rem;
    }

    .filters-card {
      background: var(--glass-bg);
      backdrop-filter: blur(30px);
      border-radius: 24px;
      border: 1px solid var(--glass-border);
      box-shadow: var(--shadow-md);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
      padding: 1.5rem;
    }

    .search-field {
      grid-column: span 2;
    }

    /* Actions Bar */
    .actions-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    /* Table */
    .table-card {
      background: var(--glass-bg);
      backdrop-filter: blur(30px);
      border-radius: 24px;
      border: 1px solid var(--glass-border);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    .appointments-table {
      width: 100%;
      background: transparent;
    }

    .appointments-table th {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 1rem;
      border-bottom: 1px solid var(--glass-border);
    }

    .appointments-table td {
      padding: 1rem;
      border-bottom: 1px solid var(--glass-border);
      color: var(--text-primary);
    }

    .appointments-table tr:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .selected-row {
      background: rgba(102, 126, 234, 0.1) !important;
    }

    /* Patient Info */
    .patient-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .patient-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .patient-details {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--text-secondary);
      font-size: 0.75rem;
    }

    .detail-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* Doctor Info */
    .doctor-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .doctor-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .doctor-specialty {
      color: var(--text-secondary);
      font-size: 0.75rem;
    }

    /* DateTime Info */
    .datetime-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .date {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .time {
      color: var(--text-secondary);
      font-size: 0.75rem;
    }

    /* Chips */
    .type-chip {
      background: var(--info-gradient);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-radius: 20px;
      padding: 4px 12px;
    }

    .priority-chip {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      border-radius: 20px;
      padding: 4px 12px;
    }

    .priority-urgent {
      background: var(--error-gradient);
      color: white;
    }

    .priority-high {
      background: var(--warning-gradient);
      color: white;
    }

    .priority-medium {
      background: var(--info-gradient);
      color: white;
    }

    .priority-low {
      background: var(--success-gradient);
      color: white;
    }

    .status-chip {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      border-radius: 20px;
      padding: 4px 12px;
    }

    .status-scheduled {
      background: var(--info-gradient);
      color: white;
    }

    .status-completed {
      background: var(--success-gradient);
      color: white;
    }

    .status-cancelled {
      background: var(--error-gradient);
      color: white;
    }

    .status-rescheduled {
      background: var(--warning-gradient);
      color: white;
    }

    .status-no_show {
      background: rgba(255, 255, 255, 0.2);
      color: var(--text-tertiary);
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      gap: 1rem;
    }

    .loading-container p {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    /* Placeholders */
    .calendar-placeholder,
    .stats-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      text-align: center;
      color: var(--text-secondary);
    }

    .calendar-placeholder mat-icon,
    .stats-placeholder mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .calendar-placeholder h3,
    .stats-placeholder h3 {
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    /* Action Menu */
    .action-menu .delete-action {
      color: var(--error-gradient);
    }

    /* ========================================
       RESPONSIVE DESIGN
       ======================================== */
    @media (max-width: 1200px) {
      .dashboard-container {
        padding: 1.5rem;
      }
    }

    @media (max-width: 1024px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }
      
      .search-field {
        grid-column: span 1;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .actions-bar {
        flex-direction: column;
      }

      .tab-content {
        padding: 1rem;
      }

      .appointments-table {
        font-size: 0.75rem;
      }

      .appointments-table th,
      .appointments-table td {
        padding: 0.5rem;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .main-card mat-card-header {
        padding: 1rem;
      }

      .main-card mat-card-title {
        font-size: 1.25rem;
      }
    }
  `]
})
export class AppointmentsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  displayedColumns: string[] = ['patient', 'doctor', 'datetime', 'type', 'priority', 'status', 'actions'];
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  selectedAppointment: Appointment | null = null;
  selectedTab = 0;
  loading = false;
  pageSize = 10;
  totalAppointments = 0;

  filter: AppointmentFilter = {
    search: '',
    status: '',
    date: null,
    doctor: '',
    type: '',
    priority: ''
  };

  doctors = [
    { id: '1', name: 'Dr. María García', specialty: 'Medicina General' },
    { id: '2', name: 'Dr. Carlos Ruiz', specialty: 'Cardiología' },
    { id: '3', name: 'Dr. Ana López', specialty: 'Pediatría' },
    { id: '4', name: 'Dr. Pedro Martín', specialty: 'Dermatología' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading = true;
    // Simulate API call
    setTimeout(() => {
      this.appointments = [
    {
      id: '1',
          patientId: 'P001',
      patientName: 'Juan Pérez',
          patientPhone: '+57 300 123 4567',
          patientEmail: 'juan.perez@email.com',
          doctorId: '1',
      doctorName: 'Dr. María García',
          doctorSpecialty: 'Medicina General',
          date: '2025-01-15',
      time: '10:00',
          duration: 30,
      status: 'scheduled',
          type: 'Consulta General',
          reason: 'Revisión de rutina',
          notes: 'Paciente con síntomas leves',
          createdAt: '2025-01-10T08:00:00Z',
          updatedAt: '2025-01-10T08:00:00Z',
          priority: 'medium',
          room: 'Consultorio 1',
          cost: 50000
    },
    {
      id: '2',
          patientId: 'P002',
      patientName: 'Ana López',
          patientPhone: '+57 300 234 5678',
          patientEmail: 'ana.lopez@email.com',
          doctorId: '2',
      doctorName: 'Dr. Carlos Ruiz',
          doctorSpecialty: 'Cardiología',
          date: '2025-01-15',
      time: '11:30',
          duration: 45,
      status: 'completed',
          type: 'Consulta Especializada',
          reason: 'Seguimiento cardiológico',
          notes: 'Paciente estable, continuar tratamiento',
          createdAt: '2025-01-08T10:00:00Z',
          updatedAt: '2025-01-15T11:30:00Z',
          priority: 'high',
          room: 'Consultorio 2',
          cost: 80000
    },
    {
      id: '3',
          patientId: 'P003',
      patientName: 'Pedro Martín',
          patientPhone: '+57 300 345 6789',
          patientEmail: 'pedro.martin@email.com',
          doctorId: '3',
          doctorName: 'Dr. Ana López',
          doctorSpecialty: 'Pediatría',
          date: '2025-01-16',
      time: '09:00',
          duration: 30,
      status: 'cancelled',
          type: 'Consulta Pediátrica',
          reason: 'Control de crecimiento',
          notes: 'Paciente canceló por motivos personales',
          createdAt: '2025-01-12T14:00:00Z',
          updatedAt: '2025-01-14T16:00:00Z',
          priority: 'low',
          room: 'Consultorio 3',
          cost: 45000
        }
      ];
      this.filteredAppointments = [...this.appointments];
      this.totalAppointments = this.appointments.length;
      this.loading = false;
    }, 1000);
  }

  applyFilters() {
    this.filteredAppointments = this.appointments.filter(appointment => {
      const matchesSearch = !this.filter.search || 
        appointment.patientName.toLowerCase().includes(this.filter.search.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(this.filter.search.toLowerCase()) ||
        appointment.patientPhone.includes(this.filter.search);
      
      const matchesStatus = !this.filter.status || appointment.status === this.filter.status;
      const matchesDoctor = !this.filter.doctor || appointment.doctorId === this.filter.doctor;
      const matchesPriority = !this.filter.priority || appointment.priority === this.filter.priority;
      
      let matchesDate = true;
      if (this.filter.date) {
        const filterDate = this.filter.date.toISOString().split('T')[0];
        matchesDate = appointment.date === filterDate;
      }
      
      return matchesSearch && matchesStatus && matchesDoctor && matchesPriority && matchesDate;
    });
    this.totalAppointments = this.filteredAppointments.length;
  }

  getTodayAppointments(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.appointments.filter(apt => apt.date === today).length;
  }

  getCompletedAppointments(): number {
    return this.appointments.filter(apt => apt.status === 'completed').length;
  }

  getPendingAppointments(): number {
    return this.appointments.filter(apt => apt.status === 'scheduled').length;
  }

  getTotalAppointments(): number {
    return this.appointments.length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'scheduled': 'Programada',
      'completed': 'Completada',
      'cancelled': 'Cancelada',
      'rescheduled': 'Reprogramada',
      'no_show': 'No se presentó'
    };
    return statusMap[status] || status;
  }

  getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'urgent': 'Urgente',
      'high': 'Alta',
      'medium': 'Media',
      'low': 'Baja'
    };
    return priorityMap[priority] || priority;
  }

  selectAppointment(appointment: Appointment) {
    this.selectedAppointment = appointment;
  }

  openNewAppointmentDialog() {
    this.snackBar.open('Funcionalidad de nueva cita en desarrollo', 'Cerrar', {
      duration: 3000
    });
  }

  viewAppointment(appointment: Appointment) {
    this.snackBar.open(`Ver detalles de cita: ${appointment.patientName}`, 'Cerrar', {
      duration: 3000
    });
  }

  editAppointment(appointment: Appointment) {
    this.snackBar.open(`Editar cita: ${appointment.patientName}`, 'Cerrar', {
      duration: 3000
    });
  }

  rescheduleAppointment(appointment: Appointment) {
    this.snackBar.open(`Reprogramar cita: ${appointment.patientName}`, 'Cerrar', {
      duration: 3000
    });
  }

  completeAppointment(appointment: Appointment) {
    appointment.status = 'completed';
    this.applyFilters();
    this.snackBar.open(`Cita completada: ${appointment.patientName}`, 'Cerrar', {
      duration: 3000
    });
  }

  cancelAppointment(appointment: Appointment) {
    appointment.status = 'cancelled';
    this.applyFilters();
    this.snackBar.open(`Cita cancelada: ${appointment.patientName}`, 'Cerrar', {
      duration: 3000
    });
  }

  deleteAppointment(appointment: Appointment) {
    const index = this.appointments.findIndex(apt => apt.id === appointment.id);
    if (index > -1) {
      this.appointments.splice(index, 1);
      this.applyFilters();
      this.snackBar.open(`Cita eliminada: ${appointment.patientName}`, 'Cerrar', {
        duration: 3000
      });
    }
  }

  exportAppointments() {
    this.snackBar.open('Exportando citas...', 'Cerrar', {
      duration: 3000
    });
  }

  refreshData() {
    this.loadAppointments();
  }

  onPageChange(event: any) {
    // Handle pagination
    console.log('Page changed:', event);
  }
}
