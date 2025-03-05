export interface Response {
    content: string;
    object: string;
    requestId: number;  // ID de la demande à laquelle la réponse est liée
    idSender?: number;  // ID de l'utilisateur qui a répondu
  }
  