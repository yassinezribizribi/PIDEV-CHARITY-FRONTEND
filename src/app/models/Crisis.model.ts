export interface Crisis {
  id?: number;
  name: string;
  description: string;
  location: string;
  date: string;
  idUser?: number;  
  category: string;
  updates: string;


}


export interface Subscriber {
  idUser: number;
  firstName: string;
  lastName: string;
  email: string;
  telephone?: string; 
}