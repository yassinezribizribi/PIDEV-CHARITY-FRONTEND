import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { RouterLink } from '@angular/router';

interface Post {
  id: number;
  author: string;
  content: string;
  type: 'job' | 'question';
  likes: number;
  shares: number;
  comments: { author: string; message: string }[];
  newComment: string;

}

@Component({
  selector: 'app-job-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent,RouterLink],
  template: `
    <app-navbar/>
    <!-- Hero Start -->
<section class="bg-half-170 d-table w-100" style="background: url('assets/images/hero/pages.jpg') center;">
    <div class="bg-overlay bg-gradient-overlay"></div>
    <div class="container">
        <div class="row mt-5 justify-content-center">
            <div class="col-12">
                <div class="title-heading text-center">
                    <h5 class="heading fw-semibold mb-0 sub-heading text-white title-dark">Job Opportunities & Discussions</h5>
                </div>
            </div><!--end col-->
        </div><!--end row-->

        <div class="position-middle-bottom">
            <nav aria-label="breadcrumb" class="d-block">
                <ul class="breadcrumb breadcrumb-muted mb-0 p-0">
                    <li class="breadcrumb-item"><a [routerLink]="'/'">solidarity</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Job Opportunities & Discussions</li>
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

    
    <section class="container mt-5">
      
      <!-- Filters -->
      <div class="mb-3">
        <label class="me-2">Filter by:</label>
        <button class="btn btn-outline-primary me-2" (click)="filter='all'">All</button>
        <button class="btn btn-outline-success me-2" (click)="filter='job'">Job Offers 💼</button>
        <button class="btn btn-outline-info" (click)="filter='question'">Questions ❓</button>
      </div>
      
      <!-- Post Creation -->
      <div class="card shadow p-3 mb-4">
        <textarea [(ngModel)]="newPost" class="form-control" placeholder="Share a job opportunity or ask for advice..."></textarea>
        <select [(ngModel)]="newPostType" class="form-select mt-2">
          <option value="question">Question ❓</option>
          <option value="job">Job Offer 💼</option>
        </select>
        <button class="btn btn-primary mt-2" (click)="addPost()" [disabled]="!newPost.trim()">Post</button>
      </div>
      
      <!-- Posts Feed -->
      <div *ngFor="let post of filteredPosts()" class="card shadow mb-4 p-3">
        <h5>
          <strong>{{ post.author }}</strong>
          <span *ngIf="post.type === 'job'" class="text-success">💼</span>
          <span *ngIf="post.type === 'question'" class="text-info">❓</span>
        </h5>
        <p>{{ post.content }}</p>
        
        <div class="d-flex gap-3">
          <button class="btn btn-sm btn-outline-primary" (click)="likePost(post)">👍 Like ({{ post.likes }})</button>
          <button class="btn btn-sm btn-outline-secondary" (click)="sharePost(post)">🔄 Share ({{ post.shares }})</button>
        </div>
        
        <!-- Comments Section -->
        <div class="mt-3">
          <h6>Comments:</h6>
          <div *ngFor="let comment of post.comments" class="bg-light p-2 rounded mb-1">
            <p><strong>{{ comment.author }}:</strong> {{ comment.message }}</p>
          </div>
          
          <input [(ngModel)]="post.newComment" class="form-control mt-2" placeholder="Write a comment..."/>
          <button class="btn btn-sm btn-success mt-1" (click)="addComment(post)" [disabled]="!post.newComment.trim()">Comment</button>
        </div>
      </div>
    </section>
    
    <app-footer></app-footer>
  `,
  styles: [
    `
    .card {
      border-radius: 12px;
    }
    .btn {
      cursor: pointer;
    }
    `
  ]
})
export class JobOpportunitiesForumComponent {
  filter: 'all' | 'job' | 'question' = 'all';
  newPost: string = '';
  newPostType: 'job' | 'question' = 'question';

  posts: Post[] = [
    { id: 1, author: 'User123', content: 'Looking for IT job recommendations in Tunisia.', type: 'question', likes: 3, shares: 1, comments: [{ author: 'User1', message: 'Check TanitJobs for local opportunities.' }], newComment: '' },
    { id: 2, author: 'RecruiterTech', content: '🚀 Hiring Junior Web Developers! Location: Tunis. Remote option available. Apply now!', type: 'job', likes: 12, shares: 4, comments: [{ author: 'User3', message: 'Is this a full-time position?' }], newComment: '' },
    { id: 3, author: 'CareerCoach', content: '💡 Resume Tip: Keep it under 2 pages, focus on skills & achievements!', type: 'question', likes: 8, shares: 2, comments: [{ author: 'User4', message: 'Great advice, thank you!' }], newComment: '' }
  ];

  filteredPosts() {
    if (this.filter === 'all') return this.posts;
    return this.posts.filter(post => post.type === this.filter);
  }

  addPost() {
    this.posts.unshift({
      id: Date.now(),
      author: 'You',
      content: this.newPost.trim(),
      type: this.newPostType,
      likes: 0,
      shares: 0,
      comments: [],
      newComment: ''
    });
    this.newPost = '';
  }

  likePost(post: Post) {
    post.likes++;
  }

  sharePost(post: Post) {
    post.shares++;
  }

  addComment(post: Post) {
    if (post.newComment.trim()) {
      post.comments.push({ author: 'You', message: post.newComment.trim() });
      post.newComment = '';
    }
  }
}
