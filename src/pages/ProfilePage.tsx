import React, { useEffect, useRef, useState } from 'react';
import TopHeader from '../components/layout/TopHeader';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/useAuth';
import { userApi } from '../services/api';
import { formatAmount, countryLabel, sortCountriesForIndia } from '../utils/currency';
import { API_BASE_URL, resolveAssetUrl } from '../config/api.config';
import { authApi } from '../services/api';
import type { Plan } from '../types';
import {
  LuUser, LuMail, LuPhone, LuGlobe, LuShield, LuBell,
  LuBadgeCheck, LuWallet, LuCamera,
} from 'react-icons/lu';

const PLAN_BADGE: Record<Plan, string> = {
  FREE:     'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  PERSONAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  FAMILY:   'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
  BUSINESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
};

const PLAN_GRADIENT: Record<Plan, string> = {
  FREE:     'from-slate-500 to-slate-600',
  PERSONAL: 'from-blue-500 to-indigo-600',
  FAMILY:   'from-purple-500 to-violet-600',
  BUSINESS: 'from-amber-500 to-orange-600',
};

const ProfilePage: React.FC = () => {
  const { user, updateLocalUser } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [countries, setCountries] = useState<string[]>([]);
  const [name,     setName]     = useState(user?.name || '');
  const [email,    setEmail]    = useState(user?.email || '');
  const [whatsApp, setWhatsApp] = useState(user?.whatsApp || '');
  const [country,  setCountry]  = useState(user?.country || 'India');
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [pushSteps, setPushSteps] = useState<{
    sw: 'idle'|'ok'|'error';
    perm: 'idle'|'ok'|'denied'|'default';
    sub: 'idle'|'ok'|'error';
    send: 'idle'|'ok'|'error';
  }>({ sw: 'idle', perm: 'idle', sub: 'idle', send: 'idle' });
  const [setupRunning, setSetupRunning] = useState(false);

  const trialActive = Boolean(user?.trialEndsAt && new Date(user.trialEndsAt) > new Date());

  useEffect(() => {
    userApi.getCountries().then(({ countries: c }) => setCountries(sortCountriesForIndia(c))).catch(() => {});
  }, []);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setWhatsApp(user?.whatsApp || '');
    setCountry(user?.country || 'India');
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast('Name cannot be empty', 'error'); return; }
    if (!email.trim()) { toast('Email cannot be empty', 'error'); return; }
    setSaving(true);
    try {
      await userApi.updateProfile({ name: name.trim(), email: email.trim(), whatsApp: whatsApp.trim() || null, country });
      updateLocalUser({ name: name.trim(), email: email.trim(), whatsApp: whatsApp.trim() || null, country });
      toast('Profile updated', 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to update', 'error');
    } finally { setSaving(false); }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { avatarUrl } = await userApi.uploadAvatar(file);
      updateLocalUser({ avatarUrl });
      toast('Avatar updated', 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  if (!user) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>;

  const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <TopHeader title="Profile" subtitle="Manage your account settings" />

      <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto">

        {/* ── Hero identity card ───────────────────────────────────────── */}
        <div className="card overflow-hidden flex flex-col sm:flex-row">
          {/* Left colour accent bar */}
          <div className={`w-full sm:w-2 shrink-0 h-2 sm:h-auto bg-linear-to-b ${PLAN_GRADIENT[user.plan]} rounded-t-2xl sm:rounded-t-none sm:rounded-l-2xl`} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 flex-1 min-w-0">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 rounded-2xl overflow-hidden bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl font-bold shadow-md" style={{ width: '4.5rem', height: '4.5rem' }}>
                {user.avatarUrl
                  ? <img src={resolveAssetUrl(user.avatarUrl)!} alt={user.name} className="w-full h-full object-cover" />
                  : initials}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
              {!user.sandbox && (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow flex items-center justify-center disabled:opacity-50 transition-colors"
                  title="Change photo"
                >
                  <LuCamera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Name + email + badges */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{user.name}</h2>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${PLAN_BADGE[user.plan]}`}>{user.plan}</span>
                {trialActive && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-medium">🎉 Trial Active</span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>

            {/* Stat chips row */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {[
                { label: 'Country',     value: user.country },
                { label: 'Sim Balance', value: formatAmount(user.simBalance, user.country) },
                ...(trialActive && user.trialEndsAt ? [{
                  label: 'Trial Ends',
                  value: new Date(user.trialEndsAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
                  highlight: true,
                }] : []),
              ].map(({ label, value, highlight }) => (
                <div key={label} className={`flex flex-col items-center px-4 py-2 rounded-xl text-center min-w-20 ${highlight ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-800/60'}`}>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">{label}</span>
                  <span className={`text-sm font-bold ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3-column responsive grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">

          {/* ── Col 1: Edit Profile ──────────────────────────────────────── */}
          {!user.sandbox ? (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <LuUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="font-semibold text-slate-800 dark:text-white">Edit Profile</h2>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Display Name</label>
                  <div className="relative">
                    <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                    <input value={name} onChange={(e) => setName(e.target.value)} className="input" style={{ paddingLeft: '2.25rem' }} placeholder="Your name" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" style={{ paddingLeft: '2.25rem' }} placeholder="you@example.com" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">WhatsApp Number</label>
                  <div className="relative">
                    <LuPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                    <input type="tel" value={whatsApp} onChange={(e) => setWhatsApp(e.target.value)} className="input" style={{ paddingLeft: '2.25rem' }} placeholder="+91 98765 43210" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Include country code (e.g. +91 for India)</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Country</label>
                  <div className="relative">
                    <LuGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10" />
                    <select value={country} onChange={(e) => setCountry(e.target.value)} className="input" style={{ paddingLeft: '2.25rem' }}>
                      {countries.map((c) => <option key={c} value={c}>{countryLabel(c)}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={saving} className="w-full btn btn-primary disabled:opacity-60 mt-1">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          ) : (
            <div className="card p-6 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm min-h-40">
              Profile editing not available in Sandbox mode.
            </div>
          )}

          {/* ── Col 2: Account Info + Change Password ────────────────────── */}
          <div className="space-y-5">

            {/* Account Info */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <LuBadgeCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="font-semibold text-slate-800 dark:text-white">Account Info</h2>
              </div>
              <dl className="space-y-3">
                {[
                  { icon: <LuMail className="w-3.5 h-3.5" />, label: 'Email', value: user.email },
                  { icon: <LuGlobe className="w-3.5 h-3.5" />, label: 'Country', value: user.country },
                  { icon: <LuWallet className="w-3.5 h-3.5" />, label: 'Sim Balance', value: formatAmount(user.simBalance, user.country) },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <dt className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="text-slate-400">{icon}</span>{label}
                    </dt>
                    <dd className="text-sm font-medium text-slate-800 dark:text-white">{value}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2">
                  <dt className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <LuBadgeCheck className="w-3.5 h-3.5 text-slate-400" />Plan
                  </dt>
                  <dd>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${PLAN_BADGE[user.plan]}`}>
                      {user.plan}
                    </span>
                  </dd>
                </div>
                {trialActive && user.trialEndsAt && (
                  <div className="mt-2 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      🎉 Free trial expires{' '}
                      <strong>{new Date(user.trialEndsAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                    </p>
                  </div>
                )}
              </dl>
            </div>

            {/* Change Password */}
            {!user.sandbox && <ChangePasswordCard />}
          </div>

          {/* ── Col 3: Push Notifications ────────────────────────────────── */}
          <div className="card p-6 md:col-span-2 xl:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <LuBell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="font-semibold text-slate-800 dark:text-white">Push Notifications</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 ml-10">
              Works in Chrome / Edge even when the tab is closed.
            </p>

            {/* Step tracker */}
            {(() => {
              const steps = [
                { key: 'sw',   label: 'Service Worker',         desc: 'Background script that receives pushes',   status: pushSteps.sw },
                { key: 'perm', label: 'Notification Permission', desc: 'Browser must be allowed to show notifications', status: pushSteps.perm === 'ok' ? 'ok' : pushSteps.perm === 'denied' ? 'error' : pushSteps.perm === 'default' ? 'warn' : 'idle' },
                { key: 'sub',  label: 'Push Subscription',      desc: 'Device registered with push server',       status: pushSteps.sub },
                { key: 'send', label: 'Test Notification Sent', desc: 'Server dispatched push to your device',    status: pushSteps.send },
              ] as const;

              const DOT:         Record<string, string> = { idle: 'bg-slate-200 dark:bg-slate-700', ok: 'bg-emerald-500', error: 'bg-red-500', warn: 'bg-amber-400' };
              const LABEL:       Record<string, string> = { idle: 'text-slate-400', ok: 'text-emerald-600 dark:text-emerald-400', error: 'text-red-500', warn: 'text-amber-500' };
              const STATUS_TEXT: Record<string, string> = { idle: '—', ok: '✓ Done', error: '✗ Failed', warn: '⚠ Blocked' };

              return (
                <div className="space-y-2.5 mb-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
                  {steps.map((s) => (
                    <div key={s.key} className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOT[s.status]}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{s.label}</span>
                        <span className="text-xs text-slate-400 ml-1.5 hidden sm:inline">{s.desc}</span>
                      </div>
                      <span className={`text-xs font-semibold shrink-0 ${LABEL[s.status]}`}>{STATUS_TEXT[s.status]}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mb-5">
              <button
                disabled={testingEmail}
                onClick={async () => {
                  setTestingEmail(true);
                  const token = localStorage.getItem('authToken') ?? '';
                  try {
                    const r = await fetch(`${API_BASE_URL}/push/test-email`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                    const data = await r.json();
                    if (r.ok) toast(`Test email sent to ${user?.email}!`, 'success');
                    else toast(data.error || 'Email test failed', 'error');
                  } catch { toast('Could not reach server', 'error'); }
                  setTestingEmail(false);
                }}
                className="btn btn-secondary text-sm disabled:opacity-60 flex-1"
              >
                {testingEmail ? 'Sending…' : '✉️ Send Test Email'}
              </button>

              <button
                disabled={setupRunning}
                onClick={async () => {
                  setSetupRunning(true);
                  setPushSteps({ sw: 'idle', perm: 'idle', sub: 'idle', send: 'idle' });
                  const token = localStorage.getItem('authToken') ?? '';
                  const API = API_BASE_URL;

                  if (!('serviceWorker' in navigator)) {
                    setPushSteps((p) => ({ ...p, sw: 'error' }));
                    toast('Service Workers not supported in this browser', 'error');
                    setSetupRunning(false); return;
                  }
                  try {
                    await navigator.serviceWorker.register('/sw.js', { scope: '/' });
                    await navigator.serviceWorker.ready;
                    setPushSteps((p) => ({ ...p, sw: 'ok' }));
                  } catch {
                    setPushSteps((p) => ({ ...p, sw: 'error' }));
                    toast('Service Worker failed to register', 'error');
                    setSetupRunning(false); return;
                  }

                  const existing = Notification.permission;
                  if (existing === 'denied') {
                    setPushSteps((p) => ({ ...p, perm: 'denied' }));
                    toast('Notifications are blocked. Open browser Settings → Notifications → Allow', 'error');
                    setSetupRunning(false); return;
                  }
                  const perm = existing === 'granted' ? 'granted' : await Notification.requestPermission();
                  if (perm !== 'granted') {
                    setPushSteps((p) => ({ ...p, perm: 'default' }));
                    toast('Permission not granted — click Allow when prompted', 'warning');
                    setSetupRunning(false); return;
                  }
                  setPushSteps((p) => ({ ...p, perm: 'ok' }));

                  try {
                    const reg = await navigator.serviceWorker.ready;
                    const keyRes = await fetch(`${API}/push/vapid-key`, { headers: { Authorization: `Bearer ${token}` } });
                    const { publicKey } = await keyRes.json();
                    let sub = await reg.pushManager.getSubscription();
                    if (!sub) {
                      const raw = publicKey.replace(/-/g, '+').replace(/_/g, '/');
                      const pad = '='.repeat((4 - raw.length % 4) % 4);
                      const bin = atob(raw + pad);
                      const key = Uint8Array.from([...bin].map((c) => c.charCodeAt(0)));
                      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
                    }
                    await fetch(`${API}/push/subscribe`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ subscription: sub.toJSON() }),
                    });
                    setPushSteps((p) => ({ ...p, sub: 'ok' }));
                  } catch {
                    setPushSteps((p) => ({ ...p, sub: 'error' }));
                    toast('Push subscription failed — check console for details', 'error');
                    setSetupRunning(false); return;
                  }

                  try {
                    const r = await fetch(`${API}/push/test`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                    const data = await r.json();
                    if (data.sent > 0) {
                      setPushSteps((p) => ({ ...p, send: 'ok' }));
                      toast('🔔 Test push sent! You should see a notification now', 'success');
                    } else {
                      setPushSteps((p) => ({ ...p, send: 'error' }));
                      toast('Push was sent but 0 delivered — see tips below', 'warning');
                    }
                  } catch {
                    setPushSteps((p) => ({ ...p, send: 'error' }));
                    toast('Test push request failed', 'error');
                  }
                  setSetupRunning(false);
                }}
                className="btn btn-primary text-sm disabled:opacity-60 flex-1"
              >
                {setupRunning ? 'Running…' : '🔔 Setup & Test Push'}
              </button>
            </div>

          </div>

        </div>

        {/* ── Row 2: Troubleshooting tips — full width ─────────────────── */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Troubleshooting &amp; Tips</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            {[
              ['🪟 Windows',        'Start → Settings → System → Notifications → Chrome/Edge must be ON'],
              ['🌐 Chrome',         'Address bar → 🔒 lock icon → Notifications → Allow'],
              ['🔕 Do Not Disturb', 'Windows Focus Assist must be OFF during testing'],
              ['📱 Background',     'Minimize Chrome/Edge completely, then click Setup & Test again'],
              ['🔄 After restart',  'Always re-run Setup & Test after the server restarts'],
              ['✉️ Testing email',  `Create a reminder → Email channel → cron fires 8 AM daily → sent to ${user?.email}`],
            ].map(([title, detail]) => (
              <div key={title} className="flex items-start gap-2 py-1.5">
                <span className="font-semibold text-slate-600 dark:text-slate-300 shrink-0">{title}:</span>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// ── Change Password Card ──────────────────────────────────────────────────────

const ChangePasswordCard: React.FC = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<'idle' | 'otp-sent' | 'done'>('idle');
  const [otp,      setOtp]      = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await authApi.sendOtp();
      toast(res.message || 'OTP sent to your email', 'success');
      setStep('otp-sent');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to send OTP', 'error');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    if (password !== confirm) { toast('Passwords do not match', 'error'); return; }
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(otp, password);
      toast(res.message || 'Password changed successfully', 'success');
      setStep('done');
      setOtp(''); setPassword(''); setConfirm('');
      setTimeout(() => setStep('idle'), 4000);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Invalid OTP', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
          <LuShield className="w-4 h-4 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">Change Password</h2>
          <p className="text-xs text-slate-400">OTP sent to your email</p>
        </div>
      </div>

      {step === 'done' ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <span className="text-xl">✅</span>
          <div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Password changed!</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Use your new password next sign in.</p>
          </div>
        </div>
      ) : step === 'idle' ? (
        <button onClick={handleSendOtp} disabled={loading} className="w-full btn btn-secondary text-sm disabled:opacity-50">
          {loading ? 'Sending OTP…' : '🔑 Send OTP to My Email'}
        </button>
      ) : (
        <form onSubmit={handleVerify} className="space-y-3">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
            ✉️ Check your email for a 6-digit OTP — expires in 10 minutes.
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">OTP Code</label>
            <input
              type="text" inputMode="numeric" maxLength={6}
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code" required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm tracking-[0.4em] font-mono text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required
                className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm">
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Confirm Password</label>
            <input
              type={showPw ? 'text' : 'password'} value={confirm}
              onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => { setStep('idle'); setOtp(''); setPassword(''); setConfirm(''); }} className="btn btn-secondary text-sm flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading || otp.length < 6 || !password || !confirm} className="btn btn-primary text-sm flex-1 disabled:opacity-50">
              {loading ? 'Verifying…' : 'Change Password'}
            </button>
          </div>
          <button type="button" onClick={handleSendOtp} disabled={loading} className="text-xs text-blue-600 dark:text-blue-400 hover:underline w-full text-center">
            Resend OTP
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
