import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConversationService, Conversation, Message, Location, Attachment } from '../services/conversation.service';
import { AuthService } from '../services/auth.service';
import { CallService } from '../services/call.service';
import { SignalingService } from '../services/signaling.service';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { Modal } from 'bootstrap';
import { Subscription, interval } from 'rxjs';
import { CallTrackingService, CallRecord } from '../services/call-tracking.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, RouterLink],
})
export class ConversationComponent implements OnInit, OnDestroy, AfterViewChecked {
  private readonly API_URL = environment.apiUrl;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('localVideo') private localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') private remoteVideo!: ElementRef<HTMLVideoElement>;

  conversation: Conversation | null = null;
  messages: Message[] = [];
  newMessage = '';
  loading = true;
  error: string | null = null;
  currentUserId!: number;
  participant2Id: number = 0;
  participant2Name = 'Participant';
  participant2Avatar = 'assets/images/default-logo.jpg';
  participantNames = new Map<number, string>();
  isParticipantOnline = false;
  lastSeenTime = '2 hours ago';
  showCallOptions = false;
  callType: 'video' | 'voice' = 'voice';
  showAttachments = false;
  private shouldScrollToBottom = true;

  callStatus = 'Connecting...';
  callDuration = '00:00';
  isInCall = false;
  isCaller = false;
  isMuted = false;
  remoteStream: MediaStream | null = null;
  isCameraOff = false;
  callModal: Modal | null = null;
  private callStartTime: Date | null = null;
  private callInterval: any;

  locationLoading = false;
  locationError: string | null = null;
  currentLocation: Location | null = null;
  locationModal: Modal | null = null;

  currentCallRecord: CallRecord | null = null;
  attachments: any[] = [];
  selectedFile: File | null = null;
  uploadProgress = 0;

  private subscriptions: Subscription[] = [];
  private incomingCallSub?: Subscription;

  private currentUser: { id: number } | null = null;
  public showCallModal = false;
  private pendingOffer: { offer: RTCSessionDescriptionInit, senderId: number, callType: 'video' | 'voice' } | null = null;
  private isEndingCall = false;
  private ringtone: HTMLAudioElement | null = null;
  private isRinging = false;

  // Add missing properties for conversations list
  conversations: Conversation[] = [];
  currentConversationId: number | null = null;
  searchQuery: string = '';

