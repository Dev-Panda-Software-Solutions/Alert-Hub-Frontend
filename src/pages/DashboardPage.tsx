import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopHeader from '../components/layout/TopHeader';
import ModuleTag from '../components/ui/ModuleTag';
import StatusDot from '../components/ui/StatusDot';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/useAuth';
import { getCurrencyForCountry } from '../utils/currency';
import { getEffectivePriority, PRIORITY_CONFIG } from '../utils/priority';
import {
  LuBell,
  LuWallet,
  LuTriangleAlert,
  LuCircleCheck,
  LuSend,
  LuPlus,
  LuCalendar,
  LuSparkles,
  LuCrown,
  LuArrowRight
} from 'react-icons/lu';
import type { DashboardStats, Reminder, ChannelsResponse } from '../types';
import reminderEmptySvg from '../assets/reminder-empty.svg';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const currency = getCurrencyForCountry(user?.country || 'India');

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<Reminder[]>([]);
  const [channels, setChannels] = useState<ChannelsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.stats(),
      dashboardApi.upcoming(30),
      dashboardApi.overdue(),
      dashboardApi.channels(),
    ]).then(([s, u, _o, c]) => {
      setStats(s);
      setUpcoming(u.reminders);
      setChannels(c);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner size="lg" text="Loading dashboard…" />
      </div>
    );
  }

  const fmt = (n: number) => `${currency.symbol}${Math.round(n).toLocaleString('en-IN')}`;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950">
      <TopHeader
        title={`Hello, ${user?.name?.split(' ')[0] ?? 'there'} 👋`}
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Reminders',
              value: stats?.total ?? 0,
              Icon: LuBell,
              color: 'text-indigo-600',
              bg: 'bg-indigo-50 dark:bg-indigo-950/40',
              accent: 'kpi-accent-indigo',
              sparklineColor: '#6366F1'
            },
            {
              label: 'Due This Month',
              value: fmt(stats?.monthlyAmount ?? 0),
              Icon: LuWallet,
              color: 'text-blue-600',
              bg: 'bg-blue-50 dark:bg-blue-950/40',
              accent: 'kpi-accent-blue',
              sparklineColor: '#3B82F6'
            },
            {
              label: 'Overdue',
              value: stats?.overdueCount ?? 0,
              Icon: LuTriangleAlert,
              color: 'text-red-500',
              bg: 'bg-red-50 dark:bg-red-950/40',
              valColor: 'text-red-500',
              accent: 'kpi-accent-red',
              sparklineColor: '#EF4444'
            },
            {
              label: 'Completed',
              value: stats?.completed ?? 0,
              Icon: LuCircleCheck,
              color: 'text-emerald-500',
              bg: 'bg-emerald-50 dark:bg-emerald-950/40',
              valColor: 'text-emerald-500',
              accent: 'kpi-accent-emerald',
              sparklineColor: '#10B981'
            },
          ].map((kpi) => (
            <div key={kpi.label} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-5 flex items-center justify-between hover:shadow-md transition-all hover-lift animate-fade-in-up stagger-${['1','2','3','4'][['Total Reminders','Due This Month','Overdue','Completed'].indexOf(kpi.label)] || '1'} ${kpi.accent}`}>
              <div className="flex items-center gap-4">
                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 ${kpi.bg}`} style={{ width: '3.25rem', height: '3.25rem' }}>
                  <kpi.Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-1">{kpi.label}</p>
                  <span className={`text-3xl font-black mt-0.5 block leading-none tracking-tight ${kpi.valColor || 'text-slate-800 dark:text-white'}`}>{kpi.value}</span>
                </div>
              </div>
              <div className="w-20 h-10 shrink-0">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id={`grad-${kpi.label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor={kpi.sparklineColor} stopOpacity="0.65" />
                      <stop offset="100%" stopColor={kpi.sparklineColor} stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,35 C15,30 25,10 40,25 C55,40 70,15 85,28 C90,32 95,20 100,5 L100,40 L0,40 Z"
                    fill={`url(#grad-${kpi.label.replace(/\s+/g, '')})`}
                  />
                  <path
                    d="M0,35 C15,30 25,10 40,25 C55,40 70,15 85,28 C90,32 95,20 100,5"
                    stroke={kpi.sparklineColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0px 3px 4px ${kpi.sparklineColor}80)` }}
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-4">
          {/* Upcoming Section */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                    <LuCalendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="font-bold text-lg text-slate-800 dark:text-white">Upcoming (next 30 days)</h2>
                </div>
                <Link to="/reminders" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline flex items-center gap-1">
                  View all <LuArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {upcoming.length === 0 ? (
                <div className="py-14 flex flex-col items-center justify-center text-center">
                  <div className="w-48 h-44 mb-4 flex items-center justify-center">
                    <img src={reminderEmptySvg} alt="No reminders" className="w-full h-full object-contain hover:scale-105 transition-transform duration-500 drop-shadow-sm" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No upcoming reminders</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">You are all caught up! Great job 🎉</p>
                  <Link to="/reminders" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 px-5 py-2.5 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800/80 transition-all">
                    <LuPlus className="w-4 h-4" /> Create Reminder
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.slice(0, 5).map((r) => {
                    const priority = getEffectivePriority(r);
                    const pcfg = PRIORITY_CONFIG[priority];
                    return (
                      <div key={r.id} className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-all group">
                        <div className={`w-1 self-stretch rounded-full shrink-0 ${r.completed ? 'bg-emerald-400' : new Date(r.dueDate) < new Date(today) ? 'bg-red-400' : 'bg-blue-400'}`} />
                        <StatusDot completed={r.completed} overdue={r.dueDate < today && !r.completed} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{r.title}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">{r.dueDate}</p>
                        </div>
                        <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${pcfg.bg} ${pcfg.text}`}>
                          {pcfg.emoji} {pcfg.label}
                        </span>
                        <ModuleTag module={r.module} />
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap pl-2">
                          {fmt(r.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Channels + AI Insights */}
          <div className="space-y-6">
            {/* Notification Channels */}
            {channels && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
                      <LuSend className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Notification Channels</h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Active</span>
                </div>
                <div className="space-y-1">
                  {(Object.entries(channels) as [string, { enabled: boolean; locked: boolean }][]).map(([ch, status]) => {
                    const CHANNEL_STYLE: Record<string, { icon: string; color: string; bg: string }> = {
                      push: { icon: '🔔', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30' },
                      email: { icon: '✉️', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
                      whatsapp: { icon: '💬', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
                      sms: { icon: '📱', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
                    };
                    const cs = CHANNEL_STYLE[ch] ?? { icon: '📣', color: 'text-slate-500', bg: 'bg-slate-100' };
                    return (
                      <div key={ch} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${cs.bg}`}>
                            {cs.icon}
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{ch}</span>
                        </div>
                        {status.locked ? (
                          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-semibold text-xs bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-full">
                            <LuCrown className="w-3.5 h-3.5 text-amber-500" />
                            <span>Upgrade</span>
                          </div>
                        ) : (
                          <div className={`w-10 h-5.5 rounded-full flex items-center p-0.5 transition-colors duration-200 cursor-pointer ${status.enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'}`} style={{ height: '1.375rem', width: '2.5rem' }}>
                            <div className="w-4 h-4 rounded-full bg-white shadow" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {user?.plan === 'FREE' && (
                  <Link to="/pricing" className="mt-5 block text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline">
                    Upgrade to unlock more channels →
                  </Link>
                )}
              </div>
            )}

            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 shadow-md relative overflow-hidden group min-h-[175px] flex flex-col justify-between border-0">
              {/* Star effects */}
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-300/40 via-transparent to-transparent" />

              <div className="absolute top-0 right-0 w-36 h-36 transform translate-x-2 -translate-y-2 opacity-80 group-hover:scale-105 transition-transform duration-500 z-10 pointer-events-none">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
                  <circle cx="100" cy="100" r="70" fill="#818CF8" fillOpacity="0.15" filter="blur(20px)" />
                  <rect x="40" y="60" width="120" height="90" rx="30" fill="url(#botGrad)" />
                  <rect x="25" y="95" width="15" height="20" rx="7.5" fill="#6366F1" />
                  <rect x="160" y="95" width="15" height="20" rx="7.5" fill="#6366F1" />
                  <rect x="55" y="75" width="90" height="60" rx="20" fill="#1E1B4B" />
                  <circle cx="80" cy="105" r="8" fill="#38BDF8" />
                  <circle cx="120" cy="105" r="8" fill="#38BDF8" />
                  <path d="M90 120 Q100 128 110 120" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="170" cy="40" r="4" fill="#A78BFA" />
                  <path d="M20 40 L28 32 L36 40 L28 48 Z" fill="#FCD34D" />
                  <circle cx="40" cy="170" r="3" fill="#60A5FA" />
                  <defs>
                    <linearGradient id="botGrad" x1="40" y1="60" x2="160" y2="150" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#818CF8" />
                      <stop offset="1" stopColor="#4F46E5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="relative z-10 w-2/3">
                <div className="flex items-center gap-2 mb-2">
                  <LuSparkles className="w-4.5 h-4.5 text-indigo-300" />
                  <h3 className="font-bold text-white text-lg">AI Insights</h3>
                </div>
                <p className="text-xs text-indigo-200/90 leading-relaxed mb-5">
                  Get intelligent analysis of your finances, overdue alerts, and spending patterns.
                </p>
                <Link to="/insights" className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl backdrop-blur-md transition-all border border-white/10">
                  View insights <LuArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Add Reminder',
              desc: 'Create a new reminder',
              to: '/reminders',
              Icon: LuBell,
              bg: 'bg-purple-50 dark:bg-purple-950/40',
              color: 'text-purple-600 dark:text-purple-400'
            },
            {
              title: 'Calendar View',
              desc: 'See all reminders in calendar',
              to: '/calendar',
              Icon: LuCalendar,
              bg: 'bg-blue-50 dark:bg-blue-950/40',
              color: 'text-blue-600 dark:text-blue-400'
            },
            {
              title: 'AI Summary',
              desc: 'Get smart insights instantly',
              to: '/insights',
              Icon: LuSparkles,
              bg: 'bg-indigo-50 dark:bg-indigo-950/40',
              color: 'text-indigo-600 dark:text-indigo-400'
            },
            {
              title: 'Upgrade Plan',
              desc: 'Unlock premium features',
              to: '/pricing',
              Icon: LuCrown,
              bg: 'bg-amber-50 dark:bg-amber-950/40',
              color: 'text-amber-600 dark:text-amber-400'
            }
          ].map((act) => (
            <Link key={act.title} to={act.to} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${act.bg}`}>
                  <act.Icon className={`w-5.5 h-5.5 ${act.color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{act.title}</p>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">{act.desc}</p>
                </div>
              </div>
              <LuArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
