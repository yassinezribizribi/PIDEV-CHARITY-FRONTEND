import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-12">
          <div class="section-title text-center mb-4 pb-2">
            <h4 class="title mb-4">Frequently Asked Questions</h4>
            <p class="text-muted para-desc mx-auto mb-0">Find answers to common questions about our forums and community.</p>
          </div>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-lg-8 mt-4">
          <div class="accordion" id="accordionExample">
            <div class="accordion-item" *ngFor="let item of faqItems; let i = index">
              <h2 class="accordion-header">
                <button class="accordion-button" 
                        [class.collapsed]="!item.isOpen"
                        type="button" 
                        (click)="toggleItem(i)">
                  {{item.question}}
                </button>
              </h2>
              <div class="accordion-collapse collapse" [class.show]="item.isOpen">
                <div class="accordion-body">
                  {{item.answer}}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .accordion-button:not(.collapsed) {
      background-color: #f8f9fa;
      color: #2f55d4;
    }
    .accordion-button:focus {
      box-shadow: none;
      border-color: rgba(47, 85, 212, 0.2);
    }
  `]
})
export class FaqComponent {
  faqItems = [
    {
      question: 'How can I participate in forum discussions?',
      answer: 'Simply create an account and start engaging with existing threads or create your own topics.',
      isOpen: false
    },
    {
      question: 'What are the forum rules?',
      answer: 'Be respectful, stay on topic, and avoid sharing personal information. Full guidelines are in our Terms of Service.',
      isOpen: false
    },
    {
      question: 'How can I help refugee families?',
      answer: 'You can contribute by offering housing, job opportunities, or volunteering your time and skills.',
      isOpen: false
    },
    {
      question: 'How do I post a job opportunity?',
      answer: 'Navigate to the Job Opportunities section and click on "Post New Job". Fill out the required information.',
      isOpen: false
    }
  ];

  toggleItem(index: number) {
    this.faqItems[index].isOpen = !this.faqItems[index].isOpen;
  }
}
