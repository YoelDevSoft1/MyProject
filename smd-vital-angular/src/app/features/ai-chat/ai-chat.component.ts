import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'suggestion' | 'diagnosis';
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    FormsModule
  ],
  template: `
    <div class="ai-chat-container">
      <mat-card class="chat-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>smart_toy</mat-icon>
            Asistente Médico IA
          </mat-card-title>
          <mat-card-subtitle>Tu asistente inteligente para consultas médicas</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content class="chat-content">
          <div class="chat-messages" #chatMessages>
            <div *ngFor="let message of messages" 
                 class="message" 
                 [ngClass]="'message-' + message.sender">
              <div class="message-avatar">
                <mat-icon *ngIf="message.sender === 'user'">person</mat-icon>
                <mat-icon *ngIf="message.sender === 'ai'">smart_toy</mat-icon>
              </div>
              
              <div class="message-content">
                <div class="message-text" [innerHTML]="message.content"></div>
                <div class="message-time">{{ message.timestamp | date:'short' }}</div>
              </div>
            </div>
            
            <div *ngIf="isTyping" class="message message-ai">
              <div class="message-avatar">
                <mat-icon>smart_toy</mat-icon>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
        
        <mat-card-actions class="chat-actions">
          <div class="suggestions" *ngIf="suggestions.length > 0">
            <mat-chip *ngFor="let suggestion of suggestions" 
                     (click)="selectSuggestion(suggestion)"
                     class="suggestion-chip">
              {{ suggestion }}
            </mat-chip>
          </div>
          
          <div class="input-container">
            <mat-form-field appearance="outline" class="message-input">
              <mat-label>Escribe tu consulta médica...</mat-label>
              <input matInput 
                     [(ngModel)]="currentMessage" 
                     (keyup.enter)="sendMessage()"
                     placeholder="Ej: Tengo dolor de cabeza desde hace 2 días">
            </mat-form-field>
            
            <button mat-fab 
                    color="primary" 
                    (click)="sendMessage()"
                    [disabled]="!currentMessage.trim() || isTyping">
              <mat-icon>send</mat-icon>
            </button>
          </div>
        </mat-card-actions>
      </mat-card>

      <div class="chat-sidebar">
        <mat-card class="quick-actions">
          <mat-card-header>
            <mat-card-title>Acciones Rápidas</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <button mat-stroked-button 
                    *ngFor="let action of quickActions" 
                    (click)="selectQuickAction(action)"
                    class="quick-action-btn">
              <mat-icon>{{ action.icon }}</mat-icon>
              {{ action.label }}
            </button>
          </mat-card-content>
        </mat-card>

        <mat-card class="chat-history">
          <mat-card-header>
            <mat-card-title>Historial de Chats</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="history-item" 
                 *ngFor="let session of chatSessions"
                 (click)="loadSession(session)">
              <div class="session-title">{{ session.title }}</div>
              <div class="session-date">{{ session.date | date:'short' }}</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .ai-chat-container {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 20px;
      padding: 20px;
      height: calc(100vh - 120px);
    }

    .chat-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .chat-content {
      flex: 1;
      overflow: hidden;
      padding: 0;
    }

    .chat-messages {
      height: 100%;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .message-user {
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--primary-color);
      color: white;
      flex-shrink: 0;
    }

    .message-ai .message-avatar {
      background-color: #4caf50;
    }

    .message-content {
      flex: 1;
      max-width: 70%;
    }

    .message-user .message-content {
      text-align: right;
    }

    .message-text {
      background-color: #f5f5f5;
      padding: 12px 16px;
      border-radius: 18px;
      margin-bottom: 4px;
      word-wrap: break-word;
    }

    .message-user .message-text {
      background-color: var(--primary-color);
      color: white;
    }

    .message-time {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #4caf50;
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.5;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }

    .chat-actions {
      padding: 16px;
      border-top: 1px solid var(--border-color);
    }

    .suggestions {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .suggestion-chip {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .suggestion-chip:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .input-container {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .message-input {
      flex: 1;
    }

    .chat-sidebar {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .quick-actions {
      margin-bottom: 20px;
    }

    .quick-action-btn {
      width: 100%;
      margin-bottom: 8px;
      justify-content: flex-start;
    }

    .chat-history {
      flex: 1;
    }

    .history-item {
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s ease;
      margin-bottom: 8px;
    }

    .history-item:hover {
      background-color: #f5f5f5;
    }

    .session-title {
      font-weight: 500;
      color: var(--text-color);
      margin-bottom: 4px;
    }

    .session-date {
      font-size: 12px;
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .ai-chat-container {
        grid-template-columns: 1fr;
        height: auto;
      }

      .chat-sidebar {
        order: -1;
      }

      .message-content {
        max-width: 85%;
      }
    }
  `]
})
export class AiChatComponent implements OnInit {
  currentMessage: string = '';
  messages: ChatMessage[] = [];
  isTyping: boolean = false;
  suggestions: string[] = [
    'Síntomas de gripe',
    'Dolor de cabeza persistente',
    'Problemas digestivos',
    'Ansiedad y estrés'
  ];

