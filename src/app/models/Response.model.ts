export interface Response {
    idRespons?: number; // Optionnel car généré par le backend
    idSender: number;
    idReceiver: number;
    dateRespons: Date;
    content: string;
    object: string;
    requests?: Request[]; // Liste des demandes associées
  }
  