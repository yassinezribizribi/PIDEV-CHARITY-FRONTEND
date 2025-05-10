import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { Router } from '@angular/router';

interface UserManagement {
  idUser: number;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  role?: string;  // For backward compatibility
  isBanned?: boolean;
  banreason?: string | null;
  profileImage?: string;
}

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    AdminNavbarComponent
  ],
  template: `
    <app-admin-navbar></app-admin-navbar>

    <div class="container-fluid p-4 mt-4">
      <div class="card shadow-lg border-0 rounded-4">
        <div class="card-header bg-white border-0 pt-4 pb-3 px-4">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <i class="bi bi-people-fill me-2 text-primary fs-3"></i>
              <h3 class="mb-0 fw-bold">User Management</h3>
            </div>
            <div class="d-flex gap-3">
              <div class="input-group search-box">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-search text-muted fs-5"></i>
                </span>
                <input type="text" 
                       class="form-control border-start-0 fs-5" 
                       placeholder="Search users..." 
                       [(ngModel)]="searchTerm" 
                       (keyup)="filterUsers()">
              </div>
              <select class="form-select role-filter fs-5" [(ngModel)]="roleFilter" (change)="filterUsers()">
                <option value="ALL">All Roles</option>
                <option value="REFUGEE">Refugee</option>
                <option value="VOLUNTEER">Volunteer</option>
                <option value="ASSOCIATION_MEMBER">Association Member</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card-body p-0">
          <!-- Loading State -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted fs-5">Loading users...</p>
          </div>

          <!-- No Results State -->
          <div *ngIf="!loading && filteredUsers.length === 0" class="text-center py-5">
            <i class="bi bi-search display-4 text-muted"></i>
            <p class="mt-3 text-muted fs-5">No users found</p>
          </div>

          <!-- Users Table -->
          <div class="table-responsive" *ngIf="!loading && filteredUsers.length > 0">
            <table class="table table-hover align-middle mb-0">
              <thead class="bg-light">
                <tr>
                  <th class="ps-4 fs-5">User</th>
                  <th class="fs-5">Role</th>
                  <th class="fs-5">Status</th>
                  <th class="text-end pe-4 fs-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers" class="border-bottom">
                  <td class="ps-4">
                    <div class="d-flex align-items-center">
                      <div class="avatar-sm me-3">
                        <img [src]="getUserProfileImage(user.idUser)" 
                             [alt]="user.firstName"
                             class="rounded-circle"
                             onerror="this.src='assets/images/default-logo.jpg'"
                             [ngClass]="{'loading': isUserImageLoading(user.idUser)}">
                      </div>
                      <div>
                        <h5 class="mb-0 fw-semibold">{{user.firstName}} {{user.lastName}}</h5>
                        <small class="text-muted fs-6">{{user.email}}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge fs-6" [ngClass]="{
                      'bg-info-subtle text-info': user.roles?.includes('ROLE_REFUGEE') || user.role === 'REFUGEE',
                      'bg-success-subtle text-success': user.roles?.includes('ROLE_VOLUNTEER') || user.role === 'VOLUNTEER',
                      'bg-warning-subtle text-warning': user.roles?.includes('ROLE_ASSOCIATION_MEMBER') || user.role === 'ASSOCIATION_MEMBER'
                    }">
                      <i class="bi" [ngClass]="{
                        'bi-person-fill': user.roles?.includes('ROLE_REFUGEE') || user.role === 'REFUGEE',
                        'bi-heart-fill': user.roles?.includes('ROLE_VOLUNTEER') || user.role === 'VOLUNTEER',
                        'bi-building-fill': user.roles?.includes('ROLE_ASSOCIATION_MEMBER') || user.role === 'ASSOCIATION_MEMBER'
                      }"></i>
                      {{getRoleDisplay(user.roles?.[0] || user.role)}}
                    </span>
                  </td>
                  <td>
                    <span class="badge fs-6" [ngClass]="{
                      'bg-success-subtle text-success': !user.isBanned,
                      'bg-danger-subtle text-danger': user.isBanned
                    }">
                      <i class="bi" [ngClass]="{
                        'bi-check-circle-fill': !user.isBanned,
                        'bi-x-circle-fill': user.isBanned
                      }"></i>
                      {{user.isBanned ? 'Banned' : 'Active'}}
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <div class="btn-group">
                      <button class="btn btn-sm btn-soft-primary" 
                              (click)="viewUserDetails(user)"
                              tooltip="View Details">
                        <i class="bi bi-eye-fill fs-5"></i>
                      </button>
                      <button class="btn btn-sm btn-soft-info" 
                              (click)="editUser(user)"
                              tooltip="Edit User">
                        <i class="bi bi-pencil-fill fs-5"></i>
                      </button>
                      <button class="btn btn-sm btn-soft-success" 
                              (click)="sendMessage(user)"
                              tooltip="Send Message">
                        <i class="bi bi-envelope-fill fs-5"></i>
                      </button>
                      <button class="btn btn-sm btn-soft-warning" 
                              (click)="viewUserHistory(user)"
                              tooltip="View History">
                        <i class="bi bi-clock-history fs-5"></i>
                      </button>
                      <button class="btn btn-sm" 
                              [ngClass]="{
                                'btn-danger-subtle text-danger': !user.isBanned,
                                'btn-success-subtle text-success': user.isBanned
                              }"
                              (click)="toggleUserBan(user)"
                              tooltip="Toggle Ban">
                        <i class="bi" [ngClass]="{
                          'bi-ban-fill': !user.isBanned,
                          'bi-check-circle-fill': user.isBanned
                        }" class="fs-5"></i>
                      </button>
                      <button class="btn btn-sm btn-soft-danger" 
                              (click)="deleteUser(user)"
                              tooltip="Delete User">
                        <i class="bi bi-trash-fill fs-5"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <div class="modal fade" id="userDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 bg-light">
            <h4 class="modal-title fw-bold">
              <i class="bi bi-person-circle me-2"></i>
              User Details
            </h4>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4" *ngIf="selectedUser">
            <div class="row">
              <div class="col-md-4 text-center mb-4">
                <div class="avatar-lg mx-auto mb-3">
                  <img [src]="getUserProfileImage(selectedUser.idUser)" 
                       [alt]="selectedUser.firstName"
                       class="rounded-circle img-fluid"
                       onerror="this.src='assets/images/default-logo.jpg'"
                       [ngClass]="{'loading': isUserImageLoading(selectedUser.idUser)}">
                </div>
                <span class="badge fs-6" [ngClass]="{
                  'bg-info-subtle text-info': selectedUser.roles?.includes('ROLE_REFUGEE') || selectedUser.role === 'REFUGEE',
                  'bg-success-subtle text-success': selectedUser.roles?.includes('ROLE_VOLUNTEER') || selectedUser.role === 'VOLUNTEER',
                  'bg-warning-subtle text-warning': selectedUser.roles?.includes('ROLE_ASSOCIATION_MEMBER') || selectedUser.role === 'ASSOCIATION_MEMBER'
                }">
                  <i class="bi" [ngClass]="{
                    'bi-person-fill': selectedUser.roles?.includes('ROLE_REFUGEE') || selectedUser.role === 'REFUGEE',
                    'bi-heart-fill': selectedUser.roles?.includes('ROLE_VOLUNTEER') || selectedUser.role === 'VOLUNTEER',
                    'bi-building-fill': selectedUser.roles?.includes('ROLE_ASSOCIATION_MEMBER') || selectedUser.role === 'ASSOCIATION_MEMBER'
                  }"></i>
                  {{getRoleDisplay(selectedUser.roles?.[0] || selectedUser.role)}}
                </span>
              </div>
              <div class="col-md-8">
                <h3 class="fw-bold mb-1">{{selectedUser.firstName}} {{selectedUser.lastName}}</h3>
                <p class="text-muted mb-3 fs-5">
                  <i class="bi bi-envelope-fill me-2"></i>
                  {{selectedUser.email}}
                </p>
                <div class="d-flex align-items-center mb-3">
                  <span class="badge fs-6" [ngClass]="{
                    'bg-success-subtle text-success': !selectedUser.isBanned,
                    'bg-danger-subtle text-danger': selectedUser.isBanned
                  }">
                    <i class="bi" [ngClass]="{
                      'bi-check-circle-fill': !selectedUser.isBanned,
                      'bi-x-circle-fill': selectedUser.isBanned
                    }"></i>
                    {{selectedUser.isBanned ? 'Banned' : 'Active'}}
                  </span>
                </div>
                <div *ngIf="selectedUser.isBanned" class="alert alert-danger-subtle fs-5">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>Ban Reason:</strong> {{selectedUser.banreason}}
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 bg-light">
            <button type="button" class="btn btn-secondary fs-5" data-bs-dismiss="modal">
              <i class="bi bi-x-circle me-2"></i>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-sm {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .avatar-lg {
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .avatar-sm img, .avatar-lg img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .badge {
      padding: 0.6em 0.8em;
    }

    .btn-soft-primary {
      color: #0d6efd;
      background-color: rgba(13, 110, 253, 0.1);
      border-color: transparent;
    }

    .btn-soft-primary:hover {
      color: #fff;
      background-color: #0d6efd;
    }

    .btn-danger-subtle {
      color: #dc3545;
      background-color: rgba(220, 53, 69, 0.1);
      border-color: transparent;
    }

    .btn-danger-subtle:hover {
      color: #fff;
      background-color: #dc3545;
    }

    .btn-success-subtle {
      color: #198754;
      background-color: rgba(25, 135, 84, 0.1);
      border-color: transparent;
    }

    .btn-success-subtle:hover {
      color: #fff;
      background-color: #198754;
    }

    [tooltip] {
      position: relative;
    }

    [tooltip]:hover:before {
      content: attr(tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      padding: 0.5rem 0.75rem;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      font-size: 0.75rem;
      border-radius: 0.25rem;
      white-space: nowrap;
      z-index: 1000;
    }

    .table {
      th, td {
        padding: 1rem;
        vertical-align: middle;
      }
    }

    .card {
      margin-bottom: 2rem;
    }

    .form-select, .form-control {
      border-radius: 0.5rem;
      padding: 0.5rem 1rem;
    }

    .input-group-text {
      border-radius: 0.5rem 0 0 0.5rem;
      padding: 0.5rem 1rem;
    }

    .input-group .form-control {
      border-radius: 0 0.5rem 0.5rem 0;
    }

    .search-box {
      min-width: 250px;
    }

    .role-filter {
      min-width: 180px;
    }

    .bg-info-subtle {
      background-color: rgba(13, 202, 240, 0.1);
    }

    .bg-success-subtle {
      background-color: rgba(25, 135, 84, 0.1);
    }

    .bg-warning-subtle {
      background-color: rgba(255, 193, 7, 0.1);
    }

    .bg-danger-subtle {
      background-color: rgba(220, 53, 69, 0.1);
    }

    .alert-danger-subtle {
      background-color: rgba(220, 53, 69, 0.1);
      border-color: rgba(220, 53, 69, 0.2);
      color: #dc3545;
    }

    .btn-soft-info {
      color: #0dcaf0;
      background-color: rgba(13, 202, 240, 0.1);
      border-color: transparent;
    }

    .btn-soft-info:hover {
      color: #fff;
      background-color: #0dcaf0;
    }

    .btn-soft-success {
      color: #198754;
      background-color: rgba(25, 135, 84, 0.1);
      border-color: transparent;
    }

    .btn-soft-success:hover {
      color: #fff;
      background-color: #198754;
    }

    .btn-soft-warning {
      color: #ffc107;
      background-color: rgba(255, 193, 7, 0.1);
      border-color: transparent;
    }

    .btn-soft-warning:hover {
      color: #fff;
      background-color: #ffc107;
    }

    .btn-soft-danger {
      color: #dc3545;
      background-color: rgba(220, 53, 69, 0.1);
      border-color: transparent;
    }

    .btn-soft-danger:hover {
      color: #fff;
      background-color: #dc3545;
    }

    .btn-group {
      display: flex;
      gap: 0.25rem;
    }

    .btn-group .btn {
      padding: 0.5rem 0.75rem;
    }

    .avatar-sm img.loading, .avatar-lg img.loading {
      opacity: 0.5;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { opacity: 0.5; }
      50% { opacity: 0.8; }
      100% { opacity: 0.5; }
    }
  `]
})
export class UsersManagementComponent implements OnInit {
  users: UserManagement[] = [];
  filteredUsers: UserManagement[] = [];
  searchTerm: string = '';
  roleFilter: string = 'ALL';
  loading: boolean = true;
  selectedUser: UserManagement | null = null;
  userProfileImages: { [key: number]: string } = {};
  userImageLoadingStates: { [key: number]: boolean } = {};
  defaultUserImage = 'assets/images/default-logo.jpg';

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  getRoleDisplay(role: string | undefined): string {
    if (!role) return 'Unknown';
    
    switch (role) {
      case 'REFUGEE':
      case 'ROLE_REFUGEE':
        return 'Refugee';
      case 'VOLUNTEER':
      case 'ROLE_VOLUNTEER':
        return 'Volunteer';
      case 'ASSOCIATION_MEMBER':
      case 'ROLE_ASSOCIATION_MEMBER':
        return 'Association Member';
      case 'ROLE_ADMIN':
        return 'Admin';
      default:
        return role;
    }
  }

