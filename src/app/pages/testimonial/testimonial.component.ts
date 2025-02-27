import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { TestimonialService } from '../../services/testimonial.service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // ✅ Import nécessaire pour *ngFor
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-testimonial',
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,NavbarComponent,FooterComponent] // ✅ Ajout de CommonModule
})
export class TestimonialComponent implements OnInit {
  testimonialService = inject(TestimonialService);
  cdr = inject(ChangeDetectorRef); 
  testimonials: any[] = []; 

  testimonialForm = new FormGroup({
    content: new FormControl('', [Validators.required, Validators.minLength(10)]),
    beforePhoto: new FormControl('', Validators.required),
    afterPhoto: new FormControl('', Validators.required),
    description: new FormControl('', [Validators.required, Validators.minLength(5)])
  });

  constructor() {}

  ngOnInit(): void {
    this.refreshTestimonials();
  }

  refreshTestimonials(): void {
    console.log("🔄 Rechargement des témoignages...");
    this.testimonialService.getTestimonials().subscribe({
      next: (data) => {
        console.log("✅ Témoignages reçus du backend:", data);
        this.testimonials = data;
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        console.error("❌ Erreur lors du chargement des témoignages:", error);
      }
    });
  }

  saveTestimonial(): void {
    if (this.testimonialForm.valid) {
      console.log("📝 Envoi du témoignage:", this.testimonialForm.value);

      this.testimonialService.addTestimonial(this.testimonialForm.value).subscribe({
        next: (response) => {
          console.log('✅ Témoignage ajouté avec succès:', response);
          this.testimonialForm.reset(); 
          this.refreshTestimonials(); 
        },
        error: (error) => {
          console.error('❌ Erreur lors de l\'ajout du témoignage:', error);
        }
      });
    } else {
      console.warn('❌ Formulaire invalide');
    }
  }
}
