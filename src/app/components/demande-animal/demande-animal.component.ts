import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BlogSidebarsComponent } from '@component/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { jwtDecode } from 'jwt-decode';
import { DemandeAnimalService } from 'src/app/services/demande-animal.service';

@Component({
  selector: 'app-demande-animal',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule ,
    NavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    HttpClientModule,
    BlogSidebarsComponent
  ],
  templateUrl: './demande-animal.component.html',
  styleUrl: './demande-animal.component.scss'
})
export class DemandeAnimalComponent implements OnInit {

  demandes: any[] = [];

  constructor(private demandeService: DemandeAnimalService) {}
userId:any
  ngOnInit(): void {
    this.userId = this.getUserIdFromToken();
console.log(this.userId);

    this.chargerDemandes();
  }
 getUserIdFromToken(): number | null {
      const token = localStorage.getItem('auth_token');
      console.log("token:", token);
      
      if (!token) return null;
    
      try {
        const decodedToken: any = jwtDecode(token);
        
        return decodedToken.idUser;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }

  chargerDemandes() {
    this.demandeService.getAllbyuser(this.userId).subscribe({
      next: (data) => {this.demandes = data 
        console.log(data);
      },
      error: (err) => alert("Erreur lors du chargement : " + err.message)
    });
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
