export interface Association {
  id: string;
  name: string;
  description: string;
  logo: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDate?: Date;
  documents: {
    registrationDoc: string;
    legalDoc: string;
  };
  status: 'pending' | 'active' | 'suspended';
  verificationDocuments?: string[];
  createdAt: Date;
  updatedAt: Date;
  teamMembers: TeamMember[];
  metrics: AssociationMetrics;
  statistics: {
    totalDonations: number;
    totalBeneficiaries: number;
    activeAidCases: number;
    completedAidCases: number;
  };
  aidCases: AidCase[];
  events: AssociationEvent[];
  mediaGallery: MediaItem[];
  notifications: Notification[];
  collaborations: Collaboration[];
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