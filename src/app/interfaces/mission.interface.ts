import { Association } from './association.interface';
import { MissionRole } from './mission-role.interface';
import { Participation } from './participation.interface';

export enum MissionStatus {
  COMPLETED = 'COMPLETED',
  UPCOMING = 'UPCOMING',
  UPGOING = 'UPGOING'
}

export interface Mission {
  idMission?: number;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  volunteerCount: number;
  status: MissionStatus;
  associationMission?: Association;
  missionRoles?: MissionRole[];
  crisisId?: number;
  participations?: Participation[];
  missionLogoPath?: string;
} 
