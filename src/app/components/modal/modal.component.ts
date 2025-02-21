import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h5 class="modal-title">{{title}}</h5>
          <button type="button" class="btn-close" (click)="close()"></button>
        </div>
        <div class="modal-body">
          <!-- Dynamic content will be loaded here -->
          <ng-container [ngSwitch]="currentModal?.component">
            <ng-container *ngSwitchCase="'aid-announcement-form'">
              <!-- Load Aid Announcement Form -->
            </ng-container>
            <ng-container *ngSwitchCase="'event-form'">
              <!-- Load Event Form -->
            </ng-container>
            <!-- Add more cases for other modal types -->
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1050;
    }

    .modal-container {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-body {
      padding: 1rem;
    }
  `]
})
export class ModalComponent implements OnInit {
  currentModal: ModalConfig | null = null;
  isOpen = false;
  title = '';

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.modalService.modal$.subscribe(modal => {
      this.currentModal = modal;
      this.isOpen = !!modal;
      if (modal) {
        this.setModalTitle(modal.component);
      }
    });
  }

  private setModalTitle(component: string) {
    switch (component) {
      case 'aid-announcement-form':
        this.title = 'Create Aid Announcement';
        break;
      case 'event-form':
        this.title = 'Schedule Event';
        break;
      case 'media-upload':
        this.title = 'Upload Media';
        break;
      case 'member-management':
        this.title = 'Manage Members';
        break;
      case 'aid-case-details':
        this.title = 'Aid Case Details';
        break;
      default:
        this.title = 'Modal';
    }
  }

  close() {
    this.modalService.close();
  }
} 