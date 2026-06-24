import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopHeader from '../components/layout/TopHeader';
import { useAuth } from '../context/useAuth';
import { useToast } from '../components/ui/Toast';
import { userApi } from '../services/api';
import { getCurrencyForCountry } from '../utils/currency';
import type { Plan } from '../types';

interface PlanTier {
  id: Plan;
  name: string;
  priceINR: number;
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
    color: 'border-slate-200 dark:border-slate-700',
    features: ['Up to 30 reminders', 'Business, Family & Finance modules', 'Push notifications', 'AI Insights (basic)', 'Calendar view'],
    channels: ['Push'],
    reminderCap: '30 reminders',
  },
  {
    id: 'PERSONAL',
    name: 'Personal',
    priceINR: 99,
    color: 'border-blue-400',
    features: ['Unlimited reminders', 'All FREE features', 'Email & WhatsApp notifications', 'Monthly & yearly recurrence', 'Full AI Insights'],
    channels: ['Push', 'Email', 'WhatsApp'],
    reminderCap: 'Unlimited',
  },
  {
    id: 'FAMILY',
    name: 'Family',
    priceINR: 199,
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
    color: 'border-amber-400',
    features: ['Everything in Family', 'Dedicated business module', 'GST / TDS reminders', 'Team access (soon)', 'API access (soon)', 'SLA support'],
    channels: ['Push', 'Email', 'WhatsApp', 'SMS'],
    reminderCap: 'Unlimited',
  },
];

const PricingPage: React.FC = () => {
  const { user, updateLocalUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const currency = getCurrencyForCountry(user?.country || 'India');
  const [upgrading, setUpgrading] = useState<Plan | null>(null);

  const handleUpgrade = async (planId: Plan) => {
    if (!user) { navigate('/login'); return; }
    if (user.sandbox) { toast('Sign up to upgrade your plan', 'info'); return; }
    if (user.plan === planId) { toast('You are already on this plan', 'info'); return; }

    setUpgrading(planId);
    try {
      await userApi.updatePlan(planId);
      updateLocalUser({ plan: planId });
      toast(`🎉 Upgraded to ${planId} plan!`, 'success');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to upgrade', 'error');
    } finally {
      setUpgrading(null);
    }
  };

  // Simple currency conversion factor (approximate for demo)
  const conversionFactor: Record<string, number> = { INR: 1, USD: 0.012, GBP: 0.0095, EUR: 0.011, AUD: 0.018, CAD: 0.016, SGD: 0.016 };
  const factor = conversionFactor[currency.code] ?? 0.012;
  const formatPrice = (priceINR: number) => {
    if (priceINR === 0) return 'Free';
    const converted = Math.round(priceINR * factor);
    return `${currency.symbol}${converted}/mo`;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <TopHeader title="Pricing" subtitle="Choose the plan that fits your needs" />

      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Simple, transparent pricing</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Start free, upgrade as you grow.
            {user?.country && ` Prices shown in ${currency.code} for ${user.country}.`}
          </p>
          {user?.plan && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium">
              Current plan: <span className="font-bold">{user.plan}</span>
            </div>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan) => {
            const isCurrent   = user?.plan === plan.id;
            const isPopular   = plan.badge === 'Popular';
            const isLocked    = plan.id === 'FAMILY' || plan.id === 'BUSINESS';

            return (
              <div
                key={plan.id}
                className={`relative card flex flex-col p-6 border-2 transition-shadow ${isLocked ? 'opacity-70 grayscale-30' : 'hover:shadow-lg'} ${plan.color} ${isPopular && !isLocked ? 'ring-2 ring-purple-400 dark:ring-purple-500' : ''}`}
              >
                {/* Coming Soon ribbon for locked plans */}
                {isLocked && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
                    <div className="absolute top-4 -right-7 rotate-45 bg-slate-500 dark:bg-slate-600 text-white text-[10px] font-bold px-10 py-1 shadow">
                      COMING SOON
                    </div>
                  </div>
                )}

                {!isLocked && plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold bg-purple-500 text-white">
                    {plan.badge}
                  </span>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{plan.name}</h3>
                    {isLocked && <span className="text-base">🔒</span>}
                  </div>
                  <div className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">
                    {formatPrice(plan.priceINR)}
                  </div>
                  {plan.priceINR > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      billed monthly &bull; ₹{plan.priceINR}/mo in INR
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

                {isLocked ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  >
                    🔒 Coming Soon
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

        {/* Coming soon note */}
        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          🔒 Family &amp; Business plans are coming soon — join the waitlist at <span className="text-blue-500">support@alerthub.app</span>
        </p>

        {/* FAQ / info */}
        <div className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400 space-y-2">
          <p>💳 No credit card required for Free plan. Cancel anytime.</p>
          <p>📧 Questions? Contact <span className="text-blue-600 dark:text-blue-400">support@alerthub.app</span></p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
