import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LuSend, LuUser, LuUsers, LuBriefcase, LuLock, 
  LuShieldCheck, LuRefreshCw, LuHeadphones, LuCheck, 
  LuArrowRight, LuCalendar, LuBell, LuSparkles, LuX
} from 'react-icons/lu';
import TopHeader from '../components/layout/TopHeader';
import { useAuth } from '../context/useAuth';
import { useToast } from '../components/ui/Toast';
import { userApi } from '../services/api';
import type { Plan } from '../types';

interface PlanTier {
  id: Plan;
  name: string;
  subtitle: string;
  priceINR: number;
  priceUSD: number;
  color: string;
  iconBg: string;
  iconColor: string;
  Icon: React.ElementType;
  locked?: boolean;
  badge?: string;
  features: string[];
  checkColor: string;
}

const PLANS: PlanTier[] = [
  {
    id: 'FREE',
    name: 'Free',
    subtitle: 'Get started at no cost',
    priceINR: 0,
    priceUSD: 0,
    color: 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-500',
    checkColor: 'text-emerald-500',
    Icon: LuSend,
    features: ['Up to 30 reminders', 'Business, Family & Finance modules', 'Push notifications', 'AI Insights (basic)', 'Calendar view'],
  },
  {
    id: 'PERSONAL',
    name: 'Personal',
    subtitle: 'For individuals & freelancers',
    priceINR: 99,
    priceUSD: 1,
    color: 'border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105 z-10',
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-500',
    checkColor: 'text-indigo-500',
    Icon: LuUser,
    badge: 'Most Popular',
    features: ['Unlimited reminders', 'All FREE features', 'Email & WhatsApp notifications', 'Monthly & yearly recurrence', 'Full AI Insights'],
  },
  {
    id: 'FAMILY',
    name: 'Family',
    subtitle: 'For families & households',
    priceINR: 199,
    priceUSD: 5,
    color: 'border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700',
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-500',
    checkColor: 'text-amber-500',
    Icon: LuUsers,
    locked: true,
    features: ['Everything in Personal', 'SMS notifications', 'Business module unlocked', 'AI balance simulator', 'Priority support'],
  },
  {
    id: 'BUSINESS',
    name: 'Business',
    subtitle: 'For teams & companies',
    priceINR: 499,
    priceUSD: 10,
    color: 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700',
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-blue-500',
    checkColor: 'text-blue-500',
    Icon: LuBriefcase,
    locked: true,
    features: ['Everything in Family', 'Dedicated business module', 'GST / TDS reminders', 'Team access (soon)', 'API access (soon)', 'SLA support'],
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

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
    const amount = isIndia ? plan.priceINR : plan.priceUSD;
    const finalAmount = billingCycle === 'yearly' ? Math.floor(amount * 0.8 * 12) : amount;
    
    return (
      <div className="flex items-end gap-1">
        <span className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
          {isIndia ? '₹' : '$'}{finalAmount}
        </span>
        <span className="text-sm font-bold text-slate-400 mb-1.5">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950 relative">
      {/* Background Decoratives */}
      <div className="absolute top-0 right-0 w-full max-w-2xl h-96 pointer-events-none opacity-50 dark:opacity-20 overflow-hidden">
        <svg viewBox="0 0 400 400" className="absolute top-0 right-0 w-[600px] h-[600px] -translate-y-20 translate-x-32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M190.493 25.109C256.772 -14.6738 340.244 -5.46743 396.938 48.066C453.632 101.599 470.523 186.223 440.098 259.049C409.673 331.875 336.564 378.147 257.653 381.169C178.741 384.192 103.882 342.365 60.1065 277.291C16.331 212.217 9.87895 125.753 50.1444 60.4077C90.4098 -4.93796 124.215 64.8916 190.493 25.109Z" fill="url(#paint0_linear)"/>
          <defs>
            <linearGradient id="paint0_linear" x1="41.3418" y1="41.8158" x2="389.658" y2="340.635" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" stopOpacity="0.1"/>
              <stop offset="1" stopColor="#A855F7" stopOpacity="0.15"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute top-20 left-20 pointer-events-none opacity-30 dark:opacity-10">
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
           <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
             <circle cx="2" cy="2" r="1.5" fill="#6366F1" />
           </pattern>
           <rect x="0" y="0" width="100" height="100" fill="url(#dots)" />
        </svg>
      </div>

      <TopHeader title="Pricing" subtitle="Choose the perfect plan for your financial peace of mind" />

      <div className="p-4 md:p-8 max-w-[1200px] mx-auto relative z-10">
        
        {/* Trial active banner */}
        {trialActive && trialEndsAt && (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 max-w-4xl mx-auto">
            <span className="text-3xl hidden sm:block">🎉</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight">1-Month Free Trial — Personal Plan Active</p>
              <p className="text-blue-100 text-sm mt-1">
                Your trial includes all Personal features. Expires on <strong>{fmtDate(trialEndsAt)}</strong>
                {days > 0 && <span className="ml-1 text-blue-200">({days} day{days !== 1 ? 's' : ''} left)</span>}
              </p>
            </div>
            <div className="shrink-0 bg-white/20 rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap self-start sm:self-auto border border-white/10 shadow-sm">
              ✓ Active
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-widest uppercase mb-6">
            <LuSparkles className="w-3.5 h-3.5" />
            Flexible Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
            Plans that <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500">grow</span> with you
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto mb-8 text-lg">
            Start free, upgrade anytime.
            {user?.country && ` All prices are in ${isIndia ? 'INR' : 'USD'} for ${user.country}.`}
          </p>

          <div className="flex flex-col items-center gap-6">
            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-2 p-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Yearly
              </button>
              <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold px-2.5 py-1 mr-2 rounded-full whitespace-nowrap hidden sm:inline-block shadow-sm">
                Save up to 20%
              </span>
            </div>
            
            {/* Current Plan Badge */}
            {user?.plan && !trialActive && (
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-semibold shadow-sm">
                Current plan: <span className="font-bold tracking-wide uppercase">{user.plan}</span>
              </div>
            )}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto pb-12">
          {PLANS.map((plan) => {
            const isCurrent        = user?.plan === plan.id;
            const isOnTrial        = trialActive && plan.id === 'PERSONAL' && user?.plan === 'PERSONAL';
            const isTrialDegraded  = trialActive && plan.id === 'PERSONAL' && user?.plan === 'FREE';
            const isFreeBlocked    = trialActive && plan.id === 'FREE';

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col border-2 transition-all duration-300 overflow-hidden hover-lift animate-scale-in-spring
                  stagger-${(['FREE','PERSONAL','FAMILY','BUSINESS'].indexOf(plan.id) + 1) || 1}
                  ${plan.color}
                  ${plan.locked ? 'opacity-90 grayscale-[20%]' : ''}`}
              >
                {/* Premium header gradient for popular plan */}
                {plan.id === 'PERSONAL' && !plan.locked && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-t-[22px]" />
                )}
                {/* Ribbons */}
                {plan.locked && (
                  <div className="absolute inset-0 rounded-[1.4rem] overflow-hidden pointer-events-none z-10">
                    <div className={`absolute top-6 -right-10 rotate-45 text-[10px] font-bold tracking-wider px-12 py-1.5 shadow-sm uppercase ${plan.id === 'FAMILY' ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-600' : 'bg-blue-100 dark:bg-blue-900/60 text-blue-600'}`}>
                      Coming Soon
                    </div>
                  </div>
                )}
                {(isOnTrial || isTrialDegraded) && (
                  <div className="absolute inset-0 rounded-[1.4rem] overflow-hidden pointer-events-none z-10">
                    <div className="absolute top-6 -right-10 rotate-45 bg-indigo-500 text-white text-[10px] font-bold tracking-wider px-12 py-1.5 shadow-sm uppercase">
                      Trial Active
                    </div>
                  </div>
                )}
                
                {/* Popular Badge */}
                {!plan.locked && !isOnTrial && !isTrialDegraded && plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide bg-indigo-500 text-white shadow-md z-20 whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6 relative z-10">
                  <div className={`w-13 h-13 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-5 shadow-sm`} style={{width:'3.25rem',height:'3.25rem'}}>
                    <plan.Icon className={`w-6 h-6 ${plan.iconColor}`} />
                    {plan.locked && <LuLock className="w-3 h-3 absolute translate-x-4 translate-y-4 bg-white dark:bg-slate-900 rounded-full p-0.5 text-slate-500" />}
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">{plan.subtitle}</p>
                  
                  <div className="mb-2 h-10 flex items-end">
                    {(isOnTrial || isTrialDegraded)
                      ? <span className="text-indigo-600 dark:text-indigo-400 text-2xl font-bold">Free Trial</span>
                      : plan.priceINR === 0
                        ? <span className="text-4xl font-extrabold text-slate-800 dark:text-white">₹0</span>
                        : formatPrice(plan)}
                  </div>
                  
                  <p className="text-xs font-medium text-slate-400 mt-2 min-h-[16px]">
                    {(isOnTrial || isTrialDegraded) && trialEndsAt 
                      ? `Expires ${fmtDate(trialEndsAt)} · ${days} day${days !== 1 ? 's' : ''} left`
                      : plan.priceINR === 0 
                        ? 'Forever Free'
                        : `Billed ${billingCycle}`
                    }
                  </p>
                </div>

                <div className="flex-1 border-t border-slate-100 dark:border-slate-800/80 pt-6 mb-8">
                  <ul className="space-y-3.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.iconBg}`}>
                          <LuCheck className={`w-3 h-3 ${plan.checkColor}`} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="mt-auto relative z-10">
                  {plan.locked ? (
                    <button disabled className={`w-full py-3.5 rounded-xl font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2 transition-colors ${plan.id === 'FAMILY' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'}`}>
                      <LuLock className="w-4 h-4" /> Coming Soon
                    </button>
                  ) : isOnTrial ? (
                    <button disabled className="w-full py-3.5 rounded-xl font-bold text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 cursor-default flex items-center justify-center gap-2 border border-indigo-100 dark:border-indigo-800/50">
                      🎉 Trial Active <LuCheck className="w-4 h-4" />
                    </button>
                  ) : isTrialDegraded ? (
                    <button
                      onClick={() => handleUpgrade('PERSONAL')}
                      disabled={upgrading !== null}
                      className="w-full py-3.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-60 shadow-md flex items-center justify-center gap-2"
                    >
                      {upgrading === 'PERSONAL' ? 'Restoring…' : '↩ Restore Trial'}
                    </button>
                  ) : isFreeBlocked ? (
                    <button disabled className="w-full py-3.5 rounded-xl font-bold text-sm bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed" title="Cannot downgrade during active trial">
                      Trial active — locked
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrent || upgrading !== null}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 cursor-default'
                          : plan.id === 'FREE'
                          ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-50'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0'
                      }`}
                    >
                      {upgrading === plan.id 
                        ? 'Upgrading...' 
                        : isCurrent 
                          ? <>Current Plan <LuCheck className="w-4 h-4" /></>
                          : plan.id === 'FREE' 
                            ? 'Downgrade to Free' 
                            : <>Upgrade to {plan.name} <LuArrowRight className="w-4 h-4" /></>
                      }
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Compare Features Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-7xl mx-auto shadow-sm mb-8 overflow-hidden" style={{boxShadow:'0 2px 20px rgba(99,102,241,0.07)'}}>
           <div className="flex items-center gap-3 mb-6">
             <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
               <LuSparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
             </div>
             <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Compare all features</h3>
           </div>
           <div className="overflow-x-auto scrollbar-hide">
             <table className="w-full min-w-[800px] text-left border-collapse">
               <thead>
                 <tr>
                   <th className="py-4 px-4 font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 w-1/4">Compare features</th>
                   <th className="py-4 px-4 font-bold text-emerald-500 text-center border-b border-slate-100 dark:border-slate-800 w-3/16">Free</th>
                   <th className="py-4 px-4 font-bold text-indigo-600 dark:text-indigo-400 text-center border-b border-slate-100 dark:border-slate-800 w-3/16">Personal</th>
                   <th className="py-4 px-4 font-bold text-amber-500 text-center border-b border-slate-100 dark:border-slate-800 w-3/16">
                     Family <span className="inline-block px-1.5 py-0.5 ml-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] rounded-md font-semibold align-text-bottom">Soon</span>
                   </th>
                   <th className="py-4 px-4 font-bold text-blue-600 dark:text-blue-400 text-center border-b border-slate-100 dark:border-slate-800 w-3/16">
                     Business <span className="inline-block px-1.5 py-0.5 ml-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[9px] rounded-md font-semibold align-text-bottom">Soon</span>
                   </th>
                 </tr>
               </thead>
               <tbody className="text-sm font-medium text-slate-600 dark:text-slate-300">
                 <tr>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center shrink-0"><LuCalendar className="w-3.5 h-3.5" /></div> Reminders</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center text-slate-500">Up to 30</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center">Unlimited</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center">Unlimited</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center">Unlimited</td>
                 </tr>
                 <tr>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center shrink-0"><LuBell className="w-3.5 h-3.5" /></div> Notification Channels</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center text-slate-500">Push</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center text-slate-500 text-xs">Push, Email, WhatsApp</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center text-slate-500 text-xs">Push, Email, WhatsApp, SMS</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center text-slate-500 text-xs">All Channels + SMS</td>
                 </tr>
                 <tr>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center shrink-0"><LuSparkles className="w-3.5 h-3.5" /></div> AI Insights</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center text-slate-500">Basic</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center">Full</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center text-slate-500">Full + Simulator</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center text-slate-500">Full + Advanced</td>
                 </tr>
                 <tr>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center shrink-0"><LuBriefcase className="w-3.5 h-3.5" /></div> Business Module</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center"><LuX className="w-4 h-4 text-slate-300 mx-auto" /></td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center"><LuX className="w-4 h-4 text-slate-300 mx-auto" /></td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center"><LuCheck className="w-4 h-4 text-amber-500 mx-auto" /></td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center"><LuCheck className="w-4 h-4 text-blue-500 mx-auto" /></td>
                 </tr>
                 <tr>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center shrink-0"><LuUsers className="w-3.5 h-3.5" /></div> Team Access</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center"><LuX className="w-4 h-4 text-slate-300 mx-auto" /></td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center"><LuX className="w-4 h-4 text-slate-300 mx-auto" /></td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center text-slate-400">Soon</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center"><LuCheck className="w-4 h-4 text-blue-500 mx-auto" /></td>
                 </tr>
                 <tr>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center shrink-0"><LuShieldCheck className="w-3.5 h-3.5" /></div> Priority Support</td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center"><LuX className="w-4 h-4 text-slate-300 mx-auto" /></td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center"><LuX className="w-4 h-4 text-slate-300 mx-auto" /></td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center"><LuCheck className="w-4 h-4 text-amber-500 mx-auto" /></td>
                   <td className="py-4 px-4 border-b border-slate-100 dark:border-slate-800 text-center"><LuCheck className="w-4 h-4 text-blue-500 mx-auto" /></td>
                 </tr>
               </tbody>
             </table>
           </div>
        </div>

        {/* Footer Trust Badges */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 max-w-7xl mx-auto shadow-sm" style={{boxShadow:'0 2px 20px rgba(99,102,241,0.07)'}}>
          <div className="text-center mb-8">
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Why choose Alert Guard?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Trusted by thousands of users across India</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
             <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 hover-lift animate-fade-in-up stagger-1">
               <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25">
                 <LuShieldCheck className="w-7 h-7" />
               </div>
               <h4 className="font-black text-slate-800 dark:text-white mb-1">Secure & Private</h4>
               <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Your data is always encrypted and safe</p>
             </div>
             <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 hover-lift animate-fade-in-up stagger-2">
               <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25">
                 <LuRefreshCw className="w-7 h-7" />
               </div>
               <h4 className="font-black text-slate-800 dark:text-white mb-1">Cancel Anytime</h4>
               <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No hidden fees. Cancel anytime, no questions asked.</p>
             </div>
             <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 hover-lift animate-fade-in-up stagger-3">
               <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25">
                 <LuHeadphones className="w-7 h-7" />
               </div>
               <h4 className="font-black text-slate-800 dark:text-white mb-1">24/7 Support</h4>
               <p className="text-xs font-medium text-slate-500 dark:text-slate-400">We're here to help you, always.</p>
             </div>
             <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 hover-lift animate-fade-in-up stagger-4">
               <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
                 <LuUsers className="w-7 h-7" />
               </div>
               <h4 className="font-black text-slate-800 dark:text-white mb-1">Trusted by Users</h4>
               <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Join thousands of happy users across India.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PricingPage;
