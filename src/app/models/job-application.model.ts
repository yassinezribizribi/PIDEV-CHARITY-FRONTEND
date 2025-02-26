// job-application.model.ts
export enum JobApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export class JobApplication {
  idApplication?: number;
  applicationDate?: Date;
  jobApplicationStatus: JobApplicationStatus;  // Make sure this is not undefined
  jobOfferId: number;
  userId: number;
 

  constructor(
    
    applicationDate: Date | undefined,
    jobApplicationStatus: JobApplicationStatus,
    jobOfferId: number,
    userId: number,
  ) {
    
    this.applicationDate = applicationDate;
    this.jobApplicationStatus = jobApplicationStatus;
    this.jobOfferId = jobOfferId;
    this.userId = userId;
  }
}
