export interface CrisisResponse {
    id: string;
    crisisId: string;
    content: string;
    author: {
      id: string;
      name: string;
      role: 'volunteer' | 'ngo' | 'admin';
    };}