  quickActions = [
    { icon: 'sick', label: 'Síntomas Comunes' },
    { icon: 'medication', label: 'Información de Medicamentos' },
    { icon: 'schedule', label: 'Programar Cita' },
    { icon: 'emergency', label: 'Emergencia Médica' }
  ];

  chatSessions = [
    { id: '1', title: 'Consulta sobre dolor de cabeza', date: new Date('2025-10-06') },
    { id: '2', title: 'Síntomas de gripe', date: new Date('2025-10-05') },
    { id: '3', title: 'Problemas digestivos', date: new Date('2025-10-04') }
  ];

  ngOnInit() {
    this.addWelcomeMessage();
  }

  addWelcomeMessage() {
    this.messages.push({
      id: '1',
      content: '¡Hola! Soy tu asistente médico inteligente. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre síntomas, medicamentos, o cualquier consulta médica que tengas.',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    });
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: this.currentMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    this.messages.push(userMessage);
    const message = this.currentMessage;
    this.currentMessage = '';

    this.isTyping = true;
    setTimeout(() => {
      this.generateAIResponse(message);
      this.isTyping = false;
    }, 1500);
  }

  generateAIResponse(userMessage: string) {
    const responses = [
      'Entiendo tu consulta. Basándome en los síntomas que describes, te recomiendo que consultes con un médico para una evaluación más detallada.',
      'Es importante que mantengas un registro de tus síntomas y consultes con un profesional de la salud si persisten.',
      'Para este tipo de síntomas, te sugiero programar una cita médica para una evaluación completa.',
      'Recuerda que no puedo reemplazar una consulta médica presencial, pero puedo ayudarte a entender mejor tus síntomas.'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    this.messages.push({
      id: Date.now().toString(),
      content: randomResponse,
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    });
  }

  selectSuggestion(suggestion: string) {
    this.currentMessage = suggestion;
    this.sendMessage();
  }

  selectQuickAction(action: { icon: string; label: string }) {
    const messages: { [key: string]: string } = {
      'Síntomas Comunes': '¿Podrías describir los síntomas que estás experimentando?',
      'Información de Medicamentos': '¿Sobre qué medicamento te gustaría obtener información?',
      'Programar Cita': 'Te ayudo a programar una cita. ¿Para qué fecha prefieres?',
      'Emergencia Médica': 'Si es una emergencia médica, te recomiendo contactar inmediatamente con los servicios de emergencia al 112.'
    };

    this.currentMessage = messages[action.label] || action.label;
    this.sendMessage();
  }

  loadSession(session: { id: string; title: string; date: Date }) {
    // Implementar carga de sesión
    console.log('Loading session:', session);
  }
}
