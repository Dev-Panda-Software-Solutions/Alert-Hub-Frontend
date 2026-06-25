import React, { useEffect, useState } from 'react';
import { LuSun, LuMoon, LuGlobe, LuMenu } from 'react-icons/lu';
import { useTheme } from '../../context/useTheme';
import { useAuth } from '../../context/useAuth';
import { useLayout } from '../../context/LayoutContext';
import { userApi } from '../../services/api';
import { countryLabel, sortCountriesForIndia } from '../../utils/currency';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
}

const TopHeader: React.FC<TopHeaderProps> = ({ title, subtitle }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, updateLocalUser } = useAuth();
  const { openMobile, collapsed } = useLayout();
  const [countries, setCountries] = useState<string[]>([]);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (!user || user.sandbox) return;
    const cached = sessionStorage.getItem('ah_countries');
    if (cached) { setCountries(sortCountriesForIndia(JSON.parse(cached))); return; }
    userApi.getCountries().then(({ countries: c }) => {
      const sorted = sortCountriesForIndia(c);
      setCountries(sorted);
      sessionStorage.setItem('ah_countries', JSON.stringify(sorted));
    }).catch(() => {});
  }, [user?.sandbox]);

  const handleCountryChange = async (country: string) => {
    if (!user || user.sandbox) return;
    setChanging(true);
    try { await userApi.updateProfile({ country }); updateLocalUser({ country }); }
    catch {}
    finally { setChanging(false); }
  };

  return (
    <header className={`sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all ${collapsed ? '' : ''}`}>
      {/* Hamburger — mobile only */}
      <button
        onClick={openMobile}
        aria-label="Open menu"
        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
      >
        <LuMenu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {user?.sandbox && (
          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-700/50 hidden sm:inline-flex">
            Sandbox
          </span>
        )}

        {/* Country selector */}
        {!user?.sandbox && countries.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <LuGlobe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={user?.country || 'India'}
              onChange={(e) => handleCountryChange(e.target.value)}
              disabled={changing}
              className="bg-transparent focus:outline-none cursor-pointer max-w-28 text-slate-700 dark:text-slate-200 disabled:opacity-60 text-xs"
              style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
            >
              {countries.map((c) => <option key={c} value={c}>{countryLabel(c)}</option>)}
            </select>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          {theme === 'dark' ? <LuSun className="w-4.5 h-4.5" /> : <LuMoon className="w-4.5 h-4.5" />}
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
