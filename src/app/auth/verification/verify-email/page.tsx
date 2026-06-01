'use client';

import { VerifyEmailForm } from '@/features/auth/ui/VerifyEmailForm';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VerifyEmailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email')?.trim() ?? '';

  return (
    <>
      <VerifyEmailForm
        initialEmail={emailFromUrl}
        lockEmail={Boolean(emailFromUrl)}
        onVerified={() => router.push('/profile/manage')}
      />

      {!emailFromUrl ? (
        <p className="mt-4 text-center text-xs leading-relaxed text-zinc-500">
          No email in the link? Enter it above or{' '}
          <Link
            href="/auth/register"
            className="text-[var(--color-brand-orange)] underline-offset-2 hover:underline"
          >
            register again
          </Link>
          .
        </p>
      ) : null}

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
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
