/**
 * ============================================
 * PARENTCIRCLE TYPE DEFINITIONS
 * ============================================
 * @version     2.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 09:46:02 UTC
 * @description Updated with likeCount, viewCount, and all missing fields
 * ============================================
 */

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: 'QUESTION' | 'STORY' | 'BOTH';
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  name: string;
  role: string;
  email?: string;
}

export interface Question {
  id: number;
  title?: string;
  content: string;
  slug?: string;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    slug: string;
    color?: string;
    icon?: string;
  };
  author?: Author;
  authorName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  viewCount: number; // ✅ Changed from 'views' to match backend
  helpfulCount: number;
  notHelpfulCount?: number; // ✅ Added
  isPinned: boolean;
  isFeatured: boolean;
  isAnonymous?: boolean; // ✅ Added
  tags: string[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string; // ✅ Added
  createdBy?: string; // ✅ Added
  _count?: {
    votes?: number;
    answers?: number;
    reports?: number; // ✅ Added for moderation
  };
}

export interface Story {
  id: number;
  title?: string;
  content: string;
  slug?: string;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
    color?: string;
    icon?: string;
  };
  author?: Author;
  authorName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  viewCount: number; // ✅ Changed from 'views' to match backend
  likeCount: number; // ✅ Changed from 'likesCount' to match backend
  isFeatured: boolean;
  isAnonymous?: boolean; // ✅ Added
  tags: string[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string; // ✅ Added
  createdBy?: string; // ✅ Added
  _count?: {
    likes?: number; // ✅ Changed from 'votes'
    comments?: number;
    reports?: number; // ✅ Added for moderation
  };
}

export interface Answer {
  id: number;
  content: string;
  questionId: number;
  question?: {
    id: number;
    title?: string;
    slug?: string;
    content?: string; // ✅ Added
  };
  author: Author;
  isVerified: boolean;
  isAccepted: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string; // ✅ Added
}

export interface Comment {
  id: number;
  content: string;
  storyId: number;
  story?: {
    id: number;
    title?: string;
    slug?: string;
  }; // ✅ Added
  author?: Author;
  authorName: string;
  isAnonymous?: boolean; // ✅ Added
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string; // ✅ Added
  rejectedAt?: string; // ✅ Added
  createdBy?: string; // ✅ Added
}

export interface PaginationMeta {
  current: number;
  totalPages: number;
  total: number;
  hasMore?: boolean;
  limit?: number; // ✅ Added
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string; // ✅ Added
}

export interface QuestionsResponse {
  questions: Question[];
  pagination: PaginationMeta;
  breakdown?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  }; // ✅ Added
}

export interface StoriesResponse {
  stories: Story[];
  pagination: PaginationMeta;
  breakdown?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  }; // ✅ Added
}

export interface AnswersResponse {
  answers: Answer[];
  total?: number; // ✅ Added
  breakdown?: {
    professional: number;
    community: number;
  }; // ✅ Added
  pagination?: PaginationMeta;
  professionalAnswers?: Answer[]; // ✅ Added
  communityAnswers?: Answer[]; // ✅ Added
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: PaginationMeta;
  total?: number; // ✅ Added
}

export interface AnswerStats {
  totalAnswers: number; // ✅ Changed from 'total'
  professionalAnswers: number; // ✅ Changed from 'verified'
  communityAnswers: number; // ✅ Changed from 'community'
  hasAcceptedAnswer: boolean; // ✅ Added
  acceptedAnswer?: Answer | null; // ✅ Added
  breakdown?: {
    professionalPercentage: string;
    communityPercentage: string;
  }; // ✅ Added
}

// ============================================
// 🆕 MODERATION TYPES
// ============================================

export type ContentType = 'QUESTION' | 'STORY';
export type ContentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
export type ModerationAction = 'APPROVE' | 'REJECT' | 'ARCHIVE' | 'RESTORE';

export interface PendingContent {
  id: number;
  contentType: ContentType;
  title?: string;
  content: string;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  author?: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
  authorName: string;
  status: ContentStatus;
  tags: string[];
  createdAt: string;
  waitingTime: number;
  _count: {
    answers?: number;
    reports?: number;
    comments?: number;
  };
}

export interface ModerationStats {
  period: string;
  pending: {
    questions: number;
    stories: number;
    total: number;
  };
  approved: {
    questions: number;
    stories: number;
    total: number;
  };
  rejected: {
    questions: number;
    stories: number;
    total: number;
  };
  totalActions: number;
  topModerators: Array<{
    id: string;
    name: string;
    role: string;
    actionsCount: number;
  }>;
  approvalRate: {
    questions: string;
    stories: string;
  };
}

export interface ModerationLog {
  id: number;
  contentType: ContentType;
  contentId: number;
  action: ModerationAction;
  previousStatus: ContentStatus;
  newStatus: ContentStatus;
  moderatorId: string;
  moderator: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  reason?: string;
  notes?: string;
  createdAt: string;
  question?: {
    id: number;
    title?: string;
    content: string;
  };
  story?: {
    id: number;
    title?: string;
    content: string;
  };
}

// ============================================
// 🆕 FEED TYPES
// ============================================

export type FeedItem = Question | Story;

export interface FeedFilters {
  categoryId?: number;
  search?: string;
  sortBy?: 'recent' | 'popular' | 'views' | 'oldest';
  tags?: string[];
  status?: ContentStatus;
  isPinned?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

// ============================================
// 🆕 FORM TYPES
// ============================================

export interface CreateQuestionData {
  title?: string;
  content: string;
  categoryId: number;
  tags?: string[];
  isAnonymous?: boolean;
  authorName?: string;
}

export interface CreateStoryData {
  title?: string;
  content: string;
  categoryId?: number;
  tags?: string[];
  isAnonymous?: boolean;
  authorName?: string;
}

export interface CreateAnswerData {
  content: string;
}

export interface CreateCommentData {
  content: string;
  isAnonymous?: boolean;
  authorName?: string;
}

// ============================================
// 🆕 VOTING/INTERACTION TYPES
// ============================================

export interface VoteData {
  isHelpful: boolean;
}

export interface LikeStatusResponse {
  liked: boolean;
  likedAt?: string;
}