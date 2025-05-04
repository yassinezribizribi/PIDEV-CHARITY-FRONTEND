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
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

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
  styles: [`
    .bg-half-170 {
      padding: 170px 0;
      position: relative;
    }

    .bg-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%);
    }

    .heading {
      font-size: 1.5rem;
      letter-spacing: 0.5px;
    }

    .sub-heading {
      position: relative;
      display: inline-block;
    }

    .sub-heading::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 2px;
      background-color: var(--bs-primary);
    }

    .dashboard-container {
      min-height: calc(100vh - 64px);
      background-color: var(--bs-gray-100);
      position: relative;
      z-index: 2;
    }

    .position-middle-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem 0;
    }

    .breadcrumb-muted {
      background: transparent;
    }

    .breadcrumb-muted .breadcrumb-item a {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
    }

    .breadcrumb-muted .breadcrumb-item.active {
      color: rgba(255, 255, 255, 0.5);
    }

    .shape {
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      z-index: 1;
    }

    .shape svg {
      width: 100%;
      height: 48px;
    }

    .hero-section {
      position: relative;
      background: linear-gradient(135deg, var(--bs-primary) 0%, var(--bs-primary-dark) 100%);
      padding: 4rem 0;
      margin-bottom: 2rem;
      overflow: hidden;
    }

    .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('/assets/images/pattern.svg') center/cover;
      opacity: 0.1;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      color: white;
    }

    .hero-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
    }

    .hero-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-text h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .hero-stats {
      display: flex;
      gap: 2rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-circle i {
      font-size: 1.5rem;
    }

    .avatar-lg {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid var(--bs-primary);
      box-shadow: 0 0 0 4px var(--bs-primary-subtle);
    }

    .avatar-lg img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-sm {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid var(--bs-primary);
    }

    .avatar-sm img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .btn-soft-primary {
      background-color: var(--bs-primary-subtle);
      color: var(--bs-primary);
      border: none;
      transition: all 0.2s ease;
    }

    .btn-soft-primary:hover {
      background-color: var(--bs-primary);
      color: white;
    }

    .btn-soft-danger {
      background-color: var(--bs-danger-subtle);
      color: var(--bs-danger);
      border: none;
      transition: all 0.2s ease;
    }

    .btn-soft-danger:hover {
      background-color: var(--bs-danger);
      color: white;
    }

    .badge {
      padding: 0.5rem 1rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge i {
      font-size: 0.875rem;
    }

    .card {
      transition: all 0.2s ease;
    }

    .card:hover {
      transform: translateY(-2px);
    }

    .dropdown-menu {
      min-width: 300px;
      padding: 0;
    }

    .notification-item {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .notification-item:hover {
      background-color: var(--bs-gray-100);
    }

    .list-group-item {
      transition: all 0.2s ease;
    }

    .list-group-item:hover {
      transform: translateX(5px);
    }

    .nav-link {
      color: var(--bs-gray-600);
      transition: all 0.2s ease;
    }

    .nav-link:hover {
      color: var(--bs-primary);
      background-color: var(--bs-primary-subtle);
    }

    .nav-link.active {
      color: var(--bs-primary);
      background-color: var(--bs-primary-subtle);
    }

    .nav-link i {
      font-size: 1.25rem;
    }

    .form-control {
      border: 1px solid var(--bs-gray-300);
      padding: 0.75rem 1rem;
      transition: all 0.2s ease;
    }

    .form-control:focus {
      border-color: var(--bs-primary);
      box-shadow: 0 0 0 0.25rem var(--bs-primary-subtle);
    }

    .form-check-input:checked {
      background-color: var(--bs-primary);
      border-color: var(--bs-primary);
    }
  `],
  imports: [NavbarComponent, CommonModule, RouterLink, ReactiveFormsModule]
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
  activeTab: string = 'overview';
  profileForm: FormGroup;
  passwordForm: FormGroup;
  twoFactorEnabled: boolean = false;

  constructor(
    private authService: AuthService,
    private jobOfferService: JobOfferService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{value: '', disabled: true}]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

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
            this.initializeForms();
            
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

  initializeForms() {
    if (this.currentUser) {
      this.profileForm.patchValue({
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email
      });
    }
  }

  updateProfile() {
    if (this.profileForm.valid) {
      const formData = this.profileForm.value;
      // Call your API to update the profile
      this.toastr.success('Profile updated successfully');
    }
  }

  updatePassword() {
    if (this.passwordForm.valid) {
      const formData = this.passwordForm.value;
      if (formData.newPassword !== formData.confirmPassword) {
        this.toastr.error('New passwords do not match');
        return;
      }
      // Call your API to update the password
      this.toastr.success('Password updated successfully');
      this.passwordForm.reset();
    }
  }

  toggleTwoFactor() {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    // Call your API to enable/disable 2FA
    this.toastr.success(`Two-factor authentication ${this.twoFactorEnabled ? 'enabled' : 'disabled'}`);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result;
      };
      reader.readAsDataURL(file);
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