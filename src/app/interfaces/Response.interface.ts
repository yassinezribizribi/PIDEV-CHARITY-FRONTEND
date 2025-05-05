export interface Response {
    idResponse?: number;  // Optionnel si c'est généré par le backend
    content: string;
    dateResponse: Date;
    idRequest: number;  // L'ID de la demande associée
  }