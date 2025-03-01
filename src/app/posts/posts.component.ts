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

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
  posts: Post[] = [];
  errorMessage = '';

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.getAllPosts();
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

  toggleLike(postId: number | undefined): void {
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
}