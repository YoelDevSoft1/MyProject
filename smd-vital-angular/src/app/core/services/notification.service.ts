import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private http: HttpClient) {}

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${environment.apiUrl}${environment.apiEndpoints.notifications.list}`);
  }

  getUnreadCount(): Observable<number> {
    return this.http
      .get<number>(`${environment.apiUrl}${environment.apiEndpoints.notifications.list}/unread-count`)
      .pipe(
        catchError(() => of(0))
      );
  }

  markAsRead(id: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}${environment.apiEndpoints.notifications.markRead}/${id}`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}${environment.apiEndpoints.notifications.markRead}/all`, {});
  }
}
