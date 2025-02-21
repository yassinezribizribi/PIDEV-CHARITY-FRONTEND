export interface AidAnnouncement {
  id: string;
  title: string;
  description: string;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  type: 'medical' | 'financial' | 'supplies' | 'housing' | 'other';
  targetAmount?: number;
  currentAmount?: number;
  currency?: string;
  neededItems?: string[];
  location: {
    region: string;
    city?: string;
    address?: string;
  };
  beneficiary: {
    name: string;
    age?: number;
    story: string;
    images?: string[];
  };
  contactInfo: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  status: 'active' | 'fulfilled' | 'expired';
  createdAt: Date;
  expiresAt?: Date;
  createdBy: {
    id: string;
    name: string;
    type: 'association';
  };
  interactions: {
    views: number;
    shares: number;
    donations: number;
  };
  socialShares: {
    facebook: number;
    twitter: number;
    whatsapp: number;
    linkedin: number;
  };
} 