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

export interface JobApplication {
  idApplication: number;
  applicationDate: Date;
  jobApplicationStatus: JobApplicationStatus;
  jobOfferId: number;
  applicant: Applicant;
  statusHistory?: StatusHistory[];
}

export interface Applicant {
  idUser: number;
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
}