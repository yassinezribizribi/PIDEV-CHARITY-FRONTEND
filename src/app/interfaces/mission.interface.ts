export enum MissionStatus {
  COMPLETED = 'COMPLETED',
  UPCOMING = 'UPCOMING',
  UPGOING = 'UPGOING'
}

export interface Mission {
  idMission?: number;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  volunteerCount: number;
  status: MissionStatus;
  associationIds?: number[];
  crisisId?: number;
} 