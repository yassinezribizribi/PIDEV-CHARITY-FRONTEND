export interface Crisis {
  id?: number;                     // Optionnel car généré par le backend à la création
  description: string;
  categorie: string;              // Assure-toi que cela correspond à l'enum côté backend
  location: string;
  updates: string;
  crisisDate: string;             // Format ISO recommandé pour cohérence (ex: "2025-04-24T14:30:00")
  severity: string;              // Doit matcher l'enum CrisisSeverity du backend
  status?: string;               // Optionnel à la création, souvent géré côté backend
  latitude?: number;
  longitude?: number;
  idUser?: number;               // Peut être rempli côté frontend ou backend selon le contexte
  missions?: any[];              // Tu pourras typer ça plus tard si tu veux gérer les missions
  image?: File | string;         // Pour envoi (File) ou lecture (string base64 ou URL)
  imageUrl?: string;             // Pour affichage rapide depuis une URL backend, ex: /images/nom.jpg
}
