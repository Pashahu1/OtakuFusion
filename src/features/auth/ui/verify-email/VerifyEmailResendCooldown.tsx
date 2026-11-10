import { useTranslation } from 'react-i18next';

interface VerifyEmailResendCooldownProps {
  time: number;
  progress: number;
}

export function VerifyEmailResendCooldown({ time, progress }: VerifyEmailResendCooldownProps) {
  const { t } = useTranslation('common');

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
            {t('auth.resendIn', { time })}
          </>
        ) : (
          <span className="text-[var(--color-brand-orange)]">{t('auth.resendReady')}</span>
        )}
      </p>
    </div>
  );
}
