import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { LayoutProvider, useLayout } from '../../context/LayoutContext';

const AppLayoutInner: React.FC = () => {
  const { mobileOpen, closeMobile } = useLayout();
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

const AppLayout: React.FC = () => (
  <LayoutProvider>
    <AppLayoutInner />
  </LayoutProvider>
);

export default AppLayout;
