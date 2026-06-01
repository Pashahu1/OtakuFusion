'use client';

import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { VerifyEmailModal } from '@/features/auth/ui/VerifyEmailModal';
import { createContext, useContext, useEffect, useState } from 'react';

import {
  fetchAuthMe,
  loginWithCredentials,
  logoutSession,
} from './auth/authSessionApi';
import type { AuthContextType, AuthUser } from './auth/authTypes';

type AuthProviderProps = {
  children: React.ReactNode;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileSavePending, setProfileSavePending] = useState(false);
  const [profileNavbarAvatarHold, setProfileNavbarAvatarHold] = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
  const [verifyEmailAddress, setVerifyEmailAddress] = useState('');

  useEffect(() => {
    if (!isLoading) return;
    fetchAuthMe()
      .then((nextUser) => setUser(nextUser))
      .catch(() => setUser(null))
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
    const result = await loginWithCredentials(email, password);
    if (!result.ok || !result.user) {
      return { ok: false, message: result.message };
    }
    setUser(result.user);
    if (!result.user.isVerified) {
      setVerifyEmailAddress(result.user.email);
      setVerifyEmailOpen(true);
    }
    return { ok: true };
  };

  const logout = async () => {
    await logoutSession();
    setUser(null);
    setIsLoading(false);
    setProfileNavbarAvatarHold(false);
    setProfileSavePending(false);
  };

  const refreshUser = async () => {
    try {
      const nextUser = await fetchAuthMe();
      setUser(nextUser);
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
