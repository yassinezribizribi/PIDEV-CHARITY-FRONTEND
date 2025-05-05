import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestimonialService } from '../../services/testimonial.service';

@Component({
  selector: 'app-testimonial-form',
  templateUrl: './testimonial-form.component.html',
  styleUrls: ['./testimonial-form.component.css']
})
export class TestimonialComponent implements OnInit {
  testimonialForm: FormGroup;
  testimonials: any[] = [];
  isEditing: boolean = false;
  selectedTestimonialId: number | null = null;
  searchKeyword: string = '';
  previewBeforePhoto: string | ArrayBuffer | null = null;
  previewAfterPhoto: string | ArrayBuffer | null = null;

  constructor(private fb: FormBuilder, private testimonialService: TestimonialService) {}

  ngOnInit(): void {
    this.testimonialForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      beforePhoto: [null],
      afterPhoto: [null]
    });

    this.loadTestimonials();
  }

  // Charger les témoignages existants
  loadTestimonials() {
    this.testimonialService.getAllTestimonials().subscribe(
      (data) => this.testimonials = data,
      (error) => console.error('Erreur de chargement des témoignages', error)
    );
  }

  // Sélection d'un fichier et mise à jour de l'aperçu
  onFileSelected(event: any, type: 'beforePhoto' | 'afterPhoto') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'beforePhoto') {
          this.previewBeforePhoto = reader.result;
        } else {
          this.previewAfterPhoto = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  // Enregistrer ou modifier un témoignage
  saveTestimonial() {
    if (this.testimonialForm.invalid) return;

    const formData = new FormData();
    formData.append('content', this.testimonialForm.get('content')?.value);
    formData.append('description', this.testimonialForm.get('description')?.value);

    if (this.selectedTestimonialId) {
      // Mode édition
      this.testimonialService.updateTestimonial(this.selectedTestimonialId, formData).subscribe(() => {
        this.loadTestimonials();
        this.resetForm();
      });
    } else {
      // Ajout d'un témoignage
      this.testimonialService.createTestimonial(formData).subscribe(() => {
        this.loadTestimonials();
        this.resetForm();
      });
    }
  }

  // Modifier un témoignage existant
  editTestimonial(testimonial: any) {
    this.isEditing = true;
    this.selectedTestimonialId = testimonial.id;
    this.testimonialForm.patchValue({
      content: testimonial.content,
      description: testimonial.description
    });

    this.previewBeforePhoto = testimonial.beforePhotoUrl || null;
    this.previewAfterPhoto = testimonial.afterPhotoUrl || null;
  }

  // Supprimer un témoignage
  deleteTestimonial(id: number) {
    if (confirm('Voulez-vous vraiment supprimer ce témoignage ?')) {
      this.testimonialService.deleteTestimonial(id).subscribe(() => {
        this.loadTestimonials();
      });
    }
  }

  // Réinitialiser le formulaire
  resetForm() {
    this.testimonialForm.reset();
    this.isEditing = false;
    this.selectedTestimonialId = null;
    this.previewBeforePhoto = null;
    this.previewAfterPhoto = null;
  }

  // Recherche de témoignages
  search() {
    if (this.searchKeyword.trim()) {
      this.testimonialService.searchTestimonials(this.searchKeyword).subscribe((data) => {
        this.testimonials = data;
      });
    } else {
      this.loadTestimonials();
    }
  }
}
