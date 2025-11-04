import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <div class="not-found-container">
      <mat-card class="not-found-card">
        <mat-card-content>
          <div class="not-found-content">
            <div class="error-icon">
              <mat-icon>error_outline</mat-icon>
            </div>
            
            <h1 class="error-code">404</h1>
            <h2 class="error-title">Página no encontrada</h2>
            <p class="error-message">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
            
            <div class="error-actions">
              <button mat-raised-button color="primary" routerLink="/dashboard">
                <mat-icon>home</mat-icon>
                Ir al Inicio
              </button>
              <button mat-button routerLink="/dashboard">
                <mat-icon>arrow_back</mat-icon>
                Volver Atrás
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .not-found-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
    }

    .not-found-content {
      padding: 40px 20px;
    }

    .error-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      margin: 0 auto 20px;
      color: var(--primary-color);
    }

    .error-code {
      font-size: 6rem;
      font-weight: bold;
      color: var(--primary-color);
      margin: 0 0 16px 0;
      line-height: 1;
    }

    .error-title {
      font-size: 2rem;
      color: var(--text-color);
      margin: 0 0 16px 0;
      font-weight: 500;
    }

    .error-message {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin: 0 0 32px 0;
      line-height: 1.6;
    }

    .error-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .error-actions button {
      min-width: 160px;
    }

    @media (max-width: 768px) {
      .error-code {
        font-size: 4rem;
      }

      .error-title {
        font-size: 1.5rem;
      }

      .error-actions {
        flex-direction: column;
        align-items: center;
      }

      .error-actions button {
        width: 100%;
        max-width: 200px;
      }
    }
  `]
})
export class NotFoundComponent {
  constructor() {
    console.log('NotFound component initialized');
  }
}