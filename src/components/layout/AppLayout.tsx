import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import { LayoutProvider, useLayout } from '../../context/LayoutContext';
import TrialWelcomePopup from '../TrialWelcomePopup';

const AppLayoutInner: React.FC = () => {
  const { mobileOpen, closeMobile } = useLayout();
  
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobile}
        />
      )}
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden min-h-screen pb-16 md:pb-0">
        <Outlet />
      </main>
      <MobileBottomNav />
      <TrialWelcomePopup />
    </div>
  );
};

const AppLayout: React.FC = () => (
  <LayoutProvider>
    <AppLayoutInner />
  </LayoutProvider>
);

export default AppLayout;
