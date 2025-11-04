import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingPayments: number;
  systemAlerts: number;
}

export interface RecentActivity {
  id: string;
  type: 'appointment' | 'payment' | 'patient' | 'system';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatChipsModule
  ],
  template: `
    <div class="dashboard-wrapper">
      <!-- Animated Background -->
      <div class="dashboard-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <div class="dashboard-container">
        <!-- Welcome Hero Section -->
        <div class="welcome-hero">
          <div class="hero-glass">
            <div class="hero-content">
              <div class="hero-text">
                <div class="greeting-badge">
                  <mat-icon>wb_sunny</mat-icon>
                  <span>Buenos días</span>
                </div>
                <h1 class="hero-title">Panel de Control Médico</h1>
                <p class="hero-subtitle">SMD VITAL - Sistema de Gestión Integral</p>
              </div>
              <div class="hero-actions">
                <button mat-flat-button class="primary-action">
                  <mat-icon>add_circle</mat-icon>
                  <span>Nueva Cita</span>
                </button>
                <button mat-stroked-button class="secondary-action">
                  <mat-icon>refresh</mat-icon>
                  <span>Actualizar</span>
                </button>
              </div>
            </div>
            <div class="hero-decoration">
              <div class="decoration-circle"></div>
              <div class="decoration-pulse"></div>
            </div>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card" *ngFor="let stat of statsArray; let i = index" [style.--delay]="i * 0.1 + 's'">
            <div class="stat-glass">
              <div class="stat-header">
                <div class="stat-icon-wrapper" [class]="'icon-' + getStatClass(i)">
                  <mat-icon>{{ stat.icon }}</mat-icon>
                  <div class="icon-glow"></div>
                </div>
                <div class="stat-trend" [class]="stat.changeClass">
                  <mat-icon>{{ stat.changeIcon }}</mat-icon>
                  <span>{{ stat.change }}</span>
                </div>
              </div>
              <div class="stat-body">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
              <div class="stat-footer">
                <div class="progress-bar">
                  <div class="progress-fill" [style.--progress]="getProgress(i) + '%'"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="content-grid">
          <!-- Chart Card -->
          <div class="chart-section">
            <div class="section-glass">
              <div class="section-header">
                <div class="header-content">
                  <div class="header-icon">
                    <mat-icon>bar_chart</mat-icon>
                  </div>
                  <div class="header-text">
                    <h2>Estadísticas Mensuales</h2>
                    <p>Citas y rendimiento del sistema</p>
                  </div>
                </div>
                <button mat-icon-button class="header-action">
                  <mat-icon>more_vert</mat-icon>
                </button>
              </div>
              <div class="section-body">
                <div class="chart-container">
                  <div class="chart-visual">
                    <mat-icon class="chart-icon">show_chart</mat-icon>
                    <div class="chart-bars">
                      <div class="chart-bar" *ngFor="let bar of chartData" [style.--height]="bar + '%'">
                        <div class="bar-fill"></div>
                      </div>
                    </div>
                  </div>
                  <div class="chart-legend">
                    <div class="legend-item">
                      <div class="legend-color primary"></div>
                      <span>Citas Completadas</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color secondary"></div>
                      <span>Citas Pendientes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Feed -->
          <div class="activity-section">
            <div class="section-glass">
              <div class="section-header">
                <div class="header-content">
                  <div class="header-icon">
                    <mat-icon>timeline</mat-icon>
                  </div>
                  <div class="header-text">
                    <h2>Actividad Reciente</h2>
                    <p>Últimas actualizaciones</p>
                  </div>
                </div>
                <button mat-icon-button class="header-action">
                  <mat-icon>filter_list</mat-icon>
                </button>
              </div>
              <div class="section-body">
                <div class="activity-feed">
                  <div class="activity-item" *ngFor="let activity of recentActivities" [class]="'activity-' + activity.status">
                    <div class="activity-timeline">
                      <div class="timeline-dot"></div>
                      <div class="timeline-line"></div>
                    </div>
                    <div class="activity-content">
                      <div class="activity-header">
                        <div class="activity-icon-wrapper">
                          <mat-icon>{{ getActivityIcon(activity.type) }}</mat-icon>
                        </div>
                        <div class="activity-time">{{ activity.time }}</div>
                      </div>
                      <div class="activity-body">
                        <h4>{{ activity.title }}</h4>
                        <p>{{ activity.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions-section">
          <div class="section-title">
            <h2>Acciones Rápidas</h2>
            <p>Accede a las funciones principales del sistema</p>
          </div>
          <div class="quick-actions-grid">
            <div class="action-card" *ngFor="let action of quickActions" (click)="navigateToAction(action.route)">
              <div class="action-glass">
                <div class="action-icon-wrapper">
                  <mat-icon>{{ action.icon }}</mat-icon>
                  <div class="action-icon-glow"></div>
                </div>
                <div class="action-content">
                  <h3>{{ action.title }}</h3>
                  <p>{{ action.description }}</p>
                </div>
                <div class="action-arrow">
                  <mat-icon>arrow_forward</mat-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Alerts -->
        <div class="alerts-section" *ngIf="systemAlerts.length > 0">
          <div class="section-glass">
            <div class="section-header">
              <div class="header-content">
                <div class="header-icon warning">
                  <mat-icon>warning</mat-icon>
                </div>
                <div class="header-text">
                  <h2>Alertas del Sistema</h2>
                  <p>{{ systemAlerts.length }} notificaciones pendientes</p>
                </div>
              </div>
            </div>
            <div class="section-body">
              <div class="alerts-list">
                <div class="alert-item" *ngFor="let alert of systemAlerts" [class]="'alert-' + alert.type">
                  <div class="alert-icon">
                    <mat-icon>{{ getAlertIcon(alert.type) }}</mat-icon>
                  </div>
                  <div class="alert-content">
                    <h4>{{ alert.title }}</h4>
                    <p>{{ alert.message }}</p>
                  </div>
                  <button mat-icon-button class="alert-dismiss" (click)="dismissAlert(alert)">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    .dashboard-wrapper {
      position: relative;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      overflow-x: hidden;
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
       WELCOME HERO
       ======================================== */
    .welcome-hero {
      animation: slideDown 0.6s var(--transition-bounce);
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .hero-glass {
      position: relative;
      background: var(--glass-bg);
      backdrop-filter: blur(30px);
      border-radius: 32px;
      border: 1px solid var(--glass-border);
      padding: 3rem;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }

    .hero-glass::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--primary-gradient);
    }

    .hero-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .greeting-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--warning-gradient);
      border-radius: 100px;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
      box-shadow: var(--shadow-md);
    }

    .greeting-badge mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .hero-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.125rem;
      color: var(--text-secondary);
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
    }

    .primary-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      background: var(--primary-gradient);
      border: none;
      border-radius: 16px;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.3s var(--transition-smooth);
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    }

    .primary-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
    }

    .secondary-action {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      background: transparent;
      border: 2px solid var(--glass-border);
      border-radius: 16px;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.3s var(--transition-smooth);
      backdrop-filter: blur(10px);
    }

    .secondary-action:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--text-primary);
      transform: translateY(-2px);
    }

    .hero-decoration {
      position: absolute;
      right: 3rem;
      top: 50%;
      transform: translateY(-50%);
      width: 200px;
      height: 200px;
      opacity: 0.1;
    }

    .decoration-circle {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--primary-gradient);
    }

    .decoration-pulse {
      position: absolute;
      inset: -20px;
      border-radius: 50%;
      background: var(--primary-gradient);
      animation: pulse 3s ease-in-out infinite;
      opacity: 0.5;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.2); opacity: 0.2; }
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
      border-radius: 16px;
      background: inherit;
      filter: blur(8px);
      opacity: 0.5;
      z-index: 1;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.375rem 0.75rem;
      border-radius: 100px;
      font-size: 0.875rem;
      font-weight: 600;
      backdrop-filter: blur(10px);
    }

    .stat-trend.positive {
      background: rgba(74, 222, 128, 0.2);
      color: #4ade80;
    }

    .stat-trend.negative {
      background: rgba(248, 113, 113, 0.2);
      color: #f87171;
    }

    .stat-trend mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .stat-body {
      flex: 1;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-footer {
      margin-top: auto;
    }

    .progress-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 100px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      width: var(--progress);
      background: var(--primary-gradient);
      border-radius: 100px;
      transition: width 1s var(--transition-smooth);
    }

    /* ========================================
       CONTENT GRID
       ======================================== */
    .content-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2rem;
    }

    .section-glass {
      background: var(--glass-bg);
      backdrop-filter: blur(30px);
      border-radius: 24px;
      border: 1px solid var(--glass-border);
      overflow: hidden;
      box-shadow: var(--shadow-md);
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--glass-border);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-gradient);
      border-radius: 12px;
      box-shadow: var(--shadow-md);
    }

    .header-icon.warning {
      background: var(--warning-gradient);
    }

    .header-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: var(--text-primary);
    }

    .header-text h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .header-text p {
      font-size: 0.875rem;
      color: var(--text-tertiary);
    }

    .header-action {
      color: var(--text-secondary);
      transition: all 0.3s var(--transition-smooth);
    }

    .header-action:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.1);
    }

    .section-body {
      flex: 1;
      padding: 1.5rem;
      overflow: auto;
    }

    /* Chart Section */
    .chart-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      height: 100%;
    }

    .chart-visual {
      position: relative;
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 1rem;
      padding: 2rem 0;
      min-height: 300px;
    }

    .chart-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 120px;
      width: 120px;
      height: 120px;
      color: rgba(255, 255, 255, 0.03);
      z-index: 0;
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      gap: 1rem;
      height: 100%;
      z-index: 1;
    }

    .chart-bar {
      flex: 1;
      max-width: 60px;
      height: var(--height);
      position: relative;
      animation: barGrow 1s var(--transition-smooth);
    }

    @keyframes barGrow {
      from { height: 0; }
      to { height: var(--height); }
    }

    .bar-fill {
      width: 100%;
      height: 100%;
      background: var(--primary-gradient);
      border-radius: 8px 8px 0 0;
      box-shadow: var(--shadow-md);
      transition: all 0.3s var(--transition-smooth);
    }

    .chart-bar:hover .bar-fill {
      transform: scaleY(1.05);
      box-shadow: var(--shadow-lg);
    }

    .chart-legend {
      display: flex;
      gap: 2rem;
      justify-content: center;
      padding-top: 1rem;
      border-top: 1px solid var(--glass-border);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
    }

    .legend-color.primary {
      background: var(--primary-gradient);
    }

    .legend-color.secondary {
      background: var(--success-gradient);
    }

    /* Activity Feed */
    .activity-feed {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .activity-item {
      display: flex;
      gap: 1rem;
      padding: 1rem 0;
      position: relative;
    }

    .activity-timeline {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 32px;
    }

    .timeline-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--primary-gradient);
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
      z-index: 2;
    }

    .activity-success .timeline-dot {
      background: var(--success-gradient);
      box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.2);
    }

    .activity-warning .timeline-dot {
      background: var(--warning-gradient);
      box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.2);
    }

    .activity-error .timeline-dot {
      background: var(--error-gradient);
      box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.2);
    }

    .activity-info .timeline-dot {
      background: var(--info-gradient);
      box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.2);
    }

    .timeline-line {
      flex: 1;
      width: 2px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), transparent);
      margin-top: 4px;
    }

    .activity-item:last-child .timeline-line {
      display: none;
    }

    .activity-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .activity-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .activity-icon-wrapper {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    }

    .activity-icon-wrapper mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--text-primary);
    }

    .activity-time {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    .activity-body h4 {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .activity-body p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* ========================================
       QUICK ACTIONS
       ======================================== */
    .quick-actions-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .section-title h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .section-title p {
      font-size: 1rem;
      color: var(--text-secondary);
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      cursor: pointer;
      animation: fadeInScale 0.6s var(--transition-smooth);
    }

    @keyframes fadeInScale {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .action-glass {
      position: relative;
      background: var(--glass-bg);
      backdrop-filter: blur(30px);
      border-radius: 20px;
      border: 1px solid var(--glass-border);
      padding: 1.5rem;
      transition: all 0.4s var(--transition-smooth);
      overflow: hidden;
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .action-glass::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--primary-gradient);
      opacity: 0;
      transition: opacity 0.4s var(--transition-smooth);
    }

    .action-card:hover .action-glass {
      transform: translateY(-4px);
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: var(--shadow-lg);
    }

    .action-card:hover .action-glass::before {
      opacity: 0.05;
    }

    .action-icon-wrapper {
      position: relative;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-gradient);
      border-radius: 16px;
      box-shadow: var(--shadow-md);
      flex-shrink: 0;
      transition: all 0.4s var(--transition-smooth);
    }

    .action-card:hover .action-icon-wrapper {
      transform: scale(1.1) rotate(5deg);
      box-shadow: var(--shadow-lg);
    }

    .action-icon-wrapper mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--text-primary);
      z-index: 2;
    }

    .action-icon-glow {
      position: absolute;
      inset: -4px;
      border-radius: 16px;
      background: inherit;
      filter: blur(12px);
      opacity: 0.6;
      z-index: 1;
    }

    .action-content {
      flex: 1;
      position: relative;
      z-index: 1;
    }

    .action-content h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
      transition: color 0.3s var(--transition-smooth);
    }

    .action-card:hover .action-content h3 {
      color: #667eea;
    }

    .action-content p {
      font-size: 0.875rem;
      color: var(--text-tertiary);
      line-height: 1.5;
    }

    .action-arrow {
      position: relative;
      z-index: 1;
      color: var(--text-secondary);
      transition: all 0.4s var(--transition-smooth);
    }

    .action-arrow mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .action-card:hover .action-arrow {
      color: var(--text-primary);
      transform: translateX(4px);
    }

    /* ========================================
       ALERTS SECTION
       ======================================== */
    .alerts-section {
      animation: slideUp 0.6s var(--transition-smooth);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 16px;
      border-left: 4px solid;
      transition: all 0.3s var(--transition-smooth);
      backdrop-filter: blur(10px);
    }

    .alert-warning {
      background: rgba(251, 191, 36, 0.1);
      border-left-color: #fbbf24;
    }

    .alert-error {
      background: rgba(248, 113, 113, 0.1);
      border-left-color: #f87171;
    }

    .alert-info {
      background: rgba(96, 165, 250, 0.1);
      border-left-color: #60a5fa;
    }

    .alert-item:hover {
      transform: translateX(4px);
      box-shadow: var(--shadow-sm);
    }

    .alert-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .alert-warning .alert-icon {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }

    .alert-error .alert-icon {
      background: rgba(248, 113, 113, 0.2);
      color: #f87171;
    }

    .alert-info .alert-icon {
      background: rgba(96, 165, 250, 0.2);
      color: #60a5fa;
    }

    .alert-icon mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .alert-content {
      flex: 1;
    }

    .alert-content h4 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .alert-content p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .alert-dismiss {
      color: var(--text-tertiary);
      transition: all 0.3s var(--transition-smooth);
      flex-shrink: 0;
    }

    .alert-dismiss:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.1);
      transform: rotate(90deg);
    }

    /* ========================================
       SCROLLBAR STYLING
       ======================================== */
    .section-body::-webkit-scrollbar {
      width: 6px;
    }

    .section-body::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 100px;
    }

    .section-body::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 100px;
      transition: background 0.3s var(--transition-smooth);
    }

    .section-body::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* ========================================
       RESPONSIVE DESIGN
       ======================================== */
    @media (max-width: 1400px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .chart-section {
        order: 1;
      }

      .activity-section {
        order: 2;
      }
    }

    @media (max-width: 1024px) {
      .dashboard-container {
        padding: 1.5rem;
      }

      .hero-glass {
        padding: 2rem;
      }

      .hero-content {
        flex-direction: column;
        gap: 2rem;
        text-align: center;
      }

      .hero-actions {
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }

      .quick-actions-grid {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
        gap: 1.5rem;
      }

      .hero-glass {
        padding: 1.5rem;
      }

      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .hero-decoration {
        display: none;
      }

      .hero-actions {
        flex-direction: column;
        width: 100%;
      }

      .primary-action,
      .secondary-action {
        width: 100%;
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .section-header {
        padding: 1rem;
      }

      .section-body {
        padding: 1rem;
      }

      .header-text h2 {
        font-size: 1.125rem;
      }

      .chart-visual {
        min-height: 200px;
      }

      .quick-actions-grid {
        grid-template-columns: 1fr;
      }

      .action-glass {
        padding: 1.25rem;
      }
    }

    @media (max-width: 480px) {
      .greeting-badge {
        font-size: 0.75rem;
        padding: 0.375rem 0.75rem;
      }

      .hero-title {
        font-size: 1.75rem;
      }

      .hero-subtitle {
        font-size: 0.9375rem;
      }

      .stat-value {
        font-size: 2rem;
      }

      .stat-label {
        font-size: 0.875rem;
      }

      .section-title h2 {
        font-size: 1.5rem;
      }

      .section-title p {
        font-size: 0.9375rem;
      }
    }

    /* ========================================
       ANGULAR MATERIAL OVERRIDES
       ======================================== */
    ::ng-deep .mat-mdc-card {
      background: transparent !important;
      box-shadow: none !important;
    }

    ::ng-deep .mat-icon {
      font-family: 'Material Icons' !important;
      font-feature-settings: 'liga' 1;
    }

    ::ng-deep .mat-mdc-button,
    ::ng-deep .mat-mdc-raised-button,
    ::ng-deep .mat-mdc-stroked-button {
      transition: all 0.3s var(--transition-smooth) !important;
    }

    /* ========================================
       ACCESSIBILITY
       ======================================== */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    button:focus-visible,
    .action-card:focus-visible {
      outline: 2px solid rgba(102, 126, 234, 0.8);
      outline-offset: 2px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalPatients: 1247,
    todayAppointments: 23,
    pendingPayments: 8,
    systemAlerts: 2
  };

  statsArray = [
    {
      icon: 'people',
      value: this.stats.totalPatients,
      label: 'Total Pacientes',
      change: '+12%',
      changeClass: 'positive',
      changeIcon: 'trending_up'
    },
    {
      icon: 'event',
      value: this.stats.todayAppointments,
      label: 'Citas Hoy',
      change: '+3',
      changeClass: 'positive',
      changeIcon: 'trending_up'
    },
    {
      icon: 'payment',
      value: this.stats.pendingPayments,
      label: 'Pagos Pendientes',
      change: '-2',
      changeClass: 'negative',
      changeIcon: 'trending_down'
    },
    {
      icon: 'warning',
      value: this.stats.systemAlerts,
      label: 'Alertas Sistema',
      change: '0',
      changeClass: 'positive',
      changeIcon: 'trending_flat'
    }
  ];

  chartData = [65, 78, 82, 90, 75, 88, 95];

  recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'Nueva cita programada',
      description: 'Juan Pérez - Dr. María García - 10:00 AM',
      time: 'Hace 5 minutos',
      status: 'success'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Pago procesado',
      description: 'Ana López - €150.00 - Tarjeta',
      time: 'Hace 15 minutos',
      status: 'success'
    },
    {
      id: '3',
      type: 'patient',
      title: 'Nuevo paciente registrado',
      description: 'Carlos Martín - Registro completado',
      time: 'Hace 30 minutos',
      status: 'info'
    },
    {
      id: '4',
      type: 'system',
      title: 'Backup completado',
      description: 'Respaldo automático del sistema',
      time: 'Hace 1 hora',
      status: 'success'
    },
    {
      id: '5',
      type: 'appointment',
      title: 'Cita cancelada',
      description: 'Pedro Sánchez - Cancelación confirmada',
      time: 'Hace 2 horas',
      status: 'warning'
    }
  ];

  quickActions = [
    {
      icon: 'event',
      title: 'Nueva Cita',
      description: 'Programar una nueva cita médica',
      route: '/appointments'
    },
    {
      icon: 'person_add',
      title: 'Nuevo Paciente',
      description: 'Registrar un nuevo paciente',
      route: '/patients'
    },
    {
      icon: 'medical_services',
      title: 'Registro Médico',
      description: 'Crear un nuevo registro médico',
      route: '/medical-records'
    },
    {
      icon: 'payment',
      title: 'Procesar Pago',
      description: 'Gestionar pagos y facturación',
      route: '/payments'
    },
    {
      icon: 'notifications',
      title: 'Notificaciones',
      description: 'Ver y gestionar notificaciones',
      route: '/notifications'
    },
    {
      icon: 'smart_toy',
      title: 'IA Médica',
      description: 'Consultar con el asistente IA',
      route: '/ai-chat'
    }
  ];

  systemAlerts = [
    {
      id: '1',
      type: 'warning',
      title: 'Espacio en disco bajo',
      message: 'El servidor tiene menos del 20% de espacio libre'
    },
    {
      id: '2',
      type: 'info',
      title: 'Actualización disponible',
      message: 'Nueva versión del sistema disponible para descargar'
    }
  ];

  ngOnInit() {
    console.log('Dashboard component initialized');
  }

  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'appointment': 'event',
      'payment': 'payment',
      'patient': 'person',
      'system': 'settings'
    };
    return iconMap[type] || 'info';
  }

  getAlertIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'warning': 'warning',
      'error': 'error',
      'info': 'info'
    };
    return iconMap[type] || 'info';
  }

  getStatClass(index: number): string {
    return index.toString();
  }

  getProgress(index: number): number {
    const progressValues = [85, 72, 60, 40];
    return progressValues[index] || 50;
  }

  navigateToAction(route: string): void {
    console.log('Navigating to:', route);
    // Implementar navegación
  }

  dismissAlert(alert: any): void {
    const index = this.systemAlerts.findIndex(a => a.id === alert.id);
    if (index > -1) {
      this.systemAlerts.splice(index, 1);
    }
  }
}