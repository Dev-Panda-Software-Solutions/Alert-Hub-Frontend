import React from 'react';
import { LuSun, LuMoon, LuMenu } from 'react-icons/lu';
import { useTheme } from '../../context/useTheme';
import { useAuth } from '../../context/useAuth';
import { useLayout } from '../../context/LayoutContext';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
}

const TopHeader: React.FC<TopHeaderProps> = ({ title, subtitle }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { openMobile } = useLayout();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all">
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
