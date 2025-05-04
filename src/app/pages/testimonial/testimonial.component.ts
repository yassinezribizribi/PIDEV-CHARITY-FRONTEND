import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestimonialService } from '../../services/testimonial.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,
    ScrollToTopComponent
  ],
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.scss']
})
export class TestimonialComponent implements OnInit {
  testimonials: any[] = [];
  testimonialForm!: FormGroup;
  testimonialType: 'photo' | 'media' = 'photo';
  filterType: 'all' | 'photo' | 'media' = 'all';
  searchKeyword = '';
  filteredResults: any[] = [];
  isEditing = false;
  selectedBeforePhoto: string | null = null;
  selectedAfterPhoto: string | null = null;
  beforePhotoFile: File | null = null;
  afterPhotoFile: File | null = null;
  currentUserId: number | null = null;


  showFull: { [key: number]: boolean } = {};
  selectedLang = 'en';

  supportedLangs = [
    { code: 'en', name: 'Anglais' },
    { code: 'sq', name: 'Albanais' },
    { code: 'ar', name: 'Arabe' },
    { code: 'az', name: 'Azéri' },
    { code: 'eu', name: 'Basque' },
    { code: 'bn', name: 'Bengali' },
    { code: 'bg', name: 'Bulgare' },
    { code: 'ca', name: 'Catalan' },
    { code: 'zh-Hans', name: 'Chinois simplifié' },
    { code: 'zh-Hant', name: 'Chinois traditionnel' },
    { code: 'cs', name: 'Tchèque' },
    { code: 'da', name: 'Danois' },
    { code: 'nl', name: 'Néerlandais' }
  ];

  constructor(
    private fb: FormBuilder,
    private service: TestimonialService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.testimonialForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });
    this.loadTestimonials();
  }

  translateAll(): void {
    if (!this.testimonials.length || this.selectedLang === 'fr') return;

    const contentText = this.testimonials.map(t => t.content).join('\n---\n');
    const descText = this.testimonials.map(t => t.description).join('\n---\n');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
      'Content-Type': 'application/json'
    });

    this.http.post<any>(
      'http://localhost:8089/api/translate',
      { text: contentText, sourceLang: 'auto', targetLangs: [this.selectedLang] },
      { headers }
    ).subscribe(res => {
      const translated = res[this.selectedLang].split('\n---\n');
      this.testimonials.forEach((t, i) => t.content = translated[i] || t.content);
    });

    this.http.post<any>(
      'http://localhost:8089/api/translate',
      { text: descText, sourceLang: 'auto', targetLangs: [this.selectedLang] },
      { headers }
    ).subscribe(res => {
      const translated = res[this.selectedLang].split('\n---\n');
      this.testimonials.forEach((t, i) => t.description = translated[i] || t.description);
    });
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(decodeURIComponent(url));
  }

  loadTestimonials(): void {
    this.service.getTestimonials().subscribe(res => {
      this.testimonials = res;
      this.testimonials.forEach(t => this.showFull[t.id] = this.showFull[t.id] || false);
      this.filteredResults = this.filteredTestimonials;
      this.cdr.detectChanges();
    });
  }

  onSearch(): void {
    const keyword = this.searchKeyword.trim().toLowerCase();
    this.filteredResults = keyword ? this.filteredTestimonials.filter(t =>
      t.content?.toLowerCase().includes(keyword) ||
      t.description?.toLowerCase().includes(keyword)
    ) : this.filteredTestimonials;
  }

  toggleSummary(id: number): void {
    this.showFull[id] = !this.showFull[id];
  }

  uploadMedia(event: any, mediaType: string): void {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', mediaType);
    formData.append('content', this.testimonialForm.get('content')?.value || '');
    formData.append('description', this.testimonialForm.get('description')?.value || '');

    this.service.uploadMedia(formData).subscribe({
      next: () => {
        this.loadTestimonials();
        this.resetForm();
        alert('✅ Media uploaded successfully!');
      },
      error: () => alert('❌ Error uploading media.')
    });
  }

  onFileSelected(event: any, type: 'before' | 'after'): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (type === 'before') {
        this.selectedBeforePhoto = base64;
        this.beforePhotoFile = file;
      } else {
        this.selectedAfterPhoto = base64;
        this.afterPhotoFile = file;
      }
    };
    reader.readAsDataURL(file);
  }

  analyzeImagesWithAI(): void {
    if (!this.beforePhotoFile || !this.afterPhotoFile) {
      alert("❌ Veuillez sélectionner les deux images.");
      return;
    }

    const formData = new FormData();
    formData.append('before', this.beforePhotoFile);
    formData.append('after', this.afterPhotoFile);

    this.http.post<any>('http://localhost:5001/analyze-images', formData).subscribe({
      next: res => {
        this.testimonialForm.patchValue({ content: res.content, description: res.description });
        alert('🧠 Analyse réussie !');
      },
      error: () => alert("❌ Erreur lors de l'analyse des images.")
    });
  }

  saveTestimonial(): void {
    const data = {
      ...this.testimonialForm.value,
      beforePhotoBase64: this.selectedBeforePhoto,
      afterPhotoBase64: this.selectedAfterPhoto
    };

    const action$ = this.isEditing && data.id
      ? this.service.updateTestimonial(data.id, data)
      : this.service.addTestimonial(data);

    action$.subscribe(() => {
      this.loadTestimonials();
      this.resetForm();
    });
  }

  editTestimonial(t: any): void {
    if (t.userId !== this.currentUserId) return;
    this.isEditing = true;
    this.testimonialForm.patchValue(t);
  }

  deleteTestimonial(id: number, userId: number): void {
    if (userId !== this.currentUserId) return;
    this.service.deleteTestimonial(id).subscribe(() => this.loadTestimonials());
  }

  runEmotionAnalysis(testimonial: any): void {
    if (!testimonial.transcriptionText) {
      alert("❌ Ce témoignage n'a pas de transcription.");
      return;
    }

    this.service.analyzeEmotion(testimonial.transcriptionText).subscribe({
      next: res => alert(`🎭 Émotion dominante : ${res.dominantEmotion} (score: ${res.score})`),
      error: () => alert("❌ Erreur lors de l'analyse émotionnelle.")
    });
  }

  likeTestimonial(testimonial: any): void {
    this.service.likeTestimonial(testimonial.id).subscribe(() => this.loadTestimonials());
  }

  unlikeTestimonial(testimonial: any): void {
    this.service.unlikeTestimonial(testimonial.id).subscribe(() => this.loadTestimonials());
  }

  resetForm(): void {
    this.testimonialForm.reset();
    this.selectedAfterPhoto = null;
    this.selectedBeforePhoto = null;
    this.beforePhotoFile = null;
    this.afterPhotoFile = null;
    this.isEditing = false;
  }

  get filteredTestimonials(): any[] {
    return this.testimonials.filter(t =>
      this.filterType === 'all' ||
      (this.filterType === 'photo' && (t.beforePhotoPath || t.afterPhotoPath)) ||
      (this.filterType === 'media' && t.mediaPath)
    );
  }
}
