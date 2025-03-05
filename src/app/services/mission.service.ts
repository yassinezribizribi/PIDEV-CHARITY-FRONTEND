import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { Mission } from '../interfaces/mission.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  private apiUrl = 'http://localhost:8089/api/missions';

  constructor(private http: HttpClient,
    private router: Router
  ) {}

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

} 