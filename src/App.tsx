import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { useAuth } from './context/useAuth';
import AppLayout from './components/layout/AppLayout';
import { registerPush } from './services/push';

// Pages
import LoginPage            from './pages/LoginPage';
import SignupPage           from './pages/SignupPage';
import ForgotPasswordPage   from './pages/ForgotPasswordPage';
import ResetPasswordPage    from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import RemindersPage from './pages/RemindersPage';
import CalendarPage  from './pages/CalendarPage';
import InsightsPage  from './pages/InsightsPage';
import PricingPage   from './pages/PricingPage';
import ProfilePage   from './pages/ProfilePage';

// Guard: redirect to /login if not authenticated
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Guard: redirect to /dashboard if already authenticated
const GuestOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

/* Auto-register push when user logs in */
const PushRegistrar: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = useAuth() as any;
  useEffect(() => {
    if (ctx.isAuthenticated && ctx.token) registerPush(ctx.token);
  }, [ctx.isAuthenticated, ctx.token]);
  return null;
};

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public */}
    <Route path="/login"           element={<GuestOnly><LoginPage /></GuestOnly>} />
    <Route path="/signup"          element={<GuestOnly><SignupPage /></GuestOnly>} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password"  element={<ResetPasswordPage />} />

    {/* Protected — all wrapped in AppLayout (sidebar + outlet) */}
    <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
      <Route index               element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard"   element={<DashboardPage />} />
      <Route path="/reminders"   element={<RemindersPage />} />
      <Route path="/calendar"    element={<CalendarPage />} />
      <Route path="/insights"    element={<InsightsPage />} />
      <Route path="/pricing"     element={<PricingPage />} />
      <Route path="/profile"     element={<ProfilePage />} />
    </Route>

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <PushRegistrar />
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
