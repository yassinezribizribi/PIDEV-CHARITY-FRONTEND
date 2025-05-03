import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { User } from './Animal.service';
import { AuthService } from './auth.service';

export interface Post {
  idPosts?: number;
  content: string;
  creationDate?: Date;
  likesCount?: number; // Toujours optionnel après suppression
  shareCount?: number;
  isLiked?: boolean;
  actionId?: number;
  likedByUser: boolean; 
}

export interface PostActionDTO {
  typeAction: string;
  posts: { idPosts: number };
}

// Récupérer le token (depuis localStorage ou un service d'authentification)
const token = localStorage.getItem('token');

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // Ajout du token
  })
};

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = 'http://localhost:8089/api/posts';
  private postActionUrl = 'http://localhost:8089/api/postActions';
  private apiUrlUser = 'http://localhost:8089/api/users';
  private apiRecommendationUrl = 'http://localhost:8089/api/recommendations';
  private authService = inject(AuthService);
  
  constructor(private http: HttpClient) {}
  
  getAllPosts(): Observable<Post[]> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.get(`${this.apiUrl}/getAllPosts`, { headers, responseType: 'text' }).pipe(
      tap(response => console.log("Raw response:", response)), // Debugging
      map(response => JSON.parse(response)) // Manually parse JSON
    );
  }

  
  
  toggleLike(postId: number, userId: number): Observable<Post> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<any>(`http://localhost:8089/api/posts/likePost/${postId}/user/${userId}`, {headers});
  }

  likePost(postId: number): Observable<any> {
    const postActionDTO: PostActionDTO = {
      typeAction: 'LIKE',
      posts: { idPosts: postId },
    };
    console.log('Like post:', postId, 'DTO:', postActionDTO);
    return this.http.post<any>(
      `${this.postActionUrl}/createPostAction`,
      postActionDTO
    );
  }

  unlikePost(actionId: number): Observable<string> {
    console.log('Unlike post avec actionId:', actionId);
    return this.http.delete<string>(
      `${this.postActionUrl}/deletePostAction/${actionId}`
    );
  }

  addPost(post: Post): Observable<Post> {
    console.log('Ajout du post:', post);
    return this.http.post<Post>(`${this.apiUrl}/createPost`, post);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrlUser}/getUserById/${id}`);
  }
  
  getUserlist(id: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${id}/like-users`);
  }
  
  deletePost(id: number): Observable<string> {
    console.log('Delete post avec id:', id);
    return this.http.delete(`${this.apiUrl}/deletePost/${id}`, {
      responseType: 'text',
    });
  }

  getLikesCountByPost(): Observable<Map<number, number>> {
    console.log('Requête vers:', `${this.apiUrl}/likes-count`);
    return this.http.get<Map<number, number>>(`${this.apiUrl}/likes-count`);
  }
  
  getRecommendedPosts(userId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiRecommendationUrl}/posts/${userId}`, { headers });
  }

  checkIfLiked(postId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`http://localhost:8089/api/posts/${postId}/liked/${userId}`);
  }
  
}