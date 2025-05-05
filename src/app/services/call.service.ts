import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { SignalingService } from './signaling.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CallService {
  private peerConnection: RTCPeerConnection | null = null;
  private remoteStream = new BehaviorSubject<MediaStream | null>(null);
  private localStream = new BehaviorSubject<MediaStream | null>(null);
  private callStatus = new BehaviorSubject<string>('disconnected');
  private callDuration = new BehaviorSubject<number>(0);
  private targetUserId: string = '';
  private isCaller = false;
  private callTimer: any = null;
  private callStartTime: number = 0;
  private isMuted = false;
  private isCameraOff = false;
  private callType: 'video' | 'voice' = 'video';
  private readonly CALL_TIMEOUT = 30000;
  private callTimeout: any = null;
  private isEndingCall = false;
  private incomingCall = new Subject<{
    offer: RTCSessionDescriptionInit,
    callerId: string,
    callType: 'video' | 'voice'
  }>();
  private currentUserId: number;
  private iceCandidateBuffer: RTCIceCandidateInit[] = [];
  private isNegotiating = false;
  private connectionAttempts = 0;
  private readonly MAX_CONNECTION_ATTEMPTS = 3;
  private localStreamSubject = new BehaviorSubject<MediaStream | null>(null);
  private remoteStreamSubject = new BehaviorSubject<MediaStream | null>(null);
  private callStatusSubject = new BehaviorSubject<string>('disconnected');
  private callDurationSubject = new BehaviorSubject<number>(0);

  constructor(
    private authService: AuthService,
    private signalingService: SignalingService,
    private http: HttpClient
  ) {
    this.currentUserId = this.authService.getUserId()!;
    this.setupSignalingListeners();
  }

  private setupSignalingListeners(): void {
    // Register message handlers
    this.signalingService.registerMessageHandler('offer', (message) => {
      console.log('Received offer:', message);
      this.handleIncomingOffer(message);
    });

    this.signalingService.registerMessageHandler('answer', (message) => {
      console.log('Received answer:', message);
      this.handleAnswer(message);
    });

    this.signalingService.registerMessageHandler('ice-candidate', (message) => {
      console.log('Received ICE candidate:', message);
      this.handleIceCandidate(message);
    });

    this.signalingService.registerMessageHandler('reject', (message) => {
      console.log('Received reject:', message);
      this.handleRejection();
    });

    // Also subscribe to general messages for backward compatibility
    this.signalingService.onMessage().subscribe({
      next: (message) => {
        console.log('Received signaling message:', message);
        
        switch (message.type) {
          case 'offer':
            this.handleIncomingOffer(message);
            break;
          case 'answer':
            this.handleAnswer(message);
            break;
          case 'ice-candidate':
            this.handleIceCandidate(message);
            break;
          case 'reject':
            this.handleRejection();
            break;
        }
      },
      error: (err) => {
        console.error('Signaling error:', err);
        this.endCall();
      }
    });
  }

  private handleIncomingOffer(message: any): void {
    if (this.isInCall()) {
      console.warn('Already in a call, rejecting incoming offer');
      this.signalingService.sendReject(parseInt(message.senderId));
      return;
    }

    this.incomingCall.next({
      offer: message.offer,
      callerId: message.senderId.toString(),
      callType: message.callType || 'video'
    });
    this.callStatus.next('ringing');
    this.targetUserId = message.senderId.toString();
  }

  private handleAnswer(message: any): void {
    if (!this.peerConnection || !message.answer) {
      console.error('No peer connection or answer received');
      return;
    }

    this.peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer))
      .then(() => {
        console.log('Remote description set successfully');
        this.callStatus.next('connected');
        this.callStartTime = Date.now();
        this.startCallTimer();
        this.processBufferedIceCandidates();
      })
      .catch(err => {
        console.error('Error setting remote description:', err);
        this.endCall();
      });
  }

  private handleIceCandidate(message: any): void {
    if (!message.candidate) {
      console.warn('Received empty ICE candidate');
      return;
    }

    console.log('Processing ICE candidate:', message.candidate);
    const candidate = new RTCIceCandidate(message.candidate);
    
    if (this.peerConnection?.remoteDescription) {
      this.peerConnection.addIceCandidate(candidate)
        .then(() => console.log('ICE candidate added successfully'))
        .catch(err => {
          console.error('Error adding ICE candidate:', err);
          // If we're still gathering, buffer the candidate
          if (this.peerConnection?.iceGatheringState === 'gathering') {
            this.iceCandidateBuffer.push(message.candidate);
          }
        });
    } else {
      console.log('Buffering ICE candidate - remote description not set');
      this.iceCandidateBuffer.push(message.candidate);
    }
  }

  private handleRejection(): void {
    console.log('Call was rejected by peer');
    this.callStatus.next('rejected');
    this.endCall();
  }

  private processBufferedIceCandidates(): void {
    console.log('Processing buffered ICE candidates:', this.iceCandidateBuffer.length);
    this.iceCandidateBuffer.forEach(candidate => {
      this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate))
        .then(() => console.log('Buffered ICE candidate added successfully'))
        .catch(err => console.error('Error adding buffered ICE candidate:', err));
    });
    this.iceCandidateBuffer = [];
  }

  private async initializePeerConnection(): Promise<void> {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };

    this.peerConnection = new RTCPeerConnection(config);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.targetUserId) {
        console.log('Sending ICE candidate:', event.candidate);
        this.signalingService.sendIceCandidate(
          parseInt(this.targetUserId),
          event.candidate.toJSON()
        ).catch(err => {
          console.error('Error sending ICE candidate:', err);
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        console.log('Received remote track:', event.track.kind);
        this.remoteStream.next(event.streams[0]);
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log('ICE connection state changed:', state);
      
      switch (state) {
        case 'connected':
          console.log('ICE connection established');
          break;
        case 'disconnected':
          console.warn('ICE connection disconnected');
          this.attemptReconnection();
          break;
        case 'failed':
          console.error('ICE connection failed');
          this.endCall();
          break;
        case 'closed':
          console.log('ICE connection closed');
          break;
      }
    };

    this.peerConnection.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', this.peerConnection?.iceGatheringState);
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'failed') {
        this.attemptReconnection();
      }
    };

    this.peerConnection.ondatachannel = (event) => {
      console.log('Data channel received');
      event.channel.onmessage = (e) => {
        console.log('Data channel message:', e.data);
      };
    };

    // Disable automatic negotiation
    this.peerConnection.onnegotiationneeded = () => {
      // Do nothing - we'll handle negotiation manually
    };
  }

  private async addMediaTracks(stream: MediaStream): Promise<void> {
    if (!this.peerConnection) return;

    // Remove existing tracks first
    this.peerConnection.getSenders().forEach(sender => {
      this.peerConnection?.removeTrack(sender);
    });

    // Add tracks in a consistent order: audio first, then video
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];

    if (audioTrack) {
      console.log('Adding audio track');
      this.peerConnection.addTrack(audioTrack, stream);
    }

    if (videoTrack && this.callType === 'video') {
      console.log('Adding video track');
      this.peerConnection.addTrack(videoTrack, stream);
    }
  }

  private async attemptReconnection(): Promise<void> {
    if (this.connectionAttempts >= this.MAX_CONNECTION_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      this.endCall();
      return;
    }

    this.connectionAttempts++;
    console.log(`Attempting to reconnect (${this.connectionAttempts}/${this.MAX_CONNECTION_ATTEMPTS})...`);

    // Wait for ICE gathering to complete
    if (this.peerConnection?.iceGatheringState === 'gathering') {
      setTimeout(() => this.attemptReconnection(), 1000);
      return;
    }

    // Create and send a new offer
    if (this.isCaller && this.peerConnection) {
      try {
        const offer = await this.peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: this.callType === 'video'
        });
        await this.peerConnection.setLocalDescription(offer);
        
        if (this.targetUserId) {
          await this.signalingService.sendOffer(
            parseInt(this.targetUserId),
            offer,
            this.callType
          );
        }
      } catch (err) {
        console.error('Reconnection error:', err);
        this.endCall();
      }
    }
  }

  async startCall(targetUserId: string, callType: 'video' | 'voice' = 'video'): Promise<void> {
    try {
      if (this.isInCall()) {
        throw new Error('Already in a call');
      }

      // Ensure signaling connection is established
      await this.signalingService.connect(this.currentUserId);

      this.targetUserId = targetUserId;
      this.callStatus.next('ringing');
      this.isCaller = true;
      this.callType = callType;
      this.iceCandidateBuffer = [];
      this.connectionAttempts = 0;

      await this.initializePeerConnection();
      if (!this.peerConnection) {
        throw new Error('Failed to initialize peer connection');
      }

      // Set constraints based on call type
      const constraints = {
        audio: true,
        video: callType === 'video'
      };
      
      console.log('Getting media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream.next(stream);

      // Add tracks in a consistent order
      await this.addMediaTracks(stream);

      // Create and send offer
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video'
      });
      await this.peerConnection.setLocalDescription(offer);
      await this.signalingService.sendOffer(parseInt(targetUserId), offer, callType);

      this.callTimeout = setTimeout(() => {
        if (this.callStatus.value === 'ringing') {
          console.log('Call timed out - no answer received');
          this.endCall();
        }
      }, this.CALL_TIMEOUT);

    } catch (error) {
      console.error('Start call error:', error);
      this.endCall();
      throw error;
    }
  }

  async answerCall(offer: RTCSessionDescriptionInit, callerId: string, callType: 'video' | 'voice' = 'video'): Promise<void> {
    try {
      if (this.isInCall()) {
        throw new Error('Already in a call');
      }

      // Ensure signaling connection is established
      await this.signalingService.connect(this.currentUserId);

      this.callStatus.next('connecting');
      this.isCaller = false;
      this.callType = callType;
      this.targetUserId = callerId;
      this.iceCandidateBuffer = [];

      await this.initializePeerConnection();
      if (!this.peerConnection) {
        throw new Error('Failed to initialize peer connection');
      }

      const constraints = {
        audio: true,
        video: callType === 'video'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream.next(stream);

      // Add tracks in a consistent order
      await this.addMediaTracks(stream);

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video'
      });
      await this.peerConnection.setLocalDescription(answer);
      
      if (this.callTimeout) {
        clearTimeout(this.callTimeout);
      }

      await this.signalingService.sendAnswer(parseInt(callerId), answer);
      this.callStartTime = Date.now();
      this.startCallTimer();

    } catch (error) {
      console.error('Answer call error:', error);
      this.endCall();
      throw error;
    }
  }

  rejectCall(): void {
    if (this.targetUserId) {
      this.signalingService.sendReject(parseInt(this.targetUserId));
    }
    this.endCall();
  }

  private startCallTimer(): void {
    if (this.callTimer) {
      clearInterval(this.callTimer);
    }
    
    this.callTimer = setInterval(() => {
      const duration = Math.floor((Date.now() - this.callStartTime) / 1000);
      this.callDuration.next(duration);
    }, 1000);
  }

  endCall(): void {
    if (this.isEndingCall) return;
    this.isEndingCall = true;

    // Clear timeouts and intervals
    if (this.callTimeout) clearTimeout(this.callTimeout);
    if (this.callTimer) clearInterval(this.callTimer);

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop local media tracks
    const stream = this.localStream.value;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      this.localStream.next(null);
    }

    // Reset state
    this.callStatus.next('ended');
    this.remoteStream.next(null);
    this.targetUserId = '';
    this.isCaller = false;
    this.isEndingCall = false;
    this.iceCandidateBuffer = [];
    this.isNegotiating = false;

    // Unregister message handlers
    this.signalingService.unregisterMessageHandler('offer');
    this.signalingService.unregisterMessageHandler('answer');
    this.signalingService.unregisterMessageHandler('ice-candidate');
    this.signalingService.unregisterMessageHandler('reject');
  }

  isInCall(): boolean {
    return this.callStatus.value === 'connected' || 
           this.callStatus.value === 'ringing' ||
           this.callStatus.value === 'connecting';
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    const stream = this.localStream.value;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    }
  }

  toggleCamera(): void {
    this.isCameraOff = !this.isCameraOff;
    const stream = this.localStream.value;
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !this.isCameraOff;
      });
    }
  }

  // Public getters
  public getRemoteStream(): Observable<MediaStream | null> {
    return this.remoteStream.asObservable();
  }

  public getLocalStream(): Observable<MediaStream | null> {
    return this.localStream.asObservable();
  }

  public getCallStatus(): Observable<string> {
    return this.callStatus.asObservable();
  }

  public getCallDuration(): Observable<number> {
    return this.callDuration.asObservable();
  }

  public getPeerConnection(): RTCPeerConnection | null {
    return this.peerConnection;
  }

  public getCurrentCallType(): 'video' | 'voice' {
    return this.callType;
  }

  public setLocalStream(stream: MediaStream): void {
    this.localStreamSubject.next(stream);
  }

  public getLocalStreamSubject(): Observable<MediaStream | null> {
    return this.localStreamSubject.asObservable();
  }
}