import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError, forkJoin, of, switchMap } from 'rxjs';
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
  participantId: number;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  isOnline: boolean;
  messages?: Message[];
  participant2Id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private apiUrl = 'http://localhost:8089/api/conversations';
  private userApiUrl = 'http://localhost:8089/api/auth/user';

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

  private getUserDetails(userId: number): Observable<any> {
    return this.http.get<any>(`${this.userApiUrl}/${userId}`, { headers: this.getHeaders() });
  }

  private cleanConversationData(data: any): Observable<Conversation> {
    const currentUserId = this.authService.getUserId();
    if (!currentUserId) {
      return throwError(() => new Error('User not authenticated'));
    }
    
    console.log('Cleaning conversation data:', { data, currentUserId });
    
    // Determine the other participant's ID
    const otherParticipantId = data.participant1Id === currentUserId ? data.participant2Id : data.participant1Id;
    console.log('Other participant ID:', otherParticipantId);
    
    return this.getUserDetails(otherParticipantId).pipe(
      map(userDetails => {
        console.log('User details for other participant:', userDetails);
        const conversation: Conversation = {
          id: data.id,
          participantId: otherParticipantId,
          participant2Id: currentUserId,
          participantName: userDetails.firstName && userDetails.lastName 
            ? `${userDetails.firstName} ${userDetails.lastName}`
            : userDetails.email?.split('@')[0] || 'Unknown User',
          participantAvatar: userDetails.profileImage || 'assets/images/default-logo.jpg',
          lastMessage: data.lastMessage?.content || '',
          lastMessageTime: data.lastMessage?.timestamp ? new Date(data.lastMessage.timestamp) : new Date(),
          isOnline: data.isOnline || false,
          messages: (data.messages || []).map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            timestamp: new Date(msg.timestamp),
            read: msg.read,
            location: msg.location
          }))
        };
        console.log('Cleaned conversation:', conversation);
        return conversation;
      })
    );
  }

  getOrCreateConversation(participant2Id: number): Observable<Conversation> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.http.post<any>(`${this.apiUrl}/start`, { participant2Id }, { headers: this.getHeaders() })
      .pipe(
        switchMap(response => this.cleanConversationData(response)),
        catchError(error => {
          console.error('Error creating conversation:', error);
          return throwError(() => new Error('Failed to create conversation'));
        })
      );
  }
  
  getConversations(): Observable<Conversation[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(conversations => conversations.filter(conv => 
        conv.messages && conv.messages.length > 0
      )),
      switchMap(conversations => {
        if (conversations.length === 0) {
          return of([]);
        }
        const conversationObservables = conversations.map(conv => this.cleanConversationData(conv));
        return forkJoin(conversationObservables);
      }),
      catchError(error => {
        console.error('Error getting conversations:', error);
        return throwError(() => new Error('Failed to load conversations. Please try again later.'));
      })
    );
  }

  getMessages(conversationId: number, beforeId?: number): Observable<Message[]> {
    let url = `${this.apiUrl}/${conversationId}/messages`;
    if (beforeId) {
      url += `?beforeId=${beforeId}`;
    }
    return this.http.get<Message[]>(url, { headers: this.getHeaders() });
  }

sendMessage(conversationId: number, message: Partial<Message>): Observable<Message> {
  return this.http.post<Message>(
    `${this.apiUrl}/${conversationId}/messages`,
    message,
    { headers: this.authService.getAuthHeaders() }
  );
}

  uploadAttachment(formData: FormData): Observable<Attachment> {
    // Get the auth headers but don't set Content-Type
    const authHeaders = this.getHeaders();
    const headers = new HttpHeaders({
      'Authorization': authHeaders['Authorization']
    });
    
    return this.http.post<any>(`${this.apiUrl}/upload`, formData, { 
      headers: headers // Only include Authorization header
    }).pipe(
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