import React, { useEffect, useRef, useState } from 'react';
import { LuSun, LuMoon, LuGlobe, LuMenu, LuChevronDown, LuCheck } from 'react-icons/lu';
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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const handleSelect = async (country: string) => {
    setOpen(false);
    setSearch('');
    if (!user || user.sandbox || country === user.country) return;
    setChanging(true);
    try { await userApi.updateProfile({ country }); updateLocalUser({ country }); }
    catch {}
    finally { setChanging(false); }
  };

  const filtered = search.trim()
    ? countries.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
    : countries;

  const selected = user?.country || 'India';

  return (
    <header className={`sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all`}>
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

        {/* Custom country dropdown */}
        {!user?.sandbox && countries.length > 0 && (
          <div ref={dropdownRef} className="relative hidden sm:block">
            {/* Trigger button */}
            <button
              onClick={() => setOpen((v) => !v)}
              disabled={changing}
              className="flex items-center gap-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-60 max-w-44"
            >
              <LuGlobe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{countryLabel(selected)}</span>
              <LuChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown panel */}
            {open && (
              <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden">
                {/* Search */}
                <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country..."
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none border border-transparent focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* List */}
                <ul className="max-h-60 overflow-y-auto py-1">
                  {filtered.length === 0 && (
                    <li className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">No results</li>
                  )}
                  {filtered.map((c) => {
                    const isActive = c === selected;
                    return (
                      <li key={c}>
                        <button
                          onClick={() => handleSelect(c)}
                          className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors
                            ${isActive
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                            }`}
                        >
                          <span className="truncate">{countryLabel(c)}</span>
                          {isActive && <LuCheck className="w-3.5 h-3.5 shrink-0 text-blue-500" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
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
