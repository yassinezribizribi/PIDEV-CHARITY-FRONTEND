export interface Payment {
    idPaiement?: number;
    datePaiement: Date;
    montant: number;
    stripePaymentId: string;
    status: 'succeeded' | 'pending' | 'failed';
    currency: string;
    event?: any; // You might want to create an Event interface later
    cagnotte?: any; // You might want to create a CagnotteEnligne interface later
} 