  loadUsers(): void {
    this.loading = true;
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Users from API:', users);
        // Filter out admin users by both role and email
        this.users = users.filter(user => 
          !user.roles?.includes('ROLE_ADMIN') && 
          user.email !== 'admin.admin@gmail.com'
        ) as UserManagement[];
        this.filteredUsers = [...this.users];
        // Load profile images for each user
        this.users.forEach(user => {
          if (user.idUser) {
            this.loadUserProfileImage(user.idUser);
          }
        });
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private loadUserProfileImage(userId: number): void {
    this.userImageLoadingStates[userId] = true;
    this.authService.getUserById(userId).subscribe({
      next: (user) => {
        const imagePath = (user as any).profileImage;
        console.log('Profile image path:', imagePath); // Debug log
        
        if (imagePath) {
          // If the image is a base64 string, use it directly
          if (imagePath.startsWith('data:image')) {
            this.userProfileImages[userId] = imagePath;
          } 
          // If it's a URL, make sure it's complete
          else if (imagePath.startsWith('http')) {
            this.userProfileImages[userId] = imagePath;
          }
          // If it's a relative path, prepend the base URL
          else {
            const baseUrl = 'http://localhost:8089';
            // Extract just the filename from the path
            const filename = imagePath.split('/').pop();
            const imageUrl = `${baseUrl}/api/auth/profile-image/${filename}`;
            console.log('Constructed image URL:', imageUrl); // Debug log
            this.userProfileImages[userId] = imageUrl;
          }
        } else {
          console.log('No profile image found, using default'); // Debug log
          this.userProfileImages[userId] = this.defaultUserImage;
        }
        this.userImageLoadingStates[userId] = false;
      },
      error: (error: unknown) => {
        console.error('Error loading user profile image for user:', userId, error);
        this.userProfileImages[userId] = this.defaultUserImage;
        this.userImageLoadingStates[userId] = false;
      }
    });
  }

  getUserProfileImage(userId: number | undefined): string {
    if (!userId) return this.defaultUserImage;
    return this.userProfileImages[userId] || this.defaultUserImage;
  }

  isUserImageLoading(userId: number | undefined): boolean {
    return userId ? this.userImageLoadingStates[userId] || false : false;
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.searchTerm || 
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRole = this.roleFilter === 'ALL' || 
        user.roles?.includes(this.roleFilter) || 
        user.role === this.roleFilter;

      return matchesSearch && matchesRole;
    });
  }

  viewUserDetails(user: UserManagement) {
    this.selectedUser = user;
    const modal = document.getElementById('userDetailsModal');
    if (modal) {
      const bsModal = new (window as any).bootstrap.Modal(modal);
      bsModal.show();
    }
  }

  toggleUserBan(user: UserManagement) {
    this.authService.updateUser({
      ...user,
      isBanned: !user.isBanned,
      banreason: !user.isBanned ? 'Violation of platform rules' : null
    }).subscribe({
      next: () => {
        this.snackBar.open(`User ${!user.isBanned ? 'banned' : 'unbanned'} successfully`, 'Close', { duration: 3000 });
        this.loadUsers(); // Reload the users list
      },
      error: (error: any) => {
        console.error('Error updating user:', error);
        this.snackBar.open('Error updating user status', 'Close', { duration: 3000 });
      }
    });
  }

  viewUserHistory(user: UserManagement) {
    this.router.navigate(['/admin/user-history', user.idUser]);
  }

  sendMessage(user: UserManagement) {
    this.router.navigate(['/admin/messages'], { 
      queryParams: { 
        recipient: user.idUser,
        name: `${user.firstName} ${user.lastName}`
      }
    });
  }

  editUser(user: UserManagement) {
    this.router.navigate(['/admin/edit-user', user.idUser]);
  }

  deleteUser(user: UserManagement): void {
    if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      this.authService.deleteUser(user.idUser).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers(); // Reload the users list
        },
        error: (error: any) => {
          console.error('Error deleting user:', error);
          this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
        }
      });
    }
  }
} 