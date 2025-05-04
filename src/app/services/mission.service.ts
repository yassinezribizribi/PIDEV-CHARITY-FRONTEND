import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { Mission, MissionStatus } from '../interfaces/mission.interface';
import { Router } from '@angular/router';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Partner } from '../models/partner.model';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private apiUrl = environment.apiUrl + '/missions';
  private currentAssociationId!: number;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    // Get the current association ID from auth service
    this.authService.checkAssociation().subscribe(
      (association) => {
        if (association?.idAssociation) {
          this.currentAssociationId = association.idAssociation;
        }
      }
    );
  }

  getMissions(): Observable<Mission[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Mission[]>(`${this.apiUrl}/getall`, { headers });
  }

  getMissionById(id: number): Observable<Mission> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Mission>(`${this.apiUrl}/get/${id}`, { headers });
  }

 // createMission(mission: Mission): Observable<Mission> {
    //const token = localStorage.getItem('auth_token');
    //const headers = new HttpHeaders()
      //.set('Authorization', `Bearer ${token}`)
     // .set('Content-Type', 'application/json');

    //return this.http.post<Mission>(`${this.apiUrl}/add`, mission, { headers });
  //}

  createMission(mission: Mission): Observable<Mission> {
    const token = localStorage.getItem('auth_token');
    console.log('Token utilisé:', token);

    if (!token) {
      this.router.navigate(['/login']);
      return throwError(() => new Error('Token manquant'));
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('Headers envoyés:', headers);
    console.log('Donation envoyée:', mission);

    return this.http.post<Mission>(
      `${this.apiUrl}/create`, 
      mission,
      { headers: new HttpHeaders(headers) }
    );
  }

  updateMission(id: number, mission: Mission): Observable<Mission> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.put<Mission>(`${this.apiUrl}/update/${id}`, mission, { headers });
  }

  deleteMission(id: number): Observable<void> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers });
  }


