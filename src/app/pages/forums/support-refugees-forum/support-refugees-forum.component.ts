import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-support-refugees',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent,RouterLink],
  template: `
    <app-navbar />
     <!-- Hero Start -->
<section class="bg-half-170 d-table w-100" style="background: url('assets/images/hero/pages.jpg') center;">
    <div class="bg-overlay bg-gradient-overlay"></div>
    <div class="container">
        <div class="row mt-5 justify-content-center">
            <div class="col-12">
                <div class="title-heading text-center">
                    <h5 class="heading fw-semibold mb-0 sub-heading text-white title-dark">Support Refugees Discussion</h5>
                </div>
            </div><!--end col-->
        </div><!--end row-->

        <div class="position-middle-bottom">
            <nav aria-label="breadcrumb" class="d-block">
                <ul class="breadcrumb breadcrumb-muted mb-0 p-0">
                    <li class="breadcrumb-item"><a [routerLink]="'/'">solidarity</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Support Refugees Discussion</li>
                </ul>
            </nav>
        </div>
    </div><!--end container-->
</section><!--end section-->

<div class="position-relative">
    <div class="shape overflow-hidden text-white">
        <svg viewBox="0 0 2880 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 48H1437.5H2880V0H2160C1442.5 52 720 0 720 0H0V48Z" fill="currentColor"></path>
        </svg>
    </div>
</div>
<!-- Hero End -->

    
    
    <section class="section">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card shadow rounded border-0">
              <div class="card-body p-4">
                <h3 class="mb-4">Support Refugees Discussion </h3>
                
                <div class="forum-thread mb-4">
                  <h4 class="mb-3">{{thread.title}}</h4>
                  <div class="thread-content p-3 bg-light rounded">
                    <p class="mb-2"><strong>{{thread.author}}</strong></p>
                    <p class="mb-0">{{thread.content}}</p>
                  </div>
                
                  <div class="replies mt-4">
                    <h5 class="mb-3">Replies:</h5>
                    <div class="reply-list">
                      <div *ngFor="let reply of thread.replies" class="reply p-3 mb-3 bg-light rounded">
                        <p class="mb-2"><strong>{{reply.author}}</strong></p>
                        <p class="mb-0">{{reply.message}}</p>
                      </div>
                    </div>
                  </div>
                
                  <div class="reply-form mt-4">
                    <h5 class="mb-3">Add Reply</h5>
                    <textarea 
                      [(ngModel)]="newReply" 
                      class="form-control mb-3" 
                      rows="3"
                      placeholder="Write your reply..."></textarea>
                    <button 
                      class="btn btn-primary" 
                      (click)="addReply()"
                      [disabled]="!newReply.trim()">
                      Post Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <app-footer />
  `,
  styles: [`
    .reply {
      border-left: 3px solid #2f55d4;
    }
  `]
})
export class SupportRefugeesComponent {
  thread = {
    title: 'How can we help refugee families settle?',
    author: 'CommunityMember',
    content: 'Looking for ideas to help newly arrived refugee families integrate into our community.',
    replies: [
      { author: 'Volunteer1', message: 'We can organize language classes and cultural orientation sessions.' },
      { author: 'SupportGroup2', message: 'Our organization assists with job placements and housing.' }
    ]
  };

  newReply: string = '';

  addReply() {
    if (this.newReply.trim()) {
      this.thread.replies.push({ 
        author: 'You', 
        message: this.newReply.trim() 
      });
      this.newReply = '';
    }
  }
}