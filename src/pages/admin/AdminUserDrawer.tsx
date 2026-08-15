import React, { useEffect, useState } from 'react';
import { LuX, LuBell, LuClock, LuTriangleAlert, LuCircleCheck, LuWallet, LuMail, LuGlobe, LuPhone } from 'react-icons/lu';
import { adminApi } from '../../services/adminApi';
import type { AdminUserDetail } from '../../services/adminApi';
import { useToast } from '../../components/ui/Toast';

const PLAN_OPTIONS = ['FREE', 'PERSONAL', 'FAMILY', 'BUSINESS'] as const;
const MODULE_ORDER = ['BUSINESS', 'FAMILY', 'FINANCE'] as const;
const MODULE_TINT: Record<string, string> = {
  BUSINESS: 'bg-amber-500/15 text-amber-400',
  FAMILY:   'bg-violet-500/15 text-violet-400',
  FINANCE:  'bg-emerald-500/15 text-emerald-400',
};

const MiniStat: React.FC<{ label: string; value: number | string; Icon: React.ComponentType<{ className?: string }>; tint: string }> = ({ label, value, Icon, tint }) => (
  <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 flex items-center gap-2.5">
    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${tint}`}><Icon className="w-4 h-4" /></div>
    <div>
      <p className="text-sm font-bold text-white leading-none">{value}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
    </div>
  </div>
);

interface Props {
  userId: string;
  onClose: () => void;
  onChanged: () => void; // parent should refresh its list/stats
}

const AdminUserDrawer: React.FC<Props> = ({ userId, onClose, onChanged }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi.getUser(userId)
      .then((u) => { if (!cancelled) setUser(u); })
      .catch((err) => toast(err instanceof Error ? err.message : 'Failed to load user', 'error'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handlePlanChange = async (plan: string) => {
    try {
      await adminApi.updateUserPlan(userId, plan);
      setUser((prev) => (prev ? { ...prev, plan: plan as AdminUserDetail['plan'] } : prev));
      toast('Plan updated', 'success');
      onChanged();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update plan', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-slate-950 border-l border-slate-800 overflow-y-auto">
        <div className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-sm font-bold text-white">User details</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><LuX className="w-5 h-5" /></button>
        </div>

        {loading || !user ? (
          <div className="p-6 text-center text-slate-500 text-sm">Loading…</div>
        ) : (
          <div className="p-5 space-y-6">
            {/* Identity */}
            <div>
              <h3 className="text-lg font-bold text-white">{user.name}</h3>
              <div className="mt-2 space-y-1.5 text-sm text-slate-400">
                <p className="flex items-center gap-2"><LuMail className="w-3.5 h-3.5 shrink-0" /> {user.email}</p>
                <p className="flex items-center gap-2"><LuGlobe className="w-3.5 h-3.5 shrink-0" /> {user.country}</p>
                {user.whatsApp && <p className="flex items-center gap-2"><LuPhone className="w-3.5 h-3.5 shrink-0" /> {user.whatsApp}</p>}
                <p className="flex items-center gap-2"><LuWallet className="w-3.5 h-3.5 shrink-0" /> Sim balance: ₹{Math.round(user.simBalance).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Plan + trial */}
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Plan</label>
                <select
                  value={user.plan}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {user.trialEndsAt && (
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Trial ends</label>
                  <p className="text-xs text-slate-300 py-1.5">{new Date(user.trialEndsAt).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Joined</label>
                <p className="text-xs text-slate-300 py-1.5">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Reminder stats */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Reminder activity</h4>
              <div className="grid grid-cols-2 gap-2">
                <MiniStat label="Total" value={user.reminderStats.total} Icon={LuBell} tint="bg-sky-500/15 text-sky-400" />
                <MiniStat label="Pending" value={user.reminderStats.pending} Icon={LuClock} tint="bg-violet-500/15 text-violet-400" />
                <MiniStat label="Overdue" value={user.reminderStats.overdue} Icon={LuTriangleAlert} tint="bg-red-500/15 text-red-400" />
                <MiniStat label="Completed" value={user.reminderStats.completed} Icon={LuCircleCheck} tint="bg-teal-500/15 text-teal-400" />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Total amount tracked: <span className="text-white font-semibold">₹{Math.round(user.reminderStats.totalAmount).toLocaleString('en-IN')}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {MODULE_ORDER.map((m) => (
                  <span key={m} className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${MODULE_TINT[m]}`}>
                    {m}: {user.reminderStats.byModule[m]}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent reminders */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Reminders {user.reminders.length > 0 && <span className="text-slate-600">({user.reminders.length})</span>}
              </h4>
              {user.reminders.length === 0 ? (
                <p className="text-sm text-slate-500">No reminders yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {user.reminders.map((r) => (
                    <div key={r.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{r.title}</p>
                        <p className="text-[11px] text-slate-500">{r.category} · {new Date(r.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-300">₹{Math.round(r.amount).toLocaleString('en-IN')}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${r.completed ? 'bg-teal-500/15 text-teal-400' : 'bg-slate-700 text-slate-400'}`}>
                          {r.completed ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserDrawer;
