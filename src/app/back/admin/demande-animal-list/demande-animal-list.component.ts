import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { DemandeAnimal, DemandeAnimalService } from 'src/app/services/demande-animal.service';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { FooterComponent } from '@component/footer/footer.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-demande-animal-list',
  imports: [CommonModule,AdminNavbarComponent,ScrollToTopComponent,FooterComponent,RouterLink],
  templateUrl: './demande-animal-list.component.html',
  styleUrl: './demande-animal-list.component.scss'
})
export class DemandeAnimalListComponent implements OnInit {

  demandes: any[] = [];

  constructor(private demandeService: DemandeAnimalService) {}

  ngOnInit(): void {
    this.chargerDemandes();
  }

  chargerDemandes() {
    this.demandeService.getAll().subscribe({
      next: (data) => {this.demandes = data 
        console.log(data);
      },
      error: (err) => alert("Erreur lors du chargement : " + err.message)
    });
  }

  accepterDemande(demandeId: number) {
    this.demandeService.accepter(demandeId).subscribe({
      next: () => {
        alert("Demande acceptée !");
        this.chargerDemandes(); // Refresh après acceptation
      },
      error: (err) => alert("Erreur : " + err.message)
    });
  }
}
