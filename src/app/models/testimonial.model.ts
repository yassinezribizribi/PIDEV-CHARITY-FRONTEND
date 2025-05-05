export interface Testimonial {
    id?: number; // ? signifie que l'ID est optionnel (géré par le backend)
    content: string;
    beforePhoto: string;
    afterPhoto: string;
    description: string;
    userId: number; // ID de l'utilisateur qui a créé le témoignage
  }
  