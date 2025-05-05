import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-celebration-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './celebration-modal.component.html',
  styleUrls: ['./celebration-modal.component.scss']
})
export class CelebrationModalComponent {
  @Input() title: string = 'Congratulations!';
  @Input() message: string = '';
  @Input() benefits: string[] = [];
  @Input() showUpgradeButton: boolean = false;
  @Input() upgradeButtonText: string = 'Upgrade Now';
  
  @Output() upgradeClicked = new EventEmitter<void>();

  constructor(public activeModal: NgbActiveModal) {}

  onUpgradeClick() {
    this.upgradeClicked.emit();
    this.activeModal.close();
  }

  ngOnDestroy() {
    // Safely remove modal backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop && backdrop.parentNode) {
      backdrop.parentNode.removeChild(backdrop);
    }
    document.body.classList.remove('modal-open');
  }
} 