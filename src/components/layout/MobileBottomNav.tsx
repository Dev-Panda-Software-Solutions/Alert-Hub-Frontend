import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LuLayoutDashboard, LuBell, LuCalendar, LuSparkles, LuUser, LuLayoutGrid
} from 'react-icons/lu';
import { useLayout } from '../../context/LayoutContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home',      Icon: LuLayoutDashboard },
  { to: '/reminders', label: 'Reminders', Icon: LuBell },
  { to: '/calendar',  label: 'Calendar',  Icon: LuCalendar },
  { to: '/insights',  label: 'AI',        Icon: LuSparkles },
];

const MobileBottomNav: React.FC = () => {
  const { openMobile } = useLayout();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 safe-bottom">
    <div className="flex items-center justify-around px-1 h-14">
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-colors ${
                isActive ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
              }`}>
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </div>
              <span className={`text-[10px] font-semibold leading-none ${isActive ? 'font-bold' : ''}`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
      
      {/* Menu Button */}
      <button
        onClick={openMobile}
        className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-xl transition-colors text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300"
      >
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl transition-colors">
          <LuLayoutGrid className="w-5 h-5 transition-transform" />
        </div>
        <span className="text-[10px] font-semibold leading-none">
          Menu
        </span>
      </button>
    </div>
  </nav>
  );
};

export default MobileBottomNav;
