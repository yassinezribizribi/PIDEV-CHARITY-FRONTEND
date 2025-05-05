import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Mission, MissionStatus } from '../../interfaces/mission.interface';
import { MissionRole } from '../../interfaces/mission-role.interface';
import { MissionService } from '../../services/mission.service';
import { AdminNavbarComponent } from '../admin/admin-navbar/admin-navbar.component';
import { ToastrService } from 'ngx-toastr';

interface MissionFormData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  crisisId?: number;
  missionRoles?: MissionRole[];
}

@Component({
  selector: 'app-association-mission-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent],
  templateUrl: './association-mission-form.component.html',
  styleUrls: ['./association-mission-form.component.scss']
})
export class AssociationMissionFormComponent {
  missionStatuses = Object.values(MissionStatus);
  newRole: Partial<MissionRole> = {
    roleName: '',
    numberNeeded: 1,
    numberAccepted: 0,
    requiresValidation: false
  };

  mission: MissionFormData = {
    title: '',
    description: '',
    location: '',
    startDate: new Date(),
    endDate: new Date(),
    missionRoles: [],
    crisisId: undefined
  };

  missionLogo?: File;

  submitted = false;
  errorMessage = '';

  constructor(
    private missionService: MissionService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  addRole() {
    if (this.newRole.roleName && this.newRole.numberNeeded) {
      this.mission.missionRoles?.push({
        idMissionRole: 0, // Temporary ID, will be set by backend
        missionId: 0, // Will be set when mission is created
        roleName: this.newRole.roleName || '',
        numberNeeded: this.newRole.numberNeeded || 1,
        numberAccepted: 0,
        requiresValidation: this.newRole.requiresValidation || false
      });
      this.newRole = {
        roleName: '',
        numberNeeded: 1,
        numberAccepted: 0,
        requiresValidation: false
      };
    }
  }

  removeRole(index: number) {
    this.mission.missionRoles?.splice(index, 1);
  }

  onLogoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'Le fichier est trop volumineux. La taille maximale est de 2MB.';
        event.target.value = ''; // Clear the input
        return;
      }
      // Check file type
      if (!file.type.match(/image\/(jpeg|png)/)) {
        this.errorMessage = 'Format de fichier non supporté. Utilisez JPG ou PNG.';
        event.target.value = ''; // Clear the input
        return;
      }
      this.missionLogo = file;
      this.errorMessage = '';
    }
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    const jwtToken = localStorage.getItem('auth_token');
    if (!jwtToken) {
      this.errorMessage = 'Authentication token not found';
      this.submitted = false;
      return;
    }

    // Validate required fields
    if (!this.mission.title || !this.mission.description || !this.mission.location || !this.mission.startDate || !this.mission.endDate) {
      this.errorMessage = 'Please fill in all required fields';
      this.submitted = false;
      return;
    }

    // Convert string dates to Date objects
    const startDate = new Date(this.mission.startDate);
    const endDate = new Date(this.mission.endDate);

    // Validate dates
    if (endDate < startDate) {
      this.errorMessage = 'End date must be after start date';
      this.submitted = false;
      return;
    }

    console.log('Mission data to send:', {
      title: this.mission.title,
      description: this.mission.description,
      location: this.mission.location,
      startDate: startDate,
      endDate: endDate,
      status: MissionStatus.UPCOMING,
      missionLogo: this.missionLogo,
      missionRoles: this.mission.missionRoles
    });

    this.missionService.createMission(
      this.mission.title,
      this.mission.description,
      this.mission.location,
      startDate,
      endDate,
      MissionStatus.UPCOMING,
      this.missionLogo,
      this.mission.missionRoles
    ).subscribe({
      next: (response) => {
        console.log('Mission created successfully:', response);
        this.toastr.success('Mission created successfully!');
        this.router.navigate(['/association/account']);
      },
      error: (error) => {
        console.error('Error details:', error);
        this.errorMessage = error.error?.message || 'Error while creating mission';
        this.toastr.error(this.errorMessage);
        this.submitted = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/association/account']);
  }
}