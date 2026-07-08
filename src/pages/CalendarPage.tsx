import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LuChevronLeft, LuChevronRight, LuCalendarDays, LuPlus,
  LuCreditCard, LuCalendar, LuUpload
} from 'react-icons/lu';
import TopHeader from '../components/layout/TopHeader';
import ModuleTag from '../components/ui/ModuleTag';
import StatusDot from '../components/ui/StatusDot';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { calendarApi } from '../services/api';
import { useAuth } from '../context/useAuth';
import { formatAmount } from '../utils/currency';
import type { CalendarDays, Reminder } from '../types';
import calendarEmptySvg from '../assets/calendar-empty.svg';

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
  { color: 'bg-blue-300',   label: 'Today' },
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

  const cells: { day: number; isCurrentMonth: boolean }[] = [];
  
  // Previous month padding
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isCurrentMonth: true });
  }
  
  // Next month padding
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay++, isCurrentMonth: false });
  }

  const totalMonth = Object.values(calDays)
    .flat()
    .filter((r) => !r.completed)
    .reduce((s, r) => s + (r.amount ?? 0), 0);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950">
      <TopHeader title="Calendar" subtitle={`${MONTH_NAMES[month - 1]} ${year} — payment schedule`} />

      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        
        {/* 2 Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm relative overflow-hidden kpi-accent-indigo hover-lift animate-fade-in-up stagger-1">
             <div className="w-13 h-13 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center shrink-0" style={{width:'3.25rem',height:'3.25rem'}}>
               <LuCreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
             </div>
             <div className="z-10">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">This month pending</p>
               <p className="text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tight mb-1">{formatAmount(totalMonth, user?.country || 'India')}</p>
               <p className="text-[10px] text-slate-400 font-medium">Total amount due</p>
             </div>
             <svg className="absolute -bottom-4 -right-4 w-28 h-28 text-indigo-50 dark:text-indigo-900/20 opacity-70" viewBox="0 0 100 100" fill="currentColor">
               <circle cx="50" cy="50" r="50" />
             </svg>
           </div>
           
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm relative overflow-hidden kpi-accent-blue hover-lift animate-fade-in-up stagger-2">
             <div className="w-13 h-13 rounded-2xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0" style={{width:'3.25rem',height:'3.25rem'}}>
               <LuCalendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
             </div>
             <div className="z-10">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Days with reminders</p>
               <p className="text-3xl font-black text-slate-800 dark:text-white leading-none tracking-tight mb-1">{Object.keys(calDays).length}</p>
               <p className="text-[10px] text-slate-400 font-medium">Active days this month</p>
             </div>
             <svg className="absolute -bottom-4 -right-4 w-28 h-28 text-blue-50 dark:text-blue-900/20 opacity-70" viewBox="0 0 100 100" fill="currentColor">
               <circle cx="50" cy="50" r="50" />
             </svg>
           </div>
        </div>

        {/* Main Grid: Left Calendar (col-span-2) + Right Sidebar (col-span-1) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* LEFT: Calendar Grid */}
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm animate-fade-in-left stagger-3" style={{boxShadow:'0 2px 16px rgba(99,102,241,0.07), 0 1px 4px rgba(0,0,0,0.04)'}}>
            
            {/* Calendar Header Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all shadow-sm shrink-0">
                <LuChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{MONTH_NAMES[month - 1]}</h2>
                <p className="text-sm text-slate-400 font-semibold">{year}</p>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all shadow-sm">
                  <LuChevronRight className="w-5 h-5" />
                </button>
                <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); }} className="px-4 py-2 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md gap-2 hover:shadow-lg hover:-translate-y-0.5">
                  <LuCalendar className="w-4 h-4" /> Today
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 mb-3">
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="text-center text-[10px] font-black text-slate-400 dark:text-slate-500 pb-3 tracking-widest uppercase">{d}</div>
              ))}
            </div>

            {/* Grid Cells */}
            {loading ? (
              <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
            ) : (
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {cells.map((cell, idx) => {
                  const { day, isCurrentMonth } = cell;
                  const dateStr  = isCurrentMonth ? `${year}-${pad(month)}-${pad(day)}` : '';
                  const dayItems = isCurrentMonth ? (calDays[dateStr] || []) : [];
                  const isToday  = isCurrentMonth && dateStr === todayStr;
                  const isSelected = isCurrentMonth && dateStr === selectedDate;
                  const isPast   = isCurrentMonth && dateStr < todayStr;
                  const hasOverdue = isPast && dayItems.some((r) => !r.completed);
                  const dots     = dayItems.length ? [...new Set(dayItems.map((r) => r.module))] : [];

                  return (
                    <button
                      key={idx}
                      disabled={!isCurrentMonth}
                      onClick={() => isCurrentMonth && selectDate(dateStr)}
                      className={[
                        'relative flex flex-col items-center justify-center rounded-2xl text-sm font-bold transition-all duration-200 aspect-square mx-auto w-9 h-9 sm:w-12 sm:h-12',
                        !isCurrentMonth ? 'text-slate-200 dark:text-slate-700 cursor-default' :
                        isSelected  ? 'text-white shadow-lg scale-110 z-10' :
                        isToday     ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400 ring-offset-1' :
                        hasOverdue  ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20' :
                        dayItems.length > 0 ? 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-700 dark:text-slate-300' :
                        'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400',
                      ].join(' ')}
                      style={isSelected ? {background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)', boxShadow: '0 8px 20px rgba(99,102,241,0.35)'} : undefined}
                    >
                      <span className="text-sm">{day}</span>
                      {dots.length > 0 && isCurrentMonth && (
                        <div className="absolute bottom-1 sm:bottom-1.5 flex gap-0.5">
                          {hasOverdue && !isSelected
                            ? <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            : dots.slice(0, 3).map((m) => (
                              <span key={m} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : MODULE_DOT[m]}`} />
                            ))
                          }
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
               {LEGEND.map(({ color, label }) => (
                 <span key={label} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                   <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
                   {label}
                 </span>
               ))}
            </div>

          </div>

          {/* RIGHT: Side Panel */}
          <div className="flex flex-col gap-6 animate-fade-in-right stagger-4">
            
            {/* Upper Card: Details or Empty State */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm min-h-[320px]" style={{boxShadow:'0 2px 16px rgba(99,102,241,0.07), 0 1px 4px rgba(0,0,0,0.04)'}}>
              {selectedDate ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4 gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 mt-1">
                        {loadingDay ? 'Loading…' : `${dayReminders.length} reminder${dayReminders.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/reminders?date=${selectedDate}`)}
                      className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors shrink-0"
                    >
                      <LuPlus className="w-5 h-5" />
                    </button>
                  </div>

                  {dayReminders.length > 0 && (
                    <div className="flex items-center justify-between mb-4 p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/50">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Total Due</span>
                      <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">{formatAmount(dayReminders.reduce((s, r) => s + (r.amount ?? 0), 0), user?.country || 'India')}</span>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto">
                    {loadingDay ? (
                      <div className="flex justify-center py-8"><LoadingSpinner /></div>
                    ) : dayError ? (
                      <p className="text-sm text-red-500 text-center py-8">{dayError}</p>
                    ) : dayReminders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center h-full">
                        <LuCalendarDays className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">No reminders on this day</p>
                        <button onClick={() => navigate(`/reminders?date=${selectedDate}`)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                          Add one →
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayReminders.map((r) => (
                          <div key={r.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover-lift hover:border-indigo-100 dark:hover:border-indigo-800 group animate-fade-in-up" style={{animationDelay: `${0.05}s`}}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate mb-1">{r.title}</p>
                                <ModuleTag module={r.module} />
                              </div>
                              <StatusDot completed={r.completed} dueDate={r.dueDate} />
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-sm font-bold text-slate-800 dark:text-white">
                                {formatAmount(r.amount, user?.country || 'India')}
                              </span>
                              {(r.channels?.length ?? 0) > 0 && (
                                <span className="text-xs font-medium text-slate-400">{r.channels.join(', ')}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Empty State — new premium SVG
                <div className="flex flex-col items-center justify-center text-center py-4 h-full">
                  <div className="mb-4">
                    <img src={calendarEmptySvg} alt="Select a date" className="w-48 h-40 object-contain hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5">No date selected</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                    Select a date from the calendar to view your reminders
                  </p>
                </div>
              )}
            </div>

            {/* Upcoming Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm" style={{boxShadow:'0 2px 16px rgba(99,102,241,0.07)'}}>
              <div className="flex items-center justify-between mb-4 cursor-pointer group">
                 <div className="flex items-center gap-2">
                   <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                     <LuCalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                   </div>
                   <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Upcoming (next 7 days)</h3>
                 </div>
                 <LuChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <div className="bg-[#F8FAFC] dark:bg-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-800/80">
                 <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3">
                   <rect x="8" y="10" width="24" height="20" rx="4" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="2"/>
                   <path d="M14 6 V14 M26 6 V14" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="2" strokeLinecap="round"/>
                   <path d="M8 18 H32" stroke="currentColor" className="text-slate-400 dark:text-slate-500" strokeWidth="2"/>
                 </svg>
                 <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">No upcoming reminders</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400">You're all caught up! 🎉</p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm" style={{boxShadow:'0 2px 16px rgba(99,102,241,0.07)'}}>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Quick Actions</h3>
              
              <div className="flex flex-col gap-2">
                 <button onClick={() => navigate('/reminders')} className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/30 dark:hover:to-blue-900/30 transition-all text-left group border border-indigo-100/50 dark:border-indigo-800/30">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 text-white group-hover:scale-105 transition-transform shadow-md shadow-indigo-500/20">
                      <LuPlus className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Add Reminder</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">Create a new payment reminder</p>
                    </div>
                    <LuChevronRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                 </button>

                 <button className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left group border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400 group-hover:scale-105 transition-transform">
                      <LuUpload className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Import from Calendar</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">Sync your existing events</p>
                    </div>
                    <LuChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                 </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
