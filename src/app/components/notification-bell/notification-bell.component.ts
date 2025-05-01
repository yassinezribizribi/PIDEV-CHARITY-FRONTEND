import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { Notification, NotificationType } from '../../interfaces/notification.interface';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatButtonModule,
    RouterLink,
    TimeAgoPipe
  ],
  template: `
    <div class="notification-container">
      <button mat-icon-button [matMenuTriggerFor]="menu" class="notification-button"
              [class.has-notifications]="unreadCount > 0">
        <mat-icon [matBadge]="unreadCount" 
                 [matBadgeHidden]="unreadCount === 0" 
                 matBadgeColor="warn"
                 class="notification-icon">
          notifications
        </mat-icon>
      </button>

      <mat-menu #menu="matMenu" class="notification-menu" [overlapTrigger]="false">
        <div class="notification-header">
          <h3>Notifications</h3>
          <button mat-button *ngIf="hasUnread" (click)="markAllAsRead(); $event.stopPropagation()">
            Mark all as read
          </button>
        </div>

        <div class="notification-list" *ngIf="notifications.length > 0">
          <div *ngFor="let notification of notifications" 
               class="notification-item"
               [class.unread]="!notification.read"
               (click)="onNotificationClick(notification)">
            <div class="notification-icon-wrapper" [ngClass]="getNotificationTypeClass(notification.type)">
              <mat-icon>{{getNotificationIcon(notification.type)}}</mat-icon>
            </div>
            <div class="notification-content">
              <div class="notification-title">
                <span class="sender-name">
                  {{ getSenderName(notification) }}
                </span>
                {{ notification.title }}
              </div>
              <div class="notification-message">{{notification.message}}</div>
              <div class="notification-time">{{notification.timestamp | timeAgo}}</div>
            </div>
          </div>
        </div>

        <div *ngIf="notifications.length === 0" class="no-notifications">
          No notifications
        </div>
      </mat-menu>
    </div>
  `,
  styles: [`
    .notification-container {
      position: relative;
    }

    .notification-button {
      padding: 0;
      margin: 0;
    }

    .notification-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: white;
    }

    .has-notifications .notification-icon {
      color: #4A6CF7;
    }

    :host ::ng-deep .notification-menu {
      max-width: 350px !important;
      width: 350px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      background: #f8f9fa;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #1e293b;
    }

    .notification-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      background: white;
    }

    .notification-item:hover {
      background-color: #f8f9fa;
    }

    .notification-item.unread {
      background-color: #EBF5FF;
    }

    .notification-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .notification-icon-wrapper mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: white;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 500;
      margin-bottom: 4px;
      color: #1e293b;
      font-size: 14px;
    }

    .notification-message {
      color: #64748b;
      font-size: 13px;
      margin-bottom: 4px;
      line-height: 1.4;
      white-space: normal;
      word-wrap: break-word;
    }

    .notification-time {
      color: #94a3b8;
      font-size: 12px;
    }

    .no-notifications {
      padding: 32px 16px;
      text-align: center;
      color: #94a3b8;
      font-size: 14px;
    }

    .type-healthcare {
      background-color: #22c55e;
    }

    .type-video-call {
      background-color: #3b82f6;
    }

    .type-message {
      background-color: #8b5cf6;
    }

    .type-partnership {
      background-color: #f59e0b;
    }

    .type-system {
      background-color: #64748b;
    }

    .type-tier-change {
      background: linear-gradient(135deg, #FFD700, #FFA500);
    }

    .type-tier-change mat-icon {
      color: #1e293b;
    }

    .notification-item.unread.tier-change {
      background-color: rgba(255, 215, 0, 0.1);
      border-left: 4px solid #FFD700;
    }

    .sender-name {
      font-weight: 600;
      color: #2563eb;
      margin-right: 4px;
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  hasUnread = false;
  private notificationSubscription?: Subscription;
  private currentUrl: string = '';

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Store current URL when component is created
    this.currentUrl = this.router.url;
  }

  ngOnInit() {
    this.loadNotifications();
    this.setupNotificationListener();
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  private loadNotifications() {
    this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
      this.updateUnreadCount();
    });
  }

  private setupNotificationListener() {
    this.notificationSubscription = this.notificationService.notificationStream$.subscribe(notification => {
      this.notifications.unshift(notification);
      this.updateUnreadCount();
    });
  }

  private updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
    this.hasUnread = this.unreadCount > 0;
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(notification => ({
          ...notification,
          read: true
        }));
        this.unreadCount = 0;
        this.toastr.success('All notifications marked as read');
      },
      error: (error) => {
        console.error('Error marking notifications as read:', error);
        this.toastr.error('Failed to mark notifications as read. Please try again.');
      }
    });
  }

  getNotificationIcon(type: NotificationType): string {
    const icons: { [key in NotificationType]: string } = {
      [NotificationType.HEALTHCARE_UPDATE]: 'local_hospital',
      [NotificationType.VIDEO_CALL]: 'videocam',
      [NotificationType.MESSAGE]: 'message',
      [NotificationType.PARTNERSHIP_REQUEST]: 'handshake',
      [NotificationType.SYSTEM]: 'info',
      [NotificationType.TIER_CHANGE]: 'military_tech',
      [NotificationType.PARTNERSHIP_REMOVED]: 'handshake',
    };
    return icons[type] || 'notifications';
  }

  getNotificationTypeClass(type: NotificationType): string {
    return `type-${type.toLowerCase().replace(/_/g, '-')}`;
  }

  onNotificationClick(notification: Notification) {
    // Store the current URL before navigation
    this.notificationService.setPreviousUrl(this.router.url);

    // Mark as read
    if (!notification.read) {
      this.notificationService.markAsRead(notification.idNotification).subscribe(() => {
        notification.read = true;
        this.updateUnreadCount();
      });
    }

    // Handle navigation
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
  }

  getSenderName(notification: Notification): string {
    if (!notification.sender) return '';
    if (notification.sender.firstName && notification.sender.lastName) {
      return `${notification.sender.firstName} ${notification.sender.lastName}`;
    }
    return notification.sender.username || 'System';
  }
} 