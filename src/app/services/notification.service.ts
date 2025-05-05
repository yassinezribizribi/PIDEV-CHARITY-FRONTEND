import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, forkJoin, of, mergeMap } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Notification, NotificationType } from '../interfaces/notification.interface';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

// Interface for raw message data from API
interface RawMessageData {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  senderAvatar?: string;
  title: string;
  read: boolean;
  senderName?: string;
  sender?: {
    idUser: number;
    username: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
  conversationId?: number;
}

export interface MessageNotification extends Omit<Notification, 'type'> {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  senderAvatar?: string;
  senderName?: string;
  type: NotificationType.MESSAGE;
  conversationId?: number;
  sender?: {
    idUser: number;
    username: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
}

interface SenderInfo {
  id: number;
  firstName: string;
  lastName: string;
}

interface MessageSender {
  idUser: number;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private notifications = new BehaviorSubject<Notification[]>([]);
  private unreadCount = new BehaviorSubject<number>(0);
  private messages = new BehaviorSubject<MessageNotification[]>([]);
  private notificationSubject = new Subject<Notification>();
  notificationStream$ = this.notificationSubject.asObservable();
  private previousUrl: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.loadNotifications();
    this.setupWebSocket();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      // Token expired or invalid, try to refresh
      this.handleTokenExpiration();
    }
    return throwError(() => error);
  }

  private handleTokenExpiration() {
    const currentToken = this.authService.getToken();
    if (!currentToken) {
      this.authService.logout();
      return;
    }

    this.http.post<{token: string}>(`${environment.apiUrl}/auth/refresh`, { token: currentToken })
      .pipe(
        tap(response => {
          this.authService.setToken(response.token);
          this.loadNotifications();
        }),
      catchError(error => {
          this.authService.logout();
          return throwError(() => error);
        })
      ).subscribe();
  }

  loadNotifications(): void {
    const headers = this.getHeaders();
    this.http.get<Notification[]>(`${this.apiUrl}`, { headers }).pipe(
      tap(notifications => {
        this.notifications.next(notifications);
        this.updateUnreadCount(notifications);
      }),
      catchError(this.handleError.bind(this))
    ).subscribe();
  }

  getNotifications(): Observable<Notification[]> {
    return this.notifications.pipe(
      map(notifications => notifications.map(notification => ({
        ...notification,
        sender: notification.sender || { username: 'System', idUser: 0 },
        timestamp: new Date(notification.timestamp)
      })))
    );
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount.asObservable();
  }

