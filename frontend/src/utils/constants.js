export const REPORT_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  NEEDS_CORRECTION: 'needs_correction',
  APPROVED: 'approved',
};

export const STATUS_COLORS = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  needs_correction: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  approved: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

export const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  needs_correction: 'Needs Correction',
  approved: 'Approved',
};

export const PRIORITIES = ['low', 'medium', 'high', 'critical'];
export const TASK_STATUSES = ['not_started', 'in_progress', 'completed', 'blocked', 'deferred'];
export const TASK_TYPES = [
  'development', 'testing', 'meetings', 'documentation',
  'review', 'planning', 'research', 'other',
];

export const PRIORITY_COLORS = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  critical: 'text-red-600',
};

export const ROLES = {
  TEAM_MEMBER: 'team_member',
  MANAGER: 'manager',
  ADMIN: 'admin',
};