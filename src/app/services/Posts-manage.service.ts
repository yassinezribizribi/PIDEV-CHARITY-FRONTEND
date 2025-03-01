import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Subscription {
  idSubscription: number;
}

export interface Post {
  idPosts?: number;
  content: string;
  creationDate?: Date;
  likesCount?: number;
  shareCount?: number;
  subscription?: Subscription;
  userId?: number | null; // ✅ Modifié pour accepter null en plus de number
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private apiUrl = 'http://localhost:8089/api/posts';
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  constructor() {}

  getAllPosts(): Observable<Post[]> {
    const headers = this.authService.getAuthHeaders();
    console.log('Requête vers:', `${this.apiUrl}/getAllPosts`);
    return this.http.get<Post[]>(`${this.apiUrl}/getAllPosts`, { headers }).pipe(
      catchError(error => {
        console.error("❌ Erreur lors du chargement des posts :", error);
        return throwError(() => error);
      })
    );
  }

  addPost(post: Post): Observable<Post> {
    const headers = this.authService.getAuthHeaders();
    console.log('Ajout du post:', post);
    return this.http.post<Post>(`${this.apiUrl}/createPost`, post, { headers }).pipe(
      catchError(error => {
        console.error("❌ Erreur lors de l'ajout du post :", error);
        return throwError(() => error);
      })
    );
  }

  deletePost(id: number): Observable<string> {
    const headers = this.authService.getAuthHeaders();
    console.log('Delete post avec id:', id);
    return this.http.delete<string>(`${this.apiUrl}/deletePost/${id}`, { headers, responseType: 'text' as 'json' }).pipe(
      catchError(error => {
        console.error("❌ Erreur lors de la suppression :", error);
        return throwError(() => error);
      })
    );
  }

  getLikesCountByPost(): Observable<Map<number, number>> {
    const headers = this.authService.getAuthHeaders();
    console.log('Requête vers:', `${this.apiUrl}/likes-count`);
    return this.http.get<Map<number, number>>(`${this.apiUrl}/likes-count`, { headers }).pipe(
      catchError(error => {
        console.error("❌ Erreur lors du chargement des likes :", error);
        return throwError(() => error);
      })
    );
  }
}