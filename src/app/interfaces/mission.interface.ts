export enum MissionStatus {
  COMPLETED = 'COMPLETED',
  UPCOMING = 'UPCOMING',
  UPGOING = 'UPGOING'
}

export interface Mission {
  id?: number;
  idMission?: number;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  volunteerCount: number;
  status?: MissionStatus;
  associationId?: number;
  partnerAssociationId?: number;
  associationIds?: number[];
  crisisId?: number;
  createdAt: Date;
  isJointMission?: boolean;
  collaborators?: number[];
  progress?: {
    completedTasks: number;
    totalTasks: number;
    notes?: string;
  };
} 