import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';

export interface Payment {
  id: string;
  patientName: string;
  amount: number;
  date: string;
  method: 'card' | 'cash' | 'transfer' | 'insurance';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule
  ],
  template: `
    <div class="payments-container">
      <mat-card class="header-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>payment</mat-icon>
            Gestión de Pagos
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Buscar</mat-label>
              <input matInput placeholder="Paciente o descripción">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            Nuevo Pago
          </button>
        </mat-card-actions>
      </mat-card>

      <div class="stats-cards">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">euro</mat-icon>
              <div class="stat-info">
                <div class="stat-value">€2,450.00</div>
                <div class="stat-label">Total del Mes</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">check_circle</mat-icon>
              <div class="stat-info">
                <div class="stat-value">24</div>
                <div class="stat-label">Pagos Completados</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">pending</mat-icon>
              <div class="stat-info">
                <div class="stat-value">3</div>
                <div class="stat-label">Pendientes</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="table-card">
        <mat-card-content>
          <table mat-table [dataSource]="payments" class="payments-table">
            <ng-container matColumnDef="patientName">
              <th mat-header-cell *matHeaderCellDef>Paciente</th>
              <td mat-cell *matCellDef="let payment">{{ payment.patientName }}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Importe</th>
              <td mat-cell *matCellDef="let payment">€{{ payment.amount.toFixed(2) }}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Fecha</th>
              <td mat-cell *matCellDef="let payment">{{ payment.date }}</td>
            </ng-container>

            <ng-container matColumnDef="method">
              <th mat-header-cell *matHeaderCellDef>Método</th>
              <td mat-cell *matCellDef="let payment">
                <mat-chip [color]="getMethodColor(payment.method)">
                  {{ getMethodText(payment.method) }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let payment">
                <span class="status-badge" [ngClass]="'status-' + payment.status">
                  {{ getStatusText(payment.status) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Descripción</th>
              <td mat-cell *matCellDef="let payment">{{ payment.description }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let payment">
                <button mat-icon-button color="primary" title="Ver detalles">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="accent" title="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" title="Reembolsar" *ngIf="payment.status === 'completed'">
                  <mat-icon>undo</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" showFirstLastButtons></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .payments-container {
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

    .stats-cards {
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

    .table-card {
      margin-bottom: 20px;
    }

    .payments-table {
      width: 100%;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-completed {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-failed {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-refunded {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filters mat-form-field {
        min-width: 100%;
      }

      .stats-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PaymentsComponent implements OnInit {
  displayedColumns: string[] = ['patientName', 'amount', 'date', 'method', 'status', 'description', 'actions'];
  payments: Payment[] = [
    {
      id: '1',
      patientName: 'Juan Pérez',
      amount: 150.00,
      date: '2025-10-01',
      method: 'card',
      status: 'completed',
      description: 'Consulta general'
    },
    {
      id: '2',
      patientName: 'Ana López',
      amount: 75.50,
      date: '2025-09-28',
      method: 'cash',
      status: 'completed',
      description: 'Revisión médica'
    },
    {
      id: '3',
      patientName: 'Pedro Martín',
      amount: 200.00,
      date: '2025-09-25',
      method: 'insurance',
      status: 'pending',
      description: 'Consulta especializada'
    }
  ];

  ngOnInit() {
    console.log('Payments component initialized');
  }

  getMethodText(method: string): string {
    const methodMap: { [key: string]: string } = {
      'card': 'Tarjeta',
      'cash': 'Efectivo',
      'transfer': 'Transferencia',
      'insurance': 'Seguro'
    };
    return methodMap[method] || method;
  }

  getMethodColor(method: string): string {
    const colorMap: { [key: string]: string } = {
      'card': 'primary',
      'cash': 'accent',
      'transfer': 'warn',
      'insurance': 'primary'
    };
    return colorMap[method] || 'primary';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'completed': 'Completado',
      'failed': 'Fallido',
      'refunded': 'Reembolsado'
    };
    return statusMap[status] || status;
  }
}
