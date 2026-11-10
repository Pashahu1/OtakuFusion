import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('common');

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-3">
      <button
        type="submit"
        disabled={isLoading}
        className="hero-cta hero-cta--block flex-1"
      >
        {isLoading ? t('auth.verifying') : t('auth.verify')}
      </button>
      <button
        type="button"
        disabled={!canResend}
        onClick={onResend}
        className="hero-cta hero-cta--secondary hero-cta--block flex-1"
      >
        {t('auth.sendAgain')}
      </button>
    </div>
  );
}
