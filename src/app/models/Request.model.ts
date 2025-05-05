import { ForumResponse } from './Response.model';

export interface Request {
  idRequest?: number;  // Optionnel car généré par le backend
  dateRequest: Date;
  object: string;
  content: string;
  isUrgent: boolean;
  responses?: ForumResponse[]; // Liste des réponses associées
  forum?: any; // Forum lié à la demande (ajuster selon besoin)
  user?: {
    firstName: string;
    lastName: string;
  };
  response?: boolean; // Indique si la demande a reçu une réponse
  createdAt?: Date; // Date de création de la demande
}

