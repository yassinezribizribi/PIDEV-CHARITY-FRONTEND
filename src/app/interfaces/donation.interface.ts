export enum DonationType {
    FOOD = 'FOOD',
    CLOTHES = 'CLOTHES',
    MEDICAL = 'MEDICAL',
    OTHER = 'OTHER'
  }
  
  export interface CagnotteEnligne {
    idCagnotte?: number;
    title: string;
    description: string;
    goalAmount: number;
    currentAmount: number;
  }
  
  export interface Donation {
    idDonation?: number;
    titre: string;
    description: string;
    quantiteDemandee: number;
    quantiteDonnee: number;
    donationType: DonationType;
    quantiteExcedentaire: number;
    imageUrl: string;
    startDate?: string; // LocalDate - ISO format
    endDate: Date;
    cagnotteenligne: CagnotteEnligne | null;
    status: DonationStatus;
    priority: number; // 1 = Low, 2 = Medium, 3 = High, 4 = Urgent
    targetAmount: number;
    currentAmount: number;
  }
  
  export interface DonationSuggestionDTO {
    average: number | null;       // campaign‐wide average
    todayAverage: number | null;  // today's average
    suggestion?: number;          // the amount to suggest (optional)
    message: string | null;       // optional UX hint
  }
  
  export enum DonationStatus {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
  
  }

  export interface DonationExtensionSuggestion {
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
  
  