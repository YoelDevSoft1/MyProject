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
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  emergencyPhone: string;
  dateOfBirth: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  occupation: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  medicalHistory: string[];
  allergies: string[];
  medications: string[];
  lastVisit: string;
  nextAppointment: string;
  status: 'active' | 'inactive' | 'deceased';
  createdAt: string;
  updatedAt: string;
  notes: string;
  bloodType: string;
  height: number; // in cm
  weight: number; // in kg
  bmi: number;
  photo?: string;
}

export interface PatientFilter {
  search: string;
  status: string;
  gender: string;
  ageRange: { min: number; max: number };
  lastVisit: Date | null;
  bloodType: string;
}

@Component({
  selector: 'app-patients',
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
    MatChipsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="patients-container">
      <!-- Header with Stats -->
      <div class="stats-grid">
        <mat-card class="stat-card primary">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>people</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ getTotalPatients() }}</div>
                <div class="stat-label">Total Pacientes</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card success">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>person</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ getActivePatients() }}</div>
                <div class="stat-label">Pacientes Activos</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card warning">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>schedule</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ getNewPatientsThisMonth() }}</div>
                <div class="stat-label">Nuevos Este Mes</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card info">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>event</mat-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ getPatientsWithUpcomingAppointments() }}</div>
                <div class="stat-label">Con Citas Próximas</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Main Content -->
      <mat-card class="main-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>people</mat-icon>
            Gestión de Pacientes
          </mat-card-title>
          <mat-card-subtitle>Base de datos de pacientes y historiales médicos</mat-card-subtitle>
        </mat-card-header>

        <!-- Tabs -->
        <mat-tab-group [(selectedIndex)]="selectedTab" class="patient-tabs">
          <mat-tab label="Lista de Pacientes">
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
                               placeholder="Nombre, email, teléfono, ID...">
                        <mat-icon matSuffix>search</mat-icon>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Estado</mat-label>
                        <mat-select [(ngModel)]="filter.status" (selectionChange)="applyFilters()">
                          <mat-option value="">Todos</mat-option>
                          <mat-option value="active">Activo</mat-option>
                          <mat-option value="inactive">Inactivo</mat-option>
                          <mat-option value="deceased">Fallecido</mat-option>
                        </mat-select>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Género</mat-label>
                        <mat-select [(ngModel)]="filter.gender" (selectionChange)="applyFilters()">
                          <mat-option value="">Todos</mat-option>
                          <mat-option value="M">Masculino</mat-option>
                          <mat-option value="F">Femenino</mat-option>
                          <mat-option value="O">Otro</mat-option>
                        </mat-select>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Tipo de Sangre</mat-label>
                        <mat-select [(ngModel)]="filter.bloodType" (selectionChange)="applyFilters()">
                          <mat-option value="">Todos</mat-option>
                          <mat-option value="A+">A+</mat-option>
                          <mat-option value="A-">A-</mat-option>
                          <mat-option value="B+">B+</mat-option>
                          <mat-option value="B-">B-</mat-option>
                          <mat-option value="AB+">AB+</mat-option>
                          <mat-option value="AB-">AB-</mat-option>
                          <mat-option value="O+">O+</mat-option>
                          <mat-option value="O-">O-</mat-option>
                        </mat-select>
                      </mat-form-field>
                      
                      <mat-form-field appearance="outline">
                        <mat-label>Última Visita</mat-label>
                        <input matInput 
                               [matDatepicker]="picker" 
                               [(ngModel)]="filter.lastVisit"
                               (dateChange)="applyFilters()">
                        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                        <mat-datepicker #picker></mat-datepicker>
                      </mat-form-field>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Actions Bar -->
              <div class="actions-bar">
                <button mat-raised-button color="primary" (click)="openNewPatientDialog()">
                  <mat-icon>person_add</mat-icon>
                  Nuevo Paciente
                </button>
                <button mat-stroked-button (click)="exportPatients()">
                  <mat-icon>download</mat-icon>
                  Exportar
                </button>
                <button mat-stroked-button (click)="refreshData()">
                  <mat-icon>refresh</mat-icon>
                  Actualizar
                </button>
                <button mat-stroked-button (click)="importPatients()">
                  <mat-icon>upload</mat-icon>
                  Importar
                </button>
              </div>

              <!-- Patients Table -->
              <mat-card class="table-card">
                <mat-card-content>
                  <div class="table-container" *ngIf="!loading; else loadingTemplate">
                    <table mat-table [dataSource]="filteredPatients" class="patients-table">
                      <ng-container matColumnDef="patient">
                        <th mat-header-cell *matHeaderCellDef>Paciente</th>
                        <td mat-cell *matCellDef="let patient">
                          <div class="patient-info">
                            <div class="patient-avatar">
                              <mat-icon>account_circle</mat-icon>
                            </div>
                            <div class="patient-details">
                              <div class="patient-name">{{ patient.fullName }}</div>
                              <div class="patient-id">ID: {{ patient.patientId }}</div>
                              <div class="patient-contact">
                                <mat-icon class="contact-icon">email</mat-icon>
                                {{ patient.email }}
                              </div>
                            </div>
                          </div>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="demographics">
                        <th mat-header-cell *matHeaderCellDef>Demográficos</th>
                        <td mat-cell *matCellDef="let patient">
                          <div class="demographics-info">
                            <div class="age-gender">
                              <mat-chip class="age-chip">{{ patient.age }} años</mat-chip>
                              <mat-chip class="gender-chip" [ngClass]="'gender-' + patient.gender">
                                {{ getGenderText(patient.gender) }}
                              </mat-chip>
                            </div>
                            <div class="blood-type">
                              <mat-icon class="blood-icon">bloodtype</mat-icon>
                              {{ patient.bloodType }}
                            </div>
                          </div>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="contact">
                        <th mat-header-cell *matHeaderCellDef>Contacto</th>
                        <td mat-cell *matCellDef="let patient">
                          <div class="contact-info">
                            <div class="phone">
                              <mat-icon class="contact-icon">phone</mat-icon>
                              {{ patient.phone }}
                            </div>
                            <div class="address">
                              <mat-icon class="contact-icon">location_on</mat-icon>
                              {{ patient.address.city }}, {{ patient.address.state }}
                            </div>
                          </div>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="medical">
                        <th mat-header-cell *matHeaderCellDef>Información Médica</th>
                        <td mat-cell *matCellDef="let patient">
                          <div class="medical-info">
                            <div class="bmi">
                              <mat-icon class="medical-icon">monitor_weight</mat-icon>
                              IMC: {{ patient.bmi.toFixed(1) }}
                            </div>
                            <div class="allergies" *ngIf="patient.allergies.length > 0">
                              <mat-icon class="medical-icon">warning</mat-icon>
                              {{ patient.allergies.length }} alergia(s)
                            </div>
                            <div class="medications" *ngIf="patient.medications.length > 0">
                              <mat-icon class="medical-icon">medication</mat-icon>
                              {{ patient.medications.length }} medicamento(s)
                            </div>
                          </div>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="visits">
                        <th mat-header-cell *matHeaderCellDef>Visitas</th>
                        <td mat-cell *matCellDef="let patient">
                          <div class="visits-info">
                            <div class="last-visit">
                              <mat-icon class="visit-icon">event</mat-icon>
                              {{ formatDate(patient.lastVisit) }}
                            </div>
                            <div class="next-appointment" *ngIf="patient.nextAppointment">
                              <mat-icon class="visit-icon">schedule</mat-icon>
                              Próxima: {{ formatDate(patient.nextAppointment) }}
                            </div>
                          </div>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="status">
                        <th mat-header-cell *matHeaderCellDef>Estado</th>
                        <td mat-cell *matCellDef="let patient">
                          <mat-chip class="status-chip" [ngClass]="'status-' + patient.status">
                            {{ getStatusText(patient.status) }}
                          </mat-chip>
                        </td>
                      </ng-container>

                      <ng-container matColumnDef="actions">
                        <th mat-header-cell *matHeaderCellDef>Acciones</th>
                        <td mat-cell *matCellDef="let patient">
                          <button mat-icon-button [matMenuTriggerFor]="actionMenu" [matMenuTriggerData]="{patient: patient}">
                            <mat-icon>more_vert</mat-icon>
                          </button>
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                      <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                          [class.selected-row]="selectedPatient?.id === row.id"
                          (click)="selectPatient(row)"></tr>
                    </table>

                    <mat-paginator 
                      [pageSizeOptions]="[10, 25, 50, 100]" 
                      showFirstLastButtons
                      [length]="totalPatients"
                      [pageSize]="pageSize"
                      (page)="onPageChange($event)">
                    </mat-paginator>
                  </div>

                  <ng-template #loadingTemplate>
                    <div class="loading-container">
                      <mat-spinner diameter="50"></mat-spinner>
                      <p>Cargando pacientes...</p>
                    </div>
                  </ng-template>
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
                    <h3>Estadísticas de Pacientes</h3>
                    <p>Aquí se mostrarán las estadísticas y gráficos de pacientes</p>
                    <button mat-raised-button color="primary">
                      <mat-icon>add</mat-icon>
                      Implementar Estadísticas
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <mat-tab label="Reportes">
            <div class="tab-content">
              <mat-card class="reports-card">
                <mat-card-content>
                  <div class="reports-placeholder">
                    <mat-icon>assessment</mat-icon>
                    <h3>Reportes de Pacientes</h3>
                    <p>Aquí se mostrarán los reportes y análisis de pacientes</p>
                    <button mat-raised-button color="primary">
                      <mat-icon>add</mat-icon>
                      Implementar Reportes
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
        <ng-template matMenuContent let-patient="patient">
          <button mat-menu-item (click)="viewPatient(patient)">
            <mat-icon>visibility</mat-icon>
            <span>Ver Perfil</span>
          </button>
          <button mat-menu-item (click)="editPatient(patient)">
            <mat-icon>edit</mat-icon>
            <span>Editar</span>
          </button>
          <button mat-menu-item (click)="viewMedicalHistory(patient)">
            <mat-icon>medical_services</mat-icon>
            <span>Historial Médico</span>
          </button>
          <button mat-menu-item (click)="scheduleAppointment(patient)">
            <mat-icon>event</mat-icon>
            <span>Nueva Cita</span>
          </button>
          <button mat-menu-item (click)="viewInsurance(patient)">
            <mat-icon>credit_card</mat-icon>
            <span>Información de Seguro</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="deactivatePatient(patient)" 
                  *ngIf="patient.status === 'active'">
            <mat-icon>person_off</mat-icon>
            <span>Desactivar</span>
          </button>
          <button mat-menu-item (click)="deletePatient(patient)" class="delete-action">
            <mat-icon>delete</mat-icon>
            <span>Eliminar</span>
          </button>
        </ng-template>
      </mat-menu>
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
       MAIN CONTAINER & BACKGROUND
       ======================================== */
    .patients-container {
      position: relative;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      padding: 1.5rem;
      overflow-x: hidden;
    }

    .patients-container::before {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 0;
      background: 
        radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(74, 222, 128, 0.2) 0%, transparent 50%);
      pointer-events: none;
    }

    /* ========================================
       STATS GRID
       ======================================== */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
      position: relative;
      z-index: 1;
    }

    .stat-card {
      border-radius: 20px;
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      box-shadow: var(--shadow-md);
      transition: all 0.3s var(--transition-smooth);
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--primary-gradient);
      opacity: 0.1;
      transition: opacity 0.3s var(--transition-smooth);
    }

    .stat-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: var(--shadow-lg);
    }

    .stat-card:hover::before {
      opacity: 0.2;
    }

    .stat-card.primary::before {
      background: var(--primary-gradient);
    }

    .stat-card.success::before {
      background: var(--success-gradient);
    }

    .stat-card.warning::before {
      background: var(--warning-gradient);
    }

    .stat-card.info::before {
      background: var(--info-gradient);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
      z-index: 2;
      padding: 1.5rem;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: var(--shadow-sm);
    }

    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--text-primary);
    }

    .stat-info {
      flex: 1;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.25rem;
      color: var(--text-primary);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ========================================
       MAIN CARD
       ======================================== */
    .main-card {
      border-radius: 24px;
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      position: relative;
      z-index: 1;
    }

    .main-card mat-card-header {
      background: var(--primary-gradient);
      color: var(--text-primary);
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .main-card mat-card-header::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .main-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.5rem;
      font-weight: 600;
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
    .patient-tabs {
      background: transparent;
    }

    .tab-content {
      padding: 2rem;
      background: transparent;
    }

    /* ========================================
       FILTERS
       ======================================== */
    .filters-section {
      margin-bottom: 2rem;
    }

    .filters-card {
      border-radius: 20px;
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      box-shadow: var(--shadow-md);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: end;
    }

    .search-field {
      grid-column: span 2;
    }

    /* ========================================
       ACTIONS BAR
       ======================================== */
    .actions-bar {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    /* ========================================
       TABLE
       ======================================== */
    .table-card {
      border-radius: 20px;
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    .patients-table {
      width: 100%;
      background: transparent;
    }

    .patients-table th {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 1rem;
    }

    .patients-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .patients-table tr:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .selected-row {
      background: rgba(102, 126, 234, 0.1) !important;
    }

    /* ========================================
       PATIENT INFO
       ======================================== */
    .patient-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .patient-avatar {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-gradient);
      border-radius: 50%;
      box-shadow: var(--shadow-sm);
    }

    .patient-avatar mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: var(--text-primary);
    }

    .patient-details {
      flex: 1;
    }

    .patient-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .patient-id {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      margin-bottom: 0.25rem;
    }

    .patient-contact {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--text-secondary);
      font-size: 0.75rem;
    }

    .contact-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* ========================================
       DEMOGRAPHICS
       ======================================== */
    .demographics-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .age-gender {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .age-chip {
      background: rgba(96, 165, 250, 0.2);
      color: #60a5fa;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .gender-chip {
      font-size: 0.75rem;
      font-weight: 500;
    }

    .gender-M {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .gender-F {
      background: rgba(236, 72, 153, 0.2);
      color: #ec4899;
    }

    .gender-O {
      background: rgba(168, 85, 247, 0.2);
      color: #a855f7;
    }

    .blood-type {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--text-secondary);
      font-size: 0.75rem;
    }

    .blood-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* ========================================
       CONTACT INFO
       ======================================== */
    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .phone, .address {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--text-secondary);
      font-size: 0.75rem;
    }

    /* ========================================
       MEDICAL INFO
       ======================================== */
    .medical-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .bmi, .allergies, .medications {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--text-secondary);
      font-size: 0.75rem;
    }

    .medical-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* ========================================
       VISITS INFO
       ======================================== */
    .visits-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .last-visit, .next-appointment {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--text-secondary);
      font-size: 0.75rem;
    }

    .visit-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    /* ========================================
       STATUS CHIPS
       ======================================== */
    .status-chip {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-active {
      background: rgba(34, 197, 94, 0.2);
      color: #22c55e;
    }

    .status-inactive {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .status-deceased {
      background: rgba(107, 114, 128, 0.2);
      color: #6b7280;
    }

    /* ========================================
       LOADING & PLACEHOLDERS
       ======================================== */
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

    .stats-placeholder,
    .reports-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      text-align: center;
      color: var(--text-secondary);
    }

    .stats-placeholder mat-icon,
    .reports-placeholder mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .stats-placeholder h3,
    .reports-placeholder h3 {
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    /* ========================================
       ACTION MENU
       ======================================== */
    .action-menu .delete-action {
      color: #ef4444;
    }

    /* ========================================
       RESPONSIVE DESIGN
       ======================================== */
    @media (max-width: 1024px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }
      
      .search-field {
        grid-column: span 1;
      }
    }

    @media (max-width: 768px) {
      .patients-container {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .stat-content {
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
      }

      .stat-icon {
        width: 50px;
        height: 50px;
      }

      .stat-number {
        font-size: 1.5rem;
      }

      .actions-bar {
        flex-direction: column;
      }

      .tab-content {
        padding: 1rem;
      }

      .patients-table {
        font-size: 0.75rem;
      }

      .patients-table th,
      .patients-table td {
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
export class PatientsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  displayedColumns: string[] = ['patient', 'demographics', 'contact', 'medical', 'visits', 'status', 'actions'];
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  selectedPatient: Patient | null = null;
  selectedTab = 0;
  loading = false;
  pageSize = 10;
  totalPatients = 0;

  filter: PatientFilter = {
    search: '',
    status: '',
    gender: '',
    ageRange: { min: 0, max: 100 },
    lastVisit: null,
    bloodType: ''
  };

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.loading = true;
    // Simulate API call
    setTimeout(() => {
      this.patients = [
        {
          id: '1',
          patientId: 'P001',
          firstName: 'Juan',
          lastName: 'Pérez',
          fullName: 'Juan Pérez',
          email: 'juan.perez@email.com',
          phone: '+57 300 123 4567',
          emergencyPhone: '+57 300 987 6543',
          dateOfBirth: '1988-05-15',
          age: 35,
          gender: 'M',
          maritalStatus: 'married',
          occupation: 'Ingeniero',
          address: {
            street: 'Calle 123 #45-67',
            city: 'Bogotá',
            state: 'Cundinamarca',
            zipCode: '110111',
            country: 'Colombia'
          },
          emergencyContact: {
            name: 'María Pérez',
            relationship: 'Esposa',
            phone: '+57 300 987 6543'
          },
          insurance: {
            provider: 'SURA',
            policyNumber: 'POL123456',
            groupNumber: 'GRP789'
          },
          medicalHistory: ['Hipertensión', 'Diabetes tipo 2'],
          allergies: ['Penicilina', 'Polen'],
          medications: ['Metformina', 'Losartán'],
          lastVisit: '2025-01-10',
          nextAppointment: '2025-02-10',
          status: 'active',
          createdAt: '2020-01-15T08:00:00Z',
          updatedAt: '2025-01-10T10:30:00Z',
          notes: 'Paciente estable, seguir tratamiento',
          bloodType: 'O+',
          height: 175,
          weight: 80,
          bmi: 26.1
        },
        {
          id: '2',
          patientId: 'P002',
          firstName: 'Ana',
          lastName: 'López',
          fullName: 'Ana López',
          email: 'ana.lopez@email.com',
          phone: '+57 300 234 5678',
          emergencyPhone: '+57 300 876 5432',
          dateOfBirth: '1995-08-22',
          age: 28,
          gender: 'F',
          maritalStatus: 'single',
          occupation: 'Médica',
          address: {
            street: 'Carrera 45 #78-90',
            city: 'Medellín',
            state: 'Antioquia',
            zipCode: '050001',
            country: 'Colombia'
          },
          emergencyContact: {
            name: 'Carlos López',
            relationship: 'Padre',
            phone: '+57 300 876 5432'
          },
          insurance: {
            provider: 'Nueva EPS',
            policyNumber: 'POL789012',
            groupNumber: 'GRP456'
          },
          medicalHistory: ['Asma'],
          allergies: ['Ácaros'],
          medications: ['Salbutamol'],
          lastVisit: '2025-01-08',
          nextAppointment: '2025-02-08',
          status: 'active',
          createdAt: '2021-03-10T09:00:00Z',
          updatedAt: '2025-01-08T14:20:00Z',
          notes: 'Control de asma, paciente estable',
          bloodType: 'A+',
          height: 165,
          weight: 60,
          bmi: 22.0
        },
        {
          id: '3',
          patientId: 'P003',
          firstName: 'Pedro',
          lastName: 'Martín',
          fullName: 'Pedro Martín',
          email: 'pedro.martin@email.com',
          phone: '+57 300 345 6789',
          emergencyPhone: '+57 300 765 4321',
          dateOfBirth: '1975-12-03',
          age: 48,
          gender: 'M',
          maritalStatus: 'divorced',
          occupation: 'Empresario',
          address: {
            street: 'Avenida 68 #123-45',
            city: 'Cali',
            state: 'Valle del Cauca',
            zipCode: '760001',
            country: 'Colombia'
          },
          emergencyContact: {
            name: 'Sofía Martín',
            relationship: 'Hija',
            phone: '+57 300 765 4321'
          },
          insurance: {
            provider: 'Sanitas',
            policyNumber: 'POL345678',
            groupNumber: 'GRP123'
          },
          medicalHistory: ['Hipertensión', 'Colesterol alto'],
          allergies: [],
          medications: ['Atorvastatina', 'Enalapril'],
          lastVisit: '2024-12-15',
          nextAppointment: '',
          status: 'inactive',
          createdAt: '2019-06-20T10:00:00Z',
          updatedAt: '2024-12-15T16:45:00Z',
          notes: 'Paciente inactivo, no ha asistido a citas recientes',
          bloodType: 'B+',
          height: 180,
          weight: 95,
          bmi: 29.3
        }
      ];
      this.filteredPatients = [...this.patients];
      this.totalPatients = this.patients.length;
      this.loading = false;
    }, 1000);
  }

  applyFilters() {
    this.filteredPatients = this.patients.filter(patient => {
      const matchesSearch = !this.filter.search || 
        patient.fullName.toLowerCase().includes(this.filter.search.toLowerCase()) ||
        patient.email.toLowerCase().includes(this.filter.search.toLowerCase()) ||
        patient.phone.includes(this.filter.search) ||
        patient.patientId.toLowerCase().includes(this.filter.search.toLowerCase());
      
      const matchesStatus = !this.filter.status || patient.status === this.filter.status;
      const matchesGender = !this.filter.gender || patient.gender === this.filter.gender;
      const matchesBloodType = !this.filter.bloodType || patient.bloodType === this.filter.bloodType;
      
      const matchesAge = patient.age >= this.filter.ageRange.min && patient.age <= this.filter.ageRange.max;
      
      let matchesLastVisit = true;
      if (this.filter.lastVisit) {
        const filterDate = this.filter.lastVisit.toISOString().split('T')[0];
        matchesLastVisit = patient.lastVisit === filterDate;
      }
      
      return matchesSearch && matchesStatus && matchesGender && matchesBloodType && matchesAge && matchesLastVisit;
    });
    this.totalPatients = this.filteredPatients.length;
  }

  getTotalPatients(): number {
    return this.patients.length;
  }

  getActivePatients(): number {
    return this.patients.filter(p => p.status === 'active').length;
  }

  getNewPatientsThisMonth(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return this.patients.filter(p => {
      const createdDate = new Date(p.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
  }

  getPatientsWithUpcomingAppointments(): number {
    return this.patients.filter(p => p.nextAppointment && p.nextAppointment !== '').length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getGenderText(gender: string): string {
    const genderMap: { [key: string]: string } = {
      'M': 'Masculino',
      'F': 'Femenino',
      'O': 'Otro'
    };
    return genderMap[gender] || gender;
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Activo',
      'inactive': 'Inactivo',
      'deceased': 'Fallecido'
    };
    return statusMap[status] || status;
  }

  selectPatient(patient: Patient) {
    this.selectedPatient = patient;
  }

  openNewPatientDialog() {
    this.snackBar.open('Funcionalidad de nuevo paciente en desarrollo', 'Cerrar', {
      duration: 3000
    });
  }

  viewPatient(patient: Patient) {
    this.snackBar.open(`Ver perfil: ${patient.fullName}`, 'Cerrar', {
      duration: 3000
    });
  }

  editPatient(patient: Patient) {
    this.snackBar.open(`Editar paciente: ${patient.fullName}`, 'Cerrar', {
      duration: 3000
    });
  }

  viewMedicalHistory(patient: Patient) {
    this.snackBar.open(`Ver historial médico: ${patient.fullName}`, 'Cerrar', {
      duration: 3000
    });
  }

  scheduleAppointment(patient: Patient) {
    this.snackBar.open(`Agendar cita para: ${patient.fullName}`, 'Cerrar', {
      duration: 3000
    });
  }

  viewInsurance(patient: Patient) {
    this.snackBar.open(`Ver información de seguro: ${patient.fullName}`, 'Cerrar', {
      duration: 3000
    });
  }

  deactivatePatient(patient: Patient) {
    patient.status = 'inactive';
    this.applyFilters();
    this.snackBar.open(`Paciente desactivado: ${patient.fullName}`, 'Cerrar', {
      duration: 3000
    });
  }

  deletePatient(patient: Patient) {
    const index = this.patients.findIndex(p => p.id === patient.id);
    if (index > -1) {
      this.patients.splice(index, 1);
      this.applyFilters();
      this.snackBar.open(`Paciente eliminado: ${patient.fullName}`, 'Cerrar', {
        duration: 3000
      });
    }
  }

  exportPatients() {
    this.snackBar.open('Exportando pacientes...', 'Cerrar', {
      duration: 3000
    });
  }

  importPatients() {
    this.snackBar.open('Importando pacientes...', 'Cerrar', {
      duration: 3000
    });
  }

  refreshData() {
    this.loadPatients();
  }

  onPageChange(event: any) {
    // Handle pagination
    console.log('Page changed:', event);
  }
}
