import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <ng-container *ngIf="!isAuthRoute; else authLayout">
      <div class="app-wrapper">
        <!-- Animated Background -->
        <div class="app-background">
          <div class="bg-orb orb-1"></div>
          <div class="bg-orb orb-2"></div>
          <div class="bg-orb orb-3"></div>
        </div>

        <!-- Premium Header -->
        <header class="premium-header">
          <div class="header-glass">
            <div class="header-content">
              <!-- Left Section -->
              <div class="header-left">
                <button mat-icon-button class="menu-toggle" (click)="sidenav.toggle()">
                  <mat-icon>menu</mat-icon>
                  <div class="button-ripple"></div>
                </button>

                <div class="brand-section">
                  <div class="brand-logo">
                    <mat-icon>medical_services</mat-icon>
                    <div class="logo-pulse"></div>
                  </div>
                  <div class="brand-text">
                    <span class="brand-name">SMD VITAL</span>
                    <span class="brand-tagline">Medical System</span>
                  </div>
                </div>
              </div>

              <!-- Center Section - Search -->
              <div class="header-center">
                <div class="search-container">
                  <mat-icon class="search-icon">search</mat-icon>
                  <input 
                    type="text" 
                    class="search-input" 
                    placeholder="Buscar pacientes, citas, registros..."
                  >
                  <div class="search-border"></div>
                </div>
              </div>

              <!-- Right Section -->
              <div class="header-right">
                <!-- Notifications -->
                <button mat-icon-button class="header-action" [matMenuTriggerFor]="notificationMenu">
                  <mat-icon [matBadge]="notificationCount" [matBadgeHidden]="notificationCount === 0" matBadgeColor="warn" matBadgeSize="small">
                    notifications
                  </mat-icon>
                  <div class="button-ripple"></div>
                </button>

                <!-- Messages -->
                <button mat-icon-button class="header-action">
                  <mat-icon matBadge="3" matBadgeColor="accent" matBadgeSize="small">
                    mail
                  </mat-icon>
                  <div class="button-ripple"></div>
                </button>

                <!-- Settings -->
                <button mat-icon-button class="header-action">
                  <mat-icon>settings</mat-icon>
                  <div class="button-ripple"></div>
                </button>

                <!-- User Menu -->
                <button mat-button class="user-profile" [matMenuTriggerFor]="userMenu">
                  <div class="profile-avatar">
                    <mat-icon>account_circle</mat-icon>
                  </div>
                  <div class="profile-info">
                    <span class="profile-name">Dr. Usuario</span>
                    <span class="profile-role">Médico General</span>
                  </div>
                  <mat-icon class="profile-arrow">expand_more</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Notification Menu -->
        <mat-menu #notificationMenu="matMenu" class="notification-menu">
          <div class="menu-header">
            <h3>Notificaciones</h3>
            <button mat-button class="mark-read-btn">Marcar todas</button>
          </div>
          <mat-divider></mat-divider>
          <div class="notification-list">
            <button mat-menu-item class="notification-item">
              <div class="notification-icon success">
                <mat-icon>event_available</mat-icon>
              </div>
              <div class="notification-content">
                <div class="notification-title">Nueva cita confirmada</div>
                <div class="notification-text">Juan Pérez - 10:00 AM</div>
                <div class="notification-time">Hace 5 min</div>
              </div>
            </button>
            <button mat-menu-item class="notification-item">
              <div class="notification-icon warning">
                <mat-icon>warning</mat-icon>
              </div>
              <div class="notification-content">
                <div class="notification-title">Cita próxima</div>
                <div class="notification-text">Recordatorio en 30 minutos</div>
                <div class="notification-time">Hace 10 min</div>
              </div>
            </button>
            <button mat-menu-item class="notification-item">
              <div class="notification-icon info">
                <mat-icon>info</mat-icon>
              </div>
              <div class="notification-content">
                <div class="notification-title">Sistema actualizado</div>
                <div class="notification-text">Nueva versión disponible</div>
                <div class="notification-time">Hace 1 hora</div>
              </div>
            </button>
          </div>
          <mat-divider></mat-divider>
          <div class="menu-footer">
            <button mat-button class="view-all-btn">Ver todas las notificaciones</button>
          </div>
        </mat-menu>

        <!-- User Menu -->
        <mat-menu #userMenu="matMenu" class="user-menu">
          <div class="menu-user-header">
            <div class="menu-avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
            <div class="menu-user-info">
              <div class="menu-user-name">Dr. Usuario</div>
              <div class="menu-user-email">usuario@smdvital.com</div>
            </div>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item class="menu-item">
            <mat-icon>person</mat-icon>
            <span>Mi Perfil</span>
          </button>
          <button mat-menu-item class="menu-item">
            <mat-icon>settings</mat-icon>
            <span>Configuración</span>
          </button>
          <button mat-menu-item class="menu-item">
            <mat-icon>help</mat-icon>
            <span>Ayuda y Soporte</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item class="menu-item logout" (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Cerrar Sesión</span>
          </button>
        </mat-menu>

        <!-- Premium Sidebar -->
        <mat-sidenav-container class="sidenav-container">
          <mat-sidenav #sidenav mode="side" opened class="premium-sidenav">
            <div class="sidebar-glass">
              <!-- Sidebar Header -->
              <div class="sidebar-header">
                <div class="sidebar-title">Menú Principal</div>
                <div class="sidebar-subtitle">Navegación del sistema</div>
              </div>

              <!-- Navigation Menu -->
              <nav class="sidebar-nav">
                <a 
                  *ngFor="let item of menuItems" 
                  mat-list-item 
                  [routerLink]="item.route" 
                  routerLinkActive="active"
                  class="nav-item"
                >
                  <div class="nav-item-content">
                    <div class="nav-icon-wrapper" [class]="item.color">
                      <mat-icon>{{ item.icon }}</mat-icon>
                      <div class="icon-glow"></div>
                    </div>
                    <div class="nav-text">
                      <span class="nav-label">{{ item.label }}</span>
                      <span class="nav-description">{{ item.description }}</span>
                    </div>
                    <mat-icon class="nav-arrow">chevron_right</mat-icon>
                  </div>
                  <div class="nav-item-bg"></div>
                </a>
              </nav>

              <!-- Sidebar Footer -->
              <div class="sidebar-footer">
                <div class="footer-card">
                  <mat-icon class="footer-icon">workspace_premium</mat-icon>
                  <div class="footer-text">
                    <div class="footer-title">Versión Pro</div>
                    <div class="footer-subtitle">Todas las funciones activas</div>
                  </div>
                </div>
              </div>
            </div>
          </mat-sidenav>

          <!-- Main Content -->
          <mat-sidenav-content class="main-content">
            <div class="content-wrapper">
              <router-outlet></router-outlet>
            </div>
          </mat-sidenav-content>
        </mat-sidenav-container>
      </div>
    </ng-container>

    <ng-template #authLayout>
      <router-outlet></router-outlet>
    </ng-template>
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
      --header-height: 72px;
      --sidebar-width: 280px;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* ========================================
       APP WRAPPER & BACKGROUND
       ======================================== */
    .app-wrapper {
      position: relative;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .app-background {
      position: fixed;
      inset: 0;
      z-index: 0;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      pointer-events: none;
    }

    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.3;
      animation: floatOrb 25s ease-in-out infinite;
    }

    .orb-1 {
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.3), transparent);
      top: -300px;
      left: -300px;
      animation-delay: 0s;
    }

    .orb-2 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(118, 75, 162, 0.25), transparent);
      bottom: -250px;
      right: -250px;
      animation-delay: 8s;
    }

    .orb-3 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(74, 222, 128, 0.2), transparent);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: 16s;
    }

    @keyframes floatOrb {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(60px, -60px) scale(1.1); }
      66% { transform: translate(-60px, 60px) scale(0.9); }
    }

    /* ========================================
       PREMIUM HEADER
       ======================================== */
    .premium-header {
      position: relative;
      z-index: 1000;
      height: var(--header-height);
      animation: slideDown 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .header-glass {
      height: 100%;
      background: var(--glass-bg);
      backdrop-filter: blur(30px);
      border-bottom: 1px solid var(--glass-border);
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      height: 100%;
      max-width: 100%;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 3rem;
    }

    /* Header Left */
    .header-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-shrink: 0;
    }

    .menu-toggle {
      position: relative;
      color: var(--text-primary);
      transition: all 0.3s var(--transition-smooth);
    }

    .menu-toggle:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: rotate(90deg);
    }

    .button-ripple {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      transform: scale(0);
      transition: transform 0.6s var(--transition-smooth);
    }

    .menu-toggle:active .button-ripple,
    .header-action:active .button-ripple {
      transform: scale(1.5);
      opacity: 0;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .brand-logo {
      position: relative;
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-gradient);
      border-radius: 14px;
      box-shadow: var(--shadow-md);
    }

    .brand-logo mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: var(--text-primary);
      z-index: 2;
    }

    .logo-pulse {
      position: absolute;
      inset: -4px;
      border-radius: 14px;
      background: var(--primary-gradient);
      animation: logoPulse 2s ease-in-out infinite;
      opacity: 0.5;
    }

    @keyframes logoPulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.3; }
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .brand-name {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: 0.5px;
    }

    .brand-tagline {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Header Center - Search */
    .header-center {
      flex: 1;
      max-width: 500px;
      margin: 0 2rem;
    }

    .search-container {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.25rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 100px;
      transition: all 0.3s var(--transition-smooth);
    }

    .search-container:focus-within {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(102, 126, 234, 0.5);
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .search-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--text-tertiary);
      transition: color 0.3s var(--transition-smooth);
    }

    .search-container:focus-within .search-icon {
      color: var(--text-primary);
    }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-size: 0.9375rem;
      color: var(--text-primary);
    }

    .search-input::placeholder {
      color: var(--text-tertiary);
    }

    .search-border {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--primary-gradient);
      transition: width 0.4s var(--transition-smooth);
      border-radius: 100px;
    }

    .search-container:focus-within .search-border {
      width: 100%;
    }

    /* Header Right */
    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .header-action {
      position: relative;
      color: var(--text-primary);
      transition: all 0.3s var(--transition-smooth);
    }

    .header-action:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.25rem 0.75rem 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--glass-border);
      border-radius: 100px;
      color: var(--text-primary);
      transition: all 0.3s var(--transition-smooth);
      margin-left: 0.5rem;
    }

    .user-profile:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .profile-avatar {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-gradient);
      border-radius: 50%;
      box-shadow: var(--shadow-sm);
    }

    .profile-avatar mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .profile-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .profile-role {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    .profile-arrow {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--text-secondary);
      transition: transform 0.3s var(--transition-smooth);
    }

    .user-profile:hover .profile-arrow {
      transform: rotate(180deg);
    }

    /* ========================================
       MENUS
       ======================================== */
    ::ng-deep .notification-menu .mat-mdc-menu-content,
    ::ng-deep .user-menu .mat-mdc-menu-content {
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(30px);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      padding: 0;
      box-shadow: var(--shadow-lg);
    }

    ::ng-deep .notification-menu {
      min-width: 360px;
    }

    .menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
    }

    .menu-header h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .mark-read-btn {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1.25rem !important;
      transition: all 0.3s var(--transition-smooth);
      border-left: 3px solid transparent;
    }

    .notification-item:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      border-left-color: rgba(102, 126, 234, 0.8);
    }

    .notification-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      flex-shrink: 0;
    }

    .notification-icon.success {
      background: rgba(74, 222, 128, 0.2);
      color: #4ade80;
    }

    .notification-icon.warning {
      background: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
    }

    .notification-icon.info {
      background: rgba(96, 165, 250, 0.2);
      color: #60a5fa;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .notification-text {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .notification-time {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    .menu-footer {
      padding: 0.75rem 1.25rem;
      border-top: 1px solid var(--glass-border);
    }

    .view-all-btn {
      width: 100%;
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    /* User Menu */
    .menu-user-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
    }

    .menu-avatar {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-gradient);
      border-radius: 50%;
      box-shadow: var(--shadow-md);
    }

    .menu-avatar mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--text-primary);
    }

    .menu-user-info {
      flex: 1;
    }

    .menu-user-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .menu-user-email {
      font-size: 0.8125rem;
      color: var(--text-tertiary);
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem !important;
      color: var(--text-secondary) !important;
      transition: all 0.3s var(--transition-smooth);
    }

    .menu-item:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      color: var(--text-primary) !important;
    }

    .menu-item.logout {
      color: #f87171 !important;
    }

    .menu-item.logout:hover {
      background: rgba(248, 113, 113, 0.1) !important;
    }

    /* ========================================
       SIDENAV CONTAINER
       ======================================== */
    .sidenav-container {
      flex: 1;
      position: relative;
      z-index: 1;
    }

    /* ========================================
       PREMIUM SIDEBAR
       ======================================== */
    .premium-sidenav {
      width: var(--sidebar-width);
      background: transparent;
      border: none;
      animation: slideRight 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes slideRight {
      from {
        opacity: 0;
        transform: translateX(-100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .sidebar-glass {
      height: 100%;
      background: var(--glass-bg);
      backdrop-filter: blur(30px);
      border-right: 1px solid var(--glass-border);
      display: flex;
      flex-direction: column;
      padding: 1.5rem 0;
    }

    /* Sidebar Header */
    .sidebar-header {
      padding: 0 1.5rem 1.5rem 1.5rem;
      border-bottom: 1px solid var(--glass-border);
    }

    .sidebar-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.25rem;
    }

    .sidebar-subtitle {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    /* Sidebar Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-item {
      position: relative;
      margin: 0.25rem 0.75rem;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s var(--transition-smooth);
      cursor: pointer;
    }

    .nav-item-content {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
    }

    .nav-icon-wrapper {
      position: relative;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      flex-shrink: 0;
      transition: all 0.3s var(--transition-smooth);
    }

    .nav-icon-wrapper.primary {
      background: var(--primary-gradient);
    }

    .nav-icon-wrapper.success {
      background: var(--success-gradient);
    }

    .nav-icon-wrapper.info {
      background: var(--info-gradient);
    }

    .nav-icon-wrapper.warning {
      background: var(--warning-gradient);
    }

    .nav-icon-wrapper mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: var(--text-primary);
      z-index: 2;
    }

    .icon-glow {
      position: absolute;
      inset: -4px;
      border-radius: 12px;
      background: inherit;
      filter: blur(8px);
      opacity: 0.6;
      z-index: 1;
    }

    .nav-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-label {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
      transition: color 0.3s var(--transition-smooth);
    }

    .nav-description {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      transition: color 0.3s var(--transition-smooth);
    }

    .nav-arrow {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--text-tertiary);
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s var(--transition-smooth);
    }

    .nav-item-bg {
      position: absolute;
      inset: 0;
      z-index: 1;
      background: rgba(255, 255, 255, 0.05);
      opacity: 0;
      transition: opacity 0.3s var(--transition-smooth);
    }

    .nav-item:hover .nav-item-bg {
      opacity: 1;
    }

    .nav-item:hover .nav-arrow {
      opacity: 1;
      transform: translateX(0);
    }

    .nav-item:hover .nav-icon-wrapper {
      transform: scale(1.1) rotate(-5deg);
    }

    .nav-item:hover .nav-label {
      color: #667eea;
    }

    .nav-item:hover .nav-description {
      color: var(--text-secondary);
    }

    .nav-item.active {
      background: rgba(102, 126, 234, 0.15);
      border: 1px solid rgba(102, 126, 234, 0.3);
    }

    .nav-item.active .nav-item-bg {
      background: var(--primary-gradient);
      opacity: 0.1;
    }

    .nav-item.active .nav-label {
      color: #667eea;
    }

    .nav-item.active .nav-arrow {
      opacity: 1;
      transform: translateX(0);
      color: #667eea;
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--glass-border);
    }

    .footer-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--primary-gradient);
      border-radius: 16px;
      box-shadow: var(--shadow-md);
      position: relative;
      overflow: hidden;
    }

    .footer-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.1));
      opacity: 0;
      transition: opacity 0.3s var(--transition-smooth);
    }

    .footer-card:hover::before {
      opacity: 1;
    }

    .footer-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--text-primary);
    }

    .footer-text {
      flex: 1;
    }

    .footer-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.125rem;
    }

    .footer-subtitle {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
    }

    /* ========================================
       MAIN CONTENT
       ======================================== */
    .main-content {
      position: relative;
      background: transparent;
    }

    .content-wrapper {
      padding: 2rem;
      animation: fadeIn 0.6s var(--transition-smooth);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ========================================
       SCROLLBAR STYLING
       ======================================== */
    .sidebar-nav::-webkit-scrollbar,
    .notification-list::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-track,
    .notification-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-nav::-webkit-scrollbar-thumb,
    .notification-list::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 100px;
      transition: background 0.3s var(--transition-smooth);
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover,
    .notification-list::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* ========================================
       RESPONSIVE DESIGN
       ======================================== */
    @media (max-width: 1200px) {
      .header-content {
        gap: 2rem;
        padding: 0 1.5rem;
      }

      .header-center {
        max-width: 400px;
        margin: 0 1rem;
      }

      .search-input {
        font-size: 0.875rem;
      }
    }

    @media (max-width: 1024px) {
      :host {
        --sidebar-width: 260px;
      }

      .premium-sidenav {
        width: var(--sidebar-width);
      }

      .nav-description {
        display: none;
      }

      .nav-item-content {
        padding: 0.875rem;
      }
    }

    @media (max-width: 768px) {
      :host {
        --header-height: 64px;
      }

      .header-content {
        padding: 0 1rem;
        gap: 1rem;
        justify-content: space-between;
      }

      .header-center {
        display: none;
      }

      .brand-tagline {
        display: none;
      }

      .profile-info {
        display: none;
      }

      .user-profile {
        padding: 0.5rem;
        margin-left: 0;
      }

      .header-right {
        gap: 0.5rem;
      }

      .premium-sidenav {
        width: 280px;
      }

      ::ng-deep .mat-drawer-backdrop.mat-drawer-shown {
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
      }

      .content-wrapper {
        padding: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .header-content {
        padding: 0 0.75rem;
        gap: 0.75rem;
        justify-content: space-between;
      }

      .brand-section {
        gap: 0.75rem;
      }

      .brand-logo {
        width: 40px;
        height: 40px;
      }

      .brand-logo mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .brand-name {
        font-size: 1.125rem;
      }

      .header-action:not(:last-child) {
        display: none;
      }

      .header-right {
        gap: 0.25rem;
      }

      .content-wrapper {
        padding: 1rem;
      }

      .sidebar-header {
        padding: 0 1rem 1rem 1rem;
      }

      .nav-item {
        margin: 0.25rem 0.5rem;
      }

      .nav-item-content {
        padding: 0.75rem;
      }

      .nav-icon-wrapper {
        width: 40px;
        height: 40px;
      }

      .nav-label {
        font-size: 0.875rem;
      }
    }

    /* ========================================
       ANGULAR MATERIAL OVERRIDES
       ======================================== */
    ::ng-deep .mat-drawer-container {
      background: transparent !important;
    }

    ::ng-deep .mat-drawer {
      background: transparent !important;
      border: none !important;
    }

    ::ng-deep .mat-toolbar {
      background: transparent !important;
      padding: 0 !important;
    }

    ::ng-deep .mat-mdc-list-item {
      background: transparent !important;
      border-radius: 0 !important;
    }

    ::ng-deep .mat-mdc-menu-panel {
      background: transparent !important;
      box-shadow: none !important;
    }

    ::ng-deep .mat-divider {
      border-top-color: var(--glass-border) !important;
    }

    ::ng-deep .mat-icon {
      font-family: 'Material Icons' !important;
      font-feature-settings: 'liga' 1;
    }

    ::ng-deep .mat-mdc-button,
    ::ng-deep .mat-mdc-icon-button {
      transition: all 0.3s var(--transition-smooth) !important;
    }

    ::ng-deep .mat-badge-content {
      font-size: 0.625rem;
      font-weight: 600;
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
    a:focus-visible {
      outline: 2px solid rgba(102, 126, 234, 0.8);
      outline-offset: 2px;
    }

    /* Hide scrollbar for better aesthetics but keep functionality */
    .sidebar-nav {
      scrollbar-width: thin;
      scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
    }

    /* ========================================
       LOADING STATES & ANIMATIONS
       ======================================== */
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }

    .loading-shimmer {
      animation: shimmer 2s infinite linear;
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.05) 0%,
        rgba(255, 255, 255, 0.1) 50%,
        rgba(255, 255, 255, 0.05) 100%
      );
      background-size: 1000px 100%;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'SMD VITAL';
  notificationCount = 0;
  isAuthRoute = false;
  private readonly notificationsEnabled = environment.features.notifications;

  menuItems = [
    {
      icon: 'dashboard',
      label: 'Dashboard',
      description: 'Panel principal',
      route: '/dashboard',
      color: 'primary'
    },
    {
      icon: 'event',
      label: 'Citas Médicas',
      description: 'Gestión de citas',
      route: '/appointments',
      color: 'info'
    },
    {
      icon: 'people',
      label: 'Pacientes',
      description: 'Base de datos',
      route: '/patients',
      color: 'success'
    },
    {
      icon: 'medical_services',
      label: 'Registros Médicos',
      description: 'Historiales clínicos',
      route: '/medical-records',
      color: 'primary'
    },
    {
      icon: 'payment',
      label: 'Pagos',
      description: 'Facturación',
      route: '/payments',
      color: 'warning'
    },
    {
      icon: 'notifications',
      label: 'Notificaciones',
      description: 'Centro de avisos',
      route: '/notifications',
      color: 'info'
    },
    {
      icon: 'psychology',
      label: 'IA Médica',
      description: 'Asistente inteligente',
      route: '/ai-chat',
      color: 'primary'
    },
    {
      icon: 'admin_panel_settings',
      label: 'Administración',
      description: 'Configuración',
      route: '/admin',
      color: 'warning'
    }
  ];

  private readonly destroyRef = inject(DestroyRef);
  private readonly authRoutes = ['/login', '/register'];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.evaluateCurrentRoute(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => this.evaluateCurrentRoute(event.urlAfterRedirects));
  }

  private evaluateCurrentRoute(url: string): void {
    const normalizedUrl = this.normalizeUrl(url);
    if (normalizedUrl === '/') {
      this.isAuthRoute = true;
      return;
    }

    this.isAuthRoute = this.authRoutes.some(route => normalizedUrl === route || normalizedUrl.startsWith(`${route}/`));

    if (!this.isAuthRoute && this.notificationsEnabled) {
      this.loadNotificationCount();
    }
  }

  private normalizeUrl(url: string): string {
    if (!url.startsWith('/')) {
      url = `/${url}`;
    }

    const cleanUrl = url.split('?')[0].split('#')[0];
    return cleanUrl;
  }

  private loadNotificationCount(): void {
    if (!this.notificationsEnabled) {
      this.notificationCount = 0;
      return;
    }

    this.notificationService.getUnreadCount().subscribe(count => {
      this.notificationCount = count;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}