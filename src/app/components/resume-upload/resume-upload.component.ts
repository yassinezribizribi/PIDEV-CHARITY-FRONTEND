import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResumeAnalysisService } from '../../services/resume-analysis.service';

@Component({
  selector: 'app-resume-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="resume-upload">
      <div class="upload-zone" 
           [class.dragging]="isDragging"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)">
        
        <div class="upload-content">
          <i class="uil uil-cloud-upload text-primary display-4"></i>
          <h4 class="mt-3">Drop your CV here</h4>
          <p class="text-muted">or</p>
          <input type="file" 
                 #fileInput
                 (change)="onFileSelected($event)"
                 accept=".pdf,.doc,.docx"
                 class="d-none">
          <button class="btn btn-primary" 
                  (click)="fileInput.click()">
            Browse Files
          </button>
          <p class="mt-3 small text-muted">
            Supported formats: PDF, DOC, DOCX
          </p>
        </div>
      </div>

      <div *ngIf="analyzing" class="mt-4">
        <div class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated"
               role="progressbar"
               [style.width]="analysisProgress + '%'">
          </div>
        </div>
        <p class="text-center mt-2">{{analysisStatus}}</p>
      </div>

      <div *ngIf="error" class="alert alert-danger mt-3">
        {{error}}
      </div>
    </div>
  `,
  styles: [`
    .resume-upload {
      .upload-zone {
        border: 2px dashed #dee2e6;
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        transition: all 0.3s ease;
        
        &.dragging {
          border-color: #2f55d4;
          background-color: rgba(47, 85, 212, 0.05);
        }
      }

      .upload-content {
        i {
          font-size: 3rem;
        }
      }

      .progress {
        height: 6px;
        border-radius: 3px;
      }
    }
  `]
})
export class ResumeUploadComponent {
  isDragging = false;
  analyzing = false;
  analysisProgress = 0;
  analysisStatus = '';
  error = '';

  constructor(private resumeService: ResumeAnalysisService) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.handleFile(input.files[0]);
    }
  }

  private async handleFile(file: File) {
    if (!this.isValidFileType(file)) {
      this.error = 'Please upload a PDF, DOC, or DOCX file.';
      return;
    }

    try {
      this.analyzing = true;
      this.error = '';
      
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        if (this.analysisProgress < 90) {
          this.analysisProgress += 10;
          this.updateAnalysisStatus();
        }
      }, 500);

      const resume = await this.resumeService.uploadResume(file);
      
      clearInterval(progressInterval);
      this.analysisProgress = 100;
      this.updateAnalysisStatus();

      // Navigate to resume preview
      // this.router.navigate(['/resume', resume.id]);
      
    } catch (err) {
      this.error = 'Failed to analyze resume. Please try again.';
    } finally {
      setTimeout(() => {
        this.analyzing = false;
        this.analysisProgress = 0;
      }, 1000);
    }
  }

  private isValidFileType(file: File): boolean {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return validTypes.includes(file.type);
  }

  private updateAnalysisStatus() {
    if (this.analysisProgress < 30) {
      this.analysisStatus = 'Uploading resume...';
    } else if (this.analysisProgress < 60) {
      this.analysisStatus = 'Extracting information...';
    } else if (this.analysisProgress < 90) {
      this.analysisStatus = 'Analyzing skills and experience...';
    } else {
      this.analysisStatus = 'Analysis complete!';
    }
  }
} 