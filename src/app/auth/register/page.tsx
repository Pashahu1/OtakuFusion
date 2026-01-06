'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!email || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username: email.split('@')[0] }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.message || 'Registration failed.');
      return;
    }
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-white mb-2">Create Account</h2>
      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded">
          {error}
        </p>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 rounded-lg outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 rounded-lg outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 rounded-lg outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
      />

      <button
        onClick={handleRegister}
        disabled={loading}
        className="bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange-light)] transition text-[var(--color-brand-text-primary)] py-3 rounded-lg font-medium shadow-md shadow-[var(--color-brand-orange-light)]"
      >
        {loading ? 'Loading...' : 'Register'}
      </button>

      <a href="/auth/login" className="text-[#6d4aff] text-sm text-center mt-2">
        Already have an account?
      </a>
    </div>
  );
}
