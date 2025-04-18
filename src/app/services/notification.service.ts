import { Injectable } from '@angular/core';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private stompClient: any;
  private notificationsSubject = new Subject<string>();
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() { }

  connect(): void {
    const socket = new SockJS('http://localhost:8089/ws'); // Assurez-vous que l'URL est correcte pour votre backend
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, (frame: any) => {
      console.log('Connected to WebSocket');
      
      // S'abonner aux sujets pour recevoir les notifications
      this.stompClient.subscribe('/topic/new-crisis', (message: any) => {
        this.notificationsSubject.next(message.body);
      });

      this.stompClient.subscribe('/topic/crisis-status', (message: any) => {
        this.notificationsSubject.next(message.body);
      });

      this.stompClient.subscribe('/topic/response', (message: any) => {
        this.notificationsSubject.next(message.body);
      });
    });
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
      console.log('Disconnected from WebSocket');
    }
  }
}
