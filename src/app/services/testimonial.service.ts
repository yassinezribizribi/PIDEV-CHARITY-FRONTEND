import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TestimonialService {
  private apiUrl = 'http://localhost:8089/api/testimonials';
  private emotionApiUrl = 'http://localhost:8089/api/emotion';

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    const token = localStorage.getItem('auth_token')?.trim();
    if (!token) {
      console.warn("⚠️ Token JWT non trouvé, utilisation de requête sans authentification.");
      return null;
    }
    return token;
  }

  private getHeaders(requireAuth: boolean = true): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.getToken();
    if (requireAuth && token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  likeTestimonial(id: number) {
    return this.http.post(`${this.apiUrl}/${id}/like`, {}, {
      headers: this.getHeaders(true)
    });
    
  }
  
  unlikeTestimonial(id: number) {
    return this.http.post(`${this.apiUrl}/${id}/unlike`, {}, {
      headers: this.getHeaders(true)
    });
    
  }
  
  getTestimonials(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`, { 
      headers: this.getHeaders(false) // ✅ accessible publiquement
    });
  }

  addTestimonial(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data, { headers: this.getHeaders(true) });
  }

  updateTestimonial(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, { headers: this.getHeaders(true) });
  }

  deleteTestimonial(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders(true) });
  }

  uploadMedia(formData: FormData): Observable<any> {
    const headers = this.getToken()
      ? new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` })
      : new HttpHeaders();

    return this.http.post(`${this.apiUrl}/media`, formData, { headers });
  }

  searchTestimonials(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?keyword=${encodeURIComponent(keyword)}`, {
      headers: this.getHeaders(false) // ✅ accessible publiquement
    });
  }

  getTestimonialById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(false) // ✅ accessible publiquement (si c'est le cas)
    });
  }

  analyzeEmotion(transcription: string): Observable<any> {
    return this.http.post(`${this.emotionApiUrl}/analyze`, { text: transcription }, {
      headers: this.getHeaders(true)
    });
  }
  analyzeImages(formData: FormData) {
    return this.http.post<any>('http://localhost:5000/analyze-images', formData)
      .pipe(timeout(120000));  // timeout en millisecondes (120 sec = 120000 ms)
  }
  

  generateSummary(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/generate-summary`, {}, {
      headers: this.getHeaders(true)
    });
  }
}
