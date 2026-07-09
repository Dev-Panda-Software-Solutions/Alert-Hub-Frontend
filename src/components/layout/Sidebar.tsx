import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { resolveAssetUrl } from '../../config/api.config';
import {
  LuLayoutDashboard, LuBell, LuCalendar, LuSparkles,
  LuZap, LuUser, LuLogOut, LuChevronsLeft, LuChevronsRight, LuX,
} from 'react-icons/lu';
import { useAuth } from '../../context/useAuth';
import { useLayout } from '../../context/LayoutContext';
import type { Plan } from '../../types';

const PLAN_BADGE: Record<Plan, { bg: string; text: string; label: string }> = {
  FREE: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', label: 'Free' },
  PERSONAL: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', label: 'Personal' },
  FAMILY: { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', label: 'Family' },
  BUSINESS: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', label: 'Business' },
};

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: LuLayoutDashboard },
  { to: '/reminders', label: 'Reminders', Icon: LuBell },
  { to: '/calendar', label: 'Calendar', Icon: LuCalendar },
  { to: '/insights', label: 'AI Insights', Icon: LuSparkles, badge: 'AI' },
  { to: '/pricing', label: 'Upgrade', Icon: LuZap },
  { to: '/profile', label: 'Profile', Icon: LuUser },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = useLayout();
  const plan = PLAN_BADGE[user?.plan ?? 'FREE'];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside
      className={[
        'flex flex-col bg-white dark:bg-slate-900',
        'transition-all duration-300 ease-in-out',
        /* Desktop: sticky full-height with border right */
        'md:flex md:sticky md:top-0 md:border-r md:border-slate-200 md:dark:border-slate-800',
        'h-screen overflow-hidden',
        /* Mobile: off-canvas drawer from right (since icon is on right) */
        mobileOpen ? 'fixed inset-y-0 right-0 z-50 shadow-2xl border-l border-slate-200 dark:border-slate-800' : 'hidden',
        collapsed && !mobileOpen ? 'w-16' : 'w-64',
      ].join(' ')}
    >
      {/* Logo row */}
      <div className={`flex items-center border-b border-slate-100 dark:border-slate-800 ${collapsed ? 'px-3 py-5 justify-center' : 'px-4 py-5 gap-3'}`}>
        <img src="/logo.svg" alt="Alert-Guard" className="w-9 h-9 shrink-0" />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">Alert-Guard</span>
            <p className="text-xs text-slate-400 dark:text-slate-500 -mt-0.5">Smart Finance Alerts</p>
          </div>
        )}
        {/* Mobile close */}
        {mobileOpen && !collapsed && (
          <button onClick={closeMobile} className="ml-auto p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden">
            <LuX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-4 space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
        {NAV.map(({ to, label, Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeMobile}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center rounded-xl text-sm font-medium transition-all duration-150 group
              ${collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}
              ${isActive
                ? 'nav-active'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`shrink-0 transition-colors ${collapsed ? 'w-5 h-5' : 'w-4 h-4'}
                  ${isActive ? 'text-blue-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}
                />
                {!collapsed && (
                  <>
                    {label}
                    {badge && (
                      <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md bg-linear-to-r from-blue-500 to-indigo-500 text-white font-semibold leading-none">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card + collapse toggle */}
      {user && (
        <div className={`border-t border-slate-100 dark:border-slate-800 pt-3 pb-4 ${collapsed ? 'px-2' : 'px-3'}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-1.5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-linear-to-br from-blue-500 to-indigo-600 shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user.avatarUrl
                  ? <img src={resolveAssetUrl(user.avatarUrl)!} alt={user.name} className="w-full h-full object-cover" />
                  : user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">{user.name}</p>
                <span className={`inline-block text-xs px-1.5 py-0.5 rounded-md font-semibold ${plan.bg} ${plan.text} leading-tight mt-0.5`}>
                  {plan.label}
                </span>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Sign out' : undefined}
            className={`w-full flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all
              ${collapsed ? 'justify-center p-3' : 'gap-2 px-3 py-2 mb-1'}`}
          >
            <LuLogOut className="w-4 h-4 shrink-0" />
            {!collapsed && 'Sign out'}
          </button>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`hidden md:flex w-full items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all
              ${collapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'}`}
          >
            {collapsed ? <LuChevronsRight className="w-4 h-4" /> : (
              <><LuChevronsLeft className="w-4 h-4" />Collapse</>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
