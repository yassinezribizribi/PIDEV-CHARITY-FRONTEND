import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MissionService } from '../../services/mission.service';
import { Mission, MissionStatus } from '../../interfaces/mission.interface';
import { CommonModule } from '@angular/common';

@Component({
  imports: [FormsModule, ReactiveFormsModule,CommonModule], // ✅ Add ReactiveFormsModule
  standalone: true,
  selector: 'app-edit-mission',
  templateUrl: './edit-mission.component.html',
  styleUrls: ['./edit-mission.component.scss']
})
export class EditMissionComponent implements OnInit {
  missionForm: FormGroup;
  missionId: number;
  mission: Mission | null = null;
  loading = true;
  error: string | null = null;
  missionStatusOptions = Object.values(MissionStatus); // Add mission status options

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private missionService: MissionService
  ) {
    this.missionForm = this.fb.group({
      description: ['', Validators.required],
      location: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      volunteerCount: ['', [Validators.required, Validators.min(1)]],
      status: ['', Validators.required]
    });

    this.missionId = +this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadMission();
  }

  // Fetch mission details
  loadMission() {
    this.missionService.getMissionById(this.missionId).subscribe({
      next: (mission) => {
        this.mission = mission;
        this.missionForm.patchValue({
          description: mission.description,
          location: mission.location,
          startDate: this.formatDate(mission.startDate),
          endDate: this.formatDate(mission.endDate),
          volunteerCount: mission.volunteerCount,
          status: mission.status
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load mission details';
        this.loading = false;
      }
    });
  }

  // Format date for input field
  formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  // Handle form submission
  onSubmit() {
    if (this.missionForm.invalid) {
      return;
    }

    const updatedMission: Mission = {
      ...this.mission,
      ...this.missionForm.value,
      startDate: new Date(this.missionForm.value.startDate),
      endDate: new Date(this.missionForm.value.endDate)
    };

    this.missionService.updateMission(this.missionId, updatedMission).subscribe({
      next: () => {
        this.router.navigate(['/association/account']);
      },
      error: () => {
        this.error = 'Failed to update mission';
      }
    });
  }

  // Cancel editing and go back
  onCancel() {
    this.router.navigate(['/association/account']);
  }
}
