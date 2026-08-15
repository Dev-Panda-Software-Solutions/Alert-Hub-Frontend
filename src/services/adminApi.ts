import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config/api.config';

// Separate axios instance + token from the regular user session — an admin
// login must never be confused with (or overwritten by) a normal user login.
const ADMIN_TOKEN_KEY = 'adminToken';

const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      const hadToken = Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      if (hadToken) window.location.href = '/admin/login';
    }
    const message = err.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export function isAdminAuthed() {
  return Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  byPlan: Record<'FREE' | 'PERSONAL' | 'FAMILY' | 'BUSINESS', number>;
  activeTrials: number;
  newUsers30d: number;
  totalReminders: number;
  pendingReminders: number;
  overdueReminders: number;
  completedReminders: number;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  country: string;
  plan: 'FREE' | 'PERSONAL' | 'FAMILY' | 'BUSINESS';
  trialEndsAt: string | null;
  createdAt: string;
  simBalance: number;
  reminderCount: number;
}

export interface AdminUserDetail extends Omit<AdminUserRow, 'reminderCount'> {
  reminders: Array<{ id: string; title: string; module: string; category: string; amount: number; dueDate: string; completed: boolean }>;
}

// ─── API ────────────────────────────────────────────────────────────────────

export const adminApi = {
  login: (username: string, password: string) =>
    http.post<{ token: string }>('/admin/login', { username, password }).then((r) => r.data),

  stats: () =>
    http.get<AdminStats>('/admin/stats').then((r) => r.data),

  listUsers: (params?: { search?: string; page?: number; limit?: number }) =>
    http.get<{ total: number; page: number; limit: number; items: AdminUserRow[] }>('/admin/users', { params }).then((r) => r.data),

  getUser: (id: string) =>
    http.get<AdminUserDetail>(`/admin/users/${id}`).then((r) => r.data),

  updateUserPlan: (id: string, plan: string) =>
    http.put<{ message: string; plan: string }>(`/admin/users/${id}/plan`, { plan }).then((r) => r.data),

  deleteUser: (id: string) =>
    http.delete<{ message: string }>(`/admin/users/${id}`).then((r) => r.data),
};
