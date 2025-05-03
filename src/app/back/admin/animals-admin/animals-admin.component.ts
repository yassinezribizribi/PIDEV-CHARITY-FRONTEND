import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { AnimalService, Animal } from 'src/app/services/Animal.service';
import { TokenInterceptor } from 'src/app/interceptors/token.interceptor';
import { BlogSidebarsComponent } from '@component/blog-sidebars/blog-sidebars.component';

@Component({
  selector: 'app-animals-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    AdminNavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    HttpClientModule,
    BlogSidebarsComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    AnimalService,
  ],
  templateUrl: './animals-admin.component.html',
  styleUrls: ['./animals-admin.component.scss'],
})
export class AnimalsAdminComponent implements OnInit {
  animals: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private animalService: AnimalService, private router: Router) {}

  ngOnInit(): void {
    this.loadAnimals();
  }

  loadAnimals(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.error =
        'Aucun token d’authentification trouvé. Veuillez vous connecter.';
      this.loading = false;
      return;
    }

    this.animalService.getAllAnimals().subscribe({
      next: (data: Animal[]) => {
        this.animals = data;
        this.loading = false;
        console.log('Animaux chargés:', this.animals);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des animaux:', error);
        this.error =
          'Erreur lors du chargement des animaux : ' +
          (error.message || 'Vérifiez la console');
        this.loading = false;
      },
    });
  }

  deleteAnimal(id: number | undefined): void {
    if (id === undefined) {
      this.showModal('error');
      return;
    }
    this.showModal('confirm', id);
  }

  private confirmDelete(id: number): void {
    this.animalService.deleteAnimal(id).subscribe({
      next: () => {
        this.animals = this.animals.filter(
          (animal) => animal.idAnimal !== id
        );
        console.log(`Animal ${id} supprimé avec succès`);
        this.error = null;
        this.showModal('success');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.showModal('error');
      }
    });
  }

  private showModal(type: 'success' | 'error' | 'confirm', id?: number): void {
    const modalId =
      type === 'success'
        ? 'animalDeleteModal'
        : type === 'error'
        ? 'animalDeleteErrorModal'
        : 'animalDeleteConfirmModal';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modalElement);
      if (type === 'confirm' && id !== undefined) {
        // Attach confirm action to the modal's confirm button
        const confirmButton = modalElement.querySelector('.confirm-delete-btn');
        if (confirmButton) {
          // Remove existing listeners to prevent multiple bindings
          const newConfirmButton = confirmButton.cloneNode(true);
          confirmButton.parentNode?.replaceChild(newConfirmButton, confirmButton);
          newConfirmButton.addEventListener('click', () => {
            this.confirmDelete(id);
            bootstrapModal.hide();
          });
        }
      }
      bootstrapModal.show();
    } else {
      console.error(`Modal with ID ${modalId} not found`);
    }
  }

  editAnimal(animal: Animal): void {
    this.router.navigate(['/admin/edit-animal', animal.idAnimal]); // À ajuster selon votre route d’édition
  }

  onAddAnimal(): void {
    this.router.navigate(['/admin/add-animals']);
  }

  viewAnimal(animal: Animal): void {
    this.router.navigate(['/admin/animal-profile', animal.idAnimal]);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'adopté':
        return 'success';
      case 'disponible':
        return 'warning';
      default:
        return 'secondary';
    }
  }
}
