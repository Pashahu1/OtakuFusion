'use client';
import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result) {
      setError('Invalid email or password.');
      return;
    }

    if (result.needVerification) {
      router.push(`/auth/verify?email=${email}`);
      return;
    }
    if (!result.ok) {
      setError(result.message || 'Invalid email or password.');
      return;
    }

    router.push('/');
  };

  if (loading) return <InitialLoader />;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-8">
      <h2 className="mb-2 text-center text-xl font-semibold text-white">
        Log In
      </h2>
      {error && (
        <p className="rounded bg-red-900/20 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="mb-3 border-b-2 border-zinc-700 py-[5px] focus-within:border-[var(--color-brand-orange)]">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-transparent bg-[var(--color-brand-gray-light)] px-4 py-3 text-[var(--color-brand-text-primary)] placeholder-[var(--color-brand-text-muted)] outline-none focus:border-[var(--color-brand-orange)]"
        />
      </div>

      <div className="mb-3 border-b-2 border-zinc-700 py-[5px] focus-within:border-[var(--color-brand-orange)]">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-transparent px-4 py-3 text-[var(--color-brand-text-primary)] placeholder-[var(--color-brand-text-muted)] outline-none focus:border-[var(--color-brand-orange)]"
        />
      </div>

      <button
        type="submit"
        className="h-[40px] bg-[var(--color-brand-orange)] py-3 font-medium text-[var(--color-brand-text-primary)] shadow-[var(--color-brand-orange-light)] shadow-md transition hover:bg-[var(--color-brand-orange-light)]"
      >
        Log In
      </button>

      <a
        href="/auth/register"
        className="mt-2 text-center text-sm text-[#6d4aff]"
      >
        Create Account
      </a>
    </form>
  );
}
