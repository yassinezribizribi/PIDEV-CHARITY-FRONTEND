export interface User {
    idUser: number;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    profileImage?: string;
    isBanned?: boolean;
    banreason?: string | null;
    telephone?: string;
    job?: string;
} 