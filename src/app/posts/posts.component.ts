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
  errorMessage = '';
  userId: number | null = null;


  constructor(private postService: PostService,private authservice: AuthService,private commentService:CommentService,private fb:FormBuilder) {}

  ngOnInit(): void {
    this.getAllPosts();
    this.userId = this.getUserIdFromToken();
    console.log("hennn"+this.userId);
    
    this.commentForm= this.fb.group({
      descriptionComment: ['', Validators.required],
    });
  }

  getAllPosts(): void {
    const token = localStorage.getItem('auth_token');
    console.log('Token:', token);
    if (!token) {
      this.errorMessage = 'Aucun token d’authentification trouvé. Veuillez vous connecter.';
      return;
    }
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        console.log('Données reçues:', data);
        this.posts = data.map(post => ({
          ...post,
          isLiked: false
        }));
        console.log('Posts transformés:', this.posts);
      },
      error: (error) => {
        console.error('Détails de l’erreur:', error);
        this.errorMessage = 'Erreur lors de la récupération des posts : ' + (error.message || 'Vérifiez la console');
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

  

  toggleLikeOld(postId: number | undefined): void {
    console.log('Clic sur J’aime, postId:', postId);
    if (postId === undefined) {
      console.log('postId undefined, arrêt');
      this.errorMessage = 'ID du post manquant';
      return;
    }
  
    const post = this.posts.find(p => p.idPosts === postId);
    if (!post) {
      console.log('Post non trouvé pour id:', postId);
      this.errorMessage = 'Post non trouvé';
      return;
    }
  
    if (post.isLiked && post.actionId) {
      // Supprimer le like dans la base de données
      this.postService.unlikePost(post.actionId).subscribe({
        next: (response) => {
          console.log('Réponse unlike:', response);
          // Garder le like visuellement "toggled" côté client
          post.isLiked = true; // On garde le like visuellement "toggled"
          post.actionId = undefined;
          console.log(`Post ${postId} unliked avec succès`);
          this.errorMessage = '';
        },

      });
    } else {
      // Ajouter un like dans la base de données
      this.postService.likePost(postId).subscribe({
        next: (response) => {
          post.isLiked = true;
          post.actionId = response.idAction;
          console.log(`Post ${postId} liked avec succès`, response);
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Erreur like:', error.status, error.error);
          // Afficher un message d'erreur si l'ajout du like échoue
          this.errorMessage = 'Erreur lors de l’ajout du like : ' + (error.message || 'Voir console');
        }
      });
    }
  }
  addComment(postId: number) {
    if (this.commentForm.invalid) {
      alert('Aucun commentaire à ajouter');
      return;
    }
  
 
    this.commentService.addComment(postId, this.commentForm.value,this.userId!).subscribe(response => {
      console.log(response);
      this.commentForm.reset(); 
      this.getAllPosts(); 
    });
  }

  deleteComment(commentId: number): void {
    this.commentService.deleteComment(commentId).subscribe(() => {
      this.getAllPosts(); // Recharger les posts après suppression
    });
  }
  btnedit:boolean=false;
  selectid:any
  editComment(comment: any): void {
    this.btnedit=true;
    this.selectid=comment.idComment;
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
      this.btnedit=false;
      this.commentForm.reset(); 
      this.getAllPosts(); 
    });
  }
}