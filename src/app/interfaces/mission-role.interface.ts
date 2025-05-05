import { Mission } from './mission.interface';

export interface MissionRole {
  idMissionRole: number;
  missionId: number;
  roleName: string;
  numberNeeded: number;
  numberAccepted: number;
  requiresValidation: boolean;
  participationStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
} 