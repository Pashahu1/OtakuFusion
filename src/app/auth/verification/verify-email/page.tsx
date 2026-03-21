'use client';

import { UnderlineField } from '@/components/auth/underline-field';
import { toast } from '@/lib/toast';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const RESEND_COOLDOWN_SEC = 30;

function digitsOnly(value: string, maxLen: number) {
  return value.replace(/\D/g, '').slice(0, maxLen);
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
          setTimeout(() => router.push('/auth/login'), 1500);
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
      setTimeout(() => router.push('/auth/login'), 1200);
    } catch {
      setCodeError(true);
      toast.error('Something went wrong. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleVerify}
      className="flex w-full flex-col gap-2 p-8"
      noValidate
    >
      <h1 className="mb-1 text-center font-serif text-2xl font-normal text-white">
        Verify your email
      </h1>

      <p className="mb-4 text-center text-sm text-zinc-500">
        We’ll use your email to match the code from the letter.
      </p>

      {!emailFromUrl && (
        <p className="mb-2 text-center text-xs text-zinc-500">
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

      <UnderlineField
        id="verify-code"
        label="6-digit code"
        hasError={codeError}
      >
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
          className="w-full bg-transparent px-0 py-2 text-center font-mono text-2xl tracking-[0.5em] text-[var(--color-brand-text-primary)] outline-none placeholder:text-zinc-600"
          placeholder=""
          aria-label="Six digit verification code"
        />
      </UnderlineField>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="h-11 flex-1 rounded-lg bg-[var(--color-brand-orange)] py-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-brand-text-primary)] shadow-md shadow-[var(--color-brand-orange-light)] transition hover:bg-[var(--color-brand-orange-light)] disabled:opacity-50"
        >
          {isLoading ? 'Verifying…' : 'Verify'}
        </button>
        <button
          type="button"
          disabled={!canResend}
          onClick={handleResend}
          className="h-11 flex-1 rounded-full border border-zinc-600 bg-transparent py-2 text-sm font-semibold uppercase tracking-wide text-zinc-400 transition hover:border-zinc-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send again
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-500">
        {time > 0 ? (
          <>
            Resend available in{' '}
            <span className="tabular-nums text-zinc-300">{time}s</span>
          </>
        ) : (
          <span className="text-[var(--color-brand-orange)]">
            You can resend the code now
          </span>
        )}
      </p>

      <p className="mt-6 text-center text-xs font-bold uppercase tracking-wide text-zinc-400">
        <Link
          href="/auth/login"
          className="text-[var(--color-brand-orange)] hover:underline"
        >
          Back to log in
        </Link>
        <span className="mx-2 font-normal text-zinc-600">|</span>
        <Link
          href="/auth/register"
          className="text-[var(--color-brand-orange)] hover:underline"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}
