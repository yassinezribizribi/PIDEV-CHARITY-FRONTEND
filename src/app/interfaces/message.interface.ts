export interface Message {
    content: string;
    senderId: number;
    receiverId: number;
    timestamp: Date;
    read: boolean;
    location?: {
      latitude: number;
      longitude: number;
      address: string;
    };
  }
  
  export interface Conversation {
    id: number;
    participant1Id: number;
    participant2Id: number;
    messages: Message[];
  }