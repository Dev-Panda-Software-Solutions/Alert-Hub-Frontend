import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuLayoutList, LuLayoutGrid } from 'react-icons/lu';
import TopHeader from '../components/layout/TopHeader';
import ModuleTag from '../components/ui/ModuleTag';
import StatusDot from '../components/ui/StatusDot';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import KanbanBoard from '../components/reminders/KanbanBoard';
import { reminderApi } from '../services/api';
import { useAuth } from '../context/useAuth';
import { formatAmount } from '../utils/currency';
import { getPriority, getEffectivePriority, PRIORITY_CONFIG, PRIORITY_ORDER } from '../utils/priority';
import type { Priority } from '../utils/priority';
import type { Reminder, ReminderModule, Recurrence } from '../types';

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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
            {editing ? 'Edit Reminder' : 'New Reminder'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* BUSINESS plan gate */}
          {form.module === 'BUSINESS' && plan !== 'BUSINESS' && (
            <div className="flex gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50">
              <span className="text-xl shrink-0">🔒</span>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Business module requires the Business plan</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  You&apos;re on the <strong>{plan}</strong> plan. Upgrade to unlock GST, Vendor Payments, Employee Salary, and all Business categories.
                </p>
                <a href="/pricing" className="inline-block mt-2 text-xs font-semibold text-amber-800 dark:text-amber-300 underline underline-offset-2 hover:text-amber-600">
                  View upgrade options →
                </a>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} required className="input" placeholder="e.g. HDFC Credit Card" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Module *</label>
              <select value={form.module} onChange={(e) => { set('module', e.target.value); set('category', CATEGORIES[e.target.value as ReminderModule][0].value); }} className="input">
                {(['BUSINESS', 'FAMILY', 'FINANCE'] as ReminderModule[]).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="input">
                {CATEGORIES[form.module].map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount *</label>
              <input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} required className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date *</label>
              <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} required className="input" />
              {previewCfg && (
                <p className={`mt-1 text-xs font-medium ${previewCfg.text}`}>
                  {previewCfg.emoji} {previewCfg.label} priority
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Recurrence</label>
            <select value={form.recurrence} onChange={(e) => set('recurrence', e.target.value)} className="input">
              <option value="NONE">One-time</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notification Channels</label>
            <div className="flex flex-wrap gap-2">
              {channelOptions.map(({ ch, label, locked }) => (
                <button
                  key={ch} type="button"
                  disabled={locked}
                  onClick={() => !locked && toggleChannel(ch)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Remind me before due date</label>
            <div className="flex flex-wrap gap-2">
              {SCHEDULE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value} type="button"
                  onClick={() => toggleSchedule(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              ⏰ Preferred notification time
              <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="time"
              value={form.sendTime}
              onChange={(e) => set('sendTime', e.target.value)}
              className="input"
            />
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {form.sendTime
                ? `Notifications will be sent at ${form.sendTime} on each scheduled reminder day.`
                : 'Leave blank to use system default times (8:00 AM daily digest, etc.)'}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
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

// ── Main page ──────────────────────────────────────────────────────────────────
const MODULES: (ReminderModule | 'ALL')[] = ['ALL', 'BUSINESS', 'FAMILY', 'FINANCE'];
type ViewMode = 'list' | 'kanban';

const RemindersPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeModule, setActiveModule] = useState<ReminderModule | 'ALL'>('ALL');
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
      const params = activeModule !== 'ALL' ? { module: activeModule } : undefined;
      const data = await reminderApi.list(params);
      setReminders(data.items);
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
  const filtered = reminders.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.category.includes(search.toLowerCase())
  );

  // Priority summary counts (pending only)
  const pending = reminders.filter((r) => !r.completed);
  const priorityCounts = PRIORITY_ORDER.reduce<Record<Priority, number>>((acc, p) => {
    acc[p] = pending.filter((r) => getEffectivePriority(r) === p).length;
    return acc;
  }, { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 });

  return (
    <div className="flex-1 overflow-y-auto">
      <TopHeader title="Reminders" subtitle="Manage all your payment reminders" />

      <div className="p-6 max-w-7xl mx-auto space-y-5">
        {/* Priority Summary Bar */}
        {pending.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRIORITY_ORDER.map((p) => {
              const cfg = PRIORITY_CONFIG[p];
              const count = priorityCounts[p];
              return (
                <div
                  key={p}
                  className={`relative overflow-hidden rounded-xl border px-4 py-3 flex items-center gap-3 ${cfg.bg} ${cfg.border}`}
                >
                  <span className="text-2xl">{cfg.emoji}</span>
                  <div>
                    <p className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</p>
                    <p className={`text-2xl font-bold ${cfg.text}`}>{count}</p>
                  </div>
                  {count > 0 && (
                    <div
                      className="absolute inset-y-0 right-0 w-1.5 rounded-r-xl"
                      style={{ background: cfg.color }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reminders…"
            className="input flex-1"
          />
          {selectedIds.size > 0 && viewMode === 'list' && (
            <button onClick={handleBulkDelete} className="btn whitespace-nowrap bg-red-600 hover:bg-red-700 text-white">
              Delete {selectedIds.size} selected
            </button>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <LuLayoutList className="w-4 h-4" /> List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <LuLayoutGrid className="w-4 h-4" /> Kanban
            </button>
          </div>

          <button onClick={openNew} className="btn btn-primary whitespace-nowrap">+ New Reminder</button>
        </div>

        {/* Module tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MODULES.map((m) => (
            <button
              key={m}
              onClick={() => setActiveModule(m)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeModule === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {m === 'ALL' ? 'All' : m}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" text="Loading reminders…" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-500 dark:text-slate-400">No reminders found</p>
            <button onClick={openNew} className="mt-4 btn btn-primary">Add your first reminder</button>
          </div>
        ) : viewMode === 'kanban' ? (
          <KanbanBoard
            reminders={filtered}
            country={user?.country || 'India'}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onMovePriority={handleMovePriority}
          />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((r) => {
                  const isOverdue = !r.completed && r.dueDate < today;
                  const isSelected = selectedIds.has(r.id);
                  return (
                    <tr key={r.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${r.completed ? 'opacity-60' : ''} ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                      <td className="px-4 py-3 w-8">
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
                        <p className={`font-medium text-slate-800 dark:text-white ${r.completed ? 'line-through' : ''}`}>{r.title}</p>
                        {isOverdue && <span className="text-xs text-red-500">Overdue</span>}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <PriorityBadge reminder={r} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell"><ModuleTag module={r.module} /></td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 hidden lg:table-cell">{r.dueDate}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-white">
                        {formatAmount(r.amount, user?.country || 'India')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(r)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                          <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && <ReminderModal editing={editing} defaultDate={defaultDate} onClose={closeModal} onSaved={onSaved} />}
    </div>
  );
};

export default RemindersPage;
