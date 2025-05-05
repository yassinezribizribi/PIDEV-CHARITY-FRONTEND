import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Attachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
  senderId: number;
  loaded?: boolean;
}

export interface Message {
  id?: number;
  content: string;
  senderId: number;
  receiverId?: number;
  timestamp: Date;
  read?: boolean;
  location?: Location;
  attachment?: Attachment;
}

export interface Conversation {
  id: number;
  participant1Id: number;
  participant2Id: number;
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private apiUrl = 'http://localhost:8089/api/conversations';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): { [header: string]: string } {
    const headers = this.authService.getAuthHeaders();
    const headersObj: { [header: string]: string } = {};
    headers.keys().forEach(key => {
      const value = headers.get(key);
      if (value) {
        headersObj[key] = value;
      }
    });
    return headersObj;
  }

  private cleanConversationData(data: any): Conversation {
    return {
      id: data.id,
      participant1Id: data.participant1Id,
      participant2Id: data.participant2Id,
      messages: (data.messages || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        timestamp: new Date(msg.timestamp),
        read: msg.read,
        location: msg.location
      })),
      lastMessage: data.lastMessage ? {
        id: data.lastMessage.id,
        content: data.lastMessage.content,
        senderId: data.lastMessage.senderId,
        receiverId: data.lastMessage.receiverId,
        timestamp: new Date(data.lastMessage.timestamp),
        read: data.lastMessage.read,
        location: data.lastMessage.location
      } : undefined,
      unreadCount: data.unreadCount
    };
  }

  getOrCreateConversation(participant2Id: number): Observable<Conversation> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.http.post<Conversation>(
      `${this.apiUrl}/start`,
      { participant2Id },
      { headers: this.getHeaders() }
    );
  }
  
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Error getting conversations:', error);
        return throwError(() => new Error('Failed to load conversations. Please try again later.'));
      })
    );
  }

  getMessages(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.apiUrl}/${conversationId}/messages`,
      { headers: this.getHeaders() }
    );
  }

sendMessage(conversationId: number, message: Partial<Message>): Observable<Message> {
  return this.http.post<Message>(
    `${this.apiUrl}/${conversationId}/messages`,
    message,
    { headers: this.authService.getAuthHeaders() }
  );
}

  uploadAttachment(formData: FormData): Observable<Attachment> {
    return this.http.post<any>(`${this.apiUrl}/upload`, formData, { headers: this.getHeaders() }).pipe(
      map(response => {
        // Create a proper URL for the file
        const fileUrl = `http://localhost:8089/api/conversations/files/${response.filename}`;
        
        return {
          id: 0,
          fileName: response.filename,
          fileType: formData.get('file') instanceof File ? (formData.get('file') as File).type : 'application/octet-stream',
          fileSize: formData.get('file') instanceof File ? (formData.get('file') as File).size : 0,
          url: fileUrl,
          uploadedAt: new Date(),
          senderId: this.authService.getUserId()!
        };
      }),
      catchError(error => {
        console.error('Error uploading attachment:', error);
        return throwError(() => new Error('Failed to upload attachment'));
      })
    );
  }

  shareLocation(conversationId: number, location: Location): Observable<Message> {
    const message: Partial<Message> = {
      content: 'Location shared',
      senderId: this.authService.getUserId()!,
      timestamp: new Date(),
      location: location
    };
    return this.sendMessage(conversationId, message);
  }

  markAsRead(conversationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${conversationId}/read`, {});
  }

  getUnreadCount(): Observable<number> {
    const userId = this.authService.getUserId();
    return this.http.get<number>(`${this.apiUrl}/unread-count/${userId}`);
  }

  downloadAttachment(fileName: string): Observable<Blob> {
    return this.http.get(`http://localhost:8089/api/conversations/files/${fileName}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    }).pipe(
      catchError(error => {
        console.error('Error downloading attachment:', error);
        return throwError(() => new Error('Failed to download attachment'));
      })
    );
  }
}
