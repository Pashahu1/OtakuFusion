'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!username || !email || !password || !confirm) {
      return 'Please fill in all fields.';
    }
    if (username.length < 3) {
      return 'Username must be at least 3 characters.';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can contain only letters, numbers and underscores.';
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return 'Invalid email format.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return 'Password must contain letters and numbers.';
    }
    if (password !== confirm) {
      return 'Passwords do not match.';
    }
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || 'Registration failed.');
      return;
    }
    router.push(`/auth/verification/verify-email?email=${email}`);
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4 p-8">
      <h2 className="text-xl text-center font-semibold text-white mb-2">
        Create Account
      </h2>
      {error && (
        <p className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded">
          {error}
        </p>
      )}
      <div className="border-b-2 border-zinc-700 focus-within:border-[var(--color-brand-orange)] mb-3 py-[5px]">
        <input
          autoComplete="new-password"
          type="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full py-[5px] bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3  outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
        />
      </div>
      <div className="border-b-2 border-zinc-700 focus-within:border-[var(--color-brand-orange)] mb-3 py-[5px]">
        <input
          autoComplete="new-password"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full py-[5px] bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
        />
      </div>

      <div className="border-b-2 border-zinc-700 focus-within:border-[var(--color-brand-orange)] mb-3 py-[5px]">
        <input
          autoComplete="new-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full py-[5px] bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
        />
      </div>

      <div className="border-b-2 border-zinc-700 focus-within:border-[var(--color-brand-orange)] mb-3 py-[5px]">
        <input
          autoComplete="new-password"
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full py-[5px] bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="h-[40px] bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange-light)] transition text-[var(--color-brand-text-primary)] py-3 font-medium shadow-md shadow-[var(--color-brand-orange-light)]"
      >
        {loading ? 'Loading...' : 'Register'}
      </button>

      <a href="/auth/login" className="text-[#6d4aff] text-sm text-center mt-2">
        Already have an account?
      </a>
    </form>
  );
}
