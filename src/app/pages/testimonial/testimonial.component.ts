import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestimonialService } from '../../services/testimonial.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';

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
  filteredTestimonials: any[] = [];
  testimonialForm!: FormGroup;
  testimonialType: 'photo' | 'media' = 'photo';

  searchKeyword = '';
  isEditing = false;
  selectedBeforePhoto: string | null = null;
  selectedAfterPhoto: string | null = null;
  showFull: { [key: number]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private service: TestimonialService,
    private cdr: ChangeDetectorRef // 👉 utile au cas où l'affichage ne se met pas à jour
  ) {}

  ngOnInit(): void {
    this.testimonialForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });
    this.loadTestimonials();
  }

  toggleLike(testimonial: any): void {
    this.service.likeTestimonial(testimonial.id).subscribe({
      next: () => this.loadTestimonials(),
      error: err => {
        console.error('Erreur lors du like :', err);
        alert("Erreur lors de l'envoi du like.");
      }
    });
  }

  loadTestimonials(): void {
    this.service.getTestimonials().subscribe(res => {
      this.testimonials = res;
      this.filteredTestimonials = res;

      // Initialisation des résumés à masquer
      this.filteredTestimonials.forEach(t => {
        if (t.id && !(t.id in this.showFull)) {
          this.showFull[t.id] = false;
        }
      });

      // 🔁 au cas où le DOM n’est pas mis à jour automatiquement
      this.cdr.detectChanges();
    });
  }

  toggleSummary(id: number): void {
    this.showFull[id] = !this.showFull[id];
    this.cdr.detectChanges(); // 🔄 force la vue à se mettre à jour
  }

  uploadMedia(event: any, mediaType: string): void {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaType', mediaType);

    this.service.uploadMedia(formData).subscribe({
      next: () => {
        this.loadTestimonials();
        alert('✅ Fichier uploadé avec succès et transcrit automatiquement !');
      },
      error: err => {
        console.error('Erreur upload : ', err);
        alert('❌ Erreur lors de l\'upload.');
      }
    });
  }

  search(): void {
    const trimmed = this.searchKeyword.trim();
    if (!trimmed) {
      this.loadTestimonials();
      return;
    }

    this.service.searchTestimonials(trimmed).subscribe({
      next: res => this.filteredTestimonials = res,
      error: err => {
        console.error('❌ Erreur recherche :', err);
        alert('Erreur recherche témoignages.');
      }
    });
  }

  onSearchChange(): void {
    this.search();
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
    this.isEditing = true;
    this.testimonialForm.patchValue(t);
  }

  deleteTestimonial(id: number): void {
    this.service.deleteTestimonial(id).subscribe(() => this.loadTestimonials());
  }

  onFileSelected(event: any, type: 'before' | 'after'): void {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (type === 'before') {
        this.selectedBeforePhoto = base64;
      } else {
        this.selectedAfterPhoto = base64;
      }
    };
    reader.readAsDataURL(file);
  }
  runEmotionAnalysis(testimonial: any): void {
    if (!testimonial.transcriptionText) {
      alert("❌ Ce témoignage n'a pas de transcription.");
      return;
    }
  
    this.service.analyzeEmotion(testimonial.transcriptionText).subscribe({
      next: (res) => {
        alert(`🎭 Émotion dominante : ${res.dominantEmotion} (score: ${res.score})`);
      },
      error: (err) => {
        console.error("❌ Erreur d’analyse émotionnelle :", err);
        alert("Erreur lors de l'analyse émotionnelle.");
      }
    });
  }
  
  resetForm(): void {
    this.testimonialForm.reset();
    this.selectedAfterPhoto = null;
    this.selectedBeforePhoto = null;
    this.isEditing = false;
  }
}
