import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AidAnnouncement } from '../interfaces/aid-announcement.interface';

@Injectable({
  providedIn: 'root'
})
export class AidService {
  private announcements: AidAnnouncement[] = [];
  private announcementsSubject = new BehaviorSubject<AidAnnouncement[]>([]);

  getAnnouncements(): Observable<AidAnnouncement[]> {
    return this.announcementsSubject.asObservable();
  }

  createAnnouncement(data: Partial<AidAnnouncement>): Promise<AidAnnouncement> {
    const newAnnouncement: AidAnnouncement = {
      id: 'aid-' + Date.now(),
      ...data,
      status: 'active',
      createdAt: new Date(),
      interactions: {
        views: 0,
        shares: 0,
        donations: 0
      },
      socialShares: {
        facebook: 0,
        twitter: 0,
        whatsapp: 0,
        linkedin: 0
      }
    } as AidAnnouncement;

    this.announcements.push(newAnnouncement);
    this.announcementsSubject.next(this.announcements);
    return Promise.resolve(newAnnouncement);
  }

  shareToSocial(id: string, platform: keyof AidAnnouncement['socialShares']): void {
    const announcement = this.announcements.find(a => a.id === id);
    if (announcement) {
      announcement.socialShares[platform]++;
      announcement.interactions.shares++;
      this.announcementsSubject.next(this.announcements);

      const shareUrl = encodeURIComponent(`${window.location.origin}/aid/${id}`);
      const text = encodeURIComponent(announcement.title);

      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`);
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`);
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${text}%20${shareUrl}`);
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`);
          break;
      }
    }
  }

  getAnnouncementById(id: string): AidAnnouncement | undefined {
    return this.announcements.find(a => a.id === id);
  }

  updateAnnouncement(id: string, data: Partial<AidAnnouncement>): Promise<AidAnnouncement> {
    const index = this.announcements.findIndex(a => a.id === id);
    if (index === -1) {
      return Promise.reject('Announcement not found');
    }

    this.announcements[index] = { ...this.announcements[index], ...data };
    this.announcementsSubject.next(this.announcements);
    return Promise.resolve(this.announcements[index]);
  }
} 