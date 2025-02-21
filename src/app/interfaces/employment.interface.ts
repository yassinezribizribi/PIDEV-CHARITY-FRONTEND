export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  parsedData: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      location: string;
    };
    skills: Skill[];
    experiences: Experience[];
    education: Education[];
    languages: Language[];
  };
  status: 'pending' | 'analyzed' | 'error';
  analyzedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  yearsOfExperience?: number;
  endorsements?: number;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  skills: string[];
  highlights: string[];
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
  achievements?: string[];
}

export interface Language {
  name: string;
  level: 'basic' | 'intermediate' | 'fluent' | 'native';
  certification?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    description: string;
    location: string;
    refugeeFriendly: boolean;
    logo: string;
  };
  description: string;
  requirements: {
    skills: string[];
    experience: string;
    education: string;
    languages: {
      name: string;
      level: string;
    }[];
  };
  benefits: JobBenefits;
  location: {
    city: string;
    country: string;
    remote: boolean;
  };
  employmentType: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  applicationDeadline: Date;
  refugeeSupport: {
    visaSponsorship: boolean;
    languageTraining: boolean;
    housingAssistance: boolean;
    mentorship: boolean;
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobBenefits {
  
  healthInsurance: boolean;
  paidTimeOff: boolean;
  workFromHome: boolean;
  flexibleHours: boolean;
  transportAllowance: boolean;
  housingAssistance: boolean;
  mentorship: boolean;
  salary: {
    min: number;
    max: number;
    currency: string;
    
  };
}

export interface JobApplication {
  id?: string;
  jobId?: string;
  userId?: string;
  resume?: string;
  coverLetter?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MentorshipSession {
  id: string;
  mentorId: string;
  title: string;
  description: string;
  type: 'cv-review' | 'interview-prep' | 'career-guidance' | 'skill-development';
  date: Date;
  duration: number; // in minutes
  maxParticipants: number;
  currentParticipants: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  meetingLink?: string;
  materials?: {
    title: string;
    url: string;
    type: string;
  }[];
  participants: {
    userId: string;
    status: 'registered' | 'attended' | 'cancelled';
    feedback?: string;
    rating?: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmploymentMetrics {
  applications: {
    total: number;
    byStatus: Record<string, number>;
    byIndustry: Record<string, number>;
    averageTimeToHire: number;
  };
  jobs: {
    total: number;
    active: number;
    byType: Record<string, number>;
    byLocation: Record<string, number>;
  };
  mentorship: {
    totalSessions: number;
    participantCount: number;
    averageRating: number;
    completionRate: number;
  };
  success: {
    placementRate: number;
    retentionRate: number;
    averageSalary: number;
  };
} 