  markAsRead(notificationId: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.post<void>(`${this.apiUrl}/${notificationId}/read`, {}, { headers }).pipe(
      tap(() => {
        const currentNotifications = this.notifications.value;
        const updatedNotifications = currentNotifications.map(notification => 
          notification.idNotification === notificationId 
            ? { ...notification, read: true }
            : notification
        );
        this.notifications.next(updatedNotifications);
        this.updateUnreadCount(updatedNotifications);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  markAllAsRead(): Observable<unknown> {
    const headers = this.getHeaders();
    const currentNotifications = this.notifications.value;
    
    if (currentNotifications.length === 0) {
      return of(undefined);
    }
    
    // Create an array of observables for marking each notification as read
    const markReadObservables = currentNotifications
      .filter(notification => !notification.read)
      .map(notification => 
        this.http.post<void>(
          `${this.apiUrl}/${notification.idNotification}/read`,
          {},
          { headers }
        )
      );
    
    // Use forkJoin to execute all requests in parallel
    return forkJoin(markReadObservables).pipe(
      map(() => undefined),
      tap(() => {
        // Update all notifications as read in the local state
        const updatedNotifications = currentNotifications.map(notification => ({
          ...notification,
          read: true
        }));
        this.notifications.next(updatedNotifications);
        this.unreadCount.next(0);
      }),
      catchError(error => {
        console.error('Error marking notifications as read:', error);
        return throwError(() => error);
      })
    );
  }

  deleteNotification(notificationId: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`, { headers }).pipe(
      tap(() => {
        const currentNotifications = this.notifications.value;
        const updatedNotifications = currentNotifications.filter(
          notification => notification.idNotification !== notificationId
        );
        this.notifications.next(updatedNotifications);
        this.updateUnreadCount(updatedNotifications);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const unreadCount = notifications.filter(notification => !notification.read).length;
    this.unreadCount.next(unreadCount);
  }

  // Method to handle incoming real-time notifications
  addNotification(notification: Notification): void {
    const currentNotifications = this.notifications.value;
    this.notifications.next([notification, ...currentNotifications]);
    this.updateUnreadCount([notification, ...currentNotifications]);
  }

  // Method to get notifications by type
  getNotificationsByType(type: string): Observable<Notification[]> {
    return this.notifications.pipe(
      map(notifications => notifications.filter(notification => notification.type === type))
    );
  }

  // Healthcare notification methods
  sendHealthcareNotification(patientId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/healthcare/${patientId}`, {}).pipe(
      tap(() => {
        // Update local notifications after sending
        this.loadNotifications();
      })
    );
  }

  // Video call notification methods
  sendVideoNotification(patientId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/video-call/${patientId}`, {}).pipe(
      tap(() => {
        // Update local notifications after sending
        this.loadNotifications();
      })
    );
  }

  // Message notification methods
  getUnreadMessages(): Observable<MessageNotification[]> {
    const headers = this.getHeaders();
    const userId = this.authService.getUserId();
    
    return this.http.get<RawMessageData[]>(`${this.apiUrl}/unread/${userId}`, { headers }).pipe(
      map(messages => messages.map(message => {
        // Create base notification object
        const baseNotification: MessageNotification = {
          id: message.id,
          idNotification: message.id,
          title: message.title || '',
          message: message.content,
          content: message.content,
          timestamp: new Date(message.timestamp),
          read: message.read,
          senderId: message.senderId,
          receiverId: message.receiverId,
          type: NotificationType.MESSAGE,
          conversationId: message.conversationId
        };

        // If we have a senderId, get the complete user information
        if (message.senderId) {
          return this.authService.getUserById(message.senderId).pipe(
            map(user => ({
              ...baseNotification,
              senderAvatar: message.senderAvatar || 'assets/images/default-logo.jpg',
              senderName: `${user.firstName} ${user.lastName}`.trim() || user.email.split('@')[0],
              sender: {
                idUser: user.idUser,
                username: user.email,
                firstName: user.firstName || user.email.split('@')[0],
                lastName: user.lastName || '',
                profileImage: message.senderAvatar || 'assets/images/default-logo.jpg'
              }
            }))
          );
        }

        return of(baseNotification);
      })),
      // Use forkJoin to wait for all user info requests to complete
      mergeMap(observables => forkJoin(observables)),
      tap(messages => {
        this.messages.next(messages);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  markMessageAsRead(messageId: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.put<void>(`${this.apiUrl}/${messageId}/read`, {}, { headers }).pipe(
      tap(() => {
        const currentMessages = this.messages.value;
        const updatedMessages = currentMessages.map(message =>
          message.id === messageId ? { ...message, read: true } : message
        );
        this.messages.next(updatedMessages);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  getMessages(): Observable<MessageNotification[]> {
    return this.messages.asObservable();
  }

  private setupWebSocket() {
    // Implement WebSocket connection for real-time notifications
    // This is a placeholder for the actual WebSocket implementation
    // When a new notification arrives via WebSocket, emit it through the subject:
    // this.notificationSubject.next(newNotification);
  }

  // Method to manually emit a new notification (useful for testing or manual updates)
  emitNotification(notification: Notification) {
    this.notificationSubject.next(notification);
  }

  setPreviousUrl(url: string) {
    this.previousUrl = url;
  }

  getPreviousUrl(): string {
    return this.previousUrl || '/profile'; // Default to profile if no previous URL
  }

  // Add method to handle back navigation
  navigateBack(router: Router) {
    const previousUrl = this.getPreviousUrl();
    router.navigate([previousUrl]);
  }

  markAllMessagesAsRead(): Observable<any> {
    const headers = this.getHeaders();
    // Get current unread messages
    const currentMessages = this.messages.value;
    
    if (currentMessages.length === 0) {
      return of(null);
    }
    
    // Create an array of observables for marking each message as read
    const markReadObservables = currentMessages.map(message => 
      this.http.put(`${this.apiUrl}/${message.id}/read`, {}, { headers })
    );
    
    // Use forkJoin to execute all requests in parallel
    return forkJoin(markReadObservables).pipe(
      tap(() => {
        // Clear the messages array after all messages are marked as read
        this.messages.next([]);
      }),
      catchError(error => {
        console.error('Error marking messages as read:', error);
        return throwError(() => error);
      })
    );
  }
}
