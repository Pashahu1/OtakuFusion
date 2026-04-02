'use client';

import { UnderlineField } from '@/components/auth/underline-field';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const RESEND_COOLDOWN_SEC = 30;

function digitsOnly(value: string, maxLen: number) {
  return value.replace(/\D/g, '').slice(0, maxLen);
}

function emailsMatch(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const emailFromUrl = searchParams.get('email')?.trim() ?? '';

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState('');
  const [time, setTime] = useState(RESEND_COOLDOWN_SEC);
  const [isLoading, setIsLoading] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  useEffect(() => {
    if (time <= 0) return;
    const id = window.setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [time]);

  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
  }, [emailFromUrl]);

  const trimmedEmail = email.trim();
  const canResend = time === 0 && Boolean(trimmedEmail) && !isLoading;

  const handleResend = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      let message = '';
      try {
        const data: unknown = await res.json();
        if (
          data &&
          typeof data === 'object' &&
          'message' in data &&
          typeof (data as { message: unknown }).message === 'string'
        ) {
          message = (data as { message: string }).message;
        }
      } catch {
        message = '';
      }

      if (res.ok) {
        if (message.toLowerCase().includes('already verified')) {
          toast.success(message);
          if (user && emailsMatch(user.email, trimmedEmail)) {
            void (async () => {
              await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
              });
              await refreshUser();
              router.push('/profile/manage');
            })();
          } else {
            setTimeout(() => router.push('/auth/login'), 1500);
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
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const data: unknown = await res.json();
      const message =
        data &&
        typeof data === 'object' &&
        'message' in data &&
        typeof (data as { message: unknown }).message === 'string'
          ? (data as { message: string }).message
          : 'Invalid or expired code.';

      if (!res.ok) {
        setCodeError(true);
        toast.error(message);
        return;
      }

      toast.success('Email verified. Redirecting…');
      const isSameAccount =
        user && emailsMatch(user.email, trimmedEmail);
      if (isSameAccount) {
        await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        await refreshUser();
        setTimeout(() => router.push('/profile/manage'), 800);
      } else {
        setTimeout(() => router.push('/auth/login'), 1200);
      }
    } catch {
      setCodeError(true);
      toast.error('Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendProgress =
    time > 0 ? (RESEND_COOLDOWN_SEC - time) / RESEND_COOLDOWN_SEC : 1;

  return (
    <form
      onSubmit={handleVerify}
      className="flex w-full flex-col rounded-[24px] border border-zinc-800/90 bg-[#141519]/75 p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-8"
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

      <h1 className="mb-2 text-center font-serif text-2xl font-normal tracking-tight text-white sm:text-[1.65rem]">
        Verify your email
      </h1>

      <p className="mx-auto mb-6 max-w-[32ch] text-center text-sm leading-relaxed text-zinc-400">
        We sent a 6-digit code to your inbox. Paste it below — check spam if you
        don&apos;t see it.
      </p>

      {!emailFromUrl && (
        <p className="mb-4 text-center text-xs leading-relaxed text-zinc-500">
          No email in the link? Enter it above or{' '}
          <Link
            href="/auth/register"
            className="text-[var(--color-brand-orange)] underline-offset-2 hover:underline"
          >
            register again
          </Link>
          .
        </p>
      )}

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
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(false);
            }}
            inputMode="email"
            className="w-full bg-transparent px-0 py-2 text-[var(--color-brand-text-primary)] outline-none placeholder:text-zinc-500"
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

      <p className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        <Link
          href="/auth/login"
          className="text-[var(--color-brand-orange)] transition hover:text-[var(--color-brand-orange-light)] hover:underline"
        >
          Back to log in
        </Link>
        <span className="hidden text-zinc-700 sm:inline" aria-hidden>
          |
        </span>
        <Link
          href="/auth/register"
          className="text-[var(--color-brand-orange)] transition hover:text-[var(--color-brand-orange-light)] hover:underline"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}
