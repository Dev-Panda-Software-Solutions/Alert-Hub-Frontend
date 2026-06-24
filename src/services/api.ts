import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config/api.config';
import type {
  User, Reminder, DashboardStats, ChannelsResponse,
  CalendarMonthResponse, Insight, CashflowPoint,
} from '../types';

// ─── Axios instance ───────────────────────────────────────────────────────────

const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      const hadToken = Boolean(localStorage.getItem('authToken'));
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      /* Only redirect to /login if the user WAS authenticated — not on public page 401s */
      if (hadToken) window.location.href = '/login';
    }
    const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export function setAuthToken(token: string) {
  localStorage.setItem('authToken', token);
  http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearAuthToken() {
  localStorage.removeItem('authToken');
  delete http.defaults.headers.common['Authorization'];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { name: string; email: string; password: string; country: string }) =>
    http.post<{ token: string; user: User }>('/auth/register', data).then((r) => r.data),

  login: (email: string, password: string) =>
    http.post<{ token: string; user: User }>('/auth/login', { email, password }).then((r) => r.data),

  sandbox: () =>
    http.post<{ token: string; user: User }>('/auth/sandbox').then((r) => r.data),

  me: () =>
    http.get<User>('/auth/me').then((r) => r.data),
};

// ─── User ─────────────────────────────────────────────────────────────────────

export const userApi = {
  getProfile: () =>
    http.get<User>('/user/profile').then((r) => r.data),

  updateProfile: (data: { name?: string; country?: string }) =>
    http.put('/user/profile', data).then((r) => r.data),

  updatePlan: (plan: string) =>
    http.put('/user/plan', { plan }).then((r) => r.data),

  updateSimBalance: (simBalance: number) =>
    http.put('/user/sim-balance', { simBalance }).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return http.post<{ avatarUrl: string }>('/user/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  getCountries: () =>
    http.get<{ countries: string[] }>('/user/countries').then((r) => r.data),
};

// ─── Reminders ────────────────────────────────────────────────────────────────

export type ReminderListQuery = {
  module?: string;
  completed?: boolean;
  page?: number;
  limit?: number;
};

export type ReminderPayload = {
  title: string;
  module: string;
  category: string;
  amount: number;
  dueDate: string;
  recurrence?: string;
  schedule?: number[];
  channels?: string[];
};

export const reminderApi = {
  list: (params?: ReminderListQuery) =>
    http.get<{ total: number; page: number; limit: number; items: Reminder[] }>('/reminders', { params }).then((r) => r.data),

  get: (id: string) =>
    http.get<Reminder>(`/reminders/${id}`).then((r) => r.data),

  create: (data: ReminderPayload) =>
    http.post<Reminder>('/reminders', data).then((r) => r.data),

  update: (id: string, data: Partial<ReminderPayload>) =>
    http.put<Reminder>(`/reminders/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    http.delete(`/reminders/${id}`).then((r) => r.data),

  toggle: (id: string) =>
    http.patch<Reminder>(`/reminders/${id}/toggle`).then((r) => r.data),

  bulkDelete: (ids: string[]) =>
    http.delete('/reminders/bulk', { data: { ids } }).then((r) => r.data),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  stats: () =>
    http.get<DashboardStats>('/dashboard/stats').then((r) => r.data),

  today: () =>
    http.get<{ reminders: Reminder[] }>('/dashboard/today').then((r) => r.data),

  upcoming: (days = 30) =>
    http.get<{ reminders: Reminder[] }>('/dashboard/upcoming', { params: { days } }).then((r) => r.data),

  overdue: () =>
    http.get<{ reminders: Reminder[] }>('/dashboard/overdue').then((r) => r.data),

  channels: () =>
    http.get<ChannelsResponse>('/dashboard/channels').then((r) => r.data),
};

// ─── Calendar ─────────────────────────────────────────────────────────────────

export const calendarApi = {
  month: (year: number, month: number) =>
    http.get<CalendarMonthResponse>('/calendar/month', { params: { year, month } }).then((r) => r.data),

  day: (date: string) =>
    http.get<{ date: string; reminders: Reminder[] }>('/calendar/day', { params: { date } }).then((r) => r.data),
};

// ─── AI Insights ──────────────────────────────────────────────────────────────

export const insightsApi = {
  getInsights: () =>
    http.get<{ insights: Insight[] }>('/insights').then((r) => r.data),

  getCashflow: () =>
    http.get<{ points: CashflowPoint[] }>('/insights/cashflow').then((r) => r.data),

  query: (question: string) =>
    http.post<{ question: string; answer: string }>('/insights/query', { question }).then((r) => r.data),
};
