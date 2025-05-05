// modal.component.ts
import { Component, TemplateRef, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalService, IModalConfig, ModalAction, ModalData } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-template #modalTemplate>
      <div class="modal-header" [innerHTML]="modalData?.title">
      </div>
      <div class="modal-body" [innerHTML]="modalData?.content"></div>
      <div class="modal-footer">
        <ng-container *ngIf="modalData?.actions?.length; else defaultActions">
          <button *ngFor="let action of modalData?.actions"
                  type="button"
                  class="btn"
                  [class]="action.class"
                  (click)="handleAction(action)">
            {{action.text}}
          </button>
        </ng-container>
        <ng-template #defaultActions>
          <button type="button" class="btn btn-secondary" (click)="close()">Close</button>
        </ng-template>
      </div>
    </ng-template>
  `,
  styles: [`
    .modal-body {
      white-space: pre-line;
    }
    :host ::ng-deep .modal-header h4 {
      margin: 0;
    }
  `]
})
export class ModalComponent {
  @ViewChild('modalTemplate') modalTemplate!: TemplateRef<any>;
  modalData: ModalData | null = null;
  private modalRef: any;

  constructor(
    @Inject(ModalService) private modalService: ModalService,
    @Inject(NgbModal) private ngbModal: NgbModal
  ) {
    this.modalService.modal$.subscribe(config => {
      if (config) {
        const { title, content, actions, size } = config.data || {};
        this.modalData = {
          title,
          content,
          actions: actions as ModalAction[]
        };
        this.modalRef = this.ngbModal.open(this.modalTemplate, { 
          size: size || 'md',
          centered: true
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

  handleAction(action: ModalAction) {
    if (action.handler) {
      action.handler();
    }
    this.close();
  }
}