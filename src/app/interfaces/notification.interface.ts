export interface User {
  idUser: number;
  username: string;
  firstName?: string;
  lastName?: string;
}

export enum NotificationType {
  HEALTHCARE_UPDATE = 'HEALTHCARE_UPDATE',
  VIDEO_CALL = 'VIDEO_CALL',
  MESSAGE = 'MESSAGE',
  PARTNERSHIP_REQUEST = 'PARTNERSHIP_REQUEST',
  PARTNERSHIP_REMOVED = 'PARTNERSHIP_REMOVED',
  SYSTEM = 'SYSTEM',
  TIER_CHANGE = 'TIER_CHANGE'
}

export interface Notification {
  idNotification: number;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  sender?: User;
} 