// src/app/models/Response.model.ts
export interface ForumResponse {
  idResponse: number; // ID de la réponse
  dateResponse: any; // Date de la réponse
  content: string; // Contenu de la réponse
  object?: string; // Objet de la réponse (optionnel)
  requestId?: number; // ID de la demande associée
  senderId?: number; // ID de l'utilisateur qui a envoyé la réponse
}