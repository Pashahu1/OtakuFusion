'use client';
import { useState } from 'react';

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    if (!oldPassword || !newPassword || !confirm) {
      return 'Please fill in all fields';
    }
    if (newPassword === oldPassword) {
      return 'New password must be different from the old one';
    }
    if (newPassword !== confirm) {
      return 'New passwords do not match';
    }
    if (newPassword.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return 'Password must contain letters and numbers';
    }
    return null;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.message || 'Something went wrong');
      }

      setSuccess('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirm('');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form
      onSubmit={handleChangePassword}
      className="flex flex-col gap-4 w-full"
    >
      <h2 className="text-xl font-semibold">Change Password</h2>
      {error && <p className="text-red-400">{error}</p>}
      {success && <p className="text-green-400">{success}</p>}
      <div className="border-b-2 border-zinc-700 focus-within:border-[var(--color-brand-orange)] mb-3 py-[5px]">
        <span className="text-sm text-zinc-400">Current password</span>
        <input
          autoComplete="new-password"
          type="password"
          placeholder="Write your current password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 rounded-lg outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
        />
      </div>
      <div className="border-b-2 border-zinc-700 focus-within:border-[var(--color-brand-orange)] mb-3 py-[5px]">
        <span className="text-sm text-zinc-400">New password</span>
        <input
          autoComplete="new-password"
          type="password"
          placeholder="Write your new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 rounded-lg outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
        />
      </div>

      <div className="border-b-2 border-zinc-700 focus-within:border-[var(--color-brand-orange)] mb-3 py-[5px]">
        <span className="text-sm text-zinc-400">Confirm new password</span>
        <input
          autoComplete="new-password"
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full bg-[var(--color-brand-gray-light)] text-[var(--color-brand-text-primary)] px-4 py-3 rounded-lg outline-none border border-transparent focus:border-[var(--color-brand-orange)] placeholder-[var(--color-brand-text-muted)]"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="h-[40px] bg-orange-500 hover:bg-orange-600 transition px-4 py-2 rounded-md text-white"
      >
        {isLoading ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}
