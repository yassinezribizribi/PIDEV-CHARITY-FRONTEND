// modal.component.ts
import { Component, TemplateRef, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService, IModalConfig } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #modalTemplate>
      <div class="modal-header">
        <h4 class="modal-title">{{modalData?.title}}</h4>
        <button type="button" class="btn-close" (click)="close()"></button>
      </div>
      <div class="modal-body" [innerHTML]="modalData?.content"></div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="close()">Close</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .modal-body {
      white-space: pre-line;
    }
  `]
})
export class ModalComponent {
  @ViewChild('modalTemplate') modalTemplate!: TemplateRef<any>;
  modalData: { title?: string; content?: string } | null = null;
  private modalRef: any;

  constructor(
    @Inject(ModalService) private modalService: ModalService,
    @Inject(NgbModal) private ngbModal: NgbModal
  ) {
    this.modalService.modal$.subscribe(config => {
      if (config?.component === 'partner-details') {
        this.modalData = {
          title: config.data?.title,
          content: config.data?.content
        };
        this.modalRef = this.ngbModal.open(this.modalTemplate, { 
          size: config.data?.size || 'md' 
        });
      }
    });
  }

  close() {
    if (this.modalRef) {
      this.modalRef.close();
    }
    this.modalService.close();
  }
}