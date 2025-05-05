import { Component, OnInit } from '@angular/core';
import { JobOfferService } from '../services/jof-offer.service';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { JobOffer } from '../models/job-offer.model';
import { JobApplication } from '../models/job-application.model';
import { NotificationService, MessageNotification } from '../services/notification.service';
import { interval } from 'rxjs';

interface UserProfile {
  idUser: number;
  email: string;
  firstName?: string;
  lastName?: string;
  username: string;
  profileImage?: string;
  roles?: string[];
  isBanned?: boolean;
  banreason?: string | null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [NavbarComponent, CommonModule, RouterLink]
})
export class ProfileComponent implements OnInit {
  currentUser: UserProfile | null = null;
  userJobOffers: JobOffer[] = [];
  jobApplications: JobApplication[] = [];
  loading: boolean = true;
  unreadMessages: MessageNotification[] = [];
  showNotifications: boolean = false;
  profileImage: string = 'assets/images/default-logo.jpg';
  isBanned: boolean = false;
  banReason: string | null = null;

  constructor(
    private authService: AuthService,
    private jobOfferService: JobOfferService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is logged in
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    const userInfo = this.authService.getUserInfo();

    if (userInfo.idUser && userInfo.email) {
      // Get detailed user info
      this.authService.getUserByEmail(userInfo.email).subscribe({
        next: (user) => {
          this.currentUser = {
            idUser: user.idUser,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.email.split('@')[0],
            profileImage: undefined,
            isBanned: user.isBanned,
            banreason: user.banreason || null
          };
          
          this.isBanned = user.isBanned || false;
          this.banReason = user.banreason || null;
          
          if (!this.isBanned) {
            this.loadUserProfile();
            this.loadUnreadMessages();
            
            // Poll for new messages every 30 seconds
            interval(30000).subscribe(() => {
              this.loadUnreadMessages();
            });
          }
        },
        error: (error: Error) => {
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
    if (this.currentUser?.profileImage) {
      this.profileImage = this.currentUser.profileImage;
    }
  }

  loadUnreadMessages() {
    this.notificationService.getUnreadMessages().subscribe({
      next: (messages: MessageNotification[]) => {
        this.unreadMessages = messages;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error loading messages:', err);
      }
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markMessageAsRead(message: MessageNotification) {
    this.notificationService.markMessageAsRead(message.id).subscribe({
      next: () => {
        // Remove the message from unread messages
        this.unreadMessages = this.unreadMessages.filter(m => m.id !== message.id);
        // Navigate to the conversation
        this.router.navigate(['/conversation', message.senderId]);
      },
      error: (err: Error) => {
        console.error('Error marking message as read:', err);
      }
    });
  }

  loadUserProfile() {
    this.loading = true;
    const userId = this.authService.getUserId();
    
    if (!userId) {
      console.error('User not authenticated');
      this.loading = false;
      return;
    }

    this.jobOfferService.getJobOffersByUser(userId).subscribe({
      next: (userOffers) => {
        this.userJobOffers = userOffers;
        if (this.userJobOffers.length > 0) {
          this.loadJobApplications(userId);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching job offers:', err);
        this.loading = false;
      }
    });
  }

  loadJobApplications(userId: number) {
    this.jobOfferService.getApplicationsForUserJobOffers(userId)
      .subscribe({
        next: (applications: JobApplication[]) => {
          this.jobApplications = applications;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching applications:', err);
          this.loading = false;
        }
      });
  }

  getApplicationsForJobOffer(jobOfferId?: number): JobApplication[] {
    if (!jobOfferId) return [];
    return this.jobApplications.filter(app => app.jobOfferId === jobOfferId);
  }

  viewApplications(jobOfferId?: number) {
    if (!jobOfferId) return;
    this.router.navigate(['/jobApplications', jobOfferId]);
  }

  logout() {
    this.authService.logout();
  }

  getSenderName(message: MessageNotification): string {
    // Check if sender object exists and has first/last name
    if (message.sender) {
      const firstName = message.sender.firstName || '';
      const lastName = message.sender.lastName || '';
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }
    
    // If no sender object or no names in it, try senderName
    if (message.senderName) {
      return message.senderName;
    }
    
    // If all else fails, return username or default
    return message.sender?.username || 'Unknown User';
  }

  handleImageError(event: any) {
    event.target.src = 'assets/images/default-logo.jpg';
  }

  markAllAsRead() {
    if (this.unreadMessages.length === 0) return;
    
    this.notificationService.markAllMessagesAsRead().subscribe({
      next: () => {
        this.unreadMessages = [];
        this.showNotifications = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error marking all messages as read:', err);
      }
    });
  }
}