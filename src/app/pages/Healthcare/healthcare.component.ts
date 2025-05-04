/* healthcare.component.ts */
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HealthcareService } from '../../services/healthcare.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { FooterComponent } from '@component/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-healthcare',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,
    HttpClientModule
  ],
  templateUrl: './healthcare.component.html',
  styleUrls: ['./healthcare.component.scss']
})
export class HealthcareComponent implements OnInit {
  private healthcareService = inject(HealthcareService);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  isRequester = false;
  isVolunteer = false;
  healthcareList: any[] = [];
  ongoingHealthcareList: any[] = [];
  completedHealthcareList: any[] = [];

  pageSize = 5;
  currentPage = 1;

  doctorForm!: FormGroup;
  healthcareForm!: FormGroup;

  showDetailModal = false;
  selectedPatient: any = null;
  showVideo = false;

  notificationMessage: string | null = null;
  notificationLink: string | null = null;

  powerBIReportUrl!: SafeResourceUrl;
  showReport = false;

  latestPatientCareId: number | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.setupUserRoles();
    this.initForms();
    if (this.isVolunteer) {
      this.loadHealthcareList();
      this.initPowerBIReport();
    } else if (this.isRequester) {
      this.loadMyCareList();
    }
  }

  private setupUserRoles(): void {
    const role = this.authService.getUserRole();
    this.isRequester = ['ROLE_REFUGEE', 'ROLE_ASSOCIATION_MEMBER'].includes(role);
    this.isVolunteer = role === 'ROLE_VOLUNTEER';
  }

  private initForms(): void {
    this.doctorForm = this.fb.group({
      idHealthcare: ['', Validators.required],
      disease: ['', Validators.required],
      treatmentPlan: ['', Validators.required],
      bookingDate: ['', Validators.required],
      status: ['IN_PROGRESS', Validators.required],
      meetingUrl: ['', Validators.required]
    });

    this.healthcareForm = this.fb.group({
      history: ['', Validators.required],
      bookingDate: ['', Validators.required]
    });
  }

  private initPowerBIReport(): void {
    const raw = 'https://app.powerbi.com/reportEmbed?reportId=2edf502c-ec72-4db2-85b3-0dc13284dcae&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730';
    this.powerBIReportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(raw);
  }

  loadHealthcareList(): void {
    this.healthcareService.getAllHealthcare().subscribe(data => {
      this.healthcareList = data.map(item => ({
        idHealthcare: item.id,
        subscriberId: item.subscriber?.idUser,
        subscriberName: item.subscriber?.firstName && item.subscriber?.lastName
          ? `${item.subscriber.firstName} ${item.subscriber.lastName}`
          : this.authService.getUserFullName(),
        symptoms: item.history,
        bookingDate: item.bookingDate,
        status: item.status,
        disease: item.terminalDisease,
        treatmentPlan: item.treatmentPlan,
        meetingUrl: item.meetingUrl
      }));
      this.ongoingHealthcareList = this.healthcareList.filter(p => p.status !== 'COMPLETED');
      this.completedHealthcareList = this.healthcareList.filter(p => p.status === 'COMPLETED');
    });
  }

  loadMyCareList(): void {
    this.healthcareService.getMyHealthcare().subscribe((list: any[]) => {
      if (list.length > 0) {
        this.latestPatientCareId = list[list.length - 1].id;
      }
    });
  }

  openDetails(patient: any): void {
    this.selectedPatient = patient;
    this.doctorForm.patchValue({
      idHealthcare: patient.idHealthcare,
      disease: patient.disease,
      treatmentPlan: patient.treatmentPlan,
      bookingDate: this.formatForInput(patient.bookingDate),
      status: patient.status,
      meetingUrl: patient.meetingUrl
    });
    this.showDetailModal = true;
  }

  closeDetails(): void {
    this.showDetailModal = false;
  }

  downloadPdf(id: number): void {
    this.healthcareService.downloadReportPdf(id).subscribe({
      next: (pdfBlob: Blob) => {
        const file = new Blob([pdfBlob], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank');
        saveAs(file, `rapport_soin_${id}.pdf`);
      },
      error: (err) => {
        console.error("❌ Erreur lors du téléchargement du PDF :", err);
        alert("Erreur lors du téléchargement du rapport PDF.");
      }
    });
  }

  updateHealthcare(): void {
    if (this.doctorForm.invalid || !this.selectedPatient) return;
    const f = this.doctorForm.value;
    const payload = {
      id: this.selectedPatient.idHealthcare,
      subscriberId: this.selectedPatient.subscriberId,
      doctorId: this.authService.getUserId(),
      terminalDisease: f.disease,
      treatmentPlan: f.treatmentPlan,
      bookingDate: f.bookingDate,
      status: f.status,
      meetingUrl: f.meetingUrl
    };
    this.healthcareService.updateHealthcare(payload.id, payload).subscribe({
      next: () => {
        this.showNotification('✅ Healthcare updated successfully!', payload.meetingUrl);
        this.loadHealthcareList();
        this.closeDetails();
      },
      error: () => {
        this.showNotification('❌ Error updating healthcare.');
      }
    });
  }

  private formatForInput(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  }

  submitHealthcareRequest(): void {
    if (this.healthcareForm.invalid) return;
    const f = this.healthcareForm.value;
    const payload = {
      history: f.history,
      bookingDate: f.bookingDate,
      subscriberId: this.authService.getUserId(),
      doctorId: 2
    };
    this.healthcareService.addHealthcare(payload).subscribe(() => {
      alert('✅ Request submitted!');
      this.healthcareForm.reset();
      this.loadHealthcareList();
    });
  }

  useIAForDiagnosis(): void {
    const symptoms = this.doctorForm.value.disease || this.selectedPatient?.symptoms;
    if (!symptoms) return;
    this.healthcareService.predictDiagnosis(symptoms).subscribe(res => {
      this.doctorForm.patchValue({
        disease: res.diagnostic,
        treatmentPlan: res.treatment
      });
    });
  }

  toggleReport(): void {
    this.showReport = !this.showReport;
  }

  toggleVideo(): void {
    this.showVideo = !this.showVideo;
  }

  private showNotification(message: string, link?: string): void {
    this.notificationMessage = message;
    this.notificationLink = link || null;
    setTimeout(() => {
      this.notificationMessage = null;
      this.notificationLink = null;
    }, 4000);
  }

  getSafeUrl(url: string | null): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url || '');
  }

  get totalCompletedPages(): number {
    return Math.ceil(this.completedHealthcareList.length / this.pageSize);
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.totalCompletedPages }, (_, i) => i + 1);
  }

  get pagedCompletedList(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.completedHealthcareList.slice(start, start + this.pageSize);
  }
}
