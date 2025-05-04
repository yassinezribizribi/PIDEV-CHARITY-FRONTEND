import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Mission, MissionStatus } from '../../interfaces/mission.interface';
import { MissionService } from '../../services/mission.service';
import { AdminNavbarComponent } from '../admin/admin-navbar/admin-navbar.component';
import { AssociationService } from '../../services/association.service';
import { Association } from '../../interfaces/association.interface';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-association-mission-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavbarComponent],
  templateUrl: './association-mission-form.component.html',
  styleUrls: ['./association-mission-form.component.scss']
})
export class AssociationMissionFormComponent implements OnInit {
  missionForm!: FormGroup;
  missionStatuses: MissionStatus[] = Object.values(MissionStatus);
  errorMessage: string = '';
  partners: Association[] = [];
  selectedPartnerId: number = 0;
  currentAssociation: Association | null = null;
  isJointMission: boolean = false;
  isLoading: boolean = false;

  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private missionService: MissionService,
    private associationService: AssociationService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCurrentAssociation();
  }

  private initializeForm(): void {
    this.missionForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      location: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      volunteerCount: [1, [Validators.required, Validators.min(1)]],
      status: [MissionStatus.UPCOMING, [Validators.required]],
      partnerId: [null],
      isJointMission: [false]
    }, {
      validators: this.dateValidator
    });
  }

  private dateValidator(group: FormGroup): {[key: string]: any} | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    
    if (start && end && new Date(end) < new Date(start)) {
      return { 'dateInvalid': true };
    }
    return null;
  }

  private loadCurrentAssociation(): void {
    this.isLoading = true;
    this.authService.checkAssociation().subscribe({
      next: (association) => {
        this.currentAssociation = association;
        if (association) {
          this.loadPartners(association.idAssociation);
        }
      },
      error: (error) => {
        console.error('Error loading association:', error);
        this.errorMessage = 'Failed to load association details.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private loadPartners(associationId: number): void {
    this.associationService.getPartners(associationId).subscribe({
      next: (partners) => {
        this.partners = partners;
      },
      error: (error) => {
        console.error('Error loading partners:', error);
        this.errorMessage = 'Failed to load partners.';
      }
    });
  }

  onPartnerSelect(partnerId: number): void {
    this.selectedPartnerId = partnerId;
    this.missionForm.patchValue({
      partnerId: partnerId,
      isJointMission: true
    });
    this.isJointMission = true;
  }

  isPartnerSelected(partnerId: number): boolean {
    return this.selectedPartnerId === partnerId;
  }

  onSubmit(): void {
    if (this.missionForm.valid && this.currentAssociation) {
      const formData = this.missionForm.value;
      
      // Create the mission object with the required structure
      const mission: Mission = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        volunteerCount: formData.volunteerCount,
        status: formData.status,
        isJointMission: this.isJointMission,
        associationId: this.currentAssociation.idAssociation,
        partnerAssociationId: this.isJointMission ? this.selectedPartnerId : undefined,
        createdAt: new Date(),
        progress: {
          completedTasks: 0,
          totalTasks: 1,
          notes: 'Mission initialized'
        }
      };

      if (this.isJointMission && this.selectedPartnerId) {
        this.missionService.createJointMission(mission, this.selectedPartnerId).subscribe({
          next: (response) => {
            this.toastr.success('Joint mission created successfully!');
            this.router.navigate(['/association/account']);
          },
          error: (error) => {
            console.error('Error creating joint mission:', error);
            this.toastr.error('Failed to create joint mission. Please try again.');
          }
        });
      } else {
        this.missionService.createMission(mission).subscribe({
          next: (response) => {
            this.toastr.success('Mission created successfully!');
            this.router.navigate(['/association/account']);
          },
          error: (error) => {
            console.error('Error creating mission:', error);
            this.toastr.error('Failed to create mission. Please try again.');
          }
        });
      }
    } else {
      this.toastr.error('Please fill in all required fields correctly.');
    }
  }

  onCancel(): void {
    this.router.navigate(['/association/account']);
  }
} 