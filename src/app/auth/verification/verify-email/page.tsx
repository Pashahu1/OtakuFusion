'use client';
import { Button } from '@/components/Button/Button';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const [email] = useState(emailFromUrl);
  const [code, setCode] = useState('');
  const [time, setTime] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (time === 0) return;
    const timer = setInterval(() => setTime((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [time]);

  const handleResend = async () => {
    if (time !== 0 || !email) return;
    setIsLoading(true);
    setMessage(null);
    setError(null);
    const res = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || 'Error sending code');
    } else {
      setMessage('Verification code resent');
      setTime(30);
    }
    setIsLoading(false);
  };
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError('Enter the verification code');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || 'Invalid or expired code');
    } else {
      setMessage('Email verified successfully');
      setTimeout(() => router.push('/auth/login'), 1200);
    }
    setIsLoading(false);
  };
  return (
    <div className="flex w-full flex-col items-center justify-center gap-10 p-6 md:flex-row lg:max-w-[750px]">
      <form
        onSubmit={handleVerify}
        className="flex w-full max-w-md flex-col gap-5 rounded-xl bg-zinc-900 p-8 shadow-lg"
      >
        <h1 className="text-2xl font-semibold text-white">Verify your email</h1>

        <p className="text-sm text-zinc-400">
          We sent a 6‑digit verification code to:
        </p>

        {email && (
          <p className="font-medium break-all text-orange-400">{email}</p>
        )}

        <div className="border-b-2 border-zinc-700 pb-2 focus-within:border-orange-500">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-transparent px-1 py-3 text-lg tracking-widest text-white outline-none"
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>

          <Button disabled={time !== 0 || isLoading} onClick={handleResend}>
            Send again
          </Button>
        </div>

        <div className="text-sm text-zinc-400">
          {time !== 0 ? (
            <span>Resend available in {time}s</span>
          ) : (
            <span className="text-green-400">You can resend the code</span>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-green-400">{message}</p>}
      </form>
    </div>
  );
}
