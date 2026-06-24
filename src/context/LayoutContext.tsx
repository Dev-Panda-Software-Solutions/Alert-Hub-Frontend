import React, { createContext, useContext, useState, useEffect } from 'react';

interface LayoutContextType {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

const LayoutContext = createContext<LayoutContextType>({
  collapsed: false, mobileOpen: false,
  toggleCollapsed: () => {}, openMobile: () => {}, closeMobile: () => {},
});

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem('sidebar_collapsed') === 'true'
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route changes
  useEffect(() => {
    const close = () => setMobileOpen(false);
    window.addEventListener('popstate', close);
    return () => window.removeEventListener('popstate', close);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      localStorage.setItem('sidebar_collapsed', String(!v));
      return !v;
    });
  };

  return (
    <LayoutContext.Provider value={{
      collapsed, mobileOpen,
      toggleCollapsed,
      openMobile:  () => setMobileOpen(true),
      closeMobile: () => setMobileOpen(false),
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);
