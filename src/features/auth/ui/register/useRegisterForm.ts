'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { sanitizeNextPath, withNextQuery } from '@/features/auth/lib/safe-next-path';

import { useAuth } from '@/context/AuthContext';
import { tStatic } from '@/i18n/t';
import { toast } from '@/lib/toast';
import { RegisterPageFormSchema } from '@/shared/schemas/api';

import {
  errorsRecordToInvalidFlags,
  type InvalidFields,
  type RegisterFieldKey,
} from '../../lib/register-field-errors';

export function useRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const nextPath = sanitizeNextPath(searchParams.get('next'));
  const afterAuthPath = nextPath ?? '/';
  const loginHref = withNextQuery('/auth/login', nextPath);

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

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setInvalidFields({});

    const parsed = RegisterPageFormSchema.safeParse({
      username,
      email,
      password,
      confirm,
    });

    if (!parsed.success) {
      setInvalidFields(errorsRecordToInvalidFlags(parsed.error.flatten().fieldErrors));
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

      toast.success(tStatic('auth.welcomeVerify'));
      router.push(afterAuthPath);
      router.refresh();
    } catch {
      toast.error(tStatic('auth.genericError'));
    } finally {
      setLoading(false);
    }
  }

  return {
    email,
    password,
    username,
    confirm,
    invalidFields,
    loading,
    showPassword,
    showConfirm,
    setShowPassword,
    setShowConfirm,
    setUsername,
    setEmail,
    setPassword,
    setConfirm,
    clearInvalid,
    loginHref,
    handleRegister,
  };
}
