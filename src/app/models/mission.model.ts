export enum MissionStatus {
  UPCOMING = 'UPCOMING',
  UPGOING = 'UPGOING',
  COMPLETED = 'COMPLETED'

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