import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  LuLayoutList, LuLayoutGrid, LuSearch, LuMic, LuFilter, 
  LuBell, LuCalendar, LuClock, LuCircleCheck,
  LuBriefcase, LuUsers,
  LuScanLine, LuRefreshCw, LuPlus, LuCalendarPlus, LuChevronDown
} from 'react-icons/lu';
import TopHeader from '../components/layout/TopHeader';
import ModuleTag from '../components/ui/ModuleTag';
import StatusDot from '../components/ui/StatusDot';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import KanbanBoard from '../components/reminders/KanbanBoard';
import { reminderApi } from '../services/api';
import { useAuth } from '../context/useAuth';
import { formatAmount } from '../utils/currency';
import { getPriority, getEffectivePriority, PRIORITY_CONFIG } from '../utils/priority';
import type { Priority } from '../utils/priority';
import type { Reminder, ReminderModule, Recurrence } from '../types';
import emptyRemindersSvg from '../assets/dashboard-empty.svg';

// ── Category map ──────────────────────────────────────────────────────────────
const CATEGORIES: Record<ReminderModule, { value: string; label: string }[]> = {
  BUSINESS: [
    { value: 'gst', label: 'GST' },
    { value: 'vendor_payment', label: 'Vendor Payments' },
    { value: 'customer_invoice', label: 'Customer Invoice' },
    { value: 'employee_salary', label: 'Employee Salary' },
    { value: 'office_rent', label: 'Office Rent' },
    { value: 'professional_tax', label: 'Professional Tax' },
    { value: 'tds', label: 'TDS' },
    { value: 'license_renewal', label: 'License Renewal' },
    { value: 'amc_renewal', label: 'AMC Renewal' },
  ],
  FAMILY: [
    { value: 'electricity', label: 'Electricity Bill' },
    { value: 'water', label: 'Water Bill' },
    { value: 'gas', label: 'Gas Booking' },
    { value: 'mobile', label: 'Mobile Recharge' },
    { value: 'broadband', label: 'Broadband' },
    { value: 'ott', label: 'OTT Subscription' },
    { value: 'school_fees', label: 'School Fees' },
    { value: 'property_tax', label: 'Property Tax' },
    { value: 'passport', label: 'Passport Renewal' },
    { value: 'vehicle_service', label: 'Vehicle Service' },
  ],
  FINANCE: [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'emi', label: 'EMI' },
    { value: 'home_loan', label: 'Home Loan' },
    { value: 'personal_loan', label: 'Personal Loan' },
    { value: 'lic', label: 'LIC Premium' },
    { value: 'health_insurance', label: 'Health Insurance' },
    { value: 'car_insurance', label: 'Car Insurance' },
    { value: 'sip', label: 'SIP' },
    { value: 'fixed_deposit', label: 'Fixed Deposit' },
    { value: 'income_tax', label: 'Income Tax' },
  ],
};

const SCHEDULE_OPTIONS = [
  { value: 0, label: 'Same day' },
  { value: 1, label: '1 day before' },
  { value: 3, label: '3 days before' },
  { value: 7, label: '7 days before' },
  { value: 15, label: '15 days before' },
  { value: 30, label: '30 days before' },
];

const EMPTY_FORM = {
  title: '', module: 'FINANCE' as ReminderModule, category: 'credit_card',
  amount: '', dueDate: '', recurrence: 'NONE' as Recurrence,
  channels: [] as string[], schedule: [] as number[], sendTime: '',
};

// ── Priority Badge ────────────────────────────────────────────────────────────
const PriorityBadge: React.FC<{ reminder: Reminder }> = ({ reminder }) => {
  const p = getEffectivePriority(reminder);
  const cfg = PRIORITY_CONFIG[p];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
};

// ── Modal ──────────────────────────────────────────────────────────────────────
interface ModalProps {
  editing: Reminder | null;
  defaultDate?: string;
  onClose: () => void;
  onSaved: () => void;
}

