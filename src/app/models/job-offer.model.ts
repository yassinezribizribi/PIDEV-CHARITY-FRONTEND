export interface JobOffer {
    idJobOffer?: number;
    title: string;
    description: string;
    requirements: string;
    isActive: boolean;
    forum?: Forum;
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
  