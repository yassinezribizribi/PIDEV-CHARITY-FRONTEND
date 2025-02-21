import { JobPosting } from './employment.interface';

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'jobs' | 'general' | 'support' | 'events';
  totalTopics: number;
  totalPosts: number;
}

export interface ForumTopic {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'refugee' | 'employer' | 'mentor' | 'admin';
  };
  jobPosting?: JobPosting; // For job-related topics
  tags: string[];
  views: number;
  likes: number;
  isPinned: boolean;
  isLocked: boolean;
  lastReply?: {
    authorName: string;
    date: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumPost {
  id: string;
  topicId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'refugee' | 'employer' | 'mentor' | 'admin';
  };
  attachments?: {
    type: 'image' | 'document' | 'link';
    url: string;
    name: string;
  }[];
  likes: number;
  isAnswer: boolean;
  parentPostId?: string; // For replies to specific posts
  createdAt: Date;
  updatedAt: Date;
} 