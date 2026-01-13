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

  const handleLogin = async () => {
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

  {
    loading && <InitialLoader />;
  }

  return (
    <div className="flex flex-col gap-4 p-8">
      <h2 className="text-xl text-center font-semibold text-white mb-2">
        Log In
      </h2>
      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded">
          {error}
        </p>
      )}
      <div className="border-b-2 border-zinc-700 focus-within:border-[var(--color-brand-orange)] mb-3 py-[5px]">
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3  outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
        />
      </div>

      <div className="border-b-2 border-zinc-700 focus-within:border-[var(--color-brand-orange)] mb-3 py-[5px]">
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full  text-[var(--color-brand-text-primary)] px-4 py-3 outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
        />
      </div>

      <button
        onClick={handleLogin}
        className="h-[40px] bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange-light)] transition text-[var(--color-brand-text-primary)] py-3 rounded-lg font-medium shadow-md shadow-[var(--color-brand-orange-light)]"
      >
        Log In
      </button>

      <a
        href="/auth/register"
        className="text-[#6d4aff] text-sm text-center mt-2"
      >
        Create Account
      </a>
    </div>
  );
}
