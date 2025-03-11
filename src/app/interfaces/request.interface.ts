export interface Request {
  idRequest?: number;  // Optionnel car généré par le backend
  dateRequest: Date;
  object: string;
  content: string;
  isUrgent: boolean;
  responses?: Response[];  // Liste des réponses associées
  forum?: any;  // Forum lié à la demande (ajuster selon besoin)
}

export interface Response {
  idResponse?: number;  // Optionnel si c'est généré par le backend
  content: string;
  dateResponse: Date;
  idRequest: number;  // L'ID de la demande associée
}
