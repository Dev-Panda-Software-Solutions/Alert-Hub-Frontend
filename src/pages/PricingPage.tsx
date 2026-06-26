import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopHeader from '../components/layout/TopHeader';
import { useAuth } from '../context/useAuth';
import { useToast } from '../components/ui/Toast';
import { userApi } from '../services/api';
import type { Plan } from '../types';

interface PlanTier {
  id: Plan;
  name: string;
  priceINR: number;
  priceUSD: number;
  color: string;
  badge?: string;
  features: string[];
  channels: string[];
  reminderCap: string;
}

const PLANS: PlanTier[] = [
  {
    id: 'FREE',
    name: 'Free',
    priceINR: 0,
    priceUSD: 0,
    color: 'border-slate-200 dark:border-slate-700',
    features: ['Up to 30 reminders', 'Business, Family & Finance modules', 'Push notifications', 'AI Insights (basic)', 'Calendar view'],
    channels: ['Push'],
    reminderCap: '30 reminders',
  },
  {
    id: 'PERSONAL',
    name: 'Personal',
    priceINR: 99,
    priceUSD: 1,
    color: 'border-blue-400',
    features: ['Unlimited reminders', 'All FREE features', 'Email & WhatsApp notifications', 'Monthly & yearly recurrence', 'Full AI Insights'],
    channels: ['Push', 'Email', 'WhatsApp'],
    reminderCap: 'Unlimited',
  },
  {
    id: 'FAMILY',
    name: 'Family',
    priceINR: 199,
    priceUSD: 5,
    color: 'border-purple-400',
    badge: 'Popular',
    features: ['Everything in Personal', 'SMS notifications', 'Business module unlocked', 'AI balance simulator', 'Priority support'],
    channels: ['Push', 'Email', 'WhatsApp', 'SMS'],
    reminderCap: 'Unlimited',
  },
  {
    id: 'BUSINESS',
    name: 'Business',
    priceINR: 499,
    priceUSD: 10,
    color: 'border-amber-400',
    features: ['Everything in Family', 'Dedicated business module', 'GST / TDS reminders', 'Team access (soon)', 'API access (soon)', 'SLA support'],
    channels: ['Push', 'Email', 'WhatsApp', 'SMS'],
    reminderCap: 'Unlimited',
  },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const PricingPage: React.FC = () => {
  const { user, updateLocalUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isIndia = (user?.country || 'India') === 'India';
  const [upgrading, setUpgrading] = useState<Plan | null>(null);

  const trialActive = Boolean(user?.trialEndsAt && new Date(user.trialEndsAt) > new Date());
  const trialEndsAt = user?.trialEndsAt ?? null;
  const days        = trialEndsAt ? daysLeft(trialEndsAt) : 0;

  const handleUpgrade = async (planId: Plan) => {
    if (!user) { navigate('/login'); return; }
    if (user.sandbox) { toast('Sign up to upgrade your plan', 'info'); return; }
    if (user.plan === planId) { toast('You are already on this plan', 'info'); return; }

    setUpgrading(planId);
    try {
      await userApi.updatePlan(planId);
      updateLocalUser({ plan: planId });
      toast(`Upgraded to ${planId} plan!`, 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to upgrade', 'error');
    } finally {
      setUpgrading(null);
    }
  };

  const formatPrice = (plan: PlanTier) => {
    if (plan.priceINR === 0) return 'Free';
    if (isIndia) return `₹${plan.priceINR}/mo`;
    return `$${plan.priceUSD}/mo`;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TopHeader title="Pricing" subtitle="Choose the plan that fits your needs" />

      <div className="p-6 max-w-6xl mx-auto">
        {/* Trial active banner */}
        {trialActive && trialEndsAt && (
          <div className="mb-6 flex items-center gap-4 px-5 py-4 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <span className="text-3xl">🎉</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base leading-tight">1-Month Free Trial — Personal Plan Active</p>
              <p className="text-blue-100 text-sm mt-0.5">
                Your trial includes all Personal features. Expires on <strong>{fmtDate(trialEndsAt)}</strong>
                {days > 0 && <span className="ml-1 text-blue-200">({days} day{days !== 1 ? 's' : ''} left)</span>}
              </p>
            </div>
            <div className="shrink-0 bg-white/20 rounded-lg px-3 py-1.5 text-sm font-semibold whitespace-nowrap">
              ✓ Active
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Simple, transparent pricing</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Start free, upgrade as you grow.
            {user?.country && ` Prices shown in ${isIndia ? 'INR' : 'USD'} for ${user.country}.`}
          </p>
          {user?.plan && !trialActive && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium">
              Current plan: <span className="font-bold">{user.plan}</span>
            </div>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan) => {
            const isCurrent        = user?.plan === plan.id;
            const isPopular        = plan.badge === 'Popular';
            const isLocked         = plan.id === 'FAMILY' || plan.id === 'BUSINESS';
            // trial is active and plan is PERSONAL and user hasn't accidentally downgraded
            const isOnTrial        = trialActive && plan.id === 'PERSONAL' && user?.plan === 'PERSONAL';
            // trial is active but user downgraded to FREE — Personal card needs a restore button
            const isTrialDegraded  = trialActive && plan.id === 'PERSONAL' && user?.plan === 'FREE';
            // FREE card during trial — block downgrade
            const isFreeBlocked    = trialActive && plan.id === 'FREE';

            return (
              <div
                key={plan.id}
                className={`relative card flex flex-col p-6 border-2 transition-shadow
                  ${isLocked ? 'opacity-70 grayscale-30' : 'hover:shadow-lg'}
                  ${plan.color}
                  ${(isOnTrial || isTrialDegraded) ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg shadow-blue-500/10' : ''}
                  ${isPopular && !isLocked && !isOnTrial && !isTrialDegraded ? 'ring-2 ring-purple-400 dark:ring-purple-500' : ''}`}
              >
                {/* Ribbons */}
                {isLocked && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
                    <div className="absolute top-4 -right-7 rotate-45 bg-slate-500 dark:bg-slate-600 text-white text-[10px] font-bold px-10 py-1 shadow">
                      COMING SOON
                    </div>
                  </div>
                )}
                {(isOnTrial || isTrialDegraded) && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
                    <div className="absolute top-4 -right-8 rotate-45 bg-blue-600 text-white text-[10px] font-bold px-10 py-1 shadow">
                      TRIAL ACTIVE
                    </div>
                  </div>
                )}
                {!isLocked && !isOnTrial && !isTrialDegraded && plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold bg-purple-500 text-white">
                    {plan.badge}
                  </span>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{plan.name}</h3>
                    {isLocked                       && <span className="text-base">🔒</span>}
                    {(isOnTrial || isTrialDegraded) && <span className="text-base">🎉</span>}
                  </div>
                  <div className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                    {(isOnTrial || isTrialDegraded)
                      ? <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">Free Trial</span>
                      : formatPrice(plan)}
                  </div>
                  {(isOnTrial || isTrialDegraded) && trialEndsAt && (
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5 font-medium">
                      Expires {fmtDate(trialEndsAt)} · {days} day{days !== 1 ? 's' : ''} left
                    </p>
                  )}
                  {!isOnTrial && plan.priceINR > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      billed monthly
                      {!isIndia && ` · ₹${plan.priceINR}/mo in INR`}
                    </p>
                  )}
                </div>

                <ul className="flex-1 space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Channels</p>
                  <div className="flex flex-wrap gap-1">
                    {plan.channels.map((ch) => (
                      <span key={ch} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{ch}</span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                {isLocked ? (
                  <button disabled className="w-full py-2.5 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed">
                    🔒 Coming Soon
                  </button>
                ) : isOnTrial ? (
                  // Trial active + already on PERSONAL — show badge, no action needed
                  <button disabled className="w-full py-2.5 rounded-xl font-semibold text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 cursor-default">
                    🎉 Trial Active ✓
                  </button>
                ) : isTrialDegraded ? (
                  // Trial still active but user downgraded to FREE — let them restore
                  <button
                    onClick={() => handleUpgrade('PERSONAL')}
                    disabled={upgrading !== null}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
                  >
                    {upgrading === 'PERSONAL' ? 'Restoring…' : '↩ Restore Trial'}
                  </button>
                ) : isFreeBlocked ? (
                  // FREE plan card while trial is running — block downgrade
                  <button disabled className="w-full py-2.5 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed" title="Cannot downgrade during active trial">
                    Trial active — locked
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || upgrading !== null}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:cursor-not-allowed ${
                      isCurrent
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 cursor-default'
                        : plan.id === 'FREE'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60'
                        : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60'
                    }`}
                  >
                    {upgrading === plan.id ? 'Upgrading…' : isCurrent ? 'Current Plan ✓' : plan.id === 'FREE' ? 'Downgrade to Free' : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer notes */}
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          🔒 Family &amp; Business plans are coming soon — join the waitlist at <span className="text-blue-500">support@alert-guard.app</span>
        </p>
        {trialActive && trialEndsAt && (
          <p className="mt-2 text-center text-xs text-blue-500 dark:text-blue-400">
            Your Personal trial runs until <strong>{fmtDate(trialEndsAt)}</strong>. Payment integration coming soon — we'll notify you before expiry.
          </p>
        )}

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 space-y-2">
          <p>💳 No credit card required. Cancel anytime.</p>
          <p>📧 Questions? Contact <span className="text-blue-600 dark:text-blue-400">support@alert-guard.app</span></p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
