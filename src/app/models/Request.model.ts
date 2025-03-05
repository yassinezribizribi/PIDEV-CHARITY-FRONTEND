export interface Request {
    idRequest?: number;  // Optionnel car généré par le backend
    idSender: number;
    idReceiver: number;
    dateRequest: Date;
    object: string;
    content: string;
    isUrgent: boolean;
    responses?: Response[]; // Liste des réponses associées
    forum?: any; // Forum lié à la demande (ajuster selon besoin)
  }
  