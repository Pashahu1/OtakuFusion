'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import {
  emailsMatch,
  readApiMessage,
  RESEND_COOLDOWN_SEC,
} from '@/features/auth/lib/verify-email-utils';

interface UseVerifyEmailFormParams {
  initialEmail: string;
  onVerified?: () => void;
}

async function refreshAuthSession(refreshUser: () => Promise<void>) {
  await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  await refreshUser();
}

export function useVerifyEmailForm({ initialEmail, onVerified }: UseVerifyEmailFormParams) {
  const { user, refreshUser } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [time, setTime] = useState(RESEND_COOLDOWN_SEC);
  const [isLoading, setIsLoading] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (time <= 0) return;
    const id = window.setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [time]);

  const trimmedEmail = email.trim();
  const canResend = time === 0 && Boolean(trimmedEmail) && !isLoading;
  const resendProgress =
    time > 0 ? (RESEND_COOLDOWN_SEC - time) / RESEND_COOLDOWN_SEC : 1;

  async function handleAlreadyVerified(message: string) {
    toast.success(message);
    if (user && emailsMatch(user.email, trimmedEmail)) {
      await refreshAuthSession(refreshUser);
      onVerified?.();
    }
  }

  async function handleResend() {
    if (!canResend) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const message = await readApiMessage(res, '');

      if (res.ok) {
        if (message.toLowerCase().includes('already verified')) {
          await handleAlreadyVerified(message);
          return;
        }
        toast.success('We sent a new code to your email.');
        setTime(RESEND_COOLDOWN_SEC);
        return;
      }
      if (res.status === 404) {
        toast.error('No account with this email.');
        return;
      }
      toast.error(message || 'Could not resend code.');
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    setEmailError(!trimmedEmail);
    setCodeError(!code.trim());

    if (!trimmedEmail || !code.trim()) {
      if (!trimmedEmail) toast.error('Enter your email.');
      else if (!code.trim()) toast.error('Enter the 6-digit code.');
      return;
    }

    setIsLoading(true);
    setCodeError(false);
    setEmailError(false);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, code: code.trim() }),
      });
      const message = await readApiMessage(res, 'Invalid or expired code.');

      if (!res.ok) {
        setCodeError(true);
        toast.error(message);
        return;
      }

      toast.success('Email verified!');
      if (user && emailsMatch(user.email, trimmedEmail)) {
        await refreshAuthSession(refreshUser);
      }
      onVerified?.();
    } catch {
      setCodeError(true);
      toast.error('Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleEmailChange(next: string) {
    setEmail(next);
    if (emailError) setEmailError(false);
  }

  function handleCodeChange(next: string) {
    setCode(next);
    if (codeError) setCodeError(false);
  }

  return {
    email,
    code,
    time,
    isLoading,
    codeError,
    emailError,
    canResend,
    resendProgress,
    handleVerify,
    handleResend,
    handleEmailChange,
    handleCodeChange,
  };
}
