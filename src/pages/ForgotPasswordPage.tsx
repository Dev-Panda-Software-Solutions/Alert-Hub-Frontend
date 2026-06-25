import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuMail, LuArrowLeft, LuCircleCheck } from 'react-icons/lu';
import { authApi } from '../services/api';
import { useToast } from '../components/ui/Toast';

const ForgotPasswordPage: React.FC = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch {
      // Always show success — don't reveal if email exists
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Alert-Guard" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Alert-Guard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Reset your password</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          {sent ? (
            <div className="text-center py-4">
              <LuCircleCheck className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Check your email</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                If an account exists for <strong className="text-slate-700 dark:text-slate-200">{email}</strong>,
                we've sent a password reset link. It expires in 30 minutes.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
                Didn't receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Forgot your password?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <LuArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