  // Add these properties after the existing properties
  userSearchQuery: string = '';
  filteredUsers: any[] = [];
  loadingUsers: boolean = false;
  newConversationModal: Modal | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private conversationService: ConversationService,
    private authService: AuthService,
    private callService: CallService,
    private signalingService: SignalingService,
    private callTrackingService: CallTrackingService,
    private toastr: ToastrService
  ) {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    
    const decodedToken = this.authService.decodeToken(token);
    if (decodedToken) {
      this.currentUser = { id: decodedToken.userId };
    }

    this.ringtone = new Audio('assets/sounds/ringtone.mp3');
    this.ringtone.loop = true;

    // Initialize current user ID in constructor
    const userInfo = this.authService.getUserInfo();
    if (!userInfo || !userInfo.idUser) {
      console.error('No user info available in constructor');
      this.error = 'User not authenticated';
      return;
    }
    this.currentUserId = userInfo.idUser;
    console.log('Current user ID initialized in constructor:', this.currentUserId);
  }

  ngOnInit(): void {
    if (!this.currentUserId) {
      console.error('Current user ID not set');
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    console.log('Component initialized with current user ID:', this.currentUserId);

    // Load conversations list
    this.loadConversationsList();

    // Subscribe to query parameters
    this.route.queryParams.subscribe(params => {
      const participantId = params['participantId'];
      
      // Only try to load a specific conversation if participantId is provided
      if (participantId && !isNaN(+participantId)) {
        this.participant2Id = +participantId;
        console.log('Loading conversation between users:', {
          currentUserId: this.currentUserId,
          participant2Id: this.participant2Id
        });

        this.loadConversation(this.participant2Id);
        this.setupSignalingService();
        this.loadParticipantDetails();
        this.initializeCallModal();
        this.subscribeToStreams();
      } else {
        // If no participantId, just show the conversation list
        this.loading = false;
      }
    });
  }

  ngAfterViewChecked() {
    // Only scroll if we have messages and should scroll
    if (this.messages.length > 0 && this.shouldScrollToBottom) {
      this.scrollToBottom('auto');
    }
  }
  
  onScroll(): void {
    const element = this.messagesContainer.nativeElement;
    const atTop = element.scrollTop === 0;
    const atBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 50;
    
    if (atTop && !this.loading) {
      // Load more messages when scrolling to the top
      this.loadMoreMessages();
    }
    
    this.shouldScrollToBottom = atBottom;
  }
  ngAfterViewInit() {
    const callModalElement = document.getElementById('callModal');
    if (callModalElement) {
      this.callModal = new Modal(callModalElement);
    }
  }
  ngOnDestroy(): void {
    if (this.incomingCallSub) {
      this.incomingCallSub.unsubscribe();
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    
    if (this.isInCall) {
      this.callService.endCall();
    }
    
    if (this.callInterval) {
      clearInterval(this.callInterval);
    }
    
    this.signalingService.disconnect();
    
    this.isInCall = false;
    this.callStatus = 'disconnected';
    this.callDuration = '00:00';
  }

  private setupSignalingService(): void {
    if (!this.currentUser) {
      console.error('No current user available');
      return;
    }

    console.log('Setting up signaling service for user:', this.currentUser.id);
    this.signalingService.connect(this.currentUser.id).catch(error => {
      console.error('Failed to connect to signaling service:', error);
      this.toastr.error('Failed to establish call connection. Please try again.');
    });

    this.incomingCallSub = this.signalingService.onMessage().subscribe({
      next: (message: any) => {
        console.log('Received signaling message:', message);
        
        switch (message.type) {
          case 'offer':
            console.log('Received call offer from user:', message.senderId);
            this.handleIncomingCall(message);
            break;
          case 'answer':
            console.log('Received call answer from user:', message.senderId);
            this.handleCallAnswer(message);
            break;
          case 'ice-candidate':
            console.log('Received ICE candidate from user:', message.senderId);
            this.handleIceCandidate(message);
            break;
          case 'reject':
            console.log('Call was rejected by user:', message.senderId);
            this.handleCallRejection();
            break;
          case 'connection':
            console.log('Received connection message from user:', message.senderId);
            break;
          default:
            console.log('Unknown message type:', message.type);
        }
      },
      error: (error: Error) => {
        console.error('Error in signaling service:', error);
        this.toastr.error('Connection error. Please try again.');
      }
    });
    
    // Add to subscriptions array for cleanup
    if (this.incomingCallSub) {
      this.subscriptions.push(this.incomingCallSub);
    }
  }

  private handleIncomingCall(message: any): void {
    console.log('Handling incoming call from user:', message.senderId);
    
    if (this.isInCall) {
      console.log('Already in a call, rejecting incoming call');
      this.rejectCall();
      return;
    }

    this.pendingOffer = {
      offer: message.offer,
      senderId: message.senderId,
      callType: message.callType || 'video'
    };
    
    this.callStatus = 'Incoming call...';
    this.showCallModal = true;
    this.isCaller = false;
    this.isInCall = false;
    
    this.playRingtone();
    
    // Set a timeout to auto-reject if not answered
    setTimeout(() => {
      if (this.pendingOffer && !this.isInCall) {
        console.log('Call timed out - no answer received');
        this.rejectCall();
      }
    }, 30000); // 30 seconds timeout
  }

  private handleCallAnswer(message: any): void {
    console.log('Handling call answer from user:', message.senderId);
    if (this.callService.getPeerConnection()) {
      this.callService.getPeerConnection()?.setRemoteDescription(new RTCSessionDescription(message.answer))
        .then(() => {
          console.log('Remote description set successfully');
          this.callStatus = 'connected';
          this.isInCall = true;
          this.startCallTimer();
        })
        .catch(err => {
          console.error('Error setting remote description:', err);
          this.endCall();
        });
    }
  }

  private handleCallRejection(): void {
    console.log('Call was rejected');
    this.stopRingtone();
    this.showCallModal = false;
    this.callStatus = 'Call rejected';
    this.toastr.info('Call was rejected');
    
    if (this.callModal) {
      this.callModal.hide();
    }
  }

  private handleIceCandidate(message: any): void {
    console.log('Handling ICE candidate from user:', message.senderId);
    if (this.callService.getPeerConnection()) {
      this.callService.getPeerConnection()?.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
  }

  private initializeCallModal(): void {
    const modalElement = document.getElementById('callModal');
    if (modalElement) {
      this.callModal = new Modal(modalElement);
      modalElement.addEventListener('show.bs.modal', () => {
        this.showCallModal = true;
      });
      modalElement.addEventListener('hide.bs.modal', () => {
        this.showCallModal = false;
      });
    }
  }

  async startCall(callType: 'video' | 'voice' = 'video'): Promise<void> {
    try {
      console.log('Starting call with user:', this.participant2Id, 'Type:', callType);
      this.callType = callType;
      this.showCallModal = true;
      this.isCaller = true;
      this.isInCall = false;
      
      // Get media stream based on call type
      try {
        const constraints = callType === 'video' 
          ? { video: true, audio: true }
          : { video: false, audio: true };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Successfully got media stream');
        
        // Store the stream for later use
        this.callService.setLocalStream(stream);
        
        // Show/hide video elements based on call type
        if (this.localVideo?.nativeElement) {
          this.localVideo.nativeElement.srcObject = stream;
          this.localVideo.nativeElement.style.display = callType === 'video' ? 'block' : 'none';
        }
        
        if (this.remoteVideo?.nativeElement) {
          this.remoteVideo.nativeElement.style.display = callType === 'video' ? 'block' : 'none';
        }

        // Hide video container for voice calls
        const videoContainer = document.querySelector('.video-container');
        if (videoContainer) {
          (videoContainer as HTMLElement).style.display = callType === 'video' ? 'block' : 'none';
        }
      } catch (error) {
        console.error('Failed to access media devices:', error);
        this.toastr.error('Could not access camera/microphone. Please check your permissions.');
        return;
      }
      
      // Show call modal
      const modalElement = document.getElementById('callModal');
      if (modalElement) {
        const modal = new Modal(modalElement);
        modal.show();
      }
      
      // Start the call
      await this.callService.startCall(this.participant2Id.toString(), this.callType);
      
      // Subscribe to call status updates
      this.callService.getCallStatus().subscribe(status => {
        console.log('Call status changed:', status);
        this.callStatus = status;
        
        switch (status) {
          case 'ringing':
            this.playRingtone();
            break;
          case 'connected':
            this.stopRingtone();
            this.isInCall = true;
            this.startCallTimer();
            break;
          case 'ended':
            this.stopRingtone();
            if (!this.isEndingCall) {
              this.isEndingCall = true;
              this.endCall();
            }
            break;
          case 'failed':
            this.stopRingtone();
            this.toastr.error('Call failed. Please try again.');
            this.endCall();
            break;
        }
      });
      
      // Subscribe to call duration updates
      this.callService.getCallDuration().subscribe(duration => {
        this.callDuration = this.formatDuration(duration);
      });
      
    } catch (error) {
      console.error('Error starting call:', error);
      this.toastr.error('Failed to start call. Please try again.');
      this.endCall();
    }
  }

  async acceptCall(): Promise<void> {
    try {
      console.log('Accepting call from user:', this.pendingOffer?.senderId);
      if (!this.pendingOffer) {
        console.error('No pending offer to accept');
        return;
      }

      if (this.pendingOffer.callType === 'video') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          console.log('Successfully got video stream');
          stream.getTracks().forEach(track => track.stop());
        } catch (error) {
          console.warn('Failed to access camera, falling back to voice call:', error);
          this.pendingOffer.callType = 'voice';
          this.callType = 'voice';
          this.toastr.warning('Could not access camera, switching to voice call');
        }
      }

      this.stopRingtone();
      this.callStatus = 'Connecting...';
      this.isInCall = true;
      this.isCaller = false;
      
      await this.callService.answerCall(
        this.pendingOffer.offer,
        this.pendingOffer.senderId.toString(),
        this.pendingOffer.callType
      );
      
      this.callService.getCallStatus().subscribe(status => {
        console.log('Call status changed:', status);
        this.callStatus = status;
        
        switch (status) {
          case 'connected':
            this.isInCall = true;
            this.startCallTimer();
            break;
          case 'ended':
            if (!this.isEndingCall) {
              this.isEndingCall = true;
              this.endCall();
            }
            break;
          case 'failed':
            this.toastr.error('Call failed. Please try again.');
            this.endCall();
            break;
        }
      });
      
      this.pendingOffer = null;
    } catch (error) {
      console.error('Error accepting call:', error);
      this.callStatus = 'Call failed';
      this.endCall();
      this.toastr.error('Failed to accept call. Please try again.');
    }
  }

  async rejectCall(): Promise<void> {
    console.log('Rejecting call from user:', this.pendingOffer?.senderId);
    this.stopRingtone();
    
    if (this.pendingOffer) {
      this.signalingService.sendReject(this.pendingOffer.senderId);
    }
    
    this.pendingOffer = null;
    this.callStatus = 'Call ended';
    this.showCallModal = false;
    
    const modalElement = document.getElementById('callModal');
    if (modalElement) {
      const modal = Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  async endCall(): Promise<void> {
    try {
      if (this.isEndingCall) {
        return;
      }
      
      this.isEndingCall = true;
      this.stopRingtone();
      
      // Stop all media tracks
      if (this.localVideo?.nativeElement?.srcObject) {
        const stream = this.localVideo.nativeElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (this.remoteVideo?.nativeElement?.srcObject) {
        const stream = this.remoteVideo.nativeElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      // End the call
      await this.callService.endCall();
      
      // Reset call state
      this.showCallModal = false;
      this.isInCall = false;
      this.callStatus = 'disconnected';
      this.callDuration = '00:00';
      this.isMuted = false;
      this.isCameraOff = false;
      
      // Hide the modal
      if (this.callModal) {
        this.callModal.hide();
      }
      
      this.isEndingCall = false;
    } catch (error) {
      console.error('Error ending call:', error);
      this.isEndingCall = false;
    }
  }

  toggleCallOptions(): void {
    this.showCallOptions = !this.showCallOptions;
  }

  startVideoCall(): void {
    this.callType = 'video';
    this.startCall();
  }

  startVoiceCall(): void {
    this.callType = 'voice';
    this.startCall();
  }
  private loadParticipantDetails(): void {
    // Load current user's name
    const currentUser = this.authService.getUserInfo();
    if (currentUser) {
      this.participantNames.set(currentUser.idUser || 0, 'You');
    }

    // Load participant2's name
    this.authService.getUserById(this.participant2Id).subscribe({
      next: (user) => {
        this.participant2Name = `${user.firstName} ${user.lastName}`.trim() || 'Participant';
        this.participant2Avatar = 'assets/images/default-logo.jpg';
        this.participantNames.set(this.participant2Id, this.participant2Name);
      },
      error: (err) => {
        console.error('Error loading participant details:', err);
        this.participant2Name = 'Participant';
        this.participantNames.set(this.participant2Id, this.participant2Name);
      }
    });
  }

  private loadConversation(participant2Id: number): void {
    console.log('Loading conversation with participant:', participant2Id);
    this.loading = true;
    this.error = null;

    if (!this.currentUserId) {
      console.error('Cannot load conversation: Current user ID not set');
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    // First, try to get existing conversations
    this.conversationService.getConversations().subscribe({
      next: (conversations) => {
        console.log('All conversations:', conversations);
        
        // Find if a conversation already exists with this participant
        const existingConversation = conversations.find(conv => {
          // Check both possible combinations of participant IDs
          const matches = (conv.participantId === participant2Id && conv.participant2Id === this.currentUserId) ||
                         (conv.participantId === this.currentUserId && conv.participant2Id === participant2Id);
          console.log('Checking conversation:', {
            conv,
            participant2Id,
            currentUserId: this.currentUserId,
            matches
          });
          return matches;
        });

        if (existingConversation) {
          console.log('Found existing conversation:', existingConversation);
          this.conversation = existingConversation;
          this.currentConversationId = existingConversation.id;
          this.participant2Id = participant2Id; // Ensure participant2Id is set correctly
          
          if (existingConversation.messages && existingConversation.messages.length > 0) {
            console.log('Using messages from existing conversation:', existingConversation.messages.length);
            this.messages = this.sortMessages(existingConversation.messages);
            this.loading = false;
            // Use setTimeout to ensure view is updated before scrolling
            setTimeout(() => {
              this.scrollToBottom('auto');
            }, 100);
          } else {
            console.log('Loading messages separately for existing conversation:', existingConversation.id);
            this.loadMessages(existingConversation.id);
          }
        } else {
          // If no existing conversation, create a new one
          console.log('No existing conversation found, creating new one with participant:', participant2Id);
          this.conversationService.getOrCreateConversation(participant2Id).subscribe({
            next: (conversation) => {
              console.log('New conversation created:', conversation);
              this.conversation = conversation;
              this.currentConversationId = conversation.id;
              this.participant2Id = participant2Id; // Ensure participant2Id is set correctly
              this.messages = [];
              this.loading = false;
              // Use setTimeout to ensure view is updated before scrolling
              setTimeout(() => {
                this.scrollToBottom('auto');
              }, 100);
            },
            error: (err) => {
              console.error('Error creating new conversation:', err);
              this.handleError(err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error loading conversations:', err);
        this.handleError(err);
      }
    });
  }

  private loadMessages(conversationId: number): void {
    console.log('Loading messages for conversation:', conversationId);
    this.loading = true;
    this.error = null;

    this.conversationService.getMessages(conversationId).subscribe({
      next: (messages) => {
        console.log('Messages loaded:', messages.length);
        // Sort messages by timestamp in ascending order
        this.messages = this.sortMessages(messages);
        this.loading = false;
        // Use setTimeout to ensure view is updated before scrolling
        setTimeout(() => {
          if (this.messagesContainer?.nativeElement) {
            this.scrollToBottom('auto');
          }
        }, 100);
      },
      error: (err) => {
        console.error('Error loading messages:', err);
        this.handleError(err);
        this.loading = false;
      }
    });
  }

  private sortMessages(messages: Message[]): Message[] {
    return messages.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateA - dateB;
    });
  }

  sendMessage(event?: Event): void {
    if (event) event.preventDefault();
    if (!this.newMessage.trim() || !this.conversation) return;

    const message: Partial<Message> = {
      content: this.newMessage.trim(),
      senderId: this.currentUserId,
      receiverId: this.conversation.participant2Id,
      timestamp: new Date(),
      read: false
    };

    this.loading = true;
    this.conversationService.sendMessage(this.conversation.id, message).subscribe({
      next: (sentMessage) => {
        this.messages.push(sentMessage);
        this.newMessage = '';
        // Force scroll to bottom when sending a new message
        this.shouldScrollToBottom = true;
        this.scrollToBottom();
        this.loading = false;
      },
      error: (err) => {
        this.handleError(err);
        this.loading = false;
        this.toastr.error('Failed to send message. Please try again.');
      }
    });
  }

  toggleAttachments(): void {
    this.showAttachments = !this.showAttachments;
  }

  async shareLocation(): Promise<void> {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`
          };
          this.conversationService.shareLocation(this.conversation!.id, location).subscribe(
            message => {
              this.messages.push(message);
              // Force scroll to bottom when sharing location
              this.shouldScrollToBottom = true;
              this.scrollToBottom();
            },
            error => {
              console.error('Error sharing location:', error);
              this.toastr.error('Failed to share location');
            }
          );
        },
        error => {
          console.error('Error getting location:', error);
          this.toastr.error('Failed to get location');
        }
      );
    } else {
      this.toastr.error('Geolocation is not supported by this browser');
    }
  }

  sendLocation(): void {
    if (!this.currentLocation || !this.conversation) return;

    const message: Partial<Message> = {
      content: 'Shared location',
      senderId: this.currentUserId,
      timestamp: new Date(),
      location: this.currentLocation
    };

    this.conversationService.sendMessage(this.conversation.id, message).subscribe({
      next: (sentMessage) => {
        this.messages.push(sentMessage);
        this.locationModal?.hide();
        this.currentLocation = null;
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  closeLocationModal(): void {
    this.locationModal?.hide();
    this.currentLocation = null;
    this.locationError = null;
    this.locationLoading = false;
  }

  toggleMute(): void {
    if (this.localVideo?.nativeElement?.srcObject) {
      const stream = this.localVideo.nativeElement.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isMuted = !audioTrack.enabled;
      }
    }
  }

  toggleCamera(): void {
    if (this.localVideo?.nativeElement?.srcObject) {
      const stream = this.localVideo.nativeElement.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isCameraOff = !videoTrack.enabled;
        // Update video display
        if (this.localVideo?.nativeElement) {
          this.localVideo.nativeElement.style.display = videoTrack.enabled ? 'block' : 'none';
        }
      }
    }
  }

  private startCallTimer(): void {
    this.callStartTime = new Date();
    this.callInterval = setInterval(() => {
      if (this.callStartTime) {
        const seconds = Math.floor((new Date().getTime() - this.callStartTime.getTime()) / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        this.callDuration = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  private handleError(err: any): void {
    console.error('Error:', err);
    if (err.status === 401) {
      this.toastr.error('Session expired. Please log in again.');
      this.authService.logout();
      this.router.navigate(['/login']);
    } else if (err.status === 403) {
      this.toastr.error('You do not have permission to perform this action.');
    } else if (err.status === 404) {
      this.toastr.error('Resource not found.');
    } else if (err.status === 500) {
      this.toastr.error('Server error. Please try again later.');
    } else {
      this.toastr.error('An unexpected error occurred.');
    }
  }

  private scrollToBottom(behavior: ScrollBehavior = 'smooth'): void {
    if (!this.shouldScrollToBottom) return;
    
    try {
      // Use setTimeout to ensure the view is updated
      setTimeout(() => {
        if (!this.messagesContainer?.nativeElement) {
          console.log('Messages container not yet initialized, skipping scroll');
          return;
        }
        
        const element = this.messagesContainer.nativeElement;
        element.scroll({
          top: element.scrollHeight,
          behavior: behavior
        });
      }, 100);
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  retry(): void {
    if (this.participant2Id) {
      this.loadConversation(this.participant2Id);
    }
  }

  private subscribeToStreams(): void {
    const localStreamSub = this.callService.getLocalStreamSubject().subscribe(stream => {
      if (stream && this.localVideo) {
        this.localVideo.nativeElement.srcObject = stream;
      }
    });

    const remoteStreamSub = this.callService.getRemoteStream().subscribe(stream => {
      this.remoteStream = stream;
      if (stream && this.remoteVideo) {
        this.remoteVideo.nativeElement.srcObject = stream;
      }
    });

    this.subscriptions.push(localStreamSub, remoteStreamSub);
  }

  getAuthorizedImageUrl(url: string): string {
    if (!url) return 'assets/images/default-logo.jpg';
    
    // If it's already a full URL, return it
    if (url.startsWith('http')) {
      return url;
    }

    // Handle profile images
    if (url.includes('/uploads/profile-images/')) {
      const filename = url.split('/').pop();
      return `${this.API_URL}/api/auth/profile-image/${filename}`;
    }

    // Handle other images (like job offer images)
    if (url.startsWith('/uploads/')) {
      return `${this.API_URL}${url}`;
    }

    return url;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.toastr.error('File size should not exceed 10MB');
      return;
    }

    this.uploadProgress = 0;
    const formData = new FormData();
    formData.append('file', file, file.name); // Add the filename as the third parameter

    this.loading = true;
    this.conversationService.uploadAttachment(formData).subscribe({
      next: (attachment) => {
        console.log('Uploaded attachment:', attachment);
        
        const message: Partial<Message> = {
          content: `Shared file: ${file.name}`,
          senderId: this.currentUserId,
          receiverId: this.participant2Id,
          timestamp: new Date(),
          attachment: {
            ...attachment,
            fileType: file.type,
            fileSize: file.size,
            loaded: false,
            url: this.getAuthorizedImageUrl(attachment.url)
          }
        };

        this.conversationService.sendMessage(this.conversation!.id, message).subscribe({
          next: (sentMessage) => {
            if (sentMessage.attachment) {
              if (sentMessage.attachment.fileType.startsWith('image/')) {
                const img = new Image();
                img.onload = () => {
                  if (sentMessage.attachment) {
                    sentMessage.attachment.loaded = true;
                  }
                };
                img.onerror = () => {
                  console.error('Failed to load image:', sentMessage.attachment?.url);
                  if (sentMessage.attachment) {
                    sentMessage.attachment.loaded = true;
                  }
                };
                img.src = this.getAuthorizedImageUrl(sentMessage.attachment.url);
              } else {
                sentMessage.attachment.loaded = true;
              }
            }
            this.messages.push(sentMessage);
            this.scrollToBottom();
            this.uploadProgress = 100;
            this.showAttachments = false;
            this.loading = false;
            setTimeout(() => {
              this.uploadProgress = 0;
            }, 2000);
          },
          error: (error) => {
            console.error('Error sending message:', error);
            this.toastr.error('Failed to send message');
            this.uploadProgress = 0;
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error uploading file:', error);
        this.toastr.error('Failed to upload file');
        this.uploadProgress = 0;
        this.loading = false;
      }
    });
  }

  handleImageError(event: any): void {
    console.error('Image load error:', event);
    console.log('Failed image URL:', event.target.src);
    
    // Try to reload the image with authorization header
    const token = this.authService.getToken();
    if (token && event.target.src) {
      const img = new Image();
      img.onload = () => {
        event.target.src = img.src;
        event.target.classList.remove('broken-image');
      };
      img.onerror = () => {
        event.target.src = 'assets/images/default-attachment.png';
        event.target.classList.add('broken-image');
      };
      
      // Create authorized URL
      const xhr = new XMLHttpRequest();
      xhr.open('GET', event.target.src, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.responseType = 'blob';
      xhr.onload = () => {
        if (xhr.status === 200) {
          const url = URL.createObjectURL(xhr.response);
          img.src = url;
        } else {
          event.target.src = 'assets/images/default-attachment.png';
          event.target.classList.add('broken-image');
        }
      };
      xhr.onerror = () => {
        event.target.src = 'assets/images/default-attachment.png';
        event.target.classList.add('broken-image');
      };
      xhr.send();
    } else {
      event.target.src = 'assets/images/default-attachment.png';
      event.target.classList.add('broken-image');
    }

    // Mark the attachment as loaded even if it failed
    const message = this.messages.find(m => m.attachment?.url === event.target.src);
    if (message?.attachment) {
      message.attachment.loaded = true;
    }
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return 'bi-image';
    if (fileType.startsWith('video/')) return 'bi-camera-video';
    if (fileType.startsWith('audio/')) return 'bi-music-note-beamed';
    if (fileType.includes('pdf')) return 'bi-file-earmark-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'bi-file-earmark-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'bi-file-earmark-excel';
    return 'bi-file-earmark';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  downloadFile(attachment: Attachment): void {
    if (!attachment.fileName) {
      this.toastr.error('Invalid file name');
      return;
    }
    
    this.conversationService.downloadAttachment(attachment.fileName).subscribe(
      (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error downloading file:', error);
        this.toastr.error('Failed to download file');
      }
    );
  }

  private formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private playRingtone(): void {
    if (this.ringtone && !this.isRinging) {
      this.isRinging = true;
      this.ringtone.play().catch(error => {
        console.error('Error playing ringtone:', error);
      });
    }
  }

  private stopRingtone(): void {
    if (this.ringtone && this.isRinging) {
      this.ringtone.pause();
      this.ringtone.currentTime = 0;
      this.isRinging = false;
    }
  }

  // Add new method to load conversations list
  private loadConversationsList(): void {
    this.loading = true;
    this.conversationService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.loading = false;
        
        // If no conversations exist and we're not already in a conversation, show empty state
        if (conversations.length === 0 && !this.currentConversationId) {
          this.error = 'No conversations yet. Start a new conversation to begin chatting.';
        }
      },
      error: (err) => {
        console.error('Error loading conversations list:', err);
        this.handleError(err);
        this.loading = false;
      }
    });
  }

  // Add new method to start a new conversation
  startNewConversation(): void {
    this.loadUsers();
    const modalElement = document.getElementById('newConversationModal');
    if (modalElement) {
      this.newConversationModal = new Modal(modalElement);
      this.newConversationModal.show();
    }
  }

  // Add new method to select a conversation
  selectConversation(conversationId: number): void {
    console.log('Selecting conversation:', conversationId);
    // Find the conversation in the list
    const conversation = this.conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      console.log('Found conversation to navigate to:', conversation);
      this.currentConversationId = conversationId;
      // Navigate using queryParams instead of route params
      this.router.navigate(['/conversation'], { 
        queryParams: { 
          participantId: conversation.participantId,
          currentUserId: this.currentUserId
        }
      });
    } else {
      console.error('Conversation not found:', conversationId);
    }
  }

  private loadMoreMessages(): void {
    if (!this.conversation || this.loading) return;

    this.loading = true;
    const oldestMessageId = this.messages[0]?.id;
    
    this.conversationService.getMessages(this.conversation.id, oldestMessageId).subscribe({
      next: (olderMessages) => {
        if (olderMessages.length > 0) {
          // Add older messages at the beginning of the array
          this.messages = [...olderMessages, ...this.messages];
          // Maintain scroll position
          const element = this.messagesContainer.nativeElement;
          const scrollHeight = element.scrollHeight;
          setTimeout(() => {
            element.scrollTop = element.scrollHeight - scrollHeight;
          }, 0);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading older messages:', err);
        this.handleError(err);
        this.loading = false;
      }
    });
  }

  private loadUsers(): void {
    this.loadingUsers = true;
    this.authService.getAllUsers().subscribe({
      next: (users) => {
        // Filter out the current user
        this.filteredUsers = users.filter(user => user.idUser !== this.currentUserId);
        this.loadingUsers = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.handleError(err);
        this.loadingUsers = false;
      }
    });
  }

  searchUsers(): void {
    if (!this.userSearchQuery.trim()) {
      this.loadUsers();
      return;
    }

    const query = this.userSearchQuery.toLowerCase();
    this.filteredUsers = this.filteredUsers.filter(user => 
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }

  startConversationWithUser(user: any): void {
    if (this.newConversationModal) {
      this.newConversationModal.hide();
    }
    this.router.navigate(['/conversation', user.idUser]);
  }

}