export interface Crisis {
  idCrisis?: number;  // L'ID de la crise
  categorie: string;   // Catégorie de la crise (ex: NATURAL_DISASTER)
  location: string;   // Emplacement de la crise
  updates: string;    // Mises à jour sur la crise
  description: string; // Description détaillée de la crise
  crisisDate: string;  // Date et heure de la crise (format ISO)
  severity: string;    // Sévérité de la crise (ex: LOW, MODERATE, HIGH, CRITICAL)
  status: string;      // Statut de la crise (ex: PENDING, ACTIVE, RESOLVED)
  latitude?: number;   // Latitude de la localisation
  longitude?: number;  // Longitude de la localisation
  idUser?: number;     // ID de l'utilisateur qui a signalé la crise
    missions?: any[];    // Liste des missions associées à la crise
    image?: string | File;     // URL de l'image ou objet File pour upload
    imageUrl?: string;             // Pour affichage rapide depuis une URL backend, ex: /images/nom.jpg


}

export interface Subscriber {
  idUser: number;      // ID de l'utilisateur
  firstName: string;   // Prénom de l'utilisateur
  lastName: string;    // Nom de famille de l'utilisateur
  email: string;       // Email de l'utilisateur
  telephone?: string;  // Numéro de téléphone (facultatif)
}

export interface CrisisAssignmentResponse {
  associationName: string;
  associationAddress: string;
}
