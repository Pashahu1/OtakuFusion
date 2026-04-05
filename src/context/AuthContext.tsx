'use client';

import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { fetchWithRefresh } from '@/lib/fetchWithRefresh';
import { createContext, useContext, useEffect, useState } from 'react';

type AuthProviderProps = {
  children: React.ReactNode;
};

interface LoginResult {
  ok: boolean;
  message?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuth: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) return;
    fetchWithRefresh('/api/auth/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => {
        setUser(null);
        setIsLoading(false);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.message || 'Login failed' };
      }
      if (data.user) {
        setUser(data.user);
        return { ok: true };
      }
      return { ok: false, message: 'User not found after login' };
    } catch (err) {
      return { ok: false, message: 'Something went wrong' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setIsLoading(false);
  };

  const refreshUser = async () => {
    try {
      const res = await fetchWithRefresh('/api/auth/me', {
        credentials: 'include',
      });
      const data = (await res.json()) as { user?: User | null };
      if (!res.ok) {
        setUser(null);
        return;
      }
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuth: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {isLoading ? <InitialLoader /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
