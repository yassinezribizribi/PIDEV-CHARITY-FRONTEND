import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { jwtDecode } from 'jwt-decode';
 // ✅ Import du décodeur JWT

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private apiUrl = 'http://localhost:8089/api/testimonials'; // 🔗 Lien vers l'API
  http = inject(HttpClient);
  authService = inject(AuthService);

  constructor() {}

  // ✅ Générer les headers avec Token JWT
  private getHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  // ✅ Récupérer tous les témoignages
  getTestimonials(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // ✅ Extraire l'ID utilisateur du Token JWT
  getUserId(): number | null {
    const token = localStorage.getItem('auth_token'); // ✅ Utiliser la bonne clé
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log("Decoded Token:", decodedToken); // ✅ Vérification en console
        return decodedToken.iduser || null; // Vérifier que le claim est bien `iduser`
      } catch (error) {
        console.error("❌ Erreur lors du décodage du token:", error);
      }
    }
    return null;
  }

  // ✅ Ajouter un témoignage avec ID utilisateur
  addTestimonial(testimonial: any): Observable<any> {
    const userId = this.getUserId();
    if (!userId) {
      console.error("❌ Impossible d'ajouter un témoignage : ID utilisateur introuvable !");
      return new Observable(); // Retourne un Observable vide si l'ID est manquant
    }

    const testimonialWithUser = {
      ...testimonial,
      userId: userId // ✅ Ajout de l'ID utilisateur dans la requête
    };

    return this.http.post<any>(`${this.apiUrl}/add`, testimonialWithUser, { headers: this.getHeaders() });
  }
}
