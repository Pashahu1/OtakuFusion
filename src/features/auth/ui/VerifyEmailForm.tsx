'use client';

import { UnderlineField } from '@/components/auth/underline-field';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
  digitsOnly,
  emailsMatch,
  readApiMessage,
  RESEND_COOLDOWN_SEC,
} from '@/features/auth/lib/verify-email-utils';

interface VerifyEmailFormProps {
  initialEmail: string;
  lockEmail?: boolean;
  onVerified?: () => void;
  className?: string;
}

export function VerifyEmailForm({
  initialEmail,
  lockEmail = false,
  onVerified,
  className,
}: VerifyEmailFormProps) {
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
          toast.success(message);
          if (user && emailsMatch(user.email, trimmedEmail)) {
            await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include',
            });
            await refreshUser();
            onVerified?.();
          }
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
      const isSameAccount = user && emailsMatch(user.email, trimmedEmail);
      if (isSameAccount) {
        await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        await refreshUser();
      }
      onVerified?.();
    } catch {
      setCodeError(true);
      toast.error('Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const resendProgress =
    time > 0 ? (RESEND_COOLDOWN_SEC - time) / RESEND_COOLDOWN_SEC : 1;

  return (
    <form
      onSubmit={handleVerify}
      className={cn(
        'flex w-full flex-col rounded-[24px] border border-zinc-800/90 bg-[#141519]/95 p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-8',
        className,
      )}
      noValidate
    >
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-brand-orange)]/25 bg-[var(--color-brand-orange)]/10 shadow-[0_0_32px_-4px_rgba(244,117,33,0.35)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7 text-[var(--color-brand-orange)]"
          aria-hidden
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <path d="m22 6-10 7L2 6" />
        </svg>
      </div>

      <h2
        id="verify-email-modal-title"
        className="mb-2 text-center font-serif text-2xl font-normal tracking-tight text-white sm:text-[1.65rem]"
      >
        Verify your email
      </h2>

      <p className="mx-auto mb-6 max-w-[32ch] text-center text-sm leading-relaxed text-zinc-400">
        We sent a 6-digit code to your inbox. Paste it below — check spam if you
        don&apos;t see it.
      </p>

      <div className="space-y-1">
        <UnderlineField
          id="verify-email"
          label="Email address"
          hasError={emailError}
        >
          <input
            id="verify-email"
            type="email"
            autoComplete="email"
            value={email}
            readOnly={lockEmail}
            disabled={lockEmail}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(false);
            }}
            inputMode="email"
            className={cn(
              'w-full bg-transparent px-0 py-2 text-[var(--color-brand-text-primary)] outline-none placeholder:text-zinc-500',
              lockEmail && 'cursor-default opacity-80',
            )}
            placeholder=""
          />
        </UnderlineField>

        <div
          className={cn(
            'rounded-xl border px-4 pb-3 pt-1 transition-colors duration-200',
            codeError
              ? 'border-red-500/80 bg-red-950/20'
              : 'border-zinc-700/80 bg-zinc-950/40 focus-within:border-[var(--color-brand-orange)]/60 focus-within:shadow-[0_0_0_1px_rgba(244,117,33,0.15)]',
          )}
        >
          <label
            htmlFor="verify-code"
            className={cn(
              'mb-1 block text-xs font-medium tracking-wide',
              codeError ? 'text-red-400' : 'text-[var(--color-brand-orange)]',
            )}
          >
            6-digit code
          </label>
          <input
            id="verify-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(digitsOnly(e.target.value, 6));
              if (codeError) setCodeError(false);
            }}
            className="w-full bg-transparent py-2 text-center font-mono text-[1.65rem] tracking-[0.45em] text-[var(--color-brand-text-primary)] outline-none placeholder:text-zinc-600 sm:text-3xl sm:tracking-[0.5em]"
            placeholder="••••••"
            aria-label="Six digit verification code"
            aria-invalid={codeError}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="h-11 flex-1 rounded-lg bg-[var(--color-brand-orange)] py-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-brand-text-primary)] shadow-md shadow-[var(--color-brand-orange-light)]/40 transition hover:bg-[var(--color-brand-orange-light)] disabled:opacity-50"
        >
          {isLoading ? 'Verifying…' : 'Verify'}
        </button>
        <button
          type="button"
          disabled={!canResend}
          onClick={handleResend}
          className="h-11 flex-1 rounded-lg border border-zinc-600/90 bg-zinc-900/30 py-2 text-sm font-semibold uppercase tracking-wide text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800/40 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600 disabled:hover:bg-transparent"
        >
          Send again
        </button>
      </div>

      <div className="mt-5">
        <div
          className="h-1 overflow-hidden rounded-full bg-zinc-800"
          role="presentation"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-orange)]/20 to-[var(--color-brand-orange)] transition-[width] duration-1000 ease-linear"
            style={{ width: `${resendProgress * 100}%` }}
          />
        </div>
        <p className="mt-2 text-center text-xs text-zinc-500">
          {time > 0 ? (
            <>
              Resend available in{' '}
              <span className="tabular-nums font-medium text-zinc-300">
                {time}s
              </span>
            </>
          ) : (
            <span className="text-[var(--color-brand-orange)]">
              You can resend the code now
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
