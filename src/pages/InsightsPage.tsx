import React, { useEffect, useState, useRef } from 'react';
import {
  LuTrendingDown, LuTrendingUp, LuActivity, LuInfo,
  LuSend, LuChevronRight, LuShieldAlert, LuCircleCheck
} from 'react-icons/lu';
import TopHeader from '../components/layout/TopHeader';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { insightsApi, userApi } from '../services/api';
import { useAuth } from '../context/useAuth';
import { useToast } from '../components/ui/Toast';
import { formatAmount } from '../utils/currency';
import type { Insight, CashflowPoint, InsightSeverity } from '../types';

// ── Severity styling ───────────────────────────────────────────────────────────
const SEV_STYLE: Record<InsightSeverity, { border: string; bg: string; icon: string; badge: string; strip: string }> = {
  info: { border: 'border-blue-100 dark:border-blue-900/50', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'ℹ️', badge: 'border border-blue-200 text-blue-600 bg-blue-50 dark:bg-blue-900/30', strip: 'bg-gradient-to-r from-blue-500 to-sky-400' },
  warning: { border: 'border-orange-100 dark:border-orange-900/50', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: '⚠️', badge: 'border border-orange-200 text-orange-600 bg-orange-50 dark:bg-orange-900/30', strip: 'bg-gradient-to-r from-orange-500 to-amber-400' },
  critical: { border: 'border-red-100 dark:border-red-900/50', bg: 'bg-red-50 dark:bg-red-900/20', icon: '🚨', badge: 'border border-red-200 text-red-600 bg-red-50 dark:bg-red-900/30', strip: 'bg-gradient-to-r from-red-500 to-rose-400' },
  success: { border: 'border-emerald-100 dark:border-emerald-900/50', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: '✅', badge: 'border border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30', strip: 'bg-gradient-to-r from-emerald-500 to-teal-400' },
};

