export interface JobOffer {
    idJobOffer?: number;
    title: string;
    description: string;
    requirements: string;
    isActive: boolean;
    forumId: 1;
    jobApplications?: JobApplication[];
  }
  
  export interface Forum {
    id: number;
    name: string;
  }
  
  export interface JobApplication {
    id: number;
    applicantName: string;
    status: string;
  }
  