import React, { useEffect, useState, useRef } from 'react';
import TopHeader from '../components/layout/TopHeader';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { insightsApi, userApi } from '../services/api';
import { useAuth } from '../context/useAuth';
import { useToast } from '../components/ui/Toast';
import { formatAmount } from '../utils/currency';
import type { Insight, CashflowPoint, InsightSeverity } from '../types';

// ── Severity styling ───────────────────────────────────────────────────────────
const SEV_STYLE: Record<InsightSeverity, { border: string; bg: string; icon: string; badge: string }> = {
  info:     { border: 'border-blue-200 dark:border-blue-800',    bg: 'bg-blue-50 dark:bg-blue-900/20',    icon: 'ℹ️', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  warning:  { border: 'border-amber-200 dark:border-amber-800',  bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: '⚠️', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  critical: { border: 'border-red-200 dark:border-red-800',      bg: 'bg-red-50 dark:bg-red-900/20',      icon: '🚨', badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  success:  { border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: '✅', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
};

// ── SVG Cashflow Chart ─────────────────────────────────────────────────────────
const CashflowChart: React.FC<{ points: CashflowPoint[] }> = ({ points }) => {
  if (!points.length) return null;

  const W = 600; const H = 160; const PAD = 40;
  const maxVal = Math.max(...points.map((p) => p.outflow), 1);
  const xStep = (W - PAD * 2) / (points.length - 1);

  const toX = (i: number) => PAD + i * xStep;
  const toY = (v: number) => H - PAD - ((v / maxVal) * (H - PAD * 2));

  const outflowPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.outflow)}`).join(' ');
  const paidPath    = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.paid)}`).join(' ');
  const areaPath    = `${outflowPath} L ${toX(points.length - 1)} ${H - PAD} L ${PAD} ${H - PAD} Z`;
  const today = new Date().toISOString().split('T')[0];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Cashflow chart">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Y axis grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = H - PAD - frac * (H - PAD * 2);
        return (
          <g key={frac}>
            <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="currentColor" strokeOpacity="0.08" />
            <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="9" fill="currentColor" fillOpacity="0.4">
              {formatAmount(maxVal * frac, 'India').replace('₹', '')}
            </text>
          </g>
        );
      })}
      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />
      {/* Today vertical line */}
      {points.findIndex((p) => p.date === today) >= 0 && (
        <line
          x1={toX(points.findIndex((p) => p.date === today))}
          y1={PAD} x2={toX(points.findIndex((p) => p.date === today))} y2={H - PAD}
          stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 2"
        />
      )}
      {/* Outflow line */}
      <path d={outflowPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Paid line */}
      <path d={paidPath} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" strokeLinecap="round" />
      {/* X labels */}
      {points.map((p, i) => (
        <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.5">
          {p.date.slice(5)}
        </text>
      ))}
      {/* Data dots */}
      {points.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p.outflow)} r="3" fill="#3b82f6" />
      ))}
    </svg>
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
const ALL_SUGGESTIONS = [
  "What's due this week?",
  "What's due this month?",
  "Show my overdue items",
  "What is my biggest expense?",
  "Can I afford this month?",
  "Show my EMIs",
  "What are my subscriptions?",
  "Show my taxes",
  "Show my investments",
  "How many reminders do I have?",
  "What's my total monthly burden?",
  "Show upcoming bills",
  "Which reminders are completed?",
  "Show me Finance reminders",
  "Show me Family reminders",
  "Show me Business reminders",
  "Am I on track this month?",
  "What's due tomorrow?",
  "Show high value reminders",
  "What are my yearly commitments?",
  "How much is due this quarter?",
  "Show me all pending items",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any;
const SR: (new () => AnySpeechRecognition) | undefined =
  typeof window !== 'undefined'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition)
    : undefined;

