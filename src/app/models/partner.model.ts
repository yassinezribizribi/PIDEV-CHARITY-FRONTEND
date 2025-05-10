export interface Partner {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  partnershipDate: Date;
  status: 'ACTIVE' | 'INACTIVE';
} 