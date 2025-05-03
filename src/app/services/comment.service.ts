import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
export interface Comment {
  idComment: number;
  descriptionComment: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = 'http://localhost:8089/api/comment'; 
  private apiUrlUser = 'http://localhost:8089/api/users';

  constructor(private http: HttpClient) {}

  addComment(postId: number, comment: any,iduser:number): Observable<Comment> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post<Comment>(`${this.apiUrl}/ajouterComment/${postId}/${iduser}`, comment , { headers });
  }
  getUserById(id: number): Observable<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrlUser}/getUserById/${id}`,{headers});
  }

  deleteComment(commentId: number): Observable<void> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.apiUrl}/deleteComment/${commentId}` , { headers,responseType:"text" as "json" });
  }

  updateComment(commentId: number, comment: Comment): Observable<Comment> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return throwError(() => new Error('User is not authenticated.'));
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.put<Comment>(`${this.apiUrl}/updateComment/${commentId}`, comment , { headers });
  }
}
