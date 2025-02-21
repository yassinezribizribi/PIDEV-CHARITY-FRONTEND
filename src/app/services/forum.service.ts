import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ForumCategory, ForumTopic, ForumPost } from '../interfaces/forum.interface';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private categoriesSubject = new BehaviorSubject<ForumCategory[]>([]);
  private topicsSubject = new BehaviorSubject<ForumTopic[]>([]);
  private postsSubject = new BehaviorSubject<ForumPost[]>([]);

  categories$ = this.categoriesSubject.asObservable();
  topics$ = this.topicsSubject.asObservable();
  posts$ = this.postsSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    // Load initial categories
    const categories: ForumCategory[] = [
      {
        id: 'jobs',
        name: 'Job Opportunities',
        description: 'Find and discuss job opportunities',
        icon: 'uil-briefcase',
        type: 'jobs',
        totalTopics: 150,
        totalPosts: 450
      },
      {
        id: 'general',
        name: 'General Discussion',
        description: 'General topics and community discussions',
        icon: 'uil-comments',
        type: 'general',
        totalTopics: 200,
        totalPosts: 800
      }
    ];

    this.categoriesSubject.next(categories);
  }

  getCategories(): Observable<ForumCategory[]> {
    return this.categories$;
  }

  getTopicsByCategory(categoryId: string): Observable<ForumTopic[]> {
    return new Observable(subscriber => {
      const topics = this.topicsSubject.value.filter(
        topic => topic.categoryId === categoryId
      );
      subscriber.next(topics);
      subscriber.complete();
    });
  }

  getPostsByTopic(topicId: string): Observable<ForumPost[]> {
    return new Observable(subscriber => {
      const posts = this.postsSubject.value.filter(
        post => post.topicId === topicId
      );
      subscriber.next(posts);
      subscriber.complete();
    });
  }

  createTopic(topic: Partial<ForumTopic>): Promise<ForumTopic> {
    const newTopic: ForumTopic = {
      id: 'topic-' + Date.now(),
      views: 0,
      likes: 0,
      isPinned: false,
      isLocked: false,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...topic
    } as ForumTopic;

    const currentTopics = this.topicsSubject.value;
    this.topicsSubject.next([...currentTopics, newTopic]);

    return Promise.resolve(newTopic);
  }

  createPost(post: Partial<ForumPost>): Promise<ForumPost> {
    const newPost: ForumPost = {
      id: 'post-' + Date.now(),
      likes: 0,
      isAnswer: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...post
    } as ForumPost;

    const currentPosts = this.postsSubject.value;
    this.postsSubject.next([...currentPosts, newPost]);

    return Promise.resolve(newPost);
  }

  updateTopic(id: string, data: Partial<ForumTopic>): Promise<ForumTopic> {
    const currentTopics = this.topicsSubject.value;
    const index = currentTopics.findIndex(t => t.id === id);
    
    if (index === -1) {
      return Promise.reject('Topic not found');
    }

    const updated = { ...currentTopics[index], ...data, updatedAt: new Date() };
    currentTopics[index] = updated;
    this.topicsSubject.next(currentTopics);

    return Promise.resolve(updated);
  }

  updatePost(id: string, data: Partial<ForumPost>): Promise<ForumPost> {
    const currentPosts = this.postsSubject.value;
    const index = currentPosts.findIndex(p => p.id === id);
    
    if (index === -1) {
      return Promise.reject('Post not found');
    }

    const updated = { ...currentPosts[index], ...data, updatedAt: new Date() };
    currentPosts[index] = updated;
    this.postsSubject.next(currentPosts);

    return Promise.resolve(updated);
  }
}

export default ForumService; 