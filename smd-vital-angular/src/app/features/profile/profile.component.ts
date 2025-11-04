import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  specialization: string;
  experience: number;
  avatar: string;
  bio: string;
  address: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-header">
        <div class="profile-info">
          <div class="avatar-section">
            <div class="avatar">
              <mat-icon>person</mat-icon>
            </div>
            <button mat-icon-button class="edit-avatar">
              <mat-icon>camera_alt</mat-icon>
            </button>
          </div>
          
          <div class="user-details">
            <h1>{{ profile.name }}</h1>
            <p class="role">{{ profile.role }}</p>
            <p class="department">{{ profile.department }}</p>
            <div class="contact-info">
              <span><mat-icon>email</mat-icon> {{ profile.email }}</span>
              <span><mat-icon>phone</mat-icon> {{ profile.phone }}</span>
            </div>
          </div>
        </div>
        
        <div class="profile-actions">
          <button mat-raised-button color="primary">
            <mat-icon>edit</mat-icon>
            Editar Perfil
          </button>
          <button mat-button>
            <mat-icon>settings</mat-icon>
            Configuración
          </button>
        </div>
      </mat-card>

      <mat-card class="profile-content">
        <mat-tab-group>
          <mat-tab label="Información Personal">
            <div class="tab-content">
              <form class="profile-form">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Nombre completo</mat-label>
                    <input matInput [(ngModel)]="profile.name" name="name">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" [(ngModel)]="profile.email" name="email">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Teléfono</mat-label>
                    <input matInput [(ngModel)]="profile.phone" name="phone">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Especialización</mat-label>
                    <input matInput [(ngModel)]="profile.specialization" name="specialization">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Años de experiencia</mat-label>
                    <input matInput type="number" [(ngModel)]="profile.experience" name="experience">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Departamento</mat-label>
                    <mat-select [(ngModel)]="profile.department" name="department">
                      <mat-option value="Cardiología">Cardiología</mat-option>
                      <mat-option value="Neurología">Neurología</mat-option>
                      <mat-option value="Pediatría">Pediatría</mat-option>
                      <mat-option value="Medicina General">Medicina General</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Biografía</mat-label>
                  <textarea matInput 
                            rows="4" 
                            [(ngModel)]="profile.bio" 
                            name="bio"
                            placeholder="Cuéntanos sobre tu experiencia y especialización..."></textarea>
                </mat-form-field>
              </form>
            </div>
          </mat-tab>

          <mat-tab label="Dirección">
            <div class="tab-content">
              <form class="address-form">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Calle</mat-label>
                    <input matInput [(ngModel)]="profile.address.street" name="street">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Ciudad</mat-label>
                    <input matInput [(ngModel)]="profile.address.city" name="city">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Código Postal</mat-label>
                    <input matInput [(ngModel)]="profile.address.zipCode" name="zipCode">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>País</mat-label>
                    <input matInput [(ngModel)]="profile.address.country" name="country">
                  </mat-form-field>
                </div>
              </form>
            </div>
          </mat-tab>

          <mat-tab label="Contacto de Emergencia">
            <div class="tab-content">
              <form class="emergency-form">
                <div class="form-row">
                  <mat-form-field appearance="outline">
                    <mat-label>Nombre del contacto</mat-label>
                    <input matInput [(ngModel)]="profile.emergencyContact.name" name="emergencyName">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Teléfono</mat-label>
                    <input matInput [(ngModel)]="profile.emergencyContact.phone" name="emergencyPhone">
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline">
                  <mat-label>Relación</mat-label>
                  <mat-select [(ngModel)]="profile.emergencyContact.relationship" name="relationship">
                    <mat-option value="Cónyuge">Cónyuge</mat-option>
                    <mat-option value="Padre/Madre">Padre/Madre</mat-option>
                    <mat-option value="Hijo/Hija">Hijo/Hija</mat-option>
                    <mat-option value="Hermano/Hermana">Hermano/Hermana</mat-option>
                    <mat-option value="Amigo/Amiga">Amigo/Amiga</mat-option>
                    <mat-option value="Otro">Otro</mat-option>
                  </mat-select>
                </mat-form-field>
              </form>
            </div>
          </mat-tab>

          <mat-tab label="Seguridad">
            <div class="tab-content">
              <div class="security-section">
                <h3>Cambiar Contraseña</h3>
                <form class="password-form">
                  <mat-form-field appearance="outline">
                    <mat-label>Contraseña actual</mat-label>
                    <input matInput type="password" name="currentPassword">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Nueva contraseña</mat-label>
                    <input matInput type="password" name="newPassword">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Confirmar nueva contraseña</mat-label>
                    <input matInput type="password" name="confirmPassword">
                  </mat-form-field>
                  
                  <button mat-raised-button color="primary">Cambiar Contraseña</button>
                </form>
              </div>

              <div class="security-section">
                <h3>Autenticación de Dos Factores</h3>
                <div class="two-factor-info">
                  <mat-icon>security</mat-icon>
                  <div>
                    <p>Protege tu cuenta con autenticación de dos factores</p>
                    <button mat-stroked-button>Configurar 2FA</button>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
    }

    .profile-header {
      margin-bottom: 20px;
      padding: 24px;
    }

    .profile-info {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 20px;
    }

    .avatar-section {
      position: relative;
    }

    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-color), #4caf50);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 3rem;
    }

    .edit-avatar {
      position: absolute;
      bottom: 0;
      right: 0;
      background-color: var(--primary-color);
      color: white;
    }

    .user-details h1 {
      margin: 0 0 8px 0;
      color: var(--text-color);
    }

    .role {
      font-size: 1.1rem;
      color: var(--primary-color);
      font-weight: 500;
      margin: 0 0 4px 0;
    }

    .department {
      color: var(--text-secondary);
      margin: 0 0 16px 0;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .contact-info span {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
    }

    .profile-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .profile-content {
      margin-bottom: 20px;
    }

    .tab-content {
      padding: 24px;
    }

    .profile-form,
    .address-form,
    .emergency-form,
    .password-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .security-section {
      margin-bottom: 32px;
    }

    .security-section h3 {
      color: var(--text-color);
      margin-bottom: 16px;
    }

    .two-factor-info {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .two-factor-info mat-icon {
      font-size: 2rem;
      color: var(--primary-color);
    }

    @media (max-width: 768px) {
      .profile-info {
        flex-direction: column;
        text-align: center;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .profile-actions {
        justify-content: center;
      }

      .contact-info {
        align-items: center;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profile: UserProfile = {
    id: '1',
    name: 'Dr. María García',
    email: 'maria.garcia@smdvital.com',
    phone: '+34 600 123 456',
    role: 'Médico Especialista',
    department: 'Cardiología',
    specialization: 'Cardiología Intervencionista',
    experience: 8,
    avatar: '',
    bio: 'Especialista en cardiología con más de 8 años de experiencia en el tratamiento de enfermedades cardiovasculares.',
    address: {
      street: 'Calle Mayor 123',
      city: 'Madrid',
      zipCode: '28001',
      country: 'España'
    },
    emergencyContact: {
      name: 'Carlos García',
      phone: '+34 600 987 654',
      relationship: 'Cónyuge'
    }
  };

  ngOnInit() {
    console.log('Profile component initialized');
  }
}
