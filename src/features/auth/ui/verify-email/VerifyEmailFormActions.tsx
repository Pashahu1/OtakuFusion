interface VerifyEmailFormActionsProps {
  isLoading: boolean;
  canResend: boolean;
  onResend: () => void;
}

export function VerifyEmailFormActions({
  isLoading,
  canResend,
  onResend,
}: VerifyEmailFormActionsProps) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-3">
      <button
        type="submit"
        disabled={isLoading}
        className="h-11 flex-1 rounded-lg bg-[var(--color-brand-orange)] py-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-brand-text-primary)] shadow-md shadow-[var(--color-brand-orange-light)]/40 transition hover:bg-[var(--color-brand-orange-light)] disabled:opacity-50"
      >
        {isLoading ? 'Verifying…' : 'Verify'}
      </button>
      <button
        type="button"
        disabled={!canResend}
        onClick={onResend}
        className="h-11 flex-1 rounded-lg border border-zinc-600/90 bg-zinc-900/30 py-2 text-sm font-semibold uppercase tracking-wide text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800/40 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-800 disabled:text-zinc-600 disabled:hover:bg-transparent"
      >
        Send again
      </button>
    </div>
  );
}
