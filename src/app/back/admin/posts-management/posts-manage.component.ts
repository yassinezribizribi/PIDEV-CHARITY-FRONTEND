import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '@component/footer/footer.component';
import { NavbarComponent } from '@component/navbar/navbar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { ScrollToTopComponent } from '@component/scroll-to-top/scroll-to-top.component';
import { PostService, Post } from 'src/app/services/post.service';
import { TokenInterceptor } from 'src/app/interceptors/token.interceptor';
import { BlogSidebarsComponent } from '@component/blog-sidebars/blog-sidebars.component';

@Component({
  selector: 'app-posts-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NavbarComponent,
    AdminNavbarComponent,
    FooterComponent,
    ScrollToTopComponent,
    HttpClientModule,
    BlogSidebarsComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    PostService
  ],
  templateUrl: './posts-manage.component.html',
  styleUrls: ['./posts-manage.component.scss']
})
export class PostsManageComponent implements OnInit {
  posts: Post[] = [];
  newPostContent: string = '';
  loading = true;
  error: string | null = null;
  currentDate = new Date();

  constructor(
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      this.error = 'Aucun token d’authentification trouvé. Veuillez vous connecter.';
      this.loading = false;
      return;
    }

    this.postService.getAllPosts().subscribe({
      next: (data: Post[]) => {
        this.posts = data;
        this.loading = false;
        console.log('Posts chargés:', this.posts);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des posts:', error);
        this.error = 'Erreur lors du chargement des posts : ' + (error.message || 'Vérifiez la console');
        this.loading = false;
      }
    });
  }

  onSharePost(): void {
    if (!this.newPostContent.trim()) {
      this.error = 'Le contenu du post ne peut pas être vide';
      return;
    }

    const newPostContent: Post = { content: this.newPostContent };
    this.postService.addPost(newPost).subscribe({
      next: (response: Post) => {
        this.posts.unshift(response); // Ajoute le nouveau post en haut de la liste
        this.newPostContent = ''; // Réinitialise le champ
        console.log('Post ajouté avec succès:', response);
        this.error = null;
      },
      error: (error) => {
        console.error('Erreur lors de l’ajout du post:', error);
        this.error = 'Erreur lors de l’ajout du post : ' + (error.message || 'Vérifiez la console');
      }
    });
  }

  deletePost(id: number | undefined): void {
    if (id === undefined) {
      this.error = 'ID du post manquant';
      return;
    }
    if (confirm('Voulez-vous vraiment supprimer ce post ?')) {
      this.postService.deletePost(id).subscribe({
        next: () => {
          this.posts = this.posts.filter(post => post.idPosts !== id);
          console.log(`Post ${id} supprimé avec succès`);
          this.error = null;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.error = 'Erreur lors de la suppression du post : ' + (error.message || 'Vérifiez la console');
        }
      });
    }
  }

  editPost(post: Post): void {
    this.router.navigate(['/edit-post', post.idPosts]);
  }
}