// ── Custom Dropdown for Mobile Responsiveness ──────────────────────────────
interface CustomSelectProps {
  value: string;
  onChange: (val: any) => void;
  options: { value: string; label: string }[];
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, className }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const clickAway = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', clickAway);
    return () => document.removeEventListener('mousedown', clickAway);
  }, []);

  const selectedOpt = options.find(o => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${className} flex items-center justify-between cursor-pointer w-full text-left bg-slate-50 dark:bg-slate-800`}
      >
        <span className="truncate">{selectedOpt?.label}</span>
        <LuChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 animate-fade-in-up">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                o.value === value
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ReminderModal: React.FC<ModalProps> = ({ editing, defaultDate, onClose, onSaved }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title, module: editing.module, category: editing.category,
        amount: String(editing.amount), dueDate: editing.dueDate,
        recurrence: editing.recurrence, channels: editing.channels,
        schedule: editing.schedule || [], sendTime: editing.sendTime || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setForm({ ...EMPTY_FORM, dueDate: defaultDate || today });
    }
  }, [editing, defaultDate]);

  const set = (key: string, val: unknown) => setForm((p) => ({ ...p, [key]: val }));

  const toggleChannel = (ch: string) => {
    setForm((p) => ({
      ...p,
      channels: p.channels.includes(ch) ? p.channels.filter((c) => c !== ch) : [...p.channels, ch],
    }));
  };

  const toggleSchedule = (day: number) => {
    setForm((p) => ({
      ...p,
      schedule: p.schedule.includes(day) ? p.schedule.filter((d) => d !== day) : [...p.schedule, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.dueDate) {
      toast('Please fill all required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount), sendTime: form.sendTime || null };
      if (editing) {
        await reminderApi.update(editing.id, payload);
        toast('Reminder updated', 'success');
      } else {
        await reminderApi.create(payload);
        toast('Reminder created', 'success');
      }
      onSaved();
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const plan = user?.plan || 'FREE';
  const channelOptions = [
    { ch: 'push', label: '🔔 Push', locked: false },
    { ch: 'email', label: '📧 Email', locked: plan === 'FREE' },
    { ch: 'whatsapp', label: '💬 WhatsApp', locked: plan === 'FREE' },
    { ch: 'sms', label: '📱 SMS', locked: plan === 'FREE' || plan === 'PERSONAL' },
  ];

  const previewPriority = form.dueDate ? getPriority(form.dueDate, false) : null;
  const previewCfg = previewPriority ? PRIORITY_CONFIG[previewPriority] : null;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">
            {editing ? 'Edit Reminder' : 'New Reminder'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl p-1">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {form.module === 'BUSINESS' && plan !== 'BUSINESS' && (
            <div className="flex gap-3 p-3 sm:p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50">
              <span className="text-xl shrink-0">🔒</span>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300">Business module requires the Business plan</p>
                <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  You&apos;re on the <strong>{plan}</strong> plan. Upgrade to unlock GST, Vendor Payments, Employee Salary, and all Business categories.
                </p>
                <a href="/pricing" className="inline-block mt-2 text-[10px] sm:text-xs font-semibold text-amber-800 dark:text-amber-300 underline underline-offset-2 hover:text-amber-600">
                  View upgrade options →
                </a>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} required className="input text-base sm:text-sm" placeholder="e.g. HDFC Credit Card" />
          </div>

          {/* Module + Category — stacks on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Module *</label>
              <CustomSelect
                value={form.module === 'BUSINESS' ? 'BUSINESS' : 'PERSONAL_FAMILY'}
                onChange={(val) => {
                  if (val === 'BUSINESS') {
                    setForm(p => ({
                      ...p,
                      module: 'BUSINESS',
                      category: CATEGORIES.BUSINESS[0].value,
                    }));
                  } else {
                    setForm(p => ({
                      ...p,
                      module: 'FINANCE',
                      category: CATEGORIES.FINANCE[0].value,
                    }));
                  }
                }}
                options={[
                  { value: 'BUSINESS', label: 'Business' },
                  { value: 'PERSONAL_FAMILY', label: 'Personal & Family' }
                ]}
                className="input text-base sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
              <CustomSelect
                value={form.category}
                onChange={(cat) => {
                  let mod: ReminderModule = 'FINANCE';
                  if (CATEGORIES.BUSINESS.some(c => c.value === cat)) {
                    mod = 'BUSINESS';
                  } else if (CATEGORIES.FAMILY.some(c => c.value === cat)) {
                    mod = 'FAMILY';
                  }
                  setForm(p => ({
                    ...p,
                    module: mod,
                    category: cat,
                  }));
                }}
                options={form.module === 'BUSINESS' ? CATEGORIES.BUSINESS : [...CATEGORIES.FAMILY, ...CATEGORIES.FINANCE]}
                className="input text-base sm:text-sm"
              />
            </div>
          </div>

          {/* Amount + Date — stacks on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount *</label>
              <input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} required className="input text-base sm:text-sm" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date *</label>
              <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} required className="input text-base sm:text-sm" />
              {previewCfg && (
                <p className={`mt-1 text-xs font-medium ${previewCfg.text}`}>
                  {previewCfg.emoji} {previewCfg.label} priority
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Recurrence</label>
            <CustomSelect
              value={form.recurrence}
              onChange={(val) => set('recurrence', val)}
              options={[
                { value: 'NONE', label: 'One-time' },
                { value: 'MONTHLY', label: 'Monthly' },
                { value: 'YEARLY', label: 'Yearly' },
              ]}
              className="input text-base sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notification Channels</label>
            <div className="flex flex-wrap gap-2">
              {channelOptions.map(({ ch, label, locked }) => (
                <button
                  key={ch} type="button"
                  disabled={locked}
                  onClick={() => !locked && toggleChannel(ch)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    form.channels.includes(ch)
                      ? 'bg-blue-600 text-white'
                      : locked
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {label}{locked ? ' 🔒' : ''}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Remind me before due date</label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {SCHEDULE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value} type="button"
                  onClick={() => toggleSchedule(value)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-colors ${
                    form.schedule.includes(value)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              ⏰ Preferred notification time
              <span className="ml-1 text-[10px] sm:text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="time"
              value={form.sendTime}
              onChange={(e) => set('sendTime', e.target.value)}
              className="input text-base sm:text-sm"
            />
            <p className="mt-1 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">
              {form.sendTime
                ? `Notifications will be sent at ${form.sendTime} on each scheduled reminder day.`
                : 'Leave blank to use system default times (8:00 AM daily digest, etc.)'}
            </p>
          </div>

          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-slate-900 pb-2">
            <button type="button" onClick={onClose} className="flex-1 btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn btn-primary disabled:opacity-60">
              {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Components for new UI ──────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, Icon, iconBg, iconColor, accent }: any) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-3 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4 relative overflow-hidden hover-lift animate-fade-in-up ${accent ?? ''}`}>
    <div className={`w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`} style={{width:undefined,height:undefined}}>
      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
    </div>
    <div className="flex-1 z-10">
      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">{title}</p>
      <p className="text-xl sm:text-3xl font-extrabold text-slate-800 dark:text-white leading-none tracking-tight mb-0.5 sm:mb-1">{value}</p>
      <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium hidden sm:block">{subtitle}</p>
    </div>
    <svg className="absolute bottom-0 right-0 w-20 sm:w-24 h-12 sm:h-16 opacity-[0.07] text-slate-400 dark:text-slate-600" viewBox="0 0 100 50" preserveAspectRatio="none" fill="currentColor">
      <path d="M0 50 Q 25 25 50 50 T 100 50 L 100 100 L 0 100 Z" />
    </svg>
  </div>
);

