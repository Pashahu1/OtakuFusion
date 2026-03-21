'use client';

import { UnderlineField } from '@/components/auth/underline-field';
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

      router.push(
        `/auth/verification/verify-email?email=${encodeURIComponent(parsed.data.email)}`,
      );
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="flex flex-col gap-2 p-8"
      noValidate
    >
      <h2 className="mb-4 text-center font-serif text-2xl font-normal text-white">
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
          className="w-full bg-transparent px-0 py-2 text-[var(--color-brand-text-primary)] outline-none placeholder:text-zinc-500"
          placeholder=""
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
          className="w-full bg-transparent px-0 py-2 text-[var(--color-brand-text-primary)] outline-none placeholder:text-zinc-500"
          placeholder=""
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
            className="min-w-0 flex-1 bg-transparent px-0 py-2 text-[var(--color-brand-text-primary)] outline-none placeholder:text-zinc-500"
            placeholder=""
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="shrink-0 text-xs font-medium uppercase tracking-wide text-zinc-400 transition hover:text-white"
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
            className="min-w-0 flex-1 bg-transparent px-0 py-2 text-[var(--color-brand-text-primary)] outline-none placeholder:text-zinc-500"
            placeholder=""
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="shrink-0 text-xs font-medium uppercase tracking-wide text-zinc-400 transition hover:text-white"
          >
            {showConfirm ? 'HIDE' : 'SHOW'}
          </button>
        </div>
      </UnderlineField>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 h-[44px] rounded-lg bg-[var(--color-brand-orange)] py-3 font-semibold text-[var(--color-brand-text-primary)] shadow-md shadow-[var(--color-brand-orange-light)] transition hover:bg-[var(--color-brand-orange-light)] disabled:opacity-60"
      >
        {loading ? 'Loading...' : 'Register'}
      </button>

      <a
        href="/auth/login"
        className="mt-4 text-center text-sm text-zinc-300 transition hover:text-white"
      >
        Already have an account?
      </a>
    </form>
  );
}
