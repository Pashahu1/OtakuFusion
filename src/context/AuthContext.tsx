'use client';

import { fetchWithRefresh } from '@/lib/fetchWithRefresh';
import { createContext, useContext, useEffect, useState } from 'react';

type AuthProviderProps = {
  children: React.ReactNode;
};

interface LoginResult {
  ok: boolean;
  message?: string;
  needVerification?: boolean;
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
      .finally(() => setIsLoading(false));
  }, [isLoading]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.needVerification) {
        return { ok: false, needVerification: true, message: data.message };
      }
      if (!res.ok) {
        return { ok: false, message: data.message || 'Login failed' };
      }
      const me = await fetchWithRefresh('/api/auth/me', {
        credentials: 'include',
      }).then((r) => r.json());
      if (me.user) {
        setUser(me.user);
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
    setIsLoading(true);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
