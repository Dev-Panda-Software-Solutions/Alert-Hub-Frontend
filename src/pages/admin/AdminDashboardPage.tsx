import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuShieldCheck, LuLogOut, LuSearch, LuUsers, LuBell, LuClock, LuTriangleAlert,
  LuCircleCheck, LuTrash2, LuWallet, LuGauge, LuEye,
} from 'react-icons/lu';
import { adminApi, clearAdminToken } from '../../services/adminApi';
import type { AdminStats, AdminUserRow } from '../../services/adminApi';
import { useToast } from '../../components/ui/Toast';
import { BarList, GrowthChart } from './AdminCharts';
import AdminUserDrawer from './AdminUserDrawer';

const PLAN_OPTIONS = ['FREE', 'PERSONAL', 'FAMILY', 'BUSINESS'] as const;
const MODULE_ORDER = ['BUSINESS', 'FAMILY', 'FINANCE'] as const;

const StatCard: React.FC<{ label: string; value: number | string; Icon: React.ComponentType<{ className?: string }>; tint: string }> = ({ label, value, Icon, tint }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tint}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-lg font-bold text-white leading-none">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  </div>
);

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const limit = 20;

  const loadStats = useCallback(async () => {
    try { setStats(await adminApi.stats()); } catch (err) { toast(err instanceof Error ? err.message : 'Failed to load stats', 'error'); }
  }, [toast]);

  const loadUsers = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const data = await adminApi.listUsers({ page: p, limit, search: q || undefined });
      setUsers(data.items);
      setTotal(data.total);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadUsers(page, search); }, [loadUsers, page, search]);

  const handleLogout = () => { clearAdminToken(); navigate('/login'); };

  const handlePlanChange = async (id: string, plan: string) => {
    try {
      await adminApi.updateUserPlan(id, plan);
      toast('Plan updated', 'success');
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, plan: plan as AdminUserRow['plan'] } : u)));
      loadStats();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update plan', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete user "${name}"? This also deletes all their reminders. This cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(id);
      toast('User deleted', 'success');
      if (selectedUserId === id) setSelectedUserId(null);
      loadUsers(page, search);
      loadStats();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete user', 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-slate-950/95 backdrop-blur z-10">
        <div className="flex items-center gap-2.5">
          <LuShieldCheck className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-bold">Alert-Guard Admin</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <LuLogOut className="w-4 h-4" /> Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Top-line stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total users" value={stats?.totalUsers ?? '—'} Icon={LuUsers} tint="bg-indigo-500/15 text-indigo-400" />
          <StatCard label="New (30d)" value={stats?.newUsers30d ?? '—'} Icon={LuUsers} tint="bg-emerald-500/15 text-emerald-400" />
          <StatCard label="Active trials" value={stats?.activeTrials ?? '—'} Icon={LuClock} tint="bg-amber-500/15 text-amber-400" />
          <StatCard label="Avg reminders/user" value={stats?.avgRemindersPerUser ?? '—'} Icon={LuGauge} tint="bg-fuchsia-500/15 text-fuchsia-400" />
          <StatCard label="Total reminders" value={stats?.totalReminders ?? '—'} Icon={LuBell} tint="bg-sky-500/15 text-sky-400" />
          <StatCard label="Pending" value={stats?.pendingReminders ?? '—'} Icon={LuClock} tint="bg-violet-500/15 text-violet-400" />
          <StatCard label="Overdue" value={stats?.overdueReminders ?? '—'} Icon={LuTriangleAlert} tint="bg-red-500/15 text-red-400" />
          <StatCard label="Completed" value={stats?.completedReminders ?? '—'} Icon={LuCircleCheck} tint="bg-teal-500/15 text-teal-400" />
        </div>

        {/* Amount tracked + plan breakdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
            <LuWallet className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-slate-400">Total amount tracked:</span>
            <span className="text-sm font-bold text-white">₹{Math.round(stats?.totalAmountTracked ?? 0).toLocaleString('en-IN')}</span>
          </div>
          {stats && PLAN_OPTIONS.map((p) => (
            <span key={p} className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              {p}: <span className="text-white font-semibold">{stats.byPlan[p]}</span>
            </span>
          ))}
        </div>

        {/* Insights: growth + breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <GrowthChart points={stats?.signupGrowth ?? []} />
          </div>
          <BarList
            title="Reminders by module"
            rows={MODULE_ORDER.map((m) => ({ label: m, count: stats?.byModule[m] ?? 0 }))}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BarList
            title="Top categories"
            rows={(stats?.topCategories ?? []).map((c) => ({ label: c.category, count: c.count }))}
          />
          <BarList
            title="Top countries"
            rows={(stats?.topCountries ?? []).map((c) => ({ label: c.country, count: c.count }))}
          />
        </div>

        {/* Users table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search name or email…"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-500">{total} user{total !== 1 ? 's' : ''}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Plan</th>
                  <th className="px-4 py-2.5 font-medium">Reminders</th>
                  <th className="px-4 py-2.5 font-medium">Trial ends</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                  <th className="px-4 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No users found.</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                    <td className="px-4 py-2.5">
                      <button onClick={() => setSelectedUserId(u.id)} className="font-medium text-white hover:text-indigo-400 transition-colors text-left">
                        {u.name}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <select
                        value={u.plan}
                        onChange={(e) => handlePlanChange(u.id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-md py-1 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">{u.reminderCount}</td>
                    <td className="px-4 py-2.5 text-slate-400">{u.trialEndsAt ? new Date(u.trialEndsAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-2.5 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => setSelectedUserId(u.id)} className="text-slate-500 hover:text-indigo-400 transition-colors" title="View details">
                          <LuEye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(u.id, u.name)} className="text-slate-500 hover:text-red-400 transition-colors" title="Delete user">
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-sm text-slate-400">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded-md bg-slate-800 disabled:opacity-40 hover:bg-slate-700">Prev</button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded-md bg-slate-800 disabled:opacity-40 hover:bg-slate-700">Next</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedUserId && (
        <AdminUserDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onChanged={() => { loadUsers(page, search); loadStats(); }}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
