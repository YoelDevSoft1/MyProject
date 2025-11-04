import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocialAuthService, SocialUser, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

import { AuthService, GoogleLoginPayload } from '@core/services/auth.service';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    GoogleSigninButtonModule
  ],
  template: `
    <div class="login-container">
      <!-- Animated Background -->
      <div class="background-wrapper">
        <div class="gradient-mesh"></div>
        <div class="floating-orb orb-1"></div>
        <div class="floating-orb orb-2"></div>
        <div class="floating-orb orb-3"></div>
        <div class="particles">
          <div class="particle" *ngFor="let i of [].constructor(20); let idx = index" [style.--i]="idx"></div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="content-wrapper">
        <!-- Brand Showcase -->
        <div class="brand-showcase">
          <div class="brand-content">
            <!-- Logo Section -->
            <div class="logo-section">
              <div class="logo-container">
                <div class="logo-backdrop"></div>
                <mat-icon class="logo-icon">medical_services</mat-icon>
                <div class="logo-pulse"></div>
              </div>
              <div class="brand-identity">
                <h1 class="brand-name">SMD VITAL</h1>
                <p class="brand-tagline">Sistema Médico Digital Avanzado</p>
              </div>
            </div>

            <!-- Features Grid -->
            <div class="features-grid">
              <div class="feature-card" *ngFor="let feature of features">
                <div class="feature-icon-wrapper">
                  <mat-icon>{{ feature.icon }}</mat-icon>
                </div>
                <h3>{{ feature.title }}</h3>
                <p>{{ feature.description }}</p>
              </div>
            </div>

            <!-- Stats Section -->
            <div class="stats-section">
              <div class="stat-item" *ngFor="let stat of stats">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Login Form -->
        <div class="form-container">
          <div class="form-glass">
            <!-- Header -->
            <div class="form-header">
              <div class="welcome-badge">
                <mat-icon>waving_hand</mat-icon>
                <span>Bienvenido de vuelta</span>
              </div>
              <h2 class="form-title">Iniciar Sesión</h2>
              <p class="form-subtitle">Accede a tu panel médico profesional</p>
            </div>

            <!-- Form Body -->
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              <!-- Email Field -->
              <div class="form-group">
                <label class="form-label">
                  <mat-icon>alternate_email</mat-icon>
                  <span>Correo Electrónico</span>
                </label>
                <div class="input-wrapper">
                  <input
                    class="form-input"
                    type="email"
                    formControlName="email"
                    placeholder="tu@correo.com"
                    autocomplete="email"
                    [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  >
                  <div class="input-border"></div>
                </div>
                <div class="error-message" *ngIf="loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched">
                  <mat-icon>error_outline</mat-icon>
                  <span>El correo es obligatorio</span>
                </div>
                <div class="error-message" *ngIf="loginForm.get('email')?.hasError('email') && loginForm.get('email')?.touched">
                  <mat-icon>error_outline</mat-icon>
                  <span>Ingresa un correo válido</span>
                </div>
              </div>

              <!-- Password Field -->
              <div class="form-group">
                <label class="form-label">
                  <mat-icon>lock</mat-icon>
                  <span>Contraseña</span>
                </label>
                <div class="input-wrapper password-wrapper">
                  <input
                    class="form-input"
                    [type]="hidePassword ? 'password' : 'text'"
                    formControlName="password"
                    placeholder="Tu contraseña segura"
                    autocomplete="current-password"
                    [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  >
                  <button
                    type="button"
                    class="password-toggle"
                    (click)="hidePassword = !hidePassword"
                    [attr.aria-label]="hidePassword ? 'Mostrar contraseña' : 'Ocultar contraseña'"
                  >
                    <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  <div class="input-border"></div>
                </div>
                <div class="error-message" *ngIf="loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched">
                  <mat-icon>error_outline</mat-icon>
                  <span>La contraseña es obligatoria</span>
                </div>
                <div class="error-message" *ngIf="loginForm.get('password')?.hasError('minlength') && loginForm.get('password')?.touched">
                  <mat-icon>error_outline</mat-icon>
                  <span>Mínimo 6 caracteres</span>
                </div>
              </div>

              <!-- Remember & Forgot -->
              <div class="form-options">
                <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="submit-btn"
                [disabled]="loginForm.invalid || loading"
                [class.loading]="loading"
              >
                <span class="btn-content" *ngIf="!loading">
                  <mat-icon>login</mat-icon>
                  <span>Iniciar Sesión</span>
                </span>
                <mat-progress-spinner
                  *ngIf="loading"
                  diameter="24"
                  mode="indeterminate"
                  class="btn-spinner"
                ></mat-progress-spinner>
              </button>

              <!-- Divider -->
              <div class="divider">
                <span>o continuar con</span>
              </div>

              <!-- Google Sign In -->
              <div class="social-login" [class.disabled]="loading">
                <asl-google-signin-button
                  type="standard"
                  size="large"
                  text="continue_with"
                  shape="pill"
                  theme="outline"
                  [width]="380"
                ></asl-google-signin-button>
              </div>
            </form>

            <!-- Footer -->
            <div class="form-footer">
              <p class="signup-text">
                ¿No tienes cuenta?
                <a routerLink="/register" class="signup-link">Crear cuenta</a>
              </p>
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
      --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      --glass-bg: rgba(255, 255, 255, 0.1);
      --glass-border: rgba(255, 255, 255, 0.2);
      --text-primary: #ffffff;
      --text-secondary: rgba(255, 255, 255, 0.8);
      --text-tertiary: rgba(255, 255, 255, 0.6);
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
      --shadow-md: 0 8px 32px rgba(0, 0, 0, 0.2);
      --shadow-lg: 0 16px 64px rgba(0, 0, 0, 0.3);
      --transition-smooth: cubic-bezier(0.4, 0, 0.2, 1);
      --transition-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    /* ========================================
       CONTAINER & BACKGROUND
       ======================================== */
    .login-container {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .background-wrapper {
      position: fixed;
      inset: 0;
      z-index: 0;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    }

    .gradient-mesh {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(245, 87, 108, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(79, 172, 254, 0.1) 0%, transparent 50%);
      animation: meshShift 20s ease infinite;
    }

    @keyframes meshShift {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(20px, 20px) scale(1.1); }
    }

    .floating-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.6;
      animation: float 15s ease-in-out infinite;
    }

    .orb-1 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.4), transparent);
      top: -100px;
      left: -100px;
      animation-delay: 0s;
    }

    .orb-2 {
      width: 350px;
      height: 350px;
      background: radial-gradient(circle, rgba(245, 87, 108, 0.3), transparent);
      bottom: -100px;
      right: -100px;
      animation-delay: 5s;
    }

    .orb-3 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(79, 172, 254, 0.3), transparent);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: 10s;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(30px, -30px) rotate(120deg); }
      66% { transform: translate(-30px, 30px) rotate(240deg); }
    }

    .particles {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .particle {
      position: absolute;
      width: 2px;
      height: 2px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      animation: particleFloat 10s linear infinite;
      animation-delay: calc(var(--i) * -0.5s);
      left: calc(var(--i) * 5%);
      top: 100%;
    }

    @keyframes particleFloat {
      to {
        transform: translateY(-100vh) translateX(50px);
        opacity: 0;
      }
    }

    /* ========================================
       CONTENT WRAPPER
       ======================================== */
    .content-wrapper {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 3rem;
      max-width: 1400px;
      width: 100%;
      align-items: center;
    }

    /* ========================================
       BRAND SHOWCASE
       ======================================== */
    .brand-showcase {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }

    .brand-content {
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    /* Logo Section */
    .logo-section {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .logo-container {
      position: relative;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-backdrop {
      position: absolute;
      inset: 0;
      background: var(--primary-gradient);
      border-radius: 24px;
      transform: rotate(45deg);
      box-shadow: var(--shadow-lg);
    }

    .logo-icon {
      position: relative;
      z-index: 2;
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--text-primary);
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    }

    .logo-pulse {
      position: absolute;
      inset: -10px;
      background: var(--primary-gradient);
      border-radius: 24px;
      transform: rotate(45deg);
      animation: pulse 2s ease-in-out infinite;
      opacity: 0.5;
    }

    @keyframes pulse {
      0%, 100% { transform: rotate(45deg) scale(1); opacity: 0.5; }
      50% { transform: rotate(45deg) scale(1.1); opacity: 0.3; }
    }

    .brand-identity {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .brand-name {
      font-size: 3.5rem;
      font-weight: 800;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
      line-height: 1;
    }

    .brand-tagline {
      font-size: 1.25rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .feature-card {
      position: relative;
      padding: 2rem;
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid var(--glass-border);
      transition: all 0.4s var(--transition-smooth);
      cursor: pointer;
    }

    .feature-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 20px;
      padding: 1px;
      background: var(--primary-gradient);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.4s var(--transition-smooth);
    }

    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--shadow-lg);
    }

    .feature-card:hover::before {
      opacity: 1;
    }

    .feature-icon-wrapper {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-gradient);
      border-radius: 16px;
      margin-bottom: 1rem;
      box-shadow: var(--shadow-md);
    }

    .feature-icon-wrapper mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--text-primary);
    }

    .feature-card h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .feature-card p {
      font-size: 0.875rem;
      color: var(--text-tertiary);
      line-height: 1.5;
    }

    /* Stats Section */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      padding: 2rem;
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      border: 1px solid var(--glass-border);
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* ========================================
       FORM CONTAINER
       ======================================== */
    .form-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-glass {
      width: 100%;
      max-width: 480px;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(30px);
      border-radius: 32px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 3rem;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 1px rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }

    .form-glass::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    }

    /* Form Header */
    .form-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .welcome-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: var(--primary-gradient);
      border-radius: 100px;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-md);
      animation: slideDown 0.6s var(--transition-bounce);
    }

    @keyframes slideDown {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .welcome-badge mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .form-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      animation: fadeIn 0.6s var(--transition-smooth) 0.2s backwards;
    }

    .form-subtitle {
      font-size: 1rem;
      color: var(--text-tertiary);
      animation: fadeIn 0.6s var(--transition-smooth) 0.3s backwards;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Form Elements */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-label mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .input-wrapper {
      position: relative;
    }

    .form-input {
      width: 100%;
      padding: 1rem 1.25rem;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      font-size: 1rem;
      color: var(--text-primary);
      transition: all 0.3s var(--transition-smooth);
      outline: none;
    }

    .form-input::placeholder {
      color: var(--text-tertiary);
    }

    .form-input:focus {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(102, 126, 234, 0.5);
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    .form-input.error {
      border-color: rgba(245, 87, 108, 0.5);
    }

    .input-border {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--primary-gradient);
      transition: width 0.4s var(--transition-smooth);
      border-radius: 0 0 16px 16px;
    }

    .form-input:focus ~ .input-border {
      width: 100%;
    }

    .password-wrapper {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.3s var(--transition-smooth);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .password-toggle:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }

    .password-toggle mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #f5576c;
      animation: shake 0.4s var(--transition-smooth);
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }

    .error-message mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .form-options {
      display: flex;
      justify-content: flex-end;
      margin-top: -0.5rem;
    }

    .forgot-link {
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.3s var(--transition-smooth);
    }

    .forgot-link:hover {
      color: var(--text-primary);
    }

    /* Submit Button */
    .submit-btn {
      position: relative;
      width: 100%;
      padding: 1rem 2rem;
      background: var(--primary-gradient);
      border: none;
      border-radius: 16px;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.3s var(--transition-smooth);
      box-shadow: 
        0 8px 24px rgba(102, 126, 234, 0.4),
        inset 0 1px 1px rgba(255, 255, 255, 0.2);
      overflow: hidden;
    }

    .submit-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.6s var(--transition-smooth);
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 
        0 12px 32px rgba(102, 126, 234, 0.5),
        inset 0 1px 1px rgba(255, 255, 255, 0.2);
    }

    .submit-btn:hover:not(:disabled)::before {
      left: 100%;
    }

    .submit-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .submit-btn.loading {
      pointer-events: none;
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .btn-spinner {
      --mdc-circular-progress-active-indicator-color: #ffffff;
    }

    /* Divider */
    .divider {
      position: relative;
      text-align: center;
      margin: 1rem 0;
    }

    .divider::before,
    .divider::after {
      content: '';
      position: absolute;
      top: 50%;
      width: calc(50% - 80px);
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    }

    .divider::before {
      left: 0;
    }

    .divider::after {
      right: 0;
    }

    .divider span {
      font-size: 0.875rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0 1rem;
      background: transparent;
    }

    /* Social Login */
    .social-login {
      display: flex;
      justify-content: center;
      transition: opacity 0.3s var(--transition-smooth);
    }

    .social-login.disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    /* Form Footer */
    .form-footer {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
    }

    .signup-text {
      font-size: 0.9375rem;
      color: var(--text-secondary);
    }

    .signup-link {
      color: var(--text-primary);
      font-weight: 600;
      text-decoration: none;
      margin-left: 0.5rem;
      position: relative;
      transition: color 0.3s var(--transition-smooth);
    }

    .signup-link::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--primary-gradient);
      transition: width 0.3s var(--transition-smooth);
    }

    .signup-link:hover {
      color: #667eea;
    }

    .signup-link:hover::after {
      width: 100%;
    }

    /* ========================================
       RESPONSIVE DESIGN
       ======================================== */
    @media (max-width: 1200px) {
      .content-wrapper {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .brand-showcase {
        order: 2;
      }

      .form-container {
        order: 1;
      }

      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .login-container {
        padding: 1rem;
      }

      .form-glass {
        padding: 2rem 1.5rem;
      }

      .brand-name {
        font-size: 2.5rem;
      }

      .brand-tagline {
        font-size: 1rem;
      }

      .features-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .stats-section {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .form-title {
        font-size: 1.75rem;
      }

      .form-subtitle {
        font-size: 0.9375rem;
      }
    }

    @media (max-width: 480px) {
      .content-wrapper {
        gap: 1.5rem;
      }

      .form-glass {
        padding: 1.5rem 1rem;
        border-radius: 24px;
      }

      .brand-name {
        font-size: 2rem;
      }

      .logo-container {
        width: 80px;
        height: 80px;
      }

      .logo-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
      }

      .feature-card {
        padding: 1.5rem;
      }

      .submit-btn {
        padding: 0.875rem 1.5rem;
        font-size: 1rem;
      }
    }

    /* ========================================
       ANGULAR MATERIAL OVERRIDES
       ======================================== */
    ::ng-deep .mat-mdc-progress-spinner {
      --mdc-circular-progress-active-indicator-color: #ffffff;
    }

    ::ng-deep .mat-icon {
      font-family: 'Material Icons' !important;
      font-feature-settings: 'liga' 1;
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

    /* Focus visible for keyboard navigation */
    button:focus-visible,
    input:focus-visible,
    a:focus-visible {
      outline: 2px solid rgba(102, 126, 234, 0.8);
      outline-offset: 2px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;

  features = [
    {
      icon: 'security',
      title: 'Seguridad Total',
      description: 'Cifrado de extremo a extremo para datos médicos sensibles'
    },
    {
      icon: 'schedule',
      title: 'Citas Inteligentes',
      description: 'Sistema automatizado de gestión y recordatorios'
    },
    {
      icon: 'monitoring',
      title: 'Monitoreo 24/7',
      description: 'Seguimiento continuo de historiales clínicos'
    }
  ];

  stats = [
    { value: '10K+', label: 'Pacientes Activos' },
    { value: '500+', label: 'Profesionales' },
    { value: '99.9%', label: 'Disponibilidad' }
  ];

  private readonly destroyRef = inject(DestroyRef);
  private googleLoginInProgress = false;
  private lastGoogleUserId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router,
    private socialAuthService: SocialAuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadingService.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: boolean) => {
        this.loading = value;
      });

    this.socialAuthService.authState
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          if (user) {
            this.handleGoogleAuth(user);
          } else {
            this.googleLoginInProgress = false;
            this.lastGoogleUserId = null;
          }
        },
        error: (error) => {
          console.error('Error en Google OAuth:', error);
          this.googleLoginInProgress = false;
          this.lastGoogleUserId = null;
          this.loading = false;
        }
      });

    this.initializeGoogleAuth();
  }

  private initializeGoogleAuth(): void {
    try {
      const isDocker = window.location.hostname === 'localhost' || 
                      window.location.hostname === '0.0.0.0' ||
                      window.location.hostname.includes('docker');
      
      if (isDocker) {
        console.log('🐳 Detectado entorno Docker - configurando OAuth para contenedor');
      }
    } catch (error) {
      console.warn('No se pudo detectar el entorno:', error);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const credentials = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: (user) => {
          console.log('Login successful:', user);
          
          const dashboardConfig = this.authService.getDashboardConfig();
          const userDetection = this.authService.getUserDetection();
          
          if (dashboardConfig?.default_route) {
            this.router.navigate([dashboardConfig.default_route]);
          } else if (userDetection?.suggested_interface) {
            const routeMap: { [key: string]: string } = {
              'admin': '/admin',
              'doctor': '/dashboard',
              'patient': '/dashboard',
              'nurse': '/dashboard'
            };
            const route = routeMap[userDetection.suggested_interface] || '/dashboard';
            this.router.navigate([route]);
          } else {
            const roleRoute = this.getRoleBasedRoute(user.role);
            this.router.navigate([roleRoute]);
          }
        },
        error: (error: any) => {
          console.error('Login error:', error);
          this.loading = false;
          
          let errorMessage = 'Error al iniciar sesión';
          if (error.error?.detail) {
            errorMessage = error.error.detail;
          } else if (error.status === 401) {
            errorMessage = 'Credenciales inválidas';
          } else if (error.status === 0) {
            errorMessage = 'No se pudo conectar con el servidor';
          }
          
          console.error('Error message:', errorMessage);
        }
      });
    }
  }

  private getRoleBasedRoute(role: string): string {
    const roleRoutes: { [key: string]: string } = {
      'admin': '/admin',
      'doctor': '/dashboard',
      'patient': '/dashboard',
      'nurse': '/dashboard'
    };
    return roleRoutes[role] || '/dashboard';
  }

  private handleGoogleAuth(user: SocialUser): void {
    if (this.googleLoginInProgress && this.lastGoogleUserId === user.id) {
      return;
    }

    if (!user.id || !user.email) {
      console.error('Google sign-in error: datos incompletos en la respuesta de Google.');
      this.googleLoginInProgress = false;
      this.lastGoogleUserId = null;
      return;
    }
    
    this.googleLoginInProgress = true;
    this.lastGoogleUserId = user.id;
    this.loading = true;

    const response = (user as any)?.response as { email_verified?: boolean; emailVerified?: boolean } | undefined;
    const emailVerified =
      typeof response?.email_verified === 'boolean'
        ? response.email_verified
        : typeof response?.emailVerified === 'boolean'
          ? response.emailVerified
          : this.extractEmailVerified(user);

    const payload: GoogleLoginPayload = {
      googleId: user.id,
      email: user.email,
      name: user.name ?? undefined,
      given_name: user.firstName ?? undefined,
      family_name: user.lastName ?? undefined,
      picture: user.photoUrl ?? undefined,
      email_verified: emailVerified,
      token: user.idToken ?? user.authToken ?? undefined
    };
    
    this.authService.googleLogin(payload).subscribe({
      next: (user) => {
        console.log('Google login successful:', user);
        
        const dashboardConfig = this.authService.getDashboardConfig();
        const userDetection = this.authService.getUserDetection();
        
        if (dashboardConfig?.default_route) {
          this.router.navigate([dashboardConfig.default_route]);
        } else if (userDetection?.suggested_interface) {
          const routeMap: { [key: string]: string } = {
            'admin': '/admin',
            'doctor': '/dashboard',
            'patient': '/dashboard',
            'nurse': '/dashboard'
          };
          const route = routeMap[userDetection.suggested_interface] || '/dashboard';
          this.router.navigate([route]);
        } else {
          const roleRoute = this.getRoleBasedRoute(user.role);
          this.router.navigate([roleRoute]);
        }
      },
      error: error => {
        console.error('Google login error:', error);
        this.googleLoginInProgress = false;
        this.lastGoogleUserId = null;
        this.loading = false;
        this.socialAuthService.signOut();
        
        let errorMessage = 'Error al iniciar sesión con Google';
        if (error.error?.detail) {
          errorMessage = error.error.detail;
        } else if (error.status === 401) {
          errorMessage = 'Error de autenticación con Google';
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor';
        }
        
        console.error('Google login error message:', errorMessage);
      },
      complete: () => {
        this.googleLoginInProgress = false;
        this.lastGoogleUserId = null;
        this.loading = false;
      }
    });
  }

  private extractEmailVerified(user: SocialUser): boolean | undefined {
    const token = user.idToken ?? user.authToken;
    if (!token) {
      return undefined;
    }
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return undefined;
      }
      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const decoded = atob(padded);
      const payload = JSON.parse(decoded);
      return typeof payload.email_verified === 'boolean' ? payload.email_verified : undefined;
    } catch {
      return undefined;
    }
  }
}