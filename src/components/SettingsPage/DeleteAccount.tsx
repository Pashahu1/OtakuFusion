'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export function DeleteAccount() {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete account');
      }

      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-red-500/20 bg-[#141519] p-5 sm:p-6',
        'shadow-[0_0_0_1px_rgba(239,68,68,0.06),0_12px_40px_-12px_rgba(0,0,0,0.5)]',
        'ring-1 ring-inset ring-white/[0.03]',
      )}
    >
      <h3
        id="delete-account-title"
        className="text-lg font-semibold tracking-tight text-red-400 sm:text-xl"
      >
        Delete Account
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
        This action is{' '}
        <span className="font-semibold text-red-400/95">permanent</span>. Your
        account and all associated data will be removed.
      </p>

      {!confirm ? (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="mt-5 h-11 w-full touch-manipulation rounded-lg border-2 border-red-500/50 bg-transparent px-4 text-sm font-semibold text-red-400 transition-colors hover:border-red-500 hover:bg-red-950/40 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141519]"
        >
          Delete my account
        </button>
      ) : (
        <div
          className="mt-5 flex flex-col gap-4 border-t border-red-500/15 pt-5"
          role="region"
          aria-live="polite"
        >
          <p className="text-[15px] leading-snug text-zinc-200">
            Are you absolutely sure you want to delete your account?
          </p>

          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:flex-row-reverse sm:justify-start sm:gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className={cn(
                'h-11 w-full touch-manipulation rounded-lg border border-transparent px-4 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141519] sm:min-w-[9.5rem] sm:flex-1',
                loading
                  ? 'cursor-wait bg-red-600 opacity-90'
                  : 'bg-red-600 hover:bg-red-700 active:scale-[0.99]',
              )}
            >
              {loading ? 'Deleting...' : 'Yes, delete'}
            </button>
            <button
              type="button"
              onClick={() => setConfirm(false)}
              disabled={loading}
              className="h-11 w-full touch-manipulation rounded-lg border border-zinc-600 bg-transparent px-4 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141519] disabled:opacity-50 sm:min-w-[8.5rem] sm:flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
