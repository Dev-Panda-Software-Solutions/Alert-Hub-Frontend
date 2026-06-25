export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export const PRIORITY_CONFIG: Record<Priority, {
  label: string; emoji: string; color: string;
  bg: string; text: string; border: string; glow: string;
}> = {
  CRITICAL: {
    label: 'Critical', emoji: '🔴', color: '#ef4444',
    bg: 'bg-red-50 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-300 dark:border-red-700',
    glow: 'shadow-red-200 dark:shadow-red-900/50',
  },
  HIGH: {
    label: 'High', emoji: '🟠', color: '#f97316',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-300 dark:border-orange-700',
    glow: 'shadow-orange-200 dark:shadow-orange-900/50',
  },
  MEDIUM: {
    label: 'Medium', emoji: '🟡', color: '#eab308',
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-300 dark:border-yellow-700',
    glow: 'shadow-yellow-200 dark:shadow-yellow-900/50',
  },
  LOW: {
    label: 'Low', emoji: '🟢', color: '#22c55e',
    bg: 'bg-green-50 dark:bg-green-950/40',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-300 dark:border-green-700',
    glow: 'shadow-green-200 dark:shadow-green-900/50',
  },
};

export const PRIORITY_ORDER: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export function getPriority(dueDate: string, completed: boolean): Priority {
  if (completed) return 'LOW';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const days = Math.floor((due.getTime() - now.getTime()) / 86_400_000);
  if (days <= 1) return 'CRITICAL';
  if (days <= 2) return 'HIGH';
  if (days <= 5) return 'MEDIUM';
  return 'LOW';
}

/** Returns the effective priority — respects manual override stored on the reminder. */
export function getEffectivePriority(r: { dueDate: string; completed: boolean; priority?: string | null }): Priority {
  if (!r.completed && r.priority && r.priority in PRIORITY_CONFIG) return r.priority as Priority;
  return getPriority(r.dueDate, r.completed);
}

/** Returns a due date string matching the priority boundary */
export function getDueDateForPriority(priority: Priority): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const offsets: Record<Priority, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 3, LOW: 8 };
  d.setDate(d.getDate() + offsets[priority]);
  return d.toISOString().split('T')[0];
}
