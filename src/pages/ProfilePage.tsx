import React, { useEffect, useRef, useState } from 'react';
import TopHeader from '../components/layout/TopHeader';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/useAuth';
import { userApi } from '../services/api';
import { formatAmount, countryLabel, sortCountriesForIndia } from '../utils/currency';
import { sendTestPush } from '../services/push';
import type { Plan } from '../types';

const PLAN_BADGE: Record<Plan, string> = {
  FREE:     'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  PERSONAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  FAMILY:   'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
  BUSINESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
};

const ProfilePage: React.FC = () => {
  const { user, updateLocalUser } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [countries, setCountries] = useState<string[]>([]);
  const [name, setName]         = useState(user?.name || '');
  const [country, setCountry]   = useState(user?.country || 'India');
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [testingPush, setTestingPush] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [pushSteps, setPushSteps]   = useState<{
    sw: 'idle'|'ok'|'error';
    perm: 'idle'|'ok'|'denied'|'default';
    sub: 'idle'|'ok'|'error';
    send: 'idle'|'ok'|'error';
  }>({ sw: 'idle', perm: 'idle', sub: 'idle', send: 'idle' });
  const [setupRunning, setSetupRunning] = useState(false);

  useEffect(() => {
    userApi.getCountries().then(({ countries: c }) => setCountries(sortCountriesForIndia(c))).catch(() => {});
  }, []);

  useEffect(() => {
    setName(user?.name || '');
    setCountry(user?.country || 'India');
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast('Name cannot be empty', 'error'); return; }
    setSaving(true);
    try {
      await userApi.updateProfile({ name: name.trim(), country });
      updateLocalUser({ name: name.trim(), country });
      toast('Profile updated', 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to update', 'error');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="flex-1 overflow-y-auto">
      <TopHeader title="Profile" subtitle="Manage your account settings" />

      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* Avatar card */}
        <div className="card p-6 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 text-3xl font-bold shrink-0">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                : user.name.charAt(0).toUpperCase()
              }
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 dark:text-white text-lg truncate">{user.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PLAN_BADGE[user.plan]}`}>
                {user.plan}
              </span>
              <span className="text-xs text-slate-400">{user.country}</span>
            </div>
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading || user.sandbox}
              className="btn btn-secondary text-sm disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Change Photo'}
            </button>
          </div>
        </div>

        {/* Push Notifications Setup */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-1">Push Notifications</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Works in Chrome / Edge even when the tab is closed. Run each step below to diagnose and test.
          </p>

          {/* Step tracker */}
          {(() => {
            const steps = [
              {
                key: 'sw',
                label: 'Service Worker',
                desc: 'Background script that receives pushes',
                status: pushSteps.sw,
              },
              {
                key: 'perm',
                label: 'Notification Permission',
                desc: 'Browser must be allowed to show notifications',
                status: pushSteps.perm === 'ok' ? 'ok' : pushSteps.perm === 'denied' ? 'error' : pushSteps.perm === 'default' ? 'warn' : 'idle',
              },
              {
                key: 'sub',
                label: 'Push Subscription',
                desc: 'Device registered with push server',
                status: pushSteps.sub,
              },
              {
                key: 'send',
                label: 'Test Notification Sent',
                desc: 'Server dispatched push to your device',
                status: pushSteps.send,
              },
            ] as const;

            const DOT: Record<string, string> = {
              idle:  'bg-slate-200 dark:bg-slate-700',
              ok:    'bg-emerald-500',
              error: 'bg-red-500',
              warn:  'bg-amber-400',
            };
            const LABEL: Record<string, string> = {
              idle:  'text-slate-400 dark:text-slate-500',
              ok:    'text-emerald-600 dark:text-emerald-400',
              error: 'text-red-600 dark:text-red-400',
              warn:  'text-amber-600 dark:text-amber-400',
            };
            const STATUS_TEXT: Record<string, string> = {
              idle:  '—',
              ok:    '✓ Done',
              error: '✗ Failed',
              warn:  '⚠ Blocked',
            };

            return (
              <div className="space-y-3 mb-5">
                {steps.map((s) => (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOT[s.status]}`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{s.label}</span>
                      <span className="text-xs text-slate-400 ml-2">{s.desc}</span>
                    </div>
                    <span className={`text-xs font-semibold ${LABEL[s.status]}`}>{STATUS_TEXT[s.status]}</span>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              disabled={testingEmail}
              onClick={async () => {
                setTestingEmail(true);
                const token = localStorage.getItem('authToken') ?? '';
                try {
                  const r = await fetch('http://localhost:3005/api/push/test-email', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  const data = await r.json();
                  if (r.ok) toast(`Test email sent to ${user?.email}! Check your inbox (and spam folder).`, 'success');
                  else toast(data.error || 'Email test failed', 'error');
                } catch {
                  toast('Could not reach server', 'error');
                }
                setTestingEmail(false);
              }}
              className="btn btn-secondary text-sm disabled:opacity-60"
            >
              {testingEmail ? 'Sending…' : '✉️ Send Test Email'}
            </button>

            <button
              disabled={setupRunning}
              onClick={async () => {
                setSetupRunning(true);
                setPushSteps({ sw: 'idle', perm: 'idle', sub: 'idle', send: 'idle' });
                const token = localStorage.getItem('authToken') ?? '';
                const API = (window as any).__VITE_API__ || 'http://localhost:3005';

                /* Step 1 — Service Worker */
                if (!('serviceWorker' in navigator)) {
                  setPushSteps((p) => ({ ...p, sw: 'error' }));
                  toast('Service Workers not supported in this browser', 'error');
                  setSetupRunning(false);
                  return;
                }
                try {
                  await navigator.serviceWorker.register('/sw.js', { scope: '/' });
                  await navigator.serviceWorker.ready;
                  setPushSteps((p) => ({ ...p, sw: 'ok' }));
                } catch {
                  setPushSteps((p) => ({ ...p, sw: 'error' }));
                  toast('Service Worker failed to register', 'error');
                  setSetupRunning(false);
                  return;
                }

                /* Step 2 — Permission */
                const existing = Notification.permission;
                if (existing === 'denied') {
                  setPushSteps((p) => ({ ...p, perm: 'denied' }));
                  toast('Notifications are blocked. Open browser Settings → Site Settings → Notifications → allow localhost', 'error');
                  setSetupRunning(false);
                  return;
                }
                const perm = existing === 'granted' ? 'granted' : await Notification.requestPermission();
                if (perm !== 'granted') {
                  setPushSteps((p) => ({ ...p, perm: 'default' }));
                  toast('Permission not granted — click Allow when prompted', 'warning');
                  setSetupRunning(false);
                  return;
                }
                setPushSteps((p) => ({ ...p, perm: 'ok' }));

                /* Step 3 — Subscribe */
                try {
                  const reg = await navigator.serviceWorker.ready;
                  const keyRes = await fetch(`http://localhost:3005/api/push/vapid-key`, { headers: { Authorization: `Bearer ${token}` } });
                  const { publicKey } = await keyRes.json();

                  let sub = await reg.pushManager.getSubscription();
                  if (!sub) {
                    const raw = publicKey.replace(/-/g, '+').replace(/_/g, '/');
                    const pad = '='.repeat((4 - raw.length % 4) % 4);
                    const bin = atob(raw + pad);
                    const key = Uint8Array.from([...bin].map((c) => c.charCodeAt(0)));
                    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
                  }

                  await fetch(`http://localhost:3005/api/push/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ subscription: sub.toJSON() }),
                  });
                  setPushSteps((p) => ({ ...p, sub: 'ok' }));
                } catch (e) {
                  setPushSteps((p) => ({ ...p, sub: 'error' }));
                  toast('Push subscription failed — check console for details', 'error');
                  setSetupRunning(false);
                  return;
                }

                /* Step 4 — Send test */
                try {
                  const r = await fetch(`http://localhost:3005/api/push/test`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  const data = await r.json();
                  if (data.sent > 0) {
                    setPushSteps((p) => ({ ...p, send: 'ok' }));
                    toast('🔔 Test push sent! You should see a notification now (even if you switch apps)', 'success');
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
              className="btn btn-primary text-sm disabled:opacity-60"
            >
              {setupRunning ? 'Running…' : '🔔 Setup & Test Push Notifications'}
            </button>
          </div>

          {/* Troubleshooting tips */}
          <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-slate-600 dark:text-slate-300">If you don't see the notification:</p>
            <p>1. <strong>Windows:</strong> Start → Settings → System → Notifications → make sure Chrome/Edge is ON</p>
            <p>2. <strong>Chrome:</strong> Address bar → click 🔒 lock icon → Notifications → Allow</p>
            <p>3. <strong>Do Not Disturb:</strong> Windows Focus Assist must be OFF during testing</p>
            <p>4. <strong>Browser in background:</strong> Minimize Chrome/Edge completely, then click Setup &amp; Test again — notification should appear over other apps</p>
            <p>5. <strong>After server restart:</strong> Always re-run Setup &amp; Test (server resets subscriptions on restart)</p>
            <p className="pt-1 font-semibold text-slate-600 dark:text-slate-300">Testing email notifications:</p>
            <p>Create a reminder → select <strong>Email</strong> channel → set schedule to <strong>Same day</strong> → the cron job fires at 8 AM daily and sends the email to <strong>{user?.email}</strong></p>
          </div>
        </div>

        {/* Account info */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Account Info</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Email</dt>
              <dd className="text-slate-800 dark:text-white font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Plan</dt>
              <dd>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PLAN_BADGE[user.plan]}`}>
                  {user.plan}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Simulated Balance</dt>
              <dd className="text-slate-800 dark:text-white font-medium">
                {formatAmount(user.simBalance, user.country)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Edit profile form */}
        {!user.sandbox ? (
          <div className="card p-6">
            <h2 className="font-semibold text-slate-800 dark:text-white mb-4">Edit Profile</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country / Currency</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="input"
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>{countryLabel(c)}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end pt-1">
                <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card p-6 text-center text-slate-400 dark:text-slate-500 text-sm">
            Profile editing is not available in Sandbox mode.
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
