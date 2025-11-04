import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
// MatChipListboxModule removed - not needed
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  type: 'consultation' | 'prescription' | 'vital-signs' | 'allergy' | 'lab-results' | 'imaging' | 'procedure';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'completed' | 'reviewed' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface ConsultationRecord extends MedicalRecord {
  type: 'consultation';
  chiefComplaint: string;
  historyOfPresentIllness: string;
  physicalExamination: {
    vitalSigns: VitalSigns;
    generalAppearance: string;
    cardiovascular: string;
    respiratory: string;
    gastrointestinal: string;
    neurological: string;
    musculoskeletal: string;
    skin: string;
  };
  assessment: string;
  plan: string;
  followUp: {
    date: string;
    instructions: string;
  };
  attachments: string[];
}

export interface PrescriptionRecord extends MedicalRecord {
  type: 'prescription';
  medications: Medication[];
  instructions: string;
  refills: number;
  pharmacy: string;
  prescriptionStatus: 'active' | 'completed' | 'cancelled';
  validUntil: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  sideEffects: string[];
  contraindications: string[];
}

export interface VitalSigns {
  bloodPressure: { systolic: number; diastolic: number };
  heartRate: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
  bmi: number;
}

export interface AllergyRecord extends MedicalRecord {
  type: 'allergy';
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  onsetDate: string;
  allergyStatus: 'active' | 'resolved' | 'unknown';
  notes: string;
}

export interface LabResultRecord extends MedicalRecord {
  type: 'lab-results';
  testName: string;
  testType: 'blood' | 'urine' | 'stool' | 'tissue' | 'other';
  results: LabResult[];
  normalRanges: { [key: string]: { min: number; max: number; unit: string } };
  interpretation: string;
  recommendations: string;
}

export interface LabResult {
  parameter: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
  status: 'normal' | 'high' | 'low' | 'critical';
  flag: string;
}

export interface MedicalRecordFilter {
  search: string;
  type: string;
  status: string;
  priority: string;
  dateRange: { start: Date | null; end: Date | null };
  doctor: string;
  patient: string;
}

