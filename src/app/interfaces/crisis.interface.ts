export interface Crisis {
  id?: number;  // Ensure that 'id' is optional
  description: string;
  categorie: string;
  location: string;
  updates: string;
  crisisDate: string;
  severity: string;
  status: string;
  latitude?: number;
  longitude?: number;
  idUser?: number;
  missions?: any[];
  image?: File | string;      // Nouveau champ pour l'image (URL ou chemin vers l'image)

}
