import React, { createContext, useState, useCallback } from 'react';
import { authApi, setAuthToken, clearAuthToken } from '../services/api';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('authUser');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      localStorage.removeItem('authUser');
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(false);

  const persistSession = (tok: string, usr: User) => {
    setAuthToken(tok);
    localStorage.setItem('authUser', JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token: tok, user: usr } = await authApi.login(email, password);
      persistSession(tok, usr);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, country: string) => {
    setIsLoading(true);
    try {
      const { token: tok, user: usr } = await authApi.register({ name, email, password, country });
      persistSession(tok, usr);
    } finally {
      setIsLoading(false);
    }
  };

  const loginSandbox = async () => {
    setIsLoading(true);
    try {
      const { token: tok, user: usr } = await authApi.sandbox();
      persistSession(tok, usr);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithToken = (tok: string, usr: User) => {
    persistSession(tok, usr);
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    try {
      const usr = await authApi.me();
      setUser(usr);
      localStorage.setItem('authUser', JSON.stringify(usr));
    } catch {
      logout();
    }
  }, []);

  const updateLocalUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('authUser', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signup,
        loginSandbox,
        loginWithToken,
        logout,
        refreshUser,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
