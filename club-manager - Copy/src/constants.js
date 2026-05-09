// Application constants - single source of truth
export const APP_NAME = 'InnoHub';
export const APP_VERSION = '1.0.0';
export const DATA_VERSION = 3; // Tăng số này khi mockData thay đổi → force reset localStorage

// localStorage keys - unified naming convention
export const STORAGE_KEYS = {
  CURRENT_USER: 'innohub_current_user',
  TASKS: 'innohub_tasks',
  MEMBERS: 'innohub_members',
  DEPARTMENTS: 'innohub_departments',
  EVENTS: 'innohub_events',
  ACTIVITIES: 'innohub_activities',
  THEME: 'innohub_theme',
  LANGUAGE: 'innohub_language',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_ACTIVITIES = 100;
export const MAX_TOASTS = 3;
export const TOAST_ANIMATION_DURATION = 300;

// Task statuses
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'inprogress',
  DONE: 'done',
  ARCHIVED_COMPLETED: 'archived_completed',
  ARCHIVED_INCOMPLETE: 'archived_incomplete',
};

export const TASK_STATUSES = [
  { id: TASK_STATUS.TODO, color: '#9ca3af', emoji: '📌' },
  { id: TASK_STATUS.IN_PROGRESS, color: '#6366f1', emoji: '⚡' },
  { id: TASK_STATUS.DONE, color: '#10b981', emoji: '✅' },
];

// Priority
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const PRIORITY_COLORS = {
  low: '#9ca3af',
  medium: '#f59e0b',
  high: '#6366f1',
  urgent: '#ef4444',
};

export const PRIORITY_LABELS = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  urgent: 'Khẩn cấp',
};

// Roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
};

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Quản trị viên',
  manager: 'Trưởng ban',
  member: 'Thành viên',
};

export const ROLE_BADGE_CLASS = {
  super_admin: 'role-admin',
  admin: 'role-admin',
  manager: 'role-leader',
  member: 'role-member',
};

// Leaderboard badge thresholds
export const BADGE_THRESHOLDS = [
  { min: 800, icon: '💎', label: 'Diamond', color: '#06b6d4' },
  { min: 600, icon: '👑', label: 'Crown', color: '#f59e0b' },
  { min: 400, icon: '🚀', label: 'Rocket', color: '#6366f1' },
  { min: 200, icon: '⭐', label: 'Star', color: '#10b981' },
  { min: 0, icon: '🔥', label: 'Fire', color: '#ef4444' },
];

// Department colors
export const DEPT_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

// Event types
export const EVENT_TYPES = [
  { value: 'meeting', label: 'Họp' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'demo', label: 'Demo Day' },
  { value: 'other', label: 'Khác' },
];

// Validation rules
export const VALIDATION = {
  MEMBER_NAME: { minLength: 2, maxLength: 100 },
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(0|\+84)\d{9,10}$/,
  TASK_TITLE: { minLength: 3, maxLength: 200 },
  TASK_DESCRIPTION: { maxLength: 2000 },
  BIO_MAX_LENGTH: 500,
};
