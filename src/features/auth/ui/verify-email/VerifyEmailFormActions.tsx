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
        className="hero-cta hero-cta--block flex-1"
      >
        {isLoading ? 'Verifying…' : 'Verify'}
      </button>
      <button
        type="button"
        disabled={!canResend}
        onClick={onResend}
        className="hero-cta hero-cta--secondary hero-cta--block flex-1"
      >
        Send again
      </button>
    </div>
  );
}
