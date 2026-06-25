// ─── Domain types ─────────────────────────────────────────────────────────────

export type Plan = 'FREE' | 'PERSONAL' | 'FAMILY' | 'BUSINESS';
export type ReminderModule = 'BUSINESS' | 'FAMILY' | 'FINANCE';
export type Recurrence = 'NONE' | 'MONTHLY' | 'YEARLY';
export type NotificationChannel = 'push' | 'email' | 'whatsapp' | 'sms';

export interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  plan: Plan;
  simBalance: number;
  avatarUrl: string | null;
  whatsApp?: string | null;
  sandbox?: boolean;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  module: ReminderModule;
  category: string;
  amount: number;
  dueDate: string;           // "YYYY-MM-DD"
  recurrence: Recurrence;
  schedule: number[];
  channels: NotificationChannel[];
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  overdueCount: number;
  monthlyAmount: number;
}

export interface ChannelStatus {
  enabled: boolean;
  locked: boolean;
}

export interface ChannelsResponse {
  push: ChannelStatus;
  email: ChannelStatus;
  whatsapp: ChannelStatus;
  sms: ChannelStatus;
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export type CalendarDays = Record<string, Reminder[]>;

export interface CalendarMonthResponse {
  year: number;
  month: number;
  days: CalendarDays;
}

// ─── AI Insights ──────────────────────────────────────────────────────────────

export type InsightSeverity = 'info' | 'warning' | 'critical' | 'success';
export type InsightType = 'weekly_outflow' | 'liquidity_alert' | 'overdue' | 'date_conflict' | 'subscription_audit' | 'all_clear';

export interface Insight {
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  body: string;
  affectedIds: string[];
}

export interface CashflowPoint {
  date: string;
  outflow: number;
  paid: number;
}

// ─── Auth context ─────────────────────────────────────────────────────────────

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, country: string) => Promise<void>;
  loginSandbox: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateLocalUser: (updates: Partial<User>) => void;
}
