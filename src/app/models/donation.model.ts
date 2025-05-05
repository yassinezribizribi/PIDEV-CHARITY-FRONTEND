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
    cagnotteenligne?: any;              // Optional online fundraising information (can be added as per backend definition)
    associationDonation?: any;         // Association linked to the donation (can be extended based on your needs)
}
export interface DonationSuggestionDTO {
    campaignAverage: number | null;
    todayAverage: number | null;
    roundedSuggestion: number;
  }
  
  interface DonationExtensionSuggestion {
    suggestedDays: number;
    message: string;
    donationProgress: number;
    cagnotteProgress: number;
    donationDailyAvg: number;
    cagnotteDailyAvg: number;
    donationRemaining: number;
    cagnotteRemaining: number;
    donationEstimatedDays: number;
    cagnotteEstimatedDays: number;
  }
