"use client"
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const success = await login(email, password);

    if (!success) {
      setError('Invalid email or password.');
      return;
    }

    router.push('/profile');
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-white mb-2">Log In</h2>
      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded">
          {error}
        </p>
      )}
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 rounded-lg outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        className="bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 rounded-lg outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
      />

      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange-light)] transition text-[var(--color-brand-text-primary)] py-3 rounded-lg font-medium shadow-md shadow-[var(--color-brand-orange-light)]"
      >
        {isLoading ? 'Loading...' : 'Log In'}
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
