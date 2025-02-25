import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  idPosts?: number;
  content: string;
  creationDate?: Date;
  likesCount: number;
  shareCount: number;
  isLiked?: boolean;
  actionId?: number;
}

export interface PostActionDTO {
  typeAction: string;
  posts: { idPosts: number };
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8089/api/posts';
  private postActionUrl = 'http://localhost:8089/api/postActions';

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<Post[]> {
    console.log('Requête vers:', `${this.apiUrl}/getAllPosts`);
    return this.http.get<Post[]>(`${this.apiUrl}/getAllPosts`);
  }

  likePost(postId: number): Observable<any> {
    const postActionDTO: PostActionDTO = {
      typeAction: 'LIKE',
      posts: { idPosts: postId }
    };
    console.log('Like post:', postId, 'DTO:', postActionDTO);
    return this.http.post<any>(`${this.postActionUrl}/createPostAction`, postActionDTO);
  }

  unlikePost(actionId: number): Observable<string> {
    console.log('Unlike post avec actionId:', actionId);
    return this.http.delete<string>(`${this.postActionUrl}/deletePostAction/${actionId}`);
  }

  addPost(post: Post): Observable<Post> {
    console.log('Ajout du post:', post);
    return this.http.post<Post>(`${this.apiUrl}/createPost`, post);
  }

  deletePost(id: number): Observable<string> {
    console.log('Delete post avec id:', id);
    return this.http.delete<string>(`${this.apiUrl}/deletePost/${id}`);
  }
}