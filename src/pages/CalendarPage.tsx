import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuChevronLeft, LuChevronRight, LuCalendarDays, LuPlus } from 'react-icons/lu';
import TopHeader from '../components/layout/TopHeader';
import ModuleTag from '../components/ui/ModuleTag';
import StatusDot from '../components/ui/StatusDot';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { calendarApi } from '../services/api';
import { useAuth } from '../context/useAuth';
import { formatAmount } from '../utils/currency';
import type { CalendarDays, Reminder } from '../types';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const MODULE_DOT: Record<string, string> = {
  BUSINESS: 'bg-amber-400',
  FAMILY:   'bg-purple-400',
  FINANCE:  'bg-emerald-400',
};

const LEGEND = [
  { color: 'bg-amber-400',  label: 'Business' },
  { color: 'bg-purple-400', label: 'Family' },
  { color: 'bg-emerald-400',label: 'Finance' },
  { color: 'bg-red-500',    label: 'Overdue' },
  { color: 'bg-blue-100 dark:bg-blue-900',  label: 'Today' },
  { color: 'bg-blue-600',   label: 'Selected' },
];

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const now = new Date();

  const [year,  setYear]    = useState(now.getFullYear());
  const [month, setMonth]   = useState(now.getMonth() + 1);
  const [calDays, setCalDays]     = useState<CalendarDays>({});
  const [loading, setLoading]     = useState(true);
  const [selectedDate,   setSelectedDate]   = useState<string | null>(null);
  const [dayReminders,   setDayReminders]   = useState<Reminder[]>([]);
  const [loadingDay,     setLoadingDay]     = useState(false);
  const [dayError,       setDayError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setSelectedDate(null);
    setDayReminders([]);
    try {
      const data = await calendarApi.month(year, month);
      setCalDays(data.days);
    } catch {
      setCalDays({});
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };

  const selectDate = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setDayError(null);
    if (calDays[dateStr]) {
      setDayReminders(calDays[dateStr]);
      return;
    }
    setDayReminders([]);
    setLoadingDay(true);
    try {
      const data = await calendarApi.day(dateStr);
      setDayReminders(data.reminders ?? []);
    } catch {
      setDayError('Could not load reminders for this date.');
      setDayReminders([]);
    } finally {
      setLoadingDay(false);
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');
  const firstDay    = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayStr    = now.toISOString().split('T')[0];

  const cells: (number | null)[] = [...Array(firstDay).fill(null)];
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const totalMonth = Object.values(calDays)
    .flat()
    .filter((r) => !r.completed)
    .reduce((s, r) => s + (r.amount ?? 0), 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <TopHeader title="Calendar" subtitle={`${MONTH_NAMES[month - 1]} ${year} — payment schedule`} />

      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="card px-4 py-2.5 flex items-center gap-2.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">This month pending</span>
            <span className="font-bold text-slate-800 dark:text-white">{formatAmount(totalMonth, user?.country || 'India')}</span>
          </div>
          <div className="card px-4 py-2.5 flex items-center gap-2.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">Days with reminders</span>
            <span className="font-bold text-slate-800 dark:text-white">{Object.keys(calDays).length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 card p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                <LuChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{MONTH_NAMES[month - 1]} {year}</h2>
              <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
                <LuChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-1 tracking-wide">{d}</div>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><LoadingSpinner /></div>
            ) : (
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((day, idx) => {
                  if (!day) return <div key={idx} />;
                  const dateStr  = `${year}-${pad(month)}-${pad(day)}`;
                  const dayItems = calDays[dateStr] || [];
                  const isToday  = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;
                  const isPast   = dateStr < todayStr;
                  const hasOverdue = isPast && dayItems.some((r) => !r.completed);
                  const dots     = dayItems.length ? [...new Set(dayItems.map((r) => r.module))] : [];

                  return (
                    <button
                      key={idx}
                      onClick={() => selectDate(dateStr)}
                      className={[
                        'relative flex flex-col items-center rounded-xl text-sm font-medium transition-all duration-150 py-2.5 px-1 min-h-14',
                        isSelected  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' :
                        isToday     ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400 ring-inset' :
                        hasOverdue  ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20' :
                        dayItems.length ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300' :
                        'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-500',
                      ].join(' ')}
                    >
                      <span className="font-semibold">{day}</span>
                      {dots.length > 0 && (
                        <div className="flex gap-0.5 mt-1">
                          {hasOverdue && !isSelected
                            ? <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            : dots.slice(0, 3).map((m) => (
                              <span key={m} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : MODULE_DOT[m]}`} />
                            ))
                          }
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              {LEGEND.map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="card p-5 flex flex-col min-h-96">
            {selectedDate ? (
              <>
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {loadingDay ? 'Loading…' : `${dayReminders.length} reminder${dayReminders.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/reminders?date=${selectedDate}`)}
                    className="btn btn-primary text-xs px-3 py-1.5 shrink-0 flex items-center gap-1"
                  >
                    <LuPlus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                {dayReminders.length > 0 && (
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                    Total: {formatAmount(dayReminders.reduce((s, r) => s + (r.amount ?? 0), 0), user?.country || 'India')}
                  </p>
                )}

                <div className="flex-1 overflow-y-auto">
                  {loadingDay ? (
                    <div className="flex justify-center py-8"><LoadingSpinner /></div>
                  ) : dayError ? (
                    <p className="text-sm text-red-500 text-center py-8">{dayError}</p>
                  ) : dayReminders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <LuCalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
                      <p className="text-sm text-slate-400">No reminders on this day</p>
                      <button onClick={() => navigate(`/reminders?date=${selectedDate}`)} className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        Add one →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayReminders.map((r) => (
                        <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{r.title}</p>
                              <div className="mt-0.5"><ModuleTag module={r.module} /></div>
                            </div>
                            <StatusDot completed={r.completed} dueDate={r.dueDate} />
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                              {formatAmount(r.amount, user?.country || 'India')}
                            </span>
                            {r.channels.length > 0 && (
                              <span className="text-xs text-slate-400">{r.channels.join(', ')}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <LuCalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Select a date</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">to view reminders for that day</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