// New method to get missions by location
getMissionsByLocation(location: string): Observable<Mission[]> {
  const token = localStorage.getItem('auth_token');
  const headers = new HttpHeaders()
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json');

  // Sending the GET request with location as a parameter
  return this.http.get<Mission[]>(`${this.apiUrl}/by-location/${location}`, { headers });
}

  // Joint Mission Methods
  createJointMission(missionData: Partial<Mission>, partnerId: number): Observable<Mission> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.router.navigate(['/login']);
      return throwError(() => new Error('Authentication token not found'));
    }

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    // Ensure all required fields for a joint mission are set
    const jointMissionData = {
      ...missionData,
      isJointMission: true,
      associationId: this.currentAssociationId,
      partnerAssociationId: partnerId,
      status: MissionStatus.UPCOMING,
      collaborators: [this.currentAssociationId, partnerId],
      progress: {
        completedTasks: 0,
        totalTasks: missionData.progress?.totalTasks || 1,
        notes: 'Joint mission initiated'
      }
    };

    console.log('Creating joint mission with data:', jointMissionData);

    // First create the mission
    return this.http.post<Mission>(`${this.apiUrl}/create`, jointMissionData, { headers }).pipe(
      tap((mission) => {
        if (mission.id) {
          // Send invitation to partner association
          this.sendJointMissionInvitation(mission.id, partnerId, headers).subscribe();
          
          // Update partnership metrics and check for tier upgrade
          this.updatePartnershipMetrics(this.currentAssociationId, partnerId, {
            jointMissionsCompleted: 1,
            efficiencyImprovement: 5 // Base efficiency improvement for new joint mission
          }).subscribe(() => {
            // After updating metrics, check if we need to upgrade the tier
            if (this.currentAssociationId && partnerId) {
              this.checkAndUpgradeTier(this.currentAssociationId).subscribe();
              this.checkAndUpgradeTier(partnerId).subscribe();
            }
          });
        }
      }),
      catchError((error) => {
        console.error('Joint mission creation error:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
          return throwError(() => new Error('Please log in to create a joint mission'));
        }
        return throwError(() => error);
      })
    );
  }

  // Add new method to check and upgrade tier
  private checkAndUpgradeTier(associationId: number): Observable<void> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<void>(
      `${environment.apiUrl}/associations/${associationId}/check-upgrade-tier`,
      {},
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error checking/upgrading tier:', error);
        return throwError(() => error);
      })
    );
  }

  // New method to send joint mission invitation
  private sendJointMissionInvitation(missionId: number, partnerId: number, headers: HttpHeaders): Observable<any> {
    const invitationData = {
      missionId,
      partnerId,
      senderId: this.currentAssociationId,
      type: 'JOINT_MISSION_INVITATION',
      status: 'PENDING'
    };

    return this.http.post(
      `${this.apiUrl}/invitations/send`,
      invitationData,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error sending joint mission invitation:', error);
        return throwError(() => error);
      })
    );
  }

  // Update the getJointMissions method to include proper filtering
  getJointMissions(associationId: number): Observable<Mission[]> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Mission[]>(`${this.apiUrl}/joint/${associationId}`, { headers }).pipe(
      tap(missions => {
        console.log('Retrieved joint missions:', missions);
      }),
      catchError(error => {
        console.error('Error fetching joint missions:', error);
        return throwError(() => error);
      })
    );
  }

  inviteToJointMission(missionId: number): Observable<Mission> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<Mission>(
      `${this.apiUrl}/${missionId}/invite`,
      {},
      { headers }
    );
  }

  acceptJointMissionInvite(missionId: number): Observable<Mission> {
    return this.http.post<Mission>(`${this.apiUrl}/joint/${missionId}/accept`, {}).pipe(
      tap((mission) => {
        if (mission.associationId && mission.partnerAssociationId) {
          // Update both partnership scores and metrics
          this.updatePartnershipMetrics(mission.associationId, mission.partnerAssociationId, {
            jointMissionsCompleted: 1,
            efficiencyImprovement: 5
          }).subscribe(() => {
            // After updating metrics, check if we need to upgrade the tier
            if (mission.associationId && mission.partnerAssociationId) {
              this.checkAndUpgradeTier(mission.associationId).subscribe();
              this.checkAndUpgradeTier(mission.partnerAssociationId).subscribe();
            }
          });
        }
      })
    );
  }

  leaveJointMission(missionId: number, associationId: number): Observable<void> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.delete<void>(
      `${this.apiUrl}/${missionId}/leave/${associationId}`,
      { headers }
    );
  }

  getJointMissionMetrics(associationId: number): Observable<{
    totalJointMissions: number;
    completedJointMissions: number;
    activeJointMissions: number;
    totalPartnersCollaborated: number;
    totalVolunteersEngaged: number;
    impactScore: number;
  }> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<any>(
      `${this.apiUrl}/joint/${associationId}/metrics`,
      { headers }
    );
  }

  updateJointMissionProgress(missionId: number, progress: number): Observable<Mission> {
    return this.http.put<Mission>(`${this.apiUrl}/joint/${missionId}/progress`, { progress }).pipe(
      tap((mission) => {
        if (mission.associationId && mission.partnerAssociationId && progress >= 100) {
          // Additional score and efficiency improvement for completing the mission
          this.updatePartnershipMetrics(mission.associationId, mission.partnerAssociationId, {
            efficiencyImprovement: 10, // Additional efficiency gain for completing the mission
            volunteersShared: mission.volunteerCount || 0
          }).subscribe(() => {
            // After updating metrics, check if we need to upgrade the tier
            if (mission.associationId && mission.partnerAssociationId) {
              this.checkAndUpgradeTier(mission.associationId).subscribe();
              this.checkAndUpgradeTier(mission.partnerAssociationId).subscribe();
            }
          });
        }
      })
    );
  }

  private updatePartnershipScores(associationId: number, partnerId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/partnerships/update-scores`, {
      associationId,
      partnerId,
      scoreIncrease: 5 // Base score for creating a joint mission
    });
  }

  getPartners(associationId: number): Observable<Partner[]> {
    return this.http.get<Partner[]>(`${this.apiUrl}/associations/${associationId}/partners`);
  }

  // New method to update partnership metrics
  private updatePartnershipMetrics(associationId: number, partnerId: number, metrics: {
    jointMissionsCompleted?: number;
    efficiencyImprovement?: number;
    volunteersShared?: number;
  }): Observable<void> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post<void>(`${this.apiUrl}/partnerships/${associationId}/${partnerId}/metrics`, metrics, { headers }).pipe(
      catchError(error => {
        console.error('Error updating partnership metrics:', error);
        return throwError(() => error);
      })
    );
  }
} 