import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Resume, Skill } from '../interfaces/employment.interface';

@Injectable({
  providedIn: 'root'
})
export class ResumeAnalysisService {
  private resumesSubject = new BehaviorSubject<Resume[]>([]);
  resumes$ = this.resumesSubject.asObservable();

  constructor(private http: HttpClient) {}

  async uploadResume(file: File): Promise<Resume> {
    // In a real app, upload to server
    const formData = new FormData();
    formData.append('resume', file);

    // Simulate file upload and analysis
    const resume: Resume = {
      id: 'resume-' + Date.now(),
      userId: 'current-user-id',
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      parsedData: await this.analyzeResume(file),
      status: 'analyzed',
      analyzedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const current = this.resumesSubject.value;
    this.resumesSubject.next([...current, resume]);

    return resume;
  }

  private async analyzeResume(file: File): Promise<Resume['parsedData']> {
    // In a real app, this would be done by a server-side service
    // using tools like PyPDF2, spaCy, or commercial APIs
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          personalInfo: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            location: 'City, Country'
          },
          skills: this.extractSkills(file),
          experiences: [],
          education: [],
          languages: []
        });
      }, 2000);
    });
  }

  private extractSkills(file: File): Skill[] {
    // Simulate skill extraction
    return [
      {
        name: 'JavaScript',
        level: 'advanced',
        category: 'Programming',
        yearsOfExperience: 3
      },
      // Add more skills...
    ];
  }

  getResumeById(id: string): Observable<Resume | undefined> {
    return new Observable(subscriber => {
      const resume = this.resumesSubject.value.find(r => r.id === id);
      subscriber.next(resume);
      subscriber.complete();
    });
  }

  updateResume(id: string, data: Partial<Resume>): Promise<Resume> {
    const current = this.resumesSubject.value;
    const index = current.findIndex(r => r.id === id);
    
    if (index === -1) {
      return Promise.reject('Resume not found');
    }

    const updated = { ...current[index], ...data, updatedAt: new Date() };
    current[index] = updated;
    this.resumesSubject.next(current);

    return Promise.resolve(updated);
  }
} 