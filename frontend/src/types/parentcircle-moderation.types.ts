/**
 * ============================================
 * PARENTCIRCLE MODERATION TYPES
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 09:00:59 UTC
 * ============================================
 */

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