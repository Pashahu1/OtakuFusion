'use client';

import { UnderlineField } from '@/components/auth/underline-field';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RegisterPageFormSchema } from '@/shared/schemas/api';

type RegisterFieldKey = 'username' | 'email' | 'password' | 'confirm';

type InvalidFields = Partial<Record<RegisterFieldKey, true>>;

function errorsRecordToInvalidFlags(
  fieldErrors: Record<string, string[] | undefined>,
): InvalidFields {
  const flags: InvalidFields = {};
  const keys: RegisterFieldKey[] = [
    'username',
    'email',
    'password',
    'confirm',
  ];
  for (const key of keys) {
    if (fieldErrors[key]?.length) flags[key] = true;
  }
  return flags;
}

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirm, setConfirm] = useState('');
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function clearInvalid(key: RegisterFieldKey) {
    setInvalidFields((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvalidFields({});

    const parsed = RegisterPageFormSchema.safeParse({
      username,
      email,
      password,
      confirm,
    });

    if (!parsed.success) {
      setInvalidFields(
        errorsRecordToInvalidFlags(parsed.error.flatten().fieldErrors),
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: parsed.data.email,
          password: parsed.data.password,
          username: parsed.data.username,
        }),
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        let nextFlags: InvalidFields = {};
        if (
          data &&
          typeof data === 'object' &&
          'errors' in data &&
          data.errors != null &&
          typeof data.errors === 'object' &&
          !Array.isArray(data.errors)
        ) {
          nextFlags = errorsRecordToInvalidFlags(
            data.errors as Record<string, string[] | undefined>,
          );
        }
        setInvalidFields(nextFlags);

        const message =
          data &&
          typeof data === 'object' &&
          'message' in data &&
          typeof (data as { message: unknown }).message === 'string'
            ? (data as { message: string }).message
            : 'Registration failed.';

        const hasInline = Object.keys(nextFlags).length > 0;
        if (!hasInline || message !== 'Validation failed.') {
          toast.error(message);
        }
        return;
      }

      if (
        data &&
        typeof data === 'object' &&
        'user' in data &&
        data.user &&
        typeof data.user === 'object' &&
        data.user !== null
      ) {
        setUser(
          data.user as {
            id: string;
            username: string;
            email: string;
            avatar: string;
            role: string;
            isVerified: boolean;
          },
        );
      }

      toast.success('Welcome! Check your inbox for the verification code.');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="flex flex-col gap-1 p-4 sm:gap-2 sm:p-8"
      noValidate
    >
      <h2 className="mb-5 text-center font-serif text-xl font-normal tracking-tight text-white sm:text-2xl">
        Create Account
      </h2>

      <UnderlineField
        id="register-username"
        label="Username"
        hasError={Boolean(invalidFields.username)}
      >
        <input
          id="register-username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            clearInvalid('username');
          }}
          aria-invalid={Boolean(invalidFields.username)}
          className="w-full bg-transparent px-0 py-2.5 text-[var(--color-brand-text-primary)] outline-none transition-colors placeholder:text-zinc-500"
          placeholder="username"
        />
      </UnderlineField>

      <UnderlineField
        id="register-email"
        label="Email"
        hasError={Boolean(invalidFields.email)}
      >
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearInvalid('email');
          }}
          aria-invalid={Boolean(invalidFields.email)}
          className="w-full bg-transparent px-0 py-2.5 text-[var(--color-brand-text-primary)] outline-none transition-colors placeholder:text-zinc-500"
          placeholder="mail@example.com"
        />
      </UnderlineField>

      <UnderlineField
        id="register-password"
        label="Password"
        hasError={Boolean(invalidFields.password)}
      >
        <div className="flex items-center gap-2">
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearInvalid('password');
              clearInvalid('confirm');
            }}
            aria-invalid={Boolean(invalidFields.password)}
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

      <UnderlineField
        id="register-confirm"
        label="Confirm Password"
        hasError={Boolean(invalidFields.confirm)}
      >
        <div className="flex items-center gap-2">
          <input
            id="register-confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              clearInvalid('confirm');
            }}
            aria-invalid={Boolean(invalidFields.confirm)}
            className="min-w-0 flex-1 bg-transparent px-0 py-2.5 text-[var(--color-brand-text-primary)] outline-none transition-colors placeholder:text-zinc-500"
            placeholder="confirm password"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="touch-manipulation shrink-0 rounded-md px-2 py-2 text-xs font-medium tracking-wide text-zinc-400 uppercase transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)]/40 focus-visible:outline-none"
          >
            {showConfirm ? 'HIDE' : 'SHOW'}
          </button>
        </div>
      </UnderlineField>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 h-11 rounded-lg bg-[var(--color-brand-orange)] py-3 font-semibold text-[var(--color-brand-text-primary)] shadow-md shadow-[var(--color-brand-orange-light)]/35 transition-colors hover:bg-[var(--color-brand-orange-light)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] focus-visible:outline-none disabled:opacity-60 active:enabled:scale-[0.99]"
      >
        {loading ? 'Loading...' : 'Register'}
      </button>

      <a
        href="/auth/login"
        className="mt-5 text-center text-sm text-zinc-300 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)]/40 focus-visible:outline-none"
      >
        Already have an account?
      </a>
    </form>
  );
}
