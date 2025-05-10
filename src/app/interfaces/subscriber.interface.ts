export interface Subscriber {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: Date;
  gender: string;
  profilePicture?: string;
} 