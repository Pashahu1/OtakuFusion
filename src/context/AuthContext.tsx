'use client';

import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { VerifyEmailModal } from '@/features/auth/ui/VerifyEmailModal';
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
  /** While saving profile — InitialLoader over content. */
  profileSavePending: boolean;
  setProfileSavePending: (pending: boolean) => void;
  /**
   * After successful avatar upload: keep opaque skeleton in menu
   * until new image decodes (no flash of old photo).
   */
  profileNavbarAvatarHold: boolean;
  setProfileNavbarAvatarHold: (hold: boolean) => void;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  verifyEmailOpen: boolean;
  openVerifyEmailModal: (email?: string) => void;
  closeVerifyEmailModal: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileSavePending, setProfileSavePending] = useState(false);
  const [profileNavbarAvatarHold, setProfileNavbarAvatarHold] =
    useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
  const [verifyEmailAddress, setVerifyEmailAddress] = useState('');

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
  }, [isLoading]);

  const openVerifyEmailModal = (email?: string) => {
    const nextEmail = (email ?? user?.email ?? '').trim();
    if (!nextEmail) return;
    setVerifyEmailAddress(nextEmail);
    setVerifyEmailOpen(true);
  };

  const closeVerifyEmailModal = () => {
    setVerifyEmailOpen(false);
  };

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
        if (!data.user.isVerified) {
          setVerifyEmailAddress(data.user.email);
          setVerifyEmailOpen(true);
        }
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
    setProfileNavbarAvatarHold(false);
    setProfileSavePending(false);
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
        profileSavePending,
        setProfileSavePending,
        profileNavbarAvatarHold,
        setProfileNavbarAvatarHold,
        login,
        logout,
        refreshUser,
        verifyEmailOpen,
        openVerifyEmailModal,
        closeVerifyEmailModal,
      }}
    >
      {isLoading ? (
        <InitialLoader />
      ) : (
        <>
          {children}
          {profileSavePending ? (
            <div className="fixed inset-x-0 bottom-0 top-[60px] z-[50] flex bg-zinc-950">
              <InitialLoader variant="container" className="min-h-0 flex-1" />
            </div>
          ) : null}
          {verifyEmailOpen && verifyEmailAddress ? (
            <VerifyEmailModal
              email={verifyEmailAddress}
              onClose={closeVerifyEmailModal}
              onVerified={closeVerifyEmailModal}
            />
          ) : null}
        </>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
