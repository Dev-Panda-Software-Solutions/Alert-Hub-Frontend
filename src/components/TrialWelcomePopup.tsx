import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { userApi } from '../services/api';

// ── tiny inline confetti canvas ────────────────────────────────────────────────
const COLORS = ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    type Particle = { x: number; y: number; vx: number; vy: number; rot: number; rotSpeed: number; size: number; color: string; shape: 'rect' | 'circle' };

    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x:        Math.random() * canvas.width,
      y:        Math.random() * canvas.height - canvas.height,
      vx:       (Math.random() - 0.5) * 3,
      vy:       2 + Math.random() * 4,
      rot:      Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      size:     4 + Math.random() * 8,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      shape:    Math.random() > 0.5 ? 'rect' : 'circle',
    }));

    let running = true;
    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        p.rot += p.rotSpeed;
        if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.9;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      });
      requestAnimationFrame(animate);
    };
    animate();

    // Stop confetti after 30 s, clear canvas so nothing stays frozen
    const stopTimer = setTimeout(() => {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 30000);
    return () => { running = false; clearTimeout(stopTimer); ctx.clearRect(0, 0, canvas.width, canvas.height); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl" />;
}

// ── main popup ─────────────────────────────────────────────────────────────────
function fmt(date: string) {
  return new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

const TrialWelcomePopup: React.FC = () => {
  const { user, updateLocalUser } = useAuth();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  const shouldShow =
    user &&
    !user.sandbox &&
    !user.trialSeen &&
    user.trialEndsAt &&
    new Date(user.trialEndsAt) > new Date();

  useEffect(() => {
    if (shouldShow) {
      // Small delay so the dashboard renders first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [shouldShow]);

  const dismiss = async () => {
    setClosing(true);
    setTimeout(() => { setVisible(false); setClosing(false); }, 280);
    updateLocalUser({ trialSeen: true });
    try { await userApi.markTrialSeen(); } catch { /* non-critical */ }
  };

  const goToPricing = async () => {
    await dismiss();
    navigate('/pricing');
  };

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${closing ? 'scale-90 opacity-0' : 'scale-100 opacity-100'}`}>

        {/* Confetti layer */}
        <ConfettiCanvas />

        {/* Gradient header */}
        <div className="relative px-5 sm:px-8 pt-8 sm:pt-10 pb-5 sm:pb-6 text-center bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-2xl font-extrabold text-white leading-tight">
            You've got a free month!
          </h2>
          <p className="text-blue-100 mt-1 text-sm">Personal Plan — 28-day free trial, activated for you</p>
        </div>

        {/* Body */}
        <div className="relative px-5 sm:px-8 py-5 sm:py-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3 mb-5 text-center">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-widest mb-0.5">Trial expires on</p>
            <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
              {user?.trialEndsAt ? fmt(user.trialEndsAt) : ''}
            </p>
          </div>

          <ul className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-300">
            {[
              'Unlimited reminders (no cap)',
              'Email & WhatsApp notifications',
              'Monthly & yearly recurrence',
              'Full AI Insights',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-emerald-500 text-base">✓</span> {f}
              </li>
            ))}
          </ul>

          <div className="flex gap-3">
            <button
              onClick={goToPricing}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
            >
              View plan details
            </button>
            <button
              onClick={dismiss}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialWelcomePopup;
