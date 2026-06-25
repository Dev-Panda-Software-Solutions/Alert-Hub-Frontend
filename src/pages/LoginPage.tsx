import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LuMail, LuLock, LuEye, LuEyeOff, LuFlaskConical, LuCircleCheck, LuCircleX } from 'react-icons/lu';
import { useAuth } from '../context/useAuth';
import { useToast } from '../components/ui/Toast';

function getPasswordHint(pw: string): { ok: boolean; text: string } | null {
  if (!pw) return null;
  if (pw.length < 6) return { ok: false, text: 'Too short — needs at least 6 characters' };
  if (pw.length < 8) return { ok: true,  text: 'Password looks OK' };
  const score = [/[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (score === 0) return { ok: true,  text: 'Add uppercase or numbers for a stronger password' };
  if (score === 1) return { ok: true,  text: 'Good password' };
  return { ok: true, text: 'Strong password' };
}

const LoginPage: React.FC = () => {
  const { login, loginSandbox, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Login failed', 'error');
    }
  };

  const handleSandbox = async () => {
    try {
      await loginSandbox();
      toast('Sandbox mode — explore with demo data', 'info');
      navigate('/dashboard');
    } catch {
      toast('Could not start sandbox session', 'error');
    }
  };

  const hint = getPasswordHint(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Alert-Guard" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Alert-Guard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Smart payment &amp; reminder management</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input" style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                <input type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10">
                  {showPw ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                </button>
              </div>
              {hint && (
                <div className={`flex items-center gap-1.5 mt-1.5 text-xs ${hint.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                  {hint.ok ? <LuCircleCheck className="w-3.5 h-3.5 shrink-0" /> : <LuCircleX className="w-3.5 h-3.5 shrink-0" />}
                  {hint.text}
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn btn-primary py-2.5 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
            <div className="relative flex justify-center"><span className="text-xs text-slate-400 bg-white dark:bg-slate-900 px-2">or</span></div>
          </div>

          <button onClick={handleSandbox} disabled={isLoading} className="w-full btn btn-secondary py-2.5 text-sm disabled:opacity-60 flex items-center justify-center gap-2">
            <LuFlaskConical className="w-4 h-4 text-amber-500" />
            Try Sandbox (no account needed)
          </button>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
