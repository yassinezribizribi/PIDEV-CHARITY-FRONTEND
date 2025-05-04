import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TestimonialService {
  private apiUrl = 'http://localhost:8089/api/testimonials';
  private emotionApiUrl = 'http://localhost:8089/api/emotion';

  constructor(private http: HttpClient) {}

  private getToken(): string {
    const token = localStorage.getItem('auth_token')?.trim();
    if (!token) {
      console.error("⛔ Token manquant dans localStorage !");
      throw new Error('⛔ Aucun token JWT trouvé');
    }
    return token;
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({ 'Authorization': 'Bearer ' + token });
  }

  likeTestimonial(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/like`, {}, {
      headers: this.getHeaders()
    });
  }

  getTestimonials(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`, { headers: this.getHeaders() });
  }

  addTestimonial(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders() });
  }

  updateTestimonial(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders() });
  }

  deleteTestimonial(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  uploadMedia(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/media`, formData, {
      headers: this.getHeaders()
    });
  }

  searchTestimonials(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?keyword=${encodeURIComponent(keyword)}`, {
      headers: this.getHeaders()
    });
  }

  getTestimonialById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }
  analyzeEmotion(transcription: string): Observable<any> {
    return this.http.post(`${this.emotionApiUrl}/analyze`, { text: transcription }, {
      headers: this.getHeaders()
    });
  }

  generateSummary(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/generate-summary`, {}, {
      headers: this.getHeaders()
    });
  }
} 
