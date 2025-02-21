import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { 
  Association, 
  MediaItem, 
  Notification, 
  Collaboration,
  Event
} from '../interfaces/association.interface';

@Injectable({
  providedIn: 'root'
})
export class AssociationService {
  private currentAssociationSubject = new BehaviorSubject<Association | null>(null);
  currentAssociation$ = this.currentAssociationSubject.asObservable();

  private testTeamMembers = [
    {
      id: 'member-1',
      name: 'Ahmed Ben Salah',
      email: 'ahmed.bensalah@email.com',
      role: 'admin',
      phone: '+216 XX XXX XXX',
      status: 'active'
    },
    {
      id: 'member-2',
      name: 'Fatma Trabelsi',
      email: 'fatma.trabelsi@email.com',
      role: 'manager',
      phone: '+216 XX XXX XXX',
      status: 'active'
    },
    {
      id: 'member-3',
      name: 'Youssef Gharbi',
      email: 'youssef.gharbi@email.com',
      role: 'member',
      phone: '+216 XX XXX XXX',
      status: 'active'
    }
  ];

  constructor() {
    // Check if there's a stored association session
    const stored = localStorage.getItem('current_association');
    if (stored) {
      this.currentAssociationSubject.next(JSON.parse(stored));
    }
  }

  isLoggedIn(): boolean {
    return !!this.currentAssociationSubject.value;
  }

  async register(data: Partial<Association>): Promise<Association> {
    const newAssociation: Association = {
      id: 'assoc-' + Date.now(),
      ...data,
      verificationStatus: 'pending',
      createdAt: new Date(),
      teamMembers: [],
      documents: data.documents || { registrationDoc: '', legalDoc: '' }
    } as Association;

    localStorage.setItem(`association_${newAssociation.id}`, JSON.stringify(newAssociation));
    return newAssociation;
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      // For testing, create a test account if it doesn't exist
      if (email === 'test@example.com' && password === 'test123') {
        const testAssociation: Association = {
          id: 'test-1',
          name: 'Test Association',
          email: email,
          password: btoa(password),
          phone: '+1234567890',
          address: '123 Test St',
          description: 'This is a test association',
          logo: 'assets/images/logo-placeholder.png',
          documents: {
            registrationDoc: 'mock-url-for-reg.pdf',
            legalDoc: 'mock-url-for-legal.pdf'
          },
          verificationStatus: 'verified',
          verificationDate: new Date(),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          teamMembers: [],
          metrics: {
            totalAidCases: 0,
            activeAidCases: 0,
            totalEvents: 0,
            upcomingEvents: 0,
            totalDonations: 0,
            monthlyDonations: 0,
            totalBeneficiaries: 0,
            totalVolunteers: 0,
            engagement: {
              followers: 0,
              interactions: 0,
              shares: 0
            },
            recentActivity: []
          },
          statistics: {
            totalDonations: 0,
            totalBeneficiaries: 0,
            activeAidCases: 0,
            completedAidCases: 0
          },
          aidCases: [],
          events: [],
          mediaGallery: [],
          notifications: [],
          collaborations: []
        };
        
        localStorage.setItem(`association_${testAssociation.id}`, JSON.stringify(testAssociation));
        this.currentAssociationSubject.next(testAssociation);
        localStorage.setItem('current_association', JSON.stringify(testAssociation));
        return true;
      }

      const associations = this.getAllAssociations();
      const association = associations.find(a => a.email === email);

      if (!association || association.password !== btoa(password)) {
        throw new Error('Invalid credentials');
      }

      if (association.verificationStatus !== 'verified') {
        throw new Error('Account not yet verified');
      }

      this.currentAssociationSubject.next(association);
      localStorage.setItem('current_association', JSON.stringify(association));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('current_association');
    this.currentAssociationSubject.next(null);
  }

  private getAllAssociations(): Association[] {
    const associations: Association[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('association_')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          associations.push(JSON.parse(stored));
        }
      }
    }
    return associations;
  }

  getAssociationById(id: string): Observable<Association | null> {
    const stored = localStorage.getItem(`association_${id}`);
    return of(stored ? JSON.parse(stored) : null);
  }

  updateAssociation(id: string, data: Partial<Association>): Promise<Association> {
    const stored = localStorage.getItem(`association_${id}`);
    if (!stored) {
      return Promise.reject('Association not found');
    }

    const association = JSON.parse(stored);
    const updated = { ...association, ...data };
    localStorage.setItem(`association_${id}`, JSON.stringify(updated));
    
    if (this.currentAssociationSubject.value?.id === id) {
      this.currentAssociationSubject.next(updated);
      localStorage.setItem('current_association', JSON.stringify(updated));
    }

    return Promise.resolve(updated);
  }

  async uploadMedia(file: File, metadata: Partial<MediaItem>): Promise<MediaItem> {
    // In a real app, you'd upload to a server
    const mediaItem: MediaItem = {
      id: 'media-' + Date.now(),
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 'document',
      url: URL.createObjectURL(file), // Temporary URL
      title: metadata.title || file.name,
      description: metadata.description,
      category: metadata.category || 'uncategorized',
      uploadedAt: new Date(),
      size: file.size
    };

    const association = this.currentAssociationSubject.value;
    if (association) {
      association.mediaGallery = [...(association.mediaGallery || []), mediaItem];
      await this.updateAssociation(association.id, association);
    }

    return mediaItem;
  }

  addNotification(notification: Partial<Notification>) {
    const association = this.currentAssociationSubject.value;
    if (association) {
      const newNotification: Notification = {
        id: 'notif-' + Date.now(),
        type: notification.type || 'system',
        title: notification.title || '',
        message: notification.message || '',
        read: false,
        createdAt: new Date(),
        data: notification.data
      };

      association.notifications = [newNotification, ...(association.notifications || [])];
      this.updateAssociation(association.id, association);
    }
  }

  async createCollaboration(partnerId: string, data: Partial<Association['collaborations'][0]>): Promise<Association['collaborations'][0]> {
    const association = this.currentAssociationSubject.value;
    if (!association) {
      throw new Error('No association logged in');
    }

    const collaboration = {
      id: 'collab-' + Date.now(),
      partnerId,
      partnerName: data.partnerName || '',
      projectTitle: data.projectTitle || '',
      description: data.description || '',
      status: 'proposed' as const,
      startDate: new Date(),
      objectives: data.objectives || [],
      outcomes: data.outcomes || []
    };

    association.collaborations = [...(association.collaborations || []), collaboration];
    await this.updateAssociation(association.id, association);

    return collaboration;
  }
} 