const ChatPanel: React.FC = () => {
  const [input, setInput]       = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [thinking, setThinking] = useState(false);
  const [listening, setListening]     = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(false);
  const recognitionRef = useRef<AnySpeechRecognition>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* Rotating suggestions */
  const [visibleSuggestions, setVisibleSuggestions] = useState(() =>
    [...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, 3)
  );
  const [suggestFade, setSuggestFade] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setSuggestFade(false);
      setTimeout(() => {
        setVisibleSuggestions([...ALL_SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, 3));
        setSuggestFade(true);
      }, 300);
    }, 3500);
    return () => clearInterval(id);
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

  // Speak last AI message when voice output is on
  useEffect(() => {
    if (!voiceOutput || !messages.length) return;
    const last = messages[messages.length - 1];
    if (last.role !== 'ai' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(last.text.replace(/[*#•\-]/g, ''));
    utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
  }, [messages, voiceOutput]);

  const startListening = () => {
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (e: AnySpeechRecognition) => {
      const text = e.results[0][0].transcript;
      send(text);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return (
    <div className="card p-5 flex flex-col h-105">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-white flex-1">Ask AI</h3>

        {/* Voice output toggle */}
        <button
          onClick={() => { setVoiceOutput((v) => !v); window.speechSynthesis?.cancel(); }}
          title={voiceOutput ? 'Mute voice output' : 'Enable voice output'}
          className={`p-1.5 rounded-lg transition-colors text-lg ${
            voiceOutput
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {voiceOutput ? '🔊' : '🔇'}
        </button>

        {/* Mic button */}
        {SR && (
          <button
            onClick={listening ? stopListening : startListening}
            title={listening ? 'Stop listening' : 'Speak your question'}
            className={`p-1.5 rounded-lg transition-colors text-lg ${
              listening
                ? 'bg-red-100 dark:bg-red-900/40 text-red-600 animate-pulse'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🎤
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Try asking:</p>
            <div
              style={{ transition: 'opacity 300ms', opacity: suggestFade ? 1 : 0 }}
              className="space-y-1.5"
            >
              {visibleSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="block w-full text-left text-xs px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-300 dark:text-slate-600 text-center pt-1">Suggestions rotate automatically</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
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
            <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-sm">Thinking…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? 'Listening…' : 'Ask about your finances…'}
          className="input flex-1 text-sm"
          disabled={listening}
        />
        <button type="submit" disabled={thinking || listening} className="btn btn-primary text-sm px-4 disabled:opacity-60">Send</button>
      </form>
    </div>
  );
};

// ── Simulator ─────────────────────────────────────────────────────────────────
const BalanceSimulator: React.FC = () => {
  const { user, updateLocalUser } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(String(user?.simBalance ?? 75000));
  const [saving, setSaving]   = useState(false);

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
    <div className="card p-5">
      <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Balance Simulator</h3>
      <p className="text-xs text-slate-400 mb-4">Set a simulated bank balance to test affordability insights</p>
      <div className="flex gap-3">
        <input
          type="number" min={0} step={1000}
          value={balance} onChange={(e) => setBalance(e.target.value)}
          className="input flex-1"
        />
        <button onClick={save} disabled={saving} className="btn btn-primary disabled:opacity-60">
          {saving ? '…' : 'Update'}
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-2">Current: {formatAmount(user?.simBalance ?? 0, user?.country || 'India')}</p>
    </div>
  );
};

// ── Money Planning Tips ────────────────────────────────────────────────────────
const PLANNING_TIPS = [
  { icon: '📅', title: 'Track every due date', tip: 'Add all your EMIs, subscriptions, and bills as reminders so nothing slips through — even a ₹500 late fee adds up over a year.' },
  { icon: '🗂️', title: 'Sort by module', tip: 'Use Business, Family, and Finance modules to see where most of your money goes each month. Most people are surprised by their Family spend.' },
  { icon: '🔔', title: 'Get notified early', tip: 'Set reminders 3–5 days before the due date, not on the same day. This gives you time to transfer funds and avoid interest penalties.' },
  { icon: '📈', title: 'Watch your cashflow', tip: 'The chart above shows which months are heavy. If you see a spike, plan your income or savings transfer a month ahead.' },
  { icon: '✅', title: 'Mark as done', tip: 'Once you pay, mark the reminder complete. This keeps your "overdue" count clean and shows you your actual payment track record.' },
  { icon: '💡', title: 'Ask the AI', tip: 'Type "What is my biggest expense?" or "Show overdue items" in the chat below — the AI reads your actual reminders and gives you a real answer.' },
];

const PlanningTipsSection: React.FC = () => (
  <div className="card p-5">
    <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Smart Money Planning</h3>
    <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Tips to get the most out of Alert-Guard for your finances</p>
    <div className="space-y-3">
      {PLANNING_TIPS.map((t, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <span className="text-xl shrink-0 mt-0.5">{t.icon}</span>
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{t.tip}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const InsightsPage: React.FC = () => {
  const [insights, setInsights]   = useState<Insight[]>([]);
  const [cashflow, setCashflow]   = useState<CashflowPoint[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([insightsApi.getInsights(), insightsApi.getCashflow()])
      .then(([ins, cf]) => { setInsights(ins.insights); setCashflow(cf.points); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Generating insights…" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <TopHeader title="AI Insights" subtitle="Intelligent analysis of your financial health" />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Cashflow chart */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-slate-800 dark:text-white">7-Day Cash Flow</h2>
            <span className="ml-auto flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-blue-500 inline-block" /> Outflow</span>
              <span className="flex items-center gap-1"><span className="w-4 h-px bg-emerald-500 inline-block border-dashed border-t border-emerald-500" /> Paid</span>
            </span>
          </div>
          <CashflowChart points={cashflow} />
        </div>

        {/* Insight cards */}
        <div>
          <h2 className="font-semibold text-slate-800 dark:text-white mb-3">Smart Insights ({insights.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins, i) => {
              const s = SEV_STYLE[ins.severity];
              return (
                <div key={i} className={`card p-4 border ${s.border} ${s.bg}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{s.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{ins.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${s.badge}`}>{ins.severity}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{ins.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChatPanel />
          <div className="space-y-5">
            <BalanceSimulator />
            <PlanningTipsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
