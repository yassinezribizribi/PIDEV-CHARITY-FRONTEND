import { Mission } from './mission.interface';
import { Subscriber } from './subscriber.interface';
import { MissionRole } from './mission-role.interface';


export enum ParticipationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface Participation {
  idParticipation?: number;
  subscriber?: Subscriber;
  mission?: Mission;
  missionRole?: MissionRole;
  participationDate: Date;
  confirmed?: boolean;
  rejectionReason?: string;
  attended?: boolean;
  confirmationDate?: Date;
  feedback?: string;
  participationStatus: ParticipationStatus;
} 