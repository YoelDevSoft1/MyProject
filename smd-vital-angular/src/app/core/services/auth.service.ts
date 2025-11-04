import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from '@environments/environment';

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export interface GoogleLoginPayload {
  googleId: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
  token?: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

interface AuthApiResponse extends AuthTokens {
  user_detection?: {
    detected_type: string;
    confidence: number;
    suggested_interface: string;
    category: string;
    permissions: string[];
  };
  dashboard_config?: {
    default_route: string;
    menu_items: any[];
    permissions: string[];
  };
}

interface UserResponse {
  id: string;
  email: string;
  username: string;
  role: string;
  is_active: boolean;
  is_verified?: boolean;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http
      .post<AuthApiResponse>(`${environment.apiUrl}${environment.apiEndpoints.auth.login}`, credentials)
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          this.persistTokens(response);
          // Guardar información adicional del backend si existe
          if (response.user_detection) {
            localStorage.setItem('user_detection', JSON.stringify(response.user_detection));
          }
          if (response.dashboard_config) {
            localStorage.setItem('dashboard_config', JSON.stringify(response.dashboard_config));
          }
        }),
        switchMap(() => this.fetchAndStoreUser())
      );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http
      .post<AuthApiResponse>(`${environment.apiUrl}${environment.apiEndpoints.auth.register}`, userData)
      .pipe(
        tap(response => {
          this.persistTokens(response);
          // Guardar información adicional del backend
          if (response.user_detection) {
            localStorage.setItem('user_detection', JSON.stringify(response.user_detection));
          }
          if (response.dashboard_config) {
            localStorage.setItem('dashboard_config', JSON.stringify(response.dashboard_config));
          }
        }),
        switchMap(() => this.fetchAndStoreUser())
      );
  }

  googleLogin(payload: GoogleLoginPayload): Observable<User> {
    return this.http
      .post<AuthApiResponse>(`${environment.apiUrl}${environment.apiEndpoints.auth.google}`, payload)
      .pipe(
        tap(response => {
          console.log('Google login response:', response);
          this.persistTokens(response);
          // Guardar información adicional del backend si existe
          if (response.user_detection) {
            localStorage.setItem('user_detection', JSON.stringify(response.user_detection));
          }
          if (response.dashboard_config) {
            localStorage.setItem('dashboard_config', JSON.stringify(response.dashboard_config));
          }
        }),
        switchMap(() => this.fetchAndStoreUser())
      );
  }

  logout(): void {
    this.http
      .post(`${environment.apiUrl}${environment.apiEndpoints.auth.logout}`, {})
      .pipe(catchError(() => of(null)))
      .subscribe();

    this.clearTokens();
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  getUserDetection(): any {
    const detection = localStorage.getItem('user_detection');
    return detection ? JSON.parse(detection) : null;
  }

  getDashboardConfig(): any {
    const config = localStorage.getItem('dashboard_config');
    return config ? JSON.parse(config) : null;
  }

  private setUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    if (!token) {
      return;
    }

    this.fetchAndStoreUser().subscribe({
      error: () => this.logout()
    });
  }

  private fetchAndStoreUser(): Observable<User> {
    // Crear un usuario básico para testing
    const user: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser',
      role: 'patient',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      isVerified: true
    };
    
    this.setUser(user);
    return of(user);
  }

  private mapUserResponse(response: UserResponse): User {
    return {
      id: response.id,
      email: response.email,
      username: response.username ?? response.email,
      role: response.role,
      firstName: response.first_name,
      lastName: response.last_name,
      profilePicture: response.profile_picture,
      isActive: response.is_active,
      isVerified: response.is_verified
    };
  }

  private persistTokens(tokens: AuthTokens): void {
    localStorage.setItem('token', tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem('refresh_token', tokens.refresh_token);
    }
    localStorage.setItem('token_type', tokens.token_type);
  }

  private clearTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user_detection');
    localStorage.removeItem('dashboard_config');
  }
}
