// src/utils/roleUtils.ts

export type UserRole = 'USER' | 'CONTENT_WRITER' | 'CONTENT_LEAD' | 'MODERATOR' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Role hierarchy (higher number = more permissions)
const roleHierarchy: Record<UserRole, number> = {
  USER: 0,
  CONTENT_WRITER: 1,
  CONTENT_LEAD: 2,
  MODERATOR: 2,        // 🆕 Same level as CONTENT_LEAD
  SUPER_ADMIN: 3
};

/**
 * Check if user has at least the specified role
 * @example hasRole('CONTENT_LEAD', 'CONTENT_WRITER') // true
 * @example hasRole('CONTENT_WRITER', 'CONTENT_LEAD') // false
 */
export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Check if user has any of the specified roles
 * @example hasAnyRole('CONTENT_LEAD', ['CONTENT_LEAD', 'SUPER_ADMIN']) // true
 */
export const hasAnyRole = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.some(role => hasRole(userRole, role));
};

/**
 * Get user from localStorage
 * Used throughout admin components to check current user
 */
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * Used in App.tsx to protect admin routes
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const isAdmin = sessionStorage.getItem('isAdminAuthenticated');
  return !!(token && isAdmin);
};

/**
 * Get role display name for UI
 * @example getRoleDisplayName('CONTENT_WRITER') // "Content Writer"
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const displayNames: Record<UserRole, string> = {
    USER: 'User',
    CONTENT_WRITER: 'Content Writer',
    CONTENT_LEAD: 'Content Lead',
    MODERATOR: 'Community Moderator', // 🆕
    SUPER_ADMIN: 'Super Admin'
  };
  return displayNames[role] || role;
};

/**
 * Get role color for UI badges and styling
 * @example getRoleColor('CONTENT_WRITER') // "green"
 * Used with Tailwind classes: bg-green-100, text-green-800, etc.
 */
export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    USER: 'gray',
    CONTENT_WRITER: 'green',
    CONTENT_LEAD: 'blue',
    MODERATOR: 'orange',  // 🆕 Orange for moderators
    SUPER_ADMIN: 'purple'
  };
  return colors[role] || 'gray';
};

/**
 * Get permissions object for a role
 * Returns all permissions the role has access to
 * Used throughout admin components to show/hide features
 */
export const getRolePermissions = (role: UserRole) => {
  return {
    // Article Management
    canCreateArticles: hasRole(role, 'CONTENT_WRITER'),
    canEditOwnArticles: hasRole(role, 'CONTENT_WRITER'),
    canDeleteOwnArticles: hasRole(role, 'CONTENT_WRITER'),
    canSubmitForReview: hasRole(role, 'CONTENT_WRITER'),
    
    // Review & Publishing
    canReviewArticles: hasRole(role, 'CONTENT_LEAD'),
    canPublishArticles: hasRole(role, 'CONTENT_LEAD'),
    canUnpublishArticles: hasRole(role, 'CONTENT_LEAD'),
    canEditAllArticles: hasRole(role, 'CONTENT_LEAD'),
    
    // ParentCircle Moderation (🆕)
    canModerateParentCircle: hasAnyRole(role, ['MODERATOR', 'SUPER_ADMIN']),
    canApproveQuestions: hasAnyRole(role, ['MODERATOR', 'SUPER_ADMIN']),
    canApproveStories: hasAnyRole(role, ['MODERATOR', 'SUPER_ADMIN']),
    canRejectContent: hasAnyRole(role, ['MODERATOR', 'SUPER_ADMIN']),
    canArchiveContent: hasAnyRole(role, ['MODERATOR', 'SUPER_ADMIN']),
    canViewModerationLogs: hasAnyRole(role, ['MODERATOR', 'SUPER_ADMIN']),
    canBulkApprove: hasRole(role, 'SUPER_ADMIN'), // Only super admin for bulk actions
    
    // Admin Functions
    canDeleteAllArticles: hasRole(role, 'SUPER_ADMIN'),
    canManageUsers: hasRole(role, 'SUPER_ADMIN'),
    
    // Access Control
    canAccessAdminPanel: hasRole(role, 'CONTENT_WRITER') || hasRole(role, 'MODERATOR'),
    canAccessReviewQueue: hasRole(role, 'CONTENT_LEAD'),
    canAccessConnectCare: hasRole(role, 'CONTENT_LEAD'),
    canAccessTalkEasyAnalytics: hasRole(role, 'SUPER_ADMIN'),
    canAccessParentCircleModeration: hasAnyRole(role, ['MODERATOR', 'SUPER_ADMIN']), // 🆕
  };
};

/**
 * Check if user can perform a specific action on an article
 * @param userId - Current user's ID
 * @param articleAuthorId - Article author's ID
 * @param userRole - Current user's role
 * @param action - Action to check permission for
 */
export const canPerformAction = (
  userId: string,
  articleAuthorId: string,
  userRole: UserRole,
  action: 'edit' | 'delete' | 'submit' | 'review' | 'publish'
): boolean => {
  const permissions = getRolePermissions(userRole);
  const isOwner = userId === articleAuthorId;

  switch (action) {
    case 'edit':
      return isOwner || permissions.canEditAllArticles;
    case 'delete':
      return (isOwner && permissions.canDeleteOwnArticles) || permissions.canDeleteAllArticles;
    case 'submit':
      return isOwner && permissions.canSubmitForReview;
    case 'review':
      return permissions.canReviewArticles;
    case 'publish':
      return permissions.canPublishArticles;
    default:
      return false;
  }
};

/**
 * Get user's role badge styling
 * Returns Tailwind classes for role badges
 */
export const getRoleBadgeClasses = (role: UserRole): string => {
  const color = getRoleColor(role);
  return `px-3 py-1 bg-${color}-100 text-${color}-800 text-xs font-semibold rounded-full border border-${color}-200`;
};

/**
 * Log user action for audit trail
 * Centralized logging for all user actions
 */
export const logUserAction = (
  action: string,
  details?: Record<string, any>
): void => {
  const user = getCurrentUser();
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  console.log(
    `📝 [${timestamp}] ${user?.name || 'Unknown'} (${user?.role || 'Unknown'}): ${action}`,
    details ? details : ''
  );
};

// 🆕 Helper to check if user is moderator
export const isModerator = (role: UserRole): boolean => {
  return role === 'MODERATOR' || role === 'SUPER_ADMIN';
};

// 🆕 Get role description for tooltips
export const getRoleDescription = (role: UserRole): string => {
  const descriptions: Record<UserRole, string> = {
    USER: 'Standard user with public access',
    CONTENT_WRITER: 'Can create and manage own articles',
    CONTENT_LEAD: 'Can review, approve, and publish articles',
    MODERATOR: 'Can moderate ParentCircle community content',
    SUPER_ADMIN: 'Full system access and control'
  };
  return descriptions[role] || '';
};