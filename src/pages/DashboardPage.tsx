import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopHeader from '../components/layout/TopHeader';
import ModuleTag from '../components/ui/ModuleTag';
import StatusDot from '../components/ui/StatusDot';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/useAuth';
import { getCurrencyForCountry } from '../utils/currency';
import type { DashboardStats, Reminder, ChannelsResponse } from '../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const currency = getCurrencyForCountry(user?.country || 'India');

  const [stats, setStats]       = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<Reminder[]>([]);
  const [overdue, setOverdue]   = useState<Reminder[]>([]);
  const [channels, setChannels] = useState<ChannelsResponse | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      dashboardApi.upcoming(30),
      dashboardApi.overdue(),
      dashboardApi.channels(),
    ]).then(([s, u, o, c]) => {
      setStats(s);
      setUpcoming(u.reminders);
      setOverdue(o.reminders);
      setChannels(c);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard…" />
      </div>
    );
  }

  const fmt = (n: number) => `${currency.symbol}${Math.round(n).toLocaleString('en-IN')}`;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex-1 overflow-y-auto">
      <TopHeader
        title={`Hello, ${user?.name?.split(' ')[0] ?? 'there'} 👋`}
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Reminders', value: stats?.total ?? 0, icon: '🔔', color: 'text-blue-600' },
            { label: 'Due This Month', value: fmt(stats?.monthlyAmount ?? 0), icon: '💳', color: 'text-purple-600' },
            { label: 'Overdue', value: stats?.overdueCount ?? 0, icon: '⚠️', color: 'text-red-600' },
            { label: 'Completed', value: stats?.completed ?? 0, icon: '✅', color: 'text-emerald-600' },
          ].map((kpi) => (
            <div key={kpi.label} className="card p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-2xl">{kpi.icon}</span>
                <span className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming reminders */}
          <div className="lg:col-span-2 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 dark:text-white">Upcoming (next 30 days)</h2>
              <Link to="/reminders" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
            </div>

            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No upcoming reminders</p>
            ) : (
              <div className="space-y-2">
                {upcoming.slice(0, 8).map((r) => (
                  <div key={r.id} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <StatusDot completed={r.completed} overdue={r.dueDate < today && !r.completed} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{r.title}</p>
                      <p className="text-xs text-slate-400">{r.dueDate}</p>
                    </div>
                    <ModuleTag module={r.module} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {fmt(r.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column: overdue + channels */}
          <div className="space-y-5">
            {/* Overdue */}
            {overdue.length > 0 && (
              <div className="card p-4 border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3">⚠️ Overdue ({overdue.length})</h3>
                <div className="space-y-2">
                  {overdue.slice(0, 5).map((r) => (
                    <div key={r.id} className="flex items-center justify-between">
                      <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{r.title}</p>
                      <span className="text-xs text-red-500 ml-2 whitespace-nowrap">{fmt(r.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notification Channels */}
            {channels && (
              <div className="card p-4">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Notification Channels</h3>
                <div className="space-y-2">
                  {(Object.entries(channels) as [string, { enabled: boolean; locked: boolean }][]).map(([ch, status]) => (
                    <div key={ch} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">{ch}</span>
                      {status.locked ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">🔒 Upgrade</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">Active</span>
                      )}
                    </div>
                  ))}
                </div>
                {user?.plan === 'FREE' && (
                  <Link to="/pricing" className="mt-3 block text-center text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Upgrade to unlock more channels →
                  </Link>
                )}
              </div>
            )}

            {/* AI Insights teaser */}
            <div className="card p-4 bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">✨</span>
                <h3 className="font-semibold text-slate-800 dark:text-white">AI Insights</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Get intelligent analysis of your finances, overdue alerts, and spending patterns.</p>
              <Link to="/insights" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                View insights →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
