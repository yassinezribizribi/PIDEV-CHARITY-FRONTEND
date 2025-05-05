// Correct import
import { JobApplication } from '../models/job-application.model';

export interface JobOfferReport {
  idReport?: number;
  jobOfferId: number;
  reporterId: number;
  reason: string;
  description: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  createdAt: Date;
  updatedAt?: Date;
}

export interface JobOffer {
  idJobOffer?: number;
  title: string;
  description: string;
  requirements: string;
  location?: string;
  salary?: number;
  type?: string;
  active: boolean;
  createdAt: string | Date;
  createdBy: {
    idUser: number;
    firstName: string;
    lastName: string;
    photo?: string | null;
    profileImage?: string | null;
    isBanned?: boolean;
    banreason?: string | null;
  };
  reportCount: number;
  jobApplications?: JobApplication[];
  forum?: Forum;
  reports?: JobOfferReport[];
}

export interface Forum {
  id: number;
  name: string;
}
  
  
  