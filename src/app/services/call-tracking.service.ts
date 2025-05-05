import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface CallRecord {
  id?: number;
  callerId: number;
  receiverId: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  type: 'video' | 'voice';
  status: 'completed' | 'missed' | 'rejected';
}

@Injectable({
  providedIn: 'root'
})
export class CallTrackingService {
  private callStatus = new BehaviorSubject<string>('disconnected');
  private callDuration = new BehaviorSubject<number>(0);
  private callStartTime: number = 0;
  private callTimer: any;

  constructor(private authService: AuthService) {}

  startCall(callRecord: Partial<CallRecord>): Observable<CallRecord> {
    this.callStartTime = Date.now();
    this.callStatus.next('calling');
    this.startCallTimer();
    return new Observable(subscriber => {
      subscriber.next(callRecord as CallRecord);
      subscriber.complete();
    });
  }

  endCall(callId: number, duration: number): Observable<CallRecord> {
    this.callStatus.next('ended');
    if (this.callTimer) {
      clearInterval(this.callTimer);
    }
    return new Observable(subscriber => {
      subscriber.next({
        id: callId,
        duration,
        status: 'completed'
      } as CallRecord);
      subscriber.complete();
    });
  }

  getCallStatus(): Observable<string> {
    return this.callStatus.asObservable();
  }

  getCallDuration(): Observable<number> {
    return this.callDuration.asObservable();
  }

  private startCallTimer(): void {
    this.callTimer = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - this.callStartTime) / 1000);
      this.callDuration.next(elapsedSeconds);
    }, 1000);
  }
} 