@Component({
  selector: 'app-medical-records',
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
    MatTabsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatExpansionModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatSliderModule
  ],
  template: `
    <div class="medical-records-container">
      <!-- Hero Section with Advanced Analytics -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <div class="hero-badge">
              <mat-icon>medical_services</mat-icon>
              <span>Sistema de Registros Médicos</span>
            </div>
            <h1 class="hero-title">Historiales Clínicos Digitales</h1>
            <p class="hero-subtitle">Gestión integral de registros médicos con IA y análisis avanzado</p>
          </div>
          <div class="hero-actions">
            <button mat-fab color="primary" class="primary-fab" (click)="openNewRecordDialog()">
              <mat-icon>add</mat-icon>
            </button>
            <button mat-stroked-button class="secondary-btn" (click)="openBulkImportDialog()">
              <mat-icon>upload</mat-icon>
              <span>Importar Masivo</span>
            </button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="floating-cards">
            <div class="floating-card" *ngFor="let card of floatingCards; let i = index" 
                 [style.--delay]="i * 0.2 + 's'">
              <mat-icon>{{ card.icon }}</mat-icon>
              <span>{{ card.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Analytics Dashboard -->
      <div class="analytics-grid">
        <mat-card class="analytics-card primary" (click)="navigateToAnalytics('consultations')">
          <div class="card-content">
            <div class="card-icon">
              <mat-icon>medical_information</mat-icon>
              <div class="icon-pulse"></div>
            </div>
            <div class="card-stats">
              <div class="stat-number">{{ getTotalConsultations() }}</div>
              <div class="stat-label">Consultas Totales</div>
              <div class="stat-trend positive">
                <mat-icon>trending_up</mat-icon>
                <span>+12% este mes</span>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="analytics-card success" (click)="navigateToAnalytics('prescriptions')">
          <div class="card-content">
            <div class="card-icon">
              <mat-icon>medication</mat-icon>
              <div class="icon-pulse"></div>
            </div>
            <div class="card-stats">
              <div class="stat-number">{{ getActivePrescriptions() }}</div>
              <div class="stat-label">Prescripciones Activas</div>
              <div class="stat-trend positive">
                <mat-icon>trending_up</mat-icon>
                <span>+8% este mes</span>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="analytics-card warning" (click)="navigateToAnalytics('vitals')">
          <div class="card-content">
            <div class="card-icon">
              <mat-icon>monitor_heart</mat-icon>
              <div class="icon-pulse"></div>
            </div>
            <div class="card-stats">
              <div class="stat-number">{{ getVitalSignsRecords() }}</div>
              <div class="stat-label">Registros de Signos</div>
              <div class="stat-trend neutral">
                <mat-icon>trending_flat</mat-icon>
                <span>Estable</span>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="analytics-card info" (click)="navigateToAnalytics('allergies')">
          <div class="card-content">
            <div class="card-icon">
              <mat-icon>warning</mat-icon>
              <div class="icon-pulse"></div>
            </div>
            <div class="card-stats">
              <div class="stat-number">{{ getCriticalAllergies() }}</div>
              <div class="stat-label">Alergias Críticas</div>
              <div class="stat-trend negative">
                <mat-icon>trending_down</mat-icon>
                <span>-3% este mes</span>
              </div>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- Main Content Area -->
      <mat-card class="main-content-card">
        <mat-card-header class="content-header">
          <div class="header-content">
            <div class="header-text">
              <h2 class="content-title">Registros Médicos</h2>
              <p class="content-subtitle">Gestión completa de historiales clínicos y documentación médica</p>
            </div>
            <div class="header-actions">
              <button mat-icon-button class="view-toggle" (click)="toggleView()">
                <mat-icon>{{ isGridView ? 'view_list' : 'view_module' }}</mat-icon>
              </button>
              <button mat-icon-button class="filter-toggle" (click)="toggleAdvancedFilters()">
                <mat-icon>tune</mat-icon>
                <span matBadge="!" [matBadgeHidden]="!hasActiveFilters" matBadgeColor="warn" matBadgeSize="small"></span>
              </button>
            </div>
          </div>
        </mat-card-header>

        <!-- Advanced Filter Panel -->
        <mat-expansion-panel class="filter-panel" [expanded]="showAdvancedFilters">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>filter_list</mat-icon>
              <span>Filtros Avanzados</span>
            </mat-panel-title>
          </mat-expansion-panel-header>
          <div class="filter-content">
            <div class="filter-grid">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Búsqueda Inteligente</mat-label>
                <input matInput 
                       [(ngModel)]="filter.search" 
                       (input)="applyFilters()"
                       placeholder="Paciente, doctor, diagnóstico, medicamento...">
                <mat-icon matSuffix>search</mat-icon>
                <mat-hint>Búsqueda por texto libre con IA</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Tipo de Registro</mat-label>
                <mat-select [(ngModel)]="filter.type" (selectionChange)="applyFilters()" multiple>
                  <mat-option value="consultation">Consultas</mat-option>
                  <mat-option value="prescription">Prescripciones</mat-option>
                  <mat-option value="vital-signs">Signos Vitales</mat-option>
                  <mat-option value="allergy">Alergias</mat-option>
                  <mat-option value="lab-results">Resultados de Laboratorio</mat-option>
                  <mat-option value="imaging">Imágenes</mat-option>
                  <mat-option value="procedure">Procedimientos</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Estado</mat-label>
                <mat-select [(ngModel)]="filter.status" (selectionChange)="applyFilters()">
                  <mat-option value="">Todos</mat-option>
                  <mat-option value="draft">Borrador</mat-option>
                  <mat-option value="completed">Completado</mat-option>
                  <mat-option value="reviewed">Revisado</mat-option>
                  <mat-option value="archived">Archivado</mat-option>
                </mat-select>
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
              
              <mat-form-field appearance="outline">
                <mat-label>Rango de Fechas</mat-label>
                <mat-date-range-input [rangePicker]="picker">
                  <input matStartDate placeholder="Fecha inicio" [(ngModel)]="filter.dateRange.start" (dateChange)="applyFilters()">
                  <input matEndDate placeholder="Fecha fin" [(ngModel)]="filter.dateRange.end" (dateChange)="applyFilters()">
                </mat-date-range-input>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-date-range-picker #picker></mat-date-range-picker>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Doctor</mat-label>
                <mat-select [(ngModel)]="filter.doctor" (selectionChange)="applyFilters()">
                  <mat-option value="">Todos</mat-option>
                  <mat-option *ngFor="let doctor of doctors" [value]="doctor.id">
                    {{ doctor.name }} - {{ doctor.specialty }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <div class="filter-actions">
              <button mat-stroked-button (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
                Limpiar Filtros
              </button>
              <button mat-stroked-button (click)="saveFilterPreset()">
                <mat-icon>save</mat-icon>
                Guardar Preset
              </button>
            </div>
          </div>
        </mat-expansion-panel>

        <!-- Content Tabs -->
        <mat-tab-group [(selectedIndex)]="selectedTab" class="content-tabs" dynamicHeight>
          <!-- Consultas Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>medical_information</mat-icon>
              <span matBadge="{{ getConsultationCount() }}" [matBadgeHidden]="getConsultationCount() === 0" matBadgeColor="primary" matBadgeSize="small">Consultas</span>
            </ng-template>
            <div class="tab-content">
              <div class="content-header-actions">
                <div class="view-controls">
                  <button mat-icon-button [class.active]="!isGridView" (click)="setView(false)">
                    <mat-icon>view_list</mat-icon>
                  </button>
                  <button mat-icon-button [class.active]="isGridView" (click)="setView(true)">
                    <mat-icon>view_module</mat-icon>
                  </button>
                </div>
                <div class="sort-controls">
                  <mat-form-field appearance="outline" class="sort-field">
                    <mat-label>Ordenar por</mat-label>
                    <mat-select [(ngModel)]="sortBy" (selectionChange)="applySorting()">
                      <mat-option value="date">Fecha</mat-option>
                      <mat-option value="patient">Paciente</mat-option>
                      <mat-option value="doctor">Doctor</mat-option>
                      <mat-option value="priority">Prioridad</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <button mat-icon-button (click)="toggleSortOrder()">
                    <mat-icon>{{ sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                  </button>
                </div>
              </div>

              <!-- List View -->
              <div class="records-list" *ngIf="!isGridView; else gridView">
                <div class="record-item" *ngFor="let record of filteredRecords" 
                     [class.selected]="selectedRecord?.id === record.id"
                     (click)="selectRecord(record)">
                  <div class="record-header">
                    <div class="record-patient">
                      <div class="patient-avatar">
                        <mat-icon>person</mat-icon>
                      </div>
                      <div class="patient-info">
                        <div class="patient-name">{{ record.patientName }}</div>
                        <div class="patient-details">{{ record.patientAge }} años • {{ record.patientGender }}</div>
                      </div>
                    </div>
                    <div class="record-meta">
                      <mat-chip class="type-chip" [ngClass]="'type-' + record.type">
                        {{ getTypeLabel(record.type) }}
                      </mat-chip>
                      <mat-chip class="priority-chip" [ngClass]="'priority-' + record.priority">
                        {{ getPriorityLabel(record.priority) }}
                      </mat-chip>
                      <mat-chip class="status-chip" [ngClass]="'status-' + record.status">
                        {{ getStatusLabel(record.status) }}
                      </mat-chip>
                    </div>
                  </div>
                  
                  <div class="record-content">
                    <div class="record-details">
                      <div class="detail-item">
                        <mat-icon>person_pin</mat-icon>
                        <span>{{ record.doctorName }}</span>
                        <small>{{ record.doctorSpecialty }}</small>
                      </div>
                      <div class="detail-item">
                        <mat-icon>schedule</mat-icon>
                        <span>{{ formatDateTime(record.date, record.time) }}</span>
                      </div>
                      <div class="detail-item" *ngIf="record.type === 'consultation'">
                        <mat-icon>medical_services</mat-icon>
                        <span>{{ getConsultationSummary(record) }}</span>
                      </div>
                    </div>
                    
                    <div class="record-actions">
                      <button mat-icon-button (click)="viewRecord(record); $event.stopPropagation()">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button (click)="editRecord(record); $event.stopPropagation()">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button [matMenuTriggerFor]="recordMenu" [matMenuTriggerData]="{record: record}" 
                              (click)="$event.stopPropagation()">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Grid View -->
              <ng-template #gridView>
                <div class="records-grid">
                  <mat-card class="record-card" *ngFor="let record of filteredRecords" 
                            [class.selected]="selectedRecord?.id === record.id"
                            (click)="selectRecord(record)">
                    <mat-card-header>
                      <div class="card-header-content">
                        <div class="patient-avatar">
                          <mat-icon>person</mat-icon>
                        </div>
                        <div class="patient-info">
                          <div class="patient-name">{{ record.patientName }}</div>
                          <div class="patient-details">{{ record.patientAge }} años</div>
                        </div>
                        <div class="record-badges">
                          <mat-chip class="type-chip" [ngClass]="'type-' + record.type">
                            {{ getTypeLabel(record.type) }}
                          </mat-chip>
                        </div>
                      </div>
                    </mat-card-header>
                    
                    <mat-card-content>
                      <div class="card-details">
                        <div class="detail-row">
                          <mat-icon>person_pin</mat-icon>
                          <span>{{ record.doctorName }}</span>
                        </div>
                        <div class="detail-row">
                          <mat-icon>schedule</mat-icon>
                          <span>{{ formatDateTime(record.date, record.time) }}</span>
                        </div>
                        <div class="detail-row" *ngIf="record.type === 'consultation'">
                          <mat-icon>medical_services</mat-icon>
                          <span>{{ getConsultationSummary(record) }}</span>
                        </div>
                      </div>
                    </mat-card-content>
                    
                    <mat-card-actions>
                      <button mat-icon-button (click)="viewRecord(record); $event.stopPropagation()">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button (click)="editRecord(record); $event.stopPropagation()">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button [matMenuTriggerFor]="recordMenu" [matMenuTriggerData]="{record: record}" 
                              (click)="$event.stopPropagation()">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                    </mat-card-actions>
                  </mat-card>
                </div>
              </ng-template>

              <!-- Pagination -->
              <mat-paginator 
                [pageSizeOptions]="[10, 25, 50, 100]" 
                showFirstLastButtons
                [length]="totalRecords"
                [pageSize]="pageSize"
                (page)="onPageChange($event)">
              </mat-paginator>
            </div>
          </mat-tab>

          <!-- Prescripciones Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>medication</mat-icon>
              <span matBadge="{{ getPrescriptionCount() }}" [matBadgeHidden]="getPrescriptionCount() === 0" matBadgeColor="accent" matBadgeSize="small">Prescripciones</span>
            </ng-template>
            <div class="tab-content">
              <div class="prescription-summary">
                <div class="summary-card">
                  <mat-icon>medication</mat-icon>
                  <div class="summary-content">
                    <div class="summary-title">Prescripciones Activas</div>
                    <div class="summary-value">{{ getActivePrescriptions() }}</div>
                  </div>
                </div>
                <div class="summary-card">
                  <mat-icon>warning</mat-icon>
                  <div class="summary-content">
                    <div class="summary-title">Próximas a Vencer</div>
                    <div class="summary-value">{{ getExpiringPrescriptions() }}</div>
                  </div>
                </div>
                <div class="summary-card">
                  <mat-icon>check_circle</mat-icon>
                  <div class="summary-content">
                    <div class="summary-title">Completadas</div>
                    <div class="summary-value">{{ getCompletedPrescriptions() }}</div>
                  </div>
                </div>
              </div>
              <!-- Prescription content here -->
            </div>
          </mat-tab>

          <!-- Signos Vitales Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>monitor_heart</mat-icon>
              <span>Signos Vitales</span>
            </ng-template>
            <div class="tab-content">
              <div class="vitals-dashboard">
                <div class="vitals-chart">
                  <h3>Evolución de Signos Vitales</h3>
                  <div class="chart-placeholder">
                    <mat-icon>show_chart</mat-icon>
                    <p>Gráfico de evolución temporal</p>
                  </div>
                </div>
                <div class="vitals-summary">
                  <h3>Resumen Actual</h3>
                  <div class="vital-item">
                    <mat-icon>favorite</mat-icon>
                    <div class="vital-info">
                      <div class="vital-label">Presión Arterial</div>
                      <div class="vital-value">120/80 mmHg</div>
                    </div>
                  </div>
                  <div class="vital-item">
                    <mat-icon>thermostat</mat-icon>
                    <div class="vital-info">
                      <div class="vital-label">Temperatura</div>
                      <div class="vital-value">36.5°C</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Alergias Tab -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>warning</mat-icon>
              <span>Alergias</span>
            </ng-template>
            <div class="tab-content">
              <div class="allergies-grid">
                <div class="allergy-card critical" *ngFor="let allergy of criticalAllergies">
                  <div class="allergy-header">
                    <mat-icon>warning</mat-icon>
                    <div class="allergy-info">
                      <div class="allergen">{{ allergy.allergen }}</div>
                      <div class="severity">{{ allergy.severity }}</div>
                    </div>
                  </div>
                  <div class="allergy-details">
                    <div class="reaction">{{ allergy.reaction }}</div>
                    <div class="patient">{{ allergy.patientName }}</div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>

      <!-- Record Action Menu -->
      <mat-menu #recordMenu="matMenu" class="record-menu">
        <ng-template matMenuContent let-record="record">
          <button mat-menu-item (click)="viewRecord(record)">
            <mat-icon>visibility</mat-icon>
            <span>Ver Detalles</span>
          </button>
          <button mat-menu-item (click)="editRecord(record)">
            <mat-icon>edit</mat-icon>
            <span>Editar</span>
          </button>
          <button mat-menu-item (click)="duplicateRecord(record)">
            <mat-icon>content_copy</mat-icon>
            <span>Duplicar</span>
          </button>
          <button mat-menu-item (click)="printRecord(record)">
            <mat-icon>print</mat-icon>
            <span>Imprimir</span>
          </button>
          <button mat-menu-item (click)="exportRecord(record)">
            <mat-icon>download</mat-icon>
            <span>Exportar</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="archiveRecord(record)" class="archive-action">
            <mat-icon>archive</mat-icon>
            <span>Archivar</span>
          </button>
          <button mat-menu-item (click)="deleteRecord(record)" class="delete-action">
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
      --border-radius: 16px;
      --border-radius-lg: 24px;
      --spacing-xs: 0.5rem;
      --spacing-sm: 1rem;
      --spacing-md: 1.5rem;
      --spacing-lg: 2rem;
      --spacing-xl: 3rem;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* ========================================
       MAIN CONTAINER & BACKGROUND
       ======================================== */
    .medical-records-container {
      position: relative;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      padding: var(--spacing-md);
      overflow-x: hidden;
    }

    .medical-records-container::before {
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
       HERO SECTION
       ======================================== */
    .hero-section {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-xl) 0;
      margin-bottom: var(--spacing-xl);
    }

    .hero-content {
      flex: 1;
      max-width: 600px;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 50px;
      backdrop-filter: blur(20px);
      margin-bottom: var(--spacing-md);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.1;
      color: var(--text-primary);
      margin-bottom: var(--spacing-sm);
      background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-lg);
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .primary-fab {
      width: 64px;
      height: 64px;
      background: var(--primary-gradient);
      box-shadow: var(--shadow-lg);
      transition: all 0.3s var(--transition-bounce);
    }

    .primary-fab:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);
    }

    .secondary-btn {
      color: var(--text-primary);
      border-color: var(--glass-border);
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--border-radius);
      transition: all 0.3s var(--transition-smooth);
    }

    .secondary-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
    }

    .hero-visual {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    .floating-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
      max-width: 400px;
    }

    .floating-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      padding: var(--spacing-md);
      backdrop-filter: blur(20px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--text-primary);
      animation: float 6s ease-in-out infinite;
      animation-delay: var(--delay);
      transition: all 0.3s var(--transition-smooth);
    }

    .floating-card:hover {
      transform: translateY(-8px) scale(1.05);
      background: rgba(255, 255, 255, 0.12);
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    /* ========================================
       ANALYTICS GRID
       ======================================== */
    .analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-xl);
    }

    .analytics-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius-lg);
      backdrop-filter: blur(20px);
      cursor: pointer;
      transition: all 0.3s var(--transition-smooth);
      overflow: hidden;
      position: relative;
    }

    .analytics-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary-gradient);
    }

    .analytics-card.success::before {
      background: var(--success-gradient);
    }

    .analytics-card.warning::before {
      background: var(--warning-gradient);
    }

    .analytics-card.info::before {
      background: var(--info-gradient);
    }

    .analytics-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-lg);
      background: rgba(255, 255, 255, 0.12);
    }

    .card-content {
      padding: var(--spacing-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .card-icon {
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }

    .icon-pulse {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      background: var(--primary-gradient);
      opacity: 0.3;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.1); opacity: 0.1; }
      100% { transform: scale(1); opacity: 0.3; }
    }

    .card-stats {
      flex: 1;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: var(--spacing-xs);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: 0.75rem;
      font-weight: 500;
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

    /* ========================================
       MAIN CONTENT CARD
       ======================================== */
    .main-content-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius-lg);
      backdrop-filter: blur(20px);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    .content-header {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      border-bottom: 1px solid var(--glass-border);
      padding: var(--spacing-lg);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .content-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
    }

    .content-subtitle {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .view-toggle,
    .filter-toggle {
      color: var(--text-secondary);
      transition: all 0.3s var(--transition-smooth);
    }

    .view-toggle:hover,
    .filter-toggle:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.1);
    }

    /* ========================================
       FILTER PANEL
       ======================================== */
    .filter-panel {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      backdrop-filter: blur(20px);
      margin: var(--spacing-md) 0;
    }

    .filter-panel .mat-expansion-panel-header {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      color: var(--text-primary);
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--border-radius) var(--border-radius) 0 0;
      font-weight: 600;
    }

    .filter-panel .mat-expansion-panel-header:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
    }

    .filter-content {
      padding: var(--spacing-lg);
      background: rgba(255, 255, 255, 0.02);
      border-radius: 0 0 var(--border-radius) var(--border-radius);
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .search-field {
      grid-column: 1 / -1;
    }

    .filter-actions {
      display: flex;
      gap: var(--spacing-sm);
      justify-content: flex-end;
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--glass-border);
    }

    /* ========================================
       FORM FIELDS STYLING
       ======================================== */
    .mat-form-field {
      width: 100%;
    }

    .mat-form-field .mat-form-field-wrapper {
      padding-bottom: 0;
    }

    .mat-form-field .mat-form-field-outline {
      color: var(--glass-border);
    }

    .mat-form-field .mat-form-field-outline-thick {
      color: rgba(102, 126, 234, 0.6);
    }

    .mat-form-field .mat-form-field-label {
      color: var(--text-secondary);
    }

    .mat-form-field.mat-focused .mat-form-field-label {
      color: rgba(102, 126, 234, 0.8);
    }

    .mat-form-field .mat-input-element {
      color: var(--text-primary);
    }

    .mat-form-field .mat-input-element::placeholder {
      color: var(--text-tertiary);
    }

    .mat-form-field .mat-hint {
      color: var(--text-tertiary);
    }

    .mat-form-field .mat-form-field-suffix {
      color: var(--text-tertiary);
    }

    .mat-form-field .mat-form-field-suffix:hover {
      color: var(--text-primary);
    }

    .mat-select {
      color: var(--text-primary);
    }

    .mat-select .mat-select-trigger {
      color: var(--text-primary);
    }

    .mat-select .mat-select-placeholder {
      color: var(--text-tertiary);
    }

    .mat-option {
      color: var(--text-primary);
      background: var(--glass-bg);
    }

    .mat-option:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .mat-option.mat-selected {
      background: rgba(102, 126, 234, 0.2);
    }

    /* ========================================
       CONTENT TABS
       ======================================== */
    .content-tabs {
      background: transparent;
    }

    .content-tabs .mat-tab-group {
      background: transparent;
    }

    .content-tabs .mat-tab-header {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
      border-bottom: 1px solid var(--glass-border);
      border-radius: var(--border-radius) var(--border-radius) 0 0;
    }

    .content-tabs .mat-tab-label {
      color: var(--text-secondary);
      font-weight: 600;
      padding: var(--spacing-md) var(--spacing-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      transition: all 0.3s var(--transition-smooth);
      border-radius: var(--border-radius) var(--border-radius) 0 0;
      margin-right: var(--spacing-xs);
    }

    .content-tabs .mat-tab-label:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .content-tabs .mat-tab-label.mat-tab-label-active {
      color: var(--text-primary);
      background: rgba(102, 126, 234, 0.1);
      border-bottom: 2px solid rgba(102, 126, 234, 0.6);
    }

    .content-tabs .mat-tab-label .mat-badge {
      margin-left: var(--spacing-xs);
    }

    .content-tabs .mat-ink-bar {
      background: var(--primary-gradient);
      height: 3px;
      border-radius: 2px;
    }

    .tab-content {
      padding: var(--spacing-lg);
      background: rgba(255, 255, 255, 0.02);
      border-radius: 0 0 var(--border-radius) var(--border-radius);
    }

    /* ========================================
       BUTTONS STYLING
       ======================================== */
    .mat-button,
    .mat-stroked-button,
    .mat-raised-button,
    .mat-flat-button {
      border-radius: var(--border-radius);
      font-weight: 600;
      text-transform: none;
      transition: all 0.3s var(--transition-smooth);
    }

    .mat-stroked-button {
      border: 1px solid var(--glass-border);
      color: var(--text-primary);
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
    }

    .mat-stroked-button:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .mat-raised-button,
    .mat-flat-button {
      background: var(--primary-gradient);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .mat-raised-button:hover,
    .mat-flat-button:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .mat-icon-button {
      color: var(--text-tertiary);
      transition: all 0.3s var(--transition-smooth);
      border-radius: 50%;
    }

    .mat-icon-button:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.1);
      transform: scale(1.1);
    }

    .mat-fab {
      background: var(--primary-gradient);
      color: white;
      box-shadow: var(--shadow-lg);
      transition: all 0.3s var(--transition-bounce);
    }

    .mat-fab:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);
    }

    /* ========================================
       CONTENT HEADER ACTIONS
       ======================================== */
    .content-header-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-md);
      background: rgba(255, 255, 255, 0.05);
      border-radius: var(--border-radius);
      border: 1px solid var(--glass-border);
    }

    .view-controls {
      display: flex;
      gap: var(--spacing-xs);
    }

    .view-controls button {
      color: var(--text-tertiary);
      transition: all 0.3s var(--transition-smooth);
    }

    .view-controls button.active {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.1);
    }

    .sort-controls {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .sort-field {
      min-width: 150px;
    }

    /* ========================================
       RECORDS LIST VIEW
       ======================================== */
    .records-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .record-item {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      padding: var(--spacing-lg);
      backdrop-filter: blur(20px);
      cursor: pointer;
      transition: all 0.3s var(--transition-smooth);
      position: relative;
      overflow: hidden;
    }

    .record-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--primary-gradient);
      transform: scaleY(0);
      transition: transform 0.3s var(--transition-smooth);
    }

    .record-item:hover {
      transform: translateX(8px);
      background: rgba(255, 255, 255, 0.12);
      box-shadow: var(--shadow-md);
    }

    .record-item:hover::before {
      transform: scaleY(1);
    }

    .record-item.selected {
      background: rgba(102, 126, 234, 0.1);
      border-color: rgba(102, 126, 234, 0.3);
    }

    .record-item.selected::before {
      transform: scaleY(1);
    }

    .record-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-md);
    }

    .record-patient {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .patient-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .patient-info {
      display: flex;
      flex-direction: column;
    }

    .patient-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 1.1rem;
    }

    .patient-details {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .record-meta {
      display: flex;
      gap: var(--spacing-xs);
      flex-wrap: wrap;
    }

    .record-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .record-details {
      display: flex;
      gap: var(--spacing-lg);
      flex-wrap: wrap;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .detail-item mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .record-actions {
      display: flex;
      gap: var(--spacing-xs);
    }

    .record-actions button {
      color: var(--text-tertiary);
      transition: all 0.3s var(--transition-smooth);
    }

    .record-actions button:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.1);
    }

    /* ========================================
       RECORDS GRID VIEW
       ======================================== */
    .records-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--spacing-md);
    }

    .record-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      backdrop-filter: blur(20px);
      cursor: pointer;
      transition: all 0.3s var(--transition-smooth);
      overflow: hidden;
    }

    .record-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      background: rgba(255, 255, 255, 0.12);
    }

    .record-card.selected {
      background: rgba(102, 126, 234, 0.1);
      border-color: rgba(102, 126, 234, 0.3);
    }

    .card-header-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .record-badges {
      margin-left: auto;
    }

    .card-details {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    /* ========================================
       CHIPS & BADGES
       ======================================== */
    .type-chip,
    .priority-chip,
    .status-chip {
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 20px;
      padding: 6px 14px;
      border: none;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: var(--shadow-sm);
      transition: all 0.3s var(--transition-smooth);
    }

    .type-chip:hover,
    .priority-chip:hover,
    .status-chip:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .mat-badge {
      font-size: 0.75rem;
      font-weight: 600;
    }

    .mat-badge-content {
      background: var(--primary-gradient);
      color: white;
      border: 2px solid var(--glass-bg);
      box-shadow: var(--shadow-sm);
    }

    .type-consultation { background: var(--info-gradient); }
    .type-prescription { background: var(--success-gradient); }
    .type-vital-signs { background: var(--warning-gradient); }
    .type-allergy { background: var(--error-gradient); }
    .type-lab-results { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); }
    .type-imaging { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); }
    .type-procedure { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

    .priority-urgent { background: var(--error-gradient); }
    .priority-high { background: var(--warning-gradient); }
    .priority-medium { background: var(--info-gradient); }
    .priority-low { background: var(--success-gradient); }

    .status-draft { background: rgba(255, 255, 255, 0.2); color: var(--text-tertiary); }
    .status-completed { background: var(--success-gradient); }
    .status-reviewed { background: var(--info-gradient); }
    .status-archived { background: rgba(255, 255, 255, 0.1); color: var(--text-tertiary); }

    /* ========================================
       PRESCRIPTION SUMMARY
       ======================================== */
    .prescription-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .summary-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      padding: var(--spacing-lg);
      backdrop-filter: blur(20px);
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .summary-card mat-icon {
      font-size: 2rem;
      color: var(--text-primary);
    }

    .summary-content {
      display: flex;
      flex-direction: column;
    }

    .summary-title {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    /* ========================================
       VITALS DASHBOARD
       ======================================== */
    .vitals-dashboard {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--spacing-lg);
    }

    .vitals-chart,
    .vitals-summary {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      padding: var(--spacing-lg);
      backdrop-filter: blur(20px);
    }

    .vitals-chart h3,
    .vitals-summary h3 {
      color: var(--text-primary);
      margin-bottom: var(--spacing-md);
      font-size: 1.25rem;
      font-weight: 600;
    }

    .chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--text-tertiary);
      text-align: center;
    }

    .chart-placeholder mat-icon {
      font-size: 3rem;
      margin-bottom: var(--spacing-sm);
    }

    .vital-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-md) 0;
      border-bottom: 1px solid var(--glass-border);
    }

    .vital-item:last-child {
      border-bottom: none;
    }

    .vital-item mat-icon {
      color: var(--text-primary);
      font-size: 1.5rem;
    }

    .vital-info {
      display: flex;
      flex-direction: column;
    }

    .vital-label {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin-bottom: var(--spacing-xs);
    }

    .vital-value {
      color: var(--text-primary);
      font-size: 1.25rem;
      font-weight: 600;
    }

    /* ========================================
       ALLERGIES GRID
       ======================================== */
    .allergies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--spacing-md);
    }

    .allergy-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      padding: var(--spacing-lg);
      backdrop-filter: blur(20px);
      transition: all 0.3s var(--transition-smooth);
    }

    .allergy-card.critical {
      border-left: 4px solid #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    .allergy-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .allergy-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
    }

    .allergy-header mat-icon {
      color: #ef4444;
      font-size: 1.5rem;
    }

    .allergy-info {
      display: flex;
      flex-direction: column;
    }

    .allergen {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 1.1rem;
    }

    .severity {
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .allergy-details {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
    }

    .reaction {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .patient {
      color: var(--text-tertiary);
      font-size: 0.75rem;
    }

    /* ========================================
       RECORD MENU
       ======================================== */
    .record-menu {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      backdrop-filter: blur(20px);
      box-shadow: var(--shadow-lg);
    }

    .record-menu .mat-menu-item {
      color: var(--text-primary);
      transition: all 0.3s var(--transition-smooth);
    }

    .record-menu .mat-menu-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .record-menu .archive-action {
      color: var(--warning-gradient);
    }

    .record-menu .delete-action {
      color: var(--error-gradient);
    }

    /* ========================================
       PAGINATION
       ======================================== */
    .mat-paginator {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
      color: var(--text-primary);
      border-top: 1px solid var(--glass-border);
      border-radius: 0 0 var(--border-radius) var(--border-radius);
      padding: var(--spacing-md) var(--spacing-lg);
    }

    .mat-paginator .mat-paginator-page-size-label,
    .mat-paginator .mat-paginator-range-label {
      color: var(--text-secondary);
      font-weight: 500;
    }

    .mat-paginator .mat-paginator-page-size-select {
      color: var(--text-primary);
    }

    .mat-paginator .mat-paginator-page-size-select .mat-select-trigger {
      color: var(--text-primary);
    }

    .mat-paginator .mat-icon-button {
      color: var(--text-tertiary);
      transition: all 0.3s var(--transition-smooth);
      border-radius: 50%;
    }

    .mat-paginator .mat-icon-button:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.1);
      transform: scale(1.1);
    }

    .mat-paginator .mat-icon-button:disabled {
      color: var(--text-tertiary);
      opacity: 0.5;
    }

    .mat-paginator .mat-paginator-navigation-previous,
    .mat-paginator .mat-paginator-navigation-next {
      color: var(--text-primary);
    }

    /* ========================================
       RESPONSIVE DESIGN
       ======================================== */
    @media (max-width: 1200px) {
      .hero-section {
        flex-direction: column;
        text-align: center;
        gap: var(--spacing-lg);
      }

      .hero-visual {
        order: -1;
      }

      .floating-cards {
        grid-template-columns: repeat(4, 1fr);
        max-width: 100%;
      }
    }

    @media (max-width: 768px) {
      .medical-records-container {
        padding: var(--spacing-sm);
      }

      .hero-title {
        font-size: 2.5rem;
      }

      .analytics-grid {
        grid-template-columns: 1fr;
      }

      .filter-grid {
        grid-template-columns: 1fr;
      }

      .content-header-actions {
        flex-direction: column;
        gap: var(--spacing-md);
        align-items: stretch;
      }

      .sort-controls {
        justify-content: space-between;
      }

      .records-grid {
        grid-template-columns: 1fr;
      }

      .vitals-dashboard {
        grid-template-columns: 1fr;
      }

      .floating-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .hero-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .floating-cards {
        grid-template-columns: 1fr;
      }

      .record-content {
        flex-direction: column;
        gap: var(--spacing-md);
        align-items: stretch;
      }

      .record-actions {
        justify-content: center;
      }
    }

    /* ========================================
       LOADING STATES
       ======================================== */
    .loading-spinner {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--spacing-xl);
    }

    .mat-progress-spinner {
      color: var(--primary-gradient);
    }

    /* ========================================
       GLOBAL MATERIAL DESIGN OVERRIDES
       ======================================== */
    .mat-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      backdrop-filter: blur(20px);
      box-shadow: var(--shadow-md);
    }

    .mat-card-header {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      border-radius: var(--border-radius) var(--border-radius) 0 0;
      padding: var(--spacing-lg);
    }

    .mat-card-title {
      color: var(--text-primary);
      font-weight: 700;
      font-size: 1.5rem;
    }

    .mat-card-subtitle {
      color: var(--text-secondary);
      font-weight: 500;
    }

    .mat-card-content {
      color: var(--text-primary);
      padding: var(--spacing-lg);
    }

    .mat-card-actions {
      padding: var(--spacing-lg);
      background: rgba(255, 255, 255, 0.02);
      border-radius: 0 0 var(--border-radius) var(--border-radius);
    }

    .mat-divider {
      border-top-color: var(--glass-border);
    }

    .mat-expansion-panel {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      backdrop-filter: blur(20px);
    }

    .mat-expansion-panel-body {
      background: rgba(255, 255, 255, 0.02);
    }

    .mat-menu-panel {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      backdrop-filter: blur(20px);
      box-shadow: var(--shadow-lg);
    }

    .mat-menu-item {
      color: var(--text-primary);
      transition: all 0.3s var(--transition-smooth);
    }

    .mat-menu-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .mat-snack-bar-container {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      backdrop-filter: blur(20px);
      color: var(--text-primary);
    }

    /* ========================================
       ACCESSIBILITY
       ======================================== */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Focus states for keyboard navigation */
    .record-item:focus,
    .record-card:focus,
    .analytics-card:focus {
      outline: 2px solid rgba(102, 126, 234, 0.5);
      outline-offset: 2px;
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      :host {
        --glass-bg: rgba(255, 255, 255, 0.15);
        --glass-border: rgba(255, 255, 255, 0.3);
      }
    }

    /* ========================================
       TYPOGRAPHY IMPROVEMENTS
       ======================================== */
    h1, h2, h3, h4, h5, h6 {
      color: var(--text-primary);
      font-weight: 700;
      line-height: 1.2;
    }

    p, span, div {
      color: var(--text-primary);
    }

    small {
      color: var(--text-tertiary);
    }

    /* ========================================
       SCROLLBAR STYLING
       ======================================== */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: var(--glass-border);
      border-radius: 4px;
      transition: all 0.3s var(--transition-smooth);
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `]
})
export class MedicalRecordsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Data properties
  medicalRecords: MedicalRecord[] = [];
  filteredRecords: MedicalRecord[] = [];
  criticalAllergies: AllergyRecord[] = [];
  doctors: any[] = [];
  
  // UI state
  selectedRecord: MedicalRecord | null = null;
  selectedTab = 0;
  loading = false;
  showAdvancedFilters = false;
  isGridView = false;
  hasActiveFilters = false;
  
  // Pagination
  pageSize = 10;
  totalRecords = 0;
  
  // Filtering and sorting
  filter: MedicalRecordFilter = {
    search: '',
    type: '',
    status: '',
    priority: '',
    dateRange: { start: null, end: null },
    doctor: '',
    patient: ''
  };
  
  sortBy = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Floating cards for hero section
  floatingCards = [
    { icon: 'medical_information', label: 'Consultas' },
    { icon: 'medication', label: 'Prescripciones' },
    { icon: 'monitor_heart', label: 'Signos Vitales' },
    { icon: 'warning', label: 'Alergias' },
    { icon: 'science', label: 'Laboratorio' },
    { icon: 'radiology', label: 'Imágenes' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadMedicalRecords();
    this.loadDoctors();
    this.loadCriticalAllergies();
  }

  // Data loading methods
  loadMedicalRecords() {
    this.loading = true;
    // Simulate API call
    setTimeout(() => {
      this.medicalRecords = this.generateMockRecords();
      this.applyFilters();
      this.loading = false;
    }, 1000);
  }

  loadDoctors() {
    this.doctors = [
      { id: '1', name: 'Dr. María García', specialty: 'Medicina General' },
      { id: '2', name: 'Dr. Carlos Ruiz', specialty: 'Cardiología' },
      { id: '3', name: 'Dr. Ana López', specialty: 'Pediatría' },
      { id: '4', name: 'Dr. Luis Martínez', specialty: 'Neurología' },
      { id: '5', name: 'Dr. Carmen Vega', specialty: 'Dermatología' }
    ];
  }

  loadCriticalAllergies() {
    this.criticalAllergies = [
      {
        id: '1',
        patientId: 'P001',
        patientName: 'Juan Pérez',
        patientAge: 45,
        patientGender: 'M',
        doctorId: 'D001',
        doctorName: 'Dr. María García',
        doctorSpecialty: 'Medicina General',
        date: '2025-01-15',
        time: '10:00',
        type: 'allergy',
        priority: 'urgent',
        status: 'completed',
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
        createdBy: 'D001',
        lastModifiedBy: 'D001',
        allergen: 'Penicilina',
        reaction: 'Anafilaxia severa',
        severity: 'life-threatening',
        onsetDate: '2020-03-15',
        allergyStatus: 'active',
        notes: 'Reacción alérgica severa que requiere atención inmediata'
      },
      {
        id: '2',
        patientId: 'P002',
        patientName: 'Ana López',
        patientAge: 32,
        patientGender: 'F',
        doctorId: 'D002',
        doctorName: 'Dr. Carlos Ruiz',
        doctorSpecialty: 'Cardiología',
        date: '2025-01-14',
        time: '14:30',
        type: 'allergy',
        priority: 'high',
        status: 'completed',
        createdAt: '2025-01-14T14:30:00Z',
        updatedAt: '2025-01-14T14:30:00Z',
        createdBy: 'D002',
        lastModifiedBy: 'D002',
        allergen: 'Mariscos',
        reaction: 'Urticaria generalizada',
        severity: 'severe',
        onsetDate: '2018-07-20',
        allergyStatus: 'active',
        notes: 'Evitar completamente el consumo de mariscos'
      }
    ];
  }

  generateMockRecords(): MedicalRecord[] {
    const records: MedicalRecord[] = [];
    const types: MedicalRecord['type'][] = ['consultation', 'prescription', 'vital-signs', 'allergy', 'lab-results'];
    const priorities: MedicalRecord['priority'][] = ['low', 'medium', 'high', 'urgent'];
    const statuses: MedicalRecord['status'][] = ['draft', 'completed', 'reviewed', 'archived'];
    const patients = ['Juan Pérez', 'Ana López', 'Carlos Rodríguez', 'María González', 'Luis Martínez'];
    const doctors = ['Dr. María García', 'Dr. Carlos Ruiz', 'Dr. Ana López', 'Dr. Luis Martínez', 'Dr. Carmen Vega'];
    const specialties = ['Medicina General', 'Cardiología', 'Pediatría', 'Neurología', 'Dermatología'];

    for (let i = 1; i <= 50; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      const specialty = specialties[Math.floor(Math.random() * specialties.length)];

      records.push({
        id: i.toString(),
        patientId: `P${i.toString().padStart(3, '0')}`,
        patientName: patient,
        patientAge: 25 + Math.floor(Math.random() * 50),
        patientGender: Math.random() > 0.5 ? 'M' : 'F',
        doctorId: `D${Math.floor(Math.random() * 5) + 1}`,
        doctorName: doctor,
        doctorSpecialty: specialty,
        date: new Date(2025, 0, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
        time: `${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        type,
        priority,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: `D${Math.floor(Math.random() * 5) + 1}`,
        lastModifiedBy: `D${Math.floor(Math.random() * 5) + 1}`
      });
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Filter and search methods
  applyFilters() {
    let filtered = [...this.medicalRecords];

    if (this.filter.search) {
      const searchTerm = this.filter.search.toLowerCase();
      filtered = filtered.filter(record =>
        record.patientName.toLowerCase().includes(searchTerm) ||
        record.doctorName.toLowerCase().includes(searchTerm) ||
        record.doctorSpecialty.toLowerCase().includes(searchTerm)
      );
    }

    if (this.filter.type) {
      filtered = filtered.filter(record => record.type === this.filter.type);
    }

    if (this.filter.status) {
      filtered = filtered.filter(record => record.status === this.filter.status);
    }

    if (this.filter.priority) {
      filtered = filtered.filter(record => record.priority === this.filter.priority);
    }

    if (this.filter.doctor) {
      filtered = filtered.filter(record => record.doctorId === this.filter.doctor);
    }

    if (this.filter.dateRange.start && this.filter.dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= this.filter.dateRange.start! && recordDate <= this.filter.dateRange.end!;
      });
    }

    this.filteredRecords = filtered;
    this.totalRecords = filtered.length;
    this.hasActiveFilters = this.hasAnyActiveFilters();
  }

  hasAnyActiveFilters(): boolean {
    return !!(
      this.filter.search ||
      this.filter.type ||
      this.filter.status ||
      this.filter.priority ||
      this.filter.doctor ||
      this.filter.dateRange.start ||
      this.filter.dateRange.end
    );
  }

  clearFilters() {
    this.filter = {
      search: '',
      type: '',
      status: '',
      priority: '',
      dateRange: { start: null, end: null },
      doctor: '',
      patient: ''
    };
    this.applyFilters();
  }

  saveFilterPreset() {
    // Implementation for saving filter presets
    this.snackBar.open('Preset de filtros guardado', 'Cerrar', { duration: 3000 });
  }

  // Sorting methods
  applySorting() {
    this.filteredRecords.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'patient':
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case 'doctor':
          comparison = a.doctorName.localeCompare(b.doctorName);
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        default:
          comparison = 0;
      }
      
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applySorting();
  }

  // UI interaction methods
  selectRecord(record: MedicalRecord) {
    this.selectedRecord = record;
  }

  toggleView() {
    this.isGridView = !this.isGridView;
  }

  setView(isGrid: boolean) {
    this.isGridView = isGrid;
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // Statistics methods
  getTotalConsultations(): number {
    return this.medicalRecords.filter(r => r.type === 'consultation').length;
  }

  getActivePrescriptions(): number {
    return this.medicalRecords.filter(r => r.type === 'prescription' && r.status === 'completed').length;
  }

  getVitalSignsRecords(): number {
    return this.medicalRecords.filter(r => r.type === 'vital-signs').length;
  }

  getCriticalAllergies(): number {
    return this.criticalAllergies.filter(a => a.severity === 'life-threatening' || a.severity === 'severe').length;
  }

  getConsultationCount(): number {
    return this.filteredRecords.filter(r => r.type === 'consultation').length;
  }

  getPrescriptionCount(): number {
    return this.filteredRecords.filter(r => r.type === 'prescription').length;
  }

  getExpiringPrescriptions(): number {
    // Mock implementation
    return Math.floor(Math.random() * 10);
  }

  getCompletedPrescriptions(): number {
    return this.medicalRecords.filter(r => r.type === 'prescription' && r.status === 'completed').length;
  }

  // Utility methods
  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'consultation': 'Consulta',
      'prescription': 'Prescripción',
      'vital-signs': 'Signos Vitales',
      'allergy': 'Alergia',
      'lab-results': 'Laboratorio',
      'imaging': 'Imagen',
      'procedure': 'Procedimiento'
    };
    return labels[type] || type;
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'urgent': 'Urgente',
      'high': 'Alta',
      'medium': 'Media',
      'low': 'Baja'
    };
    return labels[priority] || priority;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Borrador',
      'completed': 'Completado',
      'reviewed': 'Revisado',
      'archived': 'Archivado'
    };
    return labels[status] || status;
  }

  formatDateTime(date: string, time: string): string {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return `${formattedDate} - ${time}`;
  }

  getConsultationSummary(record: MedicalRecord): string {
    // Mock implementation - in real app, this would come from the record data
    const summaries = [
      'Control de presión arterial',
      'Seguimiento diabetes',
      'Consulta de rutina',
      'Revisión post-operatoria',
      'Evaluación cardiológica'
    ];
    return summaries[Math.floor(Math.random() * summaries.length)];
  }

  // Action methods
  openNewRecordDialog() {
    this.snackBar.open('Abrir diálogo de nuevo registro', 'Cerrar', { duration: 3000 });
  }

  openBulkImportDialog() {
    this.snackBar.open('Abrir diálogo de importación masiva', 'Cerrar', { duration: 3000 });
  }

  viewRecord(record: MedicalRecord) {
    this.snackBar.open(`Ver registro: ${record.id}`, 'Cerrar', { duration: 3000 });
  }

  editRecord(record: MedicalRecord) {
    this.snackBar.open(`Editar registro: ${record.id}`, 'Cerrar', { duration: 3000 });
  }

  duplicateRecord(record: MedicalRecord) {
    this.snackBar.open(`Duplicar registro: ${record.id}`, 'Cerrar', { duration: 3000 });
  }

  printRecord(record: MedicalRecord) {
    this.snackBar.open(`Imprimir registro: ${record.id}`, 'Cerrar', { duration: 3000 });
  }

  exportRecord(record: MedicalRecord) {
    this.snackBar.open(`Exportar registro: ${record.id}`, 'Cerrar', { duration: 3000 });
  }

  archiveRecord(record: MedicalRecord) {
    this.snackBar.open(`Archivar registro: ${record.id}`, 'Cerrar', { duration: 3000 });
  }

  deleteRecord(record: MedicalRecord) {
    this.snackBar.open(`Eliminar registro: ${record.id}`, 'Cerrar', { duration: 3000 });
  }

  navigateToAnalytics(type: string) {
    this.snackBar.open(`Navegar a analytics: ${type}`, 'Cerrar', { duration: 3000 });
  }

  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    // Implementation for pagination
  }
}