const QuickAction = ({ title, desc, Icon, bg, color }: any) => (
  <button className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 hover:shadow-md transition-shadow text-left group">
    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${bg}`}>
      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
    </div>
    <div>
      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white leading-tight">{title}</p>
      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 hidden sm:block">{desc}</p>
    </div>
  </button>
);

// ── Mobile Reminder Card ──────────────────────────────────────────────────────
const MobileReminderCard: React.FC<{
  reminder: Reminder;
  country: string;
  onEdit: (r: Reminder) => void;
  onDelete: (id: string) => void;
  onToggle: (r: Reminder) => void;
}> = ({ reminder: r, country, onEdit, onDelete, onToggle }) => {
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = !r.completed && r.dueDate < today;
  const priority = getEffectivePriority(r);
  const pcfg = PRIORITY_CONFIG[priority];

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-3 shadow-sm transition-all ${r.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-2.5">
        <button onClick={() => onToggle(r)} className="mt-0.5 shrink-0">
          <StatusDot completed={r.completed} overdue={isOverdue} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold text-slate-800 dark:text-white leading-tight ${r.completed ? 'line-through' : ''}`}>{r.title}</p>
            <span className="text-sm font-bold text-slate-800 dark:text-white whitespace-nowrap">
              {formatAmount(r.amount, country)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${pcfg.bg} ${pcfg.text}`}>
              {pcfg.emoji} {pcfg.label}
            </span>
            <ModuleTag module={r.module} />
            <span className={`text-[10px] font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
              {isOverdue ? '⚠️ ' : '📅 '}{r.dueDate}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
            <button onClick={() => onEdit(r)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Edit</button>
            <button onClick={() => onDelete(r.id)} className="text-xs font-semibold text-red-500">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
};


// ── Main page ──────────────────────────────────────────────────────────────────
const MODULES = [
  { id: 'ALL', label: 'All', icon: <LuLayoutGrid className="w-4 h-4" /> },
  { id: 'BUSINESS', label: 'Business', icon: <LuBriefcase className="w-4 h-4" /> },
  { id: 'PERSONAL_FAMILY', label: 'Personal & Family', icon: <LuUsers className="w-4 h-4" /> },
];
type ViewMode = 'list' | 'kanban';

const RemindersPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeModule, setActiveModule] = useState<'ALL' | 'BUSINESS' | 'PERSONAL_FAMILY'>('ALL');
  const [viewMode, setViewMode]   = useState<ViewMode>('list');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Reminder | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>();
  const [search, setSearch]       = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const didHandleParam = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = (activeModule !== 'ALL' && activeModule !== 'PERSONAL_FAMILY')
        ? { module: activeModule }
        : undefined;
      const data = await reminderApi.list(params);
      if (activeModule === 'PERSONAL_FAMILY') {
        setReminders(data.items.filter((item) => item.module === 'FAMILY' || item.module === 'FINANCE'));
      } else {
        setReminders(data.items);
      }
    } finally {
      setLoading(false);
    }
  }, [activeModule]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (didHandleParam.current) return;
    const dateParam = searchParams.get('date');
    if (dateParam) {
      didHandleParam.current = true;
      setDefaultDate(dateParam);
      setEditing(null);
      setShowModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleToggle = async (r: Reminder) => {
    try {
      const updated = await reminderApi.toggle(r.id);
      setReminders((prev) => prev.map((x) => x.id === r.id ? updated : x));
    } catch {
      toast('Failed to update', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reminder?')) return;
    try {
      await reminderApi.delete(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast('Reminder deleted', 'success');
    } catch {
      toast('Failed to delete', 'error');
    }
  };

  const handleMovePriority = async (reminder: Reminder, newPriority: Priority) => {
    try {
      const updated = await reminderApi.update(reminder.id, { priority: newPriority });
      setReminders((prev) => prev.map((r) => r.id === reminder.id ? updated : r));
      toast(`Moved to ${PRIORITY_CONFIG[newPriority].label}`, 'success');
    } catch {
      toast('Failed to move reminder', 'error');
    }
  };

  const openNew    = () => { setEditing(null); setDefaultDate(undefined); setShowModal(true); };
  const openEdit   = (r: Reminder) => { setEditing(r); setDefaultDate(undefined); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); setDefaultDate(undefined); };
  const onSaved    = () => { closeModal(); load(); };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.size || !confirm(`Delete ${selectedIds.size} reminder(s)?`)) return;
    try {
      await reminderApi.bulkDelete([...selectedIds]);
      setSelectedIds(new Set());
      load();
      toast(`${selectedIds.size} reminder(s) deleted`, 'success');
    } catch {
      toast('Bulk delete failed', 'error');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const next7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const activeCount = reminders.filter(r => !r.completed).length;
  const dueTodayCount = reminders.filter(r => !r.completed && r.dueDate === today).length;
  const upcomingCount = reminders.filter(r => !r.completed && r.dueDate > today && r.dueDate <= next7Days).length;
  const completedCount = reminders.filter(r => r.completed).length;

  const filtered = reminders.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.category.includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950">
      <TopHeader title="Reminders" subtitle="Manage all your payment reminders" />

      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Search & Actions Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
          <div className="flex items-center w-full sm:w-auto flex-1 max-w-2xl gap-2 sm:gap-3">
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reminders..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
              />
              <button className="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors">
                <LuMic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
            
            <button className="p-2 sm:p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors shadow-sm shrink-0">
              <LuFilter className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          
          <button onClick={openNew} className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2 sm:py-2.5 px-5 sm:px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
            <LuPlus className="w-4 h-4 sm:w-5 sm:h-5" /> New Reminder
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <StatCard title="Active Reminders" value={activeCount}   subtitle="Stay on track!"    Icon={LuBell}        iconBg="bg-purple-100 dark:bg-purple-900/40" iconColor="text-purple-600 dark:text-purple-400" accent="kpi-accent-purple stagger-1" />
          <StatCard title="Due Today"        value={dueTodayCount} subtitle="No payments today" Icon={LuCalendar}    iconBg="bg-blue-100 dark:bg-blue-900/40"   iconColor="text-blue-600 dark:text-blue-400"   accent="kpi-accent-blue stagger-2" />
          <StatCard title="Upcoming"         value={upcomingCount} subtitle="Next 7 days"       Icon={LuClock}      iconBg="bg-orange-100 dark:bg-orange-900/40" iconColor="text-orange-600 dark:text-orange-400" accent="kpi-accent-orange stagger-3" />
          <StatCard title="Completed"        value={completedCount}subtitle="All done!"         Icon={LuCircleCheck} iconBg="bg-emerald-100 dark:bg-emerald-900/40" iconColor="text-emerald-600 dark:text-emerald-400" accent="kpi-accent-emerald stagger-4" />
        </div>

        {/* Module Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id as any)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
                activeModule === m.id
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-indigo-200'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 border border-slate-100 dark:border-slate-800'
              }`}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800/80 min-h-[300px] sm:min-h-[400px] flex flex-col relative animate-fade-in-up stagger-5">
          
          {loading ? (
             <div className="flex-1 flex justify-center items-center"><LoadingSpinner size="lg" text="Loading reminders…" /></div>
          ) : filtered.length === 0 ? (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 sm:py-10">
              <div className="mb-4 sm:mb-6 relative">
                 <img src={emptyRemindersSvg} alt="No reminders" className="w-40 h-36 sm:w-56 sm:h-48 object-contain hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-2">You don't have any reminders yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 max-w-sm px-4">Add your first reminder and never miss a payment again.</p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
                <button onClick={openNew} className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
                  <LuPlus className="w-4 h-4 sm:w-5 sm:h-5" /> Create your first reminder
                </button>
                <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm">
                  <LuCalendarPlus className="w-4 h-4 sm:w-5 sm:h-5" /> Import from Calendar
                </button>
              </div>
            </div>
          ) : (
             <div className="flex-1 flex flex-col">
                <div className="mb-3 sm:mb-4 flex justify-between items-center">
                  <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">All Reminders</h3>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 sm:p-1 shrink-0">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <LuLayoutList className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">List</span>
                    </button>
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        viewMode === 'kanban'
                          ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      <LuLayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Kanban</span>
                    </button>
                  </div>
                </div>
                
                {selectedIds.size > 0 && viewMode === 'list' && (
                  <div className="mb-3 sm:mb-4">
                    <button onClick={handleBulkDelete} className="btn text-xs sm:text-sm whitespace-nowrap bg-red-600 hover:bg-red-700 text-white py-1.5">
                      Delete {selectedIds.size} selected
                    </button>
                  </div>
                )}
                
                {viewMode === 'kanban' ? (
                  <KanbanBoard
                    reminders={filtered}
                    country={user?.country || 'India'}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    onMovePriority={handleMovePriority}
                  />
                ) : (
                  <>
                    {/* Mobile: Card layout */}
                    <div className="sm:hidden space-y-2">
                      {filtered.map((r) => (
                        <MobileReminderCard
                          key={r.id}
                          reminder={r}
                          country={user?.country || 'India'}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                          onToggle={handleToggle}
                        />
                      ))}
                    </div>

                    {/* Desktop: Table layout */}
                    <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="px-4 py-3 w-8">
                              <input
                                type="checkbox"
                                checked={filtered.length > 0 && selectedIds.size === filtered.length}
                                onChange={() => setSelectedIds(
                                  selectedIds.size === filtered.length ? new Set() : new Set(filtered.map((r) => r.id))
                                )}
                                className="rounded border-slate-300 dark:border-slate-600"
                              />
                            </th>
                            <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Title</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden sm:table-cell">Priority</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden md:table-cell">Module</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-400 hidden lg:table-cell">Due Date</th>
                            <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Amount</th>
                            <th className="text-right px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                          {filtered.map((r) => {
                            const isOverdue = !r.completed && r.dueDate < today;
                            const isSelected = selectedIds.has(r.id);
                            return (
                              <tr key={r.id} className={`hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 transition-colors ${r.completed ? 'opacity-60' : ''} ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''} group`}>
                                <td className="px-4 py-3.5 w-8">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(r.id)}
                                    className="rounded border-slate-300 dark:border-slate-600"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <button onClick={() => handleToggle(r)} title="Toggle complete">
                                    <StatusDot completed={r.completed} overdue={isOverdue} />
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <p className={`font-semibold text-slate-800 dark:text-white ${r.completed ? 'line-through' : ''}`}>{r.title}</p>
                                  {isOverdue && <span className="text-xs text-red-500 font-medium">Overdue</span>}
                                </td>
                                <td className="px-4 py-3 hidden sm:table-cell">
                                  <PriorityBadge reminder={r} />
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell"><ModuleTag module={r.module} /></td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden lg:table-cell">{r.dueDate}</td>
                                <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-white">
                                  {formatAmount(r.amount, user?.country || 'India')}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-3">
                                    <button onClick={() => openEdit(r)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(r.id)} className="text-xs font-semibold text-red-500 hover:underline">Delete</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
             </div>
          )}
        </div>

        {/* Quick Actions (always visible at bottom) */}
        <div className="mt-4 sm:mt-8 mb-4">
           <h3 className="font-bold text-slate-800 dark:text-white text-base sm:text-lg mb-1">Quick Actions</h3>
           <p className="text-[10px] sm:text-xs text-slate-500 mb-3 sm:mb-4">Create reminders faster with smart tools</p>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
             <QuickAction title="Scan Bill" desc="Extract details" Icon={LuScanLine} bg="bg-emerald-50 dark:bg-emerald-900/30" color="text-emerald-600 dark:text-emerald-400" />
             <QuickAction title="Voice Reminder" desc="Speak & create" Icon={LuMic} bg="bg-purple-50 dark:bg-purple-900/30" color="text-purple-600 dark:text-purple-400" />
             <QuickAction title="Calendar Sync" desc="Connect calendar" Icon={LuCalendar} bg="bg-orange-50 dark:bg-orange-900/30" color="text-orange-600 dark:text-orange-400" />
             <QuickAction title="Recurring Reminder" desc="Set auto reminders" Icon={LuRefreshCw} bg="bg-blue-50 dark:bg-blue-900/30" color="text-blue-600 dark:text-blue-400" />
           </div>
        </div>
      </div>

      {showModal && <ReminderModal editing={editing} defaultDate={defaultDate} onClose={closeModal} onSaved={onSaved} />}
    </div>
  );
};

export default RemindersPage;
