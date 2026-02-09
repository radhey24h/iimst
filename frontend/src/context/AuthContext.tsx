'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = { userName: string; email: string; role: string; studentId?: string };

const AuthContext = createContext<{
  user: User | null;
  token: string | null;
  login: (u: User, t: string) => void;
  logout: () => void;
  isAdmin: boolean;
  isStudent: boolean;
}>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('iimst_token');
    const u = localStorage.getItem('iimst_user');
    if (t && u) {
      setToken(t);
      try {
        setUser(JSON.parse(u));
      } catch {}
    }
    setHydrated(true);
  }, []);

  const login = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem('iimst_token', t);
    localStorage.setItem('iimst_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('iimst_token');
    localStorage.removeItem('iimst_user');
  };

  if (!hydrated) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAdmin: user?.role === 'Admin',
        isStudent: user?.role === 'Student',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
