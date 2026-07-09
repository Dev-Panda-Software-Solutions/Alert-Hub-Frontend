import React, { useEffect, useRef, useState } from 'react';
import TopHeader from '../components/layout/TopHeader';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/useAuth';
import { userApi } from '../services/api';
import { formatAmount, countryLabel, sortCountriesForIndia } from '../utils/currency';
import { API_BASE_URL, resolveAssetUrl } from '../config/api.config';
import { authApi } from '../services/api';

import {
  LuUser, LuMail, LuPhone, LuGlobe, LuShield, LuBell,
  LuBadgeCheck, LuWallet, LuCamera,
} from 'react-icons/lu';



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

      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 max-w-7xl mx-auto">

        {/* ── Hero identity card ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden animate-fade-in-down">
          {/* Subtle mesh gradient overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20" style={{background: 'radial-gradient(ellipse at 0% 0%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 100% 100%, rgba(59,130,246,0.1) 0%, transparent 50%)'}} />
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-md overflow-hidden">
                {user.avatarUrl ? <img src={resolveAssetUrl(user.avatarUrl)!} alt={user.name} className="w-full h-full object-cover" /> : initials}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
              {!user.sandbox && (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-white shadow-sm flex items-center justify-center disabled:opacity-50 transition-colors"
                  title="Change photo"
                >
                  <LuCamera className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex flex-col items-center sm:items-start pt-2">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{user.plan}</span>
                {trialActive && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-medium">🎉 Trial Active</span>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{user.email}</p>
            </div>
          </div>

          {/* Right side stats */}
          <div className="flex items-center gap-4 sm:gap-8 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-8 w-full sm:w-auto justify-center sm:justify-start">
            <div className="flex flex-col items-center sm:items-start">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-1.5 sm:ml-8">Country</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <LuGlobe className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                </div>
                <span className="text-sm sm:text-lg font-bold text-slate-800 dark:text-white">{user.country}</span>
              </div>
            </div>
            <div className="w-px h-12 bg-slate-100 dark:bg-slate-800 hidden sm:block"></div>
            <div className="flex flex-col items-center sm:items-start">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 sm:mb-1.5 sm:ml-8">Sim Balance</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <LuWallet className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                </div>
                <span className="text-sm sm:text-lg font-bold text-slate-800 dark:text-white">{formatAmount(user.simBalance, user.country)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3-column responsive grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">

          {/* ── Col 1: Edit Profile ──────────────────────────────────────── */}
          {!user.sandbox ? (
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in-left stagger-2 hover-lift">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <LuUser className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile</h2>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Display Name</label>
                  <div className="relative">
                    <LuUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" placeholder="Your name" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" placeholder="you@example.com" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">WhatsApp Number</label>
                  <div className="relative">
                    <LuPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input type="tel" value={whatsApp} onChange={(e) => setWhatsApp(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow" placeholder="+91 98765 43210" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Include country code (e.g. +91 for India)</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Country</label>
                  <div className="relative">
                    <LuGlobe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow appearance-none">
                      {countries.map((c) => <option key={c} value={c}>{countryLabel(c)}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all mt-4 disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          ) : (
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[400px] animate-fade-in-left animate-fade-in-left stagger-2 hover-lift">
              <div className="relative mb-6">
                <div className="w-48 h-48 rounded-full flex items-center justify-center">
                  <svg width="200" height="200" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 85 C40 75 55 65 70 70 C85 60 110 65 115 80 C125 80 135 90 130 105 C135 120 120 130 110 125 C100 135 70 140 55 125 C40 130 25 120 30 105 C20 95 30 85 40 85 Z" fill="#EBF4FF" className="dark:fill-slate-800" />
                    <path d="M30 60 L35 70 L45 75 L35 80 L30 90 L25 80 L15 75 L25 70 Z" fill="#BFDBFE" className="dark:fill-blue-900" />
                    <path d="M120 50 L122 56 L128 58 L122 60 L120 66 L118 60 L112 58 L118 56 Z" fill="#BFDBFE" className="dark:fill-blue-900" />
                    <circle cx="80" cy="80" r="24" fill="#93C5FD" className="dark:fill-blue-500/50" />
                    <path d="M45 140 C45 115 65 110 80 110 C95 110 115 115 115 140 C115 150 45 150 45 140 Z" fill="#93C5FD" className="dark:fill-blue-500/50" />
                    <g filter="drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.15))">
                      <path d="M80 100 L105 110 L105 130 C105 145 90 155 80 160 C70 155 55 145 55 130 L55 110 L80 100 Z" fill="#3B82F6" className="dark:fill-blue-600" />
                      <rect x="73" y="120" width="14" height="20" rx="5" fill="white" />
                      <circle cx="80" cy="118" r="5" stroke="white" strokeWidth="3" fill="none" />
                      <circle cx="80" cy="131" r="2" fill="#3B82F6" className="dark:fill-blue-600" />
                    </g>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Profile Editing Disabled</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px]">Profile editing is not available in Sandbox mode.</p>
            </div>
          )}

          {/* ── Col 2: Account Info + Change Password ────────────────────── */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6 animate-fade-in-up stagger-3">

            {/* Account Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover-lift animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <LuUser className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Information</h2>
              </div>
              <dl className="space-y-0">
                {[
                  { icon: <LuMail className="w-4 h-4" />, label: 'Email', value: user.email },
                  { icon: <LuGlobe className="w-4 h-4" />, label: 'Country', value: user.country },
                  { icon: <LuWallet className="w-4 h-4" />, label: 'Sim Balance', value: formatAmount(user.simBalance, user.country) },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800/80">
                    <dt className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {icon} {label}
                    </dt>
                    <dd className="text-sm font-bold text-slate-800 dark:text-white">{value}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4">
                  <dt className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <LuBadgeCheck className="w-4 h-4" /> Plan
                  </dt>
                  <dd>
                    <span className="text-xs px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {user.plan}
                    </span>
                  </dd>
                </div>
                {trialActive && user.trialEndsAt && (
                  <div className="mt-4 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium text-center">
                      🎉 Free trial expires{' '}
                      <strong>{new Date(user.trialEndsAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                    </p>
                  </div>
                )}
              </dl>
            </div>
            
            {/* Secure & Private Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-3 sm:gap-4 hover-lift animate-fade-in-up">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
                <LuShield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Secure & Private</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2">Your data is safe with us. We never share your information with anyone.</p>
                <a href="#" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1">Learn More →</a>
              </div>
            </div>

            {/* Change Password */}
            {!user.sandbox && <ChangePasswordCard />}
          </div>

          {/* ── Col 3: Push Notifications ─────────────────────────────────────────── */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in-right stagger-4 hover-lift">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                <LuBell className="w-6 h-6 text-purple-500 dark:text-purple-400" />
              </div>
              <div className="pt-0.5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Push Notifications</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-4">
                  Works in Chrome / Edge even when the tab is closed.
                </p>
              </div>
            </div>

            {/* Step tracker */}
            {(() => {
              const steps = [
                { key: 'sw',   icon: <LuUser />, iconBg: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400', label: 'Service Worker',         desc: 'Background script that receives pushes',   status: pushSteps.sw },
                { key: 'perm', icon: <LuShield />, iconBg: 'bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400', label: 'Notification Permission', desc: 'Browser must be allowed to show notifications', status: pushSteps.perm === 'ok' ? 'ok' : pushSteps.perm === 'denied' ? 'error' : pushSteps.perm === 'default' ? 'warn' : 'idle' },
                { key: 'sub',  icon: <LuPhone />, iconBg: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400', label: 'Push Subscription',      desc: 'Device registered with push server',       status: pushSteps.sub },
                { key: 'send', icon: <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>, iconBg: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400', label: 'Test Notification Sent', desc: 'Server dispatched push to your device',    status: pushSteps.send },
              ] as const;

              const BADGE_CLASS: Record<string, string> = { 
                idle: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400', 
                ok: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400', 
                error: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400', 
                warn: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' 
              };
              const STATUS_TEXT: Record<string, string> = { idle: 'Not Tested', ok: 'Active', error: 'Failed', warn: 'Not Allowed', sub: 'Subscribed' };

              return (
                <div className="space-y-0 mb-6 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/20">
                  {steps.map((s, i) => {
                     let displayStatus = STATUS_TEXT[s.status];
                     if (s.key === 'sub' && s.status === 'ok') displayStatus = 'Subscribed';

                     return (
                      <div key={s.key} className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-slate-900 animate-fade-in-up ${i !== steps.length - 1 ? 'border-b border-slate-200 dark:border-slate-700' : ''}`} style={{animationDelay: `${0.4 + i * 0.08}s`}}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${s.iconBg}`}>
                          {React.cloneElement(s.icon, { className: "w-4 h-4" })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1">{s.label}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pr-2">{s.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${BADGE_CLASS[s.status]}`}>{displayStatus}</span>
                          <span className="text-slate-300 dark:text-slate-600 text-xs font-bold">›</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
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
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LuMail className="w-4 h-4" /> {testingEmail ? 'Sending…' : 'Send Test Email'}
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <LuBell className="w-4 h-4" /> {setupRunning ? 'Running…' : 'Setup & Test Push'}
              </button>
            </div>
          </div>

        </div>

        {/* ── Row 2: Troubleshooting tips — full width ─────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm mt-4 sm:mt-5 animate-fade-in-up stagger-5">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Troubleshooting &amp; Tips</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
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
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
          <LuShield className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Change Password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your account security</p>
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
