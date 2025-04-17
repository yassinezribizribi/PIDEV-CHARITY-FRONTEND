// Correct import
import { JobApplication } from '../models/job-application.model';
export interface JobOffer {
  idJobOffer?: number;
  title: string;
  description: string;
  requirements: string;
  active: boolean;
  forumId?: number;
  createdBy?: { idUser: number;
    firstName: string;
    lastName: string;
    photo?: string | null;   };
  jobApplications?: JobApplication[];
  forum?: any; // Add this if present in backend response
  createdAt?: string; // Add this if present


  }
  
  export interface Forum {
    id: number;
    name: string;
  }
  
  
  