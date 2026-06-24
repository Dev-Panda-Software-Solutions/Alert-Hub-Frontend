import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LuShield, LuMail, LuLock, LuEye, LuEyeOff, LuUser, LuGlobe } from 'react-icons/lu';
import { useAuth } from '../context/useAuth';
import { useToast } from '../components/ui/Toast';
import { userApi } from '../services/api';
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

const SignupPage: React.FC = () => {
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [country,  setCountry]  = useState('India');
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    userApi.getCountries()
      .then((d) => setCountries(sortCountriesForIndia(d.countries)))
      .catch(() => setCountries(sortCountriesForIndia(['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Singapore', 'Canada', 'Australia'])));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    try {
      await signup(name, email, password, country);
      toast('Account created! Welcome to AlertHub', 'success');
      navigate('/dashboard');
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : 'Sign up failed', 'error');
    }
  };

  const strength = getStrength(password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 mb-4">
            <LuShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AlertHub</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Create your free account</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Get started for free</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button type="submit" disabled={isLoading} className="w-full btn btn-primary py-2.5 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

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
