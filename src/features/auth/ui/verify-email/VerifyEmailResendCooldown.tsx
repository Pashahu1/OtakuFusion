interface VerifyEmailResendCooldownProps {
  time: number;
  progress: number;
}

export function VerifyEmailResendCooldown({ time, progress }: VerifyEmailResendCooldownProps) {
  return (
    <div className="mt-5">
      <div
        className="h-1 overflow-hidden rounded-full bg-zinc-800"
        role="presentation"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-orange)]/20 to-[var(--color-brand-orange)] transition-[width] duration-1000 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500">
        {time > 0 ? (
          <>
            Resend available in{' '}
            <span className="tabular-nums font-medium text-zinc-300">{time}s</span>
          </>
        ) : (
          <span className="text-[var(--color-brand-orange)]">You can resend the code now</span>
        )}
      </p>
    </div>
  );
}
