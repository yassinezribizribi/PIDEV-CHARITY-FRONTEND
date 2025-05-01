export enum DonationType {
    FOOD = 'FOOD',
    CLOTHES = 'CLOTHES',
    MEDICAL = 'MEDICAL',
    OTHER = 'OTHER'
}

export interface Donation {
    idDonation?: number;               // Donation ID (Optional)
    titre: string;                      // Title of the donation request
    description: string;                // Description of the donation request
    quantiteDemandee: number;           // Total quantity requested
    quantiteDonnee: number;             // Total quantity donated
    availability: boolean;              // Availability status (whether donation is still active)
    lastUpdated: string;                // Last updated date in string format (ISO 8601)
    donationType: DonationType;        // Type of donation (food, clothes, etc.)
    quantiteExcedentaire: number;      // Excess quantity donated
    cagnotteenligne: { title: string; description: string; goalAmount: number; currentAmount: number } | null;
    associationDonation?: any;         // Association linked to the donation (can be extended based on your needs)
    // imageUrl?: string;  // Optional image URL

}
