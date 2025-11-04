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

import { AuthService, RegisterRequest } from '@core/services/auth.service';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="register-page">
      <div class="register-background"></div>
      <div class="register-content">
        <div class="brand-panel">
          <div class="brand-logo">
            <mat-icon>volunteer_activism</mat-icon>
          </div>
          <div>
            <h1 class="brand-title">Únete a SMD VITAL</h1>
            <p class="brand-subtitle">
              Registra tu cuenta para coordinar la atención integral de tus pacientes con una plataforma segura.
            </p>
          </div>
          <ul class="brand-highlights">
            <li>
              <mat-icon>shield</mat-icon>
              Seguridad clínica y respaldo continuo
            </li>
            <li>
              <mat-icon>hub</mat-icon>
              Integraciones con laboratorios y farmacias
            </li>
            <li>
              <mat-icon>support_agent</mat-icon>
              Soporte experto 24/7
            </li>
          </ul>
        </div>

        <mat-card class="form-card">
          <mat-card-content>
            <div class="form-header">
              <span class="welcome-badge">
                <mat-icon>emoji_people</mat-icon>
                ¡Bienvenido!
              </span>
              <h2>Crear cuenta</h2>
              <p>Completa la información para comenzar a gestionar pacientes y servicios digitales.</p>
            </div>

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
              <div class="form-row">
                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Nombre</mat-label>
                  <input
                    matInput
                    type="text"
                    formControlName="firstName"
                    placeholder="Ana"
                    autocomplete="given-name"
                  >
                  <mat-icon matSuffix>person</mat-icon>
                  <mat-error *ngIf="firstName?.hasError('required')">
                    El nombre es obligatorio
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field">
                  <mat-label>Apellido</mat-label>
                  <input
                    matInput
                    type="text"
                    formControlName="lastName"
                    placeholder="Pérez"
                    autocomplete="family-name"
                  >
                  <mat-error *ngIf="lastName?.hasError('required')">
                    El apellido es obligatorio
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Correo electrónico</mat-label>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  placeholder="correo@ejemplo.com"
                  autocomplete="email"
                >
                <mat-icon matSuffix>mail</mat-icon>
                <mat-error *ngIf="email?.hasError('required')">
                  El correo es obligatorio
                </mat-error>
                <mat-error *ngIf="email?.hasError('email')">
                  Ingresa un correo válido
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Contraseña</mat-label>
                <input
                  matInput
                  [type]="hidePassword ? 'password' : 'text'"
                  formControlName="password"
                  placeholder="Mínimo 8 caracteres"
                  autocomplete="new-password"
                >
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="hidePassword = !hidePassword"
                  [attr.aria-label]="hidePassword ? 'Mostrar contraseña' : 'Ocultar contraseña'"
                >
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-hint align="end">Incluye letras y números</mat-hint>
                <mat-error *ngIf="password?.hasError('required')">
                  La contraseña es obligatoria
                </mat-error>
                <mat-error *ngIf="password?.hasError('minlength')">
                  Debe tener al menos 8 caracteres
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Confirmar contraseña</mat-label>
                <input
                  matInput
                  [type]="hideConfirmPassword ? 'password' : 'text'"
                  formControlName="confirmPassword"
                  placeholder="Vuelve a escribir tu contraseña"
                  autocomplete="new-password"
                >
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="hideConfirmPassword = !hideConfirmPassword"
                  [attr.aria-label]="hideConfirmPassword ? 'Mostrar confirmación' : 'Ocultar confirmación'"
                >
                  <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="confirmPassword?.hasError('required')">
                  Confirma tu contraseña
                </mat-error>
                <mat-error *ngIf="confirmPassword?.hasError('passwordMismatch')">
                  Las contraseñas no coinciden
                </mat-error>
              </mat-form-field>

              <div class="form-actions">
                <button
                  mat-flat-button
                  color="primary"
                  type="submit"
                  class="submit-button"
                  [disabled]="registerForm.invalid || loading"
                >
                  <span class="submit-content" [class.is-loading]="loading">
                    <mat-icon>person_add</mat-icon>
                    Crear cuenta
                  </span>
                  <mat-progress-spinner
                    *ngIf="loading"
                    class="submit-spinner"
                    diameter="20"
                    strokeWidth="3"
                    mode="indeterminate"
                  ></mat-progress-spinner>
                </button>

                <div class="divider">
                  <span>o continuar con</span>
                </div>

                <button
                  mat-stroked-button
                  type="button"
                  class="google-button"
                  (click)="googleLogin()"
                  [disabled]="loading"
                >
                  <span class="google-icon">G</span>
                  Google
                </button>
              </div>
            </form>

            <div class="support-text">
              <span>¿Ya tienes cuenta?</span>
              <button
                mat-stroked-button
                color="primary"
                class="login-button"
                routerLink="/login"
              >
                <mat-icon>login</mat-icon>
                Inicia sesión
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .register-page {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      background: linear-gradient(135deg, #0a1f44 0%, #152c58 45%, #0e223f 100%);
      overflow: hidden;
    }

    .register-background {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 15% 20%, rgba(59, 130, 246, 0.18), transparent 60%),
        radial-gradient(circle at 80% 35%, rgba(45, 212, 191, 0.18), transparent 60%),
        radial-gradient(circle at 30% 80%, rgba(14, 116, 144, 0.22), transparent 60%);
      opacity: 0.55;
      z-index: 0;
    }

    .register-content {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: minmax(260px, 340px) minmax(320px, 440px);
      gap: 48px;
      align-items: stretch;
      width: min(980px, 100%);
    }

    .brand-panel {
      display: flex;
      flex-direction: column;
      gap: 28px;
      padding: 38px;
      border-radius: 26px;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      backdrop-filter: blur(18px);
      box-shadow: 0 25px 60px rgba(8, 47, 73, 0.35);
    }

    .brand-logo {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, rgba(45, 212, 191, 0.9), rgba(29, 185, 200, 0.65));
      box-shadow: 0 12px 24px rgba(29, 185, 200, 0.35);
    }

    .brand-logo mat-icon {
      font-size: 30px;
      color: #ffffff;
    }

    .brand-title {
      font-size: 1.9rem;
      font-weight: 600;
      margin: 0 0 10px;
      font-family: var(--font-family-display);
    }

    .brand-subtitle {
      margin: 0;
      color: rgba(255, 255, 255, 0.85);
      line-height: 1.6;
      font-size: 0.98rem;
    }

    .brand-highlights {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
      font-size: 0.95rem;
    }

    .brand-highlights li {
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(255, 255, 255, 0.88);
    }

    .brand-highlights mat-icon {
      font-size: 22px;
      color: #b0f4ff;
    }

    .form-card {
      border-radius: 26px;
      box-shadow: 0 24px 52px rgba(8, 47, 73, 0.28);
    }

    .form-card mat-card-content {
      padding: 40px 36px;
    }

    .form-header {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 28px;
      color: var(--text-color);
    }

    .form-header h2 {
      margin: 0;
      font-size: 1.9rem;
      font-weight: 600;
      font-family: var(--font-family-display);
    }

    .form-header p {
      margin: 0;
      color: var(--text-secondary);
    }

    .welcome-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(59, 130, 246, 0.12);
      color: var(--brand-primary-80);
      font-size: 0.85rem;
      font-weight: 600;
      width: fit-content;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .form-field {
      width: 100%;
    }

    .form-field button[mat-icon-button] {
      color: var(--text-secondary);
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 18px;
      margin-top: 12px;
    }

    .submit-button {
      position: relative;
      height: 52px;
      border-radius: 14px;
      font-weight: 600;
      letter-spacing: 0.4px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      overflow: hidden;
    }

    .submit-button .submit-content {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      transition: opacity 0.2s ease;
    }

    .submit-button .submit-content.is-loading {
      opacity: 0.18;
    }

    .submit-spinner {
      position: absolute;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text-muted);
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(15, 23, 42, 0.12);
    }

    .google-button {
      height: 48px;
      border-radius: 14px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .google-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #ffffff;
      color: #4285f4;
      font-weight: 700;
      font-size: 1rem;
    }

    .support-text {
      margin-top: 28px;
      text-align: center;
      font-size: 0.95rem;
      color: var(--text-secondary);
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }

    .login-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      border-radius: 999px;
      font-weight: 600;
    }

    @media (max-width: 1024px) {
      .register-content {
        grid-template-columns: 1fr;
        gap: 32px;
      }

      .brand-panel {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
      }

      .brand-highlights {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 16px 24px;
      }

      .brand-highlights li {
        flex: 1 1 45%;
      }
    }

    @media (max-width: 720px) {
      .register-page {
        padding: 24px;
      }

      .register-content {
        gap: 24px;
      }

      .brand-panel {
        flex-direction: column;
        align-items: flex-start;
      }

      .brand-highlights li {
        flex: 1 1 100%;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .register-page {
        padding: 16px;
      }

      .form-card mat-card-content {
        padding: 32px 24px;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  loading = false;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.loadingService.loading$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((loading: boolean) => (this.loading = loading));
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword.hasError('passwordMismatch')) {
      const { passwordMismatch, ...otherErrors } = confirmPassword.errors ?? {};
      confirmPassword.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { confirmPassword: _confirmPassword, firstName, lastName, email, password } = this.registerForm.value;

    const payload: RegisterRequest = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      username: email?.split('@')[0] ?? email,
      role: 'patient'
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: error => {
        console.error('Registration error:', error);
      }
    });
  }

  googleLogin(): void {
    // Redirigir al flujo de autenticación principal donde se maneja Google
    this.router.navigate(['/login'], { queryParams: { continueWith: 'google' } });
  }
}
