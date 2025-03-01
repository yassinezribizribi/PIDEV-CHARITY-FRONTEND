import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from '@component/footer/footer.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { PostsService, Post } from 'src/app/services/Posts-manage.service';
import { AuthService } from 'src/app/services/auth.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from 'src/app/interceptors/token.interceptor';
import { BlogSidebarsComponent } from "../../../components/blog-sidebars/blog-sidebars.component";

@Component({
  selector: 'app-posts-manage',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AdminNavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    HttpClientModule,
    BlogSidebarsComponent
],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    PostsService
  ],
  templateUrl: './posts-manage.component.html',
  styleUrls: ['./posts-manage.component.scss']
})
export class PostsManageComponent implements OnInit {
  postService = inject(PostsService);
  authService = inject(AuthService);

  posts: Post[] = [];
  newPostContent: string = '';
  subscriptionId: number | null = null;
  userId: number | null = null;
  errorMessage = '';
  currentDate = new Date();
  hasToken = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkUserAuth();
    if (this.hasToken) {
      this.getAllPosts();
    }
  }

  checkUserAuth(): void {
    const token = this.authService.getToken(); // ✅ getToken existe
    this.hasToken = !!token;

    if (!this.hasToken) {
      console.warn("⚠️ L'utilisateur n'est pas connecté !");
      this.errorMessage = "Aucun token d’authentification trouvé. Veuillez vous connecter.";
      return;
    }

    // Décoder manuellement le token pour obtenir l’ID
    const decodedToken = this.decodeToken(token!);
    if (decodedToken) {
      this.userId = decodedToken.idUser || Number(decodedToken.sub); // Ajustez selon votre token
      console.log("👤 ID utilisateur détecté :", this.userId);
    } else {
      console.warn("⚠️ Impossible de décoder l’ID utilisateur.");
      this.userId = null;
    }
  }

  // Décoder le token localement
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('❌ Erreur lors du décodage du token:', error);
      return null;
    }
  }

  getAllPosts(): void {
    console.log("🔍 Vérification du token avant requête :", this.authService.getToken());
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.loadLikesCount();
        console.log('✅ Données reçues:', this.posts);
      },
      error: (error) => {
        console.error('❌ Détails de l’erreur:', error);
        this.errorMessage = 'Erreur lors de la récupération des posts : ' + (error.message || 'Vérifiez la console');
      }
    });
  }

  loadLikesCount(): void {
    this.postService.getLikesCountByPost().subscribe({
      next: (likesCountMap) => {
        this.posts.forEach(post => {
          post.likesCount = likesCountMap.get(post.idPosts!) || 0;
        });
        console.log('✅ Likes mis à jour:', this.posts);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des likes:', error);
        this.errorMessage = 'Erreur lors du chargement des likes : ' + (error.message || 'Vérifiez la console');
      }
    });
  }

  sharePost(): void {
    if (!this.hasToken) {
      this.errorMessage = 'Aucun token d’authentification trouvé. Veuillez vous connecter.';
      return;
    }

    if (!this.newPostContent.trim()) {
      this.errorMessage = 'Le contenu du post ne peut pas être vide.';
      return;
    }

    if (!this.subscriptionId) {
      this.errorMessage = 'L’ID de la subscription est requis.';
      return;
    }

    const newPost: Post = {
      content: this.newPostContent,
      creationDate: new Date(),
      subscription: { idSubscription: this.subscriptionId }
    };

    this.postService.addPost(newPost).subscribe({
      next: (createdPost) => {
        const postWithUser: Post = { ...createdPost, userId: this.userId }; // ✅ userId reconnu
        this.posts.unshift(postWithUser);
        this.newPostContent = '';
        this.subscriptionId = null;
        this.errorMessage = '';
        console.log('✅ Post créé avec succès:', postWithUser);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création du post:', error);
        this.errorMessage = 'Erreur lors de la création du post : ' + (error.message || 'Voir console');
      }
    });
  }

  editPost(postId: number | undefined): void {
    if (postId === undefined) {
      this.errorMessage = 'ID du post manquant';
      return;
    }

    const post = this.posts.find(p => p.idPosts === postId);
    if (!post) {
      this.errorMessage = 'Post non trouvé';
      return;
    }

    const updatedContent = prompt('Modifier le contenu du post :', post.content);
    if (updatedContent && updatedContent !== post.content) {
      post.content = updatedContent;
      this.posts = [...this.posts];
      console.log('✅ Post mis à jour localement (simulation):', post);
    }
  }

  deletePost(postId: number | undefined): void {
    if (postId === undefined) {
      this.errorMessage = 'ID du post manquant';
      return;
    }

    if (confirm('Voulez-vous vraiment supprimer ce post ?')) {
      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.idPosts !== postId);
          console.log(`✅ Post ${postId} supprimé avec succès`);
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          this.errorMessage = 'Erreur lors de la suppression du post : ' + (error.message || 'Voir console');
        }
      });
    }
  }
}