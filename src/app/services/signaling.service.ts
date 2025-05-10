import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SignalingService {
  private baseUrl = 'http://localhost:8089/api/signaling';
  private ws: WebSocket | null = null;
  private messageSubject = new Subject<any>();
  private currentUserId: number | null = null;
  private incomingCallSubject = new Subject<any>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 5000;
  private connectionTimeout: any;
  private pingInterval: any;
  private messageQueue: any[] = [];
  private isConnected = false;
  private messageHandlers = new Map<string, (message: any) => void>();
  private connectionPromise: Promise<void> | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  connect(userId: number): Promise<void> {
    // If already connecting, return the existing promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.disconnect();

      this.currentUserId = userId;
      const token = this.authService.getToken();
      
      if (!token) {
        const error = 'Missing authentication token';
        console.error(error);
        reject(error);
        return;
      }

      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        this.isConnected = true;
        this.processMessageQueue();
        resolve();
        return;
      }

      const wsUrl = `ws://localhost:8089/ws/signaling?token=${token}&userId=${userId}`;
      console.log('Connecting to WebSocket:', wsUrl);

      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          const error = 'WebSocket connection timeout';
          console.error(error);
          this.attemptReconnect();
          reject(error);
        }
      }, 5000);

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          clearTimeout(this.connectionTimeout);
          console.log('WebSocket connection established for user:', userId);
          this.reconnectAttempts = 0;
          this.isConnected = true;
          
          // Send initial connection message
          this.sendSignal({
            type: 'connection',
            targetUserId: userId,
            status: 'connected'
          });
          
          // Process any queued messages
          this.processMessageQueue();
          
          // Start ping/pong
          this.startPingInterval();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('Received WebSocket message:', message);
            
            // Handle ping/pong
            if (message.type === 'ping') {
              this.sendSignal({ type: 'pong' });
              return;
            }
            
            // Validate and convert IDs
            const targetUserId = Number(message.targetUserId);
            const senderId = Number(message.senderId);
            
            // Route message to appropriate handler
            const handler = this.messageHandlers.get(message.type);
            if (handler) {
              handler({ ...message, targetUserId, senderId });
            }
            
            // Also emit to general message subject
            if (targetUserId === this.currentUserId) {
              this.messageSubject.next({ 
                ...message, 
                targetUserId, 
                senderId 
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(this.connectionTimeout);
          console.error('WebSocket error:', error);
          this.isConnected = false;
          this.attemptReconnect();
          reject(error);
        };

        this.ws.onclose = (event) => {
          clearTimeout(this.connectionTimeout);
          this.stopPingInterval();
          this.isConnected = false;
          console.log('WebSocket connection closed:', event.code, event.reason);
          
          // Only attempt reconnect if not cleanly closed
          if (event.code !== 1000) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        clearTimeout(this.connectionTimeout);
        console.error('Error creating WebSocket connection:', error);
        this.isConnected = false;
        this.attemptReconnect();
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Every 30 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentUserId) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(this.currentUserId!), this.reconnectTimeout);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  onMessage(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  private processMessageQueue(): void {
    if (!this.isConnected) return;
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendSignal(message);
    }
  }

  sendSignal(signal: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        console.log('WebSocket not connected, queueing message');
        this.messageQueue.push(signal);
        resolve();
        return;
      }

      if (this.ws?.readyState === WebSocket.OPEN) {
        const signalWithSender = {
          ...signal,
          senderId: this.currentUserId,
          timestamp: new Date().toISOString()
        };
        console.log('Sending WebSocket signal:', signalWithSender);
        this.ws.send(JSON.stringify(signalWithSender));
        resolve();
      } else {
        const error = 'WebSocket is not connected';
        console.error(error);
        this.messageQueue.push(signal);
        reject(error);
      }
    });
  }

  sendOffer(targetUserId: number, offer: RTCSessionDescriptionInit, callType: 'video' | 'voice' = 'video'): Promise<void> {
    return this.sendSignal({
      type: 'offer',
      targetUserId,
      offer,
      callType
    });
  }

  sendAnswer(targetUserId: number, answer: RTCSessionDescriptionInit): Promise<void> {
    return this.sendSignal({
      type: 'answer',
      targetUserId,
      answer
    });
  }

  sendIceCandidate(targetUserId: number, candidate: RTCIceCandidateInit): Promise<void> {
    return this.sendSignal({
      type: 'ice-candidate',
      targetUserId,
      candidate
    });
  }

  disconnect(): void {
    this.isConnected = false;
    this.connectionPromise = null;
    if (this.ws) {
      this.stopPingInterval();
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
      }
      this.ws.close();
      this.ws = null;
    }
    this.messageQueue = [];
    this.messageHandlers.clear();
  }

  sendReject(targetUserId: number): void {
    this.sendSignal({
      type: 'reject',
      targetUserId
    });
  }

  registerMessageHandler(type: string, handler: (message: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  unregisterMessageHandler(type: string): void {
    this.messageHandlers.delete(type);
  }
}