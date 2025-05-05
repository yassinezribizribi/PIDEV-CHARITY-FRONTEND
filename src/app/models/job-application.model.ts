// src/app/models/job-application.model.ts
export enum JobApplicationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  INTERVIEW = 'INTERVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface StatusHistory {
  status: JobApplicationStatus;
  date: Date;
  notes?: string;
}

// In your frontend models
export interface JobApplication {
  idApplication: number;
  applicationDate: Date;
  status?: JobApplicationStatus;
  jobOfferId: number;
  jobTitle?: string;
  applicantId?: number;
  applicantName?: string;
  applicantEmail?: string;
  applicantTelephone?: string;
  jobApplicationStatus?: JobApplicationStatus;
  applicant?: Applicant;
  statusHistory?: StatusHistory[];
}

export interface Applicant {
  idUser: number;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string | null;
  isBanned: boolean;
  banreason: string | null;
  role?: string;  // Current role/position
  skills?: string[];  // Array of skills
  telephone?: string;  // Phone number
  initialJob?: string;  // The job entered during signup
  job?: string;  // Current job
  profession?: string;  // Profession
  occupation?: string;  // Occupation
}