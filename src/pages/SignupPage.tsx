import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LuMail, LuLock, LuEye, LuEyeOff, LuUser, LuGlobe, LuArrowLeft, LuRefreshCw } from 'react-icons/lu';
import { useAuth } from '../context/useAuth';
import { useToast } from '../components/ui/Toast';
import { userApi, authApi } from '../services/api';
import { countryLabel, sortCountriesForIndia } from '../utils/currency';

type Strength = { label: string; color: string; bar: string; width: string };

function getStrength(pw: string): Strength | null {
  if (!pw) return null;
  if (pw.length < 6) return { label: 'Too short', color: 'text-red-500',    bar: 'bg-red-400',    width: 'w-1/4' };
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  if (score <= 1) return { label: 'Weak',   color: 'text-red-500',    bar: 'bg-red-400',    width: 'w-1/3' };
  if (score === 2) return { label: 'Fair',   color: 'text-amber-500',  bar: 'bg-amber-400',  width: 'w-1/2' };
  if (score === 3) return { label: 'Good',   color: 'text-blue-600',   bar: 'bg-blue-500',   width: 'w-3/4' };
  return           { label: 'Strong', color: 'text-emerald-600', bar: 'bg-emerald-500', width: 'w-full' };
}

const OTP_LENGTH = 6;

const SignupPage: React.FC = () => {
  const { loginWithToken } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Step 1 — signup form
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [country,  setCountry]  = useState('India');
  const [countries, setCountries] = useState<string[]>([]);

  // Step 2 — OTP verification
  const [step,      setStep]     = useState<1 | 2>(1);
  const [digits,    setDigits]   = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [sending,   setSending]  = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    userApi.getCountries()
      .then((d) => setCountries(sortCountriesForIndia(d.countries)))
      .catch(() => setCountries(sortCountriesForIndia(['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Singapore', 'Canada', 'Australia'])));
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Step 1 submit — send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    setSending(true);
    try {
      await authApi.sendSignupOtp({ name, email, password, country });
      setDigits(Array(OTP_LENGTH).fill(''));
      setStep(2);
      setCountdown(60);
      toast(`Verification code sent to ${email}`, 'success');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to send code', 'error');
    } finally {
      setSending(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (countdown > 0) return;
    setSending(true);
    try {
      await authApi.sendSignupOtp({ name, email, password, country });
      setDigits(Array(OTP_LENGTH).fill(''));
      setCountdown(60);
      toast('New verification code sent', 'success');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Failed to resend code', 'error');
    } finally {
      setSending(false);
    }
  };

  // OTP digit input handlers
  const handleDigitChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    if (digit && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleDigitKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  // Step 2 submit — verify OTP and create account
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) { toast('Enter the complete 6-digit code', 'error'); return; }
    setVerifying(true);
    try {
      const data = await authApi.verifySignupOtp(email, otp);
      loginWithToken(data.token, data.user);
      toast('Account created! Welcome to Alert-Guard 🎉', 'success');
      navigate('/dashboard');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Verification failed', 'error');
      // Clear digits on wrong code so user can re-enter
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setVerifying(false);
    }
  };

  const strength = getStrength(password);
  const otpFilled = digits.every(Boolean);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Alert-Guard" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Alert-Guard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {step === 1 ? 'Create your free account' : 'Verify your email'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">

          {/* ── STEP 1: Signup form ── */}
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Get started for free</h2>
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="input" style={{ paddingLeft: '2.5rem' }} />
                  </div>
                </div>

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
                    <input
                      type={showPw ? 'text' : 'password'} required minLength={6}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="input"
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10">
                      {showPw ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength.bar} ${strength.width}`} />
                      </div>
                      <p className={`text-xs mt-1 font-medium ${strength.color}`}>{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Country</label>
                  <div className="relative">
                    <LuGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <select value={country} onChange={(e) => setCountry(e.target.value)} className="input" style={{ paddingLeft: '2.5rem' }}>
                      {countries.map((c) => <option key={c} value={c}>{countryLabel(c)}</option>)}
                    </select>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Sets the currency symbol throughout the app (₹ India, $ USA, £ UK…)</p>
                </div>

                <button type="submit" disabled={sending} className="w-full btn btn-primary py-2.5 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                  {sending ? 'Sending code…' : 'Send Verification Code →'}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2: OTP entry ── */}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-5 transition-colors">
                <LuArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <LuMail className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Check your inbox</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  We sent a 6-digit code to
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{email}</p>
              </div>

              <form onSubmit={handleVerify} className="space-y-5">
                {/* OTP digit boxes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 text-center">Enter verification code</label>
                  <div className="flex justify-center gap-2" onPaste={handleDigitPaste}>
                    {digits.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(i, e)}
                        className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none
                          ${d
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white'
                          }
                          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!otpFilled || verifying}
                  className="w-full btn btn-primary py-2.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {verifying ? 'Verifying…' : 'Verify & Create Account'}
                </button>
              </form>

              {/* Resend */}
              <div className="mt-4 text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-slate-400">Resend code in <span className="font-semibold text-slate-600 dark:text-slate-300">{countdown}s</span></p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={sending}
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  >
                    <LuRefreshCw className={`w-3.5 h-3.5 ${sending ? 'animate-spin' : ''}`} />
                    {sending ? 'Sending…' : 'Resend code'}
                  </button>
                )}
              </div>

              <p className="mt-3 text-center text-xs text-slate-400">
                Didn&rsquo;t receive it? Check your spam folder.
              </p>
            </>
          )}

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
