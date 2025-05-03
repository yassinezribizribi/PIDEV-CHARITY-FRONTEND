import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { User } from './Animal.service';

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
  private apiUrlUser = 'http://localhost:8089/api/users';
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

  addPost(post: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    console.log('Ajout du post:', post);
    return this.http.post<any>(`${this.apiUrl}/createPost`, post, { headers });
  }

  getUserById(id: number): Observable<User> {
    const headers = this.authService.getAuthHeaders();

    return this.http.get<User>(`${this.apiUrlUser}/getUserById/${id}`, { headers });
  }

  updatePost(postId: number, updatedPost: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    console.log("updatedPost",updatedPost);
    
    return this.http.put<any>(`${this.apiUrl}/updatePost/${postId}`, updatedPost, {headers});
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

  getLikesCount(postId: number): Observable<number> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<number>(`${this.apiUrl}/${postId}/likes-count`, { headers });
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
  getUserlist(id: number): Observable<User[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<User[]>(`${this.apiUrl}/${id}/like-users`,{ headers });
  }
}