export type PostType = 'question' | 'story';
export type Category = 'General' | 'Behavior' | 'School' | 'Sleep' | 'Emotions' | 'Teens';
export type PostStatus = 'approved' | 'pending' | 'rejected';

export interface Comment {
  id: number;
  text: string;
  author: string;
}

export interface Post {
  id: number;
  type: PostType;
  category: Category;
  content: string;
  author: string;
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  timestamp: string;
  status: PostStatus;
}
