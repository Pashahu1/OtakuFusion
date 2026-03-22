'use client';

import { UnderlineField } from '@/components/auth/underline-field';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const LOGIN_INVALID_MESSAGE = 'Invalid email or password';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  function handleEmailChange(value: string) {
    setEmail(value);
    if (emailError) setEmailError(false);
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (passwordError) setPasswordError(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const missingEmail = !trimmedEmail;
    const missingPassword = !password;

    if (missingEmail || missingPassword) {
      setEmailError(missingEmail);
      setPasswordError(missingPassword);
      return;
    }

    setEmailError(false);
    setPasswordError(false);

    setLoading(true);
    const result = await login(trimmedEmail, password);
    setLoading(false);

    if (!result.ok) {
      setEmailError(true);
      setPasswordError(true);
      toast.error(LOGIN_INVALID_MESSAGE);
      return;
    }

    router.push('/');
    router.refresh();
  };

  if (loading) return <InitialLoader />;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-1 p-4 sm:gap-2 sm:p-8"
      noValidate
    >
      <h2 className="mb-5 text-center font-serif text-xl font-normal tracking-tight text-white sm:text-2xl">
        Log In
      </h2>

      <UnderlineField
        id="login-email"
        label="Email Address"
        hasError={emailError}
      >
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className="w-full bg-transparent px-0 py-2.5 text-[var(--color-brand-text-primary)] outline-none transition-colors placeholder:text-zinc-500"
          placeholder="mail@example.com"
        />
      </UnderlineField>

      <UnderlineField
        id="login-password"
        label="Password"
        hasError={passwordError}
      >
        <div className="flex items-center gap-2">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className="min-w-0 flex-1 bg-transparent px-0 py-2.5 text-[var(--color-brand-text-primary)] outline-none transition-colors placeholder:text-zinc-500"
            placeholder="password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="touch-manipulation shrink-0 rounded-md px-2 py-2 text-xs font-medium tracking-wide text-zinc-400 uppercase transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)]/40 focus-visible:outline-none"
          >
            {showPassword ? 'HIDE' : 'SHOW'}
          </button>
        </div>
      </UnderlineField>

      <button
        type="submit"
        className="mt-5 h-11 rounded-full border border-zinc-500 bg-transparent py-2 text-sm font-semibold tracking-wider text-zinc-300 uppercase transition-colors hover:border-zinc-400 hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] focus-visible:outline-none active:scale-[0.99]"
      >
        Log In
      </button>

      <p className="mt-7 text-center text-xs font-bold tracking-wide text-[var(--color-brand-orange)]">
        <a
          href="/auth/register"
          className="rounded-sm px-1 py-0.5 underline-offset-4 transition-colors hover:underline hover:text-[var(--color-brand-orange-light)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)]/40 focus-visible:outline-none"
        >
          Create account
        </a>
      </p>
    </form>
  );
}
