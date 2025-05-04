export enum AssociationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
export interface Association {
  idAssociation: number;
  associationName: string;
  associationAddress: string;
  associationPhone: string;
  associationEmail: string;
  associationLogoPath: string | null;
  registrationDocumentPath: string | null;
  legalDocumentPath: string | null;
  description: string;
  status: AssociationStatus;
  partnershipTier?: string;
  partnershipScore?: number;
  partners?: Association[];
  missions?: any[];
  donations?: any[];
  tags?: string[];
  subscriber?: {
    email: string;
    [key: string]: any;
  };
  similarityScore?: number;
}
export interface PartnershipRecommendation extends Association {
  similarityScore?: number;
}

export enum PartnershipTierLevel {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD'
}
export interface PartnerAssociation extends Association {
  partnershipId?: number;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  date: Date;
}

export enum ActivityType {
  DONATION = 'donation',
  MISSION = 'mission',
  EVENT = 'event',
  MEMBER = 'member'
}

export interface PartnerRecommendation extends Association {
  similarityScore?: number;
}

export interface AppMetrics {
  key: keyof PartnershipImpactReport;
  label: string;
  icon: string;
  color: string;
  suffix: string;
}

export interface StatisticItem {
  key: string;
  label: string;
  iconClass: string;
  bgClass: string;
}
export interface PartnershipTier {
  tier: string;
  currentTier?: string;  // For backward compatibility
  maxPartners: number;
  benefits: string[];
  nextThreshold: number;
  nextTierThreshold?: number;  // For backward compatibility
  score: number;
}

export interface PartnershipImpactReport {
  jointMissionsCompleted: number;
  volunteersShared: number;
  efficiencyImprovement: number;
  partnershipScore: number;
  recommendations?: string[];
}


export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  phone?: string;
  status: 'active' | 'inactive';
}

export interface AidCase {
  id: string;
  associationId: string;
  title: string;
  description: string;
  category: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  images: string[];
  videos?: string[];
  documents?: string[];
  targetAmount?: number;
  raisedAmount?: number;
  currentAmount?: number;
  beneficiaries: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  startDate: Date;
  endDate?: Date;
  tags: string[];
  interactions: {
    views: number;
    shares: number;
    likes: number;
    comments: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AssociationEvent {
  id: string;
  associationId: string;
  title: string;
  description: string;
  type: 'donation_drive' | 'solidarity_event' | 'fundraiser' | 'other';
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  startDate: Date;
  endDate: Date;
  capacity?: number;
  registeredParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  images?: string[];
  targetAmount?: number;
  raisedAmount?: number;
  sponsors?: {
    name: string;
    logo?: string;
    contribution?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AssociationMetrics {
  totalAidCases: number;
  activeAidCases: number;
  totalEvents: number;
  upcomingEvents: number;
  totalDonations: number;
  monthlyDonations: number;
  totalBeneficiaries: number;
  totalVolunteers: number;
  engagement: {
    followers: number;
    interactions: number;
    shares: number;
  };
  recentActivity: {
    timestamp: Date;
    type: 'aid_case' | 'event' | 'donation' | 'interaction';
    description: string;
  }[];
}



export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  title: string;
  description?: string;
  category: string;
  uploadedAt: Date;
  size: number;
}

export interface Notification {
  id: string;
  type: 'donation' | 'event' | 'campaign' | 'collaboration' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: any;
}

export interface Collaboration {
  id: string;
  partnerId: string;
  partnerName: string;
  projectTitle: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'proposed' | 'active' | 'completed';
  objectives: string[];
  outcomes: string[];
}

export interface Event extends AssociationEvent {
  // Additional event properties if needed
} 
