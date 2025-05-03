import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { PostService, Post } from 'src/app/services/post.service';
import { TokenInterceptor } from 'src/app/interceptors/token.interceptor';
import { BlogSidebarsComponent } from '@component/blog-sidebars/blog-sidebars.component';
import { jwtDecode } from 'jwt-decode';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommentService } from '../services/comment.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule ,
    NavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    HttpClientModule,
    BlogSidebarsComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    PostService
  ],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {
  commentForm!: FormGroup;
  posts: any[] = [];
  recommendedPosts: any[] = [];
  errorMessage = '';
  userId: number | null = null;

  constructor(
    private postService: PostService,
    private authservice: AuthService,
    private commentService: CommentService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.getAllPosts();
    this.userId = this.getUserIdFromToken();
    console.log("hennn" + this.userId);
    if (this.userId) {
      this.getRecommendedPosts();
    }
    
    this.commentForm = this.fb.group({
      descriptionComment: ['', Validators.required],
    });
  }

  getAllPosts(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.errorMessage = 'Aucun token d’authentification trouvé. Veuillez vous connecter.';
      return;
    }
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        this.posts = data.reverse();
        if (this.userId) {
          // Fetch like status for each post
          this.posts.forEach(post => {
            this.postService.checkIfLiked(post.idPosts, this.userId!).subscribe({
              next: (liked) => {
                post.likedByUser = liked;
                post.creationDate = new Date(post.creationDate);
              },
              error: (err) => {
                console.error(`Error checking like status for post ${post.idPosts}:`, err);
                post.likedByUser = false; // Default to false on error
              }
            });
          });
        }
      },
      error: (error) => {
        console.error('Détails de l’erreur:', error);
        this.errorMessage = 'Erreur lors de la récupération des posts : ' + (error.message || 'Vérifiez la console');
      }
    });
  }

  getRecommendedPosts(): void {
    if (!this.userId) {
      this.errorMessage = 'Utilisateur non connecté. Impossible de récupérer les posts recommandés.';
      return;
    }
    this.postService.getRecommendedPosts(this.userId).subscribe({
      next: (data: any) => {
        this.recommendedPosts = data.recommended_posts;
        this.recommendedPosts.forEach(post => {
          this.postService.checkIfLiked(post.id, this.userId!).subscribe({
            next: (liked) => {
              post.likedByUser = liked;
              post.idPosts = post.id;
              post.creationDate = new Date(post.creation_date);
            },
            error: (err) => {
              console.error(`Error checking like status for post ${post.id}:`, err);
              post.likedByUser = false;
            }
          });
        });
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des posts recommandés:', error);
        this.errorMessage = 'Erreur lors de la récupération des posts recommandés : ' + (error.message || 'Vérifiez la console');
      }
    });
  }

  
  getUserIdFromToken(): number | null {
    const token = localStorage.getItem('auth_token');
    console.log("token:", token);
    
    if (!token) return null;
    
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.idUser;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  toggleLike(post: any): void {
    this.userId = this.getUserIdFromToken();
  
    if (this.userId === null) {
      console.error("User ID is null. Cannot toggle like.");
      return;
    }
    this.postService.toggleLike(post.idPosts, this.userId).subscribe({
      next: (updatedPost) => {
        post.likesCount = updatedPost.likesCount;
        post.likedByUser = !post.likedByUser;
      },
      error: (err) => {
        console.error('Error toggling like:', err);
      }
    });
  }


  addComment(postId: number) {
    if (this.commentForm.invalid) {
      this.showModal('error');
      return;
    }
    this.commentService.addComment(postId, this.commentForm.value, this.userId!).subscribe({
      next: (response) => {
        console.log(response);
        this.showModal('success');
        this.commentForm.reset();
        this.getAllPosts();
      },
      error: (error) => {
        if (error.status === 400 && error.error?.message?.includes("inappropriés")) {
          this.showModal('error');
        } else {
          this.showModal('error');
        }
      }
    });
  }

  private showModal(type: 'success' | 'error'): void {
    const modalId = type === 'success' ? 'commentAddModal' : 'commentAddErrorModal';
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modalElement);
      bootstrapModal.show();
    } else {
      console.error(`Modal with ID ${modalId} not found`);
    }
  }

  deleteComment(commentId: number): void {
    this.commentService.deleteComment(commentId).subscribe(() => {
      this.getAllPosts(); // Recharger les posts après suppression
    });
  }

  btnedit: boolean = false;
  selectid: any;
  
  editComment(comment: any): void {
    this.btnedit = true;
    this.selectid = comment.idComment;
    this.commentForm.patchValue({
      descriptionComment: comment.descriptionComment,
    });
  }

  updateComment(): void {
    if (this.commentForm.invalid) {
      alert('Aucun commentaire à mettre à jour');
      return;
    }
  
    this.commentService.updateComment(this.selectid, this.commentForm.value).subscribe(response => {
      console.log(response);
      this.btnedit = false;
      this.commentForm.reset(); 
      this.getAllPosts(); 
    });
  }
}