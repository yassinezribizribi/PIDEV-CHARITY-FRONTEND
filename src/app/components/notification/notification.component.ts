import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { Notification, NotificationType } from '../../interfaces/notification.interface';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotifications = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to notifications
    this.subscriptions.push(
      this.notificationService.getNotifications().subscribe(
        notifications => this.notifications = notifications
      )
    );

    // Subscribe to unread count
    this.subscriptions.push(
      this.notificationService.getUnreadCount().subscribe(
        count => this.unreadCount = count
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.HEALTHCARE_UPDATE:
        return 'fa-heartbeat';
      case NotificationType.VIDEO_CALL:
        return 'fa-video';
      case NotificationType.TIER_CHANGE:
        return 'fa-star';
      case NotificationType.PARTNERSHIP_REQUEST:
        return 'fa-handshake';
      case NotificationType.PARTNERSHIP_REMOVED:
        return 'fa-user-times';
      default:
        return 'fa-bell';
    }
  }

  getNotificationColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.HEALTHCARE_UPDATE:
        return 'text-info';
      case NotificationType.VIDEO_CALL:
        return 'text-success';
      case NotificationType.TIER_CHANGE:
        return 'text-warning';
      case NotificationType.PARTNERSHIP_REQUEST:
        return 'text-primary';
      case NotificationType.PARTNERSHIP_REMOVED:
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.idNotification).subscribe();
    }

    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }
} 