// ── SVG Cashflow Chart with live-draw animation ───────────────────────────────
const CashflowChart: React.FC<{ points: CashflowPoint[] }> = ({ points }) => {
  if (!points.length) return null;

  const W = 700; const H = 180; const PAD = 30;
  const maxVal = Math.max(...points.map((p) => Math.max(p.outflow, p.paid)), 1);
  const xStep = (W - PAD * 2) / (points.length - 1);

  const toX = (i: number) => PAD + i * xStep;
  const toY = (v: number) => H - PAD - ((v / maxVal) * (H - PAD * 2));

  const outflowPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.outflow)}`).join(' ');
  const paidPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.paid)}`).join(' ');
  const areaPath = `${outflowPath} L ${toX(points.length - 1)} ${H - PAD} L ${PAD} ${H - PAD} Z`;

  const today = new Date().toISOString().split('T')[0];
  const todayIdx = points.findIndex(p => p.date === today);

  const totalOutflow = points.reduce((s, p) => s + p.outflow, 0);
  const totalPaid = points.reduce((s, p) => s + p.paid, 0);
  const netFlow = totalPaid - totalOutflow;

  // Refs for animated paths
  const outflowRef = useRef<SVGPathElement>(null);
  const paidRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const outflowEl = outflowRef.current;
    const paidEl = paidRef.current;
    const areaEl = areaRef.current;
    if (!outflowEl || !paidEl || !areaEl) return;

    // Get actual path lengths
    const outflowLen = outflowEl.getTotalLength();
    const paidLen = paidEl.getTotalLength();

    // --- Outflow line: draw from left to right ---
    outflowEl.style.strokeDasharray = `${outflowLen}`;
    outflowEl.style.strokeDashoffset = `${outflowLen}`;
    outflowEl.style.transition = 'none';
    // Force reflow
    void outflowEl.getBoundingClientRect();
    outflowEl.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.3s';
    outflowEl.style.strokeDashoffset = '0';

    // --- Paid line: draw slightly after outflow ---
    paidEl.style.strokeDasharray = `${paidLen}`;
    paidEl.style.strokeDashoffset = `${paidLen}`;
    paidEl.style.transition = 'none';
    void paidEl.getBoundingClientRect();
    paidEl.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.6s';
    paidEl.style.strokeDashoffset = '0';

    // --- Area fill: fade in after lines ---
    areaEl.style.opacity = '0';
    areaEl.style.transition = 'none';
    void areaEl.getBoundingClientRect();
    areaEl.style.transition = 'opacity 0.8s ease 1.3s';
    areaEl.style.opacity = '1';
  }, [points]);

  return (
    <div className="flex flex-col">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 pt-2">
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-2 sm:gap-3 shadow-sm min-w-[120px] sm:min-w-[140px] animate-fade-in-up stagger-1">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center shrink-0">
            <LuTrendingDown className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Total Outflow</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">₹{totalOutflow.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-2 sm:gap-3 shadow-sm min-w-[120px] sm:min-w-[140px] animate-fade-in-up stagger-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center shrink-0">
            <LuTrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">Total Paid</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-2 sm:gap-3 shadow-sm min-w-[120px] sm:min-w-[140px] animate-fade-in-up stagger-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center shrink-0">
            <LuActivity className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-0.5">Net Flow</p>
            <p className={`text-sm font-bold ${netFlow < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {netFlow < 0 ? '-' : '+'}₹{Math.abs(netFlow).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" aria-label="Cashflow chart">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          {/* Glow filter for outflow line */}
          <filter id="lineGlow" x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines — fade in before lines draw */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = H - PAD - frac * (H - PAD * 2);
          return (
            <g key={frac} style={{ opacity: 0, animation: `fadeIn 0.5s ease ${frac * 0.1 + 0.1}s both` }}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y}
                stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />
              <text x={PAD - 8} y={y + 3} textAnchor="end" fontSize="9"
                fontWeight="500" fill="currentColor" fillOpacity="0.4">
                {formatAmount(maxVal * frac, 'India').replace('₹', '')}
              </text>
            </g>
          );
        })}

        {/* Today vertical line */}
        {todayIdx >= 0 && (
          <g style={{ opacity: 0, animation: 'fadeIn 0.4s ease 1.4s both' }}>
            <line
              x1={toX(todayIdx)} y1={10} x2={toX(todayIdx)} y2={H - PAD}
              stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6"
            />
            <rect x={toX(todayIdx) - 22} y="0" width="44" height="15" rx="7"
              fill="#EEF2FF" />
            <text x={toX(todayIdx)} y="10.5" textAnchor="middle"
              fontSize="8" fontWeight="bold" fill="#6366f1">Today</text>
          </g>
        )}

        {/* Area fill — animated via ref */}
        <path ref={areaRef} d={areaPath} fill="url(#areaGrad)" style={{ opacity: 0 }} />

        {/* Paid line (dashed green) — animated via ref */}
        <path
          ref={paidRef}
          d={paidPath}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />

        {/* Outflow line (solid blue) — animated via ref, with glow */}
        <path
          ref={outflowRef}
          d={outflowPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lineGlow)"
        />

        {/* Outflow data point dots — stagger pop in after line draws */}
        {points.map((p, i) => (
          <circle
            key={`o-${i}`}
            cx={toX(i)} cy={toY(p.outflow)}
            r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2.5"
            style={{
              opacity: 0,
              transformOrigin: `${toX(i)}px ${toY(p.outflow)}px`,
              animation: `scaleInSpring 0.4s cubic-bezier(0.22,1,0.36,1) ${1.2 + i * 0.06}s both`,
            }}
          />
        ))}

        {/* Paid data point dots — stagger pop in after paid line draws */}
        {points.map((p, i) => (
          <circle
            key={`p-${i}`}
            cx={toX(i)} cy={toY(p.paid)}
            r="3.5" fill="#10b981" stroke="#fff" strokeWidth="2"
            style={{
              opacity: 0,
              transformOrigin: `${toX(i)}px ${toY(p.paid)}px`,
              animation: `scaleInSpring 0.4s cubic-bezier(0.22,1,0.36,1) ${1.4 + i * 0.06}s both`,
            }}
          />
        ))}

        {/* X-axis date labels — fade in last */}
        {points.map((p, i) => (
          <text
            key={i}
            x={toX(i)} y={H - 5}
            textAnchor="middle" fontSize="10" fontWeight="600"
            fill="currentColor" fillOpacity="0.5"
            style={{ opacity: 0, animation: `fadeIn 0.4s ease ${1.5 + i * 0.04}s both` }}
          >
            {p.date.slice(5)}
          </text>
        ))}
      </svg>
    </div>
  );
};


// ── Markdown renderer ─────────────────────────────────────────────────────────
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^#{1,3}\s+(.+)$/gm, '<strong class="block mt-2 mb-1">$1</strong>')
    .replace(/^[•\-]\s+(.+)$/gm, '<span class="block pl-3">• $1</span>')
    .replace(/\n/g, '<br />');
}

// ── NLP Chat Panel ────────────────────────────────────────────────────────────
const AI_QUESTIONS = [
  'What is due today?',
  'What is due tomorrow?',
  'What is due this week?',
  'What is due this month?',
  'Show overdue payments',
  'Can I afford this month?',
  'What is my largest upcoming expense?',
  'List my subscriptions',
  'Show EMI and loan payments',
  'Show tax and GST payments',
  'Show investment reminders',
  'How many pending reminders do I have?',
  'Which module costs the most?',
  'What should I pay first?',
  'What is due in the next 30 days?',
  'Show credit card payments',
  'Show insurance payments',
  'Show family bills',
  'Show business payments',
  'Show finance payments',
  'How much cash will remain after this month?',
  'Give me saving tips',
];

function shuffleQuestions() {
  return [...AI_QUESTIONS].sort(() => Math.random() - 0.5);
}

const QuestionChips: React.FC<{
  suggestions: string[];
  onPick: (question: string) => void;
  marquee?: boolean;
}> = ({ suggestions, onPick, marquee = false }) => {
  const items = marquee ? [...suggestions, ...suggestions] : suggestions;

  return (
    <div className={marquee ? 'overflow-hidden -mx-1 px-1 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]' : 'overflow-x-auto scrollbar-hide pb-1'}>
      <div className={`flex gap-2 ${marquee ? 'w-max animate-ai-question-marquee hover:[animation-play-state:paused]' : 'w-max'}`}>
        {items.map((s, idx) => (
          <button
            key={`${s}-${idx}`}
            type="button"
            onClick={() => onPick(s)}
            className="shrink-0 px-3.5 py-1.5 rounded-full bg-white/5 text-white text-[11px] font-medium border border-white/10 hover:bg-white/15 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

const ChatPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [suggestions, setSuggestions] = useState(shuffleQuestions);

  useEffect(() => {
    const timer = window.setInterval(() => setSuggestions(shuffleQuestions()), 18000);
    return () => window.clearInterval(timer);
  }, []);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setThinking(true);
    try {
      const { answer } = await insightsApi.query(text);
      setMessages((m) => [...m, { role: 'ai', text: answer }]);
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setThinking(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden bg-gradient-to-br from-[#1b1744] via-[#241e5e] to-[#362783] shadow-lg flex flex-col h-[390px] sm:h-[430px]">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg width="100%" height="100%">
          <circle cx="80%" cy="20%" r="1" fill="#fff" opacity="0.8" className="animate-pulse" />
          <circle cx="60%" cy="40%" r="2" fill="#fff" opacity="0.6" className="animate-pulse" style={{ animationDelay: '1s' }} />
          <circle cx="90%" cy="60%" r="1.5" fill="#fff" opacity="0.9" className="animate-pulse" style={{ animationDelay: '2s' }} />
          <circle cx="20%" cy="30%" r="1" fill="#fff" opacity="0.5" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
          <circle cx="40%" cy="80%" r="2" fill="#fff" opacity="0.7" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold backdrop-blur-md border border-white/10">AI</div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">Ask AI</h3>
            <p className="text-indigo-200 text-xs mt-0.5">Get instant answers to your financial questions</p>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="mb-4 rounded-2xl bg-white/5 border border-white/10 p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-indigo-100 text-xs font-semibold">Pick a question</span>
              <button
                type="button"
                onClick={() => setSuggestions(shuffleQuestions())}
                className="text-[10px] text-indigo-100/80 hover:text-white font-semibold transition-colors"
              >
                Shuffle
              </button>
            </div>
            <QuestionChips suggestions={suggestions} onPick={send} marquee />
          </div>
        )}

        <div className="flex-1 overflow-y-auto mb-3 scrollbar-hide flex flex-col min-h-0">
          {messages.length === 0 ? (
            <div className="m-auto text-center px-4">
              <p className="text-sm font-semibold text-white">Select a suggestion to ask AI</p>
              <p className="text-xs text-indigo-200/80 mt-1">You can also type your own question below.</p>
            </div>
          ) : (
            <div className="space-y-3 pb-2 flex-1 pt-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed backdrop-blur-sm border ${m.role === 'user'
                      ? 'bg-indigo-600/90 text-white border-indigo-500 rounded-br-sm'
                      : 'bg-white/10 text-indigo-50 border-white/10 rounded-bl-sm shadow-xl'
                    }`}>
                    {m.role === 'ai'
                      ? <span dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }} />
                      : m.text
                    }
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/10 text-indigo-200 text-sm rounded-bl-sm flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="mt-auto">
          {messages.length > 0 && (
            <div className="mb-3 rounded-2xl bg-white/5 border border-white/10 p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-indigo-100 text-xs font-semibold">Suggested questions</span>
                <button
                  type="button"
                  onClick={() => setSuggestions(shuffleQuestions())}
                  className="text-[10px] text-indigo-100/80 hover:text-white font-semibold transition-colors"
                >
                  Shuffle
                </button>
              </div>
              <QuestionChips suggestions={suggestions.slice(0, 8)} onPick={send} />
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="bg-white rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pl-3 sm:pl-4 flex items-center gap-1 sm:gap-2 shadow-2xl">
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="What are my subscriptions?"
              className="flex-1 bg-transparent border-none outline-none text-slate-800 text-sm font-medium placeholder:text-slate-400"
            />
            <button type="submit" disabled={thinking} className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50">
              <LuSend className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Robot SVG - hidden when chat is active */}
      {messages.length === 0 && (
        <div className="absolute -right-4 -bottom-4 w-40 h-40 sm:w-56 sm:h-56 pointer-events-none opacity-90 transition-opacity hidden sm:block">
          <svg viewBox="0 0 200 200" fill="none">
            <g filter="drop-shadow(0 10px 15px rgba(99,102,241,0.4))">
              <rect x="60" y="70" width="80" height="60" rx="25" fill="url(#botGrad)" />
              <rect x="70" y="85" width="60" height="25" rx="10" fill="#0f0c29" stroke="#312E81" strokeWidth="2" />
              <circle cx="85" cy="97" r="4" fill="#60A5FA" filter="drop-shadow(0 0 6px #60A5FA)" />
              <circle cx="115" cy="97" r="4" fill="#60A5FA" filter="drop-shadow(0 0 6px #60A5FA)" />
              <path d="M100 70 V 45" stroke="url(#botGrad)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="100" cy="40" r="5" fill="#60A5FA" filter="drop-shadow(0 0 8px #60A5FA)" />
              <rect x="50" y="90" width="10" height="20" rx="5" fill="url(#botGrad)" />
              <rect x="140" y="90" width="10" height="20" rx="5" fill="url(#botGrad)" />

              {/* Sparkles around robot */}
              <path d="M40 50 L42 55 L47 57 L42 59 L40 64 L38 59 L33 57 L38 55 Z" fill="#C4B5FD" />
              <path d="M150 40 L151.5 45 L156.5 46.5 L151.5 48 L150 53 L148.5 48 L143.5 46.5 L148.5 45 Z" fill="#FDE047" />
            </g>
            <defs>
              <linearGradient id="botGrad" x1="60" y1="70" x2="140" y2="130">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
};

// ── Simulator ─────────────────────────────────────────────────────────────────
const BalanceSimulator: React.FC = () => {
  const { user, updateLocalUser } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(String(user?.simBalance ?? 75000));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await userApi.updateSimBalance(parseFloat(balance));
      updateLocalUser({ simBalance: parseFloat(balance) });
      toast('Simulated balance updated', 'success');
    } catch {
      toast('Failed to update balance', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-4 sm:p-6 h-[280px] sm:h-[320px] flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-slate-800 dark:text-white text-[15px] mb-1">Balance Simulator</h3>
        <p className="text-[11px] text-slate-400 mb-5">Set a simulated bank balance to test affordability insights</p>

        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
            <input
              type="number" min={0} step={1000}
              value={balance} onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-7 pr-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>
          <button onClick={save} disabled={saving} className="btn btn-primary px-5 rounded-xl disabled:opacity-60 shadow-md">
            {saving ? '...' : 'Update'}
          </button>
        </div>

        <div className="mb-2">
          <input
            type="range"
            min="10000" max="200000" step="5000"
            value={balance} onChange={(e) => setBalance(e.target.value)}
            className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-bold tracking-wide">
          <span>₹10,000</span>
          <span>₹2,00,000</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 border-t border-slate-100 dark:border-slate-800 pt-3 sm:pt-5">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Predicted Balance</p>
          <p className="font-bold text-slate-800 dark:text-white text-sm mt-1">₹{(parseFloat(balance) - 56570).toLocaleString('en-IN')}</p>
          <p className="text-[9px] text-slate-400 mt-0.5 font-medium">in 30 days</p>
        </div>
        <div className="border-l border-slate-100 dark:border-slate-800 pl-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Cash Remaining</p>
          <p className="font-bold text-slate-800 dark:text-white text-sm mt-1">₹{(parseFloat(balance) - 62360).toLocaleString('en-IN')}</p>
          <p className="text-[9px] text-slate-400 mt-0.5 font-medium">After bills</p>
        </div>
        <div className="border-l border-slate-100 dark:border-slate-800 pl-3 flex flex-col">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Risk Level</p>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-sm">
            Low <LuCircleCheck className="w-3.5 h-3.5" />
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5 font-medium">Safe to spend</p>
        </div>
      </div>
    </div>
  );
};

// ── AI Financial Health ─────────────────────────────────────────────────────────
const FinancialHealth: React.FC = () => {
  return (
    <div className="card p-6 h-full flex flex-col border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="flex w-full items-center justify-between mb-4 z-10">
        <h3 className="font-bold text-[13px] text-slate-800 dark:text-white flex items-center gap-1.5">
          AI Financial Health <LuInfo className="w-3.5 h-3.5 text-slate-400" />
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-medium">
          <span className="text-slate-400">Last updated: 2 min ago</span>
          <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 my-4">
        <div className="relative w-48 h-28">
          <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-sm">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="8" strokeLinecap="round" />
            <path d="M 10 50 A 40 40 0 0 1 80 15" fill="none" stroke="#6366F1" strokeWidth="8" strokeLinecap="round" strokeDasharray="125" strokeDashoffset="25" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <p className="text-5xl font-bold text-slate-800 dark:text-white tracking-tight">
              82<span className="text-xl text-slate-400 font-semibold tracking-normal">/100</span>
            </p>
          </div>
        </div>
        <div className="mt-2 text-center">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold border border-emerald-100 dark:border-emerald-900/50">
            Excellent <span className="text-emerald-500 text-xs">↑ 12%</span>
          </span>
          <p className="text-[10px] text-slate-400 font-medium mt-1.5">vs last week</p>
        </div>
      </div>

      <div className="bg-[#F8FAFC] dark:bg-slate-800/50 w-full rounded-2xl p-3.5 mt-2 flex items-start gap-3 border border-slate-100 dark:border-slate-800/80 z-10">
        <div className="text-indigo-500 text-lg mt-0.5">✨</div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          Great job! Your financial health is <strong className="text-indigo-600 dark:text-indigo-400">better than 82%</strong> of our users.
        </p>
      </div>

      <div className="grid grid-cols-3 w-full gap-2 mt-4 z-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 text-center">
          <p className="text-[9px] font-bold text-slate-400 mb-1 tracking-wide">Score Trend</p>
          <p className="text-emerald-600 font-bold text-xs flex items-center justify-center gap-1"><LuTrendingUp className="w-3 h-3" /> +12%</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 text-center">
          <p className="text-[9px] font-bold text-slate-400 mb-1 tracking-wide">Cash Safety</p>
          <p className="text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1"><LuShieldAlert className="w-3 h-3 text-blue-500" /> Good</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 text-center">
          <p className="text-[9px] font-bold text-slate-400 mb-1 tracking-wide">Risk Level</p>
          <p className="text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1"><LuCircleCheck className="w-3 h-3 text-emerald-500" /> Low</p>
        </div>
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [cashflow, setCashflow] = useState<CashflowPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([insightsApi.getInsights(), insightsApi.getCashflow()])
      .then(([ins, cf]) => { setInsights(ins.insights); setCashflow(cf.points); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Generating insights..." />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950">
      <TopHeader title="AI Insights ✨" subtitle="Intelligent analysis of your financial health" />

      <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Top Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm relative overflow-hidden animate-fade-in-left stagger-1" style={{ boxShadow: '0 2px 16px rgba(99,102,241,0.07), 0 1px 4px rgba(0,0,0,0.04)' }}>
            {/* Top accent strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-2xl" />
            <div className="flex items-center justify-between mb-2 z-10 relative mt-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <LuActivity className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">7-Day Cash Flow</h2>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 hidden sm:flex">
                  <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-blue-500 rounded-full inline-block" /> Outflow</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-emerald-500 rounded-full inline-block border-dashed border border-emerald-500" /> Paid</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-200 transition-colors">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">7 Days</span>
                  <LuChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-90" />
                </div>
              </div>
            </div>

            <CashflowChart points={cashflow} />
          </div>

          <div className="xl:col-span-1 animate-fade-in-right stagger-2">
            <FinancialHealth />
          </div>
        </div>

        {/* Insight cards */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <LuShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">Smart Insights <span className="text-base font-bold text-slate-400">({insights.length})</span></h2>
            </div>
            <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors">
              View all <LuChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
            {insights.map((ins, i) => {
              const s = SEV_STYLE[ins.severity];
              return (
                <div key={i} className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 min-w-[270px] sm:min-w-[380px] max-w-[420px] flex-shrink-0 snap-start border shadow-sm relative overflow-hidden group hover-lift transition-all ${s.border} animate-fade-in-up`} style={{ animationDelay: `${i * 0.08}s` }}>
                  {/* Colored top gradient strip */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${s.strip}`} />

                  <div className="flex items-start gap-4 mt-1">
                    <div className={`w-11 h-11 rounded-2xl ${s.bg} border ${s.border} flex items-center justify-center shrink-0 text-lg shadow-sm`}>
                      {s.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-black text-slate-800 dark:text-white text-[15px] group-hover:text-indigo-600 transition-colors tracking-tight">{ins.title}</h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${s.badge}`}>{ins.severity}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{ins.body}</p>

                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                          Review now <LuChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in-up stagger-5">
          <div className="lg:col-span-2">
            <ChatPanel />
          </div>
          <div className="lg:col-span-1">
            <BalanceSimulator />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
