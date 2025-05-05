import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslationService {

  private apiUrl = 'http://localhost:8089/api/translate'; // ton endpoint Spring Boot

  constructor(private http: HttpClient) {}

  translate(text: string, sourceLang: string, targetLangs: string[]): Observable<{ [key: string]: string }> {
    const body = {
      text,
      sourceLang,
      targetLangs
    };
    return this.http.post<{ [key: string]: string }>(this.apiUrl, body);
  }
}
