import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '@component/navbar/navbar.component';
import {
  DemandeAnimal,
  DemandeAnimalService,
} from 'src/app/services/demande-animal.service';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { FooterComponent } from '@component/footer/footer.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-demande-animal-list',
  imports: [
    CommonModule,
    AdminNavbarComponent,
    ScrollToTopComponent,
    FooterComponent,
    RouterLink,
  ],
  templateUrl: './demande-animal-list.component.html',
  styleUrl: './demande-animal-list.component.scss',
})
export class DemandeAnimalListComponent implements OnInit {
  demandes: any[] = [];

  constructor(private demandeService: DemandeAnimalService) {}

  ngOnInit(): void {
    this.chargerDemandes();
  }

  chargerDemandes() {
    this.demandeService.getAll().subscribe({
      next: (data) => {
        this.demandes = data;
        console.log(data);
      },
      error: (err) => alert('Erreur lors du chargement : ' + err.message),
    });
  }

  accepterDemande(demandeId: number): void {
    this.demandeService.accepter(demandeId).subscribe({
      next: () => {
        this.showModal('success'); // Show success modal
        this.chargerDemandes(); // Refresh après acceptation
      },
      error: (err) => {
        console.error('Error accepting demande:', err);
        this.showModal('error'); // Show error modal
      },
    });
  }

  private showModal(type: 'success' | 'error'): void {
    const modalId = type === 'success' ? 'demandeActionModal' : 'demandeErrorModal';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modalElement);
      bootstrapModal.show();
    } else {
      console.error(`Modal with ID ${modalId} not found`);
    }
  }



}
