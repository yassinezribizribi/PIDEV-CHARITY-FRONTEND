import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Mission, MissionStatus } from '../../interfaces/mission.interface';
import { MissionService } from '../../services/mission.service';
import { AdminNavbarComponent } from '../admin/admin-navbar/admin-navbar.component';

//export enum MissionStatus {
  //COMPLETED = 'COMPLETED',
  //UPCOMING = 'UPCOMING',
  //UPGOING = 'UPGOING'
//}

@Component({
  selector: 'app-association-mission-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent],
  templateUrl: './association-mission-form.component.html',
  styleUrls: ['./association-mission-form.component.scss']
})
export class AssociationMissionFormComponent {
  missionStatuses = Object.values(MissionStatus);

  mission: Partial<Mission> = {
    description: '',
    location: '',
    startDate: new Date(),
    endDate: new Date(),
    volunteerCount: 1,
    status: MissionStatus.UPCOMING
  };

  submitted = false;
  errorMessage = '';

  constructor(
    private missionService: MissionService,
    private router: Router
  ) {}

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    // Conversion en Mission complète
    const missionData: Mission = {
      description: this.mission.description || '',
      location: this.mission.location || '',
      startDate: this.mission.startDate || new Date(),
      endDate: this.mission.endDate || new Date(),
      volunteerCount: this.mission.volunteerCount || 1,
      status: this.mission.status || MissionStatus.UPCOMING
    };

    console.log('Token présent:', !!localStorage.getItem('auth_token'));
    console.log('Données de mission à envoyer:', missionData);

    this.missionService.createMission(missionData).subscribe({
      next: (response) => {
        console.log('Mission créée avec succès:', response);
        alert('Mission créée avec succès!');
        this.router.navigate(['/association/account']);
      },
      error: (error) => {
        console.error('Détails complets de l\'erreur:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('URL utilisée:', error.url);
        this.errorMessage = `Erreur lors de la création de la mission: ${error.message}`;
        this.submitted = false;
      }
    });
  }

  onCancel() {
    this.router.navigate(['/association/account']